---
id: "NNN"
judul: ""
status: draft            # draft | blocked | approved | in-progress | ready-for-qa | qa-failed | done
depends_on: []           # mis. ["001"]
aplikasi: []             # app | api | admin | services | tools | db
dibuat: YYYY-MM-DD
diperbarui: YYYY-MM-DD
qa_ronde: 0
---

# NNN — Judul

## 1. Tujuan
Apa yang didapat user setelah plan ini selesai, dalam 2–4 kalimat. Siapa penggunanya (role).

## 2. Kondisi sekarang & referensi
- Yang sudah ada: …
- Yang kurang: …
- Brief: `0X §…`
- File: `path/file.php:123`

## 3. Scope
**Masuk:**
- …

**Tidak masuk:**
- …

## 4. Desain
Alur, endpoint (method + path + bentuk request/respons), perubahan DB (migrasi), perubahan UI (halaman, adapter),
permission yang dipakai.

## 5. Tugas developer
- [ ] T1 — … (`file`) @senior
- [ ] T2 — … (`file`) @junior
- [ ] T3 — … (`file`) @devops

<!-- Penanda pelaksana (opsional): @senior @junior @devops @<key-peran>. Tanpa penanda = agent developer
     utama project. Hanya pakai penanda untuk peran yang ada di tim project ini. -->

## 6. Kriteria penerimaan
| ID | Diberikan / Ketika / Maka | Role | Cara uji |
|---|---|---|---|
| AC1 | Diberikan …, ketika …, maka … | owner | `<perintah uji API, mis. curl …>` → HTTP 200, `data.…` = … |
| AC2 | (negatif) … | analyst | `<perintah uji sebagai role terbatas>` → HTTP 403 |
| AC3 | (UI) … | owner | `node tools/qa/shot.mjs <URL-app>/… planning/qa/evidence/NNN/ac3.png --login='<email>:<password>'` → tampil …, 0 masalah |

## 7. Risiko & aturan yang mudah dilanggar
- …

## 8. Pertanyaan terbuka
- [BLOKIR] … (tidak bisa dikerjakan benar tanpa jawaban user)
- [ASUMSI] … (diasumsikan …; ubah bila salah)

## 9. Catatan developer
_(diisi developer: file yang diubah, migrasi, data uji, penyimpangan dari plan, catatan untuk QA)_

## 10. Riwayat QA
| Ronde | Tanggal | Verdict | Laporan |
|---|---|---|---|

## 11. Riwayat revisi
| Tanggal | Oleh | Perubahan |
|---|---|---|
