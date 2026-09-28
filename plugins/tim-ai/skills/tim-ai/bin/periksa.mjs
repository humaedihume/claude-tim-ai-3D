#!/usr/bin/env node
// Periksa pemasangan tim-ai di sebuah project (read-only): tim-ai.json, frontmatter agent, skill perintah, planning/.
//   node <folder skill tim-ai>/bin/periksa.mjs [folder-project]      → keluar 0 bila tidak ada GALAT
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const err = [];
const warn = [];
const ok = [];
const rd = (p) => {
  try {
    return fs.readFileSync(path.join(root, p), 'utf8');
  } catch {
    return null;
  }
};
const exists = (p) => fs.existsSync(path.join(root, p));
function frontmatter(txt) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(txt);
  if (!m) return null;
  const fm = {};
  for (const l of m[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z_-]+):\s*(.*?)\s*$/.exec(l);
    if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

// agent
const agentDir = path.join(root, '.claude', 'agents');
const agents = {};
for (const f of fs.existsSync(agentDir) ? fs.readdirSync(agentDir).filter((n) => n.endsWith('.md')).sort() : []) {
  const txt = rd(`.claude/agents/${f}`) ?? '';
  const fm = frontmatter(txt);
  const key = f.slice(0, -3);
  if (!fm) {
    err.push(`.claude/agents/${f}: frontmatter --- … --- tidak ada`);
    continue;
  }
  agents[key] = fm;
  if (fm.name !== key) err.push(`.claude/agents/${f}: name "${fm.name ?? ''}" ≠ nama file "${key}"`);
  if (!fm.description || fm.description.length < 30) err.push(`.claude/agents/${f}: description kosong/terlalu pendek`);
  if (fm.model && !/^(opus|sonnet|haiku|inherit|claude-[a-z0-9.-]+)$/.test(fm.model)) err.push(`.claude/agents/${f}: model "${fm.model}" tidak dikenal`);
  if (fm.effort && !/^(low|medium|high|xhigh|max)$/.test(fm.effort)) err.push(`.claude/agents/${f}: effort "${fm.effort}" tidak dikenal`);
  if (fm.color && !/^(red|blue|green|yellow|purple|orange|pink|cyan)$/.test(fm.color)) warn.push(`.claude/agents/${f}: color "${fm.color}" bukan warna agent standar`);
  if (/<isi[^>]*>|<key-peran>/.test(txt)) warn.push(`.claude/agents/${f}: bagian "PROJECT — SESUAIKAN" masih berisi placeholder <isi>`);
  ok.push(`agent ${key} (${fm.model || 'model bawaan'}/${fm.effort || 'effort bawaan'})`);
}
if (!Object.keys(agents).length) err.push('.claude/agents/*.md tidak ada');

// tim-ai.json
const tj = rd('.claude/tim-ai.json');
let team = null;
if (tj === null) err.push('.claude/tim-ai.json tidak ada');
else {
  try {
    team = JSON.parse(tj);
  } catch (e) {
    err.push(`.claude/tim-ai.json bukan JSON valid: ${e.message}`);
  }
}
if (team) {
  for (const k of ['plan', 'execute', 'review']) {
    const v = Array.isArray(team[k]) ? team[k][0] : team[k];
    if (typeof v !== 'string' || !v) err.push(`tim-ai.json: "${k}" kosong`);
    else if (!agents[v]) err.push(`tim-ai.json: ${k} = "${v}" tetapi .claude/agents/${v}.md tidak ada`);
    else ok.push(`${k} → ${v}`);
  }
  if (team.max_review_rounds !== undefined && !(Number.isInteger(team.max_review_rounds) && team.max_review_rounds >= 1 && team.max_review_rounds <= 10)) err.push('tim-ai.json: max_review_rounds harus 1–10');
  for (const k of ['commit', 'push']) if (team[k] !== undefined && typeof team[k] !== 'boolean') err.push(`tim-ai.json: "${k}" harus true/false`);
}

// skill perintah
for (const s of ['rancang', 'kerjakan', 'uji', 'jalankan', 'papan']) {
  const txt = rd(`.claude/skills/${s}/SKILL.md`);
  if (txt === null) err.push(`.claude/skills/${s}/SKILL.md tidak ada`);
  else if (frontmatter(txt)?.name !== s) err.push(`.claude/skills/${s}/SKILL.md: name bukan "${s}"`);
  else ok.push(`/${s}`);
}

// planning
for (const p of ['planning/README.md', 'planning/BACKLOG.md', 'planning/DITUNDA.md', 'planning/templates/plan.md', 'planning/templates/qa-report.md', 'planning/plans', 'planning/qa']) {
  if (!exists(p)) err.push(`${p} tidak ada`);
}
const plan = rd('planning/templates/plan.md') ?? '';
for (const k of ['id:', 'judul:', 'status:', 'depends_on:', 'qa_ronde:']) if (!plan.includes(k)) err.push(`planning/templates/plan.md: frontmatter ${k} hilang (dibaca kantor 3D)`);
if (!/Verdict: PASS/.test(rd('planning/templates/qa-report.md') ?? '')) err.push('planning/templates/qa-report.md: baris "Verdict: PASS | FAIL" hilang');

// git & kantor 3D
const gi = rd('.gitignore') ?? '';
if (exists('kerja') && !/^\/?kerja\/storage\/?\s*$/m.test(gi)) err.push('.gitignore belum memuat kerja/storage/');
if (!exists('kerja')) warn.push('kerja/ (kantor 3D) belum terpasang — jalankan skill kantor-3d (/kantor-3d:kantor-3d atau /kantor-3d)');
if (!/Tim AI/.test(rd('CLAUDE.md') ?? '')) warn.push('CLAUDE.md belum memuat bagian "Tim AI"');

for (const o of ok) console.log(`  ok     ${o}`);
for (const w of warn) console.log(`  CATAT  ${w}`);
for (const e of err) console.log(`  GALAT  ${e}`);
console.log(err.length ? `GAGAL (${err.length} galat, ${warn.length} catatan)` : `OK (${ok.length} pemeriksaan, ${warn.length} catatan)`);
process.exit(err.length ? 1 : 0);
