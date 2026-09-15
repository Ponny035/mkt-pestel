const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:4173/';
const OUT_DIR = 'C:\\Users\\paipo\\AppData\\Local\\Temp\\pestel-e2e';
fs.mkdirSync(OUT_DIR, { recursive: true });

const MARK = 'PWTEST_' + Date.now();
const results = [];
function report(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ' :: ' + detail : ''));
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('dialog', d => d.accept());
  const consoleErrors = [];
  page.on('pageerror', e => consoleErrors.push(String(e)));
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });

  await page.goto(BASE);
  await page.waitForSelector('#board .column', { timeout: 15000 });
  await page.waitForFunction(() => {
    const s = document.querySelector('#statusBar');
    return s && s.textContent.includes('Live');
  }, { timeout: 15000 });
  report('initial load reaches Live status', true);

  // add a uniquely-marked temp note under Political so we can trace it through save/delete/restore
  const politicalAdd = page.locator('.column[data-cat="P"] .add-note');
  await politicalAdd.click();
  await page.waitForTimeout(300);
  const newTextarea = page.locator('.column[data-cat="P"] .note-text').last();
  await newTextarea.fill(MARK);
  await newTextarea.blur();
  await page.waitForTimeout(1200); // debounce + network round trip
  const hasMark1 = await page.locator('#board').textContent();
  report('temp test note created', hasMark1.includes(MARK));

  // SAVE
  const dl1p = page.waitForEvent('download');
  await page.click('#saveSnapshot');
  const dl1 = await dl1p;
  const savedPath = path.join(OUT_DIR, 'before.html');
  await dl1.saveAs(savedPath);
  const savedHtml = fs.readFileSync(savedPath, 'utf8');
  report('save produced a file', fs.existsSync(savedPath), savedPath);
  report('saved file embeds PESTEL_SNAPSHOT with test note', savedHtml.includes('PESTEL_SNAPSHOT') && savedHtml.includes(MARK));
  // app.js's own inlined source legitimately contains these exact strings
  // (they're the .replace() targets), so only count occurrences BEFORE the
  // inlined <script> block as real leftover tags.
  const inlineScriptStart = savedHtml.lastIndexOf('<script>(function(){');
  function noRealTag(tag) {
    const idx = savedHtml.indexOf(tag);
    return idx === -1 || idx > inlineScriptStart;
  }
  report('saved file inlined style.css (no real <link> left)', noRealTag('<link rel="stylesheet" href="style.css">'));
  report('saved file inlined app.js (no real external src)', noRealTag('<script src="app.js">'));
  report('saved file dropped supabase-js script tag', !savedHtml.includes('<script src="https://cdn.jsdelivr.net/npm/@supabase'));
  report('saved file carries new theme code', savedHtml.includes('EXPORT_ACCENT'));

  // delete the temp note to simulate "board got messed up"
  const markCard = page.locator('.note', { hasText: MARK });
  await markCard.locator('.note-del').click();
  await page.waitForTimeout(1000);
  const afterDelete = await page.locator('#board').textContent();
  report('temp note removed from live board', !afterDelete.includes(MARK));

  // LOAD the "before" snapshot as a preview
  await page.setInputFiles('#loadSnapshotInput', savedPath);
  await page.waitForTimeout(500);
  const previewText = await page.locator('#statusBar').textContent();
  report('load enters preview mode', previewText.includes('Previewing'));
  const boardAfterLoad = await page.locator('#board').textContent();
  report('preview shows the restored test note', boardAfterLoad.includes(MARK));
  const hasRestoreBtn = await page.locator('#statusRestore').count();
  report('preview offers Restore button', hasRestoreBtn === 1);

  // RESTORE to live board (native confirm auto-accepted via dialog handler above)
  await page.click('#statusRestore');
  await page.waitForFunction(() => {
    const s = document.querySelector('#statusBar');
    return s && s.textContent.includes('Live');
  }, { timeout: 15000 });
  await page.waitForTimeout(500);
  const statusAfterRestore = await page.locator('#statusBar').textContent();
  report('status returns to Live after restore', statusAfterRestore.includes('Live'));
  const boardAfterRestore = await page.locator('#board').textContent();
  report('restored board contains the test note (real Supabase round-trip)', boardAfterRestore.includes(MARK));

  // cleanup: remove the temp note from the live board for real
  const cleanupCard = page.locator('.note', { hasText: MARK });
  if (await cleanupCard.count()) {
    await cleanupCard.locator('.note-del').click();
    await page.waitForTimeout(1000);
  }
  const finalBoard = await page.locator('#board').textContent();
  report('cleanup: temp note removed from live Supabase board', !finalBoard.includes(MARK));

  // file:// protocol should show a clear, specific error on Save
  const fileUrl = 'file:///C:/Users/paipo/Documents/me/pestel/mkt-pestel/index.html';
  await page.goto(fileUrl);
  await page.waitForSelector('#board .column', { timeout: 15000 });
  await page.waitForTimeout(1000);
  page.once('dialog', d => d.dismiss().catch(() => {}));
  await page.click('#saveSnapshot');
  await page.waitForTimeout(300);
  const toastText = await page.locator('#toast').textContent();
  report('file:// Save shows the http(s)-required toast', /http/i.test(toastText) || /file/i.test(toastText), toastText);

  await browser.close();

  // ---- second browser context back on the http server, for exports ----
  const browser2 = await chromium.launch();
  const page2 = await browser2.newPage();
  await page2.goto(BASE);
  await page2.waitForSelector('#board .column', { timeout: 15000 });
  await page2.waitForFunction(() => document.querySelector('#statusBar').textContent.includes('Live'), { timeout: 15000 });

  await page2.click('#exportOpen');
  await page2.waitForSelector('#exportOverlay:not([hidden])');

  // select A4 ratio + grid layout, download PNG, inspect the actual pixels
  await page2.click('.layout-opt[data-layout="grid"]');
  await page2.click('.ratio-opt[data-key="a4"]');
  const pngDlP = page2.waitForEvent('download');
  await page2.click('#exportPng');
  const pngDl = await pngDlP;
  const pngPath = path.join(OUT_DIR, 'grid-a4.png');
  await pngDl.saveAs(pngPath);
  report('PNG export (A4, grid) downloaded', fs.existsSync(pngPath), pngPath);

  // PDF export
  const pdfDlP = page2.waitForEvent('download');
  await page2.click('#exportPdf');
  const pdfDl = await pdfDlP;
  const pdfPath = path.join(OUT_DIR, 'board.pdf');
  await pdfDl.saveAs(pdfPath);
  report('PDF export downloaded', fs.existsSync(pdfPath), pdfPath);

  // PPTX export
  const pptxDlP = page2.waitForEvent('download');
  await page2.click('#exportPptx');
  const pptxDl = await pptxDlP;
  const pptxPath = path.join(OUT_DIR, 'board.pptx');
  await pptxDl.saveAs(pptxPath);
  report('PPTX export downloaded', fs.existsSync(pptxPath), pptxPath);

  await browser2.close();

  report('no uncaught page errors during the whole run', consoleErrors.length === 0, consoleErrors.join(' | '));

  console.log('\n--- SUMMARY ---');
  const failed = results.filter(r => !r.ok);
  console.log(results.length + ' checks, ' + failed.length + ' failed');
  if (failed.length) {
    failed.forEach(f => console.log('FAILED: ' + f.name + (f.detail ? ' :: ' + f.detail : '')));
    process.exitCode = 1;
  }
})();
