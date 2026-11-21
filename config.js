/* FLIP60 LIVE GOOGLE DRIVE REEL
 * Photo source: Flip's folder, independent from Still On Fire / Don.
 * Deploy google-apps-script/Code.gs using the Google account with access to this folder.
 * Published Flip60 /exec URL configured below. Make sure signed-out thumbnail access is enabled.
 * Google must authorize that deployment; the Drive folder link alone is not an API endpoint.
 */
window.FLIP60_CONFIG = Object.freeze({
  AVATAR_YOUTUBE_ID: "b_pDUOJ1tEs", // Flip Shorts (portrait). Autoplay muted and loop single video.
  PHOTO_FEED_URL: "https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec", // Flip60 published Google Apps Script endpoint (2026-11-15)
  PHOTO_UPLOAD_URL: "https://script.google.com/macros/s/AKfycbyquwgPZ35geFi2pL_u0VBgMkMb8pzzzSFBoCFHBUHWDWhaPrXkfBIw9DNG2lUu0IZ8sQ/exec?page=upload&key=-EA69j8zM0v3n7AMDfxw2A", // Active after updating the existing Google Apps Script deployment
  DRIVE_FOLDER_ID: "10qytscu6v9hxoqTLKuNcfqvbfkvB31P6",
  DRIVE_FOLDER_URL: "https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6?usp=drive_link",
  ORGANISER_WHATSAPP: "27723144350", // vehicle permit / sharing photos, NOT RSVP
  REEL_INTERVAL_MS: 8000, // V13: 8s per image; sequential right-neighbour handoff, no shuffle
  FEED_REFRESH_MS: 120000, // every two minutes
  AUTO_HERO_FROM_FEED: false, // preserve bespoke 1966 hero; Drive powers Oomblikke wat Bly
  PHOTO_ROTATION_OVERRIDES: {}, // file ID -> 90, 180 or 270 only if the source has no usable EXIF orientation
  HERO_PHOTO_ID: "" // optional: preferred Drive file ID for Flip's hero picture
});
