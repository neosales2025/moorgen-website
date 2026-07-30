/* =====================================================================
   INERTIA (MOMENTUM) SCROLLING
   Drives the real window scroll position with an eased lerp instead of
   faking it with a transformed wrapper, so position:sticky, anchor
   links, keyboard nav, and accessibility all keep working untouched.
   ===================================================================== */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(pointer: coarse)').matches) return; // touch already has native momentum scroll

  var EASE = 0.09;
  var target = window.scrollY;
  var current = window.scrollY;
  var ticking = false;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function clamp(v) {
    return Math.max(0, Math.min(v, maxScroll()));
  }

  function startLoop() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  function tick() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.05) {
      current = target;
      window.scrollTo(0, current);
      ticking = false;
      return;
    }
    window.scrollTo(0, current);
    requestAnimationFrame(tick);
  }

  function onWheel(e) {
    if (e.ctrlKey) return; // let pinch-zoom through
    e.preventDefault();
    target = clamp(target + e.deltaY);
    startLoop();
  }

  var KEY_DELTA = {
    ArrowDown: function () { return 100; },
    ArrowUp: function () { return -100; },
    PageDown: function () { return window.innerHeight * 0.9; },
    PageUp: function () { return -window.innerHeight * 0.9; },
    ' ': function () { return window.innerHeight * 0.9; },
    Home: function () { return -target; },
    End: function () { return maxScroll() - target; }
  };

  function onKeydown(e) {
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    var getDelta = KEY_DELTA[e.key];
    if (!getDelta) return;
    e.preventDefault();
    target = clamp(target + getDelta());
    startLoop();
  }

  function onScroll() {
    // resync if something else moved the page (anchor jump, browser find, etc.)
    if (!ticking) {
      target = window.scrollY;
      current = window.scrollY;
    }
  }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKeydown);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
