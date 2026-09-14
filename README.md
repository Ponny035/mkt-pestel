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

## Notes

- There's no login, so anyone with the link can edit or delete anything —
  the same trust model as sharing an editable Google Doc link.
- If Supabase isn't configured yet, the app falls back to a local demo (no
  sync) so you can still see how it looks.
