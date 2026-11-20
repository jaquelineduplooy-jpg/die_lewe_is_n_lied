# Flip60 V14 — Final website handoff

**Updated:** 2026-11-20

## Exact changes
- `index.html` avatar position now embeds final YouTube video `Goe1WM8Zf9Q` in a full-width responsive 16:9 player. `avatar.js` loops it muted and has a user-controlled sound button plus direct YouTube fallback.
- Nibble Sip Repeat photo-led advertisement replaces the older illustration in both Live Reel variants. Uses approved supplied imagery, editable webpage typography, and the correct outbound link `https://nibblesiprepeat.com/`.
- Removed a stray screenshot-text image artifact, kept advert footer neat.
- Retained V13 filmstrip and independent live reel: 8 s/photo, ordered transitions, image processing, full-screen control, user-upload link and Drive config.

## End-to-end launch dependencies
- YouTube playback, autoplay, loop and embed permission must be checked in a signed-out browser with normal internet access (YouTube inaccessible to local isolated QA). Browser autoplay with sound is restricted, so starts muted.
- Upload-only Google Apps Script feature must be redeployed with the included `google-apps-script/Code.gs` and `Upload.html` before the upload URL works.
- Real Google Drive thumbnail permissions and Vercel image-processing function need verification on deployed host.
- ZIP is not a live deployment. Deploy to a separate Flip60 project and verify before public announcement. Do not touch Still On Fire / Don.
