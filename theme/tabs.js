// Version selector tabs (v1 / v2) for mdBook pages.
// Clicking a `.version-tab` shows the matching `[data-version-panel]`
// within its `[data-version-tabs]` container.
(function () {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".version-tab");
    if (!btn) return;

    const container = btn.closest("[data-version-tabs]");
    if (!container) return;

    const version = btn.getAttribute("data-version");

    container.querySelectorAll(".version-tab").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-version") === version);
    });
    container.querySelectorAll("[data-version-panel]").forEach(function (p) {
      p.classList.toggle(
        "is-active",
        p.getAttribute("data-version-panel") === version,
      );
    });
  });
})();
