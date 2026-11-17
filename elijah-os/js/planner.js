// Elijah OS — the planner.
// Works out one day's actual plan from the weekly schedule plus any temporary events:
//   • sessions that clash with an event (including travel / warm-up / cool-down time) move to a free slot that day,
//   • on a game or training day, extra pitch, gym and mobility sessions are dropped to protect your legs,
//   • revision that can't fit is shortened, or carried to the next day,
//   • sessions that can't move (academy, match, the evening wind-down) are never touched; a clash with one is flagged.
// Everything here is calculated: nothing is saved, so deleting an event puts the plan back exactly as it was.

(function (g) {
  const Cal = g.ElijahCal;
  const toMin = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const toHM = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');

  const WINDOW = { weekday: ['15:45', '21:15'], weekend: ['08:00', '21:15'] };
  // Time kept clear around an event, in minutes: [before, after]
  const BUFFER = { game: [60, 45], training: [45, 30], plans: [15, 15], other: [15, 15] };
  const PHYSICAL_EVENT = { game: 'game day', training: 'extra training today' };
  const isPhysical = c => c.kind === 'gym' || c.kind === 'football' || c.kind === 'recovery';
  const PRIORITY = { revision: 0, paper: 0, mental: 1, gym: 2, football: 2, hustle: 3, recovery: 4 };

  function weekdayOf(date) { return (new Date(date + 'T12:00').getDay() + 6) % 7; }
  function dayName(date) { return new Date(date + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short' }); }

  // date: 'YYYY-MM-DD'; eventsOn(date) -> that date's events.
  // Returns { items, changes, warnings, carryOut }
  //   item: { key, id, at, min, orig, status: 'ok'|'moved'|'shortened'|'in'|'skipped'|'out', note }
  //   Cards to show are the ones with status ok / moved / shortened / in.
  // opts.hide(id): sessions to leave out entirely (e.g. side-hustle slots with no active project).
  function planDay(DATA, date, eventsOn, noCarryIn, opts) {
    opts = opts || {};
    const wd = weekdayOf(date), events = eventsOn(date);
    const win = (wd < 5 ? WINDOW.weekday : WINDOW.weekend).map(toMin);
    let items = Cal.refs(DATA.schedule[wd], DATA.daily).filter(r => DATA.sessions[r.id] && !(opts.hide && opts.hide(r.id))).map(r => {
      const c = DATA.sessions[r.id];
      return { key: r.id, id: r.id, at: r.at, orig: r.at, min: c.minutes || 30, status: 'ok', note: '' };
    });
    // Your own moves (drag and drop): sessions moved to another day, and new start times for this day.
    // Moved sessions are pinned: the planner never moves or drops them, it only warns about clashes.
    const mv = opts.moves ? opts.moves(date) : null;
    if (mv) {
      items = items.filter(it => !mv.out.includes(it.key));
      mv.in.forEach(x => { if (DATA.sessions[x.id]) items.push({ key: x.key, id: x.id, at: x.at, orig: x.at, min: DATA.sessions[x.id].minutes || 30, status: 'ok', note: 'Moved here from ' + dayName(x.from), pinned: true }); });
      items.forEach(it => { const t = mv.times[it.key]; if (t && t !== it.at) { it.note = 'Moved by you · was ' + (it.at || 'no set time'); it.at = t; it.pinned = true; } });
    }
    const changes = [], warnings = [];

    // "Clear the whole day" events: skip everything except the daily routine cards.
    const clear = events.find(e => e.replace);
    if (clear) {
      const daily = new Set((DATA.daily || []).map(r => Array.isArray(r) ? r[0] : r));
      items.forEach(it => { if (!daily.has(it.id)) { it.status = 'skipped'; it.note = 'Plan cleared for ' + clear.title; } });
      changes.push('Plan cleared for ' + clear.title + '.');
      return { items, changes, warnings, carryOut: [] };
    }

    // Busy time from events.
    const busy = events.map(e => {
      const b = BUFFER[e.kind] || BUFFER.other;
      if (!e.start) return { s: win[0], e: win[1], title: e.title };
      const s = toMin(e.start), en = e.end && e.end > e.start ? toMin(e.end) : s + 90;
      return { s: s - b[0], e: en + b[1], title: e.title, real: [s, en] };
    });
    // Sessions you placed yourself also block time, so other flexible sessions move around them.
    items.forEach(it => { if (it.pinned && it.at && it.status === 'ok') busy.push({ s: toMin(it.at), e: toMin(it.at) + it.min, title: DATA.sessions[it.id].title, key: it.key }); });
    const phys = events.find(e => PHYSICAL_EVENT[e.kind]);
    const overlaps = (a, b) => a.s < b.e && b.s < a.e;
    const span = it => ({ s: toMin(it.at), e: toMin(it.at) + it.min });

    // 1. Game / training day: drop extra physical sessions.
    items.forEach(it => {
      const c = DATA.sessions[it.id];
      if (phys && isPhysical(c) && !c.fixed && !c.keep && !it.pinned) {
        it.status = 'skipped'; it.note = 'No extra training on a ' + PHYSICAL_EVENT[phys.kind];
        if (!c.optional) changes.push(c.title + ' skipped (' + PHYSICAL_EVENT[phys.kind] + ').');
      }
    });

    // 2. Find clashes. Fixed things stay and get a warning; the rest need a new time.
    const movers = [];
    items.forEach(it => {
      if (it.status !== 'ok' || !it.at) return;
      const c = DATA.sessions[it.id], sp = span(it);
      const hit = busy.find(b => b.key !== it.key && overlaps(sp, b));
      if (!hit) return;
      const fixed = c.fixed || it.pinned || c.kind === 'routine' || toMin(it.at) < win[0];
      if (fixed) {
        if (hit.key) { warnings.push(hit.title + ' (moved by you) overlaps ' + c.title + '.'); return; }
        if (it.pinned) { if (hit.real && overlaps(sp, { s: hit.real[0], e: hit.real[1] })) warnings.push('You moved ' + c.title + ' into ' + hit.title + '.'); return; }
        if (hit.real && overlaps(sp, { s: hit.real[0], e: hit.real[1] })) warnings.push(hit.title + ' clashes with ' + c.title + '. You can’t do both; let your coach know.');
        else if (c.fixed) warnings.push(c.title + ' is close to ' + hit.title + '. Tight on time, and a heavy day for your legs.');
        return;
      }
      if (c.onClash === 'skip') {
        it.status = 'skipped'; it.note = c.clashNote || 'Clashes with ' + hit.title;
        if (c.kind !== 'mental') changes.push(c.title + ' dropped for today (clashes with ' + hit.title + ').');
        return;
      }
      movers.push(it);
    });
    if (phys) {
      const fixedPhys = items.find(it => it.status === 'ok' && DATA.sessions[it.id].fixed && isPhysical(DATA.sessions[it.id]) && !DATA.sessions[it.id].keep);
      if (fixedPhys && !warnings.some(w => w.includes(DATA.sessions[fixedPhys.id].title))) warnings.push(phys.title + ' and ' + DATA.sessions[fixedPhys.id].title + ' on the same day: a big load. Keep everything else light.');
    }

    // Time already taken: events plus everything that is staying where it is.
    const taken = busy.slice();
    items.forEach(it => { if (it.status === 'ok' && it.at && !movers.includes(it)) taken.push(span(it)); });

    function findSlot(len, pref) {
      const free = t => t >= win[0] && t + len <= win[1] && !taken.some(b => overlaps({ s: t, e: t + len }, b));
      const start = Math.ceil(win[0] / 15) * 15, cands = [];
      for (let t = start; t + len <= win[1]; t += 15) if (free(t)) cands.push(t);
      if (!cands.length) return null;
      // Nearest free time to the original; on a tie, the later one.
      return cands.reduce((best, t) => Math.abs(t - pref) <= Math.abs(best - pref) ? t : best);
    }
    function place(it, prefMin, label) {
      const c = DATA.sessions[it.id];
      let t = findSlot(it.min, prefMin);
      if (t != null) {
        it.at = toHM(t); taken.push(span(it));
        return { ok: true, text: c.title + ' ' + label + ' ' + it.at + '.' };
      }
      // Revision can be shortened (to two thirds, 30 min at least) before giving up.
      if (c.kind === 'revision' && it.min > 30) {
        const short = Math.max(30, Math.round(it.min * 2 / 3 / 15) * 15);
        t = findSlot(short, prefMin);
        if (t != null) {
          it.min = short; it.at = toHM(t); it.status = 'shortened'; taken.push(span(it));
          return { ok: true, text: c.title + ' shortened to ' + short + ' min, ' + label + ' ' + it.at + '.' };
        }
      }
      return { ok: false };
    }

    // 3. Move clashing sessions, revision first.
    const carryOut = [];
    movers.sort((a, b) => (PRIORITY[DATA.sessions[a.id].kind] || 9) - (PRIORITY[DATA.sessions[b.id].kind] || 9));
    movers.forEach(it => {
      const c = DATA.sessions[it.id];
      it.status = 'moved'; it.note = 'Moved from ' + it.orig;
      const r = place(it, toMin(it.orig), 'moved from ' + it.orig + ' to');
      if (r.ok) { changes.push(r.text); if (it.status === 'shortened') it.note = 'Shortened · was ' + it.orig + ', ' + c.minutes + ' min'; return; }
      it.at = it.orig;
      if (c.keep) {
        it.status = 'moved'; it.note = 'No free slot: fit it in when you can';
        warnings.push('No free 30 minutes for the ' + c.title.toLowerCase() + '. It still counts: squeeze it in.');
        return;
      }
      if (c.kind === 'revision' || c.kind === 'paper') {
        it.status = 'out'; it.note = 'Moved to tomorrow';
        carryOut.push(it.id); changes.push(c.title + ' moved to tomorrow (no time today).');
      } else {
        it.status = 'skipped'; it.note = 'No time today';
        if (!c.optional) changes.push(c.title + ' skipped (no time today).');
      }
    });

    // 4. Revision carried over from yesterday.
    if (!noCarryIn) {
      const prev = Cal.addDays(date, -1);
      const before = planDay(DATA, prev, eventsOn, true, opts);
      before.carryOut.forEach(id => {
        const c = DATA.sessions[id];
        const it = { key: id + '@carry', id, at: '', orig: '', min: c.minutes || 30, status: 'in', note: 'From ' + dayName(prev) };
        if (phys && isPhysical(c)) return;
        const r = place(it, win[0], 'from ' + dayName(prev) + ' at');
        if (r.ok) { if (it.status === 'shortened') it.status = 'in'; it.note = 'From ' + dayName(prev) + (it.min < c.minutes ? ' · ' + it.min + ' min' : ''); items.push(it); changes.push(r.text); }
        else changes.push(c.title + ' from ' + dayName(prev) + ' didn’t fit today either; it’s skipped this week.');
      });
    }

    items.sort((a, b) => (a.at || '00').localeCompare(b.at || '00'));
    return { items, changes, warnings, carryOut };
  }

  g.ElijahPlanner = { planDay, shown: it => ['ok', 'moved', 'shortened', 'in'].includes(it.status) };
})(typeof window !== 'undefined' ? window : globalThis);
