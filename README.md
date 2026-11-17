# Flip60 V9 — Flip se YouTube-avatar + V8 Memory Reel

This is a complete **Flip60** story website. It keeps Flip's 1966 hero,
Afrikaans narrative, Flip’s looping portrait YouTube Short, QR code, and both reels.

## What changed in V9

- Replaced avatar placeholder with Flip’s YouTube Short (`b_pDUOJ1tEs`).
- Uses a true 9:16 vertical frame on desktop and mobile, without cropping.
- Video starts muted (required by browser autoplay rules), loops continuously using playlist+loop=1, and includes a sound button and a link to the source Short.
- The previous V8 Memory Reel (Drive feed, moving strip, QR, TV player and photo processing) is unchanged.

## What was already changed in V8

- Removed the buggy V7.3 blur/grid treatment that damaged landscape image layout.
- Both portrait and landscape photos now use a single, uncropped foreground in the
  large viewer, plus a quiet ambient background and a *separate caption row*.
- The moving filmstrip changes width according to each image's real orientation,
  and retains the original right-photo-becomes-centre, 10-second order.
- Added an optional **read-only Vercel photo normalizer** (`api/photo.js` and
  `lib/photo-processing.js`) to trim large, nearly solid black matte bars
  embedded in WhatsApp-style screenshots. It does **not** crop actual photo
  content or modify files in Drive.
- If the normalizer cannot retrieve a public Drive thumbnail, the browser falls
  back to the original Google Drive image. This gracefully degrades but leaves
  black bars already embedded in screenshots unchanged.
- Video playback, pause/resume, fullscreen QR, feed refresh and the existing
  Google Apps Script source are preserved.

## Setup

1. Keep the **contents of this folder together** in a Vercel project. The site
   uses a static `index.html` and a Node serverless route at `/api/photo`.
2. Deploy the folder to Vercel with the provided `package.json`. Vercel must
   install the `sharp` dependency for server-side screenshot matte cleanup.
3. Your existing Flip60 Google Apps Script URL is already in `config.js`.
4. Use `https://your-site.vercel.app/?reel=tv` to open the fullscreen reel.
5. Test with a signed-out browser to confirm the real Google Drive thumbnails
   are publicly accessible to visitors.

## Important

- Original Drive photo files are not changed or deleted.
- The Google Drive folder is separate from Don's Still On Fire website.
- The original Still On Fire V33 source archive could not be extracted in this
  session, so this is a repaired Flip60 implementation, **not a byte-for-byte
  reproduction** of V33.
- Black matte detection has been tested using simulated WhatsApp images;
  production Drive-to-Vercel image access still needs verification after deployment.

## Tests

- `tests/test-image-processor.js` — makes sure normal photos are unchanged and
  WhatsApp-style black bars are removed without cutting off the image.
- `tests/browser-test.py` — Chromium-based simulated 94-item feed, testing
  landscape/portrait/screenshot rendering, 10-second transitions, live viewer,
  QR, pause, mobile and fullscreen.

The `tests/` folder is development-only and can be omitted when deploying.
