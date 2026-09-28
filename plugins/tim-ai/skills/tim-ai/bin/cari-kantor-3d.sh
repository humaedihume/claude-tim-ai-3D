#!/usr/bin/env bash
# Cari folder skill kantor-3d (dipakai tim-ai untuk memasang kantor 3D tanpa menyalin kodenya).
#   bash cari-kantor-3d.sh [folder-project]
# Cetak path folder skill (berisi SKILL.md + template/kerja/) lalu keluar 0; bila tidak ketemu keluar 1 + petunjuk.
# Urutan pencarian:
#   1. $KANTOR_3D_DIR (penimpaan manual)
#   2. skill manual: <project>/.claude/skills/kantor-3d, ~/.claude/skills/kantor-3d
#   3. repo yang di-clone utuh ke folder skills (plugin "skills-dir"): …/skills/*/skills/kantor-3d
#   4. plugin terpasang dari marketplace: <plugins>/cache/*/kantor-3d/*/skills/kantor-3d (versi terbaru)
#   5. salinan marketplace: <plugins>/marketplaces/*/skills/kantor-3d
set -u
PROJECT="${1:-$PWD}"
CONF="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
PLUGINS="${CLAUDE_CODE_PLUGIN_CACHE_DIR:-$CONF/plugins}"

valid() { [[ -f "$1/SKILL.md" && -f "$1/template/kerja/public/assets/kantor.js" ]]; }
found() { (cd "$1" && pwd -P); exit 0; }

if [[ -n "${KANTOR_3D_DIR:-}" ]]; then
  valid "$KANTOR_3D_DIR" && found "$KANTOR_3D_DIR"
  echo "KANTOR_3D_DIR=$KANTOR_3D_DIR bukan folder skill kantor-3d yang valid" >&2
fi

for d in "$PROJECT/.claude/skills/kantor-3d" "$CONF/skills/kantor-3d" "$HOME/.claude/skills/kantor-3d" \
         "$PROJECT"/.claude/skills/*/skills/kantor-3d "$CONF"/skills/*/skills/kantor-3d; do
  valid "$d" && found "$d"
done

# plugin marketplace: pilih salinan yang paling baru diubah (versi terbaru)
best=""; best_t=0
for d in "$PLUGINS"/cache/*/kantor-3d/*/skills/kantor-3d "$PLUGINS"/marketplaces/*/skills/kantor-3d; do
  valid "$d" || continue
  t=$(stat -c %Y "$d/SKILL.md" 2>/dev/null || stat -f %m "$d/SKILL.md" 2>/dev/null || echo 0)
  if (( t >= best_t )); then best="$d"; best_t=$t; fi
done
[[ -n "$best" ]] && found "$best"

cat >&2 <<'EOF'
Skill kantor-3d tidak ditemukan. Pasang salah satu:
  • Plugin : /plugin marketplace add sambu-la/kantor-3d  lalu  /plugin install kantor-3d@kantor-3d
             (atau lewat marketplace tim-ai: /plugin install tim-ai@claude-tim-ai-3D memasang keduanya)
  • Manual : git clone https://github.com/sambu-la/kantor-3d && cp -R kantor-3d/skills/kantor-3d ~/.claude/skills/
Lalu /reload-plugins (atau buka sesi baru). Lokasi lain: set KANTOR_3D_DIR=<folder skill kantor-3d>.
EOF
exit 1
