(function () {
  'use strict';

  const VIDEO_KEYWORDS = ['video','reel','reels','watch','story','stories','short','shorts'];

  // Remove node safely
  function removeNodeSafe(node){
    if(!node) return;
    try{
      const parent = node.closest('div, article, section');
      if(parent) parent.remove();
      else node.remove();
    } catch(e){
      try { node.style.display='none'; node.style.height='0px'; node.style.opacity='0'; } catch(_) {}
    }
  }

  // Check if node text contains video keywords
  function nodeContainsKeyword(node){
    try{
      if(!node || !node.innerText) return false;
      const txt = node.innerText.toLowerCase();
      return VIDEO_KEYWORDS.some(k => txt.includes(k));
    } catch(e){ return false; }
  }

  // Aggressive sweep function
  function cleanSweep(root=document){
    try{
      // Remove video and iframe elements
      root.querySelectorAll('video, iframe').forEach(removeNodeSafe);

      // Remove links/buttons with keywords
      root.querySelectorAll('a, button, div, span').forEach(n=>{
        if(nodeContainsKeyword(n)) removeNodeSafe(n);
      });

      // Remove containers with video elements
      root.querySelectorAll('[data-pagelet], article, section, div').forEach(c=>{
        try{
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

  // Best-effort fetch/XHR override
  try{
    const origFetch = window.fetch;
    window.fetch = function(...args){
      const url=args[0];
      if(typeof url==='string' && VIDEO_KEYWORDS.some(k=>url.includes(k))) return new Promise(()=>{}); 
      return origFetch.apply(this,args);
    };
  } catch(e){}

  try{
    const origXhr = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method,url){
      if(typeof url==='string' && VIDEO_KEYWORDS.some(k=>url.includes(k))){ this.abort(); return; }
      return origXhr.apply(this,arguments);
    };
  } catch(e){}

  // Initial sweep after short delay
  setTimeout(()=>cleanSweep(), 500);

})();
