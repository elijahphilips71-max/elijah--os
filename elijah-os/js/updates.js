// Elijah OS — updates and notices.
// Newest first. Each one shows once on the Today screen until you press "Got it",
// and stays in the "What's new" list on the Log screen.
//   kind:  'update' (something changed in the app) or 'notice' (a reminder, plan change, focus for the week)
//   from:  optional first date to show it (YYYY-MM-DD)
//   until: optional last date to show it on Today (YYYY-MM-DD)
//   id:    must be unique; a new id means it shows again as unread.
// Claude Code adds to this list whenever the plan changes in conversation, then bumps VERSION in sw.js.

window.ELIJAH_UPDATES = [
  {
    id: '2026-11-14-calendar', date: '2026-11-14', kind: 'update',
    title: 'Events, day buttons and calendar',
    body: 'Use the arrows to move between days and weeks. Tap "Add event" for anything unplanned, like an after-school game; it can replace that day’s sessions. On Week, subscribe to your plan in your phone’s calendar.'
  },
  {
    id: '2026-11-14-menu', date: '2026-11-14', kind: 'update',
    title: 'Menu',
    body: 'Tap the three lines at the top left to jump to any screen, today’s session cards, What’s new or your revision topics.'
  },
  {
    id: '2026-11-14-topics', date: '2026-11-14', kind: 'notice',
    title: 'Rate your revision topics',
    body: 'Open Revision, tap Topics under each subject and rate each one red, amber or green. Red topics come up first in your revision cards.',
    until: '2026-11-30'
  },
  {
    id: '2026-11-14-cards', date: '2026-11-14', kind: 'update',
    title: 'Session cards',
    body: 'Every workout, pitch session and revision block now has its own card on Today and Week. Tap a row to tick a set. Finishing a revision card adds its minutes to that subject.'
  }
];
