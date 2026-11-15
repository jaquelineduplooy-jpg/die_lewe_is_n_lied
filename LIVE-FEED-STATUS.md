# Flip60 — live Google Apps Script connection

**Connected endpoint:** `https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec`

**Drive folder ID:** `10qytscu6v9hxoqTLKuNcfqvbfkvB31P6`

**Website configuration:** `config.js` has `PHOTO_FEED_URL` set to the published endpoint.

**Real Google response:** Not independently verified from this execution environment; external Google requests failed due to DNS/network restrictions. This is not a verdict on the script.

**How to confirm on a normal network (signed out):** Open `feed-check.html` in a browser. It automatically tests the published endpoint and the first 3 photo thumbnails, checks the folder ID, and reports the number of images and videos. It must show `Feed werk` and 3/3 visible photos. Then open `index.html` and confirm the LIVE label and actual Flip photos appear.

**Security:** The Apps Script response contains media metadata; guests need separate viewing permissions for the returned media files. Do not make private files public without their owners' permission.

**Reel:** 10 seconds per image; no shuffle; next right-adjacent image moves to the main position; pause, left/right, TV fullscreen, refresh 2 minutes; Google Drive videos use an embedded player after clicking.

**Separate from Don:** No Don project, media feed, or Vercel deployment was modified.
