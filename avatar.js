/* Flip60 V9: YouTube Shorts avatar — vertical, muted autoplay, loop, tap for sound.
 * The YouTube embed works without the IFrame API. The API improves sound control.
 * If YouTube blocks embedding or network access, guests can open the source link.
 */
(() => {
  'use strict';
  const cfg = window.FLIP60_CONFIG || {};
  const id = String(cfg.AVATAR_YOUTUBE_ID || 'b_pDUOJ1tEs');
  if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return;
  const iframe = document.getElementById('flipAvatarYoutube');
  const soundButton = document.getElementById('avatarSoundButton');
  const note = document.getElementById('avatarSoundNote');
  const link = document.getElementById('avatarYoutubeLink');
  if (!iframe || !soundButton) return;
  const shortsUrl = 'https://youtube.com/shorts/' + id;
  if (link) link.href = shortsUrl;
  const params = new URLSearchParams({
    autoplay: '1', mute: '1', playsinline: '1', loop: '1', playlist: id,
    controls: '1', rel: '0', enablejsapi: '1'
  });
  // This is a public, creator-hosted video, not an MP4. Use the supported embed.
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?' + params;

  let player = null;
  let soundOn = false;
  let soundRequested = false;
  let ready = false;
  function updateButton(){
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.innerHTML = soundOn
      ? '<span aria-hidden="true">🔇</span> Demp Flip se klank'
      : '<span aria-hidden="true">🔊</span> Hoor Flip se woorde';
    if (note) note.textContent = soundOn
      ? 'Die video speel met klank en herhaal outomaties.'
      : 'Die video herhaal outomaties sonder klank. Tik hierbo om te luister.';
  }
  function controlPlayer(method) {
    if (ready && player && typeof player[method] === 'function') {
      try {player[method](); return true;} catch (e) {/* Use direct iframe command. */}
    }
    try {
      iframe.contentWindow?.postMessage(JSON.stringify({event:'command',func:method,args:[]}), 'https://www.youtube-nocookie.com');
      return true;
    } catch(e) {return false;}
  }
  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    soundRequested = true;
    controlPlayer(soundOn ? 'unMute' : 'mute');
    if (soundOn) controlPlayer('playVideo');
    updateButton();
  });
  updateButton();

  const priorReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    if (typeof priorReady === 'function') priorReady();
    if (!window.YT || !YT.Player) return;
    try {
      player = new YT.Player('flipAvatarYoutube', {
        events: {
          onReady: e => {
            ready = true;
            try {
              e.target.setLoop(true);
              if (soundRequested && soundOn) {
                e.target.unMute(); e.target.playVideo();
              } else if (!soundRequested) {
                e.target.mute(); e.target.playVideo();
              }
            } catch(err) {/* Player controls remain in iframe. */}
          },
          onStateChange: e => {
            if (window.YT && e.data === YT.PlayerState.ENDED) {
              // Extra fallback for YouTube embed implementations that ignore loop.
              try {e.target.seekTo(0);e.target.playVideo();} catch(err) {}
            }
          }
        }
      });
    } catch(err) {/* Native iframe still supports single-video looping. */}
  };
  if (window.YT && window.YT.Player) {
    window.onYouTubeIframeAPIReady();
  } else if (!document.querySelector('script[data-flip-yt-api]')) {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.dataset.flipYtApi = 'true';
    document.head.appendChild(script);
  }
})();
