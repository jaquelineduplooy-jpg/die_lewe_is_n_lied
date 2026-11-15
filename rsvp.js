// RSVP uses the organiser's known WhatsApp number only; no fake backend writes.
(() => {
  'use strict';
  const count = document.getElementById('guestCount');
  const form = document.getElementById('rsvpForm');
  const status = document.getElementById('rsvpStatus');
  const getNumber = () => Math.min(50, Math.max(1, Math.round(Number(count?.value) || 1)));
  document.getElementById('countMinus')?.addEventListener('click', () => {count.value = Math.max(1, getNumber()-1);});
  document.getElementById('countPlus')?.addEventListener('click', () => {count.value = Math.min(50, getNumber()+1);});
  const radios = [...document.querySelectorAll('[name="response"]')];
  const sync = () => { const no=radios.find(x=>x.checked)?.value==='no'; count.disabled=no; count.parentElement.classList.toggle('disabled',no); };
  radios.forEach(x=>x.addEventListener('change',sync)); sync();
  form?.addEventListener('submit', e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    const name=String(document.getElementById('guestName').value||'').trim();
    if(!name){status.textContent='Vul asseblief jou naam en van in.';return;}
    const yes=radios.find(x=>x.checked)?.value!=='no';
    const message=yes
      ?`Hallo Flip! Dis ${name}. Ons kom graag saam jou 60ste vier op 21 November om 17:00 by die Richardsbaai Skibootklub. Aantal mense: ${getNumber()}. Sien jou daar!`
      :`Hallo Flip! Dis ${name}. Baie dankie vir die uitnodiging na jou 60ste, maar ek kan ongelukkig nie die viering bywoon nie. Veels geluk!`;
    const url=`https://wa.me/27723144350?text=${encodeURIComponent(message)}`;
    status.textContent='WhatsApp maak oop met jou antwoord. Tik “Stuur” in WhatsApp om dit aan Flip te stuur.';
    const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();
  });
})();
