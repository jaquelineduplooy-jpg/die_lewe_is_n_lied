/* Optional future video. Configure AVATAR_VIDEO_URL in config.js; blank shows the designed placeholder. */
(() => {
  'use strict';
  const url = (window.FLIP60_CONFIG && window.FLIP60_CONFIG.AVATAR_VIDEO_URL || '').trim();
  const video = document.getElementById('flipAvatarVideo');
  const placeholder = document.getElementById('avatarArt');
  const notice = document.querySelector('.avatar-coming-caption');
  if (!url || !video || !placeholder) return;
  // Only same-origin relative files and HTTPS videos are accepted.
  let valid = url.startsWith('assets/') || /^https:\/\//i.test(url);
  if (!valid) return;
  video.src = url;
  video.addEventListener('loadedmetadata', () => {
    video.hidden = false; placeholder.hidden = true;
    if (notice) notice.textContent = 'Druk speel om na Flip te luister';
  }, { once: true });
  video.addEventListener('error', () => {
    video.hidden = true; placeholder.hidden = false;
    if (notice) notice.textContent = 'Flip se video is nog nie beskikbaar nie';
  }, { once: true });
})();
