/* FLIP60 — CONFIGURATION
 * Photo feed setup:
 * 1. Create a NEW Apps Script project using google-apps-script/Code.gs in this ZIP.
 * 2. Deploy as Web App (execute as owner; access anyone with the link).
 * 3. Paste its /exec URL below. Never reuse Don's Still On Fire script URL.
 */
window.FLIP60_CONFIG = Object.freeze({
  PHOTO_FEED_URL: "", // <-- paste the NEW Flip60 Google Apps Script /exec URL
  DRIVE_FOLDER_ID: "10qytscu6v9hxoqTLKuNcfqvbfkvB31P6",
  DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6?usp=drive_link",
  EVENT_NAME: "Flip se 60ste – Island Style",
  ORGANISER_WHATSAPP: "27723144350",
  REEL_INTERVAL_MS: 10000, // V33 requirement: 10 seconds per photo/reel beat
  FEED_REFRESH_MS: 120000 // refresh photo list without interrupting the active frame
});
