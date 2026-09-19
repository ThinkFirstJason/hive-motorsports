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
  var countEls = document.querySelectorAll('[data-count-to]');

  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count-to'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = null;
    function step(ts){
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

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

    var countIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    countEls.forEach(function(el){ countIo.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in-view'); });
    countEls.forEach(function(el){ animateCount(el); });
  }

  /* ---- Interactive hex grid: cursor-reactive honeycomb backdrop ----
     Static grid is cached once per resize; each frame only redraws a small
     glow region around the cursor instead of the whole grid, so the loop
     stays cheap even though it runs indefinitely. */
  (function initHexCanvas(){
    var canvas = document.getElementById('hexCanvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var finePointer = window.matchMedia('(pointer: fine)').matches;

    var W = 0, H = 0, DPR = 1;
    var mouseX = -9999, mouseY = -9999;
    var targetX = -9999, targetY = -9999;
    var scrollY = window.scrollY;
    var hexPoints = [];
    var baseCanvas = document.createElement('canvas');
    var baseCtx = baseCanvas.getContext('2d');

    var HEX_R = 40;
    var HEX_W = HEX_R * 2;
    var HEX_H = Math.sqrt(3) * HEX_R;
    var GLOW_RADIUS = 220;

    function drawHex(g, cx, cy, r){
      g.beginPath();
      for (var i = 0; i < 6; i++){
        var angle = (Math.PI / 180) * (60 * i);
        var x = cx + r * Math.cos(angle);
        var y = cy + r * Math.sin(angle);
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      }
      g.closePath();
      g.stroke();
    }

    function buildGrid(){
      var cols = Math.ceil(W / (HEX_W * 0.75)) + 2;
      var rows = Math.ceil(H / HEX_H) + 2;
      hexPoints = [];
      for (var col = -1; col < cols; col++){
        for (var row = -1; row < rows; row++){
          var x = col * HEX_W * 0.75;
          var y = row * HEX_H + (col % 2 === 0 ? 0 : HEX_H / 2);
          hexPoints.push({ x: x, y: y });
        }
      }
    }

    function paintBase(){
      baseCanvas.width = canvas.width;
      baseCanvas.height = canvas.height;
      baseCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
      baseCtx.clearRect(0, 0, W, H);
      baseCtx.strokeStyle = 'rgba(212,200,48,0.06)';
      baseCtx.lineWidth = 1;
      for (var i = 0; i < hexPoints.length; i++){
        drawHex(baseCtx, hexPoints[i].x, hexPoints[i].y, HEX_R);
      }
    }

    function resize(){
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildGrid();
      paintBase();
    }
    resize();
    window.addEventListener('resize', resize);

    if (reduceMotion) {
      ctx.drawImage(baseCanvas, 0, 0, W, H);
      return;
    }

    window.addEventListener('mousemove', function(e){
      targetX = e.clientX;
      targetY = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseleave', function(){
      targetX = -9999; targetY = -9999;
    });
    window.addEventListener('scroll', function(){
      scrollY = window.scrollY;
    }, { passive: true });

    var paused = false;
    document.addEventListener('visibilitychange', function(){
      paused = document.hidden;
      if (!paused) requestAnimationFrame(frame);
    });

    var t0 = performance.now();
    function frame(now){
      if (paused) return;
      mouseX += (targetX - mouseX) * 0.12;
      mouseY += (targetY - mouseY) * 0.12;

      var breathe = 0.5 + 0.5 * Math.sin((now - t0) / 2600) * 0.4 + 0.6;
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = Math.min(1, breathe);
      ctx.drawImage(baseCanvas, 0, 0, W, H);
      ctx.globalAlpha = 1;

      if (finePointer && mouseX > -1000) {
        var reach = GLOW_RADIUS + HEX_R;
        for (var i = 0; i < hexPoints.length; i++){
          var p = hexPoints[i];
          var dx = p.x - mouseX;
          var dy = p.y - mouseY;
          if (dx > reach || dx < -reach || dy > reach || dy < -reach) continue;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > reach) continue;
          var glow = 1 - dist / reach;
          glow = glow * glow;
          ctx.strokeStyle = 'rgba(212,200,48,' + Math.min(1, 0.1 + glow * 0.6).toFixed(3) + ')';
          ctx.lineWidth = 1 + glow * 1.5;
          drawHex(ctx, p.x, p.y, HEX_R);
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

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
