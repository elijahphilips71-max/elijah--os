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
    id: '2026-11-14-syllabus', date: '2026-11-14', kind: 'update',
    title: 'The whole syllabus',
    body: 'Every subject now lists its full GCSE syllabus as topics, grouped by section: AQA Maths, AQA triple Biology, Chemistry and Physics, AQA PE, Edexcel Spanish, BTEC DIT and your English texts and skills. Your ratings carried over. Rate the new ones red, amber or green so your questions focus on the right ones.'
  },
  {
    id: '2026-11-14-english', date: '2026-11-14', kind: 'update',
    title: 'English questions on your set texts',
    body: 'English topics are now Macbeth, Jekyll and Hyde and An Inspector Calls, with new quick-recall, paragraph and essay questions on each (Eduqas). Science is set to AQA triple, with 1h45 papers.'
  },
  {
    id: '2026-11-14-mock', date: '2026-11-14', kind: 'update',
    title: 'Past papers as real mock exams',
    body: 'Saturday’s paper rotates subject each week (Maths, Physics, Biology/Chemistry, English, Spanish/PE) and you can switch it. Paste the paper and mark scheme links, start the exam timer, then mark it. Add the paper’s grade boundaries to get its real grade. On Revision, past papers can be filtered by subject.'
  },
  {
    id: '2026-11-14-spaced', date: '2026-11-14', kind: 'update',
    title: 'Questions that adapt to you',
    body: 'One question at a time: type your answer, check it against the mark scheme, tap your marks. Questions you nail come back in 1, 2, 4 then 8 weeks; ones you miss come back tomorrow, so weak topics get the time. On Revision, “Send my progress to Claude” copies a report so Claude can write new questions for your weak spots.'
  },
  {
    id: '2026-11-14-exam-questions', date: '2026-11-14', kind: 'update',
    title: 'Exam questions instead of flashcards',
    body: 'Revision is now exam questions in a ladder: AO1 quick marks to warm up, AO2 as the main chunk, then heavy AO3 questions. Answer, check the mark scheme, give yourself the marks. Questions you get wrong come back first. Mornings are 15 minutes of AO1 reps. Plus a 30-minute wall session every day that never gets dropped.'
  },
  {
    id: '2026-11-14-hustles', date: '2026-11-14', kind: 'update',
    title: 'Side hustles, and Maths stays put',
    body: 'New Side hustles tab. YouTube Shorts is your first project: save story ideas, track 3 a week, and see your next slots. You can rename, pause or swap projects any time; the weekly slots always go to your main one. Monday Maths no longer moves: if something clashes, it is dropped for that day.'
  },
  {
    id: '2026-11-14-shorts', date: '2026-11-14', kind: 'update',
    title: 'YouTube Shorts',
    body: 'Three Shorts a week: Tuesday 19:45, Friday 18:45 and Sunday 18:00. Each card walks you through story, hook, AI voiceover, gameplay and captions, then upload, in about 30 minutes.'
  },
  {
    id: '2026-11-14-planner', date: '2026-11-14', kind: 'update',
    title: 'The plan now reorganises itself',
    body: 'Add an event and clashing sessions move to a free slot. On a game day, extra training is dropped. Revision is shortened or moved to tomorrow if there is no room. Clashes with academy or a match are flagged. Delete the event and the plan goes back to normal.'
  },
  {
    id: '2026-11-14-reminders', date: '2026-11-14', kind: 'update',
    title: 'Reminders',
    body: 'Turn on reminders from the menu (Reminders). The calendar feed now alerts you before every session too, even when the app is closed.'
  },
  {
    id: '2026-11-14-plan', date: '2026-11-14', kind: 'notice',
    title: 'Your real weekly plan is in',
    body: 'Every day follows your plan now, with flashcards and the evening wind-down (work done 21:15, bed before 23:00). English/Biology swap on Thursdays, Chemistry/Maths on Fridays. Optional wall sessions on Mon, Tue and Sat. Benchmarks and skill ladders (wall handstand, core) are on Progress; retest every 4 weeks.'
  },
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
