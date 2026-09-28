---
name: tim-ai
description: Pasang "Tim AI" multi-agent Claude Code di project ini — membaca project, mengusulkan tim (preset software, konten, riset, ops, atau peran kustom) untuk dikonfirmasi user, lalu memasang agent .claude/agents, alur rancang → kerjakan → review → simpan (/rancang /kerjakan /uji /jalankan /papan), struktur planning/, dan kantor 3D /kerja untuk memantau tim. Pakai saat user ingin membentuk/menyesuaikan tim agent AI untuk sebuah project (untuk visualisasinya saja pakai skill kantor-3d).
argument-hint: [software|konten|riset|ops] [--tanpa-kantor] [--push]
---

Brief lengkap: `${CLAUDE_SKILL_DIR}/BRIEF.md` (preset, skema `tim-ai.json`, pelajaran dari project asal, pembaruan project lama).
Template: `${CLAUDE_SKILL_DIR}/template/common/` (perintah + planning), `${CLAUDE_SKILL_DIR}/template/presets/<preset>/`
(agent, `tim-ai.json`, override), `${CLAUDE_SKILL_DIR}/template/agent-kustom.md` (pola peran baru).
Kantor 3D: skill terpisah `kantor-3d` (dependensi plugin ini; jangan menyalin/menduplikasi template-nya ke tim-ai).
Lokasi skill kantor-3d: `bash ${CLAUDE_SKILL_DIR}/bin/cari-kantor-3d.sh` → mencetak foldernya (plugin, `~/.claude/skills/`,
atau `.claude/skills/` project) atau keluar 1 dengan petunjuk pemasangan.

Argumen user: $ARGUMENTS

## Langkah (di root project saat ini)

1. **Baca project dulu** (read-only): README, brief/docs, berkas paket (`package.json`, `composer.json`,
   `pyproject.toml`, `go.mod`, …), struktur folder, `git log -5`, dan yang sudah ada (`.claude/agents`, `planning/`,
   `kerja/`, `CLAUDE.md`), serta `cari-kantor-3d.sh` (apakah kantor 3D bisa dipasang). Tentukan jenis pekerjaan → preset:
   `software` (analyst → developer → qa; opsional developer-senior + developer-junior, devops) ·
   `konten` (editor → penulis → pemeriksa-fakta) · `riset` (peneliti → analis-data → penyunting) ·
   `ops` (pemantau → pelapor, untuk job terjadwal `claude -p`) · atau peran kustom (pola `agent-kustom.md`).
2. **Usulkan, lalu konfirmasi — jangan pernah memasang diam-diam.** AskUserQuestion (opsi + rekomendasi):
   - tim: preset yang direkomendasikan + alasan 1–2 kalimat dari bukti project, alternatifnya, atau kustom
     (multiSelect untuk peran opsional); tampilkan tabel peran → model/effort default
     (software: analyst opus/medium, developer sonnet/medium, qa sonnet/low; opsional senior opus/medium,
     junior sonnet/medium, devops sonnet/medium; preset lain: perancang opus/medium, pelaksana sonnet/medium,
     peninjau sonnet/low) dan tawarkan untuk mengubahnya;
   - simpan hasil: satu commit per plan yang lolos review (ya/tidak, hanya bila repo git) dan push (default **tidak**);
   - kantor 3D: pasang (cara serve: Valet / PHP / Node / Nginx) atau lewati (`--tanpa-kantor`); nama karakter opsional.
   Bila user mengubah usulan, ulangi ringkasannya sekali lalu lanjut.
3. **Pasang tanpa menimpa** (file yang sudah ada → tanya dulu; tampilkan diff bila perlu):
   - `.claude/agents/<peran>.md` dari `presets/<preset>/agents/` untuk peran terpilih (peran kustom: salin
     `agent-kustom.md`, isi semua `<…>`); set `model`/`effort` sesuai pilihan user.
   - `.claude/tim-ai.json` dari `presets/<preset>/tim-ai.json`; sesuaikan `execute` (mis. `developer-senior` bila tim
     senior+junior), `commit`, `push`.
   - `.claude/skills/{rancang,kerjakan,uji,jalankan,papan}/` dari `common/.claude/skills/`.
   - `planning/` dari `common/planning/`, lalu override dari `presets/<preset>/planning/` (software: template plan &
     laporan QA; ops: `planning/ops/`). Software juga `tools/qa/shot.mjs`.
   - **Isi bagian "PROJECT — SESUAIKAN"** di setiap agent dari fakta project (stack, lokasi berkas, perintah uji/cek,
     gaya, larangan). Jangan mengarang: yang tidak diketahui biarkan `<isi>` dan sebutkan di laporan.
   - Tambahkan `common/CLAUDE.snippet.md` ke `CLAUDE.md` project (buat bila belum ada; jangan duplikat).
   - `.gitignore`: `kerja/storage/` dan `planning/qa/evidence/` (bukti gambar besar; hapus baris kedua bila user
     ingin bukti ikut di-commit).
4. **Kantor 3D** (kecuali dilewati), pilih cara pertama yang tersedia:
   a. Panggil skill kantor-3d lewat tool Skill — `kantor-3d:kantor-3d` bila terpasang sebagai plugin, `kantor-3d` bila
      skill manual (lihat daftar skill yang tersedia); teruskan pilihan user sebagai argumen (`--php`/`--node`,
      `--host …`, `--publik`, `--domain …`).
   b. Bila skill itu belum termuat di sesi ini (mis. baru dipasang): `bash ${CLAUDE_SKILL_DIR}/bin/cari-kantor-3d.sh`
      mencetak foldernya (sebut `<K>`); baca `<K>/SKILL.md` dan ikuti langkah 1–6-nya, dengan `<K>` sebagai nilai
      variabel folder skill (`CLAUDE_SKILL_DIR`) di file itu.
   c. Tidak ditemukan → jangan berhenti: selesaikan pemasangan tim, tandai kantor 3D "dilewati", dan tampilkan
      petunjuk dari skrip (pasang plugin `kantor-3d` atau salin skill manual, lalu `/reload-plugins` dan ulangi langkah ini).
   Tanpa config pun peran terbaca dari `.claude/agents`; buat `kerja/config.json` hanya untuk nama karakter
   (mis. `{"roles":[{"key":"analyst","name":"Pingot","asks_user":true}, …],"orchestrator":{"name":"Risko"}}` —
   nama contoh, ganti sesuai selera).
5. **Verifikasi:** `node ${CLAUDE_SKILL_DIR}/bin/periksa.mjs .` → OK (frontmatter agent, tim-ai.json, perintah,
   planning). Bila kantor terpasang: `/kerja/api/state` → `mode: "planning"` dan `roles` = peran tim.
6. **Laporkan:** tabel peran (key, model/effort, posisi plan/execute/review), file terpasang, `<isi>` yang masih
   perlu diisi user, perintah tim, URL kantor 3D, dan:
   - agent kustom baru terbaca di **sesi Claude Code berikutnya**; sampai itu orkestrator memakai `general-purpose`
     dengan deskripsi berawalan nama peran (`Analyst: …`) yang membaca `.claude/agents/<key>.md`;
   - ubah model/effort: frontmatter `.claude/agents/<peran>.md` (`model: opus|sonnet|haiku`, `effort: low|medium|high`);
   - preset ops: cara menjadwalkan `planning/ops/rutin.sh` (cron/launchd) di `planning/ops/README.md`.

## Aturan
- Jangan mengubah kode/konten produk; yang dipasang hanya `.claude/`, `planning/`, `tools/qa/`, `kerja/`, `CLAUDE.md`, `.gitignore`.
- Jangan menyalin rahasia ke agent, config, atau dokumen. Jangan commit/push saat pemasangan kecuali user meminta.
