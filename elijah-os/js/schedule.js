// Elijah OS — the data you are most likely to edit.
// Change the weekly schedule, session cards, exam date, subjects or benchmarks here, save, and reload the app.
// (Claude Code can edit this file for you: "add calf raises to the lower-body session", "add Circle theorems to Maths".)

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

  // Revision-guide sessions (40 min): the steps for each style. {t} becomes today's topic.
  // style: maths (subject 0), english (2), spanish (Spanish topics), science (everything else).
  guideSteps: {
    science: [
      { name: 'Recall', mins: 5, detail: 'Book closed. Write everything you know about {t}: key words, equations, diagrams.' },
      { name: 'Check the guide', mins: 5, detail: 'Open your revision guide at {t}. Add what you missed in a different colour.' },
      { name: 'Written exam questions', mins: 20, detail: 'The guide’s exam-style questions on {t}: “explain”, “describe” and “compare”. Full sentences, one point per mark.' },
      { name: 'Mark and correct', mins: 7, detail: 'Mark with the answers in the back. Rewrite one answer so it would get full marks.' },
      { name: 'Rate the topic', mins: 3, detail: 'Red, amber or green, and write the one thing to fix next time.', rate: true }
    ],
    maths: [
      { name: 'Recall', mins: 5, detail: 'Book closed. Write the methods and formulas for {t}, with one example of each.' },
      { name: 'Check the guide', mins: 5, detail: 'Read the guide’s worked examples on {t}. Fix anything you got wrong.' },
      { name: 'Exam questions', mins: 20, detail: 'The guide’s practice questions on {t}, hardest ones too. Show full working; “show that” and “explain” answers in words.' },
      { name: 'Mark and correct', mins: 7, detail: 'Mark with the answers. Redo every wrong one from scratch.' },
      { name: 'Rate the topic', mins: 3, detail: 'Red, amber or green, and note the mistake you made most.', rate: true }
    ],
    english: [
      { name: 'Recall', mins: 5, detail: 'Book closed. Write 5 quotations or key points for {t}, and one piece of context.' },
      { name: 'Check the guide', mins: 5, detail: 'Check them in the guide. Add themes, techniques and context you missed.' },
      { name: 'Timed writing', mins: 20, detail: 'Answer an exam-style “how does the writer…” question on {t}: an introduction and two analytical paragraphs.' },
      { name: 'Mark and improve', mins: 7, detail: 'Compare with the guide’s model answer or mark scheme. Improve one paragraph.' },
      { name: 'Rate the topic', mins: 3, detail: 'Red, amber or green, and the one thing to fix next time.', rate: true }
    ],
    spanish: [
      { name: 'Recall', mins: 5, detail: 'Book closed. Write 15 words and phrases for {t}, in Spanish and English.' },
      { name: 'Check the guide', mins: 5, detail: 'Check the vocab and grammar pages for {t}. Add what you missed.' },
      { name: 'Writing and speaking', mins: 20, detail: 'Answer the guide’s questions on {t} in Spanish: say each answer out loud, then write it. Use three tenses and opinions with reasons.' },
      { name: 'Mark and correct', mins: 7, detail: 'Check against the answers. Correct verb endings and accents.' },
      { name: 'Rate the topic', mins: 3, detail: 'Red, amber or green, and the one thing to fix next time.', rate: true }
    ]
  },

  // The Moves library (menu → Moves). Each card links to the moves it names.
  //   name: as written on the cards (matched case-insensitively). also: other spellings to match.
  moves: [
    // Ball mastery
    { name: 'sole rolls', group: 'Ball mastery', steps: ['Stand over the ball, on your toes.', 'Put your sole on top and roll the ball sideways across your body.', 'Stop it with the sole of your other foot and roll it back.'], cue: 'Light touch: the ball stays under you.', mistake: 'Pressing down too hard so the ball sticks.' },
    { name: 'V-pulls', also: ['V-pull'], group: 'Ball mastery', steps: ['Put your sole on the ball and pull it back towards you.', 'As it rolls back, turn your foot and push it forward at an angle with the inside of the same foot.', 'That makes a V. Repeat, then swap feet.'], cue: 'Pull and push in one smooth movement.', mistake: 'Pulling the ball too far behind you.' },
    { name: 'L-turns', also: ['L-turn'], group: 'Ball mastery', steps: ['Pull the ball back with your sole.', 'Push it across behind your standing leg with the inside of the same foot.', 'Follow the ball and go: that makes an L.'], cue: 'Pull, then push, in one rhythm.', mistake: 'The ball hits your standing leg: pull it far enough back first.' },
    { name: 'inside-outside', group: 'Ball mastery', steps: ['Touch the ball sideways with the inside of your foot.', 'Straight away, touch it back with the outside of the same foot.', 'Keep going, then swap feet.'], cue: 'Small, quick touches on your toes. This is the base of the elastico.', mistake: 'Big touches that let the ball run away.' },
    { name: 'pull-push', group: 'Ball mastery', steps: ['Pull the ball back with your sole.', 'Push it forward with the laces of the same foot.', 'Keep a quick rhythm, then swap feet.'], cue: 'The ball never leaves your foot’s reach.', mistake: 'Looking down the whole time: glance up between touches.' },
    { name: 'roll-cut', group: 'Ball mastery', steps: ['Put the sole of one foot on top of the ball and roll it sideways across your body.', 'As it reaches your other foot, cut it back the other way with the inside of that foot.', 'Burst off in the new direction.'], cue: 'Roll slowly, cut sharply: the change of speed beats the defender.', mistake: 'Rolling it too far so it gets away from you.' },
    // Turns
    { name: 'drag-back', group: 'Turns', steps: ['Put your sole on top of the ball.', 'Roll it back towards you.', 'Turn your body and go the other way.'], cue: 'Shield the ball with your body as you turn.', mistake: 'Stopping still: keep your feet moving.' },
    { name: 'Cruyff turn', group: 'Turns', steps: ['Shape up as if you’re going to pass or cross with your right foot.', 'Instead, drag the ball behind your standing (left) leg with the inside of your right foot.', 'Turn and go the opposite way.'], cue: 'Sell the pass: arms out, head up, as if you mean it.', mistake: 'Dragging it too far so it runs past you.' },
    { name: 'roulette', also: ['Maradona turn'], group: 'Turns', steps: ['Put your right sole on the ball and drag it back as you start to spin.', 'Keep spinning, plant your right foot, then put your left sole on the ball.', 'Drag it on with the left sole as you finish the full circle, facing forward.'], cue: 'Keep your back between the defender and the ball.', mistake: 'Losing the ball under your feet: go slowly until it’s smooth.' },
    // Skill moves
    { name: 'croqueta', also: ['croquetas'], group: 'Skill moves', steps: ['Have the ball on the inside of one foot.', 'Shift it quickly sideways to the inside of your other foot, in one step.', 'Go past the defender on that side.'], cue: 'Low, quick and close: one sharp shift.', mistake: 'Shifting it too far so a defender can reach it.' },
    { name: 'Ronaldo chop', also: ['Ronaldo chops', 'chop'], group: 'Skill moves', steps: ['Dribble forward.', 'Plant your standing foot just past the ball.', 'With the inside of your other foot, cut the ball behind your standing leg to the other side, then accelerate.'], cue: 'Do it at speed: the faster you are, the better it works.', mistake: 'Slowing right down before the chop, which gives it away.' },
    { name: 'step-over', also: ['step-overs'], group: 'Skill moves', steps: ['Run at the ball.', 'Swing your right foot around the front of the ball, from inside to outside, without touching it.', 'Push the ball the other way with the outside of your left foot and accelerate.'], cue: 'Dip your shoulder with the step-over to sell it.', mistake: 'Doing it too far from the defender: get close first.' },
    { name: 'elastico', group: 'Skill moves', steps: ['Push the ball out to the side with the outside of your foot.', 'In the same movement, snap it back across with the inside of that foot.', 'Burst past on the inside.'], cue: 'Start slowly with inside-outside, then speed it up.', mistake: 'Two separate touches: it has to be one movement.' },
    { name: 'Matthews feint', group: 'Skill moves', steps: ['Dribble slowly at the defender.', 'Lean in and take a small touch inside with the inside of your foot to fake.', 'Quickly cut it out with the outside of the same foot and burst away.'], cue: 'Sell the lean: shoulders and eyes go inside first.', mistake: 'Not changing speed after the cut.' },
    { name: 'outside cut', group: 'Skill moves', steps: ['Dribble forward.', 'Cut the ball sharply sideways with the outside of your foot.', 'Accelerate into the space.'], cue: 'Cut away from where the defender is leaning.', mistake: 'A soft cut that the defender can follow.' },
    // First touch
    { name: 'shoulder check', group: 'First touch', steps: ['Before the ball arrives, take a quick look over your shoulder.', 'See where the space and the pressure are.', 'Decide your first touch before the ball reaches you.'], cue: 'Look just before the pass is played, and again as it travels.', mistake: 'Looking only at the ball.' },
    { name: 'half-turn', group: 'First touch', steps: ['Stand side-on with your body open, not square to the passer.', 'Receive the ball on your back foot (the one further from the passer).', 'Take your first touch forward into space.'], cue: 'Open hips mean you can see forward and play forward.', mistake: 'Receiving square, so your first touch goes backwards.' },
    { name: 'directional first touch', group: 'First touch', steps: ['Check where the space is.', 'Take the ball away with the outside of your foot (or stop it with the sole).', 'Go straight into your next action.'], cue: 'Your first touch moves the ball out of your feet, into space.', mistake: 'Stopping the ball dead under you every time.' },
    { name: 'kill it dead', group: 'First touch', steps: ['Watch the falling ball all the way down.', 'Lift your foot and meet it with your laces, relaxing your ankle.', 'Pull your foot down with the ball so it drops dead at your feet.'], cue: 'Soft ankle, like catching an egg.', mistake: 'A stiff foot that makes the ball bounce away.' }
  ],

  // Saturday past papers rotate through these subjects, one per week (positions in `subjects`).
  // You can always switch subject on the card. paperMins = default time allowed.
  paperRotation: [0, 1, 3, 2, 4],
  paperMins: { 0: 90, 1: 105, 2: 120, 3: 105, 4: 75 },   // AQA triple science papers are 1h45; Eduqas Literature 2h–2h30

  // Every day: these session cards are added to each day (same format as `sessions` in a day row).
  daily: [['ao1-reps', '07:45'], ['evening', '21:15']],

  // One row per day, Monday first.
  // load is 'High', 'Medium-High', 'Medium' or 'Low'.
  // sessions lists the session cards for that day: [id, start time] (ids from `sessions` below).
  // Leave the time out (just the id) for an all-day item. Times feed the calendar (calendar.ics).
  schedule: [
    { day: 'Mon', title: 'Upper + lower body', load: 'Medium',
      time: 'After school · Maths 40 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Upper body, Maths, then lower-body strength with 2–3 reps in reserve. Review Sunday’s match.',
      sessions: [['upper-cali', '16:15'], ['rev-maths', '17:30'], ['lower-a', '18:15'], ['match-review', '19:00'], ['wall-mastery', '19:10']] },
    { day: 'Tue', title: 'Astro skills + lower body', load: 'Medium',
      time: '15:45 · Physics 40 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Skill sequences at 75% pace, light legs, then 40 minutes of Physics from the revision guide.',
      sessions: [['astro-skill', '15:45'], ['lower-body', '17:00'], ['rev-physics', '18:00'], ['wall-touch', '19:20'], ['hustle', '20:00']] },
    { day: 'Wed', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Pick one cue and bring it to academy.',
      sessions: [['rev-lang', '16:30'], ['cue', '17:50'], ['academy', '18:15']] },
    { day: 'Thu', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Second academy night. One cue, quality over volume.',
      sessions: [['rev-eng-bio', '16:30'], ['cue', '17:50'], ['academy', '18:15']] },
    { day: 'Fri', title: 'Astro speed + match reps', load: 'Medium-High',
      time: '15:45–16:30 · revision 60 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Short, sharp speed reps. Stop after 2 slow reps.',
      sessions: [['astro-speed', '15:45'], ['rev-chem-maths', '17:30'], ['hustle', '18:45'], ['wall-dribble', '19:30']] },
    { day: 'Sat', title: 'Past paper + upper body', load: 'Low',
      time: 'Morning · 2–3 hr paper', sub: 'Upper body at 16:00, legs rest for Sunday',
      mission: 'Timed past paper, mark it properly. Upper body later, legs rest for the match.',
      sessions: [['past-paper', '09:00'], ['wall-juggle', '13:00'], ['recovery', '15:00'], ['upper-cali-b', '16:00'], ['visualise', '20:00']] },
    { day: 'Sun', title: 'Match day', load: 'High',
      time: 'Match day · no revision', sub: '',
      mission: 'Match day. Play simple, play fast.',
      sessions: ['match', ['wall-light', '17:00'], ['hustle', '18:00']] }
  ],

  // Session cards. Each one shows on Today and Week for the days that list it.
  //   kind: 'gym' | 'football' | 'recovery' | 'revision' | 'paper' | 'mental' | 'routine' | 'hustle'
  //   items: one row each. sets = how many ticks the row has (leave it out for a single tick).
  //     plyo: true = plyometrics. Only on fresh, lower-body/speed days (Tue, Fri). Dropped automatically
  //     when leg freshness in the morning check-in is 2 or lower, or there's a game or match tomorrow.
  //   fixed: true = the planner never moves or drops it (academy, match).
  //   onClash: 'skip' = if an event clashes, skip it instead of moving it (clashNote says why).
  //   warmup: true on an item marks the 5-minute warm-up (3 min skipping rope or bike + 2 min dynamic moves).
  //   remind: minutes before the start to remind you (default 10). Optional cards have no reminder.
  //   ladder: [AO1, AO2, AO3] = how many exam questions of each kind the card gives you, from js/questions.js
  //     (weak topics and questions you got wrong come first). `mixed: true` draws from every subject.
  //     `only: { subject: 'Chemistry:' }` limits a subject to topics starting with that text (or give a list of topic names).
  //   guide: true = a 40-minute revision-guide session on paper, in timed steps (see guideSteps below),
  //     on the subject's weakest topic (rotating). The app's own questions are in the morning AO1 reps.
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
    'upper-cali-b': {
      kind: 'gym', title: 'Upper-body calisthenics B (push + skill)', minutes: 45,
      focus: 'Second upper-body day: push and skill focus, legs rest for Sunday. Stop 2 reps short on every set.',
      items: [
        { name: 'Warm-up: easy bike', reps: '3 min', warmup: true },
        { name: 'Warm-up: arm circles, inchworms ×5', reps: '2 min', warmup: true },
        { name: 'Warm-up: wrist circles, shoulder dislocates, scap push-ups', reps: '5 min' },
        { name: 'Handstand practice: chest-to-wall holds or kick-ups', sets: 5, reps: '15–20s' },
        { name: 'Pike push-ups (feet on a step when they get easy)', sets: 3, reps: '8–10, stop 2 short' },
        { name: 'Chin-ups (palms facing you)', sets: 3, reps: 'stop 2 short' },
        { name: 'Archer or diamond push-ups', sets: 3, reps: '6–10' },
        { name: 'Feet-up inverted rows', sets: 3, reps: '8–12' },
        { name: 'Hollow body rocks', sets: 3, reps: '15–20s' },
        { name: 'Mobility: shoulders and upper back', reps: '5 min' }
      ]
    },
    'upper-cali': {
      kind: 'gym', title: 'Upper-body calisthenics', minutes: 45,
      focus: 'Stop 2 reps short on every set. Quality over fatigue.',
      items: [
        { name: 'Warm-up: skipping rope', reps: '3 min', warmup: true },
        { name: 'Warm-up: arm circles, inchworms ×5', reps: '2 min', warmup: true },
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
      kind: 'football', title: 'Astro: skill sequences', minutes: 47,
      focus: 'Solo: just balls and cones. Bring 3+ balls and 4–6 cones. About 75% pace: half speed first, then full speed.',
      items: [
        { name: 'Warm-up: jog, dynamic stretches, 3 build-ups', reps: '8 min' },
        { name: 'Back to goal, roll the ball past your side, open up and take it on the half-turn, drive past a cone, shoot', sets: 4, reps: '5 reps', rest: 'half then full speed' },
        { name: 'Weak foot: throw the ball up and control it with your weak foot (or thigh or chest first), then weak-foot finishes', reps: '10 min' },
        { name: 'Skills under fatigue: 20s fast ball mastery (croquetas, inside-outside, sole rolls) → 10 m dribble flat out → Ronaldo chop or Cruyff turn at the cone → sprint back → finish', sets: 2, reps: '6 rounds, 40s rest', rest: '2 min between sets', cue: 'Last block on purpose. Slow the move down, never the effort. Stop the set if your touch falls apart' }
      ]
    },
    'lower-a': {
      kind: 'gym', title: 'Lower body A (strength)', minutes: 35,
      focus: 'Strength, the day after the match: stop 2–3 reps short on every set. Played 60+ minutes yesterday, or legs 2 or lower in the check-in? Do one set less of each.',
      items: [
        { name: 'Warm-up: easy bike', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, glute bridges ×10, bodyweight squats ×10', reps: '2 min', warmup: true },
        { name: 'Rear-foot elevated split squats (back foot on a chair or step)', sets: 3, reps: '6–8 each leg', rest: '90s' },
        { name: 'Single-leg RDL', sets: 3, reps: '8 each leg', rest: '60s' },
        { name: 'Slider hamstring curls (socks on a hard floor, or heels on a towel)', sets: 3, reps: '6–8', rest: '90s', cue: 'Bridge up, slide your heels out slowly over 3–4 s keeping hips up, pull back in. Too hard: slide out only, then walk your feet back. Too easy: one leg. Someone to hold your ankles? Do Nordics instead' },
        { name: 'Copenhagen plank (top knee on a bench, side plank, short lever)', sets: 3, reps: '15–20s each side', rest: '45s' },
        { name: 'Single-leg calf raises (on a step)', sets: 2, reps: '12–15 each leg', rest: '45s' }
      ]
    },
    'lower-body': {
      kind: 'gym', title: 'Lower body B (power, light)', minutes: 30,
      focus: 'Light and springy: academy is tomorrow. Plyos first while you’re fresh; the heavy strength work was on Monday.',
      items: [
        { name: 'Warm-up: easy bike', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, walking lunges, glute bridges ×10', reps: '2 min', warmup: true },
        { name: 'Plyometrics: pogo hops (quick, stiff ankles)', sets: 2, reps: '15', rest: '60s', plyo: true },
        { name: 'Plyometrics: lateral bounds (stick each landing)', sets: 2, reps: '5 each side', rest: '60s', plyo: true },
        { name: 'Single-leg glute bridge', sets: 2, reps: '12 each leg' },
        { name: 'Lateral lunges', sets: 2, reps: '8 each side' },
        { name: 'Skill snack: tuck L-sit holds', reps: '10 min' }
      ]
    },
    'cue': {
      kind: 'mental', title: 'Pick one cue', minutes: 2, onClash: 'skip', clashNote: 'Pick your cue before the event instead',
      focus: 'One thing to focus on tonight, e.g. "scan before receiving".',
      items: [{ name: 'Choose today’s cue before you leave' }, { name: 'After training: did you do it?' }]
    },
    'astro-speed': {
      kind: 'football', title: 'Astro: speed + match reps', minutes: 53,
      focus: 'Solo. Bring 3+ balls and 6 cones so you’re not chasing balls. Full recovery between sprints; stop after 2 slow reps.',
      items: [
        { name: 'Warm-up: A-skips, strides', reps: '10 min' },
        { name: 'Plyometrics: broad jumps (max effort, stick the landing)', sets: 3, reps: '3', rest: 'full recovery', plyo: true },
        { name: 'Plyometrics: single-leg bounds', sets: 2, reps: '4 each leg', rest: 'full recovery', plyo: true },
        { name: '10m sprints', sets: 3, reps: '1', rest: 'full recovery' },
        { name: '20m sprints', sets: 2, reps: '1', rest: 'full recovery' },
        { name: 'Runs in behind: knock the ball past a cone into space, sprint onto it, one touch, shoot', reps: '6–8 reps' },
        { name: 'Near-post darts: set the ball out wide, dart to the near post, finish first time', reps: '6–8 reps, half weak foot' },
        { name: '1v1 into shot: run at a cone “defender” at speed, do a move, burst past, shoot', reps: '6–8 reps' },
        { name: 'Finishing from self-set balls, at least half weak foot', reps: '10 min' },
        { name: 'Skills under fatigue: 2 hard 20 m shuttles → set yourself a ball → beat a cone with a move → finish', sets: 4, reps: '1 round', rest: '60s', cue: 'Keep the touch clean while you’re breathing hard. Shorter than Tuesday: match on Sunday' },
        { name: 'Skill snack: handstand kick-ups', reps: '10 min' }
      ]
    },
    // Wall sessions: 30 minutes every day except academy nights, a different technical focus each day.
    // Every one mixes wall passing with technical work and ends with weak-foot wall passes.
    'wall-mastery': {
      kind: 'football', keep: true, title: 'Wall session: ball mastery', minutes: 35,
      focus: 'Non-negotiable. Quick, soft touches on the balls of your feet; head up between moves. Level up: go faster, then do it all eyes-up.',
      items: [
        { name: 'Warm-up: skipping rope', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, hip openers, high knees', reps: '2 min', warmup: true },
        { name: 'Two-touch wall passing, both feet', reps: '6 min', cue: 'First touch out of your feet, pass on the second. Alternate inside foot and laces' },
        { name: 'One-touch wall passing', reps: '4 min', cue: 'Lock your ankle, follow through to the target' },
        { name: 'Ball mastery circuit: sole rolls, V-pulls, L-turns, croquetas, Ronaldo chops, inside-outside, Matthews feint, roll-cut', sets: 8, reps: '40s on, 20s off (8 min)', cue: 'One move per set, both feet' },
        { name: 'Tight-box combos: 4 cones 2 m apart', reps: '7 min', cue: 'Croqueta through each gate, chop at each corner. Level up: eyes on a fixed point, not the ball' },
        { name: 'Weak foot only wall passing', reps: '5 min', cue: 'Same quality as your strong foot, slower if you need to' }
      ]
    },
    'wall-touch': {
      kind: 'football', keep: true, title: 'Wall session: first touch', minutes: 35,
      focus: 'Non-negotiable. Every first touch sets up the next action: check your shoulder before the ball arrives.',
      items: [
        { name: 'Warm-up: easy bike', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, hip openers, high knees', reps: '2 min', warmup: true },
        { name: 'Two-touch wall passing, both feet', reps: '6 min', cue: 'Touch to the side you pass with next' },
        { name: 'Half-turn receive off the wall', reps: '8 min', cue: 'Shoulder check, open your hips, receive on the back foot, first touch at 45° into space, pass back. Alternate sides' },
        { name: 'Directional first touch', reps: '5 min', cue: 'Take it away with the outside of the foot, then stop it dead with the sole and go. Both feet' },
        { name: 'Aerial control: throw it high', reps: '5 min', cue: 'Kill it dead on the laces, then thigh to foot, then chest to foot. Ball stays within a step' },
        { name: 'Weak foot only wall passing', reps: '6 min', cue: 'First touch and pass with the weak foot only' }
      ]
    },
    'wall-dribble': {
      kind: 'football', keep: true, title: 'Wall session: dribbling at speed', minutes: 35,
      focus: 'Non-negotiable. Sell the fake, then explode out of it. Ball close until the burst.',
      items: [
        { name: 'Warm-up: skipping rope', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, hip openers, high knees', reps: '2 min', warmup: true },
        { name: 'One-touch wall passing', reps: '5 min', cue: 'On your toes, quick feet between passes' },
        { name: 'Cone slalom: 6 cones 1 m apart', reps: '5 min', cue: 'Inside-outside with one foot, then weak foot only, then sole rolls through. Touch in every gap' },
        { name: 'Skill moves at a cone, then burst 5 m', reps: '10 min', cue: '5 reps each: step-over, Cruyff turn, Ronaldo chop, elastico, roulette' },
        { name: 'Match combos at speed', reps: '5 min', cue: 'Step-over → chop → burst. Drag-back → croqueta → burst. Finish with a pass into the wall' },
        { name: 'Weak foot only wall passing', reps: '5 min', cue: 'Weak foot only, keep the tempo high' }
      ]
    },
    'wall-juggle': {
      kind: 'football', keep: true, title: 'Wall session: juggling and close control', minutes: 35,
      focus: 'Non-negotiable. Soft touches, ball close. Beat your record every week.',
      items: [
        { name: 'Warm-up: easy bike', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, hip openers, high knees', reps: '2 min', warmup: true },
        { name: 'Two-touch wall passing, both feet', reps: '6 min', cue: 'Cushion the first touch, ball under control before passing' },
        { name: 'Juggling progressions', reps: '8 min', cue: 'Level 1: 20 alternate feet. Level 2: foot, thigh, foot, head. Level 3: 20 weak foot only. Level 4: low juggles below the knee' },
        { name: 'Close-control circuit: roll-cut, inside-outside, croqueta, pull-push, outside cut', sets: 5, reps: '45s on, 15s off (5 min)', cue: 'One move per set, as fast as you can stay clean' },
        { name: 'Receive on the back foot off the wall and turn', reps: '5 min', cue: 'Shoulder check, open up, first touch past your standing leg, then pass back' },
        { name: 'Weak foot only wall passing', reps: '6 min', cue: 'Weak foot only' }
      ]
    },
    'wall-light': {
      kind: 'football', keep: true, title: 'Wall session: light touch', minutes: 35,
      focus: 'Match day: easy pace, just touches. Stop if your legs feel heavy.',
      items: [
        { name: 'Warm-up: skipping rope, easy pace', reps: '3 min', warmup: true },
        { name: 'Warm-up: leg swings, hip openers', reps: '2 min', warmup: true },
        { name: 'Easy one- and two-touch wall passing', reps: '10 min', cue: 'Relaxed, crisp passes' },
        { name: 'Juggling, relaxed', reps: '8 min', cue: 'Alternate feet, no pressure' },
        { name: 'Gentle ball mastery: sole rolls, inside-outside', reps: '6 min', cue: 'Light and quick, not tiring' },
        { name: 'Weak foot only wall passing', reps: '6 min', cue: 'Weak foot only, easy pace' }
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
      kind: 'revision', subjects: [3, 0], title: 'Chemistry / Maths revision', minutes: 40, guide: true,
      only: { 3: 'Chemistry:' },
      focus: 'Chemistry, with Maths on alternate weeks. Revision guide, pen and paper.'
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
      kind: 'recovery', optional: true, title: 'Rest, or 20 min mobility', minutes: 25,
      focus: 'Rest is fine. If you move, keep it easy.',
      items: [
        { name: 'Warm-up: easy bike', reps: '5 min', warmup: true },
        { name: 'Foam roll: calves, quads, glutes', reps: '6 min' },
        { name: 'Hip flexor stretch', sets: 2, reps: '45s each side' },
        { name: 'Hamstring stretch', sets: 2, reps: '45s each side' },
        { name: 'Ankle mobility', sets: 2, reps: '10 each side' }
      ]
    },
    'rev-maths': {
      kind: 'revision', subject: 0, title: 'Maths revision', minutes: 40, guide: true,
      onClash: 'skip', clashNote: 'Maths stays at its time; dropped today because of a clash',
      focus: 'Revision guide, pen and paper. Full working on every question.'
    },
    'rev-physics': {
      kind: 'revision', subject: 1, title: 'Physics revision', minutes: 40, guide: true,
      focus: 'Revision guide, pen and paper. Equations from memory first.'
    },
    'rev-lang': {
      kind: 'revision', subject: 4, title: 'Spanish + PE revision', minutes: 40, guide: true,
      focus: 'Revision guide, pen and paper. Say Spanish answers out loud before you write them.'
    },
    'rev-eng-bio': {
      kind: 'revision', subjects: [2, 3], title: 'English / Biology revision', minutes: 40, guide: true,
      only: { 3: 'Biology:' },
      focus: 'English and Biology swap each week. Revision guide, pen and paper.'
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

  // target: the grade you're aiming for. startLevel: questions start around this grade (±1) and move up
  // a level when you score 75%+ over your last 8 answers at that level, or down one if you're under 45%.
  // Revision subjects in priority order. goal = default weekly minutes (you can also edit goals in the app).
  // topics = the starting topic list. You can add, remove and rate topics in the app too.
  subjects: [
    { name: 'Maths', board: 'AQA (Higher)', target: 9, startLevel: 6, goal: 60, topics: [
      'Number: fractions, decimals and percentages', 'Number: indices, roots and standard form', 'Number: surds',
      'Number: factors, multiples and primes', 'Number: rounding, estimation and bounds', 'Number: recurring decimals',
      'Algebra: expanding and factorising', 'Algebra: linear equations and inequalities', 'Algebra: quadratics',
      'Algebra: simultaneous equations', 'Algebra: sequences', 'Algebra: straight-line graphs and gradients',
      'Algebra: quadratic, cubic and other graphs', 'Algebra: functions and iteration', 'Algebra: algebraic fractions and proof',
      'Algebra: transforming graphs', 'Algebra: area under graphs and rates of change', 'Algebra: equation of a circle',
      'Ratio: ratio and proportion', 'Ratio: percentages, interest, growth and decay', 'Ratio: compound measures',
      'Geometry: angles and polygons', 'Geometry: area, perimeter and volume', 'Geometry: arcs and sectors',
      'Geometry: circle theorems', 'Geometry: Pythagoras', 'Geometry: trigonometry', 'Geometry: sine and cosine rules',
      'Geometry: transformations', 'Geometry: congruence and similarity', 'Geometry: constructions, loci and bearings',
      'Geometry: vectors',
      'Probability: basics and expected outcomes', 'Probability: tree diagrams and conditional probability', 'Probability: Venn diagrams and sets',
      'Statistics: averages and spread', 'Statistics: charts, scatter graphs and correlation',
      'Statistics: cumulative frequency and box plots', 'Statistics: histograms', 'Statistics: sampling'] },
    { name: 'Physics', board: 'AQA (triple science)', target: 9, startLevel: 6, goal: 40, topics: [
      'Energy: stores and transfers', 'Energy: specific heat capacity', 'Energy: power and efficiency', 'Energy: energy resources',
      'Electricity: current, potential difference and resistance', 'Electricity: series and parallel circuits',
      'Electricity: mains electricity and power', 'Electricity: the National Grid', 'Electricity: static electricity',
      'Particles: density and changes of state', 'Particles: internal energy and latent heat', 'Particles: gas pressure',
      'Atomic: atoms, isotopes and models of the atom', 'Atomic: radioactive decay and half-life',
      'Atomic: uses and hazards of radiation', 'Atomic: fission and fusion',
      'Forces: scalars, vectors and resultant forces', 'Forces: work done, weight and springs', 'Forces: moments, levers and gears',
      'Forces: pressure in fluids', 'Forces: motion, graphs and acceleration', 'Forces: Newton’s laws', 'Forces: stopping distances',
      'Forces: momentum',
      'Waves: properties of waves', 'Waves: reflection, refraction and sound', 'Waves: electromagnetic spectrum',
      'Waves: lenses and visible light', 'Waves: black body radiation',
      'Magnetism: magnets and fields', 'Magnetism: the motor effect', 'Magnetism: generators and transformers',
      'Space: the solar system and life cycle of stars', 'Space: orbits', 'Space: red-shift and the Big Bang'] },
    { name: 'English', board: 'WJEC Eduqas', goal: 20,
      note: 'Literature: Component 1 (Macbeth, poetry anthology) 2h · Component 2 (An Inspector Calls, Jekyll and Hyde, unseen poetry) 2h30. Language: Component 1 1h45 · Component 2 2h.', topics: [
      'Literature: Macbeth', 'Literature: Jekyll and Hyde', 'Literature: An Inspector Calls',
      'Literature: Eduqas poetry anthology', 'Literature: unseen poetry',
      'Language: fiction reading', 'Language: non-fiction reading', 'Language: creative writing',
      'Language: viewpoint and transactional writing', 'Language: spelling, punctuation and grammar'] },
    { name: 'Biology / Chemistry', board: 'AQA (triple science)', target: 9, startLevel: 6, goal: 40, topics: [
      'Biology: cell structure and microscopy', 'Biology: cell division and stem cells', 'Biology: transport in cells',
      'Biology: digestion and enzymes', 'Biology: heart, blood and circulation', 'Biology: non-communicable disease',
      'Biology: plant tissues and transport', 'Biology: communicable disease', 'Biology: defence, vaccination and drugs',
      'Biology: monoclonal antibodies and plant disease', 'Biology: photosynthesis', 'Biology: respiration and metabolism',
      'Biology: nervous system, brain and eye', 'Biology: hormones and blood glucose', 'Biology: reproductive hormones and contraception',
      'Biology: kidneys, temperature and water balance', 'Biology: plant hormones', 'Biology: DNA, meiosis and reproduction',
      'Biology: genetic inheritance', 'Biology: variation and evolution', 'Biology: selective breeding, genetic engineering and cloning',
      'Biology: classification and fossils', 'Biology: ecosystems and adaptations', 'Biology: cycles and decomposition',
      'Biology: biodiversity and human impact', 'Biology: food production',
      'Chemistry: atoms, isotopes and electron structure', 'Chemistry: history of the atom', 'Chemistry: the periodic table and groups',
      'Chemistry: transition metals', 'Chemistry: ionic, covalent and metallic bonding', 'Chemistry: structure and properties',
      'Chemistry: carbon structures and nanoparticles', 'Chemistry: relative mass and conservation of mass',
      'Chemistry: moles and reacting masses', 'Chemistry: yield and atom economy', 'Chemistry: concentration, titrations and gas volumes',
      'Chemistry: reactivity and extracting metals', 'Chemistry: acids, alkalis and salts', 'Chemistry: electrolysis',
      'Chemistry: energy changes', 'Chemistry: chemical cells and fuel cells', 'Chemistry: rates of reaction',
      'Chemistry: reversible reactions and equilibrium', 'Chemistry: crude oil, alkanes and cracking',
      'Chemistry: alkenes, alcohols and carboxylic acids', 'Chemistry: polymers', 'Chemistry: purity, chromatography and gas tests',
      'Chemistry: identifying ions and instrumental analysis', 'Chemistry: the atmosphere and climate change', 'Chemistry: pollutants',
      'Chemistry: water treatment and life cycle assessment', 'Chemistry: materials and corrosion', 'Chemistry: Haber process and fertilisers'] },
    { name: 'Spanish / PE', board: 'Pearson Edexcel (Spanish) · AQA (PE)', goal: 40, topics: [
      'Spanish: my personal world', 'Spanish: lifestyle and wellbeing', 'Spanish: my neighbourhood', 'Spanish: media and technology',
      'Spanish: studying and my future', 'Spanish: travel and tourism',
      'Spanish: present tense', 'Spanish: past tenses', 'Spanish: future and conditional', 'Spanish: translation',
      'Spanish: speaking (role play, picture task, conversation)', 'Spanish: listening and dictation',
      'PE: applied anatomy and physiology', 'PE: movement analysis', 'PE: physical training', 'PE: use of data',
      'PE: sport psychology', 'PE: socio-cultural influences', 'PE: health, fitness and well-being'] },
    { name: 'BTEC DIT', board: 'Pearson BTEC Tech Award', goal: 30, note: 'Coursework deadlines only, small weekly chunks.', topics: [
      'Component 1: user interface design and project planning', 'Component 2: collecting, presenting and interpreting data',
      'Component 3: effective digital working practices (exam)', 'Next coursework deadline'] }
  ],

  // Old topic names → new ones, so your ratings, marks and past-paper notes carry over.
  topicRenames: {
    0: { 'Simultaneous equations': 'Algebra: simultaneous equations', 'Trigonometry': 'Geometry: trigonometry', 'Vectors': 'Geometry: vectors',
      'Probability': 'Probability: basics and expected outcomes', 'Circle theorems': 'Geometry: circle theorems',
      'Graphs and gradients': 'Algebra: straight-line graphs and gradients', 'Ratio and proportion': 'Ratio: ratio and proportion' },
    1: { 'Forces and motion': 'Forces: motion, graphs and acceleration', 'Energy': 'Energy: stores and transfers',
      'Electricity': 'Electricity: current, potential difference and resistance', 'Waves': 'Waves: properties of waves',
      'Magnetism': 'Magnetism: magnets and fields', 'Atomic structure': 'Atomic: atoms, isotopes and models of the atom',
      'Particle model': 'Particles: density and changes of state', 'Space': 'Space: the solar system and life cycle of stars' },
    2: { 'Shakespeare play': 'Literature: Macbeth', 'Macbeth': 'Literature: Macbeth', '19th-century novel': 'Literature: Jekyll and Hyde',
      'Jekyll and Hyde': 'Literature: Jekyll and Hyde', 'Modern text': 'Literature: An Inspector Calls', 'An Inspector Calls': 'Literature: An Inspector Calls',
      'Poetry anthology': 'Literature: Eduqas poetry anthology', 'Literature: poetry anthology': 'Literature: Eduqas poetry anthology', 'Unseen poetry': 'Literature: unseen poetry',
      'Language Paper 1': 'Language: fiction reading', 'Language Paper 2': 'Language: non-fiction reading' },
    3: { 'Cells': 'Biology: cell structure and microscopy', 'Infection and response': 'Biology: communicable disease',
      'Homeostasis': 'Biology: hormones and blood glucose', 'Inheritance and evolution': 'Biology: variation and evolution',
      'Bonding and structure': 'Chemistry: ionic, covalent and metallic bonding', 'Quantitative chemistry': 'Chemistry: moles and reacting masses',
      'Rates of reaction': 'Chemistry: rates of reaction', 'Organic chemistry': 'Chemistry: crude oil, alkanes and cracking' },
    4: { 'Spanish: school and future plans': 'Spanish: studying and my future', 'Spanish: speaking photo cards': 'Spanish: speaking (role play, picture task, conversation)',
      'PE: anatomy and physiology': 'PE: applied anatomy and physiology', 'PE: training principles': 'PE: physical training' }
  },

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
