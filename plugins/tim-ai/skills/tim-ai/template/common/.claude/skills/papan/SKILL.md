---
name: papan
description: Tim AI — tampilkan papan status plan (BACKLOG) dan langkah berikutnya yang disarankan per plan.
---

1. Baca `planning/BACKLOG.md` dan frontmatter setiap `planning/plans/*.md` (status di frontmatter plan = sumber kebenaran;
   bila BACKLOG berbeda, perbaiki baris BACKLOG).
2. Tampilkan tabel ringkas dikelompokkan per status: `blocked`, `draft`, `approved`, `in-progress`, `ready-for-qa`,
   `qa-failed`, `done`. Per plan: ID, judul (link), ronde review, verdict terakhir.
3. Di bawahnya, langkah berikutnya per plan yang belum selesai:
   `blocked` → jawab pertanyaan lalu `/rancang revisi NNN …` · `draft` → tinjau lalu `/kerjakan NNN` atau `/jalankan NNN` ·
   `approved`/`in-progress` → `/kerjakan NNN` · `ready-for-qa` → `/uji NNN` · `qa-failed` → `/kerjakan NNN` atau `/jalankan NNN`.
4. Sebutkan juga jumlah item terbuka di `planning/DITUNDA.md` dan URL kantor 3D bila `kerja/` terpasang
   (`kerja/storage/tunnel-url.txt` atau `public_url` di `kerja/config.json`).
