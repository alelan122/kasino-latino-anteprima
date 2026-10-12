/*
 * Kasino Latino · i ritocchi che il CSS da solo non sa fare.
 * Tutto è facoltativo: senza questo file il sito funziona lo stesso.
 *
 *  - numeri che contano (2012, 3, 4)
 *  - foto grande che scorre più lenta (effetto profondità)
 *  - staff da trascinare col mouse
 *  - Esc e frecce nella gallery, Esc nel menu del telefono
 *  - comparse delle sezioni e barra in alto sui browser senza animazioni
 *    legate allo scroll (Safari, Firefox)
 */
(function () {
  var html = document.documentElement;
  var fermo = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollCss = window.CSS && CSS.supports('animation-timeline: view()');

  html.classList.add('js');
  if (!scrollCss && !fermo) html.classList.add('js-reveal');

  document.addEventListener('DOMContentLoaded', function () {
    var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

    /* ---- comparse (solo dove il CSS non ci arriva) ---- */
    if (html.classList.contains('js-reveal') && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (voci) {
        voci.forEach(function (v) {
          if (!v.isIntersecting) return;
          v.target.classList.add('is-in');
          io.unobserve(v.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      $$('.reveal').forEach(function (el) { io.observe(el); });
    } else {
      html.classList.remove('js-reveal');
    }

    /* ---- barra in alto e pulsante WhatsApp (solo dove il CSS non ci arriva) ---- */
    var nav = document.querySelector('.nav--home');
    var fab = document.querySelector('.fab');
    if (!scrollCss) {
      var aggiorna = function () {
        var y = window.scrollY;
        if (nav) nav.classList.toggle('is-scrolled', y > 40);
        if (fab) fab.classList.toggle('is-on', y > window.innerHeight * 0.6);
      };
      aggiorna();
      window.addEventListener('scroll', aggiorna, { passive: true });
    }

    /* ---- numeri che contano ---- */
    var conta = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (!v.isIntersecting) return;
        var el = v.target, fine = +el.dataset.count;
        conta.unobserve(el);
        if (fermo) return;
        var inizio = fine > 100 ? fine - 14 : 0, t0 = performance.now(), durata = 1200;
        (function passo(t) {
          var p = Math.min((t - t0) / durata, 1);
          el.textContent = Math.round(inizio + (fine - inizio) * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(passo);
        })(t0);
      });
    }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { conta.observe(el); });

    /* ---- effetto profondità sulla foto grande ---- */
    var sfondo = document.querySelector('.hero__bg');
    if (sfondo && !fermo) {
      var inAttesa = false;
      window.addEventListener('scroll', function () {
        if (inAttesa) return;
        inAttesa = true;
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y < window.innerHeight) sfondo.style.transform = 'translateY(' + y * 0.25 + 'px)';
          inAttesa = false;
        });
      }, { passive: true });
    }

    /* ---- staff: trascina col mouse ---- */
    var crew = document.querySelector('.crew');
    if (crew) {
      var giu = false, x0 = 0, s0 = 0, mosso = false;
      crew.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse') return;
        giu = true; mosso = false; x0 = e.clientX; s0 = crew.scrollLeft;
      });
      window.addEventListener('pointermove', function (e) {
        if (!giu) return;
        var dx = e.clientX - x0;
        if (Math.abs(dx) > 4) { mosso = true; crew.classList.add('is-drag'); }
        crew.scrollLeft = s0 - dx;
      });
      window.addEventListener('pointerup', function () { giu = false; crew.classList.remove('is-drag'); });
      crew.addEventListener('click', function (e) { if (mosso) e.preventDefault(); }, true);
    }

    /* ---- tastiera: gallery e menu ---- */
    document.addEventListener('keydown', function (e) {
      var aperto = null;
      try { aperto = location.hash && document.querySelector(location.hash + ':target'); } catch (err) { return; }
      if (!aperto) return;
      var clicca = function (sel) { var a = aperto.querySelector(sel); if (a) { e.preventDefault(); a.click(); } };
      if (aperto.classList.contains('lb')) {
        if (e.key === 'Escape') clicca('.lb__close');
        if (e.key === 'ArrowLeft') clicca('.lb__prev');
        if (e.key === 'ArrowRight') clicca('.lb__next');
      } else if (aperto.id === 'menu' && e.key === 'Escape') {
        clicca('.menu__chiudi');
      }
    });
  });
})();
