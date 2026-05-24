// ---------- animated falling leaves canvas ----------
(() => {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let w = 0;
  let h = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let leaves = [];
  let raf = 0;

  function resize() {
    w = canvas.clientWidth = window.innerWidth;
    h = canvas.clientHeight = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    spawn();
  }

  function spawn() {
    const target = Math.min(
      80,
      Math.max(24, Math.floor((w * h) / 26000))
    );
    leaves = new Array(target).fill(0).map(() => makeLeaf(true));
  }

  function makeLeaf(initial) {
    const size = 2 + Math.random() * 3.5;
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : -10 - Math.random() * 60,
      size,
      vy: 0.15 + Math.random() * 0.45,
      vx: -0.25 + Math.random() * 0.5,
      rot: Math.random() * Math.PI * 2,
      vrot: -0.01 + Math.random() * 0.02,
      hue: 140 + Math.random() * 50,
      alpha: 0.18 + Math.random() * 0.4,
    };
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < leaves.length; i++) {
      const l = leaves[i];
      l.x += l.vx + Math.sin((l.y + i) * 0.012) * 0.4;
      l.y += l.vy;
      l.rot += l.vrot;

      if (l.y > h + 12 || l.x < -20 || l.x > w + 20) {
        leaves[i] = makeLeaf(false);
        continue;
      }

      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.globalAlpha = l.alpha;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, l.size * 2);
      grad.addColorStop(0, `hsla(${l.hue}, 100%, 70%, 1)`);
      grad.addColorStop(1, `hsla(${l.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, l.size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    raf = requestAnimationFrame(frame);
  }

  if (prefersReduced) return;
  resize();
  raf = requestAnimationFrame(frame);

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else if (!prefersReduced) {
      raf = requestAnimationFrame(frame);
    }
  });
})();

// ---------- counter animation on scroll ----------
(() => {
  const targets = document.querySelectorAll("[data-count]");
  if (!targets.length || !("IntersectionObserver" in window)) {
    targets.forEach((el) => {
      el.textContent =
        el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
    return;
  }

  const animate = (el) => {
    const end = parseFloat(el.getAttribute("data-count")) || 0;
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1400;
    const start = performance.now();
    const startVal = 0;

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(startVal + (end - startVal) * eased);
      el.textContent = val.toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  targets.forEach((t) => io.observe(t));
})();

// ---------- reveal on scroll ----------
(() => {
  const items = document.querySelectorAll(
    ".card, .crew-card, .project, .stat, .section-head, .join-card"
  );
  if (!("IntersectionObserver" in window)) return;

  items.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition =
      "opacity 0.7s cubic-bezier(0.2,0.7,0.2,1), transform 0.7s cubic-bezier(0.2,0.7,0.2,1)";
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const el = e.target;
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, i * 40);
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => io.observe(el));
})();

// ---------- footer year ----------
(() => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
