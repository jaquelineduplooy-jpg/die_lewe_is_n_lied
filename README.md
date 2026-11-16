# Flip60 — Flip se Storie (V7.2 — Full-Photo Memory Reel Fix)

A responsive story website inspired by the original *Still On Fire / 31.12* UX, redesigned to follow the song **“Talent is permanent. En die lewe is 'n lied.”**

## What this is

- An **Afrikaans story page** about Flip: 1966, his mischievous spirit, friendship, facing life's curveballs, and the love that lasts.
- **No RSVP, invitation, venue/directions, dress code, schedule, or event logistics.**
- A prominently reserved **avatar/video** area under the hero.
- Moving Memory Reel + large slideshow + fullscreen TV Reel with permanent Google Drive QR.
- Photos advance **every 10 seconds**, in source order. The adjacent photo on the right moves into centre; no random shuffle.
- New Drive media is polled every 2 minutes; video items play via Google's embedded preview when clicked.
- The official media feed is independent of Don's Still On Fire site.

## Run and deploy

This is a static website. Upload the whole folder to Vercel or use a static HTTP server:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080/` from inside this folder.

The Google Drive feed is configured in `config.js` to:
`https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec`

The album QR points to:
`https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6?usp=drive_link`

**Important:** Drive access must be enabled for the guests who will view images. Sharing a folder link alone does not grant anonymous thumbnail access. Use `feed-check.html` to test image accessibility in a signed-out browser. The themed retro images are clearly labeled *temavoorskou* and are only fallback visuals until the live feed loads; they are not photos of Flip.

## Add Flip's video/avatar later

Put a real file named `flip-avatar.mp4` in `assets/`, then edit `config.js`:

```js
AVATAR_VIDEO_URL: "assets/flip-avatar.mp4",
```

Reload the site. The placeholder changes into a real video player after metadata loads. No video is synthesized or falsely attributed to Flip.

## Notes

- No music is bundled or played. The animated vinyl is purely decorative.
- `google-apps-script/Code.gs` is provided as a copy of the existing read-only feed script. It is not redeployed by the website ZIP.
- The connected live endpoint is maintained, but its real Drive response could not be checked in the execution sandbox, which lacks access to Google's servers.
- No changes have been made to Don's original projects.

## V7.2 No-crop reel repair (16 November 2026)
- Filmstrip photos now use `object-fit: contain` inside a dedicated image compartment.
- Captions occupy their **own 30–32px row** below the photo, never covering any faces, feet, or edges.
- The main Live Reel has the same separated caption row; TV/side preview images use `contain` as well.
- The moving strip **recycles its current eight cells** and adds only one new cell per 10-second transition; it does not recreate the entire strip on every tick.
- The handoff always advances the immediately adjacent photo on the right. No shuffle. The Drive feed URL, 2-minute refresh, fullscreen QR, and existing video support are unchanged.
- Versioned CSS/JS links help avoid the old V7.1 assets lingering in browser caches after redeployment.
- QA: desktop and mobile browser runs with generated landscape, portrait, square, panoramic and tall-portrait test images; captions do not overlap pictures, adjacent handoff and fullscreen QR pass; timed automatic transition at 10 seconds passes. Google Drive live photo access cannot be confirmed from this offline environment.

**Deployment:** Replace the existing Flip60 website files on the deployment with this entire V7.2 folder (not just the stylesheet). If your online site still displays cropped images afterward, confirm the latest deployment is live and hard-refresh the browser. Don's website is not modified.
