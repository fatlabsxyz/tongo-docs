/* ===========================================================================
   Tongo docs — global version switcher (v2 latest  <->  v1 legacy)
   v2 is served at "/", v1 at "/v1/". This injects:
     - a version dropdown in the top menu bar,
     - a version rail at the top of the sidebar,
     - a "legacy" banner on every v1 page.
   Path is preserved across versions when the target page exists.
   =========================================================================== */
(function () {
  "use strict";

  // Pages that only exist in v2 — switching these to v1 lands on the v1 home.
  var V2_ONLY = [
    "protocol/vault.html",
    "protocol/relayer.html",
    "sdk/relaying.html",
    "whats-new.html",
  ];

  // --- work out where we are ------------------------------------------------
  var segments = window.location.pathname.split("/").filter(Boolean);
  var isV1 = segments[0] === "v1";
  var relSegments = isV1 ? segments.slice(1) : segments.slice();
  // strip a trailing "index.html" so the home maps cleanly
  var relPath = relSegments.join("/");
  if (relPath === "index.html") relPath = "";

  var V2 = { id: "v2", label: "v2", tag: "latest" };
  var V1 = { id: "v1", label: "v1", tag: "legacy" };
  var current = isV1 ? V1 : V2;

  function hrefToV2() {
    return "/" + relPath;
  }
  function hrefToV1() {
    if (!relPath || V2_ONLY.indexOf(relPath) !== -1) return "/v1/";
    return "/v1/" + relPath;
  }
  var targets = { v2: hrefToV2(), v1: hrefToV1() };

  // --- top-bar dropdown -----------------------------------------------------
  function buildMenu() {
    var right = document.querySelector(".menu-bar .right-buttons");
    var bar = document.querySelector(".menu-bar");
    if (!bar) return;

    var menu = document.createElement("div");
    menu.className = "doc-version-menu";

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "doc-version-toggle";
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML =
      '<span class="dvt-dot"></span>' +
      '<span>' + current.label + " <em style='font-style:normal;color:var(--fg-subtle)'>(" + current.tag + ")</em></span>" +
      '<span class="dvt-caret">▾</span>';

    var pop = document.createElement("div");
    pop.className = "doc-version-pop";
    pop.innerHTML =
      link(V2, targets.v2) +
      link(V1, targets.v1);

    function link(v, href) {
      var cur = v.id === current.id;
      return (
        '<a href="' + href + '"' + (cur ? ' class="is-current" aria-current="true"' : "") + ">" +
        "<strong>" + v.label + (v.id === "v2" ? " — latest" : " — legacy") + "</strong>" +
        "<span>" + (v.id === "v2" ? "current protocol" : "pre-relayer / single contract") + "</span>" +
        "</a>"
      );
    }

    menu.appendChild(toggle);
    menu.appendChild(pop);

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", menu.classList.contains("is-open"));
    });
    document.addEventListener("click", function () {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });

    if (right) right.insertBefore(menu, right.firstChild);
    else bar.appendChild(menu);
  }

  // --- sidebar rail ---------------------------------------------------------
  function buildRail() {
    var box = document.querySelector(".sidebar .sidebar-scrollbox");
    if (!box) return;
    var rail = document.createElement("div");
    rail.className = "doc-version-rail";
    rail.innerHTML =
      '<div class="dvr-label">Documentation version</div>' +
      '<div class="dvr-opts">' +
      opt(V2, targets.v2) +
      opt(V1, targets.v1) +
      "</div>";
    function opt(v, href) {
      var cur = v.id === current.id;
      return (
        '<a href="' + href + '"' + (cur ? ' class="is-current" aria-current="true"' : "") + ">" +
        v.label + '<span class="dvr-tag">' + v.tag + "</span></a>"
      );
    }
    box.insertBefore(rail, box.firstChild);
  }

  // --- legacy banner (v1 only) ---------------------------------------------
  function buildBanner() {
    if (!isV1) return;
    var main = document.querySelector(".content main");
    if (!main) return;
    var banner = document.createElement("div");
    banner.className = "doc-legacy-banner";
    banner.innerHTML =
      "<span>⚠ You're reading the <strong>v1 (legacy)</strong> docs — the single-contract protocol before Vaults and the Relayer.</span>" +
      '<a href="' + targets.v2 + '">Go to v2 (latest) →</a>';
    main.insertBefore(banner, main.firstChild);
  }

  // The top bar just says "Tongo".
  function setMenuTitle() {
    var t = document.querySelector(".menu-title");
    if (t) t.textContent = "Tongo";
  }

  // Tab title: always just "Tongo docs" (no per-page subtitle).
  function setDocTitle() {
    document.title = "Tongo docs";
  }

  // ── Dark / light theme toggle (dark by default) ──────────────────────────
  var THEMES = ["light", "rust", "coal", "navy", "ayu"];
  function isLight() { return document.documentElement.classList.contains("light"); }
  function applyTheme(theme) {
    var html = document.documentElement;
    THEMES.forEach(function (c) { html.classList.remove(c); });
    html.classList.add(theme);
    try { localStorage.setItem("mdbook-theme", theme); } catch (e) {}
  }
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function buildThemeToggle() {
    var left = document.querySelector(".menu-bar .left-buttons");
    var bar = document.querySelector(".menu-bar");
    if (!bar) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "doc-theme-toggle";
    btn.setAttribute("aria-label", "Toggle light / dark theme");
    function render() { btn.innerHTML = isLight() ? MOON : SUN; }
    render();
    btn.addEventListener("click", function () {
      applyTheme(isLight() ? "navy" : "light");
      render();
    });
    if (left) left.appendChild(btn); else bar.appendChild(btn);
  }

  // ── Collapsible sidebar sections ─────────────────────────────────────────
  function buildSectionCollapse() {
    var titles = document.querySelectorAll(".chapter .part-title");
    titles.forEach(function (title) {
      var key = "tongo-sec:" + (title.textContent || "").trim();
      var items = [];
      var el = title.nextElementSibling;
      while (el && !el.classList.contains("part-title")) {
        if (el.classList.contains("chapter-item")) items.push(el);
        el = el.nextElementSibling;
      }
      if (!items.length) return;
      var collapsed = false;
      try { collapsed = localStorage.getItem(key) === "1"; } catch (e) {}
      function apply() {
        items.forEach(function (i) { i.style.display = collapsed ? "none" : ""; });
        title.classList.toggle("is-collapsed", collapsed);
      }
      apply();
      title.addEventListener("click", function () {
        collapsed = !collapsed;
        try { localStorage.setItem(key, collapsed ? "1" : "0"); } catch (e) {}
        apply();
      });
    });
  }

  // ── Centered brand lockup (mascot + wordmark), where the title used to be ─
  function buildBrand() {
    var title = document.querySelector(".menu-title");
    if (!title) return;
    title.textContent = "";
    var a = document.createElement("a");
    a.className = "doc-brand";
    a.href = "/";
    a.setAttribute("aria-label", "Tongo docs — home");
    a.innerHTML =
      '<img class="db-mark" src="/tongo-mark.png" alt="Tongo" />' +
      '<img class="db-word" src="/tongo-wordmark.png" alt="tongo" />';
    title.appendChild(a);
  }

  // ── Mascot at the top of the sidebar — click it for a roar 🦍 ─────────────
  var ROARS = ["/roar-1.mp3", "/roar-2.mp3", "/roar-3.mp3"];
  var roarAudio = {};
  var lastRoar = -1;
  function playRoar() {
    try {
      var i = Math.floor(Math.random() * ROARS.length);
      if (ROARS.length > 1 && i === lastRoar) i = (i + 1) % ROARS.length; // no immediate repeat
      lastRoar = i;
      var a = roarAudio[i] || (roarAudio[i] = new Audio(ROARS[i]));
      a.currentTime = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  function buildSidebarLogo() {
    var box = document.querySelector(".sidebar .sidebar-scrollbox");
    if (!box) return;
    var a = document.createElement("a");
    a.className = "doc-sidebar-logo";
    a.href = "#";
    a.setAttribute("aria-label", "Tongo — roar");
    a.innerHTML = '<img src="/tongo-mark.png" alt="Tongo" />';
    a.addEventListener("click", function (e) { e.preventDefault(); playRoar(); });
    box.insertBefore(a, box.firstChild);
  }

  // ── "tongo" wordmark at the top-left of the menu bar ─────────────────────
  function buildWordmark() {
    var left = document.querySelector(".menu-bar .left-buttons");
    if (!left) return;
    var a = document.createElement("a");
    a.className = "doc-wordmark";
    a.href = "/";
    a.setAttribute("aria-label", "Tongo docs — home");
    a.innerHTML = '<img src="/tongo-wordmark.png" alt="tongo" />';
    left.insertBefore(a, left.firstChild);
  }

  function init() {
    setDocTitle();
    buildWordmark();
    buildThemeToggle();
    buildSectionCollapse();
    buildMenu();
    buildRail();
    buildSidebarLogo();   // after buildRail so the mascot sits above the version rail
    buildBanner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
