---
name: uji
description: Tim AI — minta agent peninjau (peran "review" di .claude/tim-ai.json, mis. qa / pemeriksa-fakta / penyunting / pelapor) menguji plan NNN terhadap kriteria penerimaannya dan menulis laporan PASS/FAIL di planning/qa/.
argument-hint: <NNN> [fokus tambahan]
---

Argumen: $ARGUMENTS  (token pertama = nomor plan NNN, sisanya fokus uji tambahan dari user)

Kamu orkestrator. **Jangan menguji sendiri** — delegasikan ke agent peninjau.
Cara memanggil agent (key dari `.claude/tim-ai.json` `review`, default `qa`; fallback `general-purpose` + awalan peran
untuk agent yang baru dipasang): lihat `.claude/skills/rancang/SKILL.md` bagian "Memanggil agent".

1. Cari `planning/plans/<NNN>-*.md`. Bila status bukan `ready-for-qa`, beri tahu user statusnya dan tanya apakah tetap
   diuji (mis. uji ulang plan `done` untuk regresi).
2. Panggil agent peninjau, `run_in_background: false`, deskripsi `<Nama peran>: uji plan NNN ronde K`, prompt: nomor
   plan, path plan, fokus tambahan bila ada.
3. Laporan wajib di `planning/qa/<NNN>-qa-r<K>.md` dengan baris `**Verdict: PASS**` atau `**Verdict: FAIL**`
   (dibaca kantor 3D). Standar nol bug: temuan sekecil apa pun = FAIL.
4. Laporkan ke user: verdict, link laporan `[NNN-qa-rK](planning/qa/NNN-qa-rK.md)`, AC gagal, bug (ID, tingkat, satu kalimat).
   - FAIL → langkah berikut `/kerjakan NNN` (perbaikan) lalu `/uji NNN`, atau `/jalankan NNN` untuk loop otomatis.
   - Ada `AC-KELIRU` → sarankan `/rancang revisi NNN …` dulu.
