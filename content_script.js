(function () {
  'use strict';

  const BLOCK_SELECTORS = [
    'video',
    'iframe[src*="video"]',
    'iframe[src*="reels"]',
    'iframe[src*="watch"]',
    'a[href*="/reels/"]',
    'a[href*="/watch/"]',
    'a[href*="/stories/"]',
    'a[href*="/video/"]',
    '[aria-label*="Reels"]',
    '[aria-label*="Watch"]',
    '[aria-label*="Stories"]'
  ];

  function removeNode(node) {
    if (!node) return;
    try { node.remove(); }
    catch(e) {
      try { node.style.display='none'; node.style.visibility='hidden'; node.style.height='0px'; node.style.opacity='0'; } catch(_) {}
    }
  }

  function cleanSweep(root = document) {
    try {
      BLOCK_SELECTORS.forEach(sel => {
        root.querySelectorAll(sel).forEach(el => removeNode(el));
      });
    } catch(e){}
  }

  // MutationObserver to catch new content dynamically
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes?.forEach(n => cleanSweep(n));
    });
    cleanSweep(document);
  });

  observer.observe(document.documentElement, { childList:true, subtree:true });

  // Override fetch to block video API calls
  try {
    const origFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && /reels|watch|stories|video/.test(url)) return new Promise(()=>{}); // never resolves
      return origFetch.apply(this, args);
    };
  } catch(e){}

  // Override XHR to block video endpoints
  try {
    const origXhr = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method,url) {
      if (typeof url==='string' && /reels|watch|stories|video/.test(url)) { this.abort(); return; }
      return origXhr.apply(this, arguments);
    }
  } catch(e){}

  cleanSweep();

})();
