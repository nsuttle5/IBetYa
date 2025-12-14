// Register service worker and handle UI selection + install prompt
(function(){
  'use strict';

  // UI: option buttons
  const opt1 = document.getElementById('opt1');
  const opt2 = document.getElementById('opt2');
  const content = document.getElementById('content');

  function selectOption(el){
    [opt1,opt2].forEach(b => {
      b.setAttribute('aria-selected', 'false');
    });
    el.setAttribute('aria-selected', 'true');
    content.querySelector('.lead').textContent = `You selected: ${el.textContent}`;
  }

  opt1.addEventListener('click', ()=> selectOption(opt1));
  opt2.addEventListener('click', ()=> selectOption(opt2));

  // Service worker registration
  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('sw.js').then(reg => {
        // registration successful
        console.log('ServiceWorker registered', reg.scope);
      }).catch(err => console.warn('SW registration failed', err));
    });
  }

  // beforeinstallprompt handling — store the event so we can trigger install
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
    // Optionally you could show a custom install button; for now we log
    console.log('beforeinstallprompt fired. Call deferredPrompt.prompt() to show install');
    // Example: to automatically prompt for install when user selects option 1
    opt1.addEventListener('click', async ()=>{
      if(deferredPrompt){
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log('User choice', choice);
        deferredPrompt = null;
      }
    }, { once: true });
  });

})();
