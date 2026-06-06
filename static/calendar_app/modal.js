// Modal/drawer open-close + conditional event-type fields + edit drawer.
// Uses event delegation so dynamically-injected forms work too. Vanilla, no deps.
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

  // Show only the date fields relevant to the selected event type.
  function syncTypeFields(select) {
    const form = select.closest("form");
    if (!form) return;
    const type = select.value;
    form.querySelectorAll(".type-fields").forEach(function (block) {
      const applicable = block.getAttribute("data-type").split(" ");
      block.hidden = !applicable.includes(type);
    });
  }

  // Add Event drawer, prefilled to a given day (month view "+").
  function openEventOnDate(dateStr) {
    const m = document.getElementById("modal-event");
    if (!m) return;
    const typeSel = m.querySelector(".event-type-select");
    if (typeSel) { typeSel.value = "1"; syncTypeFields(typeSel); }
    const dateInput = m.querySelector('input[name="date"]');
    if (dateInput) dateInput.value = dateStr;
    openModal("modal-event");
  }

  // Edit Event drawer: fetch the prefilled form fragment, inject, open.
  function openEditDrawer(url) {
    const drawer = document.getElementById("modal-event-edit");
    if (!drawer) return;
    const body = drawer.querySelector(".edit-body");
    body.innerHTML = '<p class="muted" style="padding:20px">Loading…</p>';
    drawer.hidden = false;
    fetch(url, { headers: { "X-Requested-With": "fetch" } })
      .then(function (r) { return r.text(); })
      .then(function (html) {
        body.innerHTML = html;
        const sel = body.querySelector(".event-type-select");
        if (sel) syncTypeFields(sel);
        const first = body.querySelector("[autofocus], input, textarea, select");
        if (first) first.focus();
      })
      .catch(function () {
        body.innerHTML = '<p class="error" style="padding:20px">Could not load the event.</p>';
      });
  }

  document.addEventListener("click", function (e) {
    const editor = e.target.closest("[data-edit-url]");
    if (editor) {
      e.preventDefault();
      openEditDrawer(editor.getAttribute("data-edit-url"));
      return;
    }
    const adder = e.target.closest("[data-add-date]");
    if (adder) {
      openEventOnDate(adder.getAttribute("data-add-date"));
      return;
    }
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

  // Delegated change handlers (work for injected forms too).
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("event-type-select")) {
      syncTypeFields(e.target);
    } else if (e.target.classList.contains("color-toggle")) {
      // A disabled color input isn't submitted, so the event falls back to
      // its category's color unless a custom color is explicitly chosen.
      const wrap = e.target.closest("div");
      const input = wrap && wrap.querySelector(".color-input");
      if (input) input.disabled = !e.target.checked;
    }
  });

  // Initial sync for any forms present on load.
  document.querySelectorAll(".event-type-select").forEach(syncTypeFields);
})();
