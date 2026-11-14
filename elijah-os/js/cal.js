// Elijah OS — calendar (.ics) helpers.
// Used by the app (Add to calendar, Download week) and by tools/make-calendar.js,
// which writes calendar.ics: the weekly plan as a feed calendar apps can subscribe to.
// Times are "floating" (no time zone), so they show at the same clock time wherever you are.

(function (g) {
  const pad = n => String(n).padStart(2, '0');
  const text = s => String(s || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');
  const ymd = iso => iso.replace(/-/g, '');
  const hms = hm => hm.replace(':', '') + '00';

  // Fold long lines at 74 characters, as the format asks.
  function fold(line) {
    const chars = Array.from(line), out = [];
    for (let i = 0; i < chars.length; i += i ? 73 : 74) out.push((i ? ' ' : '') + chars.slice(i, i + (i ? 73 : 74)).join(''));
    return out.join('\r\n');
  }
  function addMin(hm, m) {
    const [h, mm] = hm.split(':').map(Number), t = h * 60 + mm + m;
    return pad(Math.floor(t / 60) % 24) + ':' + pad(t % 60);
  }
  function addDays(iso, n) {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function stampNow() { return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); }

  // e: { uid, title, date: 'YYYY-MM-DD', start?: 'HH:MM', end?: 'HH:MM', desc?, rrule? }
  function vevent(e, stamp) {
    const L = ['BEGIN:VEVENT', 'UID:' + e.uid, 'DTSTAMP:' + (stamp || stampNow())];
    if (e.start) {
      const end = e.end && e.end > e.start ? e.end : addMin(e.start, 60);
      L.push('DTSTART:' + ymd(e.date) + 'T' + hms(e.start), 'DTEND:' + ymd(e.date) + 'T' + hms(end));
    } else {
      L.push('DTSTART;VALUE=DATE:' + ymd(e.date), 'DTEND;VALUE=DATE:' + ymd(addDays(e.date, 1)));
    }
    if (e.rrule) L.push('RRULE:' + e.rrule);
    L.push('SUMMARY:' + text(e.title));
    if (e.desc) L.push('DESCRIPTION:' + text(e.desc));
    L.push('END:VEVENT');
    return L.map(fold).join('\r\n');
  }
  function calendar(events, name, stamp) {
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Elijah OS//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'X-WR-CALNAME:' + text(name || 'Elijah OS'), 'REFRESH-INTERVAL;VALUE=DURATION:PT6H', 'X-PUBLISHED-TTL:PT6H']
      .concat(events.map(e => vevent(e, stamp)), ['END:VCALENDAR']).join('\r\n') + '\r\n';
  }

  // A schedule day's sessions as [{ id, at }], whether written as 'id' or ['id', 'HH:MM'].
  function refs(day) {
    return (day.sessions || []).map(r => Array.isArray(r) ? { id: r[0], at: r[1] || '' } : { id: r, at: '' });
  }
  function describe(c) {
    return [c.focus].concat((c.items || []).map(x => '• ' + x.name +
      (x.sets ? ' — ' + x.sets + ' × ' + (x.reps || '') : x.reps ? ' — ' + x.reps : ''))).filter(Boolean).join('\n');
  }
  // One planned session as a calendar event on a given date.
  function planEvent(DATA, dayIdx, ref, date) {
    const c = DATA.sessions[ref.id];
    return { uid: 'plan-' + dayIdx + '-' + ref.id + '@elijah-os', title: c.title, date,
      start: ref.at, end: ref.at ? addMin(ref.at, c.minutes || 60) : '', desc: describe(c) };
  }
  // The whole weekly plan, repeating every week from the Monday `anchor`.
  function weeklyFeed(DATA, anchor, stamp) {
    const evs = [];
    DATA.schedule.forEach((day, i) => refs(day).forEach(r => {
      if (!DATA.sessions[r.id]) return;
      evs.push(Object.assign(planEvent(DATA, i, r, addDays(anchor, i)), { rrule: 'FREQ=WEEKLY' }));
    }));
    return calendar(evs, 'Elijah OS', stamp);
  }
  // Google Calendar "add event" link for one event.
  function googleLink(e) {
    const end = e.start ? (e.end && e.end > e.start ? e.end : addMin(e.start, 60)) : '';
    const dates = e.start ? ymd(e.date) + 'T' + hms(e.start) + '/' + ymd(e.date) + 'T' + hms(end) : ymd(e.date) + '/' + ymd(addDays(e.date, 1));
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(e.title) +
      '&dates=' + dates + (e.desc ? '&details=' + encodeURIComponent(e.desc) : '');
  }

  g.ElijahCal = { calendar, vevent, refs, planEvent, weeklyFeed, googleLink, addMin, addDays, describe };
})(typeof window !== 'undefined' ? window : globalThis);
