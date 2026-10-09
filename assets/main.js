/* Promethia — small, dependency-free enhancements */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js');

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
      nav.classList.toggle('open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) setOpen(false); });
  }

  // Header shadow on scroll
  var header = document.querySelector('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add('in'); }); }

  // Activity filters
  var chips = document.querySelectorAll('.chip[data-filter]');
  if (chips.length) {
    var cards = document.querySelectorAll('[data-cat]');
    var live = document.getElementById('filter-status');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter'); var shown = 0;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        cards.forEach(function (card) {
          var match = f === 'all' || card.getAttribute('data-cat').split(' ').indexOf(f) > -1;
          card.hidden = !match; if (match) { shown++; card.classList.add('in'); }
        });
        if (live) live.textContent = 'Showing ' + shown + ' activit' + (shown === 1 ? 'y' : 'ies');
      });
    });
  }

  // Registration form → opens a pre-filled email to hello@promethia.live
  var form = document.getElementById('register-form');
  if (form) {
    var status = document.getElementById('form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (el) {
        var bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
        if (el.type === 'radio') { bad = !form.querySelector('input[name="' + el.name + '"]:checked'); }
        el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        var msg = document.getElementById(el.getAttribute('aria-describedby') && el.getAttribute('aria-describedby').split(' ').filter(function (id) { return id.indexOf('err') === 0; })[0]);
        if (msg) msg.textContent = bad ? (el.getAttribute('data-error') || 'Please fill this in.') : '';
        if (bad && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }

      var data = new FormData(form); var lines = [];
      var labels = {
        child_name: "Child's name", child_grade: 'Grade (2026–27)', child_age: 'Age', school: 'School',
        track: 'Track', cohort: 'Preferred dates', parent_name: 'Parent / guardian', email: 'Email',
        phone: 'Phone / WhatsApp', heard: 'How did you hear about us', message: 'Message / anything we should know'
      };
      Object.keys(labels).forEach(function (k) { var v = data.get(k); if (v) lines.push(labels[k] + ': ' + v); });
      lines.push('Consent to be contacted: Yes');
      var subject = 'Promethia Summer 2027 application – ' + (data.get('child_name') || '');
      var href = 'mailto:hello@promethia.live?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent('Hi Promethia team,\n\nWe would like to apply for Summer 2027.\n\n' + lines.join('\n') + '\n\nThank you!');
      window.location.href = href;
      if (status) {
        status.innerHTML = '<strong>Almost done!</strong> Your email app should open with your application pre-filled — just hit send. If nothing opened, email us directly at <a href="mailto:hello@promethia.live">hello@promethia.live</a>.';
        status.classList.add('show'); status.focus();
      }
    });
  }
})();
