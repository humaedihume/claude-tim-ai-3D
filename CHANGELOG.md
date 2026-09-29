# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/); versi mengikuti
[Semantic Versioning](https://semver.org/lang/id/).

## [1.0.0] — 2026-09-28
### Ditambahkan
- Rilis publik pertama: marketplace `claude-tim-ai-3D` berisi plugin `tim-ai` dan entri `kantor-3d`
  (diambil dari repo [humaedihume/kantor-3d](https://github.com/humaedihume/kantor-3d)).
- Plugin `tim-ai` mendeklarasikan dependensi `kantor-3d` — `/plugin install tim-ai@claude-tim-ai-3D` memasang keduanya.
- Skill `tim-ai`: membaca project, mengusulkan tim (preset `software`, `konten`, `riset`, `ops`, atau kustom) untuk
  dikonfirmasi, lalu memasang `.claude/agents/`, `.claude/tim-ai.json`, perintah `/rancang` `/kerjakan` `/uji`
  `/jalankan` `/papan`, folder `planning/`, bagian `CLAUDE.md`, dan kantor 3D.
- `bin/periksa.mjs` (verifikasi pemasangan) dan `bin/cari-kantor-3d.sh` (menemukan skill kantor-3d, baik sebagai plugin
  maupun skill manual).
