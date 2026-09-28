---
name: jalankan
description: Tim AI — jalankan alur penuh rancang → kerjakan → review → perbaikan sampai PASS (maks ronde dari .claude/tim-ai.json, default 5) → simpan (commit) untuk satu pekerjaan baru, satu/lebih plan NNN, atau semua plan approved.
argument-hint: <deskripsi pekerjaan> | <NNN> [NNN …] | semua   [--tinjau]
disable-model-invocation: true
---

Argumen: $ARGUMENTS

Kamu orkestrator alur. **Semua pekerjaan dilakukan subagent**; kamu hanya membaca status, memutuskan langkah
berikutnya, bertanya ke user bila perlu, menyimpan hasil (commit), dan melapor. Panggil setiap subagent dengan
`run_in_background: false` karena langkah berikutnya bergantung pada hasilnya.

**Konfigurasi tim:** `.claude/tim-ai.json` → `plan` (perancang), `execute` (pelaksana), `review` (peninjau),
`max_review_rounds` (default 5), `commit` (default true), `push` (default false). Tanpa file itu:
`analyst` / `developer` / `qa`, 5 ronde, commit ya, push tidak. Cara memanggil agent (termasuk fallback
`general-purpose` + awalan peran untuk agent yang baru dipasang): `.claude/skills/rancang/SKILL.md` "Memanggil agent".

## 0. Tentukan antrean
- Argumen berupa nomor (`001`, `001 002`) → antrean = plan itu, berurutan.
- `semua` → semua plan di `planning/BACKLOG.md` berstatus `approved`, `ready-for-qa`, atau `qa-failed`, urut ID,
  dengan dependensi dihormati.
- Selain itu = deskripsi pekerjaan baru → langkah 1 dulu, antrean = plan yang dibuat perancang (bisa lebih dari satu).
- `--tinjau` → berhenti setelah plan selesai dirancang supaya user meninjau; jangan lanjut ke pelaksana.

## 1. Rancang (hanya untuk pekerjaan baru)
Panggil perancang dengan deskripsi + tanggal hari ini. Bahan yang kurang/membingungkan sudah dilewati sebagai
`[DITUNDA]` (lihat `planning/DITUNDA.md`) — jangan berhenti karenanya. Plan `blocked` (seluruhnya tidak bisa jalan):
lewati, lanjut ke yang lain, kumpulkan pertanyaannya untuk laporan akhir. Tampilkan `[ASUMSI]` di laporan akhir.
Bila `--tinjau` → laporkan dan berhenti.

## 2. Untuk setiap plan di antrean
Lewati plan yang `depends_on`-nya belum `done` atau berstatus `blocked` (catat alasannya). Status `draft` → set
`approved` (pemanggilan ini = persetujuan).

Loop, `ronde` mulai dari `qa_ronde` di frontmatter:
1. **Kerjakan** — pilih pelaksana seperti langkah 4 di `.claude/skills/kerjakan/SKILL.md` (tanpa penanda → `execute`;
   `@junior` → junior lalu review senior; `@devops` → devops; `@<key>` → agent itu). Mode `implement` bila status
   `approved`/`in-progress`, mode `fix` + path laporan review terbaru bila `qa-failed`. Status `ready-for-qa` →
   langsung ke review. Tugas `[DITUNDA]` tidak menghentikan alur; peninjau hanya menguji AC yang tidak ditunda. Bila
   pelaksana tidak bisa mengerjakan satu tugas pun → tandai plan `blocked`, lanjut ke plan berikutnya.
2. **Review** — panggil peninjau (`review`); laporan `planning/qa/<NNN>-qa-r<K>.md` dengan `**Verdict: PASS|FAIL**`.
3. Baca verdict di laporan terbaru:
   - `PASS` (nol bug) → plan selesai → **Simpan** (langkah 3) → lanjut plan berikutnya.
   - Ada `AC-KELIRU` → panggil perancang untuk merevisi AC plan itu (sebutkan path laporan), lalu kembali ke 1.
   - `FAIL` dan ronde < `max_review_rounds` → kembali ke 1 (mode fix).
   - `FAIL` di ronde terakhir → **berhenti** untuk plan ini: laporkan temuan yang tersisa dan minta keputusan user.
     Jangan lanjut ke plan yang bergantung padanya.

Beri tahu user satu baris setiap kali pindah tahap (mis. "001: pelaksana selesai → review ronde 1").

## 3. Simpan — satu commit per plan yang PASS
Hanya bila `commit` true dan project adalah repo git (`git rev-parse --is-inside-work-tree`); selain itu lewati dan
sebutkan di laporan.
1. `git add -A`, lalu periksa `git diff --cached --name-only`. **Jangan pernah meng-commit rahasia atau file runtime:**
   keluarkan (`git reset -q -- <file>`) setiap file seperti `.env*`, `*.pem`, `*.key`, `*.p12`, `id_rsa*`,
   `credentials*`, `*secret*`, `kerja/storage/**`, dan periksa isi diff (`git diff --cached -U0`) untuk pola rahasia
   (`sk-…`, `ghp_…`, `AKIA…`, `-----BEGIN … PRIVATE KEY-----`, `password=`/`token=` dengan nilai). Temuan → keluarkan
   file itu, jangan commit, laporkan ke user. Tambahkan pola yang hilang ke `.gitignore` bila perlu.
2. Pesan commit `<NNN>: <judul plan>` + ringkasan 2–4 baris + path laporan review terakhir, diakhiri baris
   Co-Authored-By sesuai instruksi sistem.
3. **Push hanya bila `push` true** di tim-ai.json (atau user memintanya di percakapan ini): `git push` ke upstream
   branch saat ini. Gagal → laporkan; jangan pernah force-push.

## 4. Laporan akhir
Tabel per plan: ID, judul (link plan), status akhir, jumlah ronde review, link laporan terakhir, hash commit. Lalu:
file utama yang berubah, saran peninjau yang belum dikerjakan, `[ASUMSI]` yang perlu dikonfirmasi, ringkasan
`planning/DITUNDA.md` (item + yang dibutuhkan), plan yang dilewati/berhenti beserta alasannya, dan URL kantor 3D bila ada.

## Catatan operasional
- Agent yang macet dihentikan dengan TaskStop → tambahkan baris `<agentId>  # alasan` ke `kerja/storage/stopped.txt`
  (kantor 3D langsung menandainya "Terhenti"), lalu panggil ulang agent itu dengan konteks yang sama.
- Agent kustom yang baru dipasang baru terbaca di sesi berikutnya; sampai itu pakai `general-purpose` + awalan peran.
