(function () {
  'use strict';

  const VIDEO_KEYWORDS = ['video','reel','reels','watch','story','stories','short','shorts'];

  // Aggressive & Clean remove function
  function removeNodeSafe(node) {
    if (!node) return;
    try {
      // remove parent if it contains video/keyword to avoid leftover space
      const parent = node.closest('div, article, section');
      if(parent) parent.remove();
      else node.remove();
    } catch(e){
      // fallback hide
      try { node.style.display='none'; node.style.height='0px'; node.style.opacity='0'; } catch(_) {}
    }
  }

  function nodeContainsKeyword(node) {
    if(!node || !node.innerText) return false;
    const txt = node.innerText.toLowerCase();
    return VIDEO_KEYWORDS.some(k => txt.includes(k));
  }

  function cleanSweep(root=document) {
    try {
      // remove video/iframe tags
      root.querySelectorAll('video, iframe').forEach(removeNodeSafe);

      // remove links/buttons with video keywords
      root.querySelectorAll('a, button, span, div').forEach(n=>{
        try {
          if(nodeContainsKeyword(n)) removeNodeSafe(n);
        } catch(e){}
      });

      // remove containers with data-pagelet/video
      root.querySelectorAll('[data-pagelet], article, section, div').forEach(c=>{
        try {
          if(c.querySelector('video, iframe')) removeNodeSafe(c);
        } catch(e){}
      });

    } catch(e){}
  }

  // MutationObserver to catch dynamic content
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m=>{
      m.addedNodes?.forEach(n=>cleanSweep(n));
    });
    cleanSweep(document);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  // Override fetch/XHR to block video endpoints
  try{
    const origFetch = window.fetch;
    window.fetch = function(...args){
      const url=args[0];
      if(typeof url==='string' && VIDEO_KEYWORDS.some(k=>url.includes(k))) return new Promise(()=>{}); 
      return origFetch.apply(this,args);
    };
  }catch(e){}

  try{
    const origXhr = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method,url){
      if(typeof url==='string' && VIDEO_KEYWORDS.some(k=>url.includes(k))){ this.abort(); return; }
      return origXhr.apply(this,arguments);
    };
  }catch(e){}

  cleanSweep();

})();
