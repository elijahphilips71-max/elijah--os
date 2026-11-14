// Elijah OS — the data you are most likely to edit.
// Change the weekly schedule, exam date, subjects or benchmarks here, save, and reload the app.
// (Claude Code can edit this file for you: "change Tuesday's session to ...")

window.ELIJAH_DATA = {
  name: 'Elijah',

  // First exam: year, month (1-12), day
  firstExam: { year: 2027, month: 5, day: 10, label: '10 May 2027' },

  // One row per day, Monday first.
  // load is 'High', 'Medium' or 'Low'.
  schedule: [
    { day: 'Mon', title: 'Recovery, upper-body calisthenics, Maths revision', load: 'Low',
      time: 'After school · Maths 60 min', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Recover well. Upper body, then one hour of Maths.' },
    { day: 'Tue', title: 'Astro: skill sequences', load: 'Medium',
      time: '15:45–16:45', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Clean touches at speed. Repeat each sequence until it is automatic.' },
    { day: 'Wed', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Bring full focus to academy. Win your first action.' },
    { day: 'Thu', title: 'Academy training', load: 'High',
      time: '18:15 · leave 18:00', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Second academy night. Quality over volume.' },
    { day: 'Fri', title: 'Astro: speed and match-speed reps', load: 'Medium',
      time: '15:45–16:45', sub: 'Leave 08:20 · school 08:50–15:25',
      mission: 'Short, sharp speed reps. Stop while you are still fast.' },
    { day: 'Sat', title: 'Past paper, then rest', load: 'Low',
      time: 'Morning', sub: 'Rest in the afternoon',
      mission: 'Past paper under timed conditions, then switch off.' },
    { day: 'Sun', title: 'Match', load: 'High',
      time: 'Match day', sub: '',
      mission: 'Match day. Play simple, play fast.' }
  ],

  // Revision subjects in priority order. goal = default weekly minutes (you can also edit goals in the app).
  subjects: [
    { name: 'Maths', goal: 150 },
    { name: 'Physics', goal: 120 },
    { name: 'English', goal: 90 },
    { name: 'Biology / Chemistry', goal: 90 },
    { name: 'Spanish / PE', goal: 60 }
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

  // Starting workouts per weekday (0 = Monday ... 6 = Sunday).
  defaultWorkouts: {
    0: [
      { name: 'Pull-ups', sets: '', reps: '' },
      { name: 'Dips', sets: '', reps: '' },
      { name: 'Hollow hold', sets: '', reps: '' },
      { name: 'Handstand hold', sets: '', reps: '' }
    ]
  }
};
