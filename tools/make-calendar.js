// Writes elijah-os/calendar.ics from the weekly plan in elijah-os/js/schedule.js.
// Run after changing the schedule:  node tools/make-calendar.js
// The deploy workflow also runs it, so the published feed always matches the schedule.
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, '..', 'elijah-os');
const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'js/schedule.js'), 'utf8'), ctx);
vm.runInContext(fs.readFileSync(path.join(dir, 'js/cal.js'), 'utf8'), ctx);
// Fixed anchor Monday and stamp, so the file only changes when the schedule does.
const ics = ctx.window.ElijahCal.weeklyFeed(ctx.window.ELIJAH_DATA, '2026-11-09', '20261109T000000Z');
fs.writeFileSync(path.join(dir, 'calendar.ics'), ics);
console.log('Wrote elijah-os/calendar.ics (' + (ics.match(/BEGIN:VEVENT/g) || []).length + ' weekly events)');
