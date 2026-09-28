## Tim AI (rancang → kerjakan → review → simpan)

Agent di `.claude/agents/`, peran per tahap di `.claude/tim-ai.json`, alur & aturan di `planning/README.md`.
Perintah: `/rancang`, `/kerjakan NNN`, `/uji NNN`, `/jalankan …`, `/papan`. Kantor 3D: `<URL>/kerja`.
- Saat menjalankan perintah tim, sesi utama hanya orkestrator: pekerjaan dilakukan subagent (deskripsi Agent diawali
  nama peran, mis. `Analyst: …`), status dibaca dari frontmatter `planning/plans/*.md`.
- Permintaan fitur/perbaikan yang lebih dari perubahan kecil → sarankan `/rancang` atau `/jalankan`.
- Satu commit per plan yang lolos review; push hanya bila `push: true` di `.claude/tim-ai.json`. Jangan commit rahasia.
- Agent dihentikan dengan TaskStop → tambahkan id-nya ke `kerja/storage/stopped.txt`.
