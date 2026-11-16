/* Independent decorative 1966 hero slideshow; never controls or changes the Memory Reel. */
(function(){
  'use strict';
  const host=document.querySelector('[data-hero-carousel]');
  if(!host)return;
  const scenes=Array.from(host.querySelectorAll('img.hero-scene'));
  const tabs=Array.from(host.querySelectorAll('[data-hero-scene]'));
  if(scenes.length<2)return;
  const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected=0;
  let timer=null;
  function show(index){
    selected=(index+scenes.length)%scenes.length;
    scenes.forEach((scene,i)=>{
      const active=i===selected;
      scene.classList.toggle('is-active',active);
      scene.setAttribute('aria-hidden',String(!active));
      if(active)scene.removeAttribute('loading');
    });
    tabs.forEach((tab,i)=>{
      tab.classList.toggle('is-selected',i===selected);
      tab.setAttribute('aria-pressed',String(i===selected));
    });
  }
  function start(){
    if(timer){window.clearInterval(timer);timer=null;}
    if(!prefersReduced.matches){
      timer=window.setInterval(()=>{if(!document.hidden)show(selected+1);},12000);
    }
  }
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>{show(i);start();}));
  prefersReduced.addEventListener?.('change',start);
  show(0);
  start();
})();
