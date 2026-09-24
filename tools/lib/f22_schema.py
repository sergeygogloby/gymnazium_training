"""F22 question CSV schema helpers (locked all-or-nothing validation)."""

from __future__ import annotations

import csv
import io
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

REQUIRED_COLUMNS = (
    "stem",
    "correctKey",
    "rationale",
    "module",
    "topic",
    "skillArea",
    "sourceType",
)

OPTIONAL_COLUMNS = ("id", "choices", "locale", "published")

MODULES = frozenset({f"M{i}" for i in range(1, 7)})
TOPICS = frozenset({f"T{i}" for i in range(1, 13)})
SKILL_AREAS = frozenset({"VSP", "VJS"})
SOURCE_TYPES = frozenset({"bank", "synthetic"})
CHOICE_KEYS = frozenset({"A", "B", "C", "D"})

# Normalize common aliases seen in materials / drafts
SKILL_ALIASES = {
    "VŠP": "VSP",
    "VSP": "VSP",
    "VJS": "VJS",
}


@dataclass
class RowError:
    row_number: int  # 1-based data row (header is row 0 conceptually)
    row_id: str
    field: str
    reason: str

    def format(self) -> str:
        return f"row {self.row_number} ({self.row_id}): [{self.field}] {self.reason}"


@dataclass
class LintResult:
    ok: bool
    rows: list[dict[str, str]] = field(default_factory=list)
    errors: list[RowError] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    @property
    def exit_code(self) -> int:
        """All-or-nothing: any error → non-zero."""
        return 0 if self.ok else 1


def _normalize_header(name: str) -> str:
    return name.strip()


def _row_id(row: dict[str, str], row_number: int) -> str:
    rid = (row.get("id") or "").strip()
    return rid if rid else f"<row-{row_number}>"


def parse_choices(raw: str | None) -> list[str] | None:
    """Parse choices column: A|B|C|D pipe list or JSON array. Empty → None."""
    if raw is None:
        return None
    text = raw.strip()
    if not text:
        return None
    if text.startswith("["):
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise ValueError(f"choices JSON invalid: {exc}") from exc
        if not isinstance(data, list) or not all(isinstance(x, str) for x in data):
            raise ValueError("choices JSON must be an array of strings")
        return [x.strip() for x in data]
    parts = [p.strip() for p in text.split("|")]
    if len(parts) < 2:
        raise ValueError("choices pipe list needs at least 2 options")
    return parts


def is_mcq_row(row: dict[str, str]) -> bool:
    choices = (row.get("choices") or "").strip()
    return bool(choices)


def validate_row(row: dict[str, str], row_number: int) -> list[RowError]:
    errors: list[RowError] = []
    rid = _row_id(row, row_number)

    def err(field: str, reason: str) -> None:
        errors.append(RowError(row_number, rid, field, reason))

    for col in REQUIRED_COLUMNS:
        val = (row.get(col) or "").strip()
        if not val:
            err(col, "required field is empty")

    module = (row.get("module") or "").strip()
    if module and module not in MODULES:
        err("module", f"must be one of {sorted(MODULES)}, got {module!r}")

    topic = (row.get("topic") or "").strip().upper()
    if topic and topic not in TOPICS:
        err("topic", f"must be one of T1–T12, got {row.get('topic')!r}")

    skill_raw = (row.get("skillArea") or "").strip()
    skill = SKILL_ALIASES.get(skill_raw, skill_raw)
    if skill_raw and skill not in SKILL_AREAS:
        err("skillArea", f"must be VSP or VJS (VŠP→VSP ok), got {skill_raw!r}")

    source = (row.get("sourceType") or "").strip()
    if source and source not in SOURCE_TYPES:
        err("sourceType", f"must be bank|synthetic, got {source!r}")

    published = (row.get("published") or "").strip()
    if published and published.lower() not in {"true", "false", "1", "0", "yes", "no"}:
        err("published", f"must be boolean-like, got {published!r}")

    correct = (row.get("correctKey") or "").strip()
    choices_raw = row.get("choices")
    try:
        choices = parse_choices(choices_raw)
    except ValueError as exc:
        err("choices", str(exc))
        choices = None

    if choices is not None:
        if len(choices) < 2 or len(choices) > 6:
            err("choices", f"expected 2–6 options, got {len(choices)}")
        # Standard A–D bank: correctKey is a letter
        if correct and correct.upper() not in CHOICE_KEYS and not correct.isdigit():
            # Allow letter matching choice count
            if len(correct) == 1 and correct.upper() in "ABCDEF":
                idx = ord(correct.upper()) - ord("A")
                if idx >= len(choices):
                    err("correctKey", f"{correct!r} out of range for {len(choices)} choices")
            else:
                err(
                    "correctKey",
                    "MCQ correctKey should be a choice letter (A–D) or 0-based index",
                )
        elif correct and correct.upper() in CHOICE_KEYS:
            idx = ord(correct.upper()) - ord("A")
            if idx >= len(choices):
                err("correctKey", f"{correct!r} out of range for {len(choices)} choices")
        elif correct and correct.isdigit():
            if int(correct) >= len(choices):
                err("correctKey", f"index {correct} out of range for {len(choices)} choices")
    else:
        # Free-answer: correctKey still required (already checked); no letter constraint
        pass

    return errors


def lint_csv_text(text: str) -> LintResult:
    if not text.strip():
        return LintResult(
            ok=False,
            errors=[RowError(0, "<file>", "file", "CSV is empty")],
        )

    reader = csv.DictReader(io.StringIO(text))
    if reader.fieldnames is None:
        return LintResult(
            ok=False,
            errors=[RowError(0, "<file>", "header", "missing header row")],
        )

    headers = [_normalize_header(h) for h in reader.fieldnames if h is not None]
    # Rewrite fieldnames for consistent access
    reader.fieldnames = headers

    missing = [c for c in REQUIRED_COLUMNS if c not in headers]
    errors: list[RowError] = []
    if missing:
        errors.append(
            RowError(
                0,
                "<header>",
                "header",
                f"missing required column(s): {', '.join(missing)}",
            )
        )
        return LintResult(ok=False, errors=errors)

    rows: list[dict[str, str]] = []
    for i, raw in enumerate(reader, start=1):
        row = {k: (v if v is not None else "") for k, v in raw.items() if k is not None}
        # Skip fully blank lines
        if not any(str(v).strip() for v in row.values()):
            continue
        rows.append(row)
        errors.extend(validate_row(row, i))

    if not rows and not errors:
        errors.append(RowError(0, "<file>", "file", "no data rows"))

    return LintResult(ok=len(errors) == 0, rows=rows, errors=errors)


def lint_csv_path(path: Path | str) -> LintResult:
    p = Path(path)
    if not p.is_file():
        return LintResult(
            ok=False,
            errors=[RowError(0, "<file>", "file", f"not found: {p}")],
        )
    return lint_csv_text(p.read_text(encoding="utf-8-sig"))


def result_as_dict(result: LintResult) -> dict[str, Any]:
    return {
        "ok": result.ok,
        "rowCount": len(result.rows),
        "errorCount": len(result.errors),
        "errors": [
            {
                "row": e.row_number,
                "id": e.row_id,
                "field": e.field,
                "reason": e.reason,
            }
            for e in result.errors
        ],
        "allOrNothing": True,
        "wouldWrite": 0 if not result.ok else len(result.rows),
    }
