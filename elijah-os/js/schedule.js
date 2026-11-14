// Elijah OS — the data you are most likely to edit.
// Change the weekly schedule, session cards, exam date, subjects or benchmarks here, save, and reload the app.
// (Claude Code can edit this file for you: "add Nordic curls to the lower-body session", "add Circle theorems to Maths".)

window.ELIJAH_DATA = {
  name: 'Elijah',

  // First exam: year, month (1-12), day
  firstExam: { year: 2027, month: 5, day: 10, label: '10 May 2027' },

  // One row per day, Monday first.
  // load is 'High', 'Medium' or 'Low'.
  // sessions lists the session cards for that day, in order: [id, start time] (ids from `sessions` below).
  // Leave the time out (just the id) for an all-day item. Times feed the calendar (calendar.ics).
  schedule: [
    { day: 'Mon', title: 'Recovery, upper-body calisthenics, Maths revision', load: 'Low',
      time: 'After school · Maths 60 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Recover well. Upper body, then one hour of Maths.',
      sessions: [['recovery', '16:00'], ['upper-cali', '16:30'], ['rev-maths', '17:30']] },
    { day: 'Tue', title: 'Astro: skill sequences', load: 'Medium',
      time: '15:45–16:45', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Clean touches at speed. Repeat each sequence until it is automatic.',
      sessions: [['astro-skill', '15:45'], ['rev-physics', '17:30']] },
    { day: 'Wed', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Bring full focus to academy. Win your first action.',
      sessions: [['rev-science', '16:30'], ['academy', '18:15']] },
    { day: 'Thu', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Second academy night. Quality over volume.',
      sessions: [['rev-english', '16:30'], ['academy', '18:15']] },
    { day: 'Fri', title: 'Astro: speed and match-speed reps', load: 'Medium',
      time: '15:45–16:45', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Short, sharp speed reps. Stop while you are still fast.',
      sessions: [['astro-speed', '15:45'], ['rev-lang', '17:30']] },
    { day: 'Sat', title: 'Past paper, then rest', load: 'Low',
      time: 'Morning', sub: 'Rest in the afternoon',
      mission: 'Past paper under timed conditions, then switch off.',
      sessions: [['past-paper', '09:30'], ['recovery', '15:00']] },
    { day: 'Sun', title: 'Match', load: 'High',
      time: 'Match day', sub: '',
      mission: 'Match day. Play simple, play fast.',
      sessions: ['match'] }
  ],

  // Session cards. Each one shows on Today and Week for the days that list it.
  //   kind: 'gym' | 'football' | 'recovery' | 'revision' | 'paper'
  //   items: one row each. sets = how many ticks the row has (leave it out for a single tick).
  //   For kind 'revision', `subject` is the subject's position in `subjects` (0 = first),
  //   and the card adds your `topics` weakest topics from that subject automatically.
  //   Finishing a revision card adds its minutes to that subject on the Revision screen.
  sessions: {
    'upper-cali': {
      kind: 'gym', title: 'Upper-body calisthenics', minutes: 40,
      focus: 'Strict reps, full range. Stop 1–2 reps before failure.',
      items: [
        { name: 'Pull-ups', sets: 4, reps: '6–8', rest: '90s' },
        { name: 'Dips', sets: 4, reps: '8–10', rest: '90s' },
        { name: 'Pike push-ups', sets: 3, reps: '8', rest: '60s' },
        { name: 'Hollow hold', sets: 3, reps: '30s', rest: '45s' },
        { name: 'Handstand hold (wall)', sets: 5, reps: '20–30s', rest: '45s' }
      ]
    },
    'astro-skill': {
      kind: 'football', title: 'Astro: skill sequences', minutes: 60,
      focus: 'Clean touches at speed. Repeat each sequence until it is automatic.',
      items: [
        { name: 'Warm-up and mobility', reps: '10 min' },
        { name: 'Ball mastery sequence', sets: 4, reps: '60s', rest: '30s' },
        { name: 'Wall passes, left then right', sets: 3, reps: '60s each' },
        { name: 'Receive, turn, accelerate', sets: 6, reps: '3 each side' },
        { name: 'Weak-foot finishes', sets: 2, reps: '10' }
      ]
    },
    'astro-speed': {
      kind: 'football', title: 'Astro: speed and match-speed reps', minutes: 60,
      focus: 'Short, sharp reps with full rest. Stop while you are still fast.',
      items: [
        { name: 'Warm-up and sprint drills', reps: '12 min' },
        { name: '10m sprints', sets: 6, reps: '1', rest: '60s' },
        { name: '20m flying sprints', sets: 4, reps: '1', rest: '90s' },
        { name: 'Dribble at match speed, cut, finish', sets: 6, reps: '1', rest: '60s' },
        { name: 'Cool-down', reps: '5 min' }
      ]
    },
    'academy': {
      kind: 'football', title: 'Academy training', minutes: 90,
      focus: 'Full focus. Win your first action.',
      items: [
        { name: 'Eat a snack and drink water by 16:30' },
        { name: 'Pack boots, shin pads, bottle' },
        { name: 'Activation before the session', reps: '10 min' },
        { name: 'Training' },
        { name: 'Stretch and refuel after' }
      ]
    },
    'match': {
      kind: 'football', title: 'Match day', minutes: 90,
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
      kind: 'recovery', title: 'Recovery and mobility', minutes: 20,
      focus: 'Easy. Leave feeling fresher than you started.',
      items: [
        { name: 'Foam roll: calves, quads, glutes', reps: '6 min' },
        { name: 'Hip flexor stretch', sets: 2, reps: '45s each side' },
        { name: 'Hamstring stretch', sets: 2, reps: '45s each side' },
        { name: 'Ankle mobility', sets: 2, reps: '10 each side' }
      ]
    },
    'rev-maths': {
      kind: 'revision', subject: 0, title: 'Maths revision', minutes: 60, topics: 2,
      focus: 'Two weak topics, then exam questions on them.',
      items: [{ name: '10 exam questions on today’s topics' }]
    },
    'rev-physics': {
      kind: 'revision', subject: 1, title: 'Physics revision', minutes: 45, topics: 2,
      focus: 'Learn it, then test yourself without notes.',
      items: [{ name: 'Blurt everything from memory, then check' }]
    },
    'rev-science': {
      kind: 'revision', subject: 3, title: 'Biology / Chemistry revision', minutes: 30, topics: 1,
      focus: 'One topic, done properly, before academy.',
      items: [{ name: 'Flashcards for the topic' }]
    },
    'rev-english': {
      kind: 'revision', subject: 2, title: 'English revision', minutes: 30, topics: 1,
      focus: 'Quotes and one timed paragraph.',
      items: [{ name: 'Write one paragraph in 12 minutes' }]
    },
    'rev-lang': {
      kind: 'revision', subject: 4, title: 'Spanish / PE revision', minutes: 30, topics: 1,
      focus: 'Short and active: say it out loud or write it.',
      items: [{ name: 'Self-test on the topic' }]
    },
    'past-paper': {
      kind: 'paper', title: 'Timed past paper', minutes: 90,
      focus: 'Exam conditions: timer on, phone away, no notes.',
      items: [
        { name: 'Pick the paper and set the timer' },
        { name: 'Sit the paper' },
        { name: 'Mark it with the mark scheme' },
        { name: 'Add the score on the Revision screen' },
        { name: 'Rate the topics you dropped marks on' }
      ]
    }
  },

  // Revision subjects in priority order. goal = default weekly minutes (you can also edit goals in the app).
  // topics = the starting topic list. You can add, remove and rate topics in the app too.
  subjects: [
    { name: 'Maths', goal: 150, topics: [
      'Algebra: quadratics', 'Simultaneous equations', 'Trigonometry', 'Vectors',
      'Probability', 'Circle theorems', 'Graphs and gradients', 'Ratio and proportion'] },
    { name: 'Physics', goal: 120, topics: [
      'Forces and motion', 'Energy', 'Electricity', 'Waves',
      'Magnetism', 'Atomic structure', 'Particle model', 'Space'] },
    { name: 'English', goal: 90, topics: [
      'Shakespeare play', '19th-century novel', 'Modern text', 'Poetry anthology',
      'Unseen poetry', 'Language Paper 1', 'Language Paper 2'] },
    { name: 'Biology / Chemistry', goal: 90, topics: [
      'Cells', 'Infection and response', 'Homeostasis', 'Inheritance and evolution',
      'Bonding and structure', 'Quantitative chemistry', 'Rates of reaction', 'Organic chemistry'] },
    { name: 'Spanish / PE', goal: 60, topics: [
      'Spanish: past tenses', 'Spanish: school and future plans', 'Spanish: speaking photo cards',
      'PE: anatomy and physiology', 'PE: training principles', 'PE: sport psychology'] }
  ],

  // Starting rows for the Benchmarks table.
  benchmarks: [
    { name: '10m sprint' },
    { name: '20m sprint' },
    { name: 'Wall passes / 60s (L)' },
    { name: 'Wall passes / 60s (R)' },
    { name: 'Weak-foot finishes / 10' },
    { name: 'Pull-ups', base: '12' },
    { name: 'Dips' },
    { name: 'Hollow hold' },
    { name: 'Handstand hold' }
  ],

  // Extra exercises per weekday (0 = Monday ... 6 = Sunday), editable in the app under "Extras".
  defaultWorkouts: {}
};
