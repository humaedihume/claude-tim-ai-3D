# Tim AI: rancang → kerjakan → review → simpan

Subagent Claude Code (`.claude/agents/`) mengerjakan project ini lewat plan tertulis di folder ini.
Peran tiap tahap ada di `.claude/tim-ai.json` (`plan`, `execute`, `review`).

```
 kamu ──/rancang──► PERANCANG ──► plans/NNN-*.md (draft)        pertanyaan keputusan → ROADMAP §5 / plan §8
 kamu ──/kerjakan─► PELAKSANA ──► hasil kerja + "Catatan pelaksana" (ready-for-qa)
 kamu ──/uji──────► PENINJAU ───► qa/NNN-qa-rK.md ── PASS ──► done → satu commit (push hanya bila diizinkan)
                                  └─ FAIL ──► qa-failed ──► PELAKSANA (fix) ──► PENINJAU … (maks 5 ronde)
 /jalankan = semua langkah otomatis · /papan = status
```

| Path | Isi |
|---|---|
| `ROADMAP.md` | Modul, fase, pertanyaan keputusan user (format dibaca kantor 3D /kerja) |
| `BACKLOG.md` | Satu baris per plan + status |
| `DITUNDA.md` | Bagian yang dilewati karena bahan belum lengkap/membingungkan |
| `plans/NNN-slug.md` | Plan (dari `templates/plan.md`) |
| `qa/NNN-qa-rK.md` | Laporan review ronde K (`Verdict: PASS/FAIL`); `qa/evidence/NNN/` bukti gambar |

Status plan: `draft` → `approved` → `in-progress` → `ready-for-qa` → `done`, atau `qa-failed` / `blocked`.
Frontmatter plan = sumber kebenaran; `BACKLOG.md` = ringkasannya.

## Aturan tim
- Bahan kurang/membingungkan → tandai `[DITUNDA]` + satu baris di `DITUNDA.md`, lanjutkan sisanya (jangan memblokir).
  `[BLOKIR]` hanya untuk keputusan user yang benar-benar tak bisa dilewati; `[ASUMSI]` untuk asumsi aman.
- Standar review **nol bug**: temuan sekecil apa pun = FAIL; maks 5 ronde, lalu berhenti dan tanya user.
- Satu commit per plan yang PASS; push hanya bila user mengizinkan (`push` di `.claude/tim-ai.json`).
- Rahasia tidak pernah ditulis ke plan/laporan/commit.
- Agent kustom baru terbaca di sesi Claude Code berikutnya; sampai itu orkestrator memakai `general-purpose` dengan
  deskripsi berawalan nama peran (`Analyst: …`) yang membaca `.claude/agents/<key>.md`.
- Agent dihentikan dengan TaskStop → id-nya ditambahkan ke `kerja/storage/stopped.txt`.

## Model & effort per peran
Diatur di frontmatter `.claude/agents/<peran>.md`: `model: opus | sonnet | haiku` dan `effort: low | medium | high`.
Ubah langsung di file itu (berlaku di sesi berikutnya). Contoh: QA lebih teliti → `effort: medium`.
