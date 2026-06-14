/* ============================================================
   Mosaica — interactions
   ============================================================ */
(function () {
  "use strict";

  var PALETTE = [
    "#B0532E", "#C2703B", "#9B3B2C", "#C99A33", "#D2A93E",
    "#BB8A2C", "#7E8A63", "#5F6A43", "#4F6A78", "#E2D7B8",
    "#6E523C", "#CC8A5A"
  ];
  // weighted: warm tones appear more often than cool
  var WEIGHTED = PALETTE.concat(["#C99A33", "#C2703B", "#B0532E", "#D2A93E", "#CC8A5A", "#E2D7B8"]);

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ---- fill a container with N tiles ---- */
  function fillTiles(el, count, opts) {
    opts = opts || {};
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var t = document.createElement("span");
      t.className = "tile" + (opts.pop ? " pop" : "");
      t.style.background = pick(WEIGHTED);
      if (opts.faded) t.style.opacity = rand(0.5, 1).toFixed(2);
      frag.appendChild(t);
    }
    el.appendChild(frag);
  }

  /* ---- staggered pop-in for a set of .tile.pop ---- */
  function popIn(container, base) {
    var tiles = container.querySelectorAll(".tile.pop");
    tiles.forEach(function (t, i) {
      setTimeout(function () { t.classList.add("in"); }, (base || 0) + i * 22 + rand(0, 40));
    });
  }

  /* ============================================================
     Hero phone mosaic
     ============================================================ */
  var appMosaic = document.getElementById("appMosaic");
  if (appMosaic) {
    fillTiles(appMosaic, 54, { pop: !reduce });
    if (reduce) { /* already visible */ }
  }

  /* ---- floating decorative tiles ---- */
  var floatLayer = document.getElementById("floatLayer");
  if (floatLayer && !reduce) {
    var spots = [
      { x: "2%",  y: "12%", s: 46, c: "#C2703B" },
      { x: "84%", y: "6%",  s: 38, c: "#4F6A78" },
      { x: "90%", y: "70%", s: 52, c: "#C99A33" },
      { x: "-2%", y: "66%", s: 40, c: "#9B3B2C" },
      { x: "8%",  y: "88%", s: 30, c: "#7E8A63" },
      { x: "78%", y: "40%", s: 28, c: "#E2D7B8" }
    ];
    spots.forEach(function (sp, i) {
      var f = document.createElement("span");
      f.className = "float-tile";
      f.style.left = sp.x; f.style.top = sp.y;
      f.style.width = sp.s + "px"; f.style.height = sp.s + "px";
      f.style.background = sp.c;
      f.style.animation = "floaty " + rand(5, 8).toFixed(1) + "s ease-in-out " + (i * 0.4).toFixed(1) + "s infinite";
      floatLayer.appendChild(f);
    });
  }

  /* ============================================================
     Showcase "wall" — a year in tiles
     ============================================================ */
  var wall = document.getElementById("wall");
  if (wall) {
    fillTiles(wall, 120, { pop: !reduce, faded: true });
  }

  /* ============================================================
     How-it-works step art
     ============================================================ */
  document.querySelectorAll("[data-step-art]").forEach(function (el) {
    var mode = el.getAttribute("data-step-art");
    if (mode === "capture") {
      el.style.gridTemplateColumns = "repeat(5, 22px)";
      fillTiles(el, 9, { pop: false });
      var add = document.createElement("span");
      add.style.background = "var(--gold)";
      add.style.boxShadow = "0 0 0 3px rgba(210,169,62,.3)";
      el.appendChild(add);
    } else if (mode === "arrange") {
      el.style.gridTemplateColumns = "repeat(5, 22px)";
      fillTiles(el, 20, { pop: false, faded: true });
    } else if (mode === "reflect") {
      el.style.gridTemplateColumns = "repeat(5, 22px)";
      for (var i = 0; i < 20; i++) {
        var t = document.createElement("span");
        var col = i % 5, row = Math.floor(i / 5);
        var diag = col === row || col === row + 1;
        t.style.background = diag ? "var(--gold)" : "rgba(244,239,227,0.09)";
        el.appendChild(t);
      }
    }
  });

  /* ============================================================
     Proof + avatar + feature-icon tiles
     ============================================================ */
  document.querySelectorAll(".proof-tiles span, .quote .av").forEach(function (el) {
    el.style.background = pick(WEIGHTED);
  });
  document.querySelectorAll(".feature-icon").forEach(function (icon) {
    var pattern = icon.getAttribute("data-pattern") || "";
    var on = pattern.split(",");
    for (var i = 0; i < 9; i++) {
      var s = document.createElement("span");
      s.style.background = on.indexOf(String(i)) > -1 ? icon.getAttribute("data-color") || pick(WEIGHTED) : "rgba(42,35,29,0.07)";
      icon.appendChild(s);
    }
  });

  /* ============================================================
     Scroll reveals + tile pop on view
     (manual viewport check — IntersectionObserver is unreliable
      inside the preview iframe)
     ============================================================ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (wall && revealEls.indexOf(wall) === -1) revealEls.push(wall);
  var popped = {};

  function inView(el, margin) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh - margin && r.bottom > 0;
  }

  function checkReveals() {
    for (var i = revealEls.length - 1; i >= 0; i--) {
      var el = revealEls[i];
      if (inView(el, 60)) {
        el.classList.add("in");
        if ((el.id === "wall" || el.id === "appMosaic") && !popped[el.id]) {
          popped[el.id] = true;
          popIn(el, 0);
        }
        revealEls.splice(i, 1);
      }
    }
  }

  if (reduce) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    window.addEventListener("scroll", checkReveals, { passive: true });
    window.addEventListener("resize", checkReveals);
    checkReveals();
    // run again after layout/fonts settle
    setTimeout(checkReveals, 60);
    window.addEventListener("load", function () {
      checkReveals();
      if (appMosaic && !popped.appMosaic) { popped.appMosaic = true; popIn(appMosaic, 250); }
    });
    // safety: never leave content stuck hidden
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
        if (inView(el, -200)) el.classList.add("in");
      });
    }, 1500);
  }

  /* ============================================================
     Nav scroll state + mobile toggle
     ============================================================ */
  var nav = document.getElementById("nav");
  function onScroll() {
    if (window.scrollY > 12) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = links.style.display === "flex";
      links.style.display = open ? "" : "flex";
    });
  }

  /* ============================================================
     FAQ accordion
     ============================================================ */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (o) {
        o.classList.remove("open");
        o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
})();
