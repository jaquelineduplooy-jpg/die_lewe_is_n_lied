(() => {
  'use strict';
  const config = window.FLIP60_CONFIG || {};
  const INTERVAL = Math.max(3000, Number(config.REEL_INTERVAL_MS) || 8000);
  const photoFeedUrl = String(config.PHOTO_FEED_URL || '').trim();
  const folderUrl = String(config.DRIVE_FOLDER_URL || 'https://drive.google.com/drive/folders/10qytscu6v9hxoqTLKuNcfqvbfkvB31P6?usp=drive_link');
  const phone = String(config.ORGANISER_WHATSAPP || '27723144350').replace(/\D/g, '');
  const $ = id => document.getElementById(id);
  // These are clearly labeled 1966 theme images, NOT photographs of Flip.
  // Replaced automatically by the Google Drive media feed when accessible.
  const fallback = [
    {id:'theme-1966-kombi',name:'Temakunswerk · Kombi 1966',caption:'TEMAVOORSKOU · WAG VIR FLIP SE FOTO’S',type:'image',image:'assets/flip-1966-kombi.webp',original:'assets/flip-1966-kombi.webp'},
    {id:'theme-jacarandas',name:'Temakunswerk · Somer 1966',caption:'TEMAVOORSKOU · WAG VIR FLIP SE FOTO’S',type:'image',image:'assets/story-summer-detail.webp',original:'assets/story-summer-detail.webp'},
    {id:'theme-vinyl',name:'Temakunswerk · Viniel & see',caption:'TEMAVOORSKOU · WAG VIR FLIP SE FOTO’S',type:'image',image:'assets/flip-1966-vinyl.webp',original:'assets/flip-1966-vinyl.webp'},
    {id:'theme-kombi-detail',name:'Temakunswerk · Die Kombi',caption:'TEMAVOORSKOU · WAG VIR FLIP SE FOTO’S',type:'image',image:'assets/story-kombi-detail.webp',original:'assets/story-kombi-detail.webp'},
    {id:'theme-vinyl-detail',name:'Temakunswerk · Plaatspeler',caption:'TEMAVOORSKOU · WAG VIR FLIP SE FOTO’S',type:'image',image:'assets/story-vinyl-detail.webp',original:'assets/story-vinyl-detail.webp'}
  ];
  let photos = fallback.slice();
  let currentIndex = 0;
  let paused = false;
  let tickId = null;
  let cycleStarted = 0;
  let elapsedWhenPaused = 0;
  let isFeedLoaded = false;
  let modalIsOpen = false;
  let videoNode = null;
  let refreshInFlight = false;
  let priorFocus = null;
  let currentVideoFrame = null;
  let tvVideoFrame = null;
  const defaultHeroSrc = document.querySelector('.hero-visual>img')?.getAttribute('src') || 'assets/flip-1966-kombi.webp';
  // Still On Fire-style sequential reel, with a stable set of film cells.
  // Recycle just one image per step instead of rebuilding all nine every 8 seconds.
  const filmTrack=$('memoryTrack'), filmWindow=$('filmWindow');
  const FILM_CENTER=3, FILM_COUNT=9, FILM_SLIDE_MS=790;
  let filmTransitionToken=0, filmAnimationTimeout=null;
  // Public Drive image normalizer. If Vercel cannot retrieve a public thumbnail,
  // each image automatically falls back to the untouched Drive URL.
  function photoSource(item){
    const direct=item.image;
    try {
      const input=new URL(direct,document.baseURI);
      if(!(input.hostname==='drive.google.com' && input.pathname==='/thumbnail'))return direct;
      if(!/^[A-Za-z0-9_-]{12,120}$/.test(item.id))return direct;
      const base=new URL(document.baseURI);
      if(!/^https?:$/.test(base.protocol))return direct;
      const endpoint=new URL('/api/photo',base);
      endpoint.searchParams.set('id',item.id);
      const key=input.searchParams.get('resourcekey');
      if(key)endpoint.searchParams.set('resourcekey',key);
      return endpoint.href;
    }catch(_){return direct;}
  }
  function setPhotoAmbient(element,url){
    if(element && url)element.style.setProperty('--photo-atmosphere',`url(${JSON.stringify(url)})`);
  }
  function attachImage(node,item,onLoad,onUnavailable){
    const direct=item.image, preferred=photoSource(item);
    let triedDirect=preferred===direct;
    node.dataset.itemId=item.id;
    node.alt=item.name;
    node.onload=()=>{if(onLoad)onLoad(node);};
    node.onerror=()=>{
      if(!triedDirect){triedDirect=true;node.src=direct;return;}
      node.onerror=null;
      if(onUnavailable)onUnavailable();else node.src='assets/flip-1966-kombi.webp';
    };
    node.src=preferred;
  }
  function frameShape(width,height){
    const ratio=width/height;
    if(ratio<.50)return 'is-tall';
    if(ratio<.87)return 'is-portrait';
    if(ratio<1.20)return 'is-square';
    return 'is-wide';
  }
  let recenterQueued=false;
  function recenterFilmIfIdle(){
    if(recenterQueued)return;
    recenterQueued=true;
    requestAnimationFrame(()=>{
      recenterQueued=false;
      if(!filmAnimationTimeout)setFilmPosition(FILM_CENTER,false);
    });
  }
  function makeFilmFrame(item,position){
    const frame=document.createElement('div');frame.className='film-frame';
    frame.dataset.itemId=item.id;
    if(position===FILM_CENTER)frame.classList.add('is-center');
    else if(Math.abs(position-FILM_CENTER)===1)frame.classList.add('is-near');
    frame.setAttribute('aria-label',item.name);
    const picture=document.createElement('div');picture.className='film-picture';
    const img=document.createElement('img');
    img.loading='eager';img.decoding='async';
    const filmItem={...item,image:item.image.replace(/([?&])sz=w\d+/,'$1sz=w1600')};
    attachImage(img,filmItem,loaded=>{
      if(loaded.naturalWidth&&loaded.naturalHeight){
        frame.classList.remove('is-tall','is-portrait','is-square','is-wide');
        frame.classList.add(frameShape(loaded.naturalWidth,loaded.naturalHeight));
        recenterFilmIfIdle();
      }
      setPhotoAmbient(picture,loaded.currentSrc);
    },()=>{
      img.hidden=true;frame.classList.add('film-image-unavailable');
      const unavailable=document.createElement('span');
      unavailable.className='film-unavailable';
      unavailable.textContent='FOTO KON NIE LAAI NIE';
      picture.appendChild(unavailable);
    });
    picture.appendChild(img);
    if(isVideo(item)){
      const badge=document.createElement('span');badge.className='film-frame-video';
      badge.textContent='▶ VIDEO';picture.appendChild(badge);
    }
    const caption=document.createElement('div');caption.className='film-frame-caption';
    caption.textContent=item.caption||item.name;
    caption.title=item.caption||item.name;
    frame.append(picture,caption);
    return frame;
  }
  function setFilmPosition(position,animated){
    if(!filmTrack || !filmWindow)return;
    const frame=filmTrack.children[position];
    if(!frame)return;
    const centeredOn=frame.offsetLeft+frame.offsetWidth/2;
    const x=Math.round(filmWindow.clientWidth/2-centeredOn);
    filmTrack.style.transition=animated?`transform ${FILM_SLIDE_MS}ms cubic-bezier(.22,.76,.22,1)`:'none';
    filmTrack.style.transform=`translate3d(${x}px,0,0)`;
  }
  function markFilmCenter(){
    if(!filmTrack)return;
    [...filmTrack.children].forEach((child,index)=>{
      child.classList.toggle('is-center',index===FILM_CENTER);
      child.classList.toggle('is-near',Math.abs(index-FILM_CENTER)===1);
    });
    filmTrack.children[FILM_CENTER]?.setAttribute('data-active-id',at(currentIndex).id);
  }
  function fillFilm(startIndex){
    if(!filmTrack||!photos.length)return;
    const nodes=[];
    for(let k=0;k<FILM_COUNT;k++)nodes.push(makeFilmFrame(at(startIndex+k-FILM_CENTER),k));
    filmTrack.replaceChildren(...nodes);
    const filmCount=$('filmCount');
    if(filmCount)filmCount.textContent=isFeedLoaded
      ? `${photos.length} FOTO'S EN VIDEO'S · LAAI OUTOMATIES`
      : '1966-TEMAVOORSKOU · WAG VIR DRIVE-FOTO’S';
  }
  function resetFilm(){
    if(!filmTrack)return;
    ++filmTransitionToken;
    clearTimeout(filmAnimationTimeout);
    filmAnimationTimeout=null;
    fillFilm(currentIndex);
    setFilmPosition(FILM_CENTER,false);
    markFilmCenter();
  }
  function shiftFilm(fromIndex,step){
    if(!filmTrack)return;
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(Math.abs(step)!==1||reducedMotion){resetFilm();return;}
    const token=++filmTransitionToken;
    // A quick double-click may interrupt a transition. Restore a coherent
    // starting sequence just for this case; normal playback recycles its cells.
    if(filmAnimationTimeout){
      clearTimeout(filmAnimationTimeout);
      filmAnimationTimeout=null;
      fillFilm(fromIndex);
      setFilmPosition(FILM_CENTER,false);
    }
    if(filmTrack.children.length!==FILM_COUNT){
      fillFilm(fromIndex);setFilmPosition(FILM_CENTER,false);
    }
    // The next photo is the immediately adjacent photo on the right.
    const target=FILM_CENTER+step;
    [...filmTrack.children].forEach((child,index)=>{
      child.classList.toggle('is-center',index===target);
      child.classList.toggle('is-near',Math.abs(index-target)===1);
    });
    void filmTrack.offsetWidth;
    setFilmPosition(target,true);
    filmAnimationTimeout=setTimeout(()=>{
      if(token!==filmTransitionToken)return;
      filmAnimationTimeout=null;
      // Preserve loaded photographs. Only introduce ONE new cell at the edge.
      if(step>0){
        filmTrack.firstElementChild?.remove();
        filmTrack.appendChild(makeFilmFrame(at(fromIndex+FILM_COUNT-FILM_CENTER),FILM_COUNT-1));
      }else{
        filmTrack.lastElementChild?.remove();
        filmTrack.prepend(makeFilmFrame(at(fromIndex-FILM_CENTER-1),0));
      }
      setFilmPosition(FILM_CENTER,false);
      markFilmCenter();
    },FILM_SLIDE_MS+30);
  }
  window.addEventListener('resize',()=>{if(filmTrack)resetFilm();},{passive:true});

  function wa(text) { return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`; }
  const chatLinks = {};
  Object.entries(chatLinks).forEach(([id, message]) => { const a=$(id); if(a) {a.href=wa(message);a.target='_blank';a.rel='noopener noreferrer';} });
  const driveAnchor=$('driveFolderLink'); if(driveAnchor) driveAnchor.href=folderUrl;
  const menuToggle=document.querySelector('.menu-toggle'), mobileNav=$('mobileNav');
  if(menuToggle&&mobileNav){
    menuToggle.addEventListener('click',()=>{const open=mobileNav.hidden; mobileNav.hidden=!open;menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Maak kieslys toe':'Maak kieslys oop');});
    mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileNav.hidden=true;menuToggle.setAttribute('aria-expanded','false');}));
  }
  // Always keep the next visual on the RIGHT immediately adjacent to the main photo.
  // Changing currentIndex by ONE moves that exact right-hand photo into the centre.
  const wrapIndex=i=>(i%photos.length+photos.length)%photos.length;
  const at=i=>photos[wrapIndex(i)];
  const isVideo=item=>item && (item.type==='video'||/^video\//.test(item.mimeType||''));
  function safeHttps(url){
    if(typeof url!=='string'||!url.trim()) return '';
    const v=url.trim();
    if(v.startsWith('assets/')) return v;
    try { const u=new URL(v); return u.protocol==='https:' ? u.toString() : ''; }catch {return '';}
  }
  function normalize(input,i){
    if(typeof input==='string') input={url:input};
    if(!input||typeof input!=='object') return null;
    const id=String(input.id||input.fileId||`item-${i}`);
    const mime=String(input.mimeType||input.mime||'');
    const type=input.type==='video'||mime.startsWith('video/')?'video':'image';
    let image=safeHttps(input.image||input.thumbnailUrl||input.thumbnail||input.imageUrl||input.src||input.url);
    if(!image && id && /^[\w-]{15,}$/.test(id))image=`https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w2400`;
    if(!image) return null;
    const orig=safeHttps(input.originalUrl||input.original||input.previewUrl||input.viewUrl||input.url)||image;
    return { id, name:String(input.name||input.title||`Herinnering ${i+1}`), caption:String(input.caption||input.name||`Herinnering ${i+1}`), type, mimeType:mime,
      image, original:orig, preview:safeHttps(input.previewUrl||input.viewUrl)||orig, video:safeHttps(input.videoUrl||input.streamUrl||''), createdAt:input.createdAt||'' };
  }
  function currentLabel(){return isFeedLoaded?`${currentIndex+1} / ${photos.length} HERINNERINGE`:'1966-TEMAVOORSKOU';}
  function updateImage(node,item){
    if(!node||!item)return;
    if(node.dataset.itemId===item.id && node.complete && node.naturalWidth)return;
    attachImage(node,item,loaded=>{
      const parent=loaded.closest('.reel-side,.tv-adj,.tv-main');
      setPhotoAmbient(parent,loaded.currentSrc);
      if(parent?.classList.contains('tv-main')){
        let backdrop=parent.querySelector('.tv-photo-backdrop');
        if(!backdrop){backdrop=document.createElement('div');backdrop.className='tv-photo-backdrop';parent.prepend(backdrop);}
        backdrop.style.backgroundImage=`url(${JSON.stringify(loaded.currentSrc)})`;
      }
    });
  }
  function brokenPhoto(container,item){
    const card=document.createElement('div');card.className='reel-error';
    const heading=document.createElement('strong');heading.textContent='Foto nie beskikbaar nie';
    const info=document.createElement('span');info.textContent='Kyk dat hierdie foto in Google Drive vir gaste sigbaar is.';
    const link=document.createElement('a');link.href=item.original;link.textContent='Bekyk in Google Drive ↗';link.target='_blank';link.rel='noopener noreferrer';
    card.append(heading,info,link);container.replaceChildren(card);
  }
  function stopEmbeddedVideo(){
    if(currentVideoFrame){currentVideoFrame.remove();currentVideoFrame=null;}
    if(tvVideoFrame){tvVideoFrame.remove();tvVideoFrame=null;}
  }
  function showDriveVideo(container,item,asTv=false){
    // Google Drive previews are not direct, autoplay-safe MP4 streams.
    // Present the in-page Drive player on explicit interaction only.
    if(!paused)togglePause();
    const frame=document.createElement('iframe');
    frame.className='video-iframe';frame.title='Flip60-video: '+item.name;
    frame.src=item.preview;frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';
    frame.allowFullscreen=true;frame.loading='eager';
    container.appendChild(frame);
    if(asTv){tvVideoFrame=frame;const placeholder=$('tvVideoPlaceholder');if(placeholder)placeholder.hidden=true;}
    else {currentVideoFrame=frame;const poster=container.querySelector('.video-poster-overlay');if(poster)poster.hidden=true;}
  }
  function createMainMedia(item,direction=0){
    const container=$('mainMedia');if(!container)return;
    const existing=container.querySelector(':scope > img');
    const oldPicture=direction!==0&&existing?.complete&&existing.naturalWidth?existing.currentSrc:'';
    const oldVideo=videoNode;videoNode=null;
    if(oldVideo){try{oldVideo.pause();oldVideo.removeAttribute('src');oldVideo.load();}catch(e){}}
    stopEmbeddedVideo();
    const ambient=document.createElement('div');ambient.className='reel-photo-backdrop';
    container.replaceChildren(ambient);
    function animateOnArrival(image){
      ambient.style.backgroundImage=`url(${JSON.stringify(image.currentSrc)})`;
      if(direction===0)return;
      const motion=direction>0?'next':'prev';
      image.classList.add('reel-arrive-'+motion);
      const departing=container.querySelector('.reel-old-ghost');
      if(departing){
        departing.classList.add('reel-depart-'+motion);
        window.setTimeout(()=>{departing.remove();},830);
      }
    }
    if(isVideo(item)&&item.video){
      const v=document.createElement('video');
      v.src=item.video;v.poster=photoSource(item);v.autoplay=!paused;
      v.muted=true;v.playsInline=true;v.loop=false;v.preload='metadata';v.controls=true;
      v.addEventListener('error',()=>{if(v.parentNode)showVideoPoster(container,item);},{once:true});
      container.appendChild(v);videoNode=v;
      if(!paused)v.play().catch(()=>{});
    }else if(isVideo(item)){
      showVideoPoster(container,item);
    }else{
      const image=document.createElement('img');image.loading='eager';image.decoding='async';
      container.appendChild(image);
      if(oldPicture){
        const ghost=document.createElement('div');ghost.className='reel-old-ghost';
        ghost.style.backgroundImage=`url(${JSON.stringify(oldPicture)})`;
        ghost.setAttribute('aria-hidden','true');container.appendChild(ghost);
      }
      attachImage(image,item,animateOnArrival,()=>{
        container.querySelector('.reel-old-ghost')?.remove();
        if(image.parentNode)brokenPhoto(container,item);
      });
    }
    const caption=document.createElement('div');caption.className='reel-caption';
    caption.id='mediaCaption';
    caption.textContent=(isVideo(item)?'▶ VIDEO · ':'')+(item.caption||'Flip se herinneringe');
    container.appendChild(caption);
  }
  function showVideoPoster(container,item){
    container.replaceChildren();
    const image=document.createElement('img');image.loading='eager';
    attachImage(image,item,loaded=>{const ambient=container.querySelector('.reel-photo-backdrop');if(ambient)ambient.style.backgroundImage=`url(${JSON.stringify(loaded.currentSrc)})`;});
    container.appendChild(image);
    const overlay=document.createElement('div');overlay.className='video-poster-overlay';
    const play=document.createElement('button');play.type='button';play.textContent='▶ Speel video hier';
    play.setAttribute('aria-label','Speel Drive-video: '+item.name);
    play.addEventListener('click',()=>showDriveVideo(container,item,false));
    const link=document.createElement('a');link.href=item.preview||item.original;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Of maak die video in Google Drive oop ↗';
    overlay.append(play,link);container.appendChild(overlay);
  }
  function preloadNeighbours(){
    [at(currentIndex+1),at(currentIndex+2)].forEach(item=>{
      if(!isVideo(item)) {const img=new Image();img.src=photoSource(item);}
    });
  }
  function chooseDriveHero(items){
    if(!config.AUTO_HERO_FROM_FEED) return;
    const all=items.filter(item=>item.type==='image');
    if(!all.length)return;
    const preferredId=String(config.HERO_PHOTO_ID||'').trim();
    const selected=all.find(item=>item.id===preferredId)||all.find(item=>/^(hero|cover|voorblad)[_\s-]/i.test(item.name))||all[0];
    const hero=document.querySelector('.hero-visual>img');if(!hero)return;
    const probe=new Image();
    probe.onload=()=>{hero.src=selected.image;hero.alt='Foto uit Flip se 60ste-herinneringevouer: '+selected.name;hero.classList.add('drive-hero');};
    probe.onerror=()=>{hero.src=defaultHeroSrc;hero.classList.remove('drive-hero');};
    probe.src=selected.image;
  }
  function render(direction=0){
    if(!photos.length)photos=fallback.slice();
    const previous=at(currentIndex-1), current=at(currentIndex), next=at(currentIndex+1);
    updateImage($('prevImage'),previous);updateImage($('nextImage'),next);
    createMainMedia(current,direction);
    const count=$('reelCount');if(count)count.textContent=currentLabel();
    updateImage($('tvPrevImage'),previous);updateImage($('tvNextImage'),next);
    const tvImage=$('tvImage'), tvVideo=$('tvVideoPlaceholder'), tvVideoLink=$('tvVideoLink');
    const tvMain=tvImage?.parentElement;
    const tvOldSrc=(direction!==0 && !isVideo(current) && tvImage && tvImage.complete && tvImage.naturalWidth)?tvImage.currentSrc:'';
    if(tvMain)tvMain.querySelectorAll('.tv-old-ghost').forEach(node=>node.remove());
    updateImage(tvImage,current);tvImage.hidden=false;
    if(tvImage){
      tvImage.classList.remove('tv-arrive-next','tv-arrive-prev');
      if(direction!==0 && !isVideo(current)){
        void tvImage.offsetWidth;
        const motion=direction>0?'next':'prev';
        tvImage.classList.add('tv-arrive-'+motion);
        if(tvOldSrc && tvMain){
          const departing=document.createElement('div');departing.className='tv-old-ghost reel-depart-'+motion;
          departing.style.backgroundImage=`url(${JSON.stringify(tvOldSrc)})`;
          departing.setAttribute('aria-hidden','true');tvMain.appendChild(departing);
          setTimeout(()=>{if(departing.parentElement)departing.remove();},850);
        }
      }
    }
    if(tvVideo){tvVideo.hidden=!isVideo(current);if(isVideo(current))tvVideoLink.href=current.preview||current.original;}
    const tvCount=$('tvCount');if(tvCount)tvCount.textContent=isFeedLoaded?`${currentIndex+1} / ${photos.length}`:'TEMAVOORSKOU';
    const tvFeed=$('tvFeedStatus');if(tvFeed)tvFeed.textContent=isFeedLoaded?'GOOGLE DRIVE · LIVE':'WAG VIR DRIVE-FEED';
    preloadNeighbours();
  }
  const progressNodes=[$('reelProgress'),$('tvProgress')].filter(Boolean);
  function setProgress(secondsElapsed=0){
    progressNodes.forEach(node=>{
      node.classList.remove('progress-running');node.style.animation='none';void node.offsetWidth;
      node.style.setProperty('--reel-duration',`${INTERVAL}ms`);
      node.style.animation='';
      if(secondsElapsed>0)node.style.animationDelay=`-${secondsElapsed}ms`;else node.style.animationDelay='0ms';
      node.classList.add('progress-running');node.style.animationPlayState=paused?'paused':'running';
    });
  }
  function schedule(remainingMs=INTERVAL){
    clearTimeout(tickId);tickId=null;
    if(paused)return;
    cycleStarted=performance.now()-Math.max(0,INTERVAL-remainingMs);
    tickId=window.setTimeout(()=>advance(1),Math.max(30,remainingMs));
  }
  function updatePauseUi(){
    const b=$('pauseSlide');if(b){b.innerHTML=paused?'▶ <span>Speel</span>':'Ⅱ <span>Pouse</span>';b.setAttribute('aria-label',paused?'Hervat reel':'Pouseer reel');b.setAttribute('title',paused?'Hervat':'Pouse');}
    const tb=$('tvPause');if(tb){tb.textContent=paused?'▶':'Ⅱ';tb.setAttribute('aria-label',paused?'Hervat volskerm-reel':'Pouseer volskerm-reel');}
    progressNodes.forEach(el=>el.style.animationPlayState=paused?'paused':'running');
    if(videoNode){if(paused)videoNode.pause();else videoNode.play().catch(()=>{});}
  }
  function advance(step){const fromIndex=currentIndex;currentIndex=wrapIndex(currentIndex+step);render(step);shiftFilm(fromIndex,step);elapsedWhenPaused=0;setProgress(0);schedule(INTERVAL);updatePauseUi();}
  function togglePause(){
    if(paused){paused=false;const remaining=Math.max(40,INTERVAL-elapsedWhenPaused);schedule(remaining);}else{elapsedWhenPaused=Math.min(INTERVAL,performance.now()-cycleStarted);paused=true;clearTimeout(tickId);tickId=null;}
    updatePauseUi();
  }
  $('prevSlide')?.addEventListener('click',()=>advance(-1));$('nextSlide')?.addEventListener('click',()=>advance(1));$('sidePrev')?.addEventListener('click',()=>advance(-1));$('sideNext')?.addEventListener('click',()=>advance(1));$('pauseSlide')?.addEventListener('click',togglePause);
  $('tvPrev')?.addEventListener('click',()=>advance(-1));$('tvNext')?.addEventListener('click',()=>advance(1));$('tvPause')?.addEventListener('click',togglePause);
  $('tvVideoPlay')?.addEventListener('click',()=>{const item=at(currentIndex);if(isVideo(item))showDriveVideo($('tvOverlay').querySelector('.tv-main'),item,true);});
  function openTv(){
    if(modalIsOpen)return;
    priorFocus=document.activeElement;modalIsOpen=true;
    const overlay=$('tvOverlay'); overlay.hidden=false;document.body.classList.add('tv-open');
    render();$('closeTv').focus();
  }
  function closeTv(){if(document.body.dataset.liveReelPage==='true'){window.location.href='index.html#herinneringe';return;}if(!modalIsOpen)return;modalIsOpen=false;if(tvVideoFrame){tvVideoFrame.remove();tvVideoFrame=null;} $('tvOverlay').hidden=true;document.body.classList.remove('tv-open');if(typeof priorFocus?.focus==='function')priorFocus.focus();}
  $('openTv')?.addEventListener('click',openTv);$('openTvFromQr')?.addEventListener('click',openTv);$('closeTv')?.addEventListener('click',closeTv);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&modalIsOpen){closeTv();return;}
    if(modalIsOpen&&(event.key==='ArrowRight'||event.key==='ArrowLeft')){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}
    if(modalIsOpen&&event.key===' '&&event.target.tagName!=='BUTTON'){event.preventDefault();togglePause();}
    if(modalIsOpen&&event.key==='Tab'){
      const controls=Array.from($('tvOverlay').querySelectorAll('button,a[href]')).filter(x=>!x.hidden);
      if(!controls.length)return;
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    }
  });
  if(new URLSearchParams(window.location.search).get('reel')==='tv' || document.body.dataset.liveReelPage==='true'){
    // TV link: a clean, full-browser reel — not a separate codebase.
    document.body.classList.add('tv-mode');openTv();
  }

  function setStatus(message){const status=$('feedStatus');if(status)status.textContent=message;}
  function testThumbnail(url){
    return new Promise(resolve=>{
      let settled=false;const probe=new Image();
      const finish=ok=>{if(settled)return;settled=true;clearTimeout(timeout);probe.onload=null;probe.onerror=null;resolve(ok);};
      const timeout=setTimeout(()=>finish(false),5500);
      probe.onload=()=>finish(true);probe.onerror=()=>finish(false);probe.src=url;
    });
  }
  function verifyGuestPreview(items,imageCount,videoCount){
    const testItems=items.filter(i=>i.type==='image').slice(0,3);if(!testItems.length)return;
    const fingerprint=items.map(i=>i.id).slice(0,3).join('|')+'|'+items.length;
    Promise.all(testItems.map(i=>testThumbnail(i.image))).then(results=>{
      if(!isFeedLoaded || fingerprint!==photos.map(i=>i.id).slice(0,3).join('|')+'|'+photos.length)return;
      const loaded=results.filter(Boolean).length;
      if(loaded===0)setStatus(`Drive lys ${items.length} items, maar die toetsfoto’s is nie publiek sigbaar nie. Kontroleer Drive-toegang.`);
      else if(loaded<results.length)setStatus(`Drive: ${imageCount} foto’s · ${videoCount} video’s. Net ${loaded}/${results.length} toetsfoto’s laai — kontroleer Drive-toegang.`);
      else setStatus(`LIVE · ${imageCount} foto’s · ${videoCount} video’s · ${loaded}/${results.length} toetsfoto’s sigbaar · elke 2 min verfris`);
    }).catch(()=>{});
  }
  function parseResponse(data){
    if(!data)return[];
    const list=Array.isArray(data)?data:(data.items||data.images||data.photos||[]);
    if(!Array.isArray(list))return[];
    // KEEP SOURCE ORDER: Never shuffle, randomize or use a subset/14-item cap.
    return list.map(normalize).filter(Boolean);
  }
  function fetchJsonp(url){
    return new Promise((resolve,reject)=>{
      const cb='flip60_feed_'+Date.now().toString(36)+'_'+Math.floor(Math.random()*999999).toString(36);
      const script=document.createElement('script');let complete=false;
      const clean=()=>{clearTimeout(timeout);delete window[cb];script.remove();};
      const finish=(error,data)=>{if(complete)return;complete=true;clean();error?reject(error):resolve(data);};
      const timeout=window.setTimeout(()=>finish(new Error('Photo feed timeout')),11000);
      window[cb]=data=>finish(null,data);
      const u=new URL(url);u.searchParams.set('callback',cb);u.searchParams.set('mode','feed');u.searchParams.set('t',Date.now().toString());script.src=u.toString();script.async=true;
      script.onerror=()=>finish(new Error('Photo feed script unavailable'));
      document.head.appendChild(script);
    });
  }
  async function loadFeed(){
    if(refreshInFlight)return;
    if(!photoFeedUrl){setStatus('Flip se Drive-vouer is ingestel, maar die live feed wag nog vir die nuwe Apps Script /exec-URL.');return;}
    refreshInFlight=true;
    try{
      const parsedUrl=new URL(photoFeedUrl);
      if(parsedUrl.protocol!=='https:')throw new Error('Onveilige feed-URL');
      let data;
      try{data=await fetchJsonp(photoFeedUrl);}catch(_){
        const response=await fetch(photoFeedUrl,{cache:'no-store',redirect:'follow'});
        if(!response.ok)throw new Error('Feed unavailable');data=await response.json();
      }
      if(data && data.ok===false)throw new Error(data.error||'Drive-feed het ’n fout teruggestuur');
      if(data && data.folderId && String(data.folderId)!==String(config.DRIVE_FOLDER_ID))throw new Error('Verkeerde Google Drive-vouer: kontroleer feed-URL');
      const items=parseResponse(data);
      if(!items.length)throw new Error('Geen foto’s of video’s gevind nie');
      const oldId=photos[currentIndex]?.id;
      const changed=items.length!==photos.length || items.some((item,i)=>item.id!==photos[i].id || item.image!==photos[i].image);
      photos=items;
      isFeedLoaded=true;
      if(changed){
        const retained=oldId?photos.findIndex(x=>x.id===oldId):-1;
        currentIndex=retained>=0?retained:0;
        render();resetFilm();
      }
      document.querySelector('.live-label')?.setAttribute('data-feed-live','true');
      chooseDriveHero(items);
      const imageCount=items.filter(item=>item.type==='image').length;
      const videoCount=items.length-imageCount;
      setStatus(`LIVE · ${imageCount} foto’s · ${videoCount} video’s · outomaties verfris elke 2 minute`);
      verifyGuestPreview(items,imageCount,videoCount);
    }catch(e){
      setStatus('Live-fotofeed kon nie laai nie — kyk die Apps Script-skakel of Drive se deelinstellings.');
      console.warn('Flip60 feed:',e.message);
    }finally{refreshInFlight=false;}
  }
  $('refreshFeed')?.addEventListener('click',loadFeed);
  render();resetFilm();setProgress();schedule(INTERVAL);updatePauseUi();
  loadFeed();
  if(photoFeedUrl){window.setInterval(loadFeed,Math.max(30000,Number(config.FEED_REFRESH_MS)||120000));}
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){clearTimeout(tickId);tickId=null;progressNodes.forEach(el=>el.style.animationPlayState='paused');if(videoNode)videoNode.pause();}
    else if(!paused){setProgress(0);schedule(INTERVAL);updatePauseUi();}
  });
})();
