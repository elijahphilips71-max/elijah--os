// Elijah OS — screens and behaviour.
// Renders HTML strings into #app. Clicks use data-act, typing uses data-in (both handled at the bottom).

(function () {
  const DATA = window.ELIJAH_DATA;
  const UPDATES = window.ELIJAH_UPDATES || [];
  const Cal = window.ElijahCal;
  const Planner = window.ElijahPlanner;
  const Store = window.ElijahStore;
  const root = document.getElementById('app');

  const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const TABS = [
    ['today', 'Today', 'house'],
    ['week', 'Week', 'calendar-blank'],
    ['rev', 'Revision', 'book-open'],
    ['prog', 'Progress', 'chart-line-up'],
    ['log', 'Log', 'note-pencil'],
    ['hustle', 'Side hustles', 'rocket-launch']
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
    qShown: {},
    pd: { s: 0, topics: [] },  // past-paper form draft
    pdOpen: '', pdErr: '',
    progTab: 'grades', gradeSubj: null, gradeTable: false,
    paperSubj: null, pdBounds: false, pdAnother: false,
    qPos: {},         // which question each ladder card is showing
    showAllNews: false,
    qAdd: -1,         // subject whose "add a question" form is open
    report: false,       // mark schemes revealed (not saved)
    qd: {},           // draft of a new question, per subject
    ideaDraft: {},    // per project
    hOpen: null,      // open project on Side hustles (null = the first)
    menu: false,
    week: 0,          // 0 = this week, -1 = last week, 1 = next week ...
    showPlanned: false,
    evForm: false,
    ev: null,         // event draft while the form is open
    copied: false
  };
  // Temporary event types: label, icon, load it puts on the day
  const EVK = {
    game: ['Game', 'soccer-ball', 'High'], training: ['Training', 'whistle', 'Medium'],
    plans: ['Plans', 'calendar-star', 'Low'], other: ['Other', 'calendar-plus', 'Low']
  };
  const KIND = {
    gym: ['Workout', 'barbell'], football: ['Pitch', 'soccer-ball'], recovery: ['Recovery', 'heartbeat'],
    revision: ['Revision', 'book-open-text'], paper: ['Past paper', 'exam'],
    mental: ['Mindset', 'brain'], routine: ['Routine', 'moon-stars'], hustle: ['Side hustle', 'rocket-launch']
  };
  const CONF = ['Not rated', 'Red', 'Amber', 'Green'];
  const CONF_CLS = ['', 'red', 'amber', 'green'];

  // ---------- helpers ----------
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const iso = x => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  const fmt = (x, o) => x.toLocaleDateString('en-GB', o);
  function realMonday() { const now = new Date(); const m = new Date(now); m.setHours(12, 0, 0, 0); m.setDate(now.getDate() - ((now.getDay() + 6) % 7)); return m; }
  function monday() { const m = realMonday(); m.setDate(m.getDate() + ui.week * 7); return m; }
  const todayIdx = () => (new Date().getDay() + 6) % 7;
  const isToday = () => ui.week === 0 && ui.day === todayIdx();
  const curWeekKey = () => iso(realMonday());
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
  function weekMins() { return st().minsWeek === curWeekKey() ? st().mins : st().mins.map(() => 0); }
  // Temporary events on a date, earliest first; and the one that replaces the plan, if any.
  const eventsOn = k => (st().events || []).filter(e => e.date === k).sort((a, b) => (a.start || '').localeCompare(b.start || ''));
  const replacingEvent = k => eventsOn(k).find(e => e.replace);
  // The day's real plan after events (see planner.js), and the cards to show.
  const planFor = d => Planner.planDay(DATA, iso(dt(d)), eventsOn, false, planOpts);
  const shownItems = d => planFor(d).items.filter(Planner.shown);
  const sid = key => key.split('@')[0];
  // What a day effectively looks like once events are applied.
  function dayView(i) {
    const evs = eventsOn(iso(dt(i)));
    const c = DATA.schedule[i], ev = evs.find(e => e.replace) || evs.find(e => e.kind === 'game' || e.kind === 'training');
    if (!ev) return { title: c.title, load: c.load, time: c.time, sub: c.sub, mission: c.mission, ev: null };
    const k = EVK[ev.kind] || EVK.other;
    return { title: ev.title, load: k[2] === 'High' || c.load === 'High' ? 'High' : k[2], ev,
      time: ev.start ? ev.start + (ev.end ? '–' + ev.end : '') : 'All day', sub: (ev.replace ? 'Planned: ' : 'Plan reorganised · was: ') + c.title,
      mission: ev.kind === 'game' ? 'Game day. Eat 3 hours before, warm up properly, play simple and fast.' : (ev.note || c.mission) };
  }
  const icon = n => `<i class="ph ph-${n}" aria-hidden="true"></i>`;
  const pill = (load, text, sm) => `<span class="os-pill ${esc(load)}${sm ? ' sm' : ''}">${esc(text)}</span>`;
  const shortLoad = l => l === 'Medium-High' ? 'M+' : l[0];
  // Which subject a revision card is for. `subjects: [a, b]` alternates week by week.
  function subjOf(c) {
    if (Array.isArray(c.subjects) && c.subjects.length) {
      const n = Math.round((monday() - new Date(2026, 10, 9, 12)) / (7 * 864e5));
      return c.subjects[((n % c.subjects.length) + c.subjects.length) % c.subjects.length];
    }
    return c.subject;
  }

  // ---------- pieces ----------
  function nav() {
    return TABS.map(t => `<button class="os-nav ${ui.tab === t[0] ? 'on' : ''}" data-act="tab" data-v="${t[0]}"${ui.tab === t[0] ? ' aria-current="page"' : ''}>${icon(t[2])}<span>${t[1]}</span></button>`).join('');
  }

  // Left sidebar contents: shared by the desktop rail and the phone menu (three-line button).
  function menuBody() {
    const ids = cardIds(ui.day), unread = unreadUpdates().length;
    return `<span class="os-k acc" style="padding:0 14px 10px">Elijah OS</span>
      ${nav()}
      ${ids.length ? `<span class="os-k os-menu-k">${isToday() ? 'Today' : FULL[ui.day]}</span>
        ${ids.map(id => { const c = DATA.sessions[sid(id)], done = getSess(id).done;
          return `<button class="os-nav os-menu-sess ${done ? 'done' : ''}" data-act="goCard" data-v="${esc(id)}">${icon(done ? 'check-circle' : (KIND[c.kind] || KIND.gym)[1])}<span>${esc(c.title)}</span></button>`; }).join('')}` : ''}
      <span class="os-k os-menu-k">More</span>
      <button class="os-nav" data-act="goNews">${icon('megaphone')}<span>What's new</span>${unread ? `<span class="os-badge os-num">${unread}</span>` : ''}</button>
      <button class="os-nav" data-act="goTopics">${icon('list-checks')}<span>Revision topics</span></button>
      <button class="os-nav" data-act="evNewMenu">${icon('calendar-plus')}<span>Add event</span></button>
      <button class="os-nav" data-act="goCal">${icon('calendar-check')}<span>Calendar</span></button>
      <button class="os-nav" data-act="goRemind">${icon('bell')}<span>Reminders</span>${remindCfg().on ? '' : '<span class="os-badge os-num" style="background:var(--color-neutral-700);color:var(--color-text)">off</span>'}</button>
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
    return `<div class="os-strip">${DATA.schedule.map((d, i) => { const v = dayView(i), n = eventsOn(iso(dt(i))).length;
      return `<button class="os-day ${tall ? 'tall' : ''} ${i === ui.day ? 'on' : ''} ${ui.week === 0 && i === todayIdx() ? 'now' : ''}" data-act="day" data-v="${i}" aria-label="${FULL[i]}${n ? ', ' + n + ' event' + (n > 1 ? 's' : '') : ''}">
      <span>${esc(d.day)}</span>${tall ? `<span class="os-num" style="font-size:16px;color:var(--color-text)">${dt(i).getDate()}</span>` : ''}${pill(v.load, shortLoad(v.load), true)}${n ? '<span class="os-evdot"></span>' : ''}</button>`; }).join('')}</div>`;
  }

  function dayList(fullLoad, withKicker) {
    return `<section class="os-card os-list">${withKicker ? '<span class="os-k" style="padding:8px 10px">This week</span>' : ''}${DATA.schedule.map((d, i) => { const v = dayView(i), extra = eventsOn(iso(dt(i))).filter(e => !e.replace);
      return `<button class="os-drow ${i === ui.day ? 'on' : ''}" data-act="day" data-v="${i}">
      <span class="os-num os-muted">${esc(d.day)}</span><span style="line-height:1.3">${v.ev ? icon((EVK[v.ev.kind] || EVK.other)[1]) + ' ' : ''}${esc(v.title)}${extra.map(e => `<span class="os-drow-ev">+ ${esc(e.title)}${e.start ? ' · ' + esc(e.start) : ''}</span>`).join('')}</span>${pill(v.load, fullLoad ? v.load : shortLoad(v.load))}</button>`; }).join('')}</section>`;
  }

  function sessionCard(kicker, withStrip) {
    const c = dayView(ui.day);
    return `<section class="os-card os-hero">
      <div class="os-between"><span class="os-k">${esc(c.ev ? 'Changed · ' + FULL[ui.day] : kicker)}</span>${pill(c.load, c.load + ' load')}</div>
      <div class="os-sess-title">${esc(c.title)}</div>
      <div class="os-time">${icon('clock')}<span class="os-num">${esc(c.time)}</span></div>
      ${c.sub ? `<div class="os-num os-sub">${esc(c.sub)}</div>` : ''}
      ${withStrip ? `<div style="padding-top:4px">${strip(false)}</div>` : ''}
    </section>`;
  }

  // ---------- day and week navigation ----------
  function dayNav() {
    return `<div class="os-daynav">
      <button class="btn btn-secondary btn-icon os-navbtn" data-act="shiftDay" data-v="-1" aria-label="Previous day">${icon('caret-left')}</button>
      <div class="os-daynav-t"><span class="os-num">${fmt(dt(ui.day), { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        ${isToday() ? '<span class="os-k acc">Today</span>' : '<button class="btn btn-ghost os-today" data-act="goToday">Back to today</button>'}</div>
      <button class="btn btn-secondary btn-icon os-navbtn" data-act="shiftDay" data-v="1" aria-label="Next day">${icon('caret-right')}</button></div>`;
  }
  function weekNav() {
    const label = ui.week === 0 ? 'This week' : ui.week === 1 ? 'Next week' : ui.week === -1 ? 'Last week' : (ui.week > 0 ? 'In ' + ui.week + ' weeks' : -ui.week + ' weeks ago');
    return `<div class="os-daynav">
      <button class="btn btn-secondary btn-icon os-navbtn" data-act="shiftWeek" data-v="-1" aria-label="Previous week">${icon('caret-double-left')}</button>
      <div class="os-daynav-t"><span class="os-num">${label}</span>${ui.week ? '<button class="btn btn-ghost os-today" data-act="goToday">Back to today</button>' : ''}</div>
      <button class="btn btn-secondary btn-icon os-navbtn" data-act="shiftWeek" data-v="1" aria-label="Next week">${icon('caret-double-right')}</button></div>`;
  }

  // ---------- temporary events ----------
  function evTimes(e) { return e.start ? e.start + (e.end ? '–' + e.end : '') : 'All day'; }
  function evCalData(e) {
    return { uid: 'event-' + e.id + '@elijah-os', title: e.title, date: e.date, start: e.start, end: e.end, desc: e.note || '', alarm: 30 };
  }
  function eventCard(e) {
    const k = EVK[e.kind] || EVK.other;
    return `<article class="os-scard os-ev" data-kind="${esc(e.kind)}">
      <div class="os-scard-head" style="cursor:default">
        <span class="os-scard-ic">${icon(k[1])}</span>
        <span class="os-scard-t"><span class="os-k">${esc(k[0])} · <span class="os-num">${esc(evTimes(e))}</span></span>
          <span class="os-scard-title">${esc(e.title)}</span>
          ${e.note ? `<span class="os-muted" style="font-size:13px;line-height:1.4">${esc(e.note)}</span>` : ''}
          <span class="os-muted" style="font-size:12px">${e.replace ? 'Clears the day’s plan' : 'Plan reorganised around it'}</span></span>
      </div>
      <div class="os-ev-acts">
        <button class="btn btn-secondary" data-act="evIcs" data-v="${esc(e.id)}">${icon('calendar-plus')}Add to calendar</button>
        <a class="btn btn-secondary" href="${esc(Cal.googleLink(evCalData(e)))}" target="_blank" rel="noopener">${icon('google-logo')}Google</a>
        <button class="btn btn-ghost btn-icon os-x" data-act="evRm" data-v="${esc(e.id)}" aria-label="Remove ${esc(e.title)}">${icon('trash')}</button>
      </div></article>`;
  }
  function eventForm() {
    const e = ui.ev;
    return `<form class="os-card os-hero os-evform" data-form="event" novalidate>
      <div class="os-between"><span class="os-k acc">New event</span><button type="button" class="btn btn-ghost btn-icon os-x" data-act="evCancel" aria-label="Cancel">${icon('x')}</button></div>
      <div class="os-chips" role="group" aria-label="Type">${Object.keys(EVK).map(k => `<button type="button" class="os-chipsel ${e.kind === k ? 'on' : ''}" data-act="evKind" data-v="${k}" aria-pressed="${e.kind === k}">${icon(EVK[k][1])}${EVK[k][0]}</button>`).join('')}</div>
      <div class="field"><label for="ev-title">What</label><input class="input os-in" id="ev-title" placeholder="After-school game" value="${esc(e.title)}" data-in="ev" data-f="title"></div>
      <div class="os-evgrid">
        <div class="field"><label for="ev-date">Date</label><input class="input os-in" type="date" id="ev-date" value="${esc(e.date)}" data-in="ev" data-f="date"></div>
        <div class="field"><label for="ev-start">Start</label><input class="input os-in" type="time" id="ev-start" value="${esc(e.start)}" data-in="ev" data-f="start"></div>
        <div class="field"><label for="ev-end">End</label><input class="input os-in" type="time" id="ev-end" value="${esc(e.end)}" data-in="ev" data-f="end"></div>
      </div>
      <div class="field"><label for="ev-note">Note (optional)</label><input class="input os-in" id="ev-note" placeholder="Kick-off 16:00, meet 15:40" value="${esc(e.note)}" data-in="ev" data-f="note"></div>
      <button type="button" class="os-row ${e.replace ? 'on' : ''}" data-act="evReplace" aria-pressed="${!!e.replace}"><span class="os-box">${icon('check')}</span><span style="font-size:14px">Clear the whole day's plan instead<br><span class="os-muted" style="font-size:12px">Otherwise the planner moves things around it</span></span></button>
      ${ui.evErr ? `<span class="os-err">${esc(ui.evErr)}</span>` : ''}
      <button class="btn btn-primary os-btn" type="submit">Save event</button></form>`;
  }

  // ---------- calendar ----------
  function feedUrl() { return new URL('calendar.ics', location.href).href; }
  function calendarCard() {
    const https = feedUrl(), webcal = https.replace(/^https?:/, 'webcal:');
    return `<section class="os-card" id="calendar"><span class="os-k">Calendar</span>
      <div style="font-size:14px;line-height:1.5;color:var(--color-neutral-200)">Subscribe once and your weekly plan shows in your phone's calendar. It updates by itself when the plan changes.</div>
      <a class="btn btn-primary os-btn" href="${esc(webcal)}">${icon('calendar-check')}Subscribe (iPhone, iPad, Mac)</a>
      <button class="btn btn-secondary os-btn" data-act="copyFeed">${icon(ui.copied ? 'check' : 'copy')}${ui.copied ? 'Link copied' : 'Copy link for Google Calendar'}</button>
      <span class="os-muted" style="font-size:12px;line-height:1.5">Google: on a computer open calendar.google.com, then Other calendars → + → From URL, and paste the link.</span>
      <button class="btn btn-secondary os-btn" data-act="weekIcs">${icon('download-simple')}Download ${ui.week === 0 ? 'this week' : 'the week shown'} with events (.ics)</button>
    </section>`;
  }
  function downloadIcs(name, ics) {
    const a = document.createElement('a');
    a.href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
  }
  function weekIcs() {
    const evs = [];
    for (let i = 0; i < 7; i++) {
      const k = iso(dt(i));
      shownItems(i).forEach(it => { const ev = Cal.planEvent(DATA, i, { id: it.id, at: it.at }, k);
        evs.push(Object.assign(ev, { uid: 'plan-' + k + '-' + it.key + '@elijah-os', end: it.at ? Cal.addMin(it.at, it.min) : '' })); });
      eventsOn(k).forEach(e => evs.push(evCalData(e)));
    }
    return Cal.calendar(evs, 'Elijah OS · week of ' + fmt(dt(0), { day: 'numeric', month: 'short' }));
  }

  // ---------- reminders ----------
  // Settings live on this device only (notification permission is per device).
  const RKEY = 'elijahos.remind', FKEY = 'elijahos.fired';
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const remindCfg = () => Object.assign({ on: false, lead: 10 }, lsGet(RKEY, {}));
  const canNotify = () => 'Notification' in window && 'serviceWorker' in navigator;
  const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const hm = d => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

  // Today's reminders, whatever day the app is showing: [{ key, at: 'HH:MM', remindAt: 'HH:MM', title, body }]
  function todaysReminders() {
    const k = iso(new Date()), cfg = remindCfg(), out = [];
    const daily = st().daily[k] || { chk: [false, false, false, false] };
    const sess = st().sess[k] || {};
    const add = (key, at, lead, title, body) => out.push({ key, at, remindAt: Cal.addMin(at, -lead + 24 * 60), title, body });
    if (!daily.chk[0]) add('checkin', '07:30', 0, 'Morning check-in', 'Sleep, energy, legs: 1 to 5.');
    Planner.planDay(DATA, k, eventsOn, false, planOpts).items.filter(Planner.shown).forEach(r => {
      const c = DATA.sessions[r.id];
      if (!c || !r.at || c.optional || (sess[r.key] && sess[r.key].done)) return;
      const lead = c.remind != null ? c.remind : cfg.lead;
      add('s-' + r.key + '-' + r.at, r.at, lead, c.kind === 'hustle' && mainHustle() ? mainHustle().name : c.title, (lead ? 'Starts at ' + r.at + '. ' : '') + (r.status !== 'ok' && r.note ? r.note + '. ' : '') + (c.focus || ''));
    });
    eventsOn(k).forEach(e => { if (e.start) add('e-' + e.id, e.start, Math.max(30, cfg.lead), e.title, 'Starts at ' + e.start + (e.note ? '. ' + e.note : '')); });
    if (!daily.chk[3]) add('log', '21:00', 0, '2-line log', 'One win, one fix.');
    return out.sort((a, b) => a.remindAt.localeCompare(b.remindAt));
  }
  async function notify(title, body, tag) {
    const reg = await navigator.serviceWorker.ready;
    return reg.showNotification(title, { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' });
  }
  // Runs every 30 seconds while the app is open: sends any reminder due in the last 15 minutes, once.
  function checkReminders() {
    if (!canNotify() || !remindCfg().on || Notification.permission !== 'granted') return;
    const now = hm(new Date()), late = hm(new Date(Date.now() - 15 * 6e4)), k = iso(new Date());
    const fired = lsGet(FKEY, {}), done = fired[k] || [];
    todaysReminders().forEach(r => {
      if (done.includes(r.key) || r.remindAt > now || r.remindAt < late) return;
      done.push(r.key);
      notify(r.title, r.body, k + '-' + r.key).catch(() => {});
    });
    lsSet(FKEY, { [k]: done });
  }
  function remindersCard() {
    const cfg = remindCfg(), perm = canNotify() ? Notification.permission : 'unsupported';
    const on = cfg.on && perm === 'granted';
    const upcoming = todaysReminders().filter(r => r.remindAt >= hm(new Date())).slice(0, 5);
    let status;
    if (perm === 'unsupported') status = isIOS() && !standalone() ? 'On iPhone, add Elijah OS to your Home Screen first (Share → Add to Home Screen), then open it from there.' : 'This browser cannot show notifications. Use the calendar alerts below.';
    else if (perm === 'denied') status = 'Notifications are blocked for this site. Allow them in your browser or phone settings, then come back.';
    else status = on ? 'On. Reminders come while Elijah OS is open or in the background.' : 'Off.';
    return `<section class="os-card" id="reminders"><div class="os-between"><span class="os-k">Reminders</span>${on ? '<span class="tag tag-outline">On</span>' : ''}</div>
      <div style="font-size:14px;line-height:1.5;color:var(--color-neutral-200)">${esc(status)}</div>
      ${perm === 'default' || (perm === 'granted' && !cfg.on) ? `<button class="btn btn-primary os-btn" data-act="remindOn">${icon('bell-ringing')}Turn on reminders</button>` : ''}
      ${on ? `<div class="os-chips" role="group" aria-label="Remind me before">${[5, 10, 15, 30].map(m => `<button class="os-chipsel ${cfg.lead === m ? 'on' : ''}" data-act="remindLead" data-v="${m}" aria-pressed="${cfg.lead === m}">${m} min before</button>`).join('')}</div>
        <div style="display:flex;gap:8px"><button class="btn btn-secondary os-btn" style="flex:1" data-act="remindTest">Send a test</button><button class="btn btn-secondary os-btn" style="flex:1" data-act="remindOff">Turn off</button></div>` : ''}
      ${upcoming.length ? `<span class="os-k" style="padding-top:4px">Still to come today</span>${upcoming.map(r => `<div class="os-between" style="font-size:14px"><span>${esc(r.title)}</span><span class="os-num os-muted" style="font-size:12px">${esc(r.remindAt)}</span></div>`).join('')}` : ''}
      <div class="os-remind-tip">${icon('calendar-check')}<span>For reminders when the app is closed, subscribe to the calendar on <button class="btn btn-ghost" style="padding:0;min-height:0" data-act="goCal">Week</button>. Every session alerts you before it starts (academy 30 min before).${isIOS() ? ' On iPhone, check Settings → Calendar → Accounts → Subscribed Calendars, and turn off "Remove Alerts".' : ''}</span></div>
    </section>`;
  }

  // ---------- session cards ----------
  const cardIds = d => shownItems(d).map(it => it.key);
  const itemOf = key => planFor(ui.day).items.find(it => it.key === key) || { key, id: sid(key), at: '', min: (DATA.sessions[sid(key)] || {}).minutes || 0, status: 'ok' };
  function getSess(id) { const e = (st().sess[dayKey()] || {})[id]; return Object.assign({ c: {}, done: false, added: 0 }, e); }
  // Which daily checklist item a finished card ticks: 1 = Revision block, 2 = Football / physical session.
  const checkFor = c => c.kind === 'revision' || c.kind === 'paper' ? 1 : (c.kind === 'gym' || c.kind === 'football' || c.kind === 'recovery') ? 2 : -1;

  // Rows for one card. Revision cards put the weakest topics of their subject first
  // (red, then not rated, then amber), keeping any topic already ticked today.
  // ---------- exam questions ----------
  const qhash = str => { let h = 5381; for (const ch of str) h = ((h << 5) + h + ch.charCodeAt(0)) | 0; return (h >>> 0).toString(36); };
  const QBANK = (window.ELIJAH_QUESTIONS || []).map(r => ({ s: r[0], t: r[1], ao: r[2], m: r[3], q: r[4], a: r[5], g: r[6] || 0, id: 'b' + qhash(r[4]) }));
  // ----- levels: which grade of question you're working at, per subject -----
  // Starts at startLevel. Every answer to a question at your level or above counts; over your last 8,
  // 75%+ moves you up a level and under 45% moves you down one. You see questions within one grade of your level.
  let levelCache = {};
  function levelOf(sj, date) {
    const sub = DATA.subjects[sj];
    if (!sub || !sub.target) return null;
    const key = sj + '|' + date;
    if (levelCache[key] != null) return levelCache[key];
    const log = st().qlog || {}, ev = [];
    allQuestions().forEach(q => { if (q.s === sj && q.g) (log[q.id] || []).forEach(x => { if (x.d < date) ev.push({ d: x.d, g: q.g, r: x.of ? x.got / x.of : 0 }); }); });
    ev.sort((a, b) => a.d.localeCompare(b.d));
    let L = sub.startLevel || 6, buf = [];
    const max = Math.max(4, sub.target - 1);
    ev.forEach(e => {
      if (e.g < L - 1) return;
      buf.push(e.r);
      if (buf.length < 8) return;
      const acc = buf.reduce((a, b) => a + b, 0) / buf.length;
      if (acc >= 0.75 && L < max) { L++; buf = []; } else if (acc < 0.45 && L > 4) { L--; buf = []; } else buf.shift();
    });
    return (levelCache[key] = L);
  }
  const levelRange = L => (L - 1) + '–' + Math.min(9, L + 1);
  const allQuestions = () => QBANK.concat((st().myq || []).map(x => Object.assign({ own: true }, x)));
  const qById = id => allQuestions().find(q => q.id === id);
  // ----- spaced repetition -----
  // After an attempt, a question comes back: missed (under half marks) next day, part marks in 3 days,
  // full marks in 7 days, then 14, 28 and 56 days for each full-marks answer in a row.
  const FULL_STEPS = [7, 14, 28, 56];
  const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 864e5);
  function qState(q, date) {
    const h = ((st().qlog || {})[q.id] || []).filter(x => x.d < date);
    if (!h.length) return { kind: 'new', due: 0, tries: 0 };
    const last = h[h.length - 1], r = last.of ? last.got / last.of : 0;
    let streak = 0; for (let i = h.length - 1; i >= 0 && h[i].got >= h[i].of; i--) streak++;
    const gap = r < 0.5 ? 1 : r < 1 ? 3 : FULL_STEPS[Math.min(streak, FULL_STEPS.length) - 1];
    return { kind: r < 0.5 ? 'missed' : r < 1 ? 'part' : 'solid', due: daysBetween(date, Cal.addDays(last.d, gap)), gap, tries: h.length, last };
  }
  function nextGap(got, of, q, date) {
    const r = of ? got / of : 0;
    if (r < 0.5) return 1; if (r < 1) return 3;
    const h = ((st().qlog || {})[q.id] || []).filter(x => x.d < date);
    let streak = 1; for (let i = h.length - 1; i >= 0 && h[i].got >= h[i].of; i--) streak++;
    return FULL_STEPS[Math.min(streak, FULL_STEPS.length) - 1];
  }
  // How well a topic is going, from your marks in the last 6 weeks (null = no answers yet).
  function topicAcc(s, t, date) {
    const from = Cal.addDays(date || iso(new Date()), -42), log = st().qlog || {}; let got = 0, of = 0;
    allQuestions().forEach(q => { if (q.s === s && q.t === t) (log[q.id] || []).forEach(x => { if (x.d >= from && (!date || x.d < date)) { got += x.got; of += x.of; } }); });
    return of ? got / of : null;
  }
  // 0 = weakest. Your red/amber/green rating counts, and so do your actual marks.
  // Topics you said lost marks in a past paper in the last 6 weeks.
  const paperFlagged = (s, t, date) => (st().papers || []).some(p => p.s === s && p.date && p.date >= Cal.addDays(date || iso(new Date()), -42) && (p.topics || []).includes(t));
  function topicWeak(s, t, date) {
    const conf = ((st().topics[s] || []).find(x => x.name === t) || {}).conf || 0, acc = topicAcc(s, t, date);
    const fromConf = [1.5, 0, 2, 3][conf], fromAcc = paperFlagged(s, t, date) ? 0 : acc == null ? 1.5 : acc < 0.5 ? 0 : acc < 0.75 ? 1.5 : 3;
    return (fromConf + fromAcc) / 2;
  }
  // Lower comes first: due or overdue questions (missed ones first), then new questions, then not-yet-due ones
  // (only if there aren't enough). Weak topics come before strong ones in each group.
  function qScore(q, date) {
    const s = qState(q, date), weak = topicWeak(q.s, q.t, date), L = q.g ? levelOf(q.s, date) : null;
    // Questions outside your level (more than one grade away) wait until there's nothing better; harder ones first.
    const dist = L == null ? 0 : q.g - L, pen = dist > 1 ? 40 + 20 * (dist - 2) : dist < -1 ? 60 + 20 * (-dist - 2) : 0;
    if (s.kind === 'new') return 100 + weak * 10 + pen;
    // Reviews you got right that are now below your level go after new questions at your level.
    if (s.due <= 0) return (s.kind === 'missed' ? 0 : s.kind === 'part' ? 20 : 40) + weak * 5 + Math.max(-10, s.due) + (s.kind === 'solid' && dist < -1 ? 120 : 0);
    return 300 + s.due * 5 + weak + pen;
  }
  // The questions a ladder card gives today. Ranked on history before today, so the list stays put while you answer.
  function ladderRows(key, c) {
    const e = getSess(key), date = dayKey(), sj = subjOf(c), rows = [];
    let pool = allQuestions().filter(q => c.mixed ? DATA.subjects[q.s] && q.s !== 5 : q.s === sj);
    const only = !c.mixed && c.only && c.only[sj];
    if (only) pool = pool.filter(q => Array.isArray(only) ? only.includes(q.t) : q.t.startsWith(only));
    const rnd = q => parseInt(qhash(date + key + q.id), 36);
    const LABEL = ['AO1 · quick marks', 'AO2 · main chunk', 'AO3 · heavy questions'];
    (c.ladder || []).forEach((n, i) => {
      if (!n) return;
      const ao = i + 1;
      let ranked = pool.filter(q => q.ao === ao).sort((a, b) => qScore(a, date) - qScore(b, date) || rnd(a) - rnd(b));
      if (c.mixed) { // take turns between subjects, starting with a different one each day
        const by = {}; ranked.forEach(q => (by[q.s] = by[q.s] || []).push(q));
        const subs = Object.keys(by).map(Number).sort((a, b) => a - b), start = new Date(date + 'T12:00').getDate() % Math.max(1, subs.length), out = [];
        for (let r = 0; out.length < ranked.length; r++) subs.forEach((_, j) => { const q = by[subs[(j + start) % subs.length]][r]; if (q) out.push(q); });
        ranked = out;
      }
      const chosen = ranked.slice(0, n);
      ranked.slice(n).forEach(q => { if ((e.q || {})[q.id] != null) chosen.push(q); });
      chosen.forEach((q, j) => rows.push({ key: 'q:' + q.id, q, sets: 1, head: j === 0 ? LABEL[i] : '' }));
      if (chosen.length < n) {
        const more = n - chosen.length;
        rows.push({ key: 'pp' + ao, name: more + ' more AO' + ao + ' question' + (more > 1 ? 's' : '') + ' from a past paper or your textbook', sets: 1,
          detail: 'Add your own questions on the Revision screen', head: chosen.length ? '' : LABEL[i] });
      }
    });
    return rows;
  }
  // Ladder cards show one question at a time, with dots to jump between them.
  function qDone(r, e) { return r.q ? (e.q || {})[r.q.id] != null : !!(e.c[r.key]); }
  function questionStepper(id, e) {
    const rows = cardRows(id);
    if (!rows.length) return '<span class="os-muted" style="font-size:14px">No questions for this subject yet. Add some on the Revision screen.</span>';
    let pos = ui.qPos[id];
    if (pos == null || pos >= rows.length) { pos = rows.findIndex(r => !qDone(r, e)); if (pos < 0) pos = 0; }
    const r = rows[pos], aoOf = x => x.q ? x.q.ao : +x.key.slice(2);
    const head = ['AO1 · quick marks', 'AO2 · main chunk', 'AO3 · heavy questions'][aoOf(r) - 1];
    const c = DATA.sessions[sid(id)], sj = c.mixed ? null : subjOf(c), L = sj == null ? null : levelOf(sj, dayKey());
    return `${L != null ? `<div class="os-level">${icon('trend-up')}<span>Working at <b>grade ${levelRange(L)}</b> questions</span><span class="os-muted">target ${DATA.subjects[sj].target}</span></div>` : ''}
      <div class="os-qdots" role="group" aria-label="Questions">${rows.map((x, i) => {
        const got = x.q ? (e.q || {})[x.q.id] : null, cls = x.q && got != null ? (got >= x.q.m ? 'full' : got ? 'part' : 'miss') : (!x.q && e.c[x.key] ? 'full' : '');
        const gapBefore = i && aoOf(rows[i - 1]) !== aoOf(x);
        return `${gapBefore ? '<span class="os-qdots-gap"></span>' : ''}<button class="os-qdot ${cls} ${i === pos ? 'on' : ''}" data-act="qgo" data-v="${esc(id)}|${i}" aria-label="Question ${i + 1}${cls ? ', answered' : ''}"></button>`; }).join('')}</div>
      <div class="os-between"><span class="os-k acc">${head}</span><span class="os-num os-muted" style="font-size:12px">${pos + 1} of ${rows.length}</span></div>
      ${sessRow(id, Object.assign({}, r, { head: '' }), e)}
      <div class="os-qnav">
        <button class="btn btn-secondary os-btn" data-act="qgo" data-v="${esc(id)}|${pos - 1}"${pos ? '' : ' disabled'}>${icon('caret-left')}Back</button>
        <button class="btn btn-secondary os-btn" data-act="qgo" data-v="${esc(id)}|${pos + 1}"${pos < rows.length - 1 ? '' : ' disabled'}>${qDone(r, e) ? 'Next' : 'Skip'}${icon('caret-right')}</button>
      </div>`;
  }
  const Q_TAG = { new: 'New', missed: 'Missed last time', part: 'Part marks last time', solid: 'Review' };
  function qRow(key, r, e) {
    const q = r.q, got = (e.q || {})[q.id], answered = got != null, shown = answered || ui.qShown[key + '|' + q.id];
    const v = esc(key + '|' + q.id), date = dayKey(), state = qState(q, date), ans = (e.ans || {})[q.id] || '';
    const gap = answered ? nextGap(got, q.m, q, date) : 0;
    const when = gap === 1 ? 'tomorrow' : gap < 7 ? 'in ' + gap + ' days' : 'in ' + gap / 7 + ' week' + (gap > 7 ? 's' : '');
    return `<div class="os-q ${answered ? (got >= q.m ? 'full' : got ? 'part' : 'miss') : ''}">
      <div class="os-between"><span class="os-k">AO${q.ao} · ${q.m} mark${q.m > 1 ? 's' : ''}${q.g ? ' · grade ' + q.g : ''} · ${esc(DATA.sessions[sid(key)].mixed ? DATA.subjects[q.s].name : topicShort(q.t))}</span>
        ${answered ? `<span class="os-num os-q-score">${got}/${q.m}</span>` : `<span class="os-q-tag ${state.kind}">${Q_TAG[state.kind]}</span>`}</div>
      <div class="os-q-text">${esc(q.q)}</div>
      <textarea class="input os-in os-q-input" rows="${q.m > 3 ? 4 : 2}" placeholder="Your answer" aria-label="Your answer" data-in="qans" data-f="${v}" id="qa-${esc(key)}-${q.id}"${answered ? ' readonly' : ''}>${esc(ans)}</textarea>
      ${shown ? `<div class="os-q-ans"><span class="os-k">Mark scheme</span><span>${esc(q.a)}</span></div>
        <span class="os-muted" style="font-size:12px">${answered ? 'Comes back ' + when + '. Tap another number to change your mark.' : 'Compare your answer with the mark scheme. How many marks did you get?'}</span>
        <div class="os-q-marks" role="group" aria-label="Your marks">${Array.from({ length: q.m + 1 }, (_, n) => `<button class="os-rpe ${got === n ? 'on' : ''}" data-act="qmark" data-v="${v}|${n}" aria-pressed="${got === n}">${n}</button>`).join('')}</div>`
      : `<button class="btn btn-primary os-btn" data-act="qshow" data-v="${v}">Check my answer</button>`}
    </div>`;
  }
  // Marks per AO for a subject over the last 4 weeks: [{ got, of }, ...] for AO1..AO3
  function aoStats(sj) {
    const from = iso(new Date(Date.now() - 28 * 864e5)), out = [{ got: 0, of: 0 }, { got: 0, of: 0 }, { got: 0, of: 0 }], log = st().qlog || {};
    allQuestions().forEach(q => { if (q.s !== sj) return; (log[q.id] || []).forEach(x => { if (x.d >= from) { out[q.ao - 1].got += x.got; out[q.ao - 1].of += x.of; } }); });
    return out;
  }

  function cardRows(id) {
    const c = DATA.sessions[sid(id)], e = getSess(id), rows = [];
    if (c.ladder) return ladderRows(id, c);
    const sj = subjOf(c);
    if (c.kind === 'revision' && sj != null) {
      const ts = st().topics[sj] || [];
      const order = t => [1, 0, 2, 3][t.conf || 0];
      const ticked = ts.filter(t => e.c['t:' + t.name]);
      const rest = ts.filter(t => !e.c['t:' + t.name] && t.conf !== 3).sort((a, b) => order(a) - order(b));
      ticked.concat(rest).slice(0, Math.max(c.topics || 1, ticked.length)).forEach(t =>
        rows.push({ key: 't:' + t.name, name: t.name, sets: 1, detail: CONF[t.conf || 0], conf: t.conf || 0 }));
      if (!ts.length) rows.push({ key: 'none', name: 'Add topics on the Revision screen', sets: 0, detail: '' });
    }
    (c.items || []).forEach((x, i) => {
      let detail = [x.sets ? x.sets + ' × ' + (x.reps || '') : x.reps, x.rest ? 'rest ' + x.rest : ''].filter(Boolean).join(' · ');
      rows.push({ key: 'i' + i, name: x.name, sets: x.sets || 1, detail });
    });
    if (c.kind === 'hustle') {
      const h = mainHustle(), idea = ideaFor(id);
      (h ? h.steps || [] : []).forEach((t, i) => rows.push({ key: 'h' + i, name: t, sets: 1,
        detail: i === 0 ? (idea ? 'Next idea: ' + idea.text : 'No ideas saved yet: add some in Side hustles') : '' }));
    }
    return rows;
  }
  function cardProgress(id) {
    const e = getSess(id), rows = cardRows(id);
    const total = rows.reduce((a, r) => a + r.sets, 0);
    const got = rows.reduce((a, r) => a + Math.min(r.sets, e.c[r.key] || 0), 0);
    return { got, total };
  }

  function sessionCards(d, title) {
    const ids = cardIds(d), k = iso(dt(d)), evs = eventsOn(k), plan = planFor(d);
    const open = ui.openCard != null ? ui.openCard : (ids.find(id => !getSess(id).done) || '');
    const core = ids.filter(id => !DATA.sessions[sid(id)].optional);
    const doneN = core.filter(id => getSess(id).done).length;
    const hidden = plan.items.filter(it => !Planner.shown(it));
    const changes = plan.changes.length || plan.warnings.length ? `<section class="os-plan" role="status">
        <div class="os-between"><span class="os-k camber">${icon('arrows-clockwise')} Plan reorganised</span></div>
        ${plan.warnings.map(w => `<div class="os-plan-warn">${icon('warning')}<span>${esc(w)}</span></div>`).join('')}
        ${plan.changes.map(t => `<div class="os-plan-line">${esc(t)}</div>`).join('')}
        ${hidden.length ? `<button class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="showPlanned">${ui.showPlanned ? 'Hide' : 'Show'} skipped sessions (${hidden.length})</button>` : ''}
      </section>` : '';
    const planned = ids.map(id => sessCard(id, id === open)).join('') +
      (ui.showPlanned ? hidden.map(it => sessCard(it.key, false, true)).join('') : '');
    return `<section class="os-cards" aria-label="${esc(title)}">
      <div class="os-between" style="padding:0 2px"><span class="os-k">${esc(title)}</span>${core.length ? `<span class="os-num os-muted" style="font-size:12px">${doneN} of ${core.length} done</span>` : ''}</div>
      ${evs.map(eventCard).join('')}
      ${changes}
      ${planned}
      ${ui.evForm ? eventForm() : `<button class="btn btn-secondary os-btn" data-act="evNew">${icon('plus')}Add event for ${fmt(dt(d), { weekday: 'long' })}</button>`}</section>`;
  }

  function sessCard(id, open, skipped) {
    const c = DATA.sessions[sid(id)], e = getSess(id), k = KIND[c.kind] || KIND.gym, it = itemOf(id);
    const p = cardProgress(id);
    const pct = p.total ? Math.round(p.got / p.total * 100) : 0;
    const sj = subjOf(c), sub = c.kind === 'revision' && sj != null ? DATA.subjects[sj] : null;
    return `<article class="os-scard ${e.done ? 'done' : ''} ${open ? 'open' : ''} ${skipped ? 'skipped' : ''}" data-kind="${esc(c.kind)}">
      <button class="os-scard-head" data-act="card" data-v="${esc(id)}" aria-expanded="${open}">
        <span class="os-scard-ic">${icon(e.done ? 'check' : k[1])}</span>
        <span class="os-scard-t"><span class="os-k">${c.optional ? 'Optional · ' : ''}${esc(k[0])}${sub ? ' · ' + esc(sub.name) : ''} · <span class="os-num">${it.min} min</span></span>
          <span class="os-scard-title">${esc(c.kind === 'hustle' && mainHustle() ? mainHustle().name : c.logPaper ? DATA.subjects[paperDraftFor(dayKey()).s].name + ' past paper' : c.title)}</span>
          ${it.status !== 'ok' && it.note ? `<span class="os-scard-note">${icon(skipped ? 'prohibit' : 'arrows-clockwise')} ${esc(it.note)}</span>` : ''}</span>
        <span class="os-num os-scard-pct">${it.at ? `<span class="${it.status === 'ok' ? 'os-muted' : 'camber'}">${esc(it.at)}</span><br>` : ''}${e.done ? 'Done' : p.got + '/' + p.total}</span>
        ${icon(open ? 'caret-up' : 'caret-down')}
      </button>
      <div class="os-bar os-scard-bar"><div style="width:${e.done ? 100 : pct}%"></div></div>
      ${open ? `<div class="os-scard-body">
        ${c.focus ? `<div class="os-scard-focus">${esc(c.focus)}</div>` : ''}
        ${c.ladder ? (() => { const qs = cardRows(id).filter(r => r.q && (e.q || {})[r.q.id] != null); const g = qs.reduce((a, r) => a + e.q[r.q.id], 0), o = qs.reduce((a, r) => a + r.q.m, 0);
          return qs.length ? `<div class="os-between os-q-total"><span>${qs.length} answered</span><span class="os-num">${g} / ${o} marks${o ? ' · ' + Math.round(g / o * 100) + '%' : ''}</span></div>` : ''; })() : ''}
        ${c.ladder ? questionStepper(id, e) : c.logPaper ? mockExam() : `<div class="os-scard-rows">${cardRows(id).map(r => sessRow(id, r, e)).join('')}</div>`}
        <button class="btn ${e.done ? 'btn-secondary' : 'btn-primary'} os-btn" data-act="sessDone" data-v="${esc(id)}">${e.done ? 'Undo finish' : 'Finish session'}${!e.done && sub ? ` · +${it.min} min ${esc(sub.name)}` : ''}</button>
      </div>` : ''}
    </article>`;
  }

  function sessRow(id, r, e) {
    const head = r.head ? `<div class="os-q-head os-k acc">${esc(r.head)}</div>` : '';
    if (r.q) return head + qRow(id, r, e);
    if (head) return head + sessRow(id, Object.assign({}, r, { head: '' }), e);
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
    const c = DATA.sessions[sid(id)], mins = itemOf(id).min || c.minutes, k = dayKey(), wk = curWeekKey(), day = getDay();
    Store.update(s => {
      const all = s.sess[k] = s.sess[k] || {};
      const e = Object.assign({ c: {}, done: false, added: 0 }, all[id]);
      if (!!e.done === on) return;
      e.done = on;
      const sj = subjOf(c);
      if (c.kind === 'revision' && sj != null && ui.week === 0) {
        if (s.minsWeek !== wk) { s.mins = s.mins.map(() => 0); s.minsWeek = wk; }
        if (on) { s.mins[sj] += mins; e.added = mins; e.subj = sj; }
        else { const was = e.subj != null ? e.subj : sj; s.mins[was] = Math.max(0, s.mins[was] - (e.added || 0)); e.added = 0; }
      }
      all[id] = e;
      if (c.kind === 'hustle') {
        const ukey = k + '|' + id, h = on ? s.hustles.find(x => !x.paused) : s.hustles.find(x => x.log.some(u => u.key === ukey));
        if (h && on) {
          const idea = h.ideas.find(x => !x.used);
          if (idea) idea.used = k;
          h.log = h.log.filter(u => u.key !== ukey).concat({ key: ukey, date: k, idea: idea ? idea.text : '', ideaId: idea ? idea.id : '' });
        } else if (h) {
          const u = h.log.find(x => x.key === ukey);
          if (u && u.ideaId) { const idea = h.ideas.find(x => x.id === u.ideaId); if (idea) idea.used = false; }
          h.log = h.log.filter(x => x.key !== ukey);
        }
      }
      const ci = checkFor(c);
      if (on && ci >= 0) { const chk = day.chk.slice(); chk[ci] = true; s.daily[k] = Object.assign({}, day, { chk }); }
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
      <button class="btn btn-ghost" data-act="seenAll">Got it</button></div>${(ui.showAllNews ? list : list.slice(0, 1)).map(noteItem).join('')}
      ${list.length > 1 && !ui.showAllNews ? `<button class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="allNews">${list.length - 1} more</button>` : ''}</section>`;
  }
  function updateBar() {
    return ui.newVersion ? `<div class="os-updbar" role="status">${icon('arrow-clockwise')}<span>A new version of Elijah OS is ready.</span>
      <button class="btn btn-primary" data-act="reload">Reload</button></div>` : '';
  }

  // ---------- side hustles ----------
  const hustles = () => st().hustles || [];
  const mainHustle = () => hustles().find(h => !h.paused) || null;
  const planOpts = { hide: id => DATA.sessions[id] && DATA.sessions[id].kind === 'hustle' && !mainHustle() };
  // The idea a hustle card uses: the one it was finished with, otherwise the main project's next unused idea.
  function ideaFor(key) {
    const h = mainHustle(); if (!h) return null;
    const u = h.log.find(x => x.key === dayKey() + '|' + key);
    if (u) return u.idea ? { text: u.idea } : null;
    return h.ideas.find(x => !x.used) || null;
  }
  function weekLog(h) {
    const a = curWeekKey(), b = iso(new Date(realMonday().getTime() + 7 * 864e5));
    return h.log.filter(u => u.date >= a && u.date < b);
  }
  // Upcoming side-hustle slots over the next week, from the real (reorganised) plan.
  function nextHustleSlots() {
    const out = [], now = new Date(), nowHM = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    for (let n = 0; n < 8 && out.length < 3; n++) {
      const d = new Date(now); d.setDate(now.getDate() + n); const k = iso(d);
      Planner.planDay(DATA, k, eventsOn, false, planOpts).items.filter(Planner.shown).forEach(it => {
        if (DATA.sessions[it.id].kind !== 'hustle' || (n === 0 && it.at && it.at < nowHM)) return;
        if (!((st().sess[k] || {})[it.key] || {}).done) out.push({ date: d, at: it.at, moved: it.status !== 'ok' ? it.note : '' });
      });
    }
    return out.slice(0, 3);
  }
  const hIdx = id => hustles().findIndex(h => h.id === id);
  const updHustle = (id, fn) => Store.update(s => { const h = s.hustles.find(x => x.id === id); if (h) fn(h, s); });

  function hustleCard(h, i) {
    const wk = weekLog(h), open = ui.hOpen === h.id || (ui.hOpen == null && i === 0), ideas = h.ideas.filter(x => !x.used);
    const isMain = mainHustle() && mainHustle().id === h.id;
    const recent = h.log.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    return `<section class="os-card ${isMain ? 'os-hero' : ''} os-hustle ${h.paused ? 'paused' : ''}">
      <button class="os-topics-head" data-act="hOpen" data-v="${esc(h.id)}" aria-expanded="${open}">
        <span class="os-scard-ic">${icon(h.paused ? 'pause' : 'rocket-launch')}</span>
        <span class="os-scard-t"><span class="os-k ${isMain ? 'acc' : ''}">${h.paused ? 'Paused' : isMain ? 'Main · in your week' : 'Side project'}</span>
          <span class="os-scard-title">${esc(h.name || 'Untitled')}</span>${h.about ? `<span class="os-muted" style="font-size:13px">${esc(h.about)}</span>` : ''}</span>
        <span class="os-num" style="font-size:13px;flex:none">${wk.length} / ${h.perWeek || 0}</span>${icon(open ? 'caret-up' : 'caret-down')}</button>
      <div class="os-uploads">${Array.from({ length: Math.max(h.perWeek || 0, wk.length) }, (_, j) => `<span class="${j < wk.length ? 'on' : ''}">${icon(j < wk.length ? 'check' : 'rocket-launch')}</span>`).join('')}</div>
      ${open ? `
      <div class="field"><label for="h-name-${i}">Name</label><input class="input os-in" id="h-name-${i}" value="${esc(h.name)}" data-in="hustle" data-f="name" data-i="${i}"></div>
      <div class="os-evgrid" style="grid-template-columns:minmax(0,1fr) 110px">
        <div class="field"><label for="h-about-${i}">What it is</label><input class="input os-in" id="h-about-${i}" value="${esc(h.about || '')}" data-in="hustle" data-f="about" data-i="${i}"></div>
        <div class="field"><label for="h-per-${i}">Per week</label><input class="input os-in os-num" inputmode="numeric" id="h-per-${i}" value="${esc(h.perWeek || '')}" data-in="hustle" data-f="perWeek" data-i="${i}"></div></div>
      <span class="os-k" style="padding-top:6px">Steps on the card</span>
      ${(h.steps || []).map((t, j) => `<div class="os-topic"><span class="os-num os-muted" style="width:20px;font-size:12px">${j + 1}</span>
        <input class="input os-in" style="flex:1;min-width:0" value="${esc(t)}" aria-label="Step ${j + 1}" data-in="hStep" data-f="${i}" data-i="${j}" id="h-step-${i}-${j}">
        <button class="btn btn-ghost btn-icon os-x" data-act="hStepRm" data-v="${esc(h.id)}|${j}" aria-label="Remove step">${icon('x')}</button></div>`).join('')}
      <button class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="hStepAdd" data-v="${esc(h.id)}">${icon('plus')}Add step</button>
      <div class="os-between" style="padding-top:6px"><span class="os-k">${esc(h.ideasLabel || 'Ideas')}</span><span class="os-num os-muted" style="font-size:12px">${ideas.length} ready</span></div>
      <form data-form="idea" data-i="${i}" style="display:flex;gap:8px">
        <input class="input os-in" style="flex:1;min-width:0" placeholder="Save an idea (title or link)" aria-label="New idea" value="${esc(ui.ideaDraft[h.id] || '')}" data-in="ideaDraft" data-f="${esc(h.id)}" id="idea-${i}">
        <button class="btn btn-primary os-btn" type="submit">Save</button></form>
      ${ideas.map((x, j) => `<div class="os-idea ${j === 0 ? 'next' : ''}">
        ${j === 0 ? '<span class="os-k acc" style="flex:none">Next</span>' : `<span class="os-num os-muted" style="flex:none;width:34px;font-size:12px">${j + 1}</span>`}
        <span class="os-idea-t">${/^https?:\/\//.test(x.text) ? `<a href="${esc(x.text)}" target="_blank" rel="noopener">${esc(x.text)}</a>` : esc(x.text)}</span>
        ${j ? `<button class="btn btn-ghost btn-icon os-x" data-act="ideaTop" data-v="${esc(h.id)}|${esc(x.id)}" aria-label="Use this one next">${icon('arrow-up')}</button>` : ''}
        <button class="btn btn-ghost btn-icon os-x" data-act="ideaRm" data-v="${esc(h.id)}|${esc(x.id)}" aria-label="Delete idea">${icon('x')}</button></div>`).join('')}
      <div class="os-between" style="padding-top:6px"><span class="os-k">Done</span><button class="btn btn-ghost" data-act="hLog" data-v="${esc(h.id)}">${icon('plus')}Log one</button></div>
      ${recent.map(u => `<div class="os-between" style="font-size:14px;min-height:36px"><span style="min-width:0;overflow-wrap:anywhere"><span class="os-num os-muted" style="font-size:12px">${fmt(new Date(u.date + 'T12:00'), { day: 'numeric', month: 'short' })}</span> · ${esc(u.idea || 'Done')}</span>
        <button class="btn btn-ghost btn-icon os-x" data-act="hLogRm" data-v="${esc(h.id)}|${esc(u.key)}" aria-label="Remove">${icon('x')}</button></div>`).join('') || '<span class="os-muted" style="font-size:13px">Finished side-hustle cards are logged here.</span>'}
      <span class="os-num os-muted" style="font-size:12px">${h.log.length} in total</span>
      <div class="os-chips" style="padding-top:6px">
        ${!isMain && !h.paused ? `<button class="os-chipsel" data-act="hMain" data-v="${esc(h.id)}">${icon('star')}Make main</button>` : ''}
        <button class="os-chipsel" data-act="hPause" data-v="${esc(h.id)}">${icon(h.paused ? 'play' : 'pause')}${h.paused ? 'Resume' : 'Pause'}</button>
        <button class="os-chipsel" data-act="hDel" data-v="${esc(h.id)}">${icon('trash')}Delete</button></div>` : ''}
    </section>`;
  }

  function hustleScreen() {
    const slots = nextHustleSlots(), main = mainHustle();
    return `
    <header class="os-head"><span class="os-k acc">Side hustles</span><h3>Projects</h3>
      <span class="os-muted" style="font-size:13px;line-height:1.5">Early days: change, pause or swap projects any time. Your weekly side-hustle slots always go to the main project.</span></header>
    <div class="os-grid g2">
      <div class="os-col">
        ${hustles().map(hustleCard).join('') || '<section class="os-card"><span class="os-muted" style="font-size:14px">No projects yet. Your side-hustle slots are hidden until you add one.</span></section>'}
        <button class="btn btn-secondary os-btn" data-act="hAdd">${icon('plus')}New project</button>
      </div>
      <section class="os-card"><span class="os-k">Next slots</span>
        ${main ? (slots.length ? slots.map(x => `<div class="os-between" style="font-size:14px;min-height:36px"><span>${fmt(x.date, { weekday: 'long', day: 'numeric', month: 'short' })}${x.moved ? ` <span class="camber" style="font-size:12px">· ${esc(x.moved)}</span>` : ''}</span><span class="os-num os-muted" style="font-size:12px">${esc(x.at || '')}</span></div>`).join('') : '<span class="os-muted" style="font-size:14px">No slots in the next week.</span>')
          : '<span class="os-muted" style="font-size:14px">All projects are paused, so the slots are hidden from your plan and that time is free.</span>'}
        <span class="os-muted" style="font-size:12px;line-height:1.5">Slots: Tuesday 19:45, Friday 18:45, Sunday 18:00, 30 minutes each. They move around games like everything else.</span>
      </section>
    </div>`;
  }

  // ---------- grades and past papers ----------
  // Rough GCSE grade from a percentage, using typical boundaries. Real boundaries change by subject, board and year.
  const BOUNDS = [[9, 80], [8, 72], [7, 64], [6, 55], [5, 47], [4, 38], [3, 28], [2, 18], [1, 9]];
  const gradeOf = pct => { for (const [g, b] of BOUNDS) if (pct >= b) return g; return 'U'; };
  // Marks for one subject between two dates (inclusive start, exclusive end): practice questions plus past papers.
  function marksBetween(sj, a, b) {
    const log = st().qlog || {}; let qg = 0, qo = 0, pg = 0, po = 0, papers = 0;
    allQuestions().forEach(q => { if (q.s === sj) (log[q.id] || []).forEach(x => { if (x.d >= a && x.d < b) { qg += x.got; qo += x.of; } }); });
    (st().papers || []).forEach(p => { if (p.s === sj && p.date && p.date >= a && p.date < b) { pg += p.got; po += p.of; papers++; } });
    // Past papers count double: they're the closest thing to the real exam.
    const got = qg + 2 * pg, of = qo + 2 * po;
    return { pct: of ? got / of * 100 : null, papers, n: qo + po };
  }
  function weeklySeries(sj, weeks) {
    const out = [], mon = realMonday();
    for (let w = weeks - 1; w >= 0; w--) {
      const a = iso(new Date(mon.getTime() - w * 7 * 864e5)), b = Cal.addDays(a, 7);
      out.push(Object.assign({ week: a }, marksBetween(sj, a, b)));
    }
    return out;
  }
  function subjectGrade(sj) {
    const today = Cal.addDays(iso(new Date()), 1), now = marksBetween(sj, Cal.addDays(today, -28), today), before = marksBetween(sj, Cal.addDays(today, -56), Cal.addDays(today, -28));
    // Needs at least 10 marks' worth of answers before it guesses a grade.
    const enough = m => m.pct != null && m.n >= 10;
    return { now, before, grade: enough(now) ? gradeOf(now.pct) : null, prev: enough(before) ? gradeOf(before.pct) : null };
  }

  function gradesView() {
    const subs = DATA.subjects.map((sub, i) => ({ sub, i, g: subjectGrade(i) })).filter(x => x.i !== 5 || x.g.now.n);
    const pick = ui.gradeSubj != null ? ui.gradeSubj : (subs.find(x => x.g.now.n) || subs[0]).i;
    const series = weeklySeries(pick, 10);
    return `
    <section class="os-card"><div class="os-between"><span class="os-k">Estimated grades · last 4 weeks</span></div>
      <div class="os-grades">${subs.map(({ sub, i, g }) => {
        const up = g.grade != null && g.prev != null && g.grade !== 'U' && g.prev !== 'U' ? g.grade - g.prev : 0;
        return `<button class="os-grade ${pick === i ? 'on' : ''}" data-act="gradeSubj" data-v="${i}" aria-pressed="${pick === i}">
          <span class="os-grade-n os-num">${g.grade == null ? '–' : g.grade}</span>
          <span class="os-grade-s">${esc(sub.name)}${sub.target ? ` <span class="os-muted" style="font-size:11px">→ ${sub.target}</span>` : ''}</span>
          <span class="os-num os-muted" style="font-size:11px">${g.now.pct == null ? 'no data yet' : g.grade == null ? g.now.n + ' marks so far' : Math.round(g.now.pct) + '%'}${up ? ` <span class="${up > 0 ? 'cgreen' : 'cred'}">${up > 0 ? '▲' : '▼'}${Math.abs(up)}</span>` : ''}</span></button>`; }).join('')}</div>
      <span class="os-muted" style="font-size:12px;line-height:1.5">A rough guide from typical grade boundaries. Past papers count double. Tap a subject to see its graph.</span>
    </section>
    <section class="os-card"><div class="os-between"><span class="os-k">${esc(DATA.subjects[pick].name)} · weekly score</span>
        <button class="btn btn-ghost" data-act="gradeTable">${ui.gradeTable ? 'Graph' : 'Table'}</button></div>
      ${ui.gradeTable ? gradeTable(series) : gradeChart(series)}
    </section>`;
  }
  function gradeChart(series) {
    const W = 320, H = 170, L = 26, R = 8, T = 8, B = 22, iw = W - L - R, ih = H - T - B;
    const x = i => L + (series.length === 1 ? iw / 2 : i * iw / (series.length - 1)), y = p => T + ih - p / 100 * ih;
    const pts = series.map((d, i) => d.pct == null ? null : { i, d, x: x(i), y: y(d.pct) });
    const have = pts.filter(Boolean);
    if (!have.length) return '<div class="os-muted" style="padding:24px 0;font-size:14px">Answer some questions or log a past paper to start the graph.</div>';
    const segs = []; let cur = [];
    pts.forEach(p => { if (p) cur.push(p.x.toFixed(1) + ',' + p.y.toFixed(1)); else if (cur.length) { segs.push(cur); cur = []; } }); if (cur.length) segs.push(cur);
    const guides = [[4, 38], [5, 47], [7, 64], [9, 80]];
    return `<div class="os-gchart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weekly score for the last ${series.length} weeks">
      ${guides.map(([g, b]) => `<line class="guide" x1="${L}" x2="${W - R}" y1="${y(b)}" y2="${y(b)}"></line><text class="glbl" x="${L - 4}" y="${y(b) + 3}" text-anchor="end">${g}</text>`).join('')}
      <line class="base" x1="${L}" x2="${W - R}" y1="${T + ih}" y2="${T + ih}"></line>
      ${segs.map(sg => `<polyline class="line" points="${sg.join(' ')}"></polyline>`).join('')}
      ${have.map(p => p.d.papers
        ? `<rect class="pt" x="${p.x - 4.5}" y="${p.y - 4.5}" width="9" height="9" rx="2"></rect>`
        : `<circle class="pt" cx="${p.x}" cy="${p.y}" r="4"></circle>`).join('')}
      ${have.map(p => `<rect class="hit" x="${p.x - 14}" y="${T}" width="28" height="${ih}" data-tip="${esc('Week of ' + fmt(new Date(p.d.week + 'T12:00'), { day: 'numeric', month: 'short' }) + ': ' + Math.round(p.d.pct) + '% · grade ' + gradeOf(p.d.pct) + (p.d.papers ? ' · includes a past paper' : ''))}"></rect>`).join('')}
      ${series.map((d, i) => i % 3 === (series.length - 1) % 3 ? `<text class="xlbl" x="${x(i)}" y="${H - 6}" text-anchor="${i === series.length - 1 ? 'end' : i === 0 ? 'start' : 'middle'}">${fmt(new Date(d.week + 'T12:00'), { day: 'numeric', month: 'short' })}</text>` : '').join('')}
    </svg><div class="os-gtip" hidden></div></div>
    <div class="os-gkey"><span><svg width="10" height="10"><circle cx="5" cy="5" r="4" class="pt"></circle></svg>practice questions</span><span><svg width="10" height="10"><rect x="1" y="1" width="8" height="8" rx="2" class="pt"></rect></svg>week with a past paper</span><span class="os-muted">dashed lines: grades 4, 5, 7, 9</span></div>`;
  }
  function gradeTable(series) {
    return `<table class="table os-gtable"><thead><tr><th>Week of</th><th style="text-align:right">Score</th><th style="text-align:right">Grade</th></tr></thead><tbody>
      ${series.slice().reverse().map(d => `<tr><td>${fmt(new Date(d.week + 'T12:00'), { day: 'numeric', month: 'short' })}${d.papers ? ' · paper' : ''}</td><td class="os-num" style="text-align:right">${d.pct == null ? '—' : Math.round(d.pct) + '%'}</td><td class="os-num" style="text-align:right">${d.pct == null ? '—' : gradeOf(d.pct)}</td></tr>`).join('')}</tbody></table>`;
  }

  // Past-paper log form, used on the Saturday card and on the Revision screen.
  // ----- mock exam (Saturday card) -----
  // This week's paper subject: rotates through DATA.paperRotation, unless you picked another one.
  function rotationSubject() {
    const rot = DATA.paperRotation || [0], n = Math.round((monday() - new Date(2026, 10, 9, 12)) / (7 * 864e5));
    return rot[((n % rot.length) + rot.length) % rot.length];
  }
  function paperDraftFor(date) {
    const d = st().paperDraft;
    if (d && d.date === date) return d;
    const s = rotationSubject();
    return { date, s, name: '', link: '', ms: '', mins: (DATA.paperMins || {})[s] || 90 };
  }
  const setDraft = patch => { const k = dayKey(), cur = paperDraftFor(k); Store.update(s => { s.paperDraft = Object.assign({}, cur, patch, { date: k }); }); };
  function timeLeft(d) {
    if (!d.startedAt) return null;
    return Math.max(0, d.startedAt + d.mins * 6e4 - (d.endedAt || Date.now()));
  }
  const clock = ms => { const t = Math.ceil(ms / 1000), h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };
  const linkBtn = (url, label, ic) => url ? `<a class="btn btn-secondary os-btn" href="${esc(url)}" target="_blank" rel="noopener">${icon(ic)}${label}</a>` : '';
  function mockExam() {
    const k = dayKey(), logged = (st().papers || []).filter(p => p.date === k), d = paperDraftFor(k);
    if (logged.length && !ui.pdAnother) return `<div class="os-q-total" style="display:flex;flex-direction:column;gap:6px"><span class="os-k">Logged</span>${logged.map(paperRow).join('')}</div>
      <button class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="pdAnother">${icon('plus')}Sit another paper</button>`;
    const steps = ['Set up', 'Sit it', 'Mark it'], stage = !d.startedAt ? 0 : !d.endedAt && timeLeft(d) > 0 ? 1 : 2;
    const head = `<div class="os-steps">${steps.map((t, i) => `<span class="${i === stage ? 'on' : i < stage ? 'done' : ''}">${i < stage ? icon('check') : i + 1} ${t}</span>`).join('')}</div>`;
    if (stage === 0) return head + `
      <div class="field"><label>Subject <span class="os-muted" style="font-size:12px">(this week’s rotation: ${esc(DATA.subjects[rotationSubject()].name)})</span></label>
        <div class="os-chips">${DATA.subjects.map((x, i) => i === 5 ? '' : `<button class="os-chipsel ${d.s === i ? 'on' : ''}" data-act="pdSubj" data-v="${i}" aria-pressed="${d.s === i}">${esc(x.name)}</button>`).join('')}</div></div>
      ${(() => { const sub = DATA.subjects[d.s], board = sub.board || '', q = t => 'https://www.google.com/search?q=' + encodeURIComponent(board.split(' (')[0] + ' GCSE ' + sub.name.split(' /')[0] + ' ' + t);
        return board ? `<div class="os-board"><span class="os-muted" style="font-size:13px">${esc(board)}</span>
          <a href="${q('past papers and mark schemes')}" target="_blank" rel="noopener">${icon('magnifying-glass')}Find papers</a>
          <a href="${q('grade boundaries')}" target="_blank" rel="noopener">${icon('chart-bar')}Grade boundaries</a></div>` : ''; })()}
      <div class="field"><label for="pd-name">Paper</label><input class="input os-in" id="pd-name" placeholder="e.g. ${esc((DATA.subjects[d.s].board || '').split(' (')[0] || 'AQA')} June 2023 Paper 1" value="${esc(d.name)}" data-in="draft" data-f="name"></div>
      <div class="field"><label for="pd-link">Link to the paper</label><input class="input os-in" id="pd-link" type="url" placeholder="Paste the link (PDF or website)" value="${esc(d.link)}" data-in="draft" data-f="link"></div>
      <div class="field"><label for="pd-ms">Link to the mark scheme</label><input class="input os-in" id="pd-ms" type="url" placeholder="Paste the link" value="${esc(d.ms)}" data-in="draft" data-f="ms"></div>
      <div class="field"><label for="pd-mins">Time allowed (minutes)</label><input class="input os-in os-num" id="pd-mins" inputmode="numeric" value="${esc(d.mins)}" data-in="draft" data-f="mins"></div>
      <button class="btn btn-primary os-btn" data-act="pdStart">${icon('timer')}Start the exam</button>`;
    if (stage === 1) return head + `
      <div class="os-timer"><span class="os-k">Time left</span><span class="os-num" data-timer>${clock(timeLeft(d))}</span><span class="os-muted" style="font-size:12px">${esc(d.name || DATA.subjects[d.s].name + ' paper')} · ${d.mins} min · phone away, no notes</span></div>
      <div class="os-qnav">${linkBtn(d.link, 'Open paper', 'file-text') || '<span></span>'}<button class="btn btn-secondary os-btn" data-act="pdStop">${icon('flag-checkered')}I’ve finished</button></div>`;
    return head + `
      <div class="os-qnav">${linkBtn(d.ms, 'Mark scheme', 'list-checks')}${linkBtn(d.link, 'Paper', 'file-text')}</div>
      <span class="os-muted" style="font-size:13px">${d.endedAt ? 'Finished in ' + clock(d.endedAt - d.startedAt) + '.' : 'Time’s up.'} Mark it properly against the mark scheme, then log it.</span>
      ${paperForm('card')}`;
  }

  function paperForm(where) {
    const d = ui.pd, ts = (st().topics[d.s] || []), card = where === 'card';
    return `<form data-form="paper" data-where="${where}" class="os-myq">
      ${card ? '' : `<div class="os-evgrid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">
        <select class="input os-in" aria-label="Subject" data-in="pd" data-f="s">${DATA.subjects.map((x, i) => `<option value="${i}" ${+d.s === i ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
        <input class="input os-in" type="date" aria-label="Date you sat it" value="${esc(d.date || iso(new Date()))}" data-in="pd" data-f="date">
      </div>
      <input class="input os-in" placeholder="Paper (e.g. AQA June 2023 Paper 1)" aria-label="Paper" value="${esc(d.name || '')}" data-in="pd" data-f="name">
      <input class="input os-in" type="url" placeholder="Link to the paper (optional)" aria-label="Link to the paper" value="${esc(d.link || '')}" data-in="pd" data-f="link">`}
      <div class="os-evgrid" style="grid-template-columns:1fr auto 1fr;align-items:center">
        <input class="input os-in os-num" inputmode="numeric" placeholder="Marks" aria-label="Marks you got" value="${esc(d.got || '')}" data-in="pd" data-f="got">
        <span class="os-muted">out of</span>
        <input class="input os-in os-num" inputmode="numeric" placeholder="Total" aria-label="Total marks" value="${esc(d.of || '')}" data-in="pd" data-f="of">
      </div>
      <button type="button" class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="pdBounds" aria-expanded="${!!ui.pdBounds}">${icon(ui.pdBounds ? 'minus' : 'plus')}Grade boundaries for this paper (optional)</button>
      ${ui.pdBounds ? `<span class="os-muted" style="font-size:12px;line-height:1.5">From the exam board’s grade boundaries document: the marks needed for each grade on this paper. Fill in the ones you have (9, 7, 5 and 4 are enough).</span>
        <div class="os-bounds">${[9, 8, 7, 6, 5, 4].map(g => `<label><span class="os-k">${g}</span><input class="input os-in os-num" inputmode="numeric" value="${esc((d.bounds || {})[g] || '')}" data-in="pdb" data-f="${g}" aria-label="Marks for grade ${g}"></label>`).join('')}</div>` : ''}
      ${ts.length ? `<span class="os-muted" style="font-size:12px">Tap the topics that lost you marks (they’ll come up more in your questions):</span>
        <div class="os-chips os-chips-sm os-chipbox">${ts.map((t, j) => `${topicGroup(ts, j)}<button type="button" class="os-chipsel ${(d.topics || []).includes(t.name) ? 'on' : ''}" data-act="pdTopic" data-v="${esc(t.name)}">${esc(topicShort(t.name))}</button>`).join('')}</div>` : ''}
      ${ui.pdErr ? `<span class="os-err">${esc(ui.pdErr)}</span>` : ''}
      <button class="btn btn-primary os-btn" type="submit">Save result</button></form>`;
  }
  // A paper's grade: from its own grade boundaries if you entered them, otherwise a rough estimate (≈).
  function paperGrade(p) {
    const b = p.bounds || {}, known = Object.keys(b).map(Number).filter(g => b[g] > 0).sort((x, y) => x - y);
    if (known.length) {
      // Fill in missing grades between the ones you entered (e.g. 6 halfway between 5 and 7).
      const full = {};
      for (let g = known[0]; g <= known[known.length - 1]; g++) {
        if (b[g] > 0) { full[g] = +b[g]; continue; }
        const lo = known.filter(k => k < g).pop(), hi = known.find(k => k > g);
        full[g] = Math.round(b[lo] + (b[hi] - b[lo]) * (g - lo) / (hi - lo));
      }
      const gs = Object.keys(full).map(Number).sort((x, y) => y - x);
      for (const g of gs) if (p.got >= full[g]) return { g, real: true };
      return { g: '<' + gs[gs.length - 1], real: true };
    }
    return { g: gradeOf(p.of ? p.got / p.of * 100 : 0), real: false };
  }
  function paperRow(p) {
    const pct = p.of ? Math.round(p.got / p.of * 100) : 0, g = paperGrade(p);
    return `<div class="os-paper"><span class="os-paper-g os-num" title="${g.real ? 'From this paper’s grade boundaries' : 'Rough estimate'}">${g.real ? '' : '≈'}${g.g}</span>
      <span class="os-paper-t"><span>${esc(DATA.subjects[p.s] ? DATA.subjects[p.s].name : '')}${p.name ? ' · ' + esc(p.name) : ''}</span>
        <span class="os-num os-muted" style="font-size:12px">${p.date ? fmt(new Date(p.date + 'T12:00'), { weekday: 'short', day: 'numeric', month: 'short' }) : 'no date'} · ${p.got}/${p.of} · ${pct}%${p.link ? ` · <a href="${esc(p.link)}" target="_blank" rel="noopener">paper</a>` : ''}</span></span>
      <button class="btn btn-ghost btn-icon os-x" data-act="paperRm" data-v="${esc(p.id)}" aria-label="Delete this paper">${icon('x')}</button></div>`;
  }
  function paperList(n, subj) {
    const list = (st().papers || []).filter(p => subj == null || p.s === subj).sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, n);
    return list.map(paperRow).join('');
  }

  // ---------- screens ----------
  function today() {
    const day = getDay(), log = getLog(), c = dayView(ui.day);
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
    ${dayNav()}
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
    ${weekNav()}
    <div class="os-grid g2">
      <div class="os-col">${strip(true)}${sessionCard(FULL[ui.day], false)}${sessionCards(ui.day, 'Session cards')}</div>
      <div class="os-col">${dayList(true, false)}${calendarCard()}</div>
    </div>`;
  }

  function revision() {
    const s = st();
    const mins = weekMins();
    return `
    <header class="os-head"><span class="os-k acc">Revision</span><h3>Priority order</h3></header>
    <div class="os-grid g2">
      <div class="os-col">
        <section class="os-card os-hero os-countdown"><div style="display:flex;flex-direction:column;gap:4px"><span class="os-k">First exam</span><span style="font-size:15px">${esc(DATA.firstExam.label)}</span></div>
          <span class="os-num" style="font-size:40px;line-height:1;color:var(--color-accent-300)">${daysLeft()}<span class="os-muted" style="font-size:13px"> days</span></span></section>
        <section class="os-card">
          <div class="os-between"><span class="os-k">Past papers</span><button class="btn btn-ghost" data-act="progGrades">Grades ${icon('arrow-right')}</button></div>
          <div class="os-chips os-chips-sm">${[[null, 'All']].concat(DATA.subjects.map((x, i) => [i, x.name])).filter(([i]) => i !== 5).map(([i, n]) => `<button class="os-chipsel ${ui.paperSubj === i ? 'on' : ''}" data-act="paperSubj" data-v="${i == null ? '' : i}">${esc(n)}</button>`).join('')}</div>
          ${paperList(5, ui.paperSubj) || `<span class="os-muted" style="font-size:14px">No ${ui.paperSubj == null ? '' : esc(DATA.subjects[ui.paperSubj].name) + ' '}papers logged yet. Saturday’s card runs one as a mock exam, or log one you did below.</span>`}
          <button class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="pdToggle" aria-expanded="${ui.pdOpen === 'rev'}">${icon(ui.pdOpen === 'rev' ? 'minus' : 'plus')}Log a past paper</button>
          ${ui.pdOpen === 'rev' ? paperForm('rev') : ''}
        </section>
        <section class="os-card">
          <button class="os-topics-head" data-act="toggleReport" aria-expanded="${ui.report}">${icon('paper-plane-tilt')}<span style="font-size:14px">Send my progress to Claude</span>${icon(ui.report ? 'caret-up' : 'caret-down')}</button>
          ${ui.report ? `<span style="font-size:14px;line-height:1.5;color:var(--color-neutral-200)">Copies a short report: your marks per AO, weakest topics, and recent answers that lost marks. Paste it into Claude Code and ask for new questions; they’ll be aimed at what you need.</span>
            <button class="btn btn-primary os-btn" data-act="copyReport">${icon(ui.copied === 'report' ? 'check' : 'copy')}${ui.copied === 'report' ? 'Report copied' : 'Copy report'}</button>` : ''}
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

  // Plain-text summary to paste into a chat with Claude, who writes new questions from it.
  function progressReport() {
    const today = iso(new Date()), log = st().qlog || {}, lines = ['ELIJAH OS revision report, ' + fmt(new Date(), { day: 'numeric', month: 'long', year: 'numeric' }), ''];
    lines.push('Marks by AO, last 4 weeks:');
    DATA.subjects.forEach((sub, i) => { const a = aoStats(i); if (a.some(x => x.of)) lines.push('- ' + sub.name + ': ' + a.map((x, j) => 'AO' + (j + 1) + ' ' + (x.of ? Math.round(x.got / x.of * 100) + '% (' + x.got + '/' + x.of + ')' : 'none')).join(', ')); });
    const topics = [];
    DATA.subjects.forEach((sub, i) => (st().topics[i] || []).forEach(t => { const a = topicAcc(i, t.name); topics.push({ name: sub.name + ' · ' + t.name, a, conf: CONF[t.conf || 0] }); }));
    lines.push('', 'Weakest topics (marks in the last 6 weeks, and my own rating):');
    topics.filter(t => t.a != null).sort((x, y) => x.a - y.a).slice(0, 8).forEach(t => lines.push('- ' + t.name + ': ' + Math.round(t.a * 100) + '% (' + t.conf + ')'));
    const unrated = topics.filter(t => t.a == null && t.conf === 'Red'); if (unrated.length) lines.push('- Rated red but not practised yet: ' + unrated.map(t => t.name).join('; '));
    const papers = (st().papers || []).filter(p => p.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
    if (papers.length) {
      lines.push('', 'Recent past papers:');
      papers.forEach(p => lines.push('- ' + p.date + ' ' + (DATA.subjects[p.s] || {}).name + (p.name ? ' ' + p.name : '') + ': ' + p.got + '/' + p.of + ' (' + Math.round(p.got / p.of * 100) + '%)' + ((p.topics || []).length ? '. Lost marks on: ' + p.topics.join(', ') : '')));
    }
    const wrong = [];
    allQuestions().forEach(q => (log[q.id] || []).forEach(x => { if (x.got < x.of) wrong.push({ q, x }); }));
    wrong.sort((a, b) => b.x.d.localeCompare(a.x.d));
    lines.push('', 'Recent answers that lost marks:');
    wrong.slice(0, 15).forEach(({ q, x }) => lines.push('- [' + DATA.subjects[q.s].name + ' · ' + q.t + ' · AO' + q.ao + ' · ' + x.got + '/' + x.of + '] ' + q.q + (x.ans ? ' | My answer: ' + x.ans.replace(/\s+/g, ' ') : '')));
    if (!wrong.length) lines.push('- none yet');
    lines.push('', 'Please add new exam questions to js/questions.js aimed at my weakest topics: some AO1 quick markers, mostly AO2, and a few AO3.');
    return lines.join('\n');
  }

  // Topics like "Algebra: quadratics" are grouped under "Algebra" and shown as "quadratics".
  const topicGroupOf = n => n.includes(': ') ? n.split(': ')[0] : '';
  const topicShort = n => { const g = topicGroupOf(n), r = g ? n.slice(g.length + 2) : n; return r.charAt(0).toUpperCase() + r.slice(1); };
  const topicGroup = (ts, j) => { const g = topicGroupOf(ts[j].name); return g && (j === 0 || topicGroupOf(ts[j - 1].name) !== g) ? `<div class="os-topic-group os-k">${esc(g)}</div>` : ''; };

  function topicBlock(i) {
    const ts = st().topics[i] || [];
    const cnt = [0, 0, 0, 0]; ts.forEach(t => cnt[t.conf || 0]++);
    const open = ui.subj === i;
    const ao = aoStats(i), mine = (st().myq || []).filter(q => q.s === i), d = ui.qd[i] || {};
    const hasQs = allQuestions().some(q => q.s === i);
    return `<div class="os-topics">
      ${DATA.subjects[i].board || DATA.subjects[i].note ? `<span class="os-muted" style="font-size:12px">${esc([DATA.subjects[i].board, DATA.subjects[i].note].filter(Boolean).join(' · '))}</span>` : ''}
      ${levelOf(i, iso(new Date())) != null ? `<div class="os-level">${icon('trend-up')}<span>Level: <b>grade ${levelRange(levelOf(i, iso(new Date())))}</b> questions</span><span class="os-muted">target ${DATA.subjects[i].target}</span></div>` : ''}
      ${hasQs ? `<div class="os-aostats" aria-label="Marks in the last 4 weeks">${ao.map((x, j) => `<span><span class="os-k">AO${j + 1}</span><span class="os-num ${x.of ? (x.got / x.of >= .7 ? 'cgreen' : x.got / x.of >= .4 ? 'camber' : 'cred') : 'os-muted'}">${x.of ? Math.round(x.got / x.of * 100) + '%' : '—'}</span><span class="os-num os-muted" style="font-size:11px">${x.of ? x.got + '/' + x.of : 'no reps'}</span></span>`).join('')}</div>` : ''}
      <button class="os-topics-head" data-act="subj" data-v="${i}" aria-expanded="${open}">
        <span style="font-size:13px">Topics</span>
        <span class="os-rag">${cnt[1] ? `<span class="cred">${cnt[1]} red</span>` : ''}${cnt[2] ? `<span class="camber">${cnt[2]} amber</span>` : ''}${cnt[3] ? `<span class="cgreen">${cnt[3]} green</span>` : ''}${cnt[0] ? `<span>${cnt[0]} not rated</span>` : ''}${ts.length ? '' : '<span>none yet</span>'}</span>
        ${icon(open ? 'caret-up' : 'caret-down')}</button>
      ${open ? `${ts.map((t, j) => `${topicGroup(ts, j)}<div class="os-topic">
          <button class="os-conf c${CONF_CLS[t.conf || 0]}" data-act="conf" data-v="${i}|${j}" aria-label="${esc(t.name)}: ${CONF[t.conf || 0]}. Tap to change.">${CONF[t.conf || 0]}</button>
          <span style="flex:1;min-width:0;font-size:14px">${esc(topicShort(t.name))}</span>
          ${(() => { const a = topicAcc(i, t.name); return a == null ? '' : `<span class="os-num ${a >= .75 ? 'cgreen' : a >= .5 ? 'camber' : 'cred'}" style="font-size:12px" title="Your marks on this topic, last 6 weeks">${Math.round(a * 100)}%</span>`; })()}
          <button class="btn btn-ghost btn-icon os-x" aria-label="Remove ${esc(t.name)}" data-act="rmTopic" data-v="${i}|${j}">${icon('x')}</button></div>`).join('')}
        <form data-form="topic" data-i="${i}" style="display:flex;gap:8px">
          <input class="input os-in" style="flex:1;min-width:0" placeholder="Add a topic" aria-label="New ${esc(DATA.subjects[i].name)} topic" value="${esc(ui.topicDraft)}" data-in="topicDraft" id="topic-${i}">
          <button class="btn btn-secondary os-btn" type="submit">Add</button></form>
        <span class="os-muted" style="font-size:12px">Tap a rating to change it. Questions on red topics come up first in your revision cards.</span>
        <button class="btn btn-ghost" style="align-self:flex-start;padding-left:0" data-act="qAddToggle" data-v="${i}" aria-expanded="${ui.qAdd === i}">${icon(ui.qAdd === i ? 'minus' : 'plus')}Add your own exam question${mine.length ? ' (' + mine.length + ' added)' : ''}</button>
        ${ui.qAdd === i ? `<form data-form="myq" data-i="${i}" class="os-myq">
          <div class="os-evgrid">
            <select class="input os-in" aria-label="Topic" data-in="qd" data-f="t" data-i="${i}">${ts.map(t => `<option ${d.t === t.name ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select>
            <select class="input os-in" aria-label="AO" data-in="qd" data-f="ao" data-i="${i}">${[1, 2, 3].map(n => `<option value="${n}" ${+(d.ao || 1) === n ? 'selected' : ''}>AO${n}</option>`).join('')}</select>
            <select class="input os-in" aria-label="Marks" data-in="qd" data-f="m" data-i="${i}">${[1, 2, 3, 4, 5, 6, 8, 9, 12].map(n => `<option value="${n}" ${+(d.m || 1) === n ? 'selected' : ''}>${n} mark${n > 1 ? 's' : ''}</option>`).join('')}</select>
          </div>
          <textarea class="input os-in" rows="2" placeholder="Question (e.g. from a past paper)" aria-label="Question" data-in="qd" data-f="q" data-i="${i}" id="qd-q-${i}">${esc(d.q || '')}</textarea>
          <textarea class="input os-in" rows="2" placeholder="Mark scheme / answer" aria-label="Mark scheme" data-in="qd" data-f="a" data-i="${i}" id="qd-a-${i}">${esc(d.a || '')}</textarea>
          <button class="btn btn-secondary os-btn" type="submit">${icon('plus')}Add question</button>
        </form>
        ${mine.length ? `<span class="os-muted" style="font-size:12px">Your questions: ${mine.length}</span>${mine.map(q => `<div class="os-topic"><span class="os-num os-muted" style="font-size:11px;flex:none">AO${q.ao} · ${q.m}m</span><span style="flex:1;min-width:0;font-size:13px;overflow-wrap:anywhere">${esc(q.q)}</span><button class="btn btn-ghost btn-icon os-x" data-act="rmMyq" data-v="${esc(q.id)}" aria-label="Delete question">${icon('x')}</button></div>`).join('')}` : ''}` : ''}` : ''}
    </div>`;
  }

  // Retests fall every `retestWeeks` weeks, counted from Monday 9 Nov 2026.
  function nextRetest() {
    const step = DATA.retestWeeks * 7 * 864e5, d = new Date(2026, 10, 9, 12), now = new Date(); now.setHours(0, 0, 0, 0);
    while (d < now) d.setTime(d.getTime() + step);
    return d;
  }

  function progress() {
    const s = st(), view = ui.progTab || 'grades';
    const seg = `<div class="os-seg" role="tablist">${[['grades', 'Grades'], ['fitness', 'Fitness']].map(([k, l]) => `<button role="tab" class="${view === k ? 'on' : ''}" aria-selected="${view === k}" data-act="progTab" data-v="${k}">${l}</button>`).join('')}</div>`;
    if (view === 'grades') return `<header class="os-head"><span class="os-k acc">Progress</span><h3>Grades</h3></header>${seg}${gradesView()}`;
    return `
    <header class="os-head"><span class="os-k acc">Progress</span><h3>Benchmarks</h3>
      ${seg}
      ${DATA.retestWeeks ? `<span class="os-num os-muted" style="font-size:13px">Retest every ${DATA.retestWeeks} weeks · next ${fmt(nextRetest(), { weekday: 'short', day: 'numeric', month: 'short' })}</span>` : ''}</header>
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
        ${s.skills.map((sk, k) => `<div class="os-skill">
          <input class="input os-in" style="font-size:17px" placeholder="Skill name" aria-label="Skill ${k + 1} name" value="${esc(sk.name)}" data-in="skillName" data-i="${k}" id="skillName-${k}">
          ${sk.steps.map((text, i) => {
            const cls = i === sk.cur ? 'on' : i < sk.cur ? 'done' : '';
            const tag = i === sk.cur ? 'current' : i < sk.cur ? 'done' : '';
            return `<div class="os-ladder"><button class="os-step ${cls}" data-act="step" data-v="${k}|${i}" aria-label="Mark ${esc(text || 'step ' + (i + 1))} as current"${i === sk.cur ? ' aria-current="step"' : ''}>${i + 1}</button>
              <input class="input os-in" style="flex:1;min-width:0" placeholder="Step ${i + 1}" aria-label="${esc(sk.name)} step ${i + 1}" value="${esc(text)}" data-in="stepText" data-f="${k}" data-i="${i}" id="step-${k}-${i}">
              <span class="os-num" style="font-size:11px;width:52px;color:var(--color-accent-300)">${tag}</span></div>`;
          }).join('')}</div>`).join('')}
        ${DATA.skillNext ? `<span style="font-size:14px;color:var(--color-neutral-200)">${esc(DATA.skillNext)}</span>` : ''}
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
    ${remindersCard()}
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
    levelCache = {};
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
      const screen = { today, week, rev: revision, prog: progress, log: logScreen, hustle: hustleScreen }[ui.tab]();
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
    day(v) { ui.day = +v; ui.openCard = null; ui.showPlanned = false; },
    shiftDay(v) {
      let d = ui.day + +v;
      if (d < 0) { d = 6; ui.week--; } else if (d > 6) { d = 0; ui.week++; }
      ui.day = d; ui.openCard = null; ui.showPlanned = false;
    },
    shiftWeek(v) { ui.week += +v; ui.openCard = null; ui.showPlanned = false; },
    goToday() { ui.week = 0; ui.day = todayIdx(); ui.openCard = null; ui.showPlanned = false; },
    showPlanned() { ui.showPlanned = !ui.showPlanned; },
    evNew() { ui.evForm = true; ui.evErr = ''; ui.ev = { title: '', kind: 'game', date: dayKey(), start: '16:00', end: '17:30', note: '', replace: false };
      setTimeout(() => { const el = root.querySelector('#ev-title'); if (el) { el.focus(); el.scrollIntoView({ block: 'center' }); } }); },
    evNewMenu() { ui.menu = false; if (ui.tab !== 'week') ui.tab = 'today'; actions.evNew(); },
    evCancel() { ui.evForm = false; ui.ev = null; },
    evKind(v) { ui.ev.kind = v; },
    evReplace() { ui.ev.replace = !ui.ev.replace; },
    evRm(v) {
      const e = (st().events || []).find(x => x.id === v);
      if (e && !confirm('Remove "' + e.title + '"?')) return;
      Store.update(s => { s.events = (s.events || []).filter(x => x.id !== v); });
    },
    evIcs(v) { const e = (st().events || []).find(x => x.id === v); if (e) downloadIcs(e.title.replace(/[^\w-]+/g, '-').toLowerCase() + '.ics', Cal.calendar([evCalData(e)], e.title)); },
    weekIcs() { downloadIcs('elijah-os-week-' + iso(dt(0)) + '.ics', weekIcs()); },
    async copyFeed() {
      try { await navigator.clipboard.writeText(feedUrl()); } catch (e) { prompt('Copy this link:', feedUrl()); }
      ui.copied = true; setTimeout(() => { ui.copied = false; render(); }, 2500);
    },
    goRemind() { ui.tab = 'log'; ui.menu = false; setTimeout(() => { const el = root.querySelector('#reminders'); if (el) el.scrollIntoView({ block: 'start' }); }); },
    async remindOn() {
      const p = await Notification.requestPermission();
      if (p === 'granted') { lsSet(RKEY, Object.assign(remindCfg(), { on: true })); notify('Reminders are on', 'Elijah OS will remind you before each session.', 'remind-on').catch(() => {}); }
    },
    remindOff() { lsSet(RKEY, Object.assign(remindCfg(), { on: false })); },
    remindLead(v) { lsSet(RKEY, Object.assign(remindCfg(), { lead: +v })); },
    remindTest() { const n = todaysReminders()[0]; notify(n ? n.title : 'Elijah OS', n ? n.body : 'Reminders are working.', 'test').catch(() => {}); },
    goCal() { ui.tab = 'week'; ui.menu = false; setTimeout(() => { const el = root.querySelector('#calendar'); if (el) el.scrollIntoView({ block: 'start' }); }); },
    card(v) {
      const ids = cardIds(ui.day);
      const open = ui.openCard != null ? ui.openCard : (ids.find(id => !getSess(id).done) || '');
      ui.openCard = open === v ? '' : v;
    },
    rmMyq(v) { if (!confirm('Delete this question?')) return; Store.update(s => { s.myq = (s.myq || []).filter(q => q.id !== v); }); },
    qshow(v) { ui.qShown[v] = true; },
    qmark(v) {
      levelCache = {};
      const parts = v.split('|'), n = +parts.pop(), qid = parts.pop(), key = parts.join('|');
      const q = qById(qid); if (!q) return;
      const k = dayKey(), cur = getSess(key);
      Store.update(s => {
        const all = s.sess[k] = s.sess[k] || {};
        const e = Object.assign({ c: {}, done: false, added: 0 }, all[key]);
        e.q = Object.assign({}, e.q, { [qid]: n });
        e.c = Object.assign({}, e.c, { ['q:' + qid]: 1 });
        all[key] = e;
        s.qlog = s.qlog || {};
        s.qlog[qid] = (s.qlog[qid] || []).filter(x => !(x.d === k && x.k === key)).concat({ d: k, k: key, got: n, of: q.m, ans: ((e.ans || {})[qid] || '').slice(0, 600) });
      });
      const p = cardProgress(key);
      if (!cur.done && p.total && p.got >= p.total) { finish(key, true); ui.openCard = null; }
      // Move on to the next unanswered question (after a moment, so you see your mark land).
      else if ((cur.q || {})[qid] == null) {
        const rows = cardRows(key), e2 = getSess(key), here = rows.findIndex(r => r.q && r.q.id === qid);
        const nxt = rows.findIndex((r, i) => i > here && !qDone(r, e2));
        if (nxt >= 0) setTimeout(() => { ui.qPos[key] = nxt; render(); }, 600);
      }
    },
    qgo(v) { const cut = v.lastIndexOf('|'); ui.qPos[v.slice(0, cut)] = Math.max(0, +v.slice(cut + 1)); },
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
    hOpen(v) { const cur = ui.hOpen == null ? (hustles()[0] || {}).id : ui.hOpen; ui.hOpen = cur === v ? '' : v; },
    hAdd() {
      const id = 'p' + Date.now().toString(36);
      Store.update(s => { s.hustles.push({ id, name: 'New project', about: '', perWeek: 2, steps: ['Plan', 'Make', 'Publish'], ideasLabel: 'Ideas', ideas: [], log: [], paused: false }); });
      ui.hOpen = id;
      setTimeout(() => { const el = root.querySelector('#h-name-' + (hustles().length - 1)); if (el) { el.focus(); el.select(); el.scrollIntoView({ block: 'center' }); } });
    },
    hMain(v) { Store.update(s => { const i = s.hustles.findIndex(x => x.id === v); if (i > 0) s.hustles.unshift(s.hustles.splice(i, 1)[0]); }); },
    hPause(v) { updHustle(v, h => { h.paused = !h.paused; }); },
    hDel(v) { const h = hustles()[hIdx(v)]; if (!h || !confirm('Delete "' + h.name + '" and its ideas and log?')) return; Store.update(s => { s.hustles = s.hustles.filter(x => x.id !== v); }); },
    hStepAdd(v) { updHustle(v, h => { h.steps = (h.steps || []).concat(''); }); },
    hStepRm(v) { const [id, j] = v.split('|'); updHustle(id, h => { h.steps = h.steps.filter((_, x) => x !== +j); }); },
    ideaRm(v) { const [id, x] = v.split('|'); updHustle(id, h => { h.ideas = h.ideas.filter(i => i.id !== x); }); },
    ideaTop(v) { const [id, x] = v.split('|'); updHustle(id, h => { const i = h.ideas.findIndex(y => y.id === x); if (i > 0) h.ideas.unshift(h.ideas.splice(i, 1)[0]); }); },
    hLog(v) {
      const k = iso(new Date());
      updHustle(v, h => { const idea = h.ideas.find(x => !x.used); if (idea) idea.used = k;
        h.log.push({ key: k + '|extra-' + Date.now().toString(36), date: k, idea: idea ? idea.text : '', ideaId: idea ? idea.id : '' }); });
    },
    hLogRm(v) { const cut = v.indexOf('|'), id = v.slice(0, cut), key = v.slice(cut + 1); if (!confirm('Remove this from the log?')) return; updHustle(id, h => { h.log = h.log.filter(u => u.key !== key); }); },
    progTab(v) { ui.progTab = v; },
    progGrades() { ui.tab = 'prog'; ui.progTab = 'grades'; window.scrollTo(0, 0); },
    gradeSubj(v) { ui.gradeSubj = +v; },
    gradeTable() { ui.gradeTable = !ui.gradeTable; },
    pdSubj(v) { const s = +v; setDraft({ s, mins: (DATA.paperMins || {})[s] || 90 }); ui.pd = { s, topics: [] }; },
    pdStart() {
      const d = paperDraftFor(dayKey()), mins = parseInt(d.mins, 10);
      if (!(mins > 0)) { alert('Set the time allowed first.'); return; }
      setDraft({ mins, startedAt: Date.now(), endedAt: null });
      Store.update(s => { const k = dayKey(), all = s.sess[k] = s.sess[k] || {}; const en = Object.assign({ c: {}, done: false, added: 0 }, all['past-paper']); en.c.i0 = 1; all['past-paper'] = en; });
      if (d.link) window.open(d.link, '_blank', 'noopener');
    },
    pdStop() {
      if (!confirm('Stop the timer and move on to marking?')) return;
      setDraft({ endedAt: Date.now() });
      Store.update(s => { const k = dayKey(), all = s.sess[k] = s.sess[k] || {}; const en = Object.assign({ c: {}, done: false, added: 0 }, all['past-paper']); en.c.i1 = 1; all['past-paper'] = en; });
    },
    pdAnother() { ui.pdAnother = true; Store.update(s => { s.paperDraft = null; }); },
    pdBounds() { ui.pdBounds = !ui.pdBounds; },
    paperSubj(v) { ui.paperSubj = v === '' ? null : +v; },
    paperRm(v) { const p = (st().papers || []).find(x => x.id === v); if (!p || !confirm('Delete this past paper result?')) return; Store.update(s => { s.papers = s.papers.filter(x => x.id !== v); }); },
    pdToggle() { ui.pdOpen = ui.pdOpen === 'rev' ? '' : 'rev'; ui.pdErr = ''; },
    pdTopic(v) { const t = ui.pd.topics || []; ui.pd.topics = t.includes(v) ? t.filter(x => x !== v) : t.concat(v); },
    allNews() { ui.showAllNews = true; },
    qAddToggle(v) { ui.qAdd = ui.qAdd === +v ? -1 : +v; },
    toggleReport() { ui.report = !ui.report; },
    async copyReport() {
      const text = progressReport();
      try { await navigator.clipboard.writeText(text); ui.copied = 'report'; } catch (e) { prompt('Copy this report:', text); }
      setTimeout(() => { ui.copied = false; render(); }, 2500);
    },
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
      const wk = curWeekKey();
      Store.update(s => {
        if (s.minsWeek !== wk) { s.mins = s.mins.map(() => 0); s.minsWeek = wk; }
        s.mins[+v] += 15;
      });
    },
    addBench() { Store.update(s => { s.bench.push({ name: '', base: '', latest: '', target: '' }); }); },
    step(v) { const [k, i] = v.split('|').map(Number); Store.update(s => { s.skills[k].cur = i; }); },
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
    } else if (f === 'event') {
      const e = ui.ev, title = (e.title || '').trim();
      if (!title) { ui.evErr = 'Give the event a name.'; render(); return; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || '')) { ui.evErr = 'Pick a date.'; render(); return; }
      if (e.start && e.end && e.end <= e.start) { ui.evErr = 'The end time must be after the start.'; render(); return; }
      const ev = { id: Date.now().toString(36), title, kind: e.kind, date: e.date, start: e.start || '', end: e.end || '', note: (e.note || '').trim(), replace: !!e.replace };
      Store.update(s => { s.events = (s.events || []).concat(ev); });
      // Jump to the event's day so it is visible.
      const d = new Date(ev.date + 'T12:00'), diff = Math.round((d - realMonday()) / 864e5);
      ui.week = Math.floor(diff / 7); ui.day = ((diff % 7) + 7) % 7;
      ui.evForm = false; ui.ev = null; ui.evErr = ''; ui.showPlanned = false;
      render();
    } else if (f === 'idea') {
      const i = +e.target.dataset.i, h = hustles()[i]; if (!h) return;
      const text = (ui.ideaDraft[h.id] || '').trim();
      if (!text) return;
      updHustle(h.id, x => { x.ideas.push({ id: Date.now().toString(36), text, used: false }); });
      ui.ideaDraft[h.id] = '';
      render();
      const inp = root.querySelector('#idea-' + i); if (inp) inp.focus();
    } else if (f === 'paper') {
      const d = ui.pd, got = parseFloat(d.got), of = parseFloat(d.of);
      if (!(of > 0) || !(got >= 0) || got > of) { ui.pdErr = 'Enter your marks and the total (e.g. 54 out of 80).'; render(); return; }
      const where = e.target.dataset.where, card = where === 'card', dr = paperDraftFor(dayKey());
      const date = card ? dayKey() : (/^\d{4}-\d{2}-\d{2}$/.test(d.date || '') ? d.date : iso(new Date()));
      const bounds = {}; Object.keys(d.bounds || {}).forEach(g => { const n = parseFloat(d.bounds[g]); if (n > 0) bounds[g] = n; });
      const paper = card
        ? { id: Date.now().toString(36), date, s: dr.s, name: (dr.name || '').trim(), link: dr.link || '', ms: dr.ms || '', mins: +dr.mins || 0, got, of, topics: d.topics || [], bounds }
        : { id: Date.now().toString(36), date, s: +d.s, name: (d.name || '').trim(), link: (d.link || '').trim(), got, of, topics: d.topics || [], bounds };
      Store.update(s => { s.papers = (s.papers || []).concat(paper); if (card) s.paperDraft = null; });
      ui.pd = { s: paper.s, topics: [] }; ui.pdErr = ''; ui.pdOpen = ''; ui.pdBounds = false; ui.pdAnother = false;
      if (where === 'card') { const items = DATA.sessions['past-paper'].items || []; Store.update(s => { const k = dayKey(), all = s.sess[k] = s.sess[k] || {}; const en = Object.assign({ c: {}, done: false, added: 0 }, all['past-paper']); items.forEach((_, j) => { en.c['i' + j] = 1; }); all['past-paper'] = en; }); finish('past-paper', true); }
      render();
    } else if (f === 'myq') {
      const i = +e.target.dataset.i, d = ui.qd[i] || {}, ts = st().topics[i] || [];
      const q = (d.q || '').trim(), a = (d.a || '').trim();
      if (!q || !a) { alert('Add the question and its mark scheme.'); return; }
      Store.update(s => { s.myq = (s.myq || []).concat({ id: 'u' + Date.now().toString(36), s: i, t: d.t || (ts[0] || {}).name || '', ao: +(d.ao || 1), m: +(d.m || 1), q, a }); });
      ui.qd[i] = { t: d.t, ao: d.ao, m: d.m };
      render();
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
      case 'skillName': Store.update(s => { s.skills[i].name = v; }); break;
      case 'stepText': Store.update(s => { s.skills[+f].steps[i] = v; }); break;
      case 'review': { const wk = weekKey(); Store.update(s => { const r = (s.reviews[wk] || ['', '', '']).slice(); r[i] = v; s.reviews[wk] = r; }); break; }
      case 'scoreDraft': ui.scoreDraft = v; break;
      case 'topicDraft': ui.topicDraft = v; break;
      case 'qans': { const parts = f.split('|'), qid = parts.pop(), key = parts.join('|'), k = dayKey();
        Store.update(s => { const all = s.sess[k] = s.sess[k] || {}; const en = Object.assign({ c: {}, done: false, added: 0 }, all[key]); en.ans = Object.assign({}, en.ans, { [qid]: v }); all[key] = en; }); break; }
      case 'pd': ui.pd[f] = v; if (f === 's') { ui.pd.topics = []; render(); } break;
      case 'pdb': ui.pd.bounds = Object.assign({}, ui.pd.bounds, { [f]: v }); break;
      case 'draft': setDraft({ [f]: f === 'mins' ? v.replace(/[^0-9]/g, '') : v }); break;
      case 'qd': ui.qd[i] = Object.assign({}, ui.qd[i], { [f]: v }); break;
      case 'ideaDraft': ui.ideaDraft[f] = v; break;
      case 'hustle': Store.update(s => { const h = s.hustles[i]; if (!h) return; h[f] = f === 'perWeek' ? Math.max(0, parseInt(v, 10) || 0) : v; }); break;
      case 'hStep': Store.update(s => { const h = s.hustles[+f]; if (h) h.steps[i] = v; }); break;
      case 'ev': if (ui.ev) ui.ev[f] = v; break;
      case 'goal': { const n = parseInt(v, 10); if (n > 0) Store.update(s => { s.goals[i] = n; }); break; }
    }
  });
  // Re-render after sliders and goals settle (updates the banner, chip and progress bars).
  root.addEventListener('change', e => {
    const k = e.target.dataset.in;
    if (k === 'r' || k === 'goal') render();
  });

  // Exam timer: update the clock every second; re-render when time runs out.
  setInterval(() => {
    const el = root.querySelector('[data-timer]'); if (!el) return;
    const d = paperDraftFor(dayKey()), left = timeLeft(d);
    if (left == null) return;
    if (left <= 0) { render(); if ('vibrate' in navigator) navigator.vibrate(400); } else el.textContent = clock(left);
  }, 1000);

  // Grade chart tooltips: hover on desktop, tap on phone.
  function chartTip(e) {
    const hit = e.target.closest && e.target.closest('.os-gchart .hit');
    root.querySelectorAll('.os-gtip').forEach(t => { if (!hit || !t.parentNode.contains(hit)) t.hidden = true; });
    if (!hit) return;
    const box = hit.closest('.os-gchart'), tip = box.querySelector('.os-gtip'), r = hit.getBoundingClientRect(), b = box.getBoundingClientRect();
    tip.textContent = hit.dataset.tip; tip.hidden = false;
    tip.style.left = Math.min(Math.max(0, r.left - b.left + r.width / 2 - tip.offsetWidth / 2), b.width - tip.offsetWidth) + 'px';
  }
  root.addEventListener('pointerover', chartTip);
  root.addEventListener('click', chartTip);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ui.menu) { ui.menu = false; render(); } });
  setInterval(checkReminders, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkReminders(); });
  setTimeout(checkReminders, 3000);
  window.addEventListener('elijah-update', () => { ui.newVersion = true; render(); });
  Store.onData(render);
  Store.onStatus(renderSync);

  // Keep the date-based views correct if the app stays open past midnight.
  let lastDate = iso(new Date());
  setInterval(() => {
    const d = iso(new Date());
    if (d !== lastDate && !root.contains(document.activeElement)) { lastDate = d; ui.week = 0; ui.day = todayIdx(); render(); }
  }, 60000);

  render();
})();
