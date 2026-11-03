// Preserve one early visual-control or cookie-preference tap during startup.
// Forms, links, cart actions and the independent map documents are excluded.
export const earlyInteractionScript = `(function(){
  var pending=null, selector='button[aria-label^="View larger:"],.rm-gallery-arrow,.rm-thumbnails button,.ch3-gallery button,.home-feature-select button,.gc-build-choices button,.gc-explorer-tools button,.analytics-choices';
  function capture(e){
    var target=e.target&&e.target.closest?e.target.closest(selector):null;
    if(!target||target.disabled)return;
    pending=target;e.preventDefault();e.stopImmediatePropagation();
  }
  document.addEventListener('click',capture,true);
  window.__takshReleaseVisualTap=function(){
    document.removeEventListener('click',capture,true);
    var target=pending;pending=null;
    if(target&&target.isConnected&&!target.disabled)target.click();
    delete window.__takshReleaseVisualTap;
  };
})();`;
