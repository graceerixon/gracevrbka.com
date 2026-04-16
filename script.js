/* =========================================================
   Grace Erixon — v3 scripts
   ========================================================= */

/* ============ Terminal clock ============ */
(() => {
  const el = document.getElementById('termClock');
  if (!el) return;
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const d = new Date();
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tick(); setInterval(tick, 1000);
})();

/* ============ Custom cursor ============ */
(() => {
  if (matchMedia('(hover: none)').matches) return;
  const cursor = document.querySelector('.cursor');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function animate() {
    cx += (tx - cx) * 0.25;
    cy += (ty - cy) * 0.25;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(animate);
  })();
  const hoverables = 'a, button, .tk-col li, .feat-stack span, .agraph-cell, .agraph-row, .fc, .tile';
  document.querySelectorAll(hoverables).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
})();

/* ============ Spotlight follows cursor ============ */
(() => {
  const sp = document.querySelector('.spotlight');
  if (!sp || matchMedia('(hover: none)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    cx += (tx - cx) * 0.06;
    cy += (ty - cy) * 0.06;
    sp.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();
})();

/* ============ Tile inner spotlight ============ */
(() => {
  document.querySelectorAll('.tile, .by-tile').forEach(tile => {
    tile.addEventListener('mousemove', e => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();

/* ============ Magnetic links ============ */
(() => {
  if (matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* ============ Nav scroll state ============ */
(() => {
  const nav = document.querySelector('.nav');
  const fn = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', fn, { passive: true });
  fn();
})();

/* ============ Bento counters (scroll-reveal count-up, static after) ============ */
(() => {
  const counters = [
    { el: document.getElementById('mShiftHours'), value: 217367 },
    { el: document.getElementById('mWorkers'),    value: 15010 },
  ].filter(c => c.el);
  if (!counters.length) return;

  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      io.disconnect();

      const dur = 1800;
      const ease = t => 1 - Math.pow(1 - t, 3);
      const start = performance.now();
      (function frame(now) {
        const p = Math.min(1, (now - start) / dur);
        const k = ease(p);
        counters.forEach(c => c.el.textContent = Math.floor(k * c.value).toLocaleString('en-US'));
        if (p < 1) requestAnimationFrame(frame);
        else counters.forEach(c => c.el.textContent = c.value.toLocaleString('en-US'));
      })(performance.now());
    });
  }, { threshold: 0.3 });
  io.observe(counters[0].el.closest('.bento-grid'));
})();

/* ============ Growth bar fills ============ */
(() => {
  const bars = document.querySelectorAll('.gb-fill');
  if (!bars.length) return;
  const io = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      setTimeout(() => e.target.style.width = '100%', 300);
    });
  }, { threshold: 0.5 });
  bars.forEach(b => io.observe(b));
})();

/* ============ Sparkline canvas (animated) ============ */
(() => {
  document.querySelectorAll('.spark').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const n = 72;
    // seed a gently climbing series: start low, end around 0.85, jitter along the way
    const pts = [];
    let v = 0.18;
    for (let i = 0; i < n; i++) {
      v += (Math.random() - 0.5) * 0.05 + 0.009;
      v = Math.max(0.08, Math.min(0.94, v));
      pts.push(v);
    }

    function sizeCanvas() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const maxV = Math.max(...pts, 0.1);
      const stepX = w / (n - 1);

      // area fill
      ctx.beginPath();
      ctx.moveTo(0, h);
      pts.forEach((p, i) => ctx.lineTo(i * stepX, h - (p / maxV) * h * 0.9));
      ctx.lineTo(w, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      // line
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = i * stepX, y = h - (p / maxV) * h * 0.9;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = 'rgba(6,182,212,0.6)';
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // leading dot
      const last = pts[pts.length - 1];
      const lx = (n - 1) * stepX;
      const ly = h - (last / maxV) * h * 0.9;
      ctx.beginPath();
      ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lx, ly, 7, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(6,182,212,0.3)';
      ctx.stroke();
    }

    function render() {
      sizeCanvas();
      draw();
    }

    // draw once on enter; no live mutation (values are a snapshot, not a feed)
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { render(); io.disconnect(); }
    }), { threshold: 0.2 });
    io.observe(canvas);

    window.addEventListener('resize', render);
  });
})();

/* ============ Activity graph ============ */
(() => {
  const root = document.getElementById('activityRows');
  if (!root) return;

  // each month: [level, optional specific note]
  // level 0 = not in role; 1-4 = shipping intensity
  // hover a cell = month story. hover year label = year summary.
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const story = [
    {
      year: 2019,
      summary: 'Flywheel SWE intern. Add-on marketplace work.',
      months: [
        [0], [0], [0], [0],
        [2, 'Started as a software engineering intern at Flywheel'],
        [2, 'Onboarded to the Add-on marketplace codebase'],
        [3, 'Co-developed Performance Insights add-on'],
        [3, 'Managed Plugin Updates add-on shipped'],
        [3, 'Flywheel internship continues through the school year'],
        [3, 'Flywheel: continued marketplace work'],
        [3, 'Flywheel: continued marketplace work'],
        [3, 'Flywheel: continued marketplace work']
      ]
    },
    {
      year: 2020,
      summary: 'Pitched and led the Divi Add-on. Four add-ons scaled to $41.7K+ MRR.',
      months: [
        [3, 'Flywheel: Add-on marketplace iteration. MCS curriculum work continues'],
        [3, 'Flywheel: marketplace work. Wrote curriculum for Intro to HTML'],
        [3, 'Flywheel: marketplace work. Volunteered in JavaScript classroom'],
        [3, 'Flywheel: Slack add-on development'],
        [3, 'Flywheel: Pitched the Divi Add-on project'],
        [3, 'Led a team of interns through Divi design and development'],
        [3, 'Divi Add-on released. Four add-ons now doing $41.7K+ MRR'],
        [3, 'Wrapped up at Flywheel after 16 months'],
        [0], [0], [0], [0]
      ]
    },
    {
      year: 2021,
      summary: 'PaymentSpring intern (summer), then WP Engine Developer Advocate (Sept). Still finishing the degree.',
      months: [
        [1, 'B.S. Software Development coursework at Bellevue'],
        [1, 'Coursework at Bellevue'],
        [1, 'Coursework at Bellevue'],
        [1, 'Coursework at Bellevue'],
        [3, 'Started SWE internship at PaymentSpring (Nelnet). Subscription views and pagination'],
        [3, 'PaymentSpring: server-side filtering, report improvements, tech debt'],
        [3, 'PaymentSpring: subscription deletion warnings, password reset flow fixes'],
        [3, 'Wrapped up at PaymentSpring'],
        [3, 'Started full-time at WP Engine as Developer Advocate'],
        [3, 'Ramping up on Faust.js and headless WordPress'],
        [3, 'First blog post published'],
        [3, 'Conference content and live demos']
      ]
    },
    {
      year: 2022,
      summary: 'Graduated Bellevue (May). Owned Faust.js, ACF, WPGraphQL, Smart Search. Joined Millard STEM Advisory. Led ROAR Omaha.',
      months: [
        [3, 'Faust.js tutorials and reference apps'],
        [3, 'Starter kits adopted team-wide'],
        [3, 'Live-stream demos at dev events'],
        [3, 'WPGraphQL deep-dive content'],
        [3, 'Graduated from Bellevue University. Embedded with the Smart Search product team'],
        [3, 'WP Engine acquired ACF. Joined the product team'],
        [3, 'ACF and headless integration guides'],
        [3, 'Joined Millard Public Schools STEM Advisory Committee'],
        [3, 'Fall release content push. Growing headless WordPress Discord community'],
        [3, 'Launched Omaha chapter of ROAR (women\'s ERG)'],
        [3, 'Community Council work on company-wide initiatives'],
        [3, 'Year-end documentation sweep. Discord community passing 400 members']
      ]
    },
    {
      year: 2023,
      summary: 'Starter kits and reference apps adopted team-wide. Discord community grew toward 1,500.',
      months: [
        [3, 'Cross-product content planning'],
        [3, 'Smart Search integration examples'],
        [3, 'Reference implementations for Faust.js'],
        [3, 'Webinar hosting and demos'],
        [3, 'Debugging and supporting the headless WordPress Discord community'],
        [3, 'Communicating customer pain points into Atlas and Faust.js product changes'],
        [3, 'Live stream: headless WordPress from scratch'],
        [3, 'ROAR ERG Community Council work continues'],
        [3, 'Developer onboarding content for new adopters'],
        [3, 'Fall conference and content cycle'],
        [3, 'WPGraphQL v2 documentation work. Discord nearing 1,500 members'],
        [3, 'Annual DevRel strategy planning']
      ]
    },
    {
      year: 2024,
      summary: 'Joined Superb Shifts. Shipped scope ratings, the job board, and the HCW onboarding overhaul.',
      months: [
        [3, 'Wrapping up at WP Engine'],
        [3, 'Last content pieces at WP Engine'],
        [2, 'Wrapping up at WP Engine'],
        [3, 'Joined Superb Shifts. Onboarded to the Next.js + NestJS + Postgres codebase via facility forms, shift modals, and admin views'],
        [3, 'First FullCalendar shift views for facilities and admin. Started HCW onboarding flows and emergency contacts'],
        [4, 'Scope rating feature end-to-end: UI, backend calculations, and test coverage'],
        [3, 'Market management pages and scope rating configuration UI'],
        [2, 'HCW gamification: shift completion milestones and progress bar'],
        [4, 'Shift management rework: every facility modal state, mobile views, DNR in the approval flow'],
        [2, 'Onboarding refinements and cancellation policy setup'],
        [4, 'Built the job board feature end-to-end: full UI with CRUD + backend service and controller'],
        [4, 'Comprehensive HCW onboarding overhaul. Bulk messaging UI for admins']
      ]
    },
    {
      year: 2025,
      summary: 'Provider experience, Stream Video, compliance briefcase. Promoted to CTO in September.',
      months: [
        [4, 'Individual shift detail pages for every user type. Push notifications segmented by license and status'],
        [3, 'Compliance document verification and rejection workflows. Name badge feature'],
        [4, 'Built the initial provider experience: scheduling, dashboard, invoicing, support. Home care shift views'],
        [4, 'Admin onboarding review system. Integrated Stream Video for shift conversations'],
        [4, 'Facility profile revamp broken into modular forms. License management with market filtering'],
        [3, 'Shift bundle management for admin. Race condition protection on shift pickup'],
        [4, 'Shift metrics dashboard. Clock-in, lunch break, and forgot-to-clock-in reminders'],
        [3, 'Migrated provider views to MUI. Backend metrics refinements'],
        [4, 'Promoted to Chief Technology Officer. Active workers metrics shipped'],
        [3, 'Twilio integration: webhooks, signature validation, phone formatting. Facility form refactor'],
        [4, 'Compliance briefcase feature end-to-end. Auto-clockout for LPN and RN after 3 hours'],
        [4, 'UI revamp begins. Tax acknowledgement system. ShiftTalk messaging infrastructure']
      ]
    },
    {
      year: 2026,
      summary: 'Biggest months yet. WV compliance, performance push, subcontractor portal, security hardening.',
      months: [
        [4, 'Highest-volume month ever. WV CARES compliance, skills checklist, full HCW onboarding UI revamp'],
        [4, 'Performance optimization push: N+1 elimination, lightweight endpoints, indexes, SAS URL generation'],
        [4, 'Built the subcontractor portal from scratch: 20+ new pages, full backend module, state contracts'],
        [4, 'Security hardening: session controller, secure token storage, CORS, file validation. Subcontractor polish'],
        [0], [0], [0], [0], [0], [0], [0], [0]
      ]
    },
  ];

  story.forEach(y => {
    const row = document.createElement('div');
    row.className = 'agraph-row';
    row.dataset.summary = '// ' + y.summary;
    row.innerHTML = `<span class="agraph-year">${y.year}</span>` +
      y.months.map(([lvl, note], i) => {
        const attrs = note ? ` data-note="${note.replace(/"/g,'&quot;')}" data-month="${MONTHS[i]} ${y.year}"` : '';
        return `<span class="agraph-cell" data-level="${lvl}"${attrs}></span>`;
      }).join('');
    root.appendChild(row);
    const tip = document.createElement('div');
    tip.className = 'agraph-tooltip';
    tip.textContent = '// ' + y.summary;
    row.after(tip);
    row._tip = tip;
  });

  // cell hover → update tooltip to that month's specific note
  root.querySelectorAll('.agraph-cell').forEach(cell => {
    const row = cell.parentElement;
    cell.addEventListener('mouseenter', () => {
      const note = cell.dataset.note;
      const month = cell.dataset.month;
      if (note) row._tip.textContent = `// ${month}: ${note}`;
      else row._tip.textContent = '';
    });
    cell.addEventListener('mouseleave', () => {
      row._tip.textContent = row.dataset.summary;
    });
  });

  // click row to pin open
  root.querySelectorAll('.agraph-row').forEach(r => {
    r.addEventListener('click', () => r.classList.toggle('expanded'));
  });

  // reveal animation
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.disconnect();
    const cells = root.querySelectorAll('.agraph-cell');
    cells.forEach((c, i) => {
      const original = c.dataset.level;
      c.dataset.level = '0';
      setTimeout(() => c.dataset.level = original, i * 6);
    });
  }), { threshold: 0.2 });
  io.observe(root);
})();

/* ============ Footer year ============ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============ Command palette ============ */
(() => {
  const palette = document.getElementById('palette');
  const input = document.getElementById('paletteInput');
  const list = document.getElementById('paletteList');
  const openBtn = document.getElementById('openPalette');
  const bg = palette.querySelector('.palette-bg');

  const items = [
    { kind: 'nav',    label: 'Go to The Work',     action: () => go('#work') },
    { kind: 'nav',    label: 'Go to Activity',     action: () => go('#activity') },
    { kind: 'nav',    label: 'Go to Past Roles',   action: () => go('#past') },
    { kind: 'nav',    label: 'Go to Toolkit',      action: () => go('#toolkit') },
    { kind: 'nav',    label: 'Go to Beyond',       action: () => go('#beyond') },
    { kind: 'nav',    label: 'Go to Education',    action: () => go('#education') },
    { kind: 'nav',    label: 'Go to Contact',      action: () => go('#contact') },
    { kind: 'action', label: 'Email Grace',         action: () => location.href = 'mailto:grace.erixon@gmail.com' },
    { kind: 'action', label: 'Open LinkedIn',       action: () => window.open('https://www.linkedin.com/in/grace-erixon-vrbka-904143146/', '_blank') },
    { kind: 'action', label: 'Copy email address', action: async () => {
      try { await navigator.clipboard.writeText('grace.erixon@gmail.com'); flash('email copied'); }
      catch { flash('copy failed'); }
    }},
  ];
  let active = 0, filtered = items;

  const go = sel => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' });

  function flash(msg) {
    const d = document.createElement('div');
    d.textContent = msg;
    Object.assign(d.style, {
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      padding: '0.75rem 1.25rem', background: 'var(--lime)', color: 'var(--bg)',
      fontFamily: 'var(--mono)', fontSize: '0.75rem', letterSpacing: '0.08em',
      zIndex: 2000, opacity: 0, transition: 'opacity 0.3s', borderRadius: '8px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
    });
    document.body.appendChild(d);
    requestAnimationFrame(() => d.style.opacity = 1);
    setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 300); }, 1600);
  }

  function render() {
    list.innerHTML = '';
    filtered.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = i === active ? 'active' : '';
      li.innerHTML = `<span class="pkind">${it.kind}</span><span>${it.label}</span>`;
      li.addEventListener('click', () => { it.action(); close(); });
      list.appendChild(li);
    });
  }
  function open() {
    palette.classList.add('open');
    palette.setAttribute('aria-hidden', 'false');
    input.value = ''; filtered = items.slice(); active = 0; render();
    setTimeout(() => input.focus(), 20);
  }
  function close() {
    palette.classList.remove('open');
    palette.setAttribute('aria-hidden', 'true');
  }

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filtered = items.filter(it => it.label.toLowerCase().includes(q));
    active = 0; render();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { active = Math.min(filtered.length - 1, active + 1); render(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { active = Math.max(0, active - 1); render(); e.preventDefault(); }
    else if (e.key === 'Enter') { filtered[active]?.action(); close(); }
    else if (e.key === 'Escape') { close(); }
  });

  openBtn.addEventListener('click', open);
  bg.addEventListener('click', close);
  window.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.classList.contains('open') ? close() : open();
    }
  });
})();
