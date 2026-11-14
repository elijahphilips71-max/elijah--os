# Elijah OS

A personal dashboard for training, revision and daily logs. One app for phone and laptop: below 900px wide it shows the phone layout with a bottom dock, and from 900px up it shows the desktop layout with a left rail.

Screens: **Today**, **Week**, **Revision**, **Progress** and **Log**.

It is plain HTML, CSS and JavaScript. There is no build step and nothing to install.

## Run it on your computer

Open a terminal in this folder and run:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000 in your browser. You can also double-click `index.html`. That works too, but offline mode and installing as an app need the server.

## Files you will edit

| File | What it holds |
|---|---|
| `js/schedule.js` | The weekly schedule, session cards (workouts, pitch sessions, revision blocks), exam date, subjects, revision topics and starting benchmarks. Edit this to change your week. |
| `js/cal.js` | Calendar helpers: Add to calendar, Download week, and the subscribable feed. |
| `calendar.ics` | The weekly plan as a calendar feed. Made from `schedule.js` by `node tools/make-calendar.js` (the deploy does this too). |
| `js/updates.js` | Updates and notices shown on Today ("New for you") and on Log ("What's new"). |
| `js/config.js` | Supabase keys for sync. Leave them empty to keep data on one device. |
| `css/app.css` | The app's layout and look. |
| `js/app.js` | The screens and what each button does. |
| `js/store.js` | Saving on the device and syncing with Supabase. |

You can ask Claude Code to make changes, for example: *"In schedule.js, move Astro on Tuesday to 16:00–17:00."*

## Where your data is saved

Without sync, everything is saved in the browser on that device (localStorage key `elijahos.v1`). Clearing the browser's site data deletes it.

With sync turned on, the app also keeps a copy on each device, so it still opens with no internet. It sends your changes about half a second after you stop typing, and fetches the latest data when you switch back to the app.

## Turn on sync (phone + laptop)

1. Create a free account and a new project at https://supabase.com.
2. In the project, open **SQL Editor**, paste in everything from `supabase.sql`, and press **Run**.
3. Open **Authentication → Sign In / Providers → Email**. Make sure Email is enabled, turn **off** "Confirm email", and save. (The app signs in with email and password, so no emails are sent.)
4. Open **Project Settings → API**. Copy the **Project URL** and the **anon public** key into `js/config.js`.
5. Reload the app. On the sign-in screen, enter your email and a password and press **Create account**. On your other device, enter the same email and password and press **Sign in**.

The anon key is safe to put in a public website. The row-level security rules in `supabase.sql` stop anyone else from reading your data.

## Put it online (GitHub Pages, updates itself)

The repository has a workflow (`.github/workflows/deploy.yml`) that publishes this folder every time `main` changes.

1. One time only: in the repository, go to **Settings → Pages**, and under "Build and deployment" set **Source** to **GitHub Actions**.
2. The app is at `https://elijahphilips71-max.github.io/elijah--os/`. That link never changes, so the home-screen app and bookmarks keep working.

To ship an update: change the files, change `VERSION` at the top of `sw.js` (for example `elijah-os-v5`), add a line to `js/updates.js` saying what changed, and merge into `main`. About a minute later the site is live. An open app shows **"A new version of Elijah OS is ready · Reload"**, and the update appears under **New for you** on Today. Your data is not touched: it lives in the browser and in Supabase, not in the files.

## Install it as an app

- **iPhone (Safari):** Share → Add to Home Screen.
- **Android (Chrome):** menu ⋮ → Install app.
- **Laptop (Chrome or Edge):** the install icon at the right end of the address bar.

## How it behaves

- Tap a day in any day strip or list to change the selected day for the whole app. It starts on today.
- Check-in, checklist and log data are saved for that calendar date in the current week.
- The progress ring is 25% for each ticked item.
- **Log check-in** ticks "Morning check-in" and folds the readiness card into a chip. Tap **Edit** to open it again.
- If Sleep, Energy or Leg freshness is set to 2 or lower, an amber "Adjust today" banner appears.
- **Save entry** ticks "2-line log". On the Log screen, if "Session done" is ticked, it also ticks "Football / physical session".
- Each day lists its **session cards** (set in `schedule.js`). Tap a card to open it, tap a row to tick a set. When every row is ticked, or you press **Finish session**, the card is done: workout and pitch cards tick "Football / physical session", revision and past-paper cards tick "Revision block".
- Revision cards pick the weakest topics of their subject (red first, then not rated, then amber). Finishing one adds its minutes to that subject. **Undo finish** takes them off again.
- On Revision, tap **Topics** under a subject to rate topics red, amber or green, add new ones, or remove them.
- The three-line button (top left on phone) opens the menu: screens, today's session cards, What's new and Revision topics. On desktop the same menu is the left sidebar.
- The arrows on Today step one day at a time, into next or last week too. The double arrows on Week step a whole week. **Back to today** jumps home.
- **Add event** (under the session cards, or in the menu) adds a one-off: a game, extra training, plans. The planner (`js/planner.js`) then reorganises that day: sessions that clash with the event (plus travel and warm-up time: 60 min before a game, 45 after) move to the nearest free slot between 15:45 and 21:15 (from 08:00 at weekends). On a game or training day, extra pitch, gym and mobility sessions are dropped. Revision that can't fit is shortened to two-thirds, or moved to the next day. Academy, match and the evening wind-down never move; a clash with them gets a warning. A **Plan reorganised** box lists every change, and **Show skipped sessions** brings back what was dropped. Nothing is saved by the planner, so deleting the event restores the normal plan. Tick **Clear the whole day's plan instead** to skip everything except the daily cards. Each event has **Add to calendar** (.ics) and **Google** buttons.
- **Calendar** (on Week, or in the menu): **Subscribe** adds the weekly plan to Apple Calendar and it updates itself when the schedule changes. For Google Calendar, copy the link and add it under Other calendars → From URL. **Download** saves the week shown, including your events, as one .ics file.
- **Reminders** (menu → Reminders, or the Log screen): turn them on once per device. While the app is open or in the background it reminds you before each timed session (your choice of 5–30 minutes; flashcards and the wind-down at their start time, academy 30 minutes before), plus the 07:30 check-in and the 21:00 log if not done yet. On iPhone, notifications need the app added to the Home Screen.
- When the app is closed, reminders come from the calendar: every session in `calendar.ics` has an alert. On iPhone, turn off "Remove Alerts" under Settings → Calendar → Accounts → Subscribed Calendars.
- `daily` in `schedule.js` adds cards to every day (flashcards, evening wind-down). Cards marked `optional` (home wall session, Saturday mobility) don't count towards "x of y done" and have no reminder. `subjects: [a, b]` makes a revision card alternate subjects week by week (Thursday English/Biology, Friday Chemistry/Maths).
- **Side hustles** (tab): projects that can change. Each has a name, a weekly target, the steps shown on its card, an ideas list and a log. The weekly side-hustle slots in `schedule.js` (`hustle`: Tue 19:45, Fri 18:45, Sun 18:00) always go to the **main** project (the first one that isn't paused). Finishing a slot logs it and uses up the next idea. Pause every project and the slots disappear from the plan. YouTube Shorts is the starting project (`sideHustles` in `schedule.js`).
- Monday Maths has `onClash: 'skip'`: it never moves. If an event clashes, it is dropped for that day.
- Revision minutes only count for the current week. Finishing a card in another week does not add minutes.
- **Extras** on Today holds any exercises not on a card. They are saved per weekday.
- Revision minutes start again from 0 each Monday. Weekly goals can be edited: tap the number.
- The Sunday review is saved separately for each week.

## Not built yet

These are not in the design yet: the month-end review flow (its button is disabled), a history of past weeks, editing the schedule inside the app (use `js/schedule.js` for now), and reminders.

The original design files are in `design-reference/`. `HANDOFF.md` is the full spec.
