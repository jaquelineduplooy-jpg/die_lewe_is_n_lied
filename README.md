# Flip60 V13 — final pre-launch website

**Purpose:** Flip se storie, portrait video avatar, moving memory strip, and separate fullscreen Live Reel. This is a story page, not a birthday invitation.

**Current settings:** 8 seconds per photo; the photo directly to the right becomes the next frame; sequential/no shuffle; full photo contained (with optional conservative black-matte cleanup via the Vercel image endpoint).

**Cleaner homepage:** the 3-button Memory Reel toolbar and second large Live Reel promotional panel have been removed. The photo-strip header has one discreet link to `live-reel.html`. Photo upload remains in the site navigation.

**V12 functionality preserved:** Nibble Sip Repeat advert on the standalone Live Reel, Flip's looping portrait YouTube avatar, Google Drive feed, upload link and read-only image processing.

## Deploy

1. Unzip **all files**, keeping `index.html`, `live-reel.html`, `vercel.json`, `package.json`, the `assets` directory and the `api`/`lib` directories together at the website project root.
2. Deploy the whole site to Vercel as a single project. `api/photo.js` requires the Node runtime and `sharp` dependency from `package.json`. The page still falls back to direct Google Drive thumbnails if the image endpoint is unreachable.
3. Verify `https://YOUR-SITE/live-reel` or `/live-reel.html` works with real images and the correct order (8 seconds), then test pause/resume.
4. From an incognito/guest phone, test the live upload link with a small test photo. The uploader only works after the *existing* Google Apps Script deployment is updated to a version that contains `google-apps-script/Code.gs` and `google-apps-script/Upload.html`.
5. Set an absolute Open Graph preview image URL when the public Flip60 domain is known (the included `og:image` currently uses a relative asset). Check the WhatsApp link preview before broad distribution.
6. Verify YouTube avatar playback on iPhone and Android. Mobile autoplay sound is subject to YouTube/browser restrictions.

**No change to Don's Still On Fire site or Google Drive feed.**

## Upload link

https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec?page=upload&key=-EA69j8zM0v3n7AMDfxw2A

The link permits upload-only by holders of the URL once the Apps Script is deployed with **Execute as Me / Anyone**. Share with trusted guests.

## Feed

Photo feed URL is in `config.js`. The Google Drive folder is the user's separate Flip60 folder. Refresh interval remains 2 minutes.

## Source limitation

The public Still On Fire website and original V33 source code could not be retrieved from this environment. V13 preserves the previously established sequential adjacent-photo movement and simplifies presentation; it is not a byte-for-byte copy of V33.
