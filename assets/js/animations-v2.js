(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = window.matchMedia && window.matchMedia('(hover: none)').matches;
  window.__heroScroll = 0;

  /* ---------- PRELOADER ---------- */
  (function () {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    if (prefersReduced) { pre.style.display = 'none'; return; }
    var countEl = pre.querySelector('.pl-count .n');
    var obj = { v: 0 };
    gsap.to(obj, {
      v: 100, duration: 1.5, ease: 'power1.inOut',
      onUpdate: function () { if (countEl) countEl.textContent = Math.round(obj.v); },
      onComplete: function () {
        gsap.to(pre, {
          autoAlpha: 0, duration: 0.6, delay: 0.1, ease: 'power2.inOut',
          onComplete: function () { pre.style.display = 'none'; pre.classList.add('is-done'); }
        });
      }
    });
  })();

  /* ---------- LENIS (smooth scroll) ---------- */
  if (!prefersReduced && typeof Lenis !== 'undefined') {
    var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('has-lenis');
  }

  /* ---------- VÍDEOS DE FUNDO: carrega/toca só perto da viewport, pausa fora dela ---------- */
  /* Evita baixar e decodificar ~34MB de vídeo de uma vez só no mobile. */
  (function () {
    var videos = document.querySelectorAll('video[data-bgvideo]');
    if (!videos.length) return;

    if (!('IntersectionObserver' in window)) {
      videos.forEach(function (v) { v.play().catch(function () {}); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { rootMargin: '200px 0px' });

    videos.forEach(function (v) { io.observe(v); });
  })();

  /* ---------- CURSOR CUSTOMIZADO ---------- */
  (function () {
    if (prefersReduced || noHover) return;
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;
    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    gsap.ticker.add(function () {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    });
    document.querySelectorAll('a, button, .faq-q').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-active'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-active'); });
    });
  })();

  /* ---------- HEADER: estado ao rolar ---------- */
  (function () {
    var header = document.querySelector('header');
    if (!header) return;
    ScrollTrigger.create({
      start: 80, end: 99999,
      onUpdate: function (self) { header.classList.toggle('is-solid', self.scroll() > 80); }
    });
  })();

  /* ---------- MENU MOBILE (valores exatos extraídos do bundle da referência) ---------- */
  (function () {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (!toggle || !menu) return;

    var links = menu.querySelectorAll('.nav-link, .btn-glow');
    var open = false;

    var tl = gsap.timeline({ paused: true })
      .fromTo(menu,
        { clipPath: 'circle(0% at 95% 5%)', scale: 0.9, rotation: 2, autoAlpha: 0 },
        { clipPath: 'circle(150% at 0% 5%)', scale: 1, rotation: 0, autoAlpha: 1, duration: 1.2, ease: 'power3.inOut' }
      )
      .fromTo(links, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.07, ease: 'power2.out' }, '-=0.9');
    tl.eventCallback('onReverseComplete', function () { menu.style.pointerEvents = 'none'; });

    function setOpen(next) {
      open = next;
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (open) { menu.style.pointerEvents = 'auto'; tl.timeScale(1).play(); }
      else { tl.timeScale(1.6).reverse(); }
    }

    toggle.addEventListener('click', function () { setOpen(!open); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
    window.addEventListener('resize', function () { if (open && window.innerWidth > 860) setOpen(false); });
  })();

  /* ---------- HERO: entrada + sincronismo com o scroll ---------- */
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    gsap.timeline({ delay: prefersReduced ? 0 : 0.15 })
      .fromTo('.hero-badge', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' })
      .fromTo('.hero h1', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, '-=0.45')
      .fromTo('.hero p.sub', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .fromTo('.hero-ctas', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, '-=0.45')
      .fromTo('.trust-chips span', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.35')
      .fromTo('.hero-meta', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, '-=0.5')
      .fromTo('.scroll-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, '-=0.2');

    if (prefersReduced) return;

    var canvas = document.getElementById('hero-canvas');
    var cue = document.querySelector('.scroll-cue');

    ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.6,
      onUpdate: function (self) {
        window.__heroScroll = self.progress;
        if (canvas) canvas.style.opacity = String(1 - self.progress * 0.85);
      }
    });

    if (cue) {
      gsap.to(cue, { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: '15% top', scrub: true } });
    }
  })();

  /* ---------- GIANT TEXT (Sobre): reveal blur-to-sharp por linha ---------- */
  (function () {
    var lines = gsap.utils.toArray('.gt-line');
    if (!lines.length) return;

    if (prefersReduced) { gsap.set(lines, { autoAlpha: 1, y: 0, filter: 'blur(0px)' }); return; }

    gsap.fromTo(lines,
      { autoAlpha: 0, y: 24, filter: 'blur(6px)' },
      {
        autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power2.out',
        scrollTrigger: { trigger: '.giant-text', start: 'top 80%', once: true }
      }
    );
  })();

  /* ---------- SOBRE: vídeo de fundo com parallax de scroll ---------- */
  (function () {
    var wrap = document.querySelector('.giant-text-wrap');
    var video = wrap ? wrap.querySelector('.gt-bg-video') : null;
    if (!wrap || !video || prefersReduced) return;

    gsap.fromTo(video,
      { scale: 1.18, autoAlpha: .5 },
      {
        scale: 1, autoAlpha: .85, ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top bottom', end: 'top top', scrub: 0.6 }
      }
    );
    gsap.to(video, {
      scale: 1.1, ease: 'none',
      scrollTrigger: { trigger: wrap, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
  })();

  /* ---------- PALAVRAS PERSUASIVAS: flip 3D trocando a fonte ---------- */
  (function () {
    var words = gsap.utils.toArray('.word-flip .wf-inner');
    if (!words.length || prefersReduced) return;

    gsap.fromTo(words,
      { rotateX: 0 },
      {
        rotateX: 180, ease: 'none', stagger: 0.15,
        scrollTrigger: { trigger: '.giant-text', start: 'top 75%', end: 'bottom 25%', scrub: 0.6 }
      }
    );
  })();

  /* ---------- FAIXAS (bands): parallax horizontal ao scroll ---------- */
  (function () {
    var stack = document.querySelector('.band-stack');
    var rows = gsap.utils.toArray('.band-row');
    if (!stack || !rows.length || prefersReduced) return;

    rows.forEach(function (row, i) {
      var track = row.querySelector('.band-track');
      if (!track) return;
      var dir = i % 2 === 0 ? -1 : 1;
      gsap.to(track, {
        xPercent: dir * 16, ease: 'none',
        scrollTrigger: { trigger: stack, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });
  })();

  /* ---------- REVEAL ON SCROLL (sistema genérico) ---------- */
  (function () {
    var groups = [
      { sel: '.section-head', y: 24 },
      { sel: '.fact-card', y: 34, stagger: true, groupSel: '.facts-grid', rotate: true },
      { sel: '.service-card', y: 30, stagger: true, groupSel: '.services-grid', rotate: true },
      { sel: '.tl-step', y: 26, stagger: true, groupSel: '.timeline' },
      { sel: '.faq-item', y: 18, stagger: true, groupSel: '.faq-list' },
      { sel: '.cta-head', y: 24 }
    ];

    groups.forEach(function (g) {
      var els = gsap.utils.toArray(g.sel);
      if (!els.length) return;

      if (prefersReduced) {
        gsap.set(els, { autoAlpha: 1, y: 0, rotateX: 0 });
        return;
      }

      var triggerEl = g.groupSel ? document.querySelector(g.groupSel) : els[0];
      var fromVars = { y: g.y, autoAlpha: 0, rotateX: g.rotate ? -8 : 0 };
      if (g.rotate) fromVars.transformPerspective = 600;
      gsap.fromTo(els, fromVars,
        {
          y: 0, autoAlpha: 1, rotateX: 0, duration: 0.8, ease: 'power2.out',
          stagger: g.stagger ? 0.12 : 0,
          scrollTrigger: { trigger: triggerEl, start: 'top 88%', once: true }
        }
      );
    });
  })();

  /* ---------- SERVIÇOS: pin gigante com o chip 3D ---------- */
  (function () {
    var wrap = document.querySelector('.pin-stack-inner');
    var words = gsap.utils.toArray('.pin-word');
    var panels = gsap.utils.toArray('.pin-panel');
    var chip = document.querySelector('.pin-chip');
    if (!wrap || !words.length) return;

    function setActive(idx) {
      words.forEach(function (w, i) { w.classList.toggle('is-active', i === idx); });
      panels.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
    }
    setActive(0);

    if (prefersReduced) return;

    function onPinUpdate(self) {
      var idx = Math.min(words.length - 1, Math.floor(self.progress * words.length));
      setActive(idx);
      if (chip) {
        gsap.set(chip, {
          scale: 1 + self.progress * 0.22,
          rotation: self.progress * 6,
          opacity: 0.9 - Math.abs(self.progress - 0.5) * 0.25
        });
      }
    }

    /* No mobile a distância de pin é menor: 300% de scroll travado fica pesado e
       cansativo em telas pequenas, ainda mais com vídeo de fundo tocando junto. */
    ScrollTrigger.matchMedia({
      '(min-width: 761px)': function () {
        ScrollTrigger.create({ trigger: wrap, start: 'top top', end: '+=300%', pin: true, scrub: 0.6, anticipatePin: 1, onUpdate: onPinUpdate });
      },
      '(max-width: 760px)': function () {
        ScrollTrigger.create({ trigger: wrap, start: 'top top', end: '+=160%', pin: true, scrub: 0.6, anticipatePin: 1, onUpdate: onPinUpdate });
      }
    });
  })();

  /* ---------- CASE REEL: sequência cinematográfica pinada, um painel por vez ---------- */
  (function () {
    var pin = document.querySelector('.reel-pin');
    var panels = gsap.utils.toArray('.reel-panel');
    var dots = gsap.utils.toArray('.reel-dot');
    if (!pin || !panels.length) return;

    var n = panels.length;

    function setActive(idx) {
      panels.forEach(function (p, i) { p.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === idx); });
    }
    setActive(0);

    if (prefersReduced) {
      panels.forEach(function (p) { p.classList.add('is-active'); });
      return;
    }

    ScrollTrigger.matchMedia({
      '(min-width: 861px)': function () {
        ScrollTrigger.create({
          trigger: pin, start: 'top top', end: '+=' + (n * 60) + '%', pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: function (self) {
            var raw = self.progress * n;
            var idx = Math.min(n - 1, Math.floor(raw));
            setActive(idx);
            gsap.set(panels[idx], { scale: 1 + (raw - idx) * 0.06 });
          }
        });
      },
      '(max-width: 860px)': function () {
        panels.forEach(function (p) { p.classList.add('is-active'); });
      }
    });
  })();

  /* ---------- PROCESSO: linha do tempo desenhando ---------- */
  (function () {
    var section = document.getElementById('processo');
    var line = section ? section.querySelector('.timeline-line') : null;
    var dots = section ? section.querySelectorAll('.tl-dot') : [];
    if (!line) return;

    if (prefersReduced) {
      gsap.set(line, { scaleX: 1 });
      dots.forEach(function (d) { d.classList.add('is-active'); });
      return;
    }

    ScrollTrigger.create({
      trigger: section.querySelector('.timeline'), start: 'top 75%', end: 'bottom 60%', scrub: 0.6,
      onUpdate: function (self) {
        gsap.set(line, { scaleX: self.progress });
        dots.forEach(function (d, i) {
          var threshold = i / Math.max(1, dots.length - 1);
          d.classList.toggle('is-active', self.progress >= threshold - 0.03);
        });
      }
    });
  })();

  /* ---------- FAQ: accordion animado ---------- */
  (function () {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var q = item.querySelector('.faq-q');
      var a = item.querySelector('.faq-a');
      if (!q || !a) return;
      gsap.set(a, { height: 0 });

      q.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            other.classList.remove('is-open');
            gsap.to(other.querySelector('.faq-a'), { height: 0, duration: 0.4, ease: 'power2.inOut' });
          }
        });
        item.classList.toggle('is-open', !isOpen);
        gsap.to(a, { height: isOpen ? 0 : a.scrollHeight, duration: 0.45, ease: 'power2.inOut' });
      });
    });
  })();

  /* ---------- RODAPÉ: horário local + linhas do equalizador ---------- */
  (function () {
    var el = document.querySelector('.local-time');
    if (el) {
      (function update() {
        try {
          var fmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
          el.textContent = 'Passo Fundo, RS · ' + fmt.format(new Date());
        } catch (e) { el.textContent = ''; }
        setTimeout(update, 30000);
      })();
    }

    var eq = document.querySelector('.eq-lines');
    if (eq) {
      var bars = 48;
      for (var i = 0; i < bars; i++) {
        var span = document.createElement('span');
        span.style.height = (12 + Math.random() * 88) + '%';
        eq.appendChild(span);
      }
    }
  })();

  ScrollTrigger.refresh();
})();
