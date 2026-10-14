/* Promo: the Promethia guide. Points to pages; never answers questions itself. */
(function () {
  var root = document.getElementById("promo");
  if (!root) return;
  var tips = [];
  try { tips = JSON.parse(document.getElementById("promo-tips").textContent); } catch (e) {}
  var bubble = document.getElementById("promo-bubble");
  var avatar = root.querySelector("[data-promo-toggle]");
  var T = root.querySelector(".promo-t"), B = root.querySelector(".promo-b"), L = root.querySelector(".promo-link");
  var next = root.querySelector("[data-promo-next]");
  var store = { get: function (k) { try { return localStorage.getItem("promo:" + k); } catch (e) { return null; } },
                set: function (k, v) { try { localStorage.setItem("promo:" + k, v); } catch (e) {} } };
  var i = 0;
  function show(n) {
    if (!tips.length) return;
    i = (n + tips.length) % tips.length;
    var t = tips[i];
    T.textContent = t.t; B.textContent = t.b; L.textContent = t.l + " →"; L.setAttribute("href", t.h);
    next.hidden = tips.length < 2;
  }
  function setOpen(open) {
    root.classList.toggle("is-min", !open);
    avatar.setAttribute("aria-expanded", open ? "true" : "false");
    avatar.setAttribute("aria-label", open ? "Hide Promo's tip" : "Show Promo's tip");
    store.set("min", open ? "0" : "1");
  }
  show(0);
  // Start minimised on small screens or if the visitor minimised before; otherwise pop in after a moment.
  var startMin = store.get("min") === "1" || window.matchMedia("(max-width:640px)").matches;
  setOpen(false);
  if (!startMin) setTimeout(function () { setOpen(true); }, 1200);
  next.addEventListener("click", function () { show(i + 1); });
  root.querySelector("[data-promo-min]").addEventListener("click", function () { setOpen(false); avatar.focus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !root.classList.contains("is-min")) setOpen(false); });

  // Dragging (pointer events). A short press without movement toggles the bubble.
  var pos = null;
  try { pos = JSON.parse(store.get("pos") || "null"); } catch (e) {}
  function place(x, y) {
    var r = root.getBoundingClientRect();
    x = Math.max(8, Math.min(window.innerWidth - r.width - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - r.height - 8, y));
    root.style.left = x + "px"; root.style.top = y + "px"; root.style.right = "auto"; root.style.bottom = "auto";
    return { x: x, y: y };
  }
  if (pos) requestAnimationFrame(function () { place(pos.x, pos.y); });
  var drag = null;
  avatar.addEventListener("pointerdown", function (e) {
    var r = root.getBoundingClientRect();
    drag = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false };
    avatar.setPointerCapture(e.pointerId);
  });
  avatar.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
    drag.moved = true; root.classList.add("is-drag");
    pos = place(drag.ox + dx, drag.oy + dy);
  });
  avatar.addEventListener("pointerup", function () {
    if (!drag) return;
    root.classList.remove("is-drag");
    if (drag.moved) store.set("pos", JSON.stringify(pos));
    else setOpen(root.classList.contains("is-min"));
    drag = null;
  });
  avatar.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(root.classList.contains("is-min")); }
  });
  avatar.addEventListener("click", function (e) { e.preventDefault(); });
  window.addEventListener("resize", function () { if (pos) pos = place(pos.x, pos.y); });
  avatar.addEventListener("dblclick", function () { store.set("pos", ""); pos = null; root.removeAttribute("style"); });
})();
