/* GrAte Apex Hub — shared theme sync
   Drop this in the <head> of every hub page and every embedded sub-document
   (guide/quiz/glossary/etc.), as early as possible — ideally right after
   <meta charset>, before <style> — so it runs before first paint and there's
   no flash of the wrong theme.

   Usage: wrap this file's contents in a <script>...</script> tag and inline
   it directly (don't load it as an external <script src>, since sub-docs are
   served via srcdoc/base64 and won't reliably resolve a relative script src).

   This script sets BOTH a "data-theme" and a "data-ga-theme" attribute on
   <html> to the active theme id ("dark", "light", "pink", "matcha",
   "rainbow", "cyberpunk", "desert", "retro", "lavender" — same ids the app
   shell uses). Different hub stylesheets have ended up keying their rules
   off different attribute names (base rules mostly use data-theme; header/
   hero accent-color overrides mostly use data-ga-theme), so this script
   sets both to stay safe regardless of which one a given hub's CSS reads.
   New hub CSS should standardize on data-theme going forward.

   It also exposes window.GA_applyTheme so the app shell's
   pushThemeToFrames() can theme an embedded hub instantly via a direct
   call instead of falling back to its setTimeout-based attribute poke.
*/
(function(){
  var GA_THEME_KEY = "gaHubProgress_v2";

  function gaReadTheme(){
    try {
      var raw = localStorage.getItem(GA_THEME_KEY);
      if(!raw) return "dark";
      var d = JSON.parse(raw);
      return (d && d.theme) ? d.theme : "dark";
    } catch(e){ return "dark"; }
  }

  function gaApplyTheme(theme){
    var t = theme || "dark";
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.setAttribute("data-ga-theme", t);
  }
  window.GA_applyTheme = gaApplyTheme;

  // Apply immediately on load — covers both direct navigation (frame.src=...)
  // and srcdoc-injected sub-views.
  gaApplyTheme(gaReadTheme());

  // Live sync: fires automatically in every other open same-origin document
  // whenever the app shell (or any hub) calls localStorage.setItem on the
  // shared progress key. No cooperation needed from whoever changed it.
  window.addEventListener("storage", function(e){
    if(e.key === GA_THEME_KEY) gaApplyTheme(gaReadTheme());
  });

  // Optional explicit path: accept { gaTheme: "dark" | "light" | "pink" | ... }
  // via postMessage, and relay it into any iframes this document itself
  // hosts, so updates cascade through nested guide/quiz sub-views too.
  window.addEventListener("message", function(e){
    if(!e.data || e.data.gaTheme === undefined) return;
    gaApplyTheme(e.data.gaTheme);
    var frames = document.getElementsByTagName("iframe");
    for(var i=0;i<frames.length;i++){
      try { frames[i].contentWindow.postMessage(e.data, "*"); } catch(err){}
    }
  });
})();
