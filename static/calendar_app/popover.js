// Lightweight click-to-open popover for calendar squares.
// Event data is pre-rendered (hidden) inside each square's <template>, so no
// network request is needed — we just clone it into one shared popover.
(function () {
  "use strict";

  const pop = document.getElementById("sq-popover");
  if (!pop) return;

  const rangeEl = pop.querySelector(".pop-range");
  const bodyEl = pop.querySelector(".pop-body");
  const weekLink = pop.querySelector(".pop-day");

  function closePopover() {
    pop.hidden = true;
    pop.removeAttribute("data-open");
  }

  function openPopover(square) {
    const data = square.querySelector(".sq-data");
    bodyEl.innerHTML = data ? data.innerHTML : "";
    rangeEl.textContent = square.dataset.range || "";
    weekLink.href = square.dataset.weekUrl || "#";

    // Show first (off-screen) to measure, then position within the viewport.
    pop.hidden = false;
    pop.setAttribute("data-open", "1");
    const r = square.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let left = r.right + 8;
    let top = r.top;
    if (left + pw > window.innerWidth - 8) left = r.left - pw - 8;
    if (left < 8) left = 8;
    if (top + ph > window.innerHeight - 8) top = window.innerHeight - ph - 8;
    if (top < 8) top = 8;
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  }

  function handleSquare(square) {
    if (square.querySelector(".sq-data")) {
      openPopover(square);
    } else if (square.dataset.weekUrl) {
      window.location.href = square.dataset.weekUrl;
    }
  }

  document.addEventListener("click", function (e) {
    const square = e.target.closest(".square, .year-square");
    if (square) {
      e.stopPropagation();
      handleSquare(square);
      return;
    }
    if (!pop.contains(e.target)) closePopover();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePopover();
    if ((e.key === "Enter" || e.key === " ") && document.activeElement) {
      const square = document.activeElement.closest(".square, .year-square");
      if (square) {
        e.preventDefault();
        handleSquare(square);
      }
    }
  });

  pop.querySelector(".pop-close").addEventListener("click", closePopover);
  window.addEventListener("resize", closePopover);
})();
