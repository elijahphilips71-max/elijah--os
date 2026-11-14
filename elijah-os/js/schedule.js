// Elijah OS — the data you are most likely to edit.
// Change the weekly schedule, session cards, exam date, subjects or benchmarks here, save, and reload the app.
// (Claude Code can edit this file for you: "add Nordic curls to the lower-body session", "add Circle theorems to Maths".)

window.ELIJAH_DATA = {
  name: 'Elijah',

  // First exam: year, month (1-12), day
  firstExam: { year: 2027, month: 5, day: 10, label: '10 May 2027' },

  // Side hustles: starting projects. After the first load they live in the app (Side hustles screen),
  // where you can rename, pause, add or remove them. The `hustle` slots in the week use the main project.
  sideHustles: [
    { id: 'shorts', name: 'YouTube Shorts', about: 'Reddit stories with AI voiceovers', perWeek: 3, ideasLabel: 'Story ideas',
      steps: ['Pick a story', 'Trim the script, write the hook', 'AI voiceover', 'Background gameplay + captions', 'Title, hashtags, upload'] }
  ],

  // Saturday past papers rotate through these subjects, one per week (positions in `subjects`).
  // You can always switch subject on the card. paperMins = default time allowed.
  paperRotation: [0, 1, 3, 2, 4],
  paperMins: { 0: 90, 1: 105, 2: 105, 3: 105, 4: 75 },

  // Every day: these session cards are added to each day (same format as `sessions` in a day row).
  daily: [['ao1-reps', '07:45'], ['evening', '21:15']],

  // One row per day, Monday first.
  // load is 'High', 'Medium-High', 'Medium' or 'Low'.
  // sessions lists the session cards for that day: [id, start time] (ids from `sessions` below).
  // Leave the time out (just the id) for an all-day item. Times feed the calendar (calendar.ics).
  schedule: [
    { day: 'Mon', title: 'Recovery + upper body', load: 'Medium',
      time: 'After school · Maths 75 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Upper body with 2 reps in reserve, then 75 minutes of Maths. Review Sunday’s match.',
      sessions: [['upper-cali', '16:15'], ['rev-maths', '17:30'], ['match-review', '19:00'], ['wall', '19:10']] },
    { day: 'Tue', title: 'Astro skills + lower body', load: 'Medium',
      time: '15:45 · Physics 75 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Skill sequences at 75% pace, light legs, then 75 minutes of Physics.',
      sessions: [['astro-skill', '15:45'], ['lower-body', '17:00'], ['rev-physics', '18:00'], ['wall', '19:20'], ['hustle', '20:00']] },
    { day: 'Wed', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Pick one cue and bring it to academy.',
      sessions: [['wall', '15:45'], ['rev-lang', '16:30'], ['cue', '17:50'], ['academy', '18:15']] },
    { day: 'Thu', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Second academy night. One cue, quality over volume.',
      sessions: [['wall', '15:45'], ['rev-eng-bio', '16:30'], ['cue', '17:50'], ['academy', '18:15']] },
    { day: 'Fri', title: 'Astro speed + match reps', load: 'Medium-High',
      time: '15:45–16:30 · revision 60 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Short, sharp speed reps. Stop after 2 slow reps.',
      sessions: [['astro-speed', '15:45'], ['rev-chem-maths', '17:30'], ['hustle', '18:45'], ['wall', '19:30']] },
    { day: 'Sat', title: 'Past paper + rest', load: 'Low',
      time: 'Morning · 2–3 hr paper', sub: 'Rest in the afternoon',
      mission: 'Timed past paper, mark it properly, then rest.',
      sessions: [['past-paper', '09:00'], ['wall', '13:00'], ['recovery', '15:00'], ['visualise', '20:00']] },
    { day: 'Sun', title: 'Match day', load: 'High',
      time: 'Match day · no revision', sub: '',
      mission: 'Match day. Play simple, play fast.',
      sessions: ['match', ['wall', '17:00'], ['hustle', '18:00']] }
  ],

  // Session cards. Each one shows on Today and Week for the days that list it.
  //   kind: 'gym' | 'football' | 'recovery' | 'revision' | 'paper' | 'mental' | 'routine' | 'hustle'
  //   items: one row each. sets = how many ticks the row has (leave it out for a single tick).
  //   fixed: true = the planner never moves or drops it (academy, match).
  //   onClash: 'skip' = if an event clashes, skip it instead of moving it (clashNote says why).
  //   remind: minutes before the start to remind you (default 10). Optional cards have no reminder.
  //   ladder: [AO1, AO2, AO3] = how many exam questions of each kind the card gives you, from js/questions.js
  //     (weak topics and questions you got wrong come first). `mixed: true` draws from every subject.
  //     `only: { subject: [topics] }` limits a subject to some of its topics (e.g. just the Chemistry ones).
  //   keep: true = never dropped, even on a game day; if something clashes it moves (wall session).
  //   For kind 'revision', `subject` is the subject's position in `subjects` (0 = first),
  //   or `subjects: [a, b]` to alternate between two subjects week by week.
  //   The card adds your `topics` weakest topics from that subject automatically,
  //   and finishing it adds its minutes to that subject on the Revision screen.
  sessions: {
    'ao1-reps': {
      kind: 'revision', mixed: true, ladder: [8, 0, 0], title: 'AO1 reps', minutes: 15, remind: 0,
      focus: 'Quick 1–3 mark questions across your subjects. Answer, check the mark scheme, mark yourself honestly.'
    },
    'evening': {
      kind: 'routine', title: 'Evening wind-down', minutes: 105, remind: 0,
      focus: 'All work finished by 21:15. In bed before 23:00.',
      items: [
        { name: 'All work finished', reps: '21:15' },
        { name: 'Wind-down', reps: '21:30' },
        { name: 'Shower' },
        { name: 'Journal' },
        { name: 'Reading' },
        { name: 'Bed before 23:00' }
      ]
    },
    'upper-cali': {
      kind: 'gym', title: 'Upper-body calisthenics', minutes: 40,
      focus: 'Stop 2 reps short on every set. Quality over fatigue.',
      items: [
        { name: 'Warm-up: wrist circles, shoulder dislocates, scap pull-ups', reps: '5 min' },
        { name: 'Chest-to-wall handstand', sets: 5, reps: '15–20s' },
        { name: 'Pull-ups', sets: 3, reps: '~8–10, stop 2 short' },
        { name: 'Dips, elbows to ~90°', sets: 3, reps: 'stop 2 short' },
        { name: 'Inverted rows', sets: 3, reps: '10–12' },
        { name: 'Hollow hold', sets: 4, reps: '10–15s' },
        { name: 'Tuck L-sit on dip bars', sets: 3, reps: '10s' },
        { name: 'Mobility: hips, hamstrings, groin', reps: '10 min' }
      ]
    },
    'match-review': {
      kind: 'mental', title: 'Match review', minutes: 5,
      focus: 'Five minutes on the last match.',
      items: [{ name: '3 good actions' }, { name: '1 repeated problem' }]
    },
    'astro-skill': {
      kind: 'football', title: 'Astro: skill sequences', minutes: 35,
      focus: 'About 75% pace. Half speed first, then full speed.',
      items: [
        { name: 'Warm-up: jog, dynamic stretches, 3 build-ups', reps: '8 min' },
        { name: 'Check away, receive on half-turn, drive, shoot', sets: 4, reps: '5 reps', rest: 'half then full speed' },
        { name: 'Weak foot: first touch and finishing', reps: '10 min' }
      ]
    },
    'lower-body': {
      kind: 'gym', title: 'Lower body at home (light)', minutes: 30,
      focus: 'Light. Stop 2–3 reps short on every set.',
      items: [
        { name: 'Split squats', sets: 2, reps: '8 each leg' },
        { name: 'Single-leg RDL', sets: 2, reps: '8 each leg' },
        { name: 'Single-leg glute bridge', sets: 2, reps: '12' },
        { name: 'Nordic curl negatives', sets: 2, reps: '3–5' },
        { name: 'Skill snack: tuck L-sit holds', reps: '10 min' }
      ]
    },
    'cue': {
      kind: 'mental', title: 'Pick one cue', minutes: 2, onClash: 'skip', clashNote: 'Pick your cue before the event instead',
      focus: 'One thing to focus on tonight, e.g. "scan before receiving".',
      items: [{ name: 'Choose today’s cue before you leave' }, { name: 'After training: did you do it?' }]
    },
    'astro-speed': {
      kind: 'football', title: 'Astro: speed + match reps', minutes: 45,
      focus: 'Full recovery between sprints. Stop after 2 slow reps.',
      items: [
        { name: 'Warm-up: A-skips, strides', reps: '10 min' },
        { name: '10m sprints', sets: 3, reps: '1', rest: 'full recovery' },
        { name: '20m sprints', sets: 2, reps: '1', rest: 'full recovery' },
        { name: 'Runs in behind', reps: '6–8 reps' },
        { name: 'Near-post darts', reps: '6–8 reps' },
        { name: '1v1 into shot', reps: '6–8 reps' },
        { name: 'Finishing, at least half weak foot', reps: '10 min' },
        { name: 'Skill snack: handstand kick-ups', reps: '10 min' }
      ]
    },
    'wall': {
      kind: 'football', keep: true, title: 'Wall session', minutes: 30,
      focus: 'Non-negotiable, every day. Reps over perfection. Second half weak foot only.',
      items: [
        { name: 'Two-touch passing, both feet', reps: '8 min' },
        { name: 'One-touch passing', reps: '7 min' },
        { name: 'Receiving across body and turning', reps: '7 min' },
        { name: 'Weak foot only', reps: '8 min' }
      ]
    },
    'hustle': {
      kind: 'hustle', title: 'Side hustle', minutes: 30,
      focus: 'Thirty focused minutes on your main side hustle.',
      items: []   // the steps come from the project (Side hustles screen)
    },
    'visualise': {
      kind: 'mental', title: 'Visualisation', minutes: 5,
      focus: 'Five minutes in the evening. See it clearly, at match speed.',
      items: [{ name: 'Picture your first touch' }, { name: 'Picture the finish' }]
    },
    'rev-chem-maths': {
      kind: 'revision', subjects: [3, 0], title: 'Chemistry / Maths revision', minutes: 60, ladder: [5, 3, 1],
      only: { 3: ['Bonding and structure', 'Quantitative chemistry', 'Rates of reaction', 'Organic chemistry'] },
      focus: 'Chemistry, with Maths questions on alternate weeks. AO1 reps, AO2 main chunk, one AO3.'
    },
    'academy': {
      kind: 'football', fixed: true, title: 'Academy training', minutes: 90, remind: 30,
      focus: 'Full focus. Win your first action.',
      items: [
        { name: 'Eat a snack and drink water by 16:30' },
        { name: 'Pack boots, shin pads, bottle' },
        { name: 'Training' },
        { name: 'Stretch and refuel after' }
      ]
    },
    'match': {
      kind: 'football', fixed: true, title: 'Match day', minutes: 90,
      focus: 'Play simple, play fast.',
      items: [
        { name: 'Breakfast 3 hours before kick-off' },
        { name: 'Bag packed the night before' },
        { name: 'Warm-up' },
        { name: 'Match' },
        { name: 'Refuel and stretch within an hour' }
      ]
    },
    'recovery': {
      kind: 'recovery', optional: true, title: 'Rest, or 20 min mobility', minutes: 20,
      focus: 'Rest is fine. If you move, keep it easy.',
      items: [
        { name: 'Foam roll: calves, quads, glutes', reps: '6 min' },
        { name: 'Hip flexor stretch', sets: 2, reps: '45s each side' },
        { name: 'Hamstring stretch', sets: 2, reps: '45s each side' },
        { name: 'Ankle mobility', sets: 2, reps: '10 each side' }
      ]
    },
    'rev-maths': {
      kind: 'revision', subject: 0, title: 'Maths revision', minutes: 75, ladder: [6, 5, 2],
      onClash: 'skip', clashNote: 'Maths stays at its time; dropped today because of a clash',
      focus: 'AO1 reps to warm up, AO2 as the main chunk, then the heavy AO3 questions.'
    },
    'rev-physics': {
      kind: 'revision', subject: 1, title: 'Physics revision', minutes: 75, ladder: [6, 5, 2],
      focus: 'AO1 reps to warm up, AO2 as the main chunk, then the heavy AO3 questions.'
    },
    'rev-lang': {
      kind: 'revision', subject: 4, title: 'Spanish + PE revision', minutes: 45, ladder: [5, 3, 1],
      focus: 'Exam questions: say Spanish answers out loud, then write them.'
    },
    'rev-eng-bio': {
      kind: 'revision', subjects: [2, 3], title: 'English / Biology revision', minutes: 45, ladder: [4, 3, 1],
      only: { 3: ['Cells', 'Infection and response', 'Homeostasis', 'Inheritance and evolution'] },
      focus: 'English and Biology swap each week. AO1 reps, AO2 main chunk, one AO3.'
    },
    'past-paper': {
      kind: 'paper', title: 'Timed past paper', minutes: 150,
      focus: '2–3 hours, exam conditions: timer on, phone away, no notes.',
      items: [
        { name: 'Pick the paper and set the timer' },
        { name: 'Sit the paper' },
        { name: 'Mark it against the mark scheme' }
      ],
      logPaper: true   // the card runs the paper as a mock exam: set up (link, timer), sit it, then log the marks
    }
  },

  // Revision subjects in priority order. goal = default weekly minutes (you can also edit goals in the app).
  // topics = the starting topic list. You can add, remove and rate topics in the app too.
  subjects: [
    { name: 'Maths', board: 'AQA', goal: 75, topics: [
      'Algebra: quadratics', 'Simultaneous equations', 'Trigonometry', 'Vectors',
      'Probability', 'Circle theorems', 'Graphs and gradients', 'Ratio and proportion'] },
    { name: 'Physics', board: 'AQA', goal: 75, topics: [
      'Forces and motion', 'Energy', 'Electricity', 'Waves',
      'Magnetism', 'Atomic structure', 'Particle model', 'Space'] },
    { name: 'English', board: 'WJEC Eduqas', goal: 45, topics: [
      'Shakespeare play', '19th-century novel', 'Modern text', 'Poetry anthology',
      'Unseen poetry', 'Language Paper 1', 'Language Paper 2'] },
    { name: 'Biology / Chemistry', board: 'AQA', goal: 45, topics: [
      'Cells', 'Infection and response', 'Homeostasis', 'Inheritance and evolution',
      'Bonding and structure', 'Quantitative chemistry', 'Rates of reaction', 'Organic chemistry'] },
    { name: 'Spanish / PE', board: 'Pearson Edexcel (Spanish) · AQA (PE)', goal: 45, topics: [
      'Spanish: past tenses', 'Spanish: school and future plans', 'Spanish: speaking photo cards',
      'PE: anatomy and physiology', 'PE: training principles', 'PE: sport psychology'] },
    { name: 'BTEC DIT', board: 'Pearson BTEC', goal: 30, note: 'Coursework deadlines only, small weekly chunks.', topics: [
      'Next coursework deadline'] }
  ],

  // Starting rows for the Benchmarks table. Retest every `retestWeeks` weeks.
  retestWeeks: 4,
  benchmarks: [
    { name: 'Pull-ups', base: '12' },
    { name: 'Hollow hold', base: 'not yet', target: '20s' },
    { name: 'Handstand hold', base: '10–20s' },
    { name: 'Max dips' },
    { name: '10m sprint' },
    { name: '20m sprint' },
    { name: 'Wall passes / 60s (L)' },
    { name: 'Wall passes / 60s (R)' },
    { name: 'Weak-foot finishes / 10' },
    { name: 'Maths past-paper score' }
  ],

  // Skill of the month: progressions, easiest first. Tap a step in the app to mark where you are.
  skills: [
    { name: 'Wall handstand', steps: ['Wall plank', 'Chest-to-wall', 'Kick-up', 'Free hold'] },
    { name: 'Core', steps: ['Hollow hold', 'Tuck L-sit', 'L-sit'] }
  ],
  skillNext: 'Next: muscle-up path (months 2–3)',

  // Extra exercises per weekday (0 = Monday ... 6 = Sunday), editable in the app under "Extras".
  defaultWorkouts: {}
};
