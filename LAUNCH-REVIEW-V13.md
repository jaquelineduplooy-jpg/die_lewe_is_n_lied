# Flip60 V13 — final review

## Changed
- Story-page memory strip is now the only inline photo reel; removed the 3-button toolbar (upload, refresh, live reel) and redundant large live-reel promo block.
- One discreet **BEKYK DIE LIVE REEL ↗** link in the filmstrip header opens `/live-reel.html`.
- Photo uploads stay accessible through the main navigation / mobile menu and `/foto-oplaai.html`; existing Google Script upload URL is unchanged.
- Reel dwell changed from 10 to **8 seconds** on both story and TV pages. Animated handoff slightly quicker (790 ms), still right-hand neighbour -> centre, chronological, no shuffle.
- Preserved the standalone Live Reel with Nibble Sip Repeat advert, Flip portrait YouTube avatar, and photo-processing code unchanged.
- Cache-busting versions updated to prevent serving older CSS/JS.

## Before going live
1. Deploy the entire `Flip60` directory as a single Vercel project; the Node function in `api/photo.js` must deploy too. Do not deploy an HTML preview by itself.
2. Open the site in an incognito browser and verify the live Google Drive images (the local QA uses sample media).
3. Test the exact upload URL with a small photo from a guest account not signed in as the Drive owner. The Google Apps Script upload code must have been published as a new version.
4. Confirm the official website domain so the absolute social share image / OG metadata can be configured before wide WhatsApp sharing.
5. Test the YouTube avatar's autoplay/mute and the sound button on both Android and iPhone; YouTube policies vary.
6. Keep Don's Still On Fire deployment and Google Drive feed unchanged.

The exact V33 Still On Fire source and public deployed page were not obtainable from this runtime. The sequence, next-right handoff and uncluttered presentation were preserved based on the approved project behavior; this is not a byte-identical code import.
