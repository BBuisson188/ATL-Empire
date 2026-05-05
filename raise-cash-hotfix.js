"use strict";

(function applyRaiseCashCompatibilityPatch() {
  if (window.__raiseCashCompatibility20260505a) return;
  window.__raiseCashCompatibility20260505a = true;

  const style = document.createElement("style");
  style.textContent = ".debt-dock{display:none!important;}";
  document.head.appendChild(style);
})();
