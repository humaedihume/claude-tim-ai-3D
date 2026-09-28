# BRIEF — Tim AI (multi-agent Claude Code + kantor 3D)

Skill ini membentuk tim subagent Claude Code untuk satu project dan memasang alur kerja tertulis
**rancang → kerjakan → review → simpan** yang bisa dipantau di kantor 3D (`/kerja`, skill `kantor-3d` — dependensi terpisah, dicari dengan `bin/cari-kantor-3d.sh`).
Asal: tim Analyst → Developer → QA sebuah project nyata (2026-09, ±240 run subagent, 20 plan), digeneralisasi.

---

## 1. Prinsip
- **Usulkan, konfirmasi, baru pasang.** Tim dipilih dari bukti di project (README, paket, struktur, git), bukan tebakan.
- **Sesi utama = orkestrator.** Pekerjaan dilakukan subagent; orkestrator membaca status plan, memutuskan langkah,
  bertanya ke user, menyimpan (commit), melapor.
- **Tertulis & bisa diaudit.** Semua keputusan, tugas, kriteria, dan hasil review ada di `planning/` (format tetap —
  kantor 3D membacanya).
- **Nol bug.** Review PASS hanya bila nol temuan; maks 5 ronde perbaikan otomatis, lalu tanya user.
- **Tidak memblokir.** Bahan kurang → `[DITUNDA]` dan lanjut; hanya `[BLOKIR]` yang ditanyakan ke user.

## 2. Preset
| Preset | plan (perancang) | execute (pelaksana) | review (peninjau) | Opsional | Cocok untuk |
|---|---|---|---|---|---|
| `software` | analyst | developer | qa | developer-senior + developer-junior (`@junior` → review senior), devops (`@devops`) | aplikasi/kode |
| `konten` | editor | penulis | pemeriksa-fakta | — | blog, dokumentasi, naskah |
| `riset` | peneliti | analis-data | penyunting | — | riset, analisis data, laporan |
| `ops` | pemantau | pemantau | pelapor | — | pemeriksaan rutin terjadwal (`claude -p` via cron/launchd) |
| kustom | bebas | bebas | bebas | agent baru dari `template/agent-kustom.md` | apa pun |

Default model/effort (bisa diubah user saat konfirmasi atau kapan saja di frontmatter agent):
software — analyst `opus/medium`, developer `sonnet/medium`, qa `sonnet/low`, developer-senior `opus/medium`,
developer-junior `sonnet/medium`, devops `sonnet/medium`; preset lain — perancang `opus/medium`, pelaksana
`sonnet/medium`, peninjau `sonnet/low` (ops: pemantau & pelapor `sonnet/low`).

## 3. Berkas yang dipasang
```
.claude/agents/<peran>.md          frontmatter name, description, tools, model, effort, memory: project, color
.claude/tim-ai.json                {"preset","plan","execute","review","max_review_rounds","commit","push"}
.claude/skills/rancang|kerjakan|uji|jalankan|papan/SKILL.md   perintah orkestrator (generik, baca tim-ai.json)
planning/README.md BACKLOG.md DITUNDA.md ROADMAP.example.md templates/{plan,qa-report}.md plans/ qa/evidence/
planning/ops/{README.md,rutin.sh}  (preset ops)          tools/qa/shot.mjs  (preset software; butuh Playwright)
CLAUDE.md  (+ bagian "Tim AI")      .gitignore (+ kerja/storage/, planning/qa/evidence/)
kerja/  → dipasang oleh skill kantor-3d
```

### 3.1 `.claude/tim-ai.json`
| Kunci | Arti | Default |
|---|---|---|
| `preset` | nama preset (info; kantor 3D memakai `review` untuk label kolom "Uji QA"/"Direview") | — |
| `plan` / `execute` / `review` | key agent tiap tahap (string; `execute` boleh list, elemen pertama = utama) | analyst / developer / qa |
| `max_review_rounds` | batas ronde review → perbaikan | 5 (ops 1) |
| `commit` | satu commit per plan PASS (hanya di repo git) | true (ops false) |
| `push` | push setelah commit | **false** — hanya bila user mengizinkan |
Kantor 3D juga membaca `plan` sebagai peran "penanya" (status "Menunggu keputusanmu").

### 3.2 Perintah (sesi utama = orkestrator)
| Perintah | Yang terjadi |
|---|---|
| `/rancang <pekerjaan>` · `/rancang revisi NNN …` | perancang menulis/merevisi plan; `[BLOKIR]` ditanyakan lewat AskUserQuestion |
| `/kerjakan NNN [catatan]` | pelaksana mengerjakan (draft = disetujui); `qa-failed` → mode fix dari laporan terakhir; penanda `@junior/@senior/@devops/@<key>` |
| `/uji NNN [fokus]` | peninjau menulis `planning/qa/NNN-qa-rK.md` dengan `**Verdict: PASS/FAIL**` |
| `/jalankan <pekerjaan> \| NNN … \| semua [--tinjau]` | alur penuh sampai PASS (maks ronde) → satu commit per plan (+ push bila diizinkan) |
| `/papan` | status semua plan + langkah berikutnya |

Pemanggilan agent: `subagent_type: "<key>"`; agent yang baru dipasang belum terdaftar sampai sesi berikutnya →
`general-purpose` + prompt "Peranmu: baca dan ikuti `.claude/agents/<key>.md`". Deskripsi Agent **selalu** diawali
nama peran (`Developer: implement plan 040`) — kantor 3D memetakan meja dari `agentType` atau awalan itu.

## 4. Format planning (dibaca kantor 3D — jangan diubah)
- `ROADMAP.md`: modul `| Mxx | nama | SUDAH|SEBAGIAN|BELUM | NN% | S|M|L | plan |`; fase `| **N. nama** | Mxx (plan) | … |`;
  pertanyaan `### Qn. Judul — [BLOKIR|ASUMSI]` + `> ✅ **Jawaban user (YYYY-MM-DD):** …`.
- Plan `plans/NNN-slug.md`: frontmatter `id, judul, status, depends_on, qa_ronde`; tugas `- [ ] Tn — …`; AC `| ACn | … |`.
  Status: `draft → approved → in-progress → ready-for-qa → done` atau `qa-failed` / `blocked`. Plan `xyN` ↔ modul `Mxy`.
- Laporan `qa/NNN-qa-rK.md` (semua preset, termasuk review konten/riset/ops): `**Verdict: PASS|FAIL**`, temuan `### Bn`,
  bagian `AC-KELIRU`. Bukti gambar di `qa/evidence/NNN/`.
- `DITUNDA.md`: `| YYYY-MM-DD | plan | item | alasan | yang dibutuhkan |` (dicoret `~~…~~` bila beres).

## 5. Pelajaran dari project asal (sudah tertulis di agent & perintah)
1. `[DITUNDA]` untuk bahan kurang/membingungkan: lewati & catat, jangan blokir seluruh plan.
2. Review nol bug — tidak ada "PASS dengan catatan"; maks 5 ronde lalu berhenti dan tanya user; `AC-KELIRU` → perancang
   merevisi AC dulu.
3. Satu commit per plan yang PASS (`NNN: judul` + ringkasan + path laporan); push hanya bila diizinkan; tidak pernah
   force-push.
4. Jangan pernah commit rahasia: keluarkan `.env*`, kunci, kredensial, `kerja/storage/**`; periksa isi diff untuk pola
   token sebelum commit.
5. Agent kustom baru terbaca di sesi berikutnya → pakai `general-purpose` + awalan peran sampai itu.
6. Agent yang di-TaskStop → id-nya ke `kerja/storage/stopped.txt` (kantor 3D langsung "Terhenti").
7. Pemanggilan berurutan (`run_in_background: false`) di alur otomatis; satu plan kecil (≤ ~10 tugas) per pemanggilan.

## 6. Preset ops & job terjadwal
Pemantau menulis plan daftar cek (satu tugas per cek, satu AC per ambang), menjalankannya read-only, mencatat hasil
mentah di `planning/ops/NNN-<waktu>.md`; Pelapor menilai → `planning/qa/NNN-qa-rK.md` (PASS = sehat). Penjadwalan:
`planning/ops/rutin.sh <NNN>` (cd ke project, kunci anti tumpang-tindih, `claude -p` dengan `--allowedTools` sempit,
log di `kerja/storage/rutin.log`) dari cron atau launchd. Transkrip `claude -p` di folder project → tampil di kantor 3D.
Routine cloud (`/schedule`) tidak menulis transkrip lokal → tidak tampil.

## 7. Peran kustom
Salin `template/agent-kustom.md` ke `.claude/agents/<key>.md`, isi semua `<…>` (nama = key, deskripsi kapan dipakai,
tools minimum, model/effort, warna). Pasang di alur lewat `tim-ai.json` (plan/execute/review) atau penanda tugas
`@<key>` di plan. Kantor 3D otomatis memberi meja (maks 6 meja; sisanya kartu "+N").

## 8. Memperbarui project yang sudah terpasang
Agent, perintah, dan planning lama tetap kompatibel. Langkah: pastikan ada `.claude/tim-ai.json` (preset software,
`push` sesuai kebiasaan user), bandingkan `.claude/skills/*` dengan versi template terbaru (pertahankan penyesuaian
project), perbarui `kerja/` lewat skill kantor-3d (config lama `team{}` tetap terbaca).

## 9. Verifikasi
- `node <folder skill tim-ai>/bin/periksa.mjs <project>` → OK (frontmatter valid, name = nama file, model/effort
  dikenal, tim-ai.json menunjuk agent yang ada, 5 perintah, planning lengkap, `.gitignore`).
- Kantor 3D: `/kerja/api/state` → `mode: "planning"`, `roles` berisi peran tim (dari `.claude/agents`).
- Uji alur kecil: `/rancang <tugas kecil>` → plan draft muncul di papan tugas kantor; `/jalankan NNN` → review → commit.
