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
    id: '2026-11-23-lower-a', date: '2026-11-23', kind: 'update',
    title: 'Lower body twice a week',
    body: 'Monday now has lower-body strength at 18:15: rear-foot elevated split squats, single-leg RDLs, Nordics, Copenhagen planks and calf raises. Tuesday’s lower-body session is now the light, springy one (plyos, glute bridges, lateral lunges), so your legs are fresh for academy.'
  },
  {
    id: '2026-11-21-moves-library', date: '2026-11-21', kind: 'update',
    title: 'Moves library',
    body: 'Every move in your sessions now has step-by-step instructions, a key tip and the common mistake, in its own Moves library (menu → Moves library). Cards just show one link, “How to do these moves”, that opens the moves for that card.'
  },
  {
    id: '2026-11-21-better-moves', date: '2026-11-21', kind: 'update',
    title: 'Better ball mastery moves',
    body: 'New moves: the Matthews feint and roll-cut on Monday, pull-pushes and outside cuts on Saturday. Sole rolls stay. Tap “What the moves mean” on a card to see how to do them.'
  },
  {
    id: '2026-11-21-tech-upgrade', date: '2026-11-21', kind: 'update',
    title: 'Proper technical drills',
    body: 'Wall sessions now name real moves with coaching cues and level-ups: an 8-move ball mastery circuit, half-turn and directional first touches, aerial control, step-overs, Cruyff turns, Ronaldo chops, elasticos and roulettes, and levelled juggling. Open a card and tap “What the moves mean” for how to do each one.'
  },
  {
    id: '2026-11-21-warmups', date: '2026-11-21', kind: 'update',
    title: 'Warm-ups before every session',
    body: 'Upper body, lower body, wall and recovery sessions now start with a 5-minute warm-up: 3 minutes on the skipping rope or bike, then 2 minutes of dynamic moves for that session. Astro sessions already had their own.'
  },
  {
    id: '2026-11-21-link-fix', date: '2026-11-21', kind: 'notice',
    title: 'Link fixed',
    body: 'Elijah OS lives at elijahphilips71-max.github.io/elijah--os/elijah-os/ and the shorter …/elijah--os/ now redirects there, so both always work. It also opens properly offline now.'
  },
  {
    id: '2026-11-21-upper-b', date: '2026-11-21', kind: 'update',
    title: 'Upper body twice a week',
    body: 'A second calisthenics session on Saturday at 16:00, with a push and skill focus (handstands, pike push-ups, chin-ups, archer push-ups, rows, core) to go with Monday’s pull and dip session. Upper body only, so your legs stay fresh for Sunday.'
  },
  {
    id: '2026-11-21-wall-tech', date: '2026-11-21', kind: 'update',
    title: 'Wall sessions with technical drills',
    body: 'Still 30 minutes, but each day now mixes wall passing with a different technical focus: ball mastery (Mon), first touch (Tue), dribbling at speed (Fri), juggling and close control (Sat) and a light touch session on match day (Sun). Every one ends with weak-foot wall passes.'
  },
  {
    id: '2026-11-20-solo-astro', date: '2026-11-20', kind: 'update',
    title: 'Astro sessions you can do alone',
    body: 'Every astro drill now works solo with just balls and cones: you feed yourself instead of a passer or crosser, and a cone stands in for a defender. Bring 3 or more balls and 4–6 cones.'
  },
  {
    id: '2026-11-19-wall', date: '2026-11-19', kind: 'update',
    title: 'No wall sessions on academy nights',
    body: 'The wall session is off on Wednesdays and Thursdays, so your legs are fresh for academy training. It stays on the other five days.'
  },
  {
    id: '2026-11-17-drag', date: '2026-11-17', kind: 'update',
    title: 'Drag sessions around',
    body: 'Hold the dots on the left of a session card and drag it up or down to change when you do it; the start time follows. Drop it on a day in the day strip to move it to that day. Or open a card and tap “Change time or day”. Moves only change that one day, and “Undo move” puts it back.'
  },
  {
    id: '2026-11-17-guide', date: '2026-11-17', kind: 'update',
    title: '40-minute revision-guide sessions',
    body: 'Revision blocks are now 40 minutes with your revision guide, pen and paper: recall 5 min, check the guide 5, written exam questions (explain, describe) 20, mark and correct 7, rate the topic 3. Each step has a timer. The app picks your weakest topic and rotates them; change it if you like. The app’s own questions are now your morning AO1 reps.'
  },
  {
    id: '2026-11-17-plyo', date: '2026-11-17', kind: 'update',
    title: 'Plyometrics',
    body: 'Tuesday lower body starts with low, springy plyos (pogo hops, lateral bounds). Friday speed adds broad jumps and single-leg bounds before the sprints. They drop off automatically if your leg freshness is 2 or lower, or you have a game the next day.'
  },
  {
    id: '2026-11-15-incomplete', date: '2026-11-15', kind: 'notice',
    title: 'Unfinished sessions now cost you',
    body: 'You can submit a session before it’s finished, but it’s logged as incomplete with its %, unanswered questions score 0 (and come back as missed), and revision only counts the minutes you did. Sessions not submitted by the end of the day count as missed. See your completion score on the Log screen.'
  },
  {
    id: '2026-11-14-weak-topics', date: '2026-11-14', kind: 'update',
    title: '70 new questions on your weak spots',
    body: 'New questions on the topics you scored 0% on: the electromagnetic spectrum, fiction reading, alkenes, alcohols and carboxylic acids, and physical training. There are also Maths questions on every topic you lost marks on in the June 2023 Paper 1. Most are AO2 (apply it), with some quick AO1 markers and a few AO3 heavy questions.'
  },
  {
    id: '2026-11-14-grade9', date: '2026-11-14', kind: 'update',
    title: 'Aiming for 9s',
    body: 'Maths and science questions now have grades, from 2 up to 9, with lots of new grade 6–9 questions. You start on grade 5–7 questions. Score 75% or more and you move up a level; struggle and it eases off one. Your level shows on each revision card and on the Revision screen.'
  },
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
