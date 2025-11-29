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

  function hideVideoOnly(node) {
    if (!node) return;
    try {
      if (node.tagName === 'VIDEO' || node.tagName === 'IFRAME') {
        node.remove();
        return;
      }
      node.style.display = 'none';
      node.style.visibility = 'hidden';
      node.style.opacity = '0';
      node.style.height = '0px';
    } catch (e) {}
  }

  function cleanSweep(root = document) {
    try {
      BLOCK_SELECTORS.forEach(sel => {
        root.querySelectorAll(sel).forEach(el => hideVideoOnly(el));
      });
    } catch (e) {}
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes?.forEach(n => cleanSweep(n));
    });
    cleanSweep(document);
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  cleanSweep();
})();
