# Extraction notes — pilot T5 + T1

Date: 2026-09-24  
Worktree branch: `wt/content-tools`  
Method: `pypdf` text extract from `sources/` (PDFs left untouched).

## T5 — Numerické a logické úlohy (M3)

| PDF | Role |
|---|---|
| `sources/3/VSJP8_Mudre-predplatne_5_Numericke-a-logicke-ulohy-mzrvef.pdf` | Theory + worked samples |
| `sources/3/VSJP8_Mudre-predplatne_5_Ulohy-s6hvtz.pdf` | Exercise set |
| `sources/lll/rep-f3/VSJP8_Mudre-predplatne_5_Riesenia-00ceqg.pdf` | Solutions |

Shapes locked: numeric word-problem MCQ, LCM gears, percent composition. Solvers sketched in `tools/verify-answer-keys`.

## T1 — Dopĺňanie slov / zoraďovanie viet (M1)

| PDF | Role |
|---|---|
| `sources/1/VSJP8_Mudre-predplatne_1_Doplnanie-chybajucich-slov-zoradovanie-viet-axipyn.pdf` | Theory + samples |
| `sources/1/VSJP8_Mudre-predplatne_1_Ulohy-zhbksb.pdf` | Exercise set |
| `sources/lll/rep-f1/…` / `*_1_Riesenia-eqakog.pdf` | Solutions |

Shapes locked: cloze word-pair MCQ; sentence-order MCQ. `deriveCorrectKey` is attested-only (no invented Slovak grammar rules).

## Out of scope this pilot

- Full 12-topic extract
- Candidate CSV generation / `published=true`
- Critic / human sample gate
