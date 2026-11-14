// Elijah OS — screens and behaviour.
// Renders HTML strings into #app. Clicks use data-act, typing uses data-in (both handled at the bottom).

(function () {
  const DATA = window.ELIJAH_DATA;
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
    authStep: 'signin', // 'signin' | 'sent' (only used when signed out)
    email: '',
    emailErr: '',
    resent: false,
    sending: false
  };

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
      <div class="os-head" style="min-width:0"><span class="os-k acc">Elijah OS</span><h3>${greeting}, ${esc(DATA.name)}</h3>
        <span class="os-num os-muted" style="font-size:13px">${fmt(dt(ui.day), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;flex:none"><span class="os-k">Exam in</span>
        <span class="os-num" style="font-size:20px">${daysLeft()}<span class="os-muted" style="font-size:12px">d</span></span></div>
    </header>
    ${lows.length ? `<div class="os-amber" role="status">${icon('warning')}<div><strong style="font-weight:500">Adjust today</strong><br>${lows.join(' and ')}${lows.length > 1 ? ' are' : ' is'} low. Drop the session one load level or shorten it.</div></div>` : ''}
    <div class="os-grid g3">
      <div class="os-col">
        ${sessionCard('Session · ' + FULL[ui.day], true)}
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
          <div class="os-wk"><span class="os-k">Workout</span><span class="os-k" style="text-align:right">Sets</span><span class="os-k" style="text-align:right">Reps</span><span></span></div>
          ${wk.length ? '' : '<span class="os-muted" style="font-size:14px">No exercises for this day yet.</span>'}
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
      <div class="os-col">${strip(true)}${sessionCard(FULL[ui.day], false)}</div>
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
            <button class="btn btn-secondary os-btn os-num" data-act="addMin" data-v="${i}" aria-label="Add 15 minutes of ${esc(sub.name)}">+15</button></section>`;
        }).join('')}
      </div>
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
    if (ui.authStep === 'sent') {
      return `<div class="os-auth"><div class="os-card os-hero">${icon('envelope-simple')}<h3>Check your email</h3>
        <p>We sent a sign-in link to <span style="color:var(--color-accent-300)">${esc(ui.email)}</span>. Open it on this device to finish signing in.</p>
        ${ui.emailErr ? `<span class="os-err">${esc(ui.emailErr)}</span>` : ''}
        <button class="btn btn-secondary os-btn" data-act="resend">${ui.resent ? 'Link sent again' : 'Resend link'}</button>
        <button class="btn btn-ghost os-btn" data-act="otherEmail">Use a different email</button></div></div>`;
    }
    return `<div class="os-auth"><form class="os-card os-hero" data-form="signin" novalidate>
      <span class="os-k acc">Elijah OS</span><h3>Sign in</h3>
      <p>Enter your email and we'll send you a sign-in link. Use the same email on your phone and laptop to keep them in sync.</p>
      <div class="field"><label for="email">Email</label><input class="input os-in" type="email" autocomplete="email" placeholder="you@example.com" value="${esc(ui.email)}" data-in="email" id="email"></div>
      ${ui.emailErr ? `<span class="os-err" data-email-err>${esc(ui.emailErr)}</span>` : ''}
      <button class="btn btn-primary os-btn" type="submit"${ui.sending ? ' disabled' : ''}>${ui.sending ? 'Sending…' : 'Send sign-in link'}</button></form></div>`;
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
        <nav class="os-rail" aria-label="Main"><span class="os-k acc" style="padding:0 14px 16px">Elijah OS</span>${nav()}
          <div style="margin-top:auto;padding:0 14px;display:flex;flex-direction:column;gap:2px"><span class="os-k">First exam</span>
          <span class="os-num" style="font-size:22px">${daysLeft()}<span class="os-muted" style="font-size:12px"> days</span></span></div></nav>
        <main class="os-main">${screen}</main>
        <nav class="os-dock" aria-label="Main">${nav()}</nav></div>`;
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
    tab(v) { ui.tab = v; window.scrollTo(0, 0); },
    day(v) { ui.day = +v; },
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
    async signOut() { await Store.signOut(); ui.authStep = 'signin'; window.scrollTo(0, 0); },
    async resend() {
      try { await Store.sendLink(ui.email); ui.resent = true; ui.emailErr = ''; }
      catch (e) { ui.emailErr = 'Could not send the link. Check your connection and try again.'; }
    },
    otherEmail() { ui.authStep = 'signin'; ui.emailErr = ''; ui.resent = false; }
  };

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
    } else if (f === 'signin') {
      if (!/^\S+@\S+\.\S+$/.test(ui.email.trim())) { ui.emailErr = 'Enter a valid email address.'; render(); return; }
      ui.email = ui.email.trim();
      ui.sending = true; render();
      try { await Store.sendLink(ui.email); ui.authStep = 'sent'; ui.emailErr = ''; ui.resent = false; }
      catch (err) { ui.emailErr = 'Could not send the link. Check your connection and try again.'; }
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
      case 'goal': { const n = parseInt(v, 10); if (n > 0) Store.update(s => { s.goals[i] = n; }); break; }
    }
  });
  // Re-render after sliders and goals settle (updates the banner, chip and progress bars).
  root.addEventListener('change', e => {
    const k = e.target.dataset.in;
    if (k === 'r' || k === 'goal') render();
  });

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
