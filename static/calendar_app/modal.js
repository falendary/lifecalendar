// Modal open/close + conditional event-type fields. Vanilla, no deps.
(function () {
  "use strict";

  function openModal(id) {
    const m = document.getElementById(id);
    if (!m) return;
    m.hidden = false;
    const first = m.querySelector("[autofocus], input, textarea, select");
    if (first) first.focus();
  }

  function closeModal(m) {
    m.hidden = true;
  }

  document.addEventListener("click", function (e) {
    const opener = e.target.closest("[data-open-modal]");
    if (opener) {
      openModal(opener.getAttribute("data-open-modal"));
      return;
    }
    if (e.target.closest("[data-close-modal]")) {
      const m = e.target.closest(".modal-backdrop");
      if (m) closeModal(m);
      return;
    }
    // Click on the dimmed backdrop (outside the dialog) closes it.
    if (e.target.classList.contains("modal-backdrop")) {
      closeModal(e.target);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop:not([hidden])").forEach(closeModal);
    }
  });

  // Show only the date fields relevant to the selected event type.
  function syncTypeFields(select) {
    const form = select.closest("form");
    const type = select.value;
    form.querySelectorAll(".type-fields").forEach(function (block) {
      const applicable = block.getAttribute("data-type").split(" ");
      block.hidden = !applicable.includes(type);
    });
  }

  document.querySelectorAll(".event-type-select").forEach(function (select) {
    syncTypeFields(select);
    select.addEventListener("change", function () {
      syncTypeFields(select);
    });
  });
})();
