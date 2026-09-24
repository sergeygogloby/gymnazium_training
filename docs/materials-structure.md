# Gymnázium training materials — structure & exam fit

**Repo:** [sergeygogloby/gymnazium_training](https://github.com/sergeygogloby/gymnazium_training) (`/workspace`)  
**Source path:** `sources/` (Cielene PDFs: VSJP8 / SJ8 / M8 / AJ8)  
**Analysis date:** 2026-09-24

---

## Verdict (short)

| Target exam | Fit |
|---|---|
| **5-ročné bilingválne gymnázium** (after **8. or 9. ročník**) — VŠP + VJS | **Strong fit** — corpus is built for this |
| **4-ročné gymnázium** after **9. ročník** — SJL + matematika (ŠVP ISCED 2) | **Weak fit** — only 1 SJL + 1 MAT practice pair |
| **8-ročné gymnázium** after **5. ročník** — SJL + matematika | **Not the target** of this corpus |

These materials are for **Slovakia gymnázium entrance after 8th/9th grade**, but specifically the **bilingual (5-year) aptitude track**, not the default **4-year SJL+math** track.

---

## 1. Inventory

### Totals

| Metric | Count |
|---|---|
| PDF files on disk | **114** |
| Unique documents (basename, de-duplicated) | **97** |
| Format | PDF only |
| Language | Slovak (AJ8 tests include English reading) |
| Publisher / brand | **Cielene** (Vzdelávacie centrum) |

Folder layout is a **6-month study pack** (`sources/1`–`6`) plus solution dumps (`sources/lll/rep-f*`) and a few root leftovers. Several files are duplicated across folders.

### By product line (unique documents)

| Line | What it is | Unique docs | Notes |
|---|---|---|---|
| **VSJP8** | Všeobecné študijné predpoklady (VŠP) + všeobecné jazykové schopnosti (VJS) | ~91 | Core of the repo; labeled *Príprava na bilingválne gymnázium* |
| **SJ8** | Slovenský jazyk a literatúra | 2 | 1 test + 1 riešenie (`SJ8_Test_Cielene_D.1`) |
| **M8** | Matematika | 2 | 1 test + 1 riešenie (`M8_Test_Cielene_D.1`) |
| **AJ8** | Anglický jazyk | 2 | 1 test + 1 riešenie (`AJ8_Test_Cielene_D.1`) |

### By material type (VSJP8 unique set)

| Type | Count | Example |
|---|---|---|
| Master plan | 1 | `VSJP8_Mudre-predplatne_Plan-pripravy` |
| Monthly study plans (Okt–Mar) | 6 | `…_1_Oktober`, `…_6_Marec` |
| Topic theory sheets (12 topics) | 12 | `…_5_Numericke-a-logicke-ulohy` |
| Exercise sets (`Ulohy`) | 12 | paired with topics |
| Exercise solutions (`Riesenia`) | 12 | |
| Author practice tests (Cielene) | 12 | `VSJP8_Test_Cielene_B.1` … `D.2A`, `Test-Cielene_1/2` |
| Author test solutions | 12 | |
| Real school / EXAM past papers | 12 | Pankúchova, GMK BB, Evanjelické Martin, EXAM X4–X9 |
| Real-paper solutions | 12 | |

### 12 VSJP8 skill topics (from plan PDF)

1. Dopĺňanie chýbajúcich slov, zoraďovanie viet  
2. Dvojice slov, čo logicky nepatrí medzi ostatné  
3. Verbalizácia, matematický zápis, postupnosti  
4. Cudzie predpony/prípony, poprehadzované písmená  
5. Numerické a logické úlohy  
6. Čítanie z grafov, tabuliek, práca s údajmi  
7. Synonymá, antonymá, frazeologizmy  
8. Práca s podmienkami  
9. Zoskupovanie slov, čítanie s porozuměním  
10. Latinčina, citáty, rytmus slov  
11. Práca s cudzojazyčným textom  
12. Šifrovanie slov, trojica samohlások  

### Real exams present (sample)

- Gymnázium Pankúchova (Bratislava) — ukážka časť B  
- GMK Banská Bystrica — čínske / španielske bilingválne (2016–2019)  
- Evanjelické gymnázium Martin — DOD 2021  
- EXAM testing papers (X4, X5, X6, X7, X9)

---

## 2. Proposed structure — 6 modules

Map the existing 6 monthly folders + 12 topics into six training modules. Each module mixes **VŠP** (reasoning / quantitative / data) and **VJS** (verbal / language aptitude).

| Module | Month folder | Topics | Practice tests | Real exams |
|---|---|---|---|---|
| **M1 — Verbal basics** | `sources/1` (Október) | T1 Doplňanie slov / zoraďovanie viet; T2 Logické dvojice slov | Cielene 1, 2 | EXAM X5; Pankúchova B1 |
| **M2 — Sequences & word form** | `sources/2` (November / Január pack) | T3 Verbalizácia / postupnosti; T4 Predpony, prípony, anagramy | Cielene B.1, B.2 | EXAM X4; GMK BB 2019 čínske |
| **M3 — Quantitative & data** | `sources/3` (December pack) | T5 Numerické/logické; T6 Grafy, tabuľky, údaje | Cielene B.3, B.4 | EXAM X6; Evanjelické Martin 2021 |
| **M4 — Lexicon & conditions** | `sources/4` (Január pack) | T7 Synonymá/antonymá/frazémy; T8 Práca s podmienkami | Cielene C.1, C.2 | EXAM X7; GMK BB 2016 španielske |
| **M5 — Reading & Latin cues** | `sources/5` (Február pack) | T9 Zoskupovanie / porozumenie; T10 Latinčina, citáty, rytmus | Cielene C.3, C.4 | EXAM X9; Pankúchova B2 |
| **M6 — Foreign text & coding + subject probes** | `sources/6` (Marec) | T11 Cudzojazyčný text; T12 Šifrovanie / samohlásky | Cielene D.1A, D.2A | GMK BB 2017 čínske; 2018 španielske |
| | | **Plus thin subject probes:** SJ8.D.1, M8.D.1, AJ8.D.1 | | |

### Suggested subject split (for a product curriculum)

| Subject / skill area | Role in bilingual exams | Coverage in repo |
|---|---|---|
| **VŠP — verbal / analytical** | Core on most bilingual schools | Strong (topics 1–4, 7–9) |
| **VŠP — quantitative / data** | Core | Strong (topics 3, 5, 6) |
| **VJS — language aptitude** | Core (unknown language, Latin, rhythm, foreign text) | Strong (topics 4, 10–12) |
| **SJL (school curriculum)** | Required on some bilingual schools; **always** on 4-year | Weak (1 test) |
| **Matematika (ŠVP)** | Required on some bilingual schools; **always** on 4-year | Weak (1 test) |
| **Angličtina** | Required on some bilingual schools | Weak (1 test) |

---

## 3. Specificity — Slovakia gymnázium entrance after 8./9. ročník

### What the PDFs themselves say

Extracted headers from the corpus:

- *„Na bilingválne gymnázium — VŠP & VJS“* (`Plan-pripravy`)
- *„Príprava na bilingválne gymnázium z VŠP & VJS“* (monthly plans, topic sheets, Cielene tests)
- Real papers titled *„Prijímacia skúška … bilingválne štúdium“* / *„päťročné štúdium“* (e.g. GMK Banská Bystrica)

Cielene product page for this pack: *„žiakov 8. alebo 9. ročníka … na prijímacie pohovory na bilingválne gymnázium“*  
→ [cielene.shop — Múdre predplatné VŠJP8 KOMPLET](https://www.cielene.shop/produkt/mudre-predplatne-z-vseob-stud-predpokladov-a-jazyk-schopnosti-vsjp8-komplet/)

SJ8 / M8 / AJ8 lines on Cielene are likewise tagged for **8. a 9. ročník** bilingual prep (not 5th-grade 8-year gymnasium).

### Three Slovak gymnázium entry paths (context)

| Path | Who applies | Typical written exam |
|---|---|---|
| **4-ročné** | **9. ročník** only | **SJL + matematika** (ŠVP ZŠ / ISCED 2) |
| **5-ročné bilingválne** | **8. alebo 9. ročník** | Often **VŠP + VJS** (talentová skúška); some schools add SJL / MAT / AJ / NJ |
| **8-ročné** | **5. ročník** | SJL + matematika |

---

## 4. Online check — fit for exams after 9. ročník (and 8. ročník)

### 4a. Standard 4-year gymnasium after 9. ročník — **poor primary fit**

Schools consistently require **written SJL + mathematics** aligned to state curriculum standards for basic school, often citing Monitor/Testovanie 9 as a scoring/exemption factor.

Examples:

- [Gymnázium P. O. Hviezdoslava Dolný Kubín — kritériá 4r 2026/27](https://cloud-c.edupage.org/cloud/kriteria_stvorrocne_2026-2027_aktualizovane_20.11_T9.pdf?z%3APyZdpJ%2B0oPeVptXVlOxYHGQOssOvzR8fb%2BNwbam4k97n02lu6RrNGO%2BLAhAJ%2F3JP196NU4Ld0CusyETNPN34mQ%3D%3D=): žiaci 9. ročníka; *„písomnou formou … zo slovenského jazyka a literatúry a z matematiky“*; obsah podľa vzdelávacích štandardov ISCED 244.
- [Piaristické gymnázium Nitra — kritériá 4r](http://piarko.sk/wp-content/uploads/2025/11/Kriteria-stvorrocne.pdf): SJL + MAT tests; T9 90%+ can waive exam.
- [Gymnázium Párovská Nitra — možnosti štúdia](https://www.gymparnr.edu.sk/index.php/pre-zaujemcov/moznosti-studia): 9. ročník; SJL 60 min / MAT 60 min.

**Implication:** A 9th-grader aiming at a **ordinary 4-year gymnázium** needs curriculum SJL+MAT practice. This repo’s VSJP8 pack does **not** substitute for that; only the single SJ8/M8 probes touch it lightly.

### 4b. Bilingual 5-year gymnasium after 8. or 9. ročník — **strong fit**

Many bilingual programs use aptitude tests matching this corpus:

- [Gymnázium bilingválne Bratislava (gymbilba) — PS 2026/27](https://gymbilba.edupage.org/a/prijimacie-skusky-1):  
  - 5-ročné bilingválne: *žiak 8. alebo 9. ročníka* — *„test všeobecných študijných predpokladov a test z jazykových predpokladov“*  
  - Sample VŠP: verbal, analytical, quantitative, work with data  
  - Sample VJS: sensitivity to foreign languages, unknown-language analysis, auditory aptitude, vocabulary  
  - Contrast: 4-ročné = SJL+MAT only (9. ročník)
- [Gymnázium Ľ. Štúra Trenčín — info pre uchádzačov 5r 2026/27](https://www.gymnaziumtrencin.sk/buxus/docs/dokumenty/Prijimacie_pohovory/Rok_2026_27/Informacie_pre_uchadzacov_5_rocne_studium.pdf): one 40-item / 60-min test of VŠP + language-study ability (MC A–D).
- [Gymnázium Ľ. Štúra BA — ukážkové testy 5r](https://gymlsba.edupage.org/a/5-rocne-bilingvalne-studium?eqa=dGV4dD10ZXh0L3RleHQzOSZzdWJwYWdlPTEmc2tnZHllYXI9MjAyNA%3D%3D): published VŠP + VJS sample sections.

Legal frame: school directors set content under **zákon č. 245/2008 Z. z. (školský zákon)** § 62+; bilingual/talent tracks often use March dates for special-ability verification ([summary of admission rules](https://zszk.edupage.org/text/?eqa=dGV4dD10ZXh0L3RleHQ0JnN1YnBhZ2U9MiZza2dkeWVhcj0yMDI1)).

**8. ročník note:** Bilingual entry is **explicitly open to 8th graders** (and 9th). This corpus is therefore correctly aimed at both years for the bilingual path.

### 4c. Caveat — bilingual schools vary

Some bilingual schools still examine **SJL + MAT (+ foreign language)** rather than pure VŠP/VJS, e.g.:

- [Súkromné gymnázium Česká BA](https://gymnaziumceska.sk/documents/kriteria_bilingvalne_26-27%20nove.pdf): SJL + VŠP, AJ, MAT  
- [Gympaba](https://www.gympaba.sk/prijimanie-5-rocne-bilingvalne-gymnazium/): SJL + VŠP (AJ, MAT)  
- [Poprad bilingválne NJ](https://cloud-7.edupage.org/cloud/Kriteria_BS_2026_2027.pdf?z%3A0AuMccpW6zn7nGT%2F7ydo4lxM9GrMU6Bj8%2FEi5I8tOQGstsuh%2FU3QgM8JQZj75%2F%2ByaFK7CU6eoJwTL0fBdkCmUg%3D%3D=): SJL + MAT + nemecký jazyk  

For those targets, the VSJP8 core helps only the aptitude part; SJL/MAT/AJ depth in this repo is insufficient.

---

## 5. Gaps and recommendations

### Gaps

1. **Almost no SJL curriculum prep** for 4-year (or SJL-heavy bilingual) exams — one SJ8 test.  
2. **Almost no mathematics ŠVP prep** — one M8 test; VSJP8 quantitative items are aptitude-style, not full ZŠ algebra/geometry.  
3. **Almost no English/German school-exam prep** — one AJ8 test; no NJ.  
4. **Duplicates / messy tree** — `lll/`, `New folder`, root copies of folder `5` content; credentials PDF listed in `.gitignore` (good).  
5. **No structured index** in-repo (README, syllabus map, answer-key index).  
6. **School-specific variance** not documented — learner may prepare VŠP/VJS and meet a school that only tests SJL+MAT.

### Recommendations

1. **Position the product clearly:** “Príprava na **bilingválne** gymnázium (VŠP + VJS) pre 8./9. ročník” — not generic “prijímačky na gymnázium.”  
2. **Keep the 6-module map above** as the default learning path; collapse duplicate files into one canonical tree (`modules/m1`…`m6` + `solutions/`).  
3. **If 4-year after 9. ročník is in scope:** add dedicated SJL + MAT tracks (ŠVP 5.–9. ročník / T9-aligned), separate from VSJP8.  
4. **If targeting mixed bilingual schools:** expand SJ8 / M8 / AJ8 (and optional NJ) to full monthly packs, not single D.1 probes.  
5. **Add a school checklist** (VŠP/VJS vs SJL+MAT vs hybrid) so families verify the target school’s published kritériá before choosing modules.  
6. **Do not market this pack for 8-ročné gymnázium** (5th grade) — wrong age and wrong skill mix.

---

## 6. Sources cited

| Source | Use |
|---|---|
| [Cielene VŠJP8 KOMPLET](https://www.cielene.shop/produkt/mudre-predplatne-z-vseob-stud-predpokladov-a-jazyk-schopnosti-vsjp8-komplet/) | Product intent: 8./9. ročník → bilingválne VŠP+VJS |
| [Cielene SJ8 test](https://www.cielene.shop/produkt/test-zo-slovenciny-sj8-b-1/) | SJ8 = bilingual SJL for 8./9. ročník |
| [gymbilba prijímacie skúšky 2026/27](https://gymbilba.edupage.org/a/prijimacie-skusky-1) | Official school contrast: 4r SJL+MAT vs 5r VŠP+VJS vs 8r SJL+MAT |
| [Gymnázium Trenčín — 5r info PDF](https://www.gymnaziumtrencin.sk/buxus/docs/dokumenty/Prijimacie_pohovory/Rok_2026_27/Informacie_pre_uchadzacov_5_rocne_studium.pdf) | VŠP+language aptitude format |
| [Gymnázium Dolný Kubín — 4r kritériá](https://cloud-c.edupage.org/cloud/kriteria_stvorrocne_2026-2027_aktualizovane_20.11_T9.pdf?z%3APyZdpJ%2B0oPeVptXVlOxYHGQOssOvzR8fb%2BNwbam4k97n02lu6RrNGO%2BLAhAJ%2F3JP196NU4Ld0CusyETNPN34mQ%3D%3D=) | 9. ročník SJL+MAT / ISCED standards |
| [Piaristické gymnázium Nitra — 4r](http://piarko.sk/wp-content/uploads/2025/11/Kriteria-stvorrocne.pdf) | SJL+MAT + T9 |
| [Gymnázium Párovská](https://www.gymparnr.edu.sk/index.php/pre-zaujemcov/moznosti-studia) | 9. ročník SJL+MAT timing/scoring |
| [Školský zákon 245/2008 — overview](https://zszk.edupage.org/text/?eqa=dGV4dD10ZXh0L3RleHQ0JnN1YnBhZ2U9MiZza2dkeWVhcj0yMDI1) | Director sets exam content; talent-exam window |
| In-repo PDF headers | Explicit “bilingválne gymnázium / VŠP & VJS” labeling |

---

## Blockers

None for analysis. Repo present and populated; no code changes required.
