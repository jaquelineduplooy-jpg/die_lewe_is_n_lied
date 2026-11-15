/* FLIP60 LIVE GOOGLE DRIVE REEL
 * Photo source: Flip's folder, independent from Still On Fire / Don.
 * Deploy google-apps-script/Code.gs using the Google account with access to this folder.
 * Published Flip60 /exec URL configured below. Make sure signed-out thumbnail access is enabled.
 * Google must authorize that deployment; the Drive folder link alone is not an API endpoint.
 */
window.FLIP60_CONFIG = Object.freeze({
  PHOTO_FEED_URL: "https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec", // Flip60 published Google Apps Script endpoint (2026-11-15)
  DRIVE_FOLDER_ID: "10qytscu6v9hxoqTLKuNcfqvbfkvB31P6",
  DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6?usp=drive_link",
  ORGANISER_WHATSAPP: "27723144350", // vehicle permit / sharing photos, NOT RSVP
  REEL_INTERVAL_MS: 10000, // V33: 10s per image, deterministic right-hand handoff
  FEED_REFRESH_MS: 120000, // every two minutes
  AUTO_HERO_FROM_FEED: true, // replace illustrative hero with first available real Drive photo
  HERO_PHOTO_ID: "" // optional: preferred Drive file ID for Flip's hero picture
});
