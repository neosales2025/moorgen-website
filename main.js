/* =====================================================================
   MOORGEN x WIIKTO — SITE ENGINE
   Vanilla JS. No dependencies. Every module guards itself so any single
   page can include only the markup it needs (e.g. no fp-explode section)
   without throwing.
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* -------------------------------------------------------------------
     01. PREMIUM LOADING SCREEN
     ------------------------------------------------------------------- */
  (function loader() {
    var el = document.getElementById('loader');
    if (!el) return;
    var hide = function () {
      el.classList.add('is-hidden');
      setTimeout(function () { el.remove(); }, 900);
    };
    window.addEventListener('load', function () { setTimeout(hide, 500); });
    // safety net in case 'load' never fires quickly (cached assets, etc.)
    setTimeout(hide, 2200);
  })();

  /* -------------------------------------------------------------------
     02. HEADER SOLIDIFY-ON-SCROLL
     ------------------------------------------------------------------- */
  (function header() {
    var el = document.querySelector('.site-header');
    if (!el) return;
    var toggleState = function () {
      el.classList.toggle('is-solid', window.scrollY > 40);
    };
    toggleState();
    window.addEventListener('scroll', toggleState, { passive: true });
  })();

  /* -------------------------------------------------------------------
     03. MOBILE NAV TOGGLE
     ------------------------------------------------------------------- */
  (function mobileNav() {
    var btn = document.querySelector('.nav-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  })();

  /* -------------------------------------------------------------------
     04. MAGNETIC BUTTONS
     ------------------------------------------------------------------- */
  (function magnetic() {
    if (reduceMotion || isCoarsePointer) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var strength = 0.35;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = 'translate(' + (x * strength) + 'px,' + (y * strength) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
    });
  })();

  /* -------------------------------------------------------------------
     05. BUTTON RIPPLE ON CLICK
     ------------------------------------------------------------------- */
  (function ripple() {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        var r = btn.getBoundingClientRect();
        var span = document.createElement('span');
        span.className = 'ripple';
        var size = Math.max(r.width, r.height) * 1.2;
        span.style.width = span.style.height = size + 'px';
        span.style.left = (e.clientX - r.left - size / 2) + 'px';
        span.style.top = (e.clientY - r.top - size / 2) + 'px';
        btn.appendChild(span);
        setTimeout(function () { span.remove(); }, 700);
      });
    });
  })();

  /* -------------------------------------------------------------------
     06. SCROLL-REVEAL ENGINE ([data-reveal], staggered groups)
     ------------------------------------------------------------------- */
  (function reveal() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      Array.prototype.forEach.call(group.querySelectorAll('[data-reveal]'), function (child, i) {
        child.style.setProperty('--stagger-i', i);
      });
    });

    if (reduceMotion) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (t) { io.observe(t); });
  })();

  /* -------------------------------------------------------------------
     07. WORD-BY-WORD TEXT REVEAL ([data-split])
     ------------------------------------------------------------------- */
  (function splitWords() {
    var nodes = document.querySelectorAll('[data-split]');
    if (!nodes.length) return;

    nodes.forEach(function (node) {
      var text = node.textContent.trim();
      var words = text.split(/\s+/);
      node.innerHTML = words.map(function (w, i) {
        return '<span class="split-words" style="--w:' + i + '"><span class="word">' + w + '</span></span> ';
      }).join('');
    });

    if (reduceMotion) {
      document.querySelectorAll('.split-words').forEach(function (s) { s.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          Array.prototype.forEach.call(entry.target.querySelectorAll('.split-words'), function (s) {
            s.classList.add('is-in');
          });
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* -------------------------------------------------------------------
     08. ANIMATED COUNTERS ([data-counter-to])
     ------------------------------------------------------------------- */
  (function counters() {
    var nodes = document.querySelectorAll('[data-counter-to]');
    if (!nodes.length) return;

    var animate = function (el) {
      var to = parseFloat(el.getAttribute('data-counter-to'));
      var suffix = el.getAttribute('data-counter-suffix') || '';
      var duration = 1400;
      var start = null;
      var from = 0;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = from + (to - from) * eased;
        el.textContent = (Number.isInteger(to) ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (reduceMotion) {
      nodes.forEach(function (el) { el.textContent = el.getAttribute('data-counter-to') + (el.getAttribute('data-counter-suffix') || ''); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animate(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    nodes.forEach(function (n) { io.observe(n); });
  })();

  /* -------------------------------------------------------------------
     09. HERO — VIDEO SCROLL PARALLAX + MUTE/PAUSE CONTROL
     ------------------------------------------------------------------- */
  (function heroVideo() {
    var video = document.getElementById('heroVideo');
    if (!video) return;

    // Respect reduced-motion: don't autoplay a full-bleed looping video for
    // users who asked for less motion — hold on the poster frame instead.
    if (reduceMotion) video.pause();

    // Fade the video out on scroll for a depth-exit cue. Deliberately only
    // touches opacity — the CSS keyframe animation already owns `transform`
    // for the ambient slow zoom, and setting an inline transform here would
    // permanently override (and freeze) that animation.
    if (!reduceMotion) {
      window.addEventListener('scroll', function () {
        var y = Math.min(window.scrollY, 800);
        video.style.opacity = String(1 - (y / 800) * 0.55);
      }, { passive: true });
    }

    var toggle = document.getElementById('heroVideoToggle');
    if (!toggle) return;
    if (reduceMotion) {
      toggle.classList.add('is-paused');
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Play background video');
    }
    toggle.addEventListener('click', function () {
      var paused = video.paused;
      if (paused) { video.play(); } else { video.pause(); }
      toggle.classList.toggle('is-paused', !paused);
      toggle.setAttribute('aria-pressed', String(!paused));
      toggle.setAttribute('aria-label', paused ? 'Pause background video' : 'Play background video');
    });
  })();

  /* -------------------------------------------------------------------
     10. FINGERPRINT SENSOR EXPLODED-VIEW SCROLL DRIVER
     ------------------------------------------------------------------- */
  (function fpExplode() {
    var section = document.getElementById('fpExplode');
    if (!section) return;
    var stage = section.querySelector('.fp-stage');
    var update = function () {
      var rect = section.getBoundingClientRect();
      var scrollable = rect.height - window.innerHeight;
      var progress = scrollable > 0 ? (-rect.top) / scrollable : 0;
      progress = Math.max(0, Math.min(1, progress));
      stage.style.setProperty('--progress', progress.toFixed(3));
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* -------------------------------------------------------------------
     11. MARQUEE — duplicate track content once so the loop is seamless
     ------------------------------------------------------------------- */
  (function marquee() {
    document.querySelectorAll('.marquee-track[data-autoclone]').forEach(function (track) {
      track.insertAdjacentHTML('beforeend', track.innerHTML);
    });
  })();

})();
