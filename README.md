# Flip60 V16 — Oomblikke wat Bly

**Vervang die huidige webwerf; moenie 'n nuwe Flip60-projek skep nie.** Die nuwe weergawe behou die hele V15-ontwerp en die twee YouTube-video's, en vervang slegs die herinneringsreel se naam, sortering, onderskrifte en outomatiese EXIF-oriëntasiehantering.

- Nuutste Google Drive-oplaaie eerste; geen skommeling nie; 8 sekondes per foto
- Geen lêername onder die foto's nie; die bykomende aanwysingsin verdwyn
- Outomatiese vertoonregstelling wanneer EXIF-oriëntasiedata bestaan; Drive-lêers word nie verander nie
- Die groot Live Reel en Nibble Sip Repeat-advertensie bly soos tevore
- Die bestaande RemoveDuplicates.gs moet ongewysig bly

**Lees `VERVANG-V16.txt` vir volledige vervangingsinstruksies, insluitend die bestaande Google Apps Script-ontplooiing.**

---

# Flip60 V15 FINAL — Two Videos + Nibble Sip Repeat

The portrait avatar and the final film are TWO SEPARATE videos: `b_pDUOJ1tEs` remains in **Flip sê dit self**; `Goe1WM8Zf9Q` replaces ONLY the vinyl/CD player in the purple **Liefhê sonder einde** panel.

Nibble Sip Repeat's photo-led promotional panel is in the separate `live-reel.html` page (and fullscreen reel). Flip's 8-second memory filmstrip, Google Drive configuration, upload link and the rest of the design are preserved.

Deploy this extracted folder as a replacement in the *existing Flip60 Vercel project*. The `package.json` includes the `sharp` dependency for `/api/photo` image processing. Check both YouTube embeds, the Drive feed and public uploads on the deployed URL.

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

## V14 — Nibble Sip Repeat editorial advert

- The Nibble Sip Repeat promo in both Live Reel entry points uses the approved photographic concept and warm cream, terracotta, plum, and gold palette.
- The design is responsive; the mobile player uses a slim wordmark and CTA banner.
- The artwork is a crop of the user-approved image; original Flip photo feed, 8-second interval, avatar and upload flow are untouched.
- The JOIN THE SECRET LIST link goes to https://nibblesiprepeat.com/ (site root).

## V14 — Final video + approved Nibble Sip Repeat advert

- Final YouTube video: https://www.youtube.com/watch?v=Goe1WM8Zf9Q in the `Flip se` video section, 16:9; loops muted with optional audio.
- Live Reel advert uses approved people-at-sunset photograph and brand styling; links to https://nibblesiprepeat.com/.
- No changes to photo feed, reel logic, upload form, 8-second interval, or story chapters. See LAUNCH-REVIEW-V14.md for prelaunch caveats.
