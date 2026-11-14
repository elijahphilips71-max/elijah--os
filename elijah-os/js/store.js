// Elijah OS — saving and syncing.
// Always keeps a local copy (localStorage) so the app opens offline.
// If Supabase is configured in config.js, it also signs in by email link and syncs one row per user.

(function () {
  const KEY = 'elijahos.v1';
  const DATA = window.ELIJAH_DATA;
  const CFG = window.ELIJAH_CONFIG || {};
  const cloud = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);

  function defaults() {
    return {
      daily: {},
      logs: {},
      mins: [0, 0, 0, 0, 0],
      minsWeek: '',
      goals: DATA.subjects.map(s => s.goal),
      scores: [],
      bench: DATA.benchmarks.map(b => ({ name: b.name, base: b.base || '', latest: '', target: '' })),
      skill: { name: '', steps: ['', '', '', '', ''], cur: 0 },
      reviews: {},
      workouts: JSON.parse(JSON.stringify(DATA.defaultWorkouts || {})),
      // Session-card progress: sess[date][sessionId] = { c: { rowKey: setsTicked }, done, added }
      sess: {},
      // ids of updates/notices already dismissed
      seen: [],
      // Temporary events: { id, date, title, kind, start, end, note, replace }
      events: [],
      // Revision topics per subject. conf: 0 not rated, 1 red, 2 amber, 3 green
      topics: DATA.subjects.map(seedTopics),
      updatedAt: 0
    };
  }

  function seedTopics(sub) { return (sub.topics || []).map(name => ({ name, conf: 0 })); }

  // The first version seeded Monday with an empty Pull-ups/Dips/Hollow/Handstand table.
  // Those now live in the Upper-body session card, so drop that table if it was never filled in.
  const OLD_MONDAY = ['Pull-ups', 'Dips', 'Hollow hold', 'Handstand hold'];
  function dropOldMonday(w) {
    const m = w && w[0];
    if (Array.isArray(m) && m.length === OLD_MONDAY.length &&
        m.every((x, i) => x && x.name === OLD_MONDAY[i] && !x.sets && !x.reps)) delete w[0];
  }

  function normalise(o) {
    const s = Object.assign(defaults(), o || {});
    // Older prototype saves kept a single Sunday review; keep it as "unknown week".
    if (o && Array.isArray(o.review)) {
      if (o.review.some(Boolean)) s.reviews = Object.assign({ legacy: o.review }, s.reviews);
      delete s.review;
    }
    while (s.mins.length < DATA.subjects.length) s.mins.push(0);
    while (s.goals.length < DATA.subjects.length) s.goals.push(DATA.subjects[s.goals.length].goal);
    if (!Array.isArray(s.topics)) s.topics = [];
    while (s.topics.length < DATA.subjects.length) s.topics.push(seedTopics(DATA.subjects[s.topics.length]));
    dropOldMonday(s.workouts);
    return s;
  }

  function loadLocal() {
    try { return normalise(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return normalise(null); }
  }
  function saveLocal() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  let state = loadLocal();
  const dataListeners = [];
  const statusListeners = [];
  let sb = null;
  let pushTimer = null;

  const Store = {
    cloud,
    user: null,
    // auth: 'loading' | 'signedout' | 'signedin'
    auth: cloud ? 'loading' : 'signedin',
    // sync: 'local' | 'synced' | 'saving' | 'offline' | 'error'
    sync: cloud ? 'saving' : 'local',
    get state() { return state; },

    update(fn) {
      fn(state);
      state.updatedAt = Date.now();
      saveLocal();
      schedulePush();
    },
    onData(cb) { dataListeners.push(cb); },
    onStatus(cb) { statusListeners.push(cb); },

    async signIn(email, password) {
      if (!sb) throw new Error('Sync is not set up.');
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    // Returns true if signed in straight away, false if Supabase still wants the email confirmed.
    async signUp(email, password) {
      if (!sb) throw new Error('Sync is not set up.');
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      return !!data.session;
    },
    async signOut() {
      if (sb) await sb.auth.signOut();
    }
  };

  function emitData() { dataListeners.forEach(cb => cb()); }
  function setSync(s) { Store.sync = s; statusListeners.forEach(cb => cb()); }
  function setAuth(a) { Store.auth = a; emitData(); }

  function schedulePush() {
    if (!cloud) return;
    clearTimeout(pushTimer);
    if (!Store.user) return;
    setSync(navigator.onLine ? 'saving' : 'offline');
    pushTimer = setTimeout(push, 500);
  }

  async function push() {
    if (!sb || !Store.user) return;
    if (!navigator.onLine) { setSync('offline'); return; }
    setSync('saving');
    const { error } = await sb.from('user_state').upsert({
      user_id: Store.user.id,
      data: state,
      updated_at: new Date(state.updatedAt || Date.now()).toISOString()
    });
    setSync(error ? 'error' : 'synced');
    if (error) console.warn('Sync failed', error);
  }

  async function pull() {
    if (!sb || !Store.user) return;
    if (!navigator.onLine) { setSync('offline'); return; }
    const { data, error } = await sb.from('user_state').select('data').eq('user_id', Store.user.id).maybeSingle();
    if (error) { setSync('error'); console.warn('Sync failed', error); return; }
    const remote = data && data.data;
    const remoteAt = (remote && remote.updatedAt) || 0;
    if (remote && remoteAt > (state.updatedAt || 0)) {
      state = normalise(remote);
      saveLocal();
      setSync('synced');
      emitData();
    } else if ((state.updatedAt || 0) > remoteAt) {
      await push();
    } else {
      setSync('synced');
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function startCloud() {
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js');
    } catch (e) {
      // Offline on first open and the library is not cached yet: run on the local copy.
      Store.user = null;
      setSync('offline');
      setAuth('signedin');
      return;
    }
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    sb.auth.onAuthStateChange((_event, session) => {
      const was = Store.user && Store.user.id;
      Store.user = session ? session.user : null;
      if (Store.user) {
        if (Store.auth !== 'signedin') setAuth('signedin');
        if (was !== Store.user.id) pull();
      } else {
        setAuth('signedout');
      }
    });
    const { data } = await sb.auth.getSession();
    if (!data.session) setAuth('signedout');

    // Re-fetch when the app comes back into view, push when back online.
    document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });
    window.addEventListener('focus', () => pull());
    window.addEventListener('online', () => pull());
    window.addEventListener('offline', () => setSync('offline'));
  }

  window.ElijahStore = Store;
  window.ElijahStore.ready = cloud ? startCloud() : Promise.resolve();
})();
