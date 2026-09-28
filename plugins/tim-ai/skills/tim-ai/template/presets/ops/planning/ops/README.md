# Ops: pemeriksaan rutin terjadwal

1. `/rancang daftar cek rutin untuk <sistem>` → Pemantau menulis plan (mis. `010`) berisi satu tugas per cek dan
   satu AC per ambang. Tinjau & setujui (status `approved`).
2. Coba sekali secara manual: `bash planning/ops/rutin.sh 010` → lihat `kerja/storage/rutin.log`,
   `planning/ops/010-*.md` (hasil mentah) dan `planning/qa/010-qa-rK.md` (laporan PASS/FAIL).
3. Jadwalkan (contoh tiap 30 menit). **Jalankan di folder project** — skrip sudah `cd` sendiri — supaya transkripnya
   masuk ke `~/.claude/projects/<slug-project>/` dan kantor 3D menampilkannya:
   - Linux (crontab -e):
     `*/30 * * * * PATH=/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin bash /path/ke/project/planning/ops/rutin.sh 010`
   - macOS: cron bisa dipakai dengan baris yang sama; bila `claude` gagal login dari cron (keychain), pakai launchd
     (`~/Library/LaunchAgents/<nama>.plist` dengan `StartInterval` 1800 dan `ProgramArguments` = bash + path skrip).
   Pastikan `claude -p "ping"` berhasil dari shell non-interaktif user itu. Jangan menaruh API key di crontab atau di
   file yang di-commit; bila perlu, simpan di file env ber-chmod 600 di luar repo.
4. Hasil: kantor 3D menampilkan Pemantau/Pelapor bekerja setiap jadwal, papan tugas memuat plan cek, dan verdict
   terakhir tampil di monitor Pelapor. `/papan` meringkas status.

Catatan: Routine/jadwal cloud (`/schedule`) berjalan di mesin Anthropic, bukan di folder ini — transkripnya tidak
masuk ke `~/.claude/projects` lokal, jadi tidak tampil di kantor 3D.
