/* ===================================================================
   VINAY PODURI — PORTFOLIO SCRIPTS
   Features: Theme, Nav, Scroll progress, Reveal, Counters, Spotlight,
             Typing, Trading-bot simulation, Pipeline animation,
             Timeline fill, Local time, Copy email, Back-to-top
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cssVar = name => getComputedStyle(html).getPropertyValue(name).trim();

  // ===== THEME TOGGLE =====
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  // ===== NAV, PROGRESS, ACTIVE LINK, BACK-TO-TOP, TIMELINE =====
  const navbar = document.getElementById('navbar');
  const progress = document.getElementById('scroll-progress');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('back-to-top');
  const timeline = document.getElementById('timeline');
  const timelineFill = document.getElementById('timeline-fill');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    navbar.classList.toggle('scrolled', y > 20);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    backToTop.classList.toggle('visible', y > 600);

    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop - 140) current = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));

    const rect = timeline.getBoundingClientRect();
    const pct = Math.min(Math.max((window.innerHeight * 0.6 - rect.top) / rect.height, 0), 1);
    timelineFill.style.height = (pct * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ===== MOBILE MENU =====
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });
  navLinks.forEach(l => l.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }));

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ===== SCROLL REVEAL =====
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = Array.from(entry.target.parentElement.querySelectorAll(':scope > .reveal'));
      const idx = Math.max(siblings.indexOf(entry.target), 0);
      setTimeout(() => entry.target.classList.add('revealed'), Math.min(idx, 6) * 90);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ===== COUNTERS =====
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const start = performance.now();
      const duration = 1600;
      (function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(tick);
      })(start);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

  // ===== SPOTLIGHT CARDS =====
  document.querySelectorAll('.spot').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ===== TYPING =====
  const typingEl = document.getElementById('typing-text');
  const phrases = [
    'python · fastapi · bun · rest apis',
    'llm apps · rag · prompt engineering',
    'postgresql · redis · bullmq · aws',
    'real-time trading systems'
  ];
  let pi = 0, ci = 0, deleting = false;
  (function type() {
    const phrase = phrases[pi];
    ci += deleting ? -1 : 1;
    typingEl.textContent = phrase.slice(0, ci);
    let delay = deleting ? 28 : 55;
    if (!deleting && ci === phrase.length) { delay = 1800; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
    setTimeout(type, delay);
  })();

  // ===== TRADING BOT SIMULATION (hero) =====
  const canvas = document.getElementById('bot-chart');
  const ctx = canvas.getContext('2d');
  const priceEl = document.getElementById('bot-price');
  const changeEl = document.getElementById('bot-change');
  const logEl = document.getElementById('bot-log');
  const N = 90;
  const kFast = 2 / (8 + 1), kSlow = 2 / (21 + 1);
  let prices = [], fast = [], slow = [];
  let p = 0.5, drift = 0;

  function step() {
    drift = drift * 0.92 + (Math.random() - 0.48) * 0.004;
    p = Math.min(0.95, Math.max(0.05, p + drift + (Math.random() - 0.5) * 0.006));
    const f = fast.length ? fast[fast.length - 1] + kFast * (p - fast[fast.length - 1]) : p;
    const s = slow.length ? slow[slow.length - 1] + kSlow * (p - slow[slow.length - 1]) : p;
    prices.push(p); fast.push(f); slow.push(s);
    if (prices.length > N) { prices.shift(); fast.shift(); slow.shift(); }
  }
  for (let i = 0; i < N; i++) step();

  function stamp() {
    const d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':');
  }
  function log(type, msg) {
    const row = document.createElement('div');
    row.innerHTML = `<span class="t">${stamp()}</span><span class="${type}">${msg}</span>`;
    logEl.appendChild(row);
    while (logEl.children.length > 4) logEl.removeChild(logEl.firstChild);
  }
  log('info', 'ws connected · streaming orderbook');
  log('info', 'indicators warmed · EMA(8) / EMA(21)');

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();

  function drawChart() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const all = prices.concat(fast, slow);
    const min = Math.min(...all) - 0.01, max = Math.max(...all) + 0.01;
    const x = i => (i / (N - 1)) * w;
    const y = v => h - ((v - min) / (max - min)) * (h - 10) - 5;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = cssVar('--border');
    ctx.lineWidth = 1;
    for (let g = 1; g < 4; g++) { ctx.beginPath(); ctx.moveTo(0, (h / 4) * g); ctx.lineTo(w, (h / 4) * g); ctx.stroke(); }

    const c2 = cssVar('--c2');
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, c2 + '40');
    grad.addColorStop(1, c2 + '00');
    ctx.beginPath();
    prices.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();

    const line = (arr, color, width) => {
      ctx.beginPath();
      arr.forEach((v, i) => i ? ctx.lineTo(x(i), y(v)) : ctx.moveTo(x(i), y(v)));
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke();
    };
    line(slow, cssVar('--c1'), 1.6);
    line(fast, c2, 1.6);
    line(prices, cssVar('--heading'), 2);

    const lx = x(N - 1), ly = y(prices[N - 1]);
    ctx.beginPath(); ctx.arc(lx - 3, ly, 4, 0, Math.PI * 2); ctx.fillStyle = cssVar('--up'); ctx.fill();
  }

  let ticks = 0;
  function tick() {
    const prevDiff = fast[N - 1] - slow[N - 1];
    step();
    const diff = fast[N - 1] - slow[N - 1];
    const last = prices[N - 1];
    const change = ((last - prices[0]) / prices[0]) * 100;
    priceEl.textContent = last.toFixed(3);
    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    changeEl.className = 'ticker-change ' + (change >= 0 ? 'up' : 'down');

    if (prevDiff <= 0 && diff > 0) log('buy', `BUY  signal · EMA cross ↑ @ ${last.toFixed(3)}`);
    else if (prevDiff >= 0 && diff < 0) log('sell', `SELL signal · EMA cross ↓ @ ${last.toFixed(3)}`);
    else if (++ticks % 12 === 0) log('info', `tick · spread ${(Math.random() * 0.02 + 0.005).toFixed(3)} · vol ${Math.floor(Math.random() * 900 + 100)}`);
    drawChart();
  }
  drawChart();
  window.addEventListener('resize', () => { resizeCanvas(); drawChart(); });
  if (!reduceMotion) setInterval(tick, 700);

  // ===== BILLSONCHAIN PIPELINE =====
  const stages = document.querySelectorAll('#pipeline .p-stage');
  const links = document.querySelectorAll('#pipeline .p-link');
  const statusEl = document.getElementById('pipeline-status');
  const labels = ['hashing bill', 'LLM OCR extracting merchant · amount', 'checking duplicates', 'running fraud checks', 'minting NFT to IPFS'];
  let job = 1042, stageIdx = 0;
  function runPipeline() {
    stages.forEach((s, i) => {
      s.classList.toggle('done', i < stageIdx);
      s.classList.toggle('active', i === stageIdx);
    });
    links.forEach((l, i) => l.classList.toggle('done', i < stageIdx));
    if (stageIdx < stages.length) {
      statusEl.textContent = `job #${job} · ${labels[stageIdx]}…`;
      stageIdx++;
    } else {
      statusEl.textContent = `job #${job} · ✓ reward minted`;
      stages.forEach(s => { s.classList.remove('active'); s.classList.add('done'); });
      stageIdx = 0;
      job++;
    }
  }
  runPipeline();
  if (!reduceMotion) setInterval(runPipeline, 1300);

  // ===== LOCAL TIME =====
  const timeEl = document.getElementById('local-time');
  function updateTime() {
    timeEl.textContent = new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  }
  updateTime();
  setInterval(updateTime, 30000);

  // ===== COPY EMAIL =====
  const emailBtn = document.getElementById('email-copy');
  const hint = document.getElementById('copy-hint');
  emailBtn.addEventListener('click', async () => {
    const email = emailBtn.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      hint.innerHTML = '<i class="bi bi-check2"></i> Copied';
      setTimeout(() => { hint.innerHTML = '<i class="bi bi-clipboard"></i> Copy'; }, 2000);
    } catch {
      window.location.href = 'mailto:' + email;
    }
  });
});
