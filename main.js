// One driver: html[data-detail] is "essential" or "everything". Every page reads it.
(() => {
  const root = document.documentElement;
  const EASE = 'cubic-bezier(.2,.7,.1,1)';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = { get(k){ try { return localStorage.getItem(k); } catch { return null; } }, set(k,v){ try { localStorage.setItem(k,v); } catch {} } };
  const line = document.querySelector('.hero-line');
  const kept = line ? [...line.querySelectorAll('.w:not(.cut)')] : [];
  const cuts = line ? [...line.querySelectorAll('.cut')] : [];
  const count = document.querySelector('[data-count]');

  // FLIP: words slide to close the gap instead of jumping.
  function flip(els, mutate, dur = 720) {
    if (calm || !els.length) return mutate();
    const first = els.map(e => e.getBoundingClientRect());
    mutate();
    els.forEach((e, i) => {
      const l = e.getBoundingClientRect();
      const dx = first[i].left - l.left, dy = first[i].top - l.top;
      if (dx || dy) e.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: dur, easing: EASE });
    });
  }
  function say(mode) {
    if (!count) return;
    const total = kept.length + cuts.length;
    count.textContent = mode === 'everything'
      ? `First draft, ${total} words. ${cuts.length} struck.`
      : `${kept.length} words. The first draft had ${total}.`;
  }
  function setDetail(mode, animate = true) {
    const was = root.dataset.detail;
    const apply = () => { root.dataset.detail = mode; };
    if (animate && was !== mode) flip(kept, apply); else apply();
    store.set('detail', mode);
    document.querySelectorAll('.detail button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    say(mode);
    if (animate && mode === 'everything' && !calm) {
      document.querySelectorAll('[data-full]').forEach(el => { el.classList.remove('full-in'); void el.offsetWidth; el.classList.add('full-in'); });
    }
  }
  document.querySelectorAll('.detail button').forEach(b => b.addEventListener('click', () => setDetail(b.dataset.mode)));
  document.querySelectorAll('[data-set-detail]').forEach(b => b.addEventListener('click', () => {
    const y = b.getBoundingClientRect().top;
    setDetail(b.dataset.setDetail);
    const first = document.querySelector('[data-full]');
    if (first) scrollBy({ top: first.getBoundingClientRect().top - Math.min(y, 120), behavior: calm ? 'auto' : 'smooth' });
  }));
  setDetail(root.dataset.detail || 'essential', false);

  // Hero edit: the first draft is struck word by word, then the sentence closes up.
  if (line && root.classList.contains('intro')) {
    const run = () => {
      let n = kept.length + cuts.length;
      if (count) count.textContent = `First draft, ${n} words.`;
      cuts.forEach((c, i) => setTimeout(() => {
        c.classList.add('struck');
        if (count) count.textContent = `Editing. ${--n} words.`;
      }, 500 + i * 75));
      const t = 500 + cuts.length * 75 + 420;
      setTimeout(() => cuts.forEach(c => c.classList.add('gone')), t);
      setTimeout(() => {
        flip(kept, () => root.classList.remove('intro'));
        cuts.forEach(c => c.classList.remove('struck', 'gone'));
        say('essential');
        try { sessionStorage.setItem('edited', '1'); } catch {}
      }, t + 260);
    };
    (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(run);
  }

  // Work index: the stage follows hover, focus, and (when idle) scroll position.
  const items = [...document.querySelectorAll('.work-item')];
  const panes = [...document.querySelectorAll('.work-stage .pane')];
  if (items.length && panes.length) {
    const show = i => { panes.forEach((p, j) => p.classList.toggle('on', i === j)); items.forEach((it, j) => it.classList.toggle('on', i === j)); };
    items.forEach((it, i) => { it.addEventListener('pointerenter', () => show(i)); it.addEventListener('focusin', () => show(i)); });
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !document.querySelector('.work-list:hover')) show(items.indexOf(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(it => io.observe(it));
    }
  }

  // Reveal on scroll.
  const rv = document.querySelectorAll('.rv');
  if (calm || !('IntersectionObserver' in window)) rv.forEach(e => e.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(e => io.observe(e));
  }

  // Playground: a piece loads into its frame only when the reader presses play.
  document.querySelectorAll('.toy[data-src]').forEach(toy => {
    const src = toy.dataset.src; if (!src) return;
    const frame = toy.querySelector('.toy-frame'), btn = toy.querySelector('.play'), open = toy.querySelector('.open');
    const poster = frame.innerHTML;
    open.href = src; open.hidden = false; btn.hidden = false;
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') === 'true';
      if (on) { frame.innerHTML = poster; }
      else {
        const f = document.createElement('iframe');
        f.src = src; f.title = `${toy.dataset.name}, live`; f.allow = 'fullscreen; autoplay';
        frame.replaceChildren(f);
      }
      btn.setAttribute('aria-pressed', String(!on));
      btn.firstChild.textContent = on ? 'Play here ' : 'Stop ';
      btn.lastElementChild.textContent = on ? '▶' : '■';
    });
  });
})();
