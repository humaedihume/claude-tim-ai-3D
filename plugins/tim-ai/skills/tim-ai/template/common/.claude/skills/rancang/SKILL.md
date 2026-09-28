---
name: rancang
description: Tim AI — minta agent perancang (peran "plan" di .claude/tim-ai.json, mis. analyst / editor / peneliti) merancang pekerjaan menjadi plan di planning/plans/ (tugas pelaksana + kriteria penerimaan untuk peninjau). Juga untuk merevisi plan yang ada.
argument-hint: <deskripsi pekerjaan> | revisi <NNN> <perubahan>
---

Permintaan user: $ARGUMENTS

Kamu orkestrator. **Jangan merancang sendiri** — delegasikan ke agent perancang.

**Memanggil agent (berlaku di semua perintah tim):** baca `.claude/tim-ai.json` (`plan`, `execute`, `review`; default
`analyst`/`developer`/`qa`). Panggil `subagent_type: "<key>"`. Bila agent itu belum terdaftar di sesi ini (agent kustom
baru terbaca di sesi berikutnya setelah dipasang), pakai `subagent_type: "general-purpose"` dan awali prompt dengan
"Peranmu: baca dan ikuti `.claude/agents/<key>.md` sepenuhnya." Deskripsi Agent **selalu** diawali nama peran
(`Analyst: rancang ekspor CSV`) supaya kantor 3D (/kerja) menaruhnya di meja yang benar.

1. Panggil agent perancang dengan `run_in_background: false`. Prompt:
   - Permintaan user di atas apa adanya, tanggal hari ini, dan konteks percakapan yang relevan (keputusan user sebelumnya).
   - Bila argumen diawali `revisi <NNN>`: minta perancang merevisi `planning/plans/<NNN>-*.md` sesuai perubahan itu.
2. Setelah selesai, baca frontmatter + bagian 5, 6, 8 plan yang dibuat (jangan seluruh file).
3. Bila ada `[BLOKIR]`: tanyakan ke user dengan AskUserQuestion (satu pertanyaan per `[BLOKIR]`, opsi dari plan bila ada).
   Kirim jawabannya ke agent yang sama lewat SendMessage untuk merevisi plan. Item `[DITUNDA]` (bahan kurang/
   membingungkan) tidak ditanyakan satu per satu — cukup dirangkum di laporan.
4. Laporkan ke user (bahasa Indonesia, ringkas):
   - Link plan: `[NNN-slug](planning/plans/NNN-slug.md)`, status, jumlah tugas & AC.
   - Daftar `[ASUMSI]` supaya user bisa mengoreksi.
   - Langkah berikut: tinjau/edit plan, lalu `/kerjakan NNN` (pelaksana saja) atau `/jalankan NNN` (pelaksana →
     peninjau → perbaikan otomatis).
