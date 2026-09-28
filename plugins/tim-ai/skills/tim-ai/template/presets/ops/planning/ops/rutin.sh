#!/usr/bin/env bash
# Jalankan pemeriksaan rutin tim ops secara headless (dipanggil cron/launchd). Transkripnya masuk ke
# ~/.claude/projects/<slug-project>/ sehingga kantor 3D (/kerja) menampilkan Pemantau & Pelapor bekerja.
#   bash planning/ops/rutin.sh 010            # plan daftar cek 010
# Wajib dijalankan sebagai user yang sudah login Claude Code; direktori kerja = root project (skrip ini cd sendiri).
set -euo pipefail
PLAN="${1:?pakai: rutin.sh <NNN>}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
mkdir -p kerja/storage
LOG="kerja/storage/rutin.log"
LOCK="kerja/storage/rutin-$PLAN.lock"
# cegah dua jadwal tumpang tindih (mkdir atomik, portabel macOS/Linux)
if ! mkdir "$LOCK" 2>/dev/null; then echo "$(date -u +%FT%TZ) lewati: run $PLAN sebelumnya masih jalan" >> "$LOG"; exit 0; fi
trap 'rmdir "$LOCK"' EXIT
CLAUDE="${CLAUDE_BIN:-$(command -v claude || echo "$HOME/.local/bin/claude")}"
echo "$(date -u +%FT%TZ) mulai plan $PLAN" >> "$LOG"
"$CLAUDE" -p "Jalankan pemeriksaan rutin plan $PLAN mengikuti .claude/skills/jalankan/SKILL.md: panggil agent pemantau (mode implement), lalu agent pelapor. Deskripsi Agent diawali nama peran. Jangan mengubah sistem apa pun." \
  --allowedTools "Read,Grep,Glob,Write,Edit,Agent,WebFetch,Bash(curl:*),Bash(df:*),Bash(openssl:*),Bash(ls:*),Bash(date:*)" \
  >> "$LOG" 2>&1 || echo "$(date -u +%FT%TZ) claude keluar dengan kode $?" >> "$LOG"
echo "$(date -u +%FT%TZ) selesai plan $PLAN" >> "$LOG"
