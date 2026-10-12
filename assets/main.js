/* Promethia — small, dependency-free enhancements. Every feature degrades gracefully without JS. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header shadow on scroll ---- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function closeNav() { if (!toggle) return; toggle.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
      if (!open) { var first = nav.querySelector("a"); if (first) first.focus(); }
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { closeNav(); toggle.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth > 1140) closeNav(); });
  }

  /* ---- Reveal on scroll ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(function (el) { el.classList.add("in"); }); }

  /* ---- Modal helper (focus trap + restore) ---- */
  function modal(el, onOpen, onClose) {
    var lastFocus = null;
    function trap(e) {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab") return;
      var f = el.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function open() { lastFocus = document.activeElement; el.hidden = false; document.body.classList.add("no-scroll"); document.addEventListener("keydown", trap); if (onOpen) onOpen(); }
    function close() { el.hidden = true; document.body.classList.remove("no-scroll"); document.removeEventListener("keydown", trap); if (onClose) onClose(); if (lastFocus) lastFocus.focus(); }
    el.addEventListener("click", function (e) { if (e.target === el) close(); });
    return { open: open, close: close };
  }

  /* ---- Site search ---- */
  var INDEX = [
    ["Home", "index.html", "Pilot 2026 with partner schools in Bangalore"],
    ["Pilot 2026", "pilot.html", "Nov–Dec 2026, 30–50 Grade 5–8 students, 5–7 sessions, December showcase"],
    ["Mind Expedition shortlisting", "pilot.html#shortlisting", "A short lab game, not an exam"],
    ["Pilot timeline", "pilot.html#timeline", "November sessions, early December showcase"],
    ["Weekly parent scorecard", "parents.html#scorecard", "Strengths-based, no ranks"],
    ["For Students", "students.html", "Speak up, AI prompting, design in Canva or Figma"],
    ["For Parents", "parents.html", "Outcomes, scorecard, safety, cost"],
    ["Safety & safeguarding", "parents.html#safety", "POCSO-aligned policy, two-adult rule, consent, supervised AI"],
    ["For Institutes (schools)", "institutes.html", "Host a pilot cohort, no lab purchase, trained facilitators"],
    ["NEP 2020 & CBSE alignment", "institutes.html#alignment", "Skill modules, AI, design thinking"],
    ["Host a cohort", "institutes.html#pilot", "Shortlist, 5–7 sessions, showcase, review"],
    ["Programs", "programs.html", "The pilot, the 2027 school programme, holiday cohorts"],
    ["What comes after", "programs.html#after", "Weekly school programme from 2027, holiday cohorts"],
    ["Wider curriculum", "programs.html#tracks", "Human Intelligence, AI, Robotics, Building, Design, Public Speaking, Problem Solving, Entrepreneurship"],
    ["Session outline", "curriculum.html", "Speak up, Ask well, Spot a need, Design it, Pitch it, Showcase"],
    ["About Us", "about.html", "Mission, the Prometheus story, philosophy, team"],
    ["Contact", "register.html", "Enquire as a parent, school or mentor"],
    ["FAQ", "register.html#faq", "Dates, cost, location, ages"]
  ];
  var sd = document.getElementById("search-dialog");
  var si = document.getElementById("search-input");
  var sr = document.getElementById("search-results");
  if (sd && si && sr) {
    var esc = function (s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var render = function () {
      var q = si.value.trim().toLowerCase();
      var hits = INDEX.filter(function (r) { return !q || (r[0] + " " + r[2]).toLowerCase().indexOf(q) > -1; });
      sr.innerHTML = hits.length ? hits.slice(0, 9).map(function (r) {
        return '<li><a href="' + r[1] + '"><b>' + esc(r[0]) + "</b><small>" + esc(r[2]) + "</small></a></li>";
      }).join("") : '<li class="empty">No matches. Try “pilot”, “safety” or “scorecard”, or email hello@promethia.live.</li>';
    };
    var sm = modal(sd, function () { render(); si.focus(); }, function () { si.value = ""; });
    document.querySelectorAll("[data-search-open]").forEach(function (b) {
      b.setAttribute("role", "button");
      b.addEventListener("click", function (e) { e.preventDefault(); closeNav(); sm.open(); });
    });
    sd.querySelector("[data-search-close]").addEventListener("click", sm.close);
    si.addEventListener("input", render);
    sr.addEventListener("click", function (e) { if (e.target.closest("a")) sm.close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && sd.hidden && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); sm.open(); }
    });
  }

  /* ---- "Watch how it works" storyboard ---- */
  var hd = document.getElementById("hiw-dialog");
  if (hd) {
    var steps = hd.querySelectorAll(".hiw-steps li");
    var bar = hd.querySelector(".hiw-progress i");
    var timer = null, idx = 0;
    var show = function (i) {
      idx = i; steps.forEach(function (s, k) { s.classList.toggle("on", k === i); });
      if (bar) bar.style.width = ((i + 1) / steps.length * 100) + "%";
    };
    var play = function () { stop(); show(0); if (reduce) return; timer = setInterval(function () { show((idx + 1) % steps.length); }, 2600); };
    var stop = function () { if (timer) clearInterval(timer); timer = null; };
    var hm = modal(hd, function () { play(); hd.querySelector(".icon-btn").focus(); }, stop);
    document.querySelectorAll("[data-hiw-open]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); hm.open(); });
    });
    hd.querySelectorAll("[data-hiw-close]").forEach(function (b) { b.addEventListener("click", hm.close); });
    steps.forEach(function (s, k) { s.addEventListener("mouseenter", function () { stop(); show(k); }); });
  }

  /* ---- Activity filter ---- */
  var fbar = document.querySelector("[data-filter-bar]");
  if (fbar) {
    fbar.hidden = false;
    var items = document.querySelectorAll("[data-tracks]");
    var count = document.querySelector("[data-filter-count]");
    fbar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      fbar.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      var f = b.getAttribute("data-filter"), n = 0;
      items.forEach(function (it) {
        var ok = f === "all" || it.getAttribute("data-tracks").split(" ").indexOf(f) > -1;
        it.hidden = !ok; if (ok) n++;
      });
      if (count) count.textContent = n + " activit" + (n === 1 ? "y" : "ies") + " shown";
    });
  }

  /* ---- Register form → pre-filled email ---- */
  var form = document.getElementById("enquiry-form");
  if (form) {
    form.setAttribute("novalidate", "");
    var status = document.getElementById("form-status");
    var roleInputs = form.querySelectorAll('input[name="i_am"]');
    var groups = form.querySelectorAll("[data-show-for]");
    var syncRole = function () {
      var r = (form.querySelector('input[name="i_am"]:checked') || {}).value || "";
      groups.forEach(function (g) {
        var on = g.getAttribute("data-show-for").split(" ").indexOf(r.split(" ")[0].toLowerCase()) > -1 || !r;
        g.hidden = !on;
        g.querySelectorAll("[data-req]").forEach(function (f) { f.required = on; });
      });
    };
    roleInputs.forEach(function (r) { r.addEventListener("change", syncRole); });
    var params = new URLSearchParams(location.search);
    var pre = params.get("i_am");
    if (pre) { var m = form.querySelector('input[name="i_am"][value^="' + pre.charAt(0).toUpperCase() + pre.slice(1) + '"]'); if (m) m.checked = true; }
    var prog = params.get("program");
    if (prog) { var ps = form.querySelector("#program"); if (ps) Array.prototype.forEach.call(ps.options, function (o) { if (o.value.toLowerCase().indexOf(prog) > -1) ps.value = o.value; }); }
    syncRole();

    var setErr = function (el, msg) {
      var f = el.closest(".field"); if (!f) return;
      f.classList.toggle("invalid", !!msg);
      var em = f.querySelector(".error-msg"); if (em) em.textContent = msg || "";
      if (el.type !== "radio") el.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null, seenRadio = {};
      form.querySelectorAll("input,select,textarea").forEach(function (el) {
        if (el.closest("[hidden]")) { setErr(el, ""); return; }
        if (el.type === "radio") {
          if (seenRadio[el.name]) return; seenRadio[el.name] = true;
          var any = form.querySelector('input[name="' + el.name + '"]:checked');
          if (el.required && !any) { setErr(el, el.getAttribute("data-error") || "Please choose one."); firstBad = firstBad || el; } else setErr(el, "");
          return;
        }
        var bad = el.required && (el.type === "checkbox" ? !el.checked : !el.value.trim());
        if (!bad && el.type === "email" && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) bad = true;
        setErr(el, bad ? (el.getAttribute("data-error") || "This field is required.") : "");
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) {
        status.className = "form-status show err";
        status.textContent = "Please check the highlighted fields.";
        firstBad.focus();
        return;
      }
      var lines = [], role = (form.querySelector('input[name="i_am"]:checked') || {}).value || "Enquiry";
      form.querySelectorAll("[data-label]").forEach(function (el) {
        if (el.closest("[hidden]")) return;
        var v = el.type === "checkbox" ? (el.checked ? "Yes" : "") : (el.type === "radio" ? "" : el.value.trim());
        if (el.type === "radio") return;
        if (v) lines.push(el.getAttribute("data-label") + ": " + v);
      });
      var who = (form.querySelector("#name") || {}).value || "";
      var subject = "Promethia enquiry (" + role + ")" + (who ? " from " + who : "");
      var body = "Hi Promethia team,\n\n" + "I am a: " + role + "\n" + lines.join("\n") + "\n\nThanks!\n";
      var href = "mailto:hello@promethia.live?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.className = "form-status show";
      status.innerHTML = "Your email app should open with everything filled in. Just press <b>Send</b>. If nothing opens, email <a href=\"" + href + "\">hello@promethia.live</a> directly.";
      status.focus();
      window.location.href = href;
    });
  }
})();
