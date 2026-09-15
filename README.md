# PESTEL Board — setup

A live, multi-user PESTEL analysis board. Anyone with the link can add factors,
score them from risk to opportunity, and export the board as a PNG or PPTX.
Real-time sync runs through Supabase, so it works for anyone on the internet —
no Claude org membership needed.

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com), create a free project.
2. Open **SQL Editor**, paste the contents of `supabase-setup.sql`, and run it.
   This creates the `pestel_notes` table, opens it up to public read/write
   (no login — same trust model as a public FigJam link), and turns on
   realtime change streaming.
3. Open **Settings → API**. Copy the **Project URL** and the **anon public** key.

## 2. Configure the app

Open `config.js` and fill in the two values from step 1:

```js
window.PESTEL_CONFIG = {
  SUPABASE_URL: "https://xxxxxxxxxxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."
};
```

## 3. Try it locally

Open `index.html` directly in a browser, or serve the folder (e.g.
`npx serve .`). The status bar under the header should say "Live — synced
with everyone on this link." If it instead shows a Supabase error, double
check the URL/key and that the SQL ran without errors.

## 4. Put it online

Any static host works since this is plain HTML/CSS/JS with no build step —
drag the whole `pestel` folder onto one of these:

- **Netlify Drop** — [app.netlify.com/drop](https://app.netlify.com/drop)
- **Vercel** — `vercel` CLI, or import the folder from their dashboard
- **Cloudflare Pages** / **GitHub Pages** — also work

Whoever you send the resulting link to can open it and start editing —
changes, drags, and slider moves sync live for everyone with the page open.

## Backups: saving and restoring

**Save file** (top bar) downloads the current board as one self-contained
`.html` file — open it later with no internet, no Supabase, no server. Treat
it as a point-in-time backup.

**Load file** opens a previously saved `.html` snapshot as a **preview** —
it doesn't touch the shared Supabase board yet, so you can safely look
without risk. From there, the status bar gives you two choices:

- **Restore to live board** — replaces everyone's current data with the
  snapshot's. This deletes every row on the shared board first, so it asks
  for a confirmation and cannot be undone. Use it when the live board got
  messed up and you want to roll back to a known-good backup.
- **Return to live board** — discards the preview and reconnects to the
  live, synced board with no changes made.

## Notes

- There's no login, so anyone with the link can edit or delete anything —
  the same trust model as sharing an editable Google Doc link.
- If Supabase isn't configured yet, the app falls back to a local demo (no
  sync) so you can still see how it looks.

## Running the automated test

`test-e2e.js` is a Playwright end-to-end check covering Save, Load, the
Restore-to-live-board flow (against your real configured Supabase table —
it adds one uniquely-marked temp note, saves, deletes it, restores it,
then cleans it up), and all three exports (PNG, PDF, PPTX).

```
npm install
npx playwright install chromium   # first time only
npx serve . -l 4173               # in one terminal, leave running
npm test                          # in another terminal
```
