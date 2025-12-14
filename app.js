// Register service worker and handle UI selection + install prompt
(function(){
  'use strict';

  // UI: dynamic options (easily configurable)
  const content = document.getElementById('content');
  const optionsContainer = document.getElementById('options');
  const confirmBtn = document.getElementById('confirm-btn');

  // CONFIG: Change these values to customize option text and percentages easily
  // Each option can have: id, title, percentage (number 0-100), and optional selectLabel
  const OPTIONS = [
    { id: 'opt1', title: 'Option 1', percentage: 60, selectLabel: 'Choose' },
    { id: 'opt2', title: 'Option 2', percentage: 40, selectLabel: 'Choose' }
  ];

  // Ensure percentages sum to 100. If not, normalize them proportionally and fix rounding.
  function normalizePercentages(opts){
    const total = opts.reduce((s,o)=>s + Number(o.percentage || 0), 0);
    if(total === 100) return opts;
    if(total === 0){
      // give equal share
      const share = Math.floor(100 / opts.length);
      opts.forEach((o,i)=> o.percentage = (i === opts.length - 1) ? 100 - share * (opts.length - 1) : share);
      return opts;
    }
    // scale and round; fix last item to ensure sum === 100
    let acc = 0;
    opts.forEach((o, i) => {
      if(i < opts.length - 1){
        o.percentage = Math.round((o.percentage / total) * 100);
        acc += o.percentage;
      } else {
        o.percentage = 100 - acc;
      }
    });
    return opts;
  }

  let options = normalizePercentages(JSON.parse(JSON.stringify(OPTIONS)));
  let selectedId = null;

  function renderOptions(){
    if(!optionsContainer) return;
    optionsContainer.innerHTML = '';
    options.forEach(opt => {
      const item = document.createElement('div');
      item.className = 'option';
      item.setAttribute('role', 'listitem');
      item.dataset.id = opt.id;

      const top = document.createElement('div');
      top.className = 'option__top';

      const title = document.createElement('div');
      title.className = 'option__title';
      title.textContent = opt.title;

      const pct = document.createElement('div');
      pct.className = 'option__percentage';
      pct.textContent = `${opt.percentage}%`;

      top.appendChild(title);
      top.appendChild(pct);

      const actions = document.createElement('div');
      actions.className = 'option__actions';

  const selectBtn = document.createElement('button');
  selectBtn.className = 'select-btn';
  selectBtn.type = 'button';
  // visually empty box; keep accessible label for screen readers
  selectBtn.textContent = '';
  selectBtn.setAttribute('aria-label', opt.selectLabel ? `${opt.selectLabel} ${opt.title}` : `Select ${opt.title}`);
  selectBtn.dataset.id = opt.id;
      selectBtn.addEventListener('click', () => {
        // mark selected
        selectedId = opt.id;
        // visual
        Array.from(optionsContainer.querySelectorAll('.select-btn')).forEach(b => b.classList.remove('selected'));
        selectBtn.classList.add('selected');
        // enable confirm
        if(confirmBtn) confirmBtn.disabled = false;
      });

      actions.appendChild(selectBtn);

      item.appendChild(top);
      item.appendChild(actions);

      optionsContainer.appendChild(item);
    });
  }

  // Confirm action
  if(confirmBtn){
    confirmBtn.addEventListener('click', ()=>{
      if(!selectedId) return;
      const opt = options.find(o => o.id === selectedId);
      if(!opt) return;
      // show selection in the content area
      const lead = content.querySelector('.lead');
      if(lead) lead.textContent = `You selected: ${opt.title} (${opt.percentage}%)`;
      // Optionally, you could lock selection or perform further actions here
    });
  }

  // initial render
  renderOptions();

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
    // Keep the deferredPrompt object; if you add a platform install button, call deferredPrompt.prompt() from it.
  });

  // iOS Add-to-Home-Screen hint
  // iOS doesn't support the beforeinstallprompt event — show a small hint instructing users how to "Add to Home Screen".
  const iosInstallEl = document.getElementById('ios-install');
  const iosInstallClose = document.getElementById('ios-install-close');

  function isIos(){
    const ua = window.navigator.userAgent || '';
    return /iphone|ipad|ipod/i.test(ua);
  }

  function isInStandaloneMode(){
    return (window.navigator.standalone === true) || window.matchMedia('(display-mode: standalone)').matches;
  }

  function showIosHintIfNeeded(){
    if(!iosInstallEl) return;
    if(isIos() && !isInStandaloneMode() && !localStorage.getItem('ios-install-dismissed')){
      iosInstallEl.setAttribute('aria-hidden', 'false');
      iosInstallEl.classList.add('visible');
    }else{
      iosInstallEl.setAttribute('aria-hidden', 'true');
      iosInstallEl.classList.remove('visible');
    }
  }

  // Wire the close button to dismiss permanently (per-device)
  if(iosInstallClose){
    iosInstallClose.addEventListener('click', ()=>{
      localStorage.setItem('ios-install-dismissed', '1');
      if(iosInstallEl){
        iosInstallEl.setAttribute('aria-hidden', 'true');
        iosInstallEl.classList.remove('visible');
      }
    });
  }

  // Show/hide on load and when returning from the background (or when installed)
  window.addEventListener('load', showIosHintIfNeeded);
  window.addEventListener('pageshow', showIosHintIfNeeded);
  document.addEventListener('visibilitychange', showIosHintIfNeeded);

})();
