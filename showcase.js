/* =====================================================================
   PRODUCT SHOWCASE — Apple-style pinned scroll story
   Self-contained module. Only touches elements inside #productShowcase,
   so it cannot affect any other section of the site. Degrades gracefully
   if GSAP/ScrollTrigger/Lenis/SplitType fail to load (offline, blocked
   CDN) or the visitor has requested reduced motion: the first product
   simply renders statically with no pin/scrub/parallax.
   ===================================================================== */
(function () {
  'use strict';

  var section = document.getElementById('productShowcase');
  if (!section) return;

  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var hasSplit = typeof window.SplitType !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* -----------------------------------------------------------------
     01. PRODUCT DATA — the entire section is generated from this array.
         Add or remove a lock by editing this list only.
     ----------------------------------------------------------------- */
  var PRODUCTS = [
    {
      model: 'T66', name: 'T66 Zaha Hadid', tag: 'T66 · Designer Edition',
      tagline: 'Co-designed with the Zaha Hadid studio — sculptural, uncompromising security.',
      features: ['Zaha Hadid Studio Collaboration', 'Palm Vein & Facial Recognition', 'Swedish FPC Fingerprint Sensor', 'CNC-Precision Tempered Glass'],
      thumb: 'images/t66 cover.png', image: 'images/t66 p.png', url: 't66zaha.html'
    },
    {
      model: 'T9', name: 'T9 Smart Lock', tag: 'T9 · Smart Lock',
      tagline: 'Swarovski crystal craftsmanship meets military-grade fingervein recognition.',
      features: ['Genuine Swarovski Crystal', '3D Facial Recognition', 'Military-Grade Fingervein Scan', 'Inner & Outer Anti-Pinch Design'],
      thumb: 'images/lock_t9.png', image: 'images/t9 p.png', url: 't9.html'
    },
    {
      model: 'T5+', name: 'T5+ Smart Lock', tag: 'T5+ · Smart Lock',
      tagline: 'CNC-crafted elegance with genuine Swarovski detailing.',
      features: ['Genuine Swarovski Crystal', '4-Inch HD Visual Peephole', 'Virtual Password Protection', 'Ergonomic CNC Handle'],
      thumb: 'images/lock_t5plus.png', image: 'images/T5 p.png', url: 't5plus.html'
    },
    {
      model: 'T50', name: 'T50 Smart Lock', tag: 'T50 · Smart Lock',
      tagline: 'Palm vein and Face ID, disappearing seamlessly into your door.',
      features: ['Military-Grade Fingervein Scan', '4-Inch HD Visual Peephole', 'Virtual Password Protection', 'Multi-Layer Alarm System'],
      thumb: 'images/lock_t50.png', image: 'images/t50 p.png', url: 't50.html'
    },
    {
      model: 'T3+', name: 'T3+ Smart Lock', tag: 'T3+ · Smart Lock',
      tagline: 'Fingerprint-first security, simple and bulletproof.',
      features: ['Sweden FPC Fingerprint Sensor', '4-Inch Visual Intercom', 'IC Card & NFC Unlock', 'Hijacking Alarm'],
      thumb: 'images/lock_t3plus.png', image: 'images/t3 p.png', url: 't3plus.html'
    },
    {
      model: 'T53s', name: 'T53s Smart Lock', tag: 'T53s · Smart Lock',
      tagline: 'Triple biometric precision, built to perform for decades.',
      features: ['Genuine Swarovski Crystal', '4-Inch HD Visual Peephole', 'Virtual Password Protection', 'Ergonomic CNC Handle'],
      thumb: 'images/lock_t53s.png', image: 'images/T53 p.png', url: 't53s.html'
    },
    {
      model: 'F102', name: 'F102 Smart Lock', tag: 'F102 · Smart Lock',
      tagline: 'Three biometric layers, one seamless sweep.',
      features: ['Dual Mode Office Access', 'IC Card Unlock', 'One-Grip Fingerprint Entry', 'Virtual Passcode Security'],
      thumb: 'images/lock_f102.png', image: 'images/f102 p.png', url: 'f102.html'
    },
    {
      model: 'T2', name: 'T2 Lever Lock', tag: 'T2 · Lever Lock',
      tagline: 'A smart lever that adapts to your door, and your life.',
      features: ['Swedish FPC Fingerprint Sensor', 'One-Grip Unlock', 'IC Card Access', 'Anti-Peeping Passcode'],
      thumb: 'images/lock_t2lever.png', image: 'images/t2 p.png', url: 't2.html'
    },
    {
      model: 'T23', name: 'T23 Lever Lock', tag: 'T23 · Lever Lock',
      tagline: 'Refined lever ergonomics, next-generation access intelligence.',
      features: ['Swedish FPC Fingerprint Sensor', 'One-Grip Unlock', 'IC Card Access', 'Dual App Support'],
      thumb: 'images/lock_t23lever.png', image: 'images/t23 p.png', url: 't23.html'
    },
    {
      model: 'T17', name: 'T17 Lever Lock', tag: 'T17 · Lever Lock',
      tagline: 'Understated intelligence for everyday entry.',
      features: ['Swedish FPC Fingerprint Sensor', 'One-Grip Unlock', 'IC Card Access', 'Dual App Support'],
      thumb: 'images/lock_t17lever.png', image: 'images/t17 p.png', url: 't17.html'
    }
  ];

  var thumbsEl = document.getElementById('showcaseThumbs');
  var stageEl = document.getElementById('showcaseStage');
  var infoParallaxEl = document.getElementById('showcaseInfoParallax');
  var infoEl = document.getElementById('showcaseInfo');
  var progressFill = document.getElementById('showcaseProgressFill');

  /* -----------------------------------------------------------------
     02. RENDER — floating dock row (thumbnails) + stacked stage images
     ----------------------------------------------------------------- */
  PRODUCTS.forEach(function (p, i) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'showcase-thumb' + (i === 0 ? ' is-active' : '');
    btn.setAttribute('data-index', String(i));
    btn.setAttribute('aria-label', 'View ' + p.name);
    var img = document.createElement('img');
    img.src = p.thumb; img.alt = ''; img.loading = 'lazy';
    var label = document.createElement('span');
    label.className = 'showcase-thumb-label';
    label.textContent = p.name;
    var dot = document.createElement('span');
    dot.className = 'showcase-thumb-dot';
    btn.appendChild(img);
    btn.appendChild(label);
    btn.appendChild(dot);
    thumbsEl.appendChild(btn);
  });

  PRODUCTS.forEach(function (p, i) {
    var img = document.createElement('img');
    img.className = 'showcase-stage-img';
    img.src = p.image;
    img.alt = p.name;
    img.loading = i === 0 ? 'eager' : 'lazy';
    if (i === 0) { img.style.opacity = '1'; }
    stageEl.appendChild(img);
  });

  var thumbEls = Array.prototype.slice.call(thumbsEl.querySelectorAll('.showcase-thumb'));
  var stageImgs = Array.prototype.slice.call(stageEl.querySelectorAll('.showcase-stage-img'));
  var activeIndex = 0;

  /* -----------------------------------------------------------------
     03. INFO PANEL — render + character/blur/slide transition
     ----------------------------------------------------------------- */

  // main.js binds [data-magnetic] once, on initial page load, so a CTA
  // re-created later by innerHTML replacement would otherwise miss the
  // magnetic hover effect. Re-bind it locally every time this panel renders.
  function bindMagnetic(el) {
    if (!finePointer || reduceMotion) return;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      el.style.transform = 'translate(' + (x * 0.35).toFixed(1) + 'px,' + (y * 0.35).toFixed(1) + 'px)';
    });
    el.addEventListener('mouseleave', function () { el.style.transform = 'translate(0,0)'; });
  }

  function infoMarkup(p) {
    return (
      '<p class="showcase-info-tag">' + p.tag + '</p>' +
      '<h2 id="showcaseTitle">' + p.name + '</h2>' +
      '<p class="showcase-tagline">' + p.tagline + '</p>' +
      '<ul class="showcase-features">' + p.features.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul>' +
      '<a href="' + p.url + '" class="showcase-cta" data-magnetic>Experience ' + p.model + ' <span class="arrow">→</span></a>'
    );
  }

  function animateInfoIn() {
    if (!hasGSAP) return;
    var body = infoEl.querySelectorAll('.showcase-tagline, .showcase-features, .showcase-cta');
    gsap.set(body, { opacity: 0, y: 16 });
    gsap.to(body, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' });

    var titleEl = document.getElementById('showcaseTitle');
    if (hasSplit && titleEl) {
      var split = new SplitType(titleEl, { types: 'chars', charClass: 'sc-char' });
      gsap.fromTo(split.chars, { opacity: 0, yPercent: 60, rotate: 4 },
        { opacity: 1, yPercent: 0, rotate: 0, duration: 0.55, stagger: 0.012, ease: 'power3.out' });
    } else if (titleEl) {
      gsap.from(titleEl, { opacity: 0, y: 16, duration: 0.5, ease: 'power3.out' });
    }
  }

  /* -----------------------------------------------------------------
     04. SWITCH PRODUCT — crossfades the stage image, transitions the
         info panel, and syncs the active thumbnail highlight.
     ----------------------------------------------------------------- */
  function goTo(index) {
    if (index === activeIndex || index < 0 || index >= PRODUCTS.length) return;
    var dir = index > activeIndex ? 1 : -1;
    var prevIndex = activeIndex;
    activeIndex = index;

    thumbEls.forEach(function (t, i) { t.classList.toggle('is-active', i === index); });

    if (hasGSAP && !reduceMotion) {
      gsap.to(stageImgs[prevIndex], {
        opacity: 0, scale: 0.88, y: -26 * dir, rotate: -3 * dir,
        duration: 0.55, ease: 'power3.inOut'
      });
      gsap.fromTo(stageImgs[index],
        { opacity: 0, scale: 0.88, y: 26 * dir, rotate: 3 * dir },
        { opacity: 1, scale: 1, y: 0, rotate: 0, duration: 0.7, ease: 'power3.out', delay: 0.08 }
      );

      gsap.to(infoEl, {
        opacity: 0, y: -12, filter: 'blur(6px)', duration: 0.25, ease: 'power2.in',
        onComplete: function () {
          infoEl.innerHTML = infoMarkup(PRODUCTS[index]);
          bindMagnetic(infoEl.querySelector('.showcase-cta'));
          // Snap the container itself straight to its resting state — no
          // second container-level fade here. animateInfoIn() below is the
          // only "in" animation; its children start pre-hidden via gsap.set
          // before ever painting, so there is no visible flash beforehand.
          gsap.set(infoEl, { opacity: 1, y: 0, filter: 'blur(0px)' });
          animateInfoIn();
        }
      });
    } else {
      stageImgs.forEach(function (im, i) { im.style.opacity = i === index ? '1' : '0'; });
      infoEl.innerHTML = infoMarkup(PRODUCTS[index]);
      bindMagnetic(infoEl.querySelector('.showcase-cta'));
    }
  }

  infoEl.innerHTML = infoMarkup(PRODUCTS[0]);
  bindMagnetic(infoEl.querySelector('.showcase-cta'));

  /* -----------------------------------------------------------------
     05. THUMBNAIL CLICK — jump straight to a product, and keep the
         pinned scroll position (if active) in sync with it.
     ----------------------------------------------------------------- */
  var pinTrigger = null;
  var lenis = null;
  // While a thumbnail-click scroll animation is in flight, the page
  // scroll position sweeps through every bucket between the old and new
  // product on its way to the target. Left unguarded, ScrollTrigger's
  // onUpdate fires goTo() for each bucket it passes — several crossfades
  // overlapping and racing each other, which reads as rapid blinking.
  // This flag suppresses bucket-driven goTo() calls for the duration of
  // that programmatic scroll; the immediate goTo(i) below already shows
  // the right product, so nothing is lost by ignoring the ones in between.
  var isProgrammaticScroll = false;

  thumbEls.forEach(function (t, i) {
    t.addEventListener('click', function () {
      goTo(i);
      if (pinTrigger) {
        var target = pinTrigger.start + (i / (PRODUCTS.length - 1)) * (pinTrigger.end - pinTrigger.start);
        isProgrammaticScroll = true;
        var release = function () { isProgrammaticScroll = false; };
        if (lenis) { lenis.scrollTo(target, { duration: 1, onComplete: release }); }
        else { window.scrollTo({ top: target, behavior: 'smooth' }); setTimeout(release, 900); }
      }
    });
  });

  /* -----------------------------------------------------------------
     06. LENIS + GSAP TICKER — buttery eased scroll, synced to
         ScrollTrigger so the pin/scrub never desyncs from it.
     ----------------------------------------------------------------- */
  if (hasLenis && hasGSAP && !reduceMotion) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    if (hasST) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* -----------------------------------------------------------------
     07. PIN + SCRUB — desktop only. Each bucket of scroll progress
         maps to one product; the crossfade only fires when the bucket
         actually changes, so it reads as discrete "steps" driven by a
         continuous, lag-free scrub rather than raw wheel-event hijacking.
     ----------------------------------------------------------------- */
  if (hasST && !reduceMotion) {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1025px)', function () {
      var st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=' + (PRODUCTS.length * 85) + '%',
        pin: true,
        anticipatePin: 1,
        scrub: 0.8,
        onUpdate: function (self) {
          progressFill.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')';
          if (isProgrammaticScroll) return;
          var idx = Math.floor(self.progress * PRODUCTS.length);
          if (idx > PRODUCTS.length - 1) idx = PRODUCTS.length - 1;
          if (idx < 0) idx = 0;
          if (idx !== activeIndex) goTo(idx);
        }
      });
      pinTrigger = st;
      return function () { pinTrigger = null; st.kill(); };
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    window.addEventListener('load', function () { setTimeout(function () { ScrollTrigger.refresh(); }, 300); });
  }

  /* -----------------------------------------------------------------
     08. SUBTLE MOUSE PARALLAX — desktop with a fine pointer only.
     ----------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    var px = 0, py = 0, tx = 0, ty = 0;
    section.addEventListener('mousemove', function (e) {
      var r = section.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    (function loop() {
      tx += (px - tx) * 0.06;
      ty += (py - ty) * 0.06;
      stageEl.style.transform = 'translate(' + (tx * 5).toFixed(1) + 'px,' + (ty * 5).toFixed(1) + 'px)';
      infoParallaxEl.style.transform = 'translate(' + (tx * 3).toFixed(1) + 'px,' + (ty * 3).toFixed(1) + 'px)';
      thumbsEl.style.transform = 'translate(' + (tx * 2).toFixed(1) + 'px,' + (ty * 2).toFixed(1) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* -----------------------------------------------------------------
     09. DOCK MAGNIFICATION — macOS-dock-style proximity scaling. Each
         icon's own transform is fully owned by this loop (CSS never sets
         a transform on .showcase-thumb at rest), so there is nothing for
         the two to fight over. Fine-pointer only: touch devices get a
         static row plus a tap-scale via the CSS :active rule instead.
     ----------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    var dockActive = false;
    var dockMouseX = 0;
    var MAX_SCALE = 1.65;
    var SIGMA = 90;

    thumbsEl.addEventListener('mousemove', function (e) {
      dockMouseX = e.clientX;
      dockActive = true;
    });
    thumbsEl.addEventListener('mouseleave', function () { dockActive = false; });

    (function dockLoop() {
      thumbEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var center = rect.left + rect.width / 2;
        var scale = 1, lift = 0;
        if (dockActive) {
          var dist = dockMouseX - center;
          var falloff = Math.exp(-(dist * dist) / (2 * SIGMA * SIGMA));
          scale = 1 + (MAX_SCALE - 1) * falloff;
          lift = -16 * falloff;
        }
        el.style.transform = 'translateY(' + lift.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
        el.style.zIndex = String(Math.round(scale * 100));
      });
      requestAnimationFrame(dockLoop);
    })();
  }

})();
