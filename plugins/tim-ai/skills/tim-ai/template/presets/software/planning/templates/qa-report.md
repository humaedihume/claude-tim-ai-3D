# QA NNN — ronde K

**Verdict: PASS | FAIL**
Plan: `planning/plans/NNN-slug.md` · Tanggal: YYYY-MM-DD

## Regresi
| Pemeriksaan | Hasil |
|---|---|
| Lint file yang diubah (n file) — `<perintah lint>` | PASS |
| `<perintah uji/regresi project>` | n/n PASS |
| Error baru di log `<path log>` | tidak ada |

## Kriteria penerimaan
| AC | Hasil | Bukti |
|---|---|---|
| AC1 | PASS | `<perintah uji>` → `HTTP 200`, … |
| AC2 | FAIL | … → lihat B1 |

## Bug
### B1 — [kritis | mayor | minor] Judul singkat
- Langkah: 1. … 2. …
- Ekspektasi: …
- Aktual: …
- Bukti: `planning/qa/evidence/NNN/…png` / potongan output
- Dugaan lokasi: `path/file:123`

## AC-KELIRU (untuk Analyst)
- _(kosongkan bila tidak ada)_

## Uji eksplorasi & catatan non-blocking
- …

## Data uji
- Dibuat: … · Dibersihkan: ya/tidak (alasan)
