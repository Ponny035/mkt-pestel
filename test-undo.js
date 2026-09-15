const { chromium } = require('playwright');

const MARK1 = 'UNDOTEST_BTN_' + Date.now();
const MARK2 = 'UNDOTEST_CTRLZ_' + Date.now();
const results = [];
function report(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log((ok ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ' :: ' + detail : ''));
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', String(e)));

  await page.goto('http://localhost:4173/');
  await page.waitForSelector('#board .column');
  await page.waitForFunction(() => document.querySelector('#statusBar').textContent.includes('Live'));

  // ---- test 1: undo via button ----
  await page.click('.column[data-cat="EN"] .add-note');
  await page.waitForTimeout(300);
  const ta1 = page.locator('.column[data-cat="EN"] .note-text').last();
  await ta1.fill(MARK1);
  await ta1.blur();
  await page.waitForTimeout(1000);
  report('note 1 created', (await page.locator('#board').textContent()).includes(MARK1));

  const card1 = page.locator('.note', { hasText: MARK1 });
  await card1.locator('.note-del').click();
  await page.waitForTimeout(300);
  report('note 1 removed from board immediately', !(await page.locator('#board').textContent()).includes(MARK1));
  const toastText1 = await page.locator('#toast').textContent();
  report('toast shows Undo action', /Undo/i.test(toastText1), toastText1);

  await page.click('.toast-action');
  await page.waitForTimeout(1200);
  report('note 1 restored after clicking Undo', (await page.locator('#board').textContent()).includes(MARK1));

  // cleanup note 1 for real (no undo this time)
  await page.locator('.note', { hasText: MARK1 }).locator('.note-del').click();
  await page.waitForTimeout(300);
  await page.waitForTimeout(8200); // let the 8s undo window fully expire so it's really gone
  report('note 1 permanently gone after undo window expires', !(await page.locator('#board').textContent()).includes(MARK1));

  // ---- test 2: undo via Ctrl+Z ----
  await page.click('.column[data-cat="EN"] .add-note');
  await page.waitForTimeout(300);
  const ta2 = page.locator('.column[data-cat="EN"] .note-text').last();
  await ta2.fill(MARK2);
  await ta2.blur();
  await page.waitForTimeout(1000);

  const card2 = page.locator('.note', { hasText: MARK2 });
  await card2.locator('.note-del').click(); // focus naturally lands on this <button>, matching real usage
  await page.waitForTimeout(300);
  report('note 2 removed from board', !(await page.locator('#board').textContent()).includes(MARK2));

  await page.keyboard.press('Control+z');
  await page.waitForTimeout(1200);
  report('note 2 restored via Ctrl+Z', (await page.locator('#board').textContent()).includes(MARK2));

  // ---- test 3: Ctrl+Z inside a textarea must NOT trigger note-restore undo (native text undo instead) ----
  await page.click('.column[data-cat="L"] .add-note');
  await page.waitForTimeout(300);
  const ta3 = page.locator('.column[data-cat="L"] .note-text').last();
  await ta3.click();
  await ta3.type('hello');
  // delete note 2 again, so lastDeleted is set to note 2
  await page.locator('.note', { hasText: MARK2 }).locator('.note-del').click();
  await page.waitForTimeout(300);
  // now focus back into the still-open textarea (note 3, unrelated) and press Ctrl+Z there
  await ta3.click();
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(400);
  const stillGone = !(await page.locator('#board').textContent()).includes(MARK2);
  report('Ctrl+Z inside a textarea does not resurrect an unrelated deleted note', stillGone);

  // final cleanup: remove the note-3 scratch card and let note 2's delete commit for real
  const noteId3 = await ta3.evaluate(el => el.dataset.id);
  await page.locator('.note[data-id="' + noteId3 + '"] .note-del').click();
  await page.waitForTimeout(9000); // let both pending deletes fully commit

  const finalBoard = await page.locator('#board').textContent();
  report('final cleanup: no test markers remain on live board', !finalBoard.includes('UNDOTEST'));

  console.log('\n--- SUMMARY ---');
  const failed = results.filter(r => !r.ok);
  console.log(results.length + ' checks, ' + failed.length + ' failed');
  if (failed.length) process.exitCode = 1;

  await browser.close();
})();
