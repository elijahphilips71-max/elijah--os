// Elijah OS — screens and behaviour.
// Renders HTML strings into #app. Clicks use data-act, typing uses data-in (both handled at the bottom).

(function () {
  const DATA = window.ELIJAH_DATA;
  const UPDATES = window.ELIJAH_UPDATES || [];
  const Store = window.ElijahStore;
  const root = document.getElementById('app');

  const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TABS = [
    ['today', 'Today', 'house'],
    ['week', 'Week', 'calendar-blank'],
    ['rev', 'Revision', 'book-open'],
    ['prog', 'Progress', 'chart-line-up'],
    ['log', 'Log', 'note-pencil']
  ];
  const CHECKS = ['Morning check-in', 'Revision block', 'Football / physical session', '2-line log'];
  const LABELS = ['Sleep', 'Energy', 'Leg freshness'];
  const REVIEW_QS = ['What went well this week?', 'What held me back?', 'One focus for next week'];

  // UI-only state (not saved)
  const ui = {
    tab: 'today',
    day: (new Date().getDay() + 6) % 7,
    savedFor: '',
    scoreDraft: '',
    email: '',
    password: '',
    emailErr: '',
    sending: false,
    openCard: null,   // id of the expanded session card; null = first unfinished card
    subj: -1,         // subject whose topic list is open on Revision
    topicDraft: '',
    newVersion: false,
    menu: false
  };
  const KIND = {
    gym: ['Workout', 'barbell'], football: ['Pitch', 'soccer-ball'], recovery: ['Recovery', 'heartbeat'],
    revision: ['Revision', 'book-open-text'], paper: ['Past paper', 'exam']
  };
  const CONF = ['Not rated', 'Red', 'Amber', 'Green'];
  const CONF_CLS = ['', 'red', 'amber', 'green'];

  // ---------- helpers ----------
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const fmt = (x, o) => x.toLocaleDateString('en-GB', o);
  function monday() { const now = new Date(); const m = new Date(now); m.setHours(12, 0, 0, 0); m.setDate(now.getDate() - ((now.getDay() + 6) % 7)); return m; }
  function dt(i) { const m = monday(); m.setDate(m.getDate() + i); return m; }
  const dayKey = () => iso(dt(ui.day));
  const weekKey = () => iso(monday());
  function daysLeft() {
    const e = DATA.firstExam;
    return Math.max(0, Math.ceil((new Date(e.year, e.month - 1, e.day) - new Date()) / 864e5));
  }
  const st = () => Store.state;
  function getDay() { return st().daily[dayKey()] || { r: [3, 3, 3], open: true, chk: [false, false, false, false] }; }
  function getLog() { return st().logs[dayKey()] || { done: false, rpe: 0, win: '', fix: '' }; }
  function setDay(patch) { const k = dayKey(); const d = getDay(); Store.update(s => { s.daily[k] = Object.assign({}, d, patch); }); }
  function setLog(patch) { const k = dayKey(); const l = getLog(); Store.update(s => { s.logs[k] = Object.assign({}, l, patch); }); }
  function weekMins() { return st().minsWeek === weekKey() ? st().mins : st().mins.map(() => 0); }
  const icon = n => `<i class="ph ph-${n}" aria-hidden="true"></i>`;
  const pill = (load, text, sm) => `<span class="os-pill ${esc(load)}${sm ? ' sm' : ''}">${esc(text)}</span>`;

  // ---------- pieces ----------
  function nav() {
    return TABS.map(t => `<button class="os-nav ${ui.tab === t[0] ? 'on' : ''}" data-act="tab" data-v="${t[0]}"${ui.tab === t[0] ? ' aria-current="page"' : ''}>${icon(t[2])}<span>${t[1]}</span></button>`).join('');
  }

  // Left sidebar contents: shared by the desktop rail and the phone menu (three-line button).
  function menuBody() {
    const ids = cardIds(ui.day), unread = unreadUpdates().length;
    return `<span class="os-k acc" style="padding:0 14px 10px">Elijah OS</span>
      ${nav()}
      ${ids.length ? `<span class="os-k os-menu-k">${ui.day === (new Date().getDay() + 6) % 7 ? 'Today' : FULL[ui.day]}</span>
        ${ids.map(id => { const c = DATA.sessions[id], done = getSess(id).done;
          return `<button class="os-nav os-menu-sess ${done ? 'done' : ''}" data-act="goCard" data-v="${esc(id)}">${icon(done ? 'check-circle' : (KIND[c.kind] || KIND.gym)[1])}<span>${esc(c.title)}</span></button>`; }).join('')}` : ''}
      <span class="os-k os-menu-k">More</span>
      <button class="os-nav" data-act="goNews">${icon('megaphone')}<span>What's new</span>${unread ? `<span class="os-badge os-num">${unread}</span>` : ''}</button>
      <button class="os-nav" data-act="goTopics">${icon('list-checks')}<span>Revision topics</span></button>
      <div style="margin-top:auto;padding:16px 14px 0;display:flex;flex-direction:column;gap:2px"><span class="os-k">First exam</span>
        <span class="os-num" style="font-size:22px">${daysLeft()}<span class="os-muted" style="font-size:12px"> days</span></span></div>`;
  }
  function topBar() {
    return `<div class="os-topbar"><button class="btn btn-ghost btn-icon os-burger" data-act="menu" aria-label="Open menu" aria-expanded="${ui.menu}">${icon('list')}</button>
      <span class="os-k acc">Elijah OS</span>${unreadUpdates().length ? `<span class="os-dotnew" aria-label="New updates"></span>` : ''}</div>`;
  }
  function drawer() {
    if (!ui.menu) return '';
    return `<div class="os-scrim" data-act="menu"></div>
      <nav class="os-drawer" aria-label="Menu">
        <button class="btn btn-ghost btn-icon os-burger" data-act="menu" aria-label="Close menu" style="align-self:flex-start;margin:0 0 6px 4px">${icon('x')}</button>
        ${menuBody()}</nav>`;
  }

  function strip(tall) {
    return `<div class="os-strip">${DATA.schedule.map((d, i) => `<button class="os-day ${tall ? 'tall' : ''} ${i === ui.day ? 'on' : ''}" data-act="day" data-v="${i}" aria-label="${FULL[i]}">
      <span>${esc(d.day)}</span>${tall ? `<span class="os-num" style="font-size:16px;color:var(--color-text)">${dt(i).getDate()}</span>` : ''}${pill(d.load, d.load[0], true)}</button>`).join('')}</div>`;
  }

  function dayList(fullLoad, withKicker) {
    return `<section class="os-card os-list">${withKicker ? '<span class="os-k" style="padding:8px 10px">This week</span>' : ''}${DATA.schedule.map((d, i) => `<button class="os-drow ${i === ui.day ? 'on' : ''}" data-act="day" data-v="${i}">
      <span class="os-num os-muted">${esc(d.day)}</span><span style="line-height:1.3">${esc(d.title)}</span>${pill(d.load, fullLoad ? d.load : d.load[0])}</button>`).join('')}</section>`;
  }

  function sessionCard(kicker, withStrip) {
    const c = DATA.schedule[ui.day];
    return `<section class="os-card os-hero">
      <div class="os-between"><span class="os-k">${esc(kicker)}</span>${pill(c.load, c.load + ' load')}</div>
      <div class="os-sess-title">${esc(c.title)}</div>
      <div class="os-time">${icon('clock')}<span class="os-num">${esc(c.time)}</span></div>
      ${c.sub ? `<div class="os-num os-sub">${esc(c.sub)}</div>` : ''}
      ${withStrip ? `<div style="padding-top:4px">${strip(false)}</div>` : ''}
    </section>`;
  }

  // ---------- session cards ----------
  const cardIds = d => (DATA.schedule[d].sessions || []).filter(id => DATA.sessions[id]);
  function getSess(id) { const e = (st().sess[dayKey()] || {})[id]; return Object.assign({ c: {}, done: false, added: 0 }, e); }
  const isRevKind = c => c.kind === 'revision' || c.kind === 'paper';

  // Rows for one card. Revision cards put the weakest topics of their subject first
  // (red, then not rated, then amber), keeping any topic already ticked today.
  function cardRows(id) {
    const c = DATA.sessions[id], e = getSess(id), rows = [];
    if (c.kind === 'revision' && c.subject != null) {
      const ts = st().topics[c.subject] || [];
      const order = t => [1, 0, 2, 3][t.conf || 0];
      const ticked = ts.filter(t => e.c['t:' + t.name]);
      const rest = ts.filter(t => !e.c['t:' + t.name] && t.conf !== 3).sort((a, b) => order(a) - order(b));
      ticked.concat(rest).slice(0, Math.max(c.topics || 1, ticked.length)).forEach(t =>
        rows.push({ key: 't:' + t.name, name: t.name, sets: 1, detail: CONF[t.conf || 0], conf: t.conf || 0 }));
      if (!ts.length) rows.push({ key: 'none', name: 'Add topics on the Revision screen', sets: 0, detail: '' });
    }
    (c.items || []).forEach((x, i) => rows.push({
      key: 'i' + i, name: x.name, sets: x.sets || 1,
      detail: [x.sets ? x.sets + ' × ' + (x.reps || '') : x.reps, x.rest ? 'rest ' + x.rest : ''].filter(Boolean).join(' · ')
    }));
    return rows;
  }
  function cardProgress(id) {
    const e = getSess(id), rows = cardRows(id);
    const total = rows.reduce((a, r) => a + r.sets, 0);
    const got = rows.reduce((a, r) => a + Math.min(r.sets, e.c[r.key] || 0), 0);
    return { got, total };
  }

  function sessionCards(d, title) {
    const ids = cardIds(d);
    if (!ids.length) return '';
    const open = ui.openCard != null ? ui.openCard : (ids.find(id => !getSess(id).done) || '');
    const doneN = ids.filter(id => getSess(id).done).length;
    return `<section class="os-cards" aria-label="${esc(title)}">
      <div class="os-between" style="padding:0 2px"><span class="os-k">${esc(title)}</span><span class="os-num os-muted" style="font-size:12px">${doneN} of ${ids.length} done</span></div>
      ${ids.map(id => sessCard(id, id === open)).join('')}</section>`;
  }

  function sessCard(id, open) {
    const c = DATA.sessions[id], e = getSess(id), k = KIND[c.kind] || KIND.gym;
    const p = cardProgress(id);
    const pct = p.total ? Math.round(p.got / p.total * 100) : 0;
    const sub = c.kind === 'revision' && c.subject != null ? DATA.subjects[c.subject] : null;
    return `<article class="os-scard ${e.done ? 'done' : ''} ${open ? 'open' : ''}" data-kind="${esc(c.kind)}">
      <button class="os-scard-head" data-act="card" data-v="${esc(id)}" aria-expanded="${open}">
        <span class="os-scard-ic">${icon(e.done ? 'check' : k[1])}</span>
        <span class="os-scard-t"><span class="os-k">${esc(k[0])}${sub ? ' · ' + esc(sub.name) : ''} · <span class="os-num">${c.minutes} min</span></span>
          <span class="os-scard-title">${esc(c.title)}</span></span>
        <span class="os-num os-scard-pct">${e.done ? 'Done' : p.got + '/' + p.total}</span>
        ${icon(open ? 'caret-up' : 'caret-down')}
      </button>
      <div class="os-bar os-scard-bar"><div style="width:${e.done ? 100 : pct}%"></div></div>
      ${open ? `<div class="os-scard-body">
        ${c.focus ? `<div class="os-scard-focus">${esc(c.focus)}</div>` : ''}
        <div class="os-scard-rows">${cardRows(id).map(r => sessRow(id, r, e)).join('')}</div>
        <button class="btn ${e.done ? 'btn-secondary' : 'btn-primary'} os-btn" data-act="sessDone" data-v="${esc(id)}">${e.done ? 'Undo finish' : 'Finish session'}${!e.done && sub ? ` · +${c.minutes} min ${esc(sub.name)}` : ''}</button>
      </div>` : ''}
    </article>`;
  }

  function sessRow(id, r, e) {
    if (!r.sets) return `<div class="os-srow"><span class="os-muted" style="font-size:14px">${esc(r.name)}</span></div>`;
    const n = Math.min(r.sets, e.c[r.key] || 0), full = n >= r.sets;
    const v = esc(id + '|' + r.key);
    const label = r.sets > 1 ? `${r.name}: ${n} of ${r.sets} sets done. Tap to tick a set.` : `${r.name}${full ? ': done' : ''}`;
    return `<button class="os-srow ${full ? 'on' : ''}" data-act="tick" data-v="${v}" aria-label="${esc(label)}">
      ${r.sets > 1
        ? `<span class="os-dots">${Array.from({ length: r.sets }, (_, i) => `<span class="${i < n ? 'on' : ''}"></span>`).join('')}</span>`
        : `<span class="os-box">${icon('check')}</span>`}
      <span class="os-srow-t"><span class="os-srow-n">${esc(r.name)}</span>${r.detail ? `<span class="os-num os-srow-d ${r.conf != null ? 'c' + CONF_CLS[r.conf] : ''}">${esc(r.detail)}</span>` : ''}</span>
    </button>`;
  }

  // Finishing a card ticks the matching daily checklist item, and revision cards add their minutes.
  function finish(id, on) {
    const c = DATA.sessions[id], k = dayKey(), wk = weekKey(), day = getDay();
    Store.update(s => {
      const all = s.sess[k] = s.sess[k] || {};
      const e = Object.assign({ c: {}, done: false, added: 0 }, all[id]);
      if (!!e.done === on) return;
      e.done = on;
      if (c.kind === 'revision' && c.subject != null) {
        if (s.minsWeek !== wk) { s.mins = s.mins.map(() => 0); s.minsWeek = wk; }
        if (on) { s.mins[c.subject] += c.minutes; e.added = c.minutes; }
        else { s.mins[c.subject] = Math.max(0, s.mins[c.subject] - (e.added || 0)); e.added = 0; }
      }
      all[id] = e;
      if (on) { const chk = day.chk.slice(); chk[isRevKind(c) ? 1 : 2] = true; s.daily[k] = Object.assign({}, day, { chk }); }
    });
  }

  // ---------- updates and notices ----------
  function liveUpdates() {
    const today = iso(new Date());
    return UPDATES.filter(u => (!u.from || u.from <= today));
  }
  function unreadUpdates() {
    const seen = st().seen || [], today = iso(new Date());
    return liveUpdates().filter(u => !seen.includes(u.id) && (!u.until || u.until >= today));
  }
  function noteItem(u) {
    return `<div class="os-note-item"><span class="os-k ${u.kind === 'notice' ? 'camber' : 'acc'}">${u.kind === 'notice' ? 'Notice' : 'Update'} · <span class="os-num">${esc(fmt(new Date(u.date + 'T12:00'), { day: 'numeric', month: 'short' }))}</span></span>
      <b>${esc(u.title)}</b><span class="os-muted">${esc(u.body)}</span></div>`;
  }
  function updatesCard() {
    const list = unreadUpdates();
    if (!list.length) return '';
    return `<section class="os-card os-note"><div class="os-between"><span class="os-k acc">${icon('megaphone')} New for you</span>
      <button class="btn btn-ghost" data-act="seenAll">Got it</button></div>${list.map(noteItem).join('')}</section>`;
  }
  function updateBar() {
    return ui.newVersion ? `<div class="os-updbar" role="status">${icon('arrow-clockwise')}<span>A new version of Elijah OS is ready.</span>
      <button class="btn btn-primary" data-act="reload">Reload</button></div>` : '';
  }

  // ---------- screens ----------
  function today() {
    const day = getDay(), log = getLog(), c = DATA.schedule[ui.day];
    const h = new Date().getHours();
    const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const lows = LABELS.filter((_, i) => day.r[i] <= 2);
    const n = day.chk.filter(Boolean).length;
    const wk = st().workouts[ui.day] || [];
    const saved = ui.savedFor === dayKey();
    return `
    <header class="os-head-row">
      <div class="os-head" style="min-width:0"><h3>${greeting}, ${esc(DATA.name)}</h3>
        <span class="os-num os-muted" style="font-size:13px">${fmt(dt(ui.day), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex:none"><span class="os-k">Exam in</span>
        <span class="os-num" style="font-size:20px">${daysLeft()}<span class="os-muted" style="font-size:12px">d</span></span></div>
    </header>
    ${updatesCard()}
    ${lows.length ? `<div class="os-amber" role="status">${icon('warning')}<div><strong style="font-weight:500">Adjust today</strong><br>${lows.join(' and ')}${lows.length > 1 ? ' are' : ' is'} low. Drop the session one load level or shorten it.</div></div>` : ''}
    <div class="os-grid g3">
      <div class="os-col">
        ${sessionCard('Session · ' + FULL[ui.day], true)}
        ${sessionCards(ui.day, "Today's sessions")}
        <div class="os-ringrow">
          <div class="os-ring"><svg width="108" height="108" viewBox="0 0 104 104" aria-hidden="true"><circle class="track" cx="52" cy="52" r="46"></circle><circle class="bar" cx="52" cy="52" r="46" transform="rotate(-90 52 52)" style="stroke-dashoffset:${289 * (1 - n / 4)}"></circle></svg>
            <span class="os-ring-c"><span class="os-num" style="font-size:27px;line-height:1">${n * 25}%</span><span class="os-k" style="font-size:10px">${n} of 4</span></span></div>
          <div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="os-k">Today's mission</span><div style="font-size:16px;line-height:1.45;text-wrap:pretty">${esc(c.mission)}</div></div>
        </div>
        <div class="os-tiles">${CHECKS.map((label, i) => `<button class="os-row os-tile ${day.chk[i] ? 'on' : ''}" data-act="chk" data-v="${i}" aria-pressed="${!!day.chk[i]}"><span class="os-box">${icon('check')}</span><span class="os-lbl">${label}</span></button>`).join('')}</div>
      </div>
      <div class="os-col">
        ${day.open ? `<section class="os-card"><span class="os-k">Morning readiness</span>
          ${LABELS.map((label, i) => `<label class="os-slide"><span>${label}</span><input type="range" min="1" max="5" step="1" value="${day.r[i]}" data-in="r" data-i="${i}" id="r-${i}"><span class="os-num" style="text-align:right;color:var(--color-accent-300)" data-rv="${i}">${day.r[i]}</span></label>`).join('')}
          <button class="btn btn-primary os-btn" data-act="checkin">Log check-in</button></section>`
        : `<button class="os-chip" data-act="openReady"><i class="ph ph-pulse" style="font-size:18px;color:var(--color-accent)" aria-hidden="true"></i><span>Readiness</span><span class="os-num" style="margin-left:auto">${day.r.join(' · ')}</span><span style="color:var(--color-accent-300);font-size:13px">Edit</span></button>`}
        <section class="os-card">
          <div class="os-wk"><span class="os-k">Extras</span><span class="os-k" style="text-align:right">Sets</span><span class="os-k" style="text-align:right">Reps</span><span></span></div>
          ${wk.length ? '' : '<span class="os-muted" style="font-size:14px">Anything not on a session card. Saved for every ' + FULL[ui.day] + '.</span>'}
          ${wk.map((x, i) => `<div class="os-wk">
            <input class="input os-bare" placeholder="Exercise" aria-label="Exercise" value="${esc(x.name)}" data-in="ex" data-f="name" data-i="${i}" id="ex-name-${i}">
            <input class="input os-cell" inputmode="numeric" placeholder="—" aria-label="Sets" value="${esc(x.sets)}" data-in="ex" data-f="sets" data-i="${i}" id="ex-sets-${i}">
            <input class="input os-cell" placeholder="—" aria-label="Reps" value="${esc(x.reps)}" data-in="ex" data-f="reps" data-i="${i}" id="ex-reps-${i}">
            <button class="btn btn-ghost btn-icon os-x" aria-label="Remove exercise" data-act="rmEx" data-v="${i}">${icon('x')}</button></div>`).join('')}
          <button class="btn btn-secondary os-btn" data-act="addEx">${icon('plus')}Add exercise</button>
        </section>
        <section class="os-card"><span class="os-k">2-line log</span>
          <input class="input os-in" placeholder="One win" aria-label="One win" value="${esc(log.win)}" data-in="win" id="win">
          <input class="input os-in" placeholder="One fix" aria-label="One fix" value="${esc(log.fix)}" data-in="fix" id="fix">
          <button class="btn btn-primary os-btn" data-act="saveLog" data-save>${saved ? 'Saved' : 'Save entry'}</button></section>
      </div>
      <div class="os-col os-deskonly">${dayList(false, true)}</div>
    </div>`;
  }

  function week() {
    return `
    <header class="os-head"><span class="os-k acc">Week</span><h3>${fmt(dt(0), { day: 'numeric', month: 'short' })} – ${fmt(dt(6), { day: 'numeric', month: 'short' })}</h3></header>
    <div class="os-grid g2">
      <div class="os-col">${strip(true)}${sessionCard(FULL[ui.day], false)}${sessionCards(ui.day, 'Session cards')}</div>
      ${dayList(true, false)}
    </div>`;
  }

  function revision() {
    const s = st();
    const raw = s.scores.slice(-8);
    const pts = raw.map((v, i) => ({ v, x: raw.length === 1 ? 150 : 20 + i * (260 / (raw.length - 1)), y: 110 - v }));
    const line = pts.map(p => p.x + ',' + p.y).join(' ');
    const area = pts.length ? pts[0].x + ',110 ' + line + ' ' + pts[pts.length - 1].x + ',110' : '';
    const mins = weekMins();
    return `
    <header class="os-head"><span class="os-k acc">Revision</span><h3>Priority order</h3></header>
    <div class="os-grid g2">
      <div class="os-col">
        <section class="os-card os-hero os-countdown"><div style="display:flex;flex-direction:column;gap:4px"><span class="os-k">First exam</span><span style="font-size:15px">${esc(DATA.firstExam.label)}</span></div>
          <span class="os-num" style="font-size:40px;line-height:1;color:var(--color-accent-300)">${daysLeft()}<span class="os-muted" style="font-size:13px"> days</span></span></section>
        <section class="os-card">
          <div class="os-between"><span class="os-k">Past-paper scores</span>${raw.length ? `<span class="os-num" style="font-size:13px">latest ${raw[raw.length - 1]}%</span>` : ''}</div>
          ${raw.length ? `<svg class="os-chart" viewBox="0 0 300 120" role="img" aria-label="Past-paper scores: ${raw.join(', ')} percent">
              <line class="base" x1="0" y1="110" x2="300" y2="110"></line><line class="guide" x1="0" y1="60" x2="300" y2="60"></line><line class="guide" x1="0" y1="10" x2="300" y2="10"></line>
              <polygon class="area" points="${area}"></polygon><polyline class="line" points="${line}"></polyline>
              ${pts.map(p => `<circle class="pt" cx="${p.x}" cy="${p.y}" r="3.5"></circle>`).join('')}</svg>
            <div class="os-chart-lbls">${pts.map(p => `<span class="os-num">${p.v}</span>`).join('')}</div>`
          : '<div class="os-muted" style="padding:28px 0;font-size:14px">Add your first past-paper score to start the trend line.</div>'}
          <form class="os-scoreform" data-form="score" style="display:flex;gap:8px">
            <input class="input os-in os-num" style="flex:1;min-width:0" inputmode="numeric" placeholder="Score %" aria-label="Score percent" value="${esc(ui.scoreDraft)}" data-in="scoreDraft" id="scoreDraft">
            <button class="btn btn-primary os-btn" type="submit">Add score</button>
            <button class="btn btn-secondary os-btn" type="button" data-act="undoScore"${s.scores.length ? '' : ' disabled'}>Undo</button></form>
        </section>
      </div>
      <div class="os-col"><span class="os-k">Minutes this week</span>
        ${DATA.subjects.map((sub, i) => {
          const goal = s.goals[i] || sub.goal;
          const pct = Math.min(100, Math.round(mins[i] / goal * 100));
          return `<section class="os-card os-subj"><div style="display:flex;flex-direction:column;gap:8px;min-width:0">
            <div class="os-subj-top"><span class="os-num" style="font-size:12px;color:var(--color-accent-300)">0${i + 1}</span><span style="font-size:15px;font-weight:500">${esc(sub.name)}</span>
              <span class="os-num os-muted" style="margin-left:auto;font-size:12px">${mins[i]} /</span>
              <input class="input os-goal" inputmode="numeric" aria-label="${esc(sub.name)} weekly goal in minutes" value="${goal}" data-in="goal" data-i="${i}" id="goal-${i}"><span class="os-num os-muted" style="font-size:12px;margin-left:-4px">min</span></div>
            <div class="os-bar"><div style="width:${pct}%"></div></div></div>
            <button class="btn btn-secondary os-btn os-num" data-act="addMin" data-v="${i}" aria-label="Add 15 minutes of ${esc(sub.name)}">+15</button>
            ${topicBlock(i)}</section>`;
        }).join('')}
      </div>
    </div>`;
  }

  function topicBlock(i) {
    const ts = st().topics[i] || [];
    const cnt = [0, 0, 0, 0]; ts.forEach(t => cnt[t.conf || 0]++);
    const open = ui.subj === i;
    return `<div class="os-topics">
      <button class="os-topics-head" data-act="subj" data-v="${i}" aria-expanded="${open}">
        <span style="font-size:13px">Topics</span>
        <span class="os-rag">${cnt[1] ? `<span class="cred">${cnt[1]} red</span>` : ''}${cnt[2] ? `<span class="camber">${cnt[2]} amber</span>` : ''}${cnt[3] ? `<span class="cgreen">${cnt[3]} green</span>` : ''}${cnt[0] ? `<span>${cnt[0]} not rated</span>` : ''}${ts.length ? '' : '<span>none yet</span>'}</span>
        ${icon(open ? 'caret-up' : 'caret-down')}</button>
      ${open ? `${ts.map((t, j) => `<div class="os-topic">
          <button class="os-conf c${CONF_CLS[t.conf || 0]}" data-act="conf" data-v="${i}|${j}" aria-label="${esc(t.name)}: ${CONF[t.conf || 0]}. Tap to change.">${CONF[t.conf || 0]}</button>
          <span style="flex:1;min-width:0;font-size:14px">${esc(t.name)}</span>
          <button class="btn btn-ghost btn-icon os-x" aria-label="Remove ${esc(t.name)}" data-act="rmTopic" data-v="${i}|${j}">${icon('x')}</button></div>`).join('')}
        <form data-form="topic" data-i="${i}" style="display:flex;gap:8px">
          <input class="input os-in" style="flex:1;min-width:0" placeholder="Add a topic" aria-label="New ${esc(DATA.subjects[i].name)} topic" value="${esc(ui.topicDraft)}" data-in="topicDraft" id="topic-${i}">
          <button class="btn btn-secondary os-btn" type="submit">Add</button></form>
        <span class="os-muted" style="font-size:12px">Tap a rating to change it. Red topics come up first in revision session cards.</span>` : ''}
    </div>`;
  }

  function progress() {
    const s = st();
    return `
    <header class="os-head"><span class="os-k acc">Progress</span><h3>Benchmarks</h3></header>
    <div class="os-grid g2">
      <section class="os-card os-table-wrap"><table class="table" style="font-size:13px"><thead><tr><th>Benchmark</th><th style="text-align:right">Base</th><th style="text-align:right">Latest</th><th style="text-align:right">Target</th></tr></thead><tbody>
        ${s.bench.map((b, i) => `<tr>
          <td><input class="input os-bare" placeholder="Name" aria-label="Benchmark name" value="${esc(b.name)}" data-in="bench" data-f="name" data-i="${i}" id="b-name-${i}"></td>
          <td><input class="input os-cell" placeholder="—" aria-label="Base" value="${esc(b.base)}" data-in="bench" data-f="base" data-i="${i}" id="b-base-${i}"></td>
          <td><input class="input os-cell" style="color:var(--color-accent-300)" placeholder="—" aria-label="Latest" value="${esc(b.latest)}" data-in="bench" data-f="latest" data-i="${i}" id="b-latest-${i}"></td>
          <td><input class="input os-cell" placeholder="—" aria-label="Target" value="${esc(b.target)}" data-in="bench" data-f="target" data-i="${i}" id="b-target-${i}"></td></tr>`).join('')}
        </tbody></table>
        <button class="btn btn-secondary os-btn" style="margin:4px 6px" data-act="addBench">${icon('plus')}Add benchmark</button></section>
      <section class="os-card os-hero"><span class="os-k">Skill of the month</span>
        <input class="input os-in" style="font-size:17px" placeholder="Name this month's skill" aria-label="Skill of the month" value="${esc(s.skill.name)}" data-in="skillName" id="skillName">
        ${s.skill.steps.map((text, i) => {
          const cls = i === s.skill.cur ? 'on' : i < s.skill.cur ? 'done' : '';
          const tag = i === s.skill.cur ? 'current' : i < s.skill.cur ? 'done' : '';
          return `<div class="os-ladder"><button class="os-step ${cls}" data-act="step" data-v="${i}" aria-label="Mark step ${i + 1} as current"${i === s.skill.cur ? ' aria-current="step"' : ''}>${i + 1}</button>
            <input class="input os-in" style="flex:1;min-width:0" placeholder="Step ${i + 1}" aria-label="Step ${i + 1}" value="${esc(text)}" data-in="stepText" data-i="${i}" id="step-${i}">
            <span class="os-num" style="font-size:11px;width:52px;color:var(--color-accent-300)">${tag}</span></div>`;
        }).join('')}
        <span class="os-muted" style="font-size:12px">Tap a number to mark your current step.</span></section>
    </div>`;
  }

  function logScreen() {
    const s = st(), log = getLog();
    const saved = ui.savedFor === dayKey();
    const review = s.reviews[weekKey()] || ['', '', ''];
    const now = new Date();
    const recent = Object.keys(s.logs).sort().reverse().filter(k => s.logs[k].win || s.logs[k].fix).slice(0, 4);
    return `
    <header class="os-head"><span class="os-k acc">Log</span><h3>${FULL[ui.day]}</h3></header>
    <div class="os-grid g3">
      <section class="os-card os-hero"><span class="os-k">Quick entry</span>
        <button class="os-row ${log.done ? 'on' : ''}" data-act="toggleDone" aria-pressed="${!!log.done}"><span class="os-box">${icon('check')}</span><span>Session done</span></button>
        <div class="os-between" style="align-items:baseline"><span style="font-size:14px">RPE</span><span class="os-num os-muted" style="font-size:13px">${log.rpe ? log.rpe + ' / 10' : 'tap 1–10'}</span></div>
        <div class="os-rpe-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<button class="os-rpe ${log.rpe === n ? 'on' : ''}" data-act="rpe" data-v="${n}" aria-pressed="${log.rpe === n}">${n}</button>`).join('')}</div>
        <div class="field"><label for="win">One win</label><input class="input os-in" value="${esc(log.win)}" data-in="win" id="win"></div>
        <div class="field"><label for="fix">One fix</label><input class="input os-in" value="${esc(log.fix)}" data-in="fix" id="fix"></div>
        <button class="btn btn-primary os-btn" data-act="saveLog" data-save>${saved ? 'Saved' : 'Save entry'}</button></section>
      <div class="os-col">
        <section class="os-card"><div class="os-between"><span class="os-k">Sunday review</span><span class="tag tag-outline">Sundays</span></div>
          ${REVIEW_QS.map((q, i) => `<div class="field"><label for="rev-${i}">${q}</label><input class="input os-in" value="${esc(review[i])}" data-in="review" data-i="${i}" id="rev-${i}"></div>`).join('')}</section>
        <section class="os-card"><div class="os-between"><span class="os-k">Month-end review</span><span class="os-num os-muted" style="font-size:12px">opens ${fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0), { day: 'numeric', month: 'short' })}</span></div>
          <div style="font-size:14px;line-height:1.5;color:var(--color-neutral-200)">Re-test benchmarks, review the past-paper trend, pick next month's skill.</div>
          <button class="btn btn-secondary os-btn" disabled>Start review</button></section>
        <section class="os-card os-note" data-news><span class="os-k">What's new</span>
          ${liveUpdates().slice(0, 6).map(noteItem).join('') || '<span class="os-muted" style="font-size:14px">Nothing yet.</span>'}</section>
      </div>
      <section class="os-card"><span class="os-k">Recent entries</span>
        ${recent.length ? recent.map(k => { const e = s.logs[k]; return `<div class="os-entry">
          <div class="os-between"><span class="os-num os-muted" style="font-size:12px">${fmt(new Date(k + 'T12:00'), { weekday: 'short', day: 'numeric', month: 'short' })}</span><span class="os-num" style="font-size:12px;color:var(--color-accent-300)">${e.rpe ? 'RPE ' + e.rpe : ''}</span></div>
          <span><span class="os-muted">Win</span> · ${esc(e.win || '—')}</span><span><span class="os-muted">Fix</span> · ${esc(e.fix || '—')}</span></div>`; }).join('')
        : '<span class="os-muted" style="font-size:14px">Saved entries appear here.</span>'}
      </section>
    </div>
    ${accountCard()}`;
  }

  function syncText() {
    return { local: 'Saved on this device', synced: 'Synced', saving: 'Saving…', offline: 'Offline · will sync', error: 'Sync failed · will retry' }[Store.sync] || 'Synced';
  }
  function accountCard() {
    if (!Store.cloud) {
      return `<section class="os-card os-account">${icon('device-mobile')}<div class="who"><span style="font-size:14px">Saved on this device</span>
        <span class="os-num">Add Supabase keys in js/config.js to sync</span></div></section>`;
    }
    const iconName = Store.sync === 'synced' ? 'cloud-check' : Store.sync === 'offline' || Store.sync === 'error' ? 'cloud-slash' : 'cloud-arrow-up';
    return `<section class="os-card os-account"><i class="ph ph-${iconName}" data-sync-icon aria-hidden="true"></i><div class="who"><span style="font-size:14px" data-sync-text>${syncText()}</span>
      <span class="os-num">${esc((Store.user && Store.user.email) || '')}</span></div>
      ${Store.user ? '<button class="btn btn-secondary os-btn" style="margin-left:auto;flex:none" data-act="signOut">Sign out</button>' : ''}</section>`;
  }

  function authScreen() {
    return `<div class="os-auth"><form class="os-card os-hero" data-form="signin" novalidate>
      <span class="os-k acc">Elijah OS</span><h3>Sign in</h3>
      <p>Use the same email and password on your phone and laptop to keep them in sync. First time? Press <b>Create account</b>.</p>
      <div class="field"><label for="email">Email</label><input class="input os-in" type="email" autocomplete="email" placeholder="you@example.com" value="${esc(ui.email)}" data-in="email" id="email"></div>
      <div class="field"><label for="password">Password</label><input class="input os-in" type="password" autocomplete="current-password" placeholder="At least 6 characters" value="${esc(ui.password)}" data-in="password" id="password"></div>
      ${ui.emailErr ? `<span class="os-err" data-email-err>${esc(ui.emailErr)}</span>` : ''}
      <button class="btn btn-primary os-btn" type="submit" value="signin"${ui.sending ? ' disabled' : ''}>${ui.sending ? 'Signing in…' : 'Sign in'}</button>
      <button class="btn btn-secondary os-btn" type="submit" value="signup"${ui.sending ? ' disabled' : ''}>Create account</button></form></div>`;
  }

  // ---------- render ----------
  function render() {
    // keep keyboard focus across re-renders
    const a = document.activeElement;
    const focusSel = a && a.id ? '#' + a.id : a && a.dataset && a.dataset.act ? `[data-act="${a.dataset.act}"]${a.dataset.v != null ? `[data-v="${a.dataset.v}"]` : ''}` : null;

    if (Store.auth === 'loading') {
      root.innerHTML = '<div class="os"><div class="os-loading"><span class="os-k acc">Elijah OS</span></div></div>';
      return;
    }
    if (Store.auth === 'signedout') {
      root.innerHTML = `<div class="os">${authScreen()}</div>`;
    } else {
      const screen = { today, week, rev: revision, prog: progress, log: logScreen }[ui.tab]();
      root.innerHTML = `<div class="os">
        <nav class="os-rail" aria-label="Main">${menuBody()}</nav>
        <main class="os-main">${topBar()}${screen}</main>
        <nav class="os-dock" aria-label="Main">${nav()}</nav>${drawer()}</div>${updateBar()}`;
    }
    if (focusSel) { const el = root.querySelector(focusSel); if (el) el.focus({ preventScroll: true }); }
  }

  function renderSync() {
    const t = root.querySelector('[data-sync-text]');
    if (t) t.textContent = syncText();
    const i = root.querySelector('[data-sync-icon]');
    if (i) i.className = 'ph ph-' + (Store.sync === 'synced' ? 'cloud-check' : Store.sync === 'offline' || Store.sync === 'error' ? 'cloud-slash' : 'cloud-arrow-up');
  }

  // ---------- actions ----------
  const actions = {
    tab(v) { ui.tab = v; ui.menu = false; window.scrollTo(0, 0); },
    menu() { ui.menu = !ui.menu; },
    goCard(v) { ui.tab = 'today'; ui.openCard = v; ui.menu = false; setTimeout(() => { const el = root.querySelector(`[data-act="card"][data-v="${v}"]`); if (el) el.scrollIntoView({ block: 'center' }); }); },
    goNews() { ui.tab = 'log'; ui.menu = false; setTimeout(() => { const el = root.querySelector('[data-news]'); if (el) el.scrollIntoView({ block: 'start' }); }); },
    goTopics() { ui.tab = 'rev'; ui.menu = false; if (ui.subj < 0) ui.subj = 0; setTimeout(() => { const el = root.querySelector('.os-topics'); if (el) el.scrollIntoView({ block: 'center' }); }); },
    day(v) { ui.day = +v; ui.openCard = null; },
    card(v) {
      const ids = cardIds(ui.day);
      const open = ui.openCard != null ? ui.openCard : (ids.find(id => !getSess(id).done) || '');
      ui.openCard = open === v ? '' : v;
    },
    tick(v) {
      const cut = v.indexOf('|'), id = v.slice(0, cut), key = v.slice(cut + 1);
      const row = cardRows(id).find(r => r.key === key);
      if (!row) return;
      const k = dayKey();
      const cur = getSess(id);
      const n = Math.min(row.sets, cur.c[key] || 0);
      const next = n >= row.sets ? 0 : n + 1;
      Store.update(s => {
        const all = s.sess[k] = s.sess[k] || {};
        const e = Object.assign({ c: {}, done: false, added: 0 }, all[id]);
        e.c = Object.assign({}, e.c, { [key]: next });
        if (!next) delete e.c[key];
        all[id] = e;
      });
      const p = cardProgress(id);
      if (!cur.done && p.total && p.got >= p.total) { finish(id, true); ui.openCard = null; }
    },
    sessDone(v) { const on = !getSess(v).done; finish(v, on); if (on) ui.openCard = null; },
    seenAll() { const ids = unreadUpdates().map(u => u.id); Store.update(s => { s.seen = (s.seen || []).concat(ids); }); },
    reload() { location.reload(); },
    subj(v) { ui.subj = ui.subj === +v ? -1 : +v; ui.topicDraft = ''; },
    conf(v) {
      const [i, j] = v.split('|').map(Number);
      Store.update(s => { const t = s.topics[i][j]; if (t) t.conf = ((t.conf || 0) % 3) + 1; });
    },
    rmTopic(v) {
      const [i, j] = v.split('|').map(Number);
      Store.update(s => { s.topics[i] = s.topics[i].filter((_, x) => x !== j); });
    },
    chk(v) {
      const i = +v, d = getDay(), chk = d.chk.slice();
      chk[i] = !chk[i];
      setDay(i === 0 ? { chk, open: !chk[0] } : { chk });
    },
    checkin() { const d = getDay(), chk = d.chk.slice(); chk[0] = true; setDay({ chk, open: false }); },
    openReady() { setDay({ open: true }); },
    addEx() { const day = ui.day; Store.update(s => { s.workouts[day] = (s.workouts[day] || []).concat({ name: '', sets: '', reps: '' }); }); },
    rmEx(v) { const day = ui.day; Store.update(s => { s.workouts[day] = (s.workouts[day] || []).filter((_, j) => j !== +v); }); },
    saveLog() {
      const k = dayKey(), d = getDay(), log = getLog(), chk = d.chk.slice();
      chk[3] = true; if (log.done) chk[2] = true;
      Store.update(s => { s.daily[k] = Object.assign({}, d, { chk }); s.logs[k] = log; });
      ui.savedFor = k;
    },
    toggleDone() { setLog({ done: !getLog().done }); ui.savedFor = ''; },
    rpe(v) { setLog({ rpe: +v }); ui.savedFor = ''; },
    undoScore() { Store.update(s => { s.scores = s.scores.slice(0, -1); }); },
    addMin(v) {
      const wk = weekKey();
      Store.update(s => {
        if (s.minsWeek !== wk) { s.mins = s.mins.map(() => 0); s.minsWeek = wk; }
        s.mins[+v] += 15;
      });
    },
    addBench() { Store.update(s => { s.bench.push({ name: '', base: '', latest: '', target: '' }); }); },
    step(v) { Store.update(s => { s.skill.cur = +v; }); },
    async signOut() { await Store.signOut(); ui.password = ''; window.scrollTo(0, 0); }
  };

  function authErr(e) {
    console.warn('Sign-in failed', e);
    const msg = (e && e.message) || '';
    if (!navigator.onLine) return 'You are offline. Check your connection and try again.';
    if (/invalid login credentials/i.test(msg)) return 'Wrong email or password. First time here? Press Create account.';
    if (/already registered|already exists/i.test(msg)) return 'That email already has an account. Press Sign in.';
    if (/email not confirmed/i.test(msg)) return 'This email is not confirmed yet. In Supabase, turn off "Confirm email" (Authentication → Sign In / Providers → Email).';
    if (/password/i.test(msg)) return msg;
    return 'Could not sign in: ' + (msg || 'unknown error');
  }

  root.addEventListener('click', async e => {
    const b = e.target.closest('[data-act]');
    if (!b || b.disabled) return;
    const fn = actions[b.dataset.act];
    if (!fn) return;
    await fn(b.dataset.v);
    render();
  });

  root.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target.dataset.form;
    if (f === 'score') {
      const v = Math.round(parseFloat(ui.scoreDraft));
      if (!(v >= 0 && v <= 100)) return;
      Store.update(s => { s.scores.push(v); });
      ui.scoreDraft = '';
      render();
      const inp = root.querySelector('#scoreDraft'); if (inp) inp.focus();
    } else if (f === 'topic') {
      const i = +e.target.dataset.i, name = ui.topicDraft.trim();
      if (!name) return;
      Store.update(s => { if (!s.topics[i].some(t => t.name.toLowerCase() === name.toLowerCase())) s.topics[i].push({ name, conf: 1 }); });
      ui.topicDraft = '';
      render();
      const inp = root.querySelector('#topic-' + i); if (inp) inp.focus();
    } else if (f === 'signin') {
      if (!/^\S+@\S+\.\S+$/.test(ui.email.trim())) { ui.emailErr = 'Enter a valid email address.'; render(); return; }
      if (ui.password.length < 6) { ui.emailErr = 'Password must be at least 6 characters.'; render(); return; }
      ui.email = ui.email.trim();
      const signup = e.submitter && e.submitter.value === 'signup';
      ui.sending = true; ui.emailErr = ''; render();
      try {
        if (signup) {
          const now = await Store.signUp(ui.email, ui.password);
          if (!now) ui.emailErr = 'Account created, but Supabase wants the email confirmed first. In Supabase, turn off "Confirm email" (Authentication → Sign In / Providers → Email), then press Sign in.';
        } else {
          await Store.signIn(ui.email, ui.password);
        }
      } catch (err) { ui.emailErr = authErr(err); }
      ui.sending = false; render();
    }
  });

  // Typing saves immediately without re-rendering, so the cursor stays put.
  root.addEventListener('input', e => {
    const t = e.target, k = t.dataset.in;
    if (!k) return;
    const i = +t.dataset.i, f = t.dataset.f, v = t.value;
    const resetSave = () => { ui.savedFor = ''; root.querySelectorAll('[data-save]').forEach(b => { b.textContent = 'Save entry'; }); };
    switch (k) {
      case 'password': ui.password = v; if (ui.emailErr) { ui.emailErr = ''; const er = root.querySelector('[data-email-err]'); if (er) er.remove(); } break;
      case 'email': ui.email = v; if (ui.emailErr) { ui.emailErr = ''; const er = root.querySelector('[data-email-err]'); if (er) er.remove(); } break;
      case 'win': setLog({ win: v }); resetSave(); break;
      case 'fix': setLog({ fix: v }); resetSave(); break;
      case 'r': { const r = getDay().r.slice(); r[i] = +v; setDay({ r }); const lbl = root.querySelector(`[data-rv="${i}"]`); if (lbl) lbl.textContent = v; break; }
      case 'ex': { const day = ui.day; Store.update(s => { const list = (s.workouts[day] || []).slice(); list[i] = Object.assign({}, list[i], { [f]: v }); s.workouts[day] = list; }); break; }
      case 'bench': Store.update(s => { s.bench[i] = Object.assign({}, s.bench[i], { [f]: v }); }); break;
      case 'skillName': Store.update(s => { s.skill.name = v; }); break;
      case 'stepText': Store.update(s => { s.skill.steps[i] = v; }); break;
      case 'review': { const wk = weekKey(); Store.update(s => { const r = (s.reviews[wk] || ['', '', '']).slice(); r[i] = v; s.reviews[wk] = r; }); break; }
      case 'scoreDraft': ui.scoreDraft = v; break;
      case 'topicDraft': ui.topicDraft = v; break;
      case 'goal': { const n = parseInt(v, 10); if (n > 0) Store.update(s => { s.goals[i] = n; }); break; }
    }
  });
  // Re-render after sliders and goals settle (updates the banner, chip and progress bars).
  root.addEventListener('change', e => {
    const k = e.target.dataset.in;
    if (k === 'r' || k === 'goal') render();
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.menu) { ui.menu = false; render(); } });
  window.addEventListener('elijah-update', () => { ui.newVersion = true; render(); });
  Store.onData(render);
  Store.onStatus(renderSync);

  // Keep the date-based views correct if the app stays open past midnight.
  let lastDate = iso(new Date());
  setInterval(() => {
    const d = iso(new Date());
    if (d !== lastDate && !root.contains(document.activeElement)) { lastDate = d; ui.day = (new Date().getDay() + 6) % 7; render(); }
  }, 60000);

  render();
})();
