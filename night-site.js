/* Nightt — night-sky site interactions.
   Decorative + progressive-enhancement only. Content is fully visible
   without JS; this just adds atmosphere and reveals. */
(function () {
  document.documentElement.classList.add('js');

  /* ---------- starfield (two parallax layers) ---------- */
  function seed(el, n, sizeMin, sizeMax) {
    const f = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      const sz = (Math.random() * (sizeMax - sizeMin) + sizeMin).toFixed(2);
      s.style.left = (Math.random() * 100).toFixed(2) + '%';
      s.style.top = (Math.random() * 100).toFixed(2) + '%';
      s.style.width = sz + 'px';
      s.style.height = sz + 'px';
      s.style.setProperty('--d', (Math.random() * 3 + 2.4).toFixed(2) + 's');
      s.style.animationDelay = (Math.random() * 4).toFixed(2) + 's';
      s.style.opacity = (Math.random() * 0.5 + 0.2).toFixed(2);
      f.appendChild(s);
    }
    el.appendChild(f);
  }
  const far = document.getElementById('stars');
  const near = document.getElementById('stars-near');
  if (far) seed(far, 90, 0.6, 1.6);
  if (near) seed(near, 50, 1.2, 2.6);

  /* ---------- hero constellations = a navigable star map ----------
     each cluster is a section; hover reveals it, click flies there. */
  const NODES = [
    { cn: '关于', en: 'About', href: '#about' },
    { cn: '教育', en: 'Education', href: '#education' },
    { cn: '项目', en: 'Projects', href: '#projects' },
    { cn: '获奖', en: 'Awards', href: '#awards' },
    { cn: '发表', en: 'Writing', href: '#publications' },
    { cn: '联系', en: 'Contact', href: '#contact' },
  ];
  const SHAPES = [
    [[0,0],[34,-22],[58,18],[20,40]],
    [[0,0],[40,-10],[70,16],[44,44],[8,30]],
    [[0,0],[30,26],[64,12],[50,-22]],
    [[0,0],[26,-30],[52,2],[30,34]],
    [[0,0],[38,18],[64,-12],[88,16]],
    [[0,0],[24,30],[58,30],[44,-6]],
  ];
  const POS = [
    { x: 14, y: 15 }, { x: 47, y: 12 }, { x: 88, y: 15 },
    { x: 80, y: 40 }, { x: 92, y: 64 }, { x: 74, y: 88 },
  ];
  const host = document.getElementById('hero-cons');
  function flyTo(href) {
    const t = document.querySelector(href);
    if (!t) return;
    document.documentElement.style.scrollBehavior = 'smooth';
    const y = t.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  if (host) {
    NODES.forEach((p, i) => {
      const shape = SHAPES[i % SHAPES.length];
      const pos = POS[i % POS.length];
      const pts = shape.map(([dx, dy]) => [110 + dx, 80 + dy]);
      const svgNS = 'http://www.w3.org/2000/svg';
      const div = document.createElement('div');
      div.className = 'hcon';
      div.style.left = pos.x + '%';
      div.style.top = pos.y + '%';
      div.setAttribute('role', 'link');
      div.setAttribute('tabindex', '0');
      div.setAttribute('aria-label', p.cn + ' ' + p.en);
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('width', '200'); svg.setAttribute('height', '150');
      svg.setAttribute('viewBox', '0 0 200 150');
      for (let k = 1; k < pts.length; k++) {
        const ln = document.createElementNS(svgNS, 'line');
        ln.setAttribute('class', 'cl');
        ln.setAttribute('x1', pts[k-1][0]); ln.setAttribute('y1', pts[k-1][1]);
        ln.setAttribute('x2', pts[k][0]); ln.setAttribute('y2', pts[k][1]);
        svg.appendChild(ln);
      }
      pts.forEach((pt, k) => {
        const c = document.createElementNS(svgNS, 'circle');
        c.setAttribute('class', 'cs' + (k === 0 ? ' hub' : ''));
        c.setAttribute('cx', pt[0]); c.setAttribute('cy', pt[1]);
        c.setAttribute('r', k === 0 ? 3.4 : 2.2);
        svg.appendChild(c);
      });
      div.appendChild(svg);
      const lab = document.createElement('div');
      lab.className = 'lab';
      lab.innerHTML = '<div class="nm">' + p.cn + '</div><div class="tg">' + p.en + ' · 前往 →</div>';
      div.appendChild(lab);
      div.addEventListener('click', () => flyTo(p.href));
      div.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flyTo(p.href); } });
      host.appendChild(div);
    });
  }

  /* ---------- scroll reveal (IntersectionObserver, not animation) ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 0.05) + 's';
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }
  window.addEventListener('load', () => {
    setTimeout(() => reveals.forEach((el) => el.classList.add('in')), 1200);
  });

  /* ---------- nav: scrolled bg, active link, smooth, mobile ---------- */
  const nav = document.getElementById('nav');
  const links = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
    let cur = null;
    const mid = window.scrollY + window.innerHeight * 0.32;
    sections.forEach((s) => { if (s.offsetTop <= mid) cur = s.id; });
    links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) navLinks.classList.remove('open'); });
  }

  /* ---------- project card cursor glow ---------- */
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* ---------- subtle parallax on moon + far stars ---------- */
  let ticking = false;
  const moon = document.querySelector('.moon');
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (moon) moon.style.transform = 'translateY(' + (y * 0.12) + 'px)';
      if (far) far.style.transform = 'translateY(' + (y * 0.04) + 'px)';
      if (near) near.style.transform = 'translateY(' + (y * 0.09) + 'px)';
      ticking = false;
    });
  }, { passive: true });
})();
