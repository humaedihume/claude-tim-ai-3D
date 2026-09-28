#!/usr/bin/env node
/*
 * Screenshot + error konsol untuk QA (dipakai agent qa).
 *   node tools/qa/shot.mjs <url> <out.png> [opsi]
 *
 * Opsi:
 *   --login=email:password   login dulu lewat POST {origin}/auth/login (cookie session dipakai halaman)
 *   --cookie="nama_sesi=..."  pakai cookie yang sudah ada (alternatif --login)
 *   --wait=2500              tunggu ms setelah load (default 2000)
 *   --click="css"            klik elemen sebelum screenshot (boleh diulang)
 *   --eval="js"              jalankan JS di halaman (boleh diulang); hasilnya dicetak
 *                            --click/--eval dijalankan berurutan sesuai urutan argumennya
 *   --width=1440 --height=900 --full   ukuran viewport / screenshot satu halaman penuh
 *
 * Keluar dengan kode 1 bila ada pageerror, console.error, atau request ke origin yang sama yang gagal (>=400).
 * Butuh Playwright: `npm i -D playwright && npx playwright install chromium` di project, atau terpasang di folder
 * induk (resolusi node naik ke folder induk, mis. ~/node_modules).
 */
import { chromium } from 'playwright';

const argv = process.argv.slice(2);
const pos = argv.filter((a) => !a.startsWith('--'));
const opt = (k) => argv.filter((a) => a.startsWith(`--${k}=`)).map((a) => a.slice(k.length + 3));
const flag = (k) => argv.includes(`--${k}`);

const [url, out] = pos;
if (!url || !out) {
  console.error('pakai: node tools/qa/shot.mjs <url> <out.png> [--login=email:pass] [--cookie=..] [--wait=ms] [--click=css] [--eval=js] [--full]');
  process.exit(2);
}

const origin = new URL(url).origin;
const width = Number(opt('width')[0] || 1440);
const height = Number(opt('height')[0] || 900);
const wait = Number(opt('wait')[0] || 2000);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width, height }, ignoreHTTPSErrors: true });
const problems = [];

for (const c of opt('cookie')) {
  const i = c.indexOf('=');
  await ctx.addCookies([{ name: c.slice(0, i), value: c.slice(i + 1), url: origin }]);
}
const login = opt('login')[0];
if (login) {
  const i = login.indexOf(':');
  const res = await ctx.request.post(`${origin}/auth/login`, {
    data: { email: login.slice(0, i), password: login.slice(i + 1) },
  });
  console.log(`login ${res.status()}`);
  if (res.status() >= 400) problems.push(`login gagal: HTTP ${res.status()} ${(await res.text()).slice(0, 200)}`);
}

const page = await ctx.newPage();
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') problems.push(`console.error: ${m.text()}`); });
page.on('response', (r) => {
  const u = new URL(r.url());
  if (u.origin === origin && r.status() >= 400 && !u.pathname.endsWith('/favicon.ico')) problems.push(`request ${r.status()} ${r.request().method()} ${r.url()}`);
});

const res = await page.goto(url, { waitUntil: 'networkidle' }).catch((e) => { problems.push(`goto: ${e.message}`); return null; });
console.log(`status ${res ? res.status() : '-'}  final ${page.url()}`);
await page.waitForTimeout(wait);

// --click dan --eval dijalankan BERURUTAN sesuai urutan di baris perintah (mis. AC yang menyelipkan
// eval di antara klik). Pemakaian lama (semua --click lalu semua --eval) hasilnya sama seperti sebelumnya.
const steps = argv.filter((a) => a.startsWith('--click=') || a.startsWith('--eval='));
for (const st of steps) {
  if (st.startsWith('--click=')) {
    const sel = st.slice(8);
    await page.click(sel, { timeout: 5000 }).catch((e) => problems.push(`click ${sel}: ${e.message.split('\n')[0]}`));
    await page.waitForTimeout(800);
    continue;
  }
  const js = st.slice(7);
  const v = await page.evaluate(js).catch((e) => { problems.push(`eval: ${e.message.split('\n')[0]}`); return undefined; });
  if (v !== undefined) console.log(`eval → ${JSON.stringify(v).slice(0, 2000)}`);
  await page.waitForTimeout(500);
}

await page.screenshot({ path: out, fullPage: flag('full') });
console.log(`screenshot ${out}`);
for (const p of problems) console.log(`PROBLEM ${p}`);
console.log(problems.length ? `FAIL (${problems.length} masalah)` : 'OK (0 masalah)');
await browser.close();
process.exit(problems.length ? 1 : 0);
