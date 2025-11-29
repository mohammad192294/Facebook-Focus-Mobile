(function () {
  'use strict';

  const VIDEO_KEYWORDS = ['video','reel','reels','watch','story','stories','short','shorts'];

  function removeVideoElement(node){
    if(!node) return;
    try {
      const tag = node.tagName?.toLowerCase();
      if(tag==='video' || tag==='iframe') node.remove();
      else if(node.href && VIDEO_KEYWORDS.some(k=>node.href.toLowerCase().includes(k))) node.remove();
      else if(node.innerText && VIDEO_KEYWORDS.some(k=>node.innerText.toLowerCase().includes(k))) node.remove();
    } catch(e){}
  }

  function cleanSweep(root=document){
    try{
      // 1. Direct video/iframe remove
      root.querySelectorAll('video, iframe').forEach(removeVideoElement);

      // 2. Links/buttons containing keywords
      root.querySelectorAll('a, button, span, div').forEach(removeVideoElement);

      // 3. Only video/story/reels containers, not parent divs
      root.querySelectorAll('[data-pagelet], article, section, div').forEach(c=>{
        try{
          if(c.querySelector('video, iframe')) removeVideoElement(c.querySelector('video, iframe'));
        } catch(e){}
      });
    } catch(e){}
  }

  // Dynamic content observer
  const observer = new MutationObserver(mutations=>{
    mutations.forEach(m=>{
      m.addedNodes?.forEach(n=>cleanSweep(n));
    });
    cleanSweep(document);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  // fetch/XHR override (best-effort)
  try{
    const origFetch = window.fetch;
    window.fetch = function(...args){
      const url = args[0];
      if(typeof url==='string' && VIDEO_KEYWORDS.some(k=>url.includes(k))) return new Promise(()=>{});
      return origFetch.apply(this,args);
    };
  } catch(e){}

  try{
    const origXhr = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method,url){
      if(typeof url==='string' && VIDEO_KEYWORDS.some(k=>url.includes(k))) { this.abort(); return; }
      return origXhr.apply(this,arguments);
    };
  } catch(e){}

  // Initial sweep
  setTimeout(()=>cleanSweep(),500);

})();
