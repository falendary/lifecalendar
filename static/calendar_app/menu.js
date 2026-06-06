// Mobile navigation drawer: toggle the off-canvas menu. Vanilla, no deps —
// mirrors the IIFE style of modal.js.
(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("nav-drawer");
  var backdrop = document.querySelector(".nav-backdrop");
  if (!toggle || !drawer || !backdrop) return;

  function open() {
    document.body.classList.add("nav-open");
    backdrop.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
  }

  function close() {
    document.body.classList.remove("nav-open");
    backdrop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  function isOpen() {
    return document.body.classList.contains("nav-open");
  }

  toggle.addEventListener("click", function () {
    isOpen() ? close() : open();
  });

  backdrop.addEventListener("click", close);

  // Tapping any link in the drawer navigates, so close it.
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) close();
  });
})();
