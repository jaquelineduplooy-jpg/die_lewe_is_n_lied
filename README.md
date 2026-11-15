# Flip60 — Live Google Drive Photo & Video Reel (Island Style / Still On Fire look)

## What is ready

The redesigned `index.html` retains the familiar **Still On Fire / 31.12** editorial layout. The RSVP form and RSVP navigation were removed. A scannable QR code in the dark-navy story panel points to Flip's exact Google Drive folder. The site includes the existing ordered, 10-second photo reel, pause/resume, manually stepping left/right, and a fullscreen TV reel.

The site and independent Google Apps Script are configured for **Flip's own Drive folder**:

```
https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6?usp=drive_link
```

**Current configuration (15 November 2026):** The new Flip60 Google Apps Script URL was supplied by the organiser and is now set in `config.js`. No existing Don/Still On Fire application or its feed has been touched. Live Google endpoint checks failed from the ChatGPT execution environment due to blocked network DNS; this is **not** proof that the endpoint is broken. Real Google file counts and guest image/video permissions remain unverified and must be checked in `feed-check.html` from a normal signed-out browser.

## Published live feed — already configured

1. Use the script already deployed with the Google account that has permission to read Flip's folder; no need to create a second script.
2. The copy of `google-apps-script/Code.gs` is included for future maintenance. Ensure the Google Apps Script deployment uses matching code.
3. Optionally use `google-apps-script/appsscript.json` in Apps Script to limit the Drive permission to `drive.readonly`.
4. In the existing Apps Script project, run `testFlip60` if the diagnostic says the folder cannot be read. The execution log shows the file counts.
5. Confirm the existing deployment is **Web app → Execute as Me → Who has access: Anyone**. If permission changes or code changes are needed, use **Deploy → Manage deployments → Edit → New version → Deploy** to retain the same URL.
6. Open `https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec?mode=health` in a private/signed-out browser. It should respond with `"ok":true`, folder ID `10qytscu6v9hxoqTLKuNcfqvbfkvB31P6`, and non-zero photo/video counts if the folder contains media.
7. Open `feed-check.html`; the deployed URL is **pre-filled** and the check starts automatically. It checks counts and whether **real media thumbnails** load for visitors. If it shows failed images, check file/folder **viewing** permissions before distributing the site URL.
8. The `/exec` URL has been written to `config.js`. Publish this Flip60 folder as its **own** static site, never by overwriting Don's project.

If you later change `Code.gs`, use **Deploy → Manage deployments → Edit → New version → Deploy** to update the same URL; a source-code save alone does not update the published web app.

### Test direct endpoints

- Feed (JSON): `https://script.google.com/macros/s/YOUR-DEPLOYMENT/exec?mode=feed`
- Health (JSON): `https://script.google.com/macros/s/YOUR-DEPLOYMENT/exec?mode=health`
- Website feed: Google Apps Script JSONP with a validated callback (read-only).

Google's ContentService may redirect its output to `script.googleusercontent.com`. That is normal. The website uses JSONP with strict callback-name validation to avoid CORS restrictions. Do not use it for private data.

## Why viewing permissions matter

The Apps Script can read metadata using *your* Drive account. The actual photos/videos are loaded from Drive's public viewing URLs in *the guest's* browser. Those requests do not carry the Apps Script owner's authorization. As a result, **a green `ok:true` response alone does not prove guests can see the photos**. Use `feed-check.html` in a private/signed-out browser to test thumbnails.

Do not inadvertently expose personal or sensitive media. Put only approved photos in Flip's celebration folder. Providing a QR code to the folder does not automatically grant guests upload permissions; the Google Drive sharing settings determine who can upload.

## Reel behavior

- Every photo displays for **10 seconds**.
- **No shuffle.** The photo immediately to the right of the large centre photo becomes the next centre photo.
- The feed lists **all** supported image/video files in the folder and nested folders, sorted deterministically by Drive creation date, then name and ID. No arbitrary 10/14-item cap.
- The browser refreshes the list every **two minutes**, keeping the current photo when possible, and does not restart the reel on an unchanged feed.
- Pause/resume, previous/next, fullscreen TV view, and direct `?reel=tv` TV link remain available.
- Real Drive images replace the illustrative hero **once a viewable feed is connected**. For a specific preferred hero photo, add its file ID to `HERO_PHOTO_ID` in `config.js`, or name it starting with `hero` / `cover` / `voorblad`.
- Direct HTTPS MP4 files can autoplay in `<video>` when `videoUrl` is available. **Google Drive is not a dependable public MP4 streaming endpoint.** Drive video items display a poster, and guests click “Speel video hier” to open the embedded Drive video player; this pauses the reel while they watch, with an “Open in Drive” fallback. Don't promise silent video autoplay from standard Drive links.
- Until the `/exec` feed successfully loads, the reel shows a clearly labelled preview using the two supplied posters and one illustrative photo; it does **not** claim to show live Drive photos.

## Files

- `index.html` – complete redesigned website with QR block (no RSVP form)
- `styles.css` – established navy/cream editorial theme, with QR and video-player styling
- `app.js` – reel, full-screen player, Drive JSONP loader, refresh and image fallback
- `config.js` – exact Flip folder ID and the supplied published Google Apps Script /exec URL
- `feed-check.html` – browser-based real feed / thumbnail check
- `google-apps-script/Code.gs` – new read-only script
- `google-apps-script/appsscript.json` – least-privilege Drive read-only scope
- `assets/flip60-foto-album-qr.png` – QR linking to user-supplied folder
- `assets/flip60-*` posters – supplied artwork

## Verification and delivery status

The exact published `/exec` URL has been connected. Local tests use simulated photo/video responses and prove the website handles all files, order, refresh, QR, and TV controls, but **the actual live Google response and visitor image permissions cannot be independently verified from the current runtime**. Use `feed-check.html` in a signed-out browser and confirm image previews appear. Do not announce the feed live until this verification succeeds.

Neither the Don Vercel site nor its Drive feed is modified.


## V4 — Still On Fire-style MOVING FEED + LIVE REEL + QR

- The restored **moving filmstrip** (`#memoryTrack`) shows a real left-moving progression every 10 seconds, with the immediately right-adjacent image sliding to the centre. It is windowed to nine elements and works for arbitrarily large Drive feeds. No shuffling or 14-photo cap.
- The original large **Live Reel** remains below the moving strip, and is mirrored in the dedicated full-window TV mode (`?reel=tv`). Both use the same state, media and pause/previous/next controls.
- The **QR code is visible beside the Live Reel and inside the full-screen Live Reel**. It opens Flip's supplied Drive folder. Drive sharing settings determine who can add photos.
- The configured Apps Script `/exec` remains the user's supplied URL; Don's site and script are unchanged. Real Drive image permissions still require a signed-out browser test.


## V5: premium 1966 Island Style hero refresh (15 Nov 2026)

- The split hero now shows two original, tropical 1960s inspired photos: a vintage turquoise/cream Kombi with surfboards and an outdoor vinyl-party still life. Both are *illustrative AI artwork*, not archival photographs of Flip.
- Clickable KOMBI '66 / VINIEL & SEE switches and a gentle 8-second crossfade. Stops automatically for people who prefer reduced motion.
- Added postcard-style original 1966 badge and coral highlights on the hero, keeping the Still On Fire / 31.12 editorial structure.
- `AUTO_HERO_FROM_FEED` set false to prevent an arbitrary Google Drive image from replacing the commissioned hero art. **The Google Drive memory and TV reels remain live-configured and unchanged.**
- Drive access still must be checked in a signed-out browser to confirm real photographs load.
