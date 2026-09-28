---
name: kerjakan
description: Tim AI — minta agent pelaksana (peran "execute" di .claude/tim-ai.json, mis. developer / penulis / analis-data) mengerjakan plan NNN, atau memperbaiki temuan dari laporan review terakhir bila status qa-failed.
argument-hint: <NNN> [catatan tambahan untuk pelaksana]
disable-model-invocation: true
---

Argumen: $ARGUMENTS  (token pertama = nomor plan NNN, sisanya catatan user untuk pelaksana)

Kamu orkestrator. **Jangan mengerjakan sendiri** — delegasikan ke agent pelaksana.
Cara memanggil agent (key dari `.claude/tim-ai.json`, fallback `general-purpose` + awalan peran untuk agent yang baru
dipasang): lihat `.claude/skills/rancang/SKILL.md` bagian "Memanggil agent".

1. Cari `planning/plans/<NNN>-*.md`. Tidak ada → beri tahu user dan tampilkan `planning/BACKLOG.md`.
2. Baca frontmatter:
   - `blocked` → tampilkan alasannya (bagian 8) dan berhenti (sarankan `/rancang revisi NNN …`). Item `[DITUNDA]` tidak menghentikan.
   - `depends_on` berisi plan yang belum `done` → beri tahu user dan berhenti kecuali user menyuruh lanjut di catatan.
   - `draft` → user memanggil perintah ini = persetujuan: ubah ke `approved` (plan + BACKLOG).
   - `done` → tanya user apakah benar mau dikerjakan ulang.
3. Mode: `fix` bila status `qa-failed` (sertakan path laporan terbaru `planning/qa/<NNN>-qa-r<K>.md`), selain itu `implement`.
4. **Pilih pelaksana** dari agent di `.claude/agents/` dan penanda tugas di plan:
   - tugas tanpa penanda → agent `execute` di tim-ai.json (default `developer`);
   - ada `developer-senior`/`developer-junior` → tugas `@junior` ke developer-junior (mode implement), lalu
     developer-senior (mode **review**); temuan review → kembali ke junior (`fix-review`) sampai lulus review;
     tugas `@senior` atau tanpa penanda ke developer-senior;
   - tugas `@devops` → agent `devops` (langkah yang mengubah staging/produksi selalu minta izin user dulu);
   - penanda lain `@<key>` → agent `<key>` bila ada di `.claude/agents/`.
   Panggil tiap agent dengan `run_in_background: false`, prompt: nomor plan, mode, daftar tugas miliknya, path plan
   (dan laporan review), catatan user bila ada. Deskripsi diawali nama peran, mis. `Developer: implement plan 040`.
5. Laporkan ke user: status plan, file utama yang diubah, hasil cek sendiri pelaksana, penyimpangan/hal yang butuh
   keputusan, item `[DITUNDA]`. Langkah berikut: `/uji NNN`.

Bila perlu menghentikan agent yang macet (TaskStop), tambahkan baris `<agentId>  # alasan` ke
`kerja/storage/stopped.txt` supaya kantor 3D langsung menandainya "Terhenti".
