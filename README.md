# Flip se 60ste · Still On Fire / 31.12 design-language edition

This is the **revised high-fidelity design-language build** after the initial Island Style website was rejected. It uses the original 31.12 editorial page's visual structure as a reference: dark-navy + image hero, serif lettering, five-piece event strip, split light-story/dark-RSVP invitation, dark memory reel, physical turntable motif, day timeline, practical notes and a full-width closing panel.

**Important provenance:** The actual 31.12 HTML and CSS were available for inspection; the project library surfaced the Still On Fire V33 ZIP name but did not allow its bytes to be extracted. Consequently, this version **is not a byte-for-byte branch of the V33 ZIP**. The working ordered memory reel code carried across from the previous Flip60 preview remains in `app.js` and is not affected by the layout redesign. Do not replace or overwrite Don's existing site or photo feed.

## Open / deploy

- Open `index.html` locally (with the `assets/` subdirectory) for preview, or host the entire folder as a static project on Vercel, GitHub Pages, Netlify or any static web host.
- The deliverable also includes a standalone HTML file with embedded styles and image assets for easy preview.
- Upload a new Vercel project called `flip60` from this folder. **Do not overwrite `still-on-fire` or `boarding-card-for-don`.**

## Information and RSVP

- Saturday 21 November 2026, 17:00, Richardsbaai Skibootklub caravan park, Island Style.
- WhatsApp is addressed to Flip's number from the supplied information poster: `072 3144 350`.
- RSVP form opens a *draft WhatsApp message* with name, attendance and number of guests. The guest must still tap **Send** in WhatsApp. No message is sent silently, and no RSVP is recorded in a central database.
- The programme and vehicle, camping, chairs/glasses, drinks and club restrictions follow the two supplied posters.

## Connect the live Flip60 photo folder

The Drive folder is `10qytscu6v9hxoqTLKuNcfqvbfkvB31P6`.

1. Sign into the Google account that owns / has authorized access to that folder.
2. Open https://script.google.com and create a **new independent** Apps Script project.
3. Paste the contents of `google-apps-script/Code.gs` into the new project.
4. Deploy > New deployment > Web app > Execute as **Me** > Who has access: **Anyone**. Authorize if prompted.
5. Copy the public web-app URL ending in `/exec` to `PHOTO_FEED_URL` in `config.js`.
6. Grant appropriate viewing access to the photo files. Media previews fetched by a public website must be accessible to visitors. Do not share private media unintentionally.

The read-only script pulls full image/video metadata, sorts deterministically by creation time and file ID, and returns JSONP for cross-origin use. It does **not** shuffle or arbitrarily cap the photo list.

### Reel behaviour

- Main photo transitions every **10,000 milliseconds**.
- Exactly the photo immediately to the right becomes the next centre image.
- Previous / next and pause / resume work on the main reel and fullscreen TV view.
- `?reel=tv` opens the fullscreen presentation.
- Live feed refreshes every two minutes (if configured), retaining the current slide when possible.
- Image `object-fit: contain` preserves visual content and avoids cropping into faces.
- Google Drive videos are presented as thumbnails with a link to their Drive video unless a usable, embeddable MP4 URL is provided. Google Drive does not reliably support autoplay streaming as a direct `<video>` URL. Do not claim continuous video autoplay until such a media endpoint is connected.

The photo feed URL is empty by default. Until activated the site transparently displays the **invitation, information poster and an Island Style illustration as preview images**, not live photos.

## Files

- `index.html` — full revised page, in Afrikaans
- `styles.css` — 31.12 / Still On Fire editorial styling
- `app.js` — existing working Flip60 memory feed, carousel and fullscreen logic
- `rsvp.js` — WhatsApp RSVP
- `config.js` — separate Drive feed and organiser configuration
- `google-apps-script/Code.gs` — read-only Flip60 photo feed
- `assets/flip60-uitnodiging.jpeg`, `assets/flip60-belangrike-inligting.jpeg` — original user-provided posters
- `assets/flip-coastal-hero.jpg` — illustrative Island Style coastal hero, not a photograph of Flip

### Publishing status

No remote project was updated. `still-on-fire.vercel.app` and the existing Don invitation have not been changed.
