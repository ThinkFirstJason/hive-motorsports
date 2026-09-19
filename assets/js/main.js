(function(){
  'use strict';

  /* ---- Footer year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav: solid background after scroll ---- */
  var nav = document.getElementById('siteNav');
  function onScroll(){
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav toggle ---- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  toggle.addEventListener('click', function(){
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Scroll reveal ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
  }

  /* ---- Subtle hex-grid parallax ---- */
  var hexBg = document.querySelector('.hex-parallax');
  var ticking = false;
  function updateParallax(){
    var y = window.scrollY;
    hexBg.style.transform = 'translate3d(0,' + (y * 0.08) + 'px,0)';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  /* ---- Newsletter form (placeholder submit handling) ---- */
  var form = document.getElementById('newsletterForm');
  var note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      note.textContent = "You're in the hive. Check your inbox.";
      form.reset();
    });
  }
})();
