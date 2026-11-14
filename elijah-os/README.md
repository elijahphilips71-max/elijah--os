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
| `js/schedule.js` | The weekly schedule, missions, exam date, subjects and starting benchmarks. Edit this to change your week. |
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
3. Open **Authentication → URL Configuration**. Set **Site URL** to where the app lives, for example `https://YOUR-NAME.github.io/elijah-os/`. If you also test locally, add `http://localhost:8000/` under **Redirect URLs**.
4. Open **Project Settings → API**. Copy the **Project URL** and the **anon public** key into `js/config.js`.
5. Reload the app. You will see the sign-in screen. Enter your email, open the link from the email on that device, and you are in. Sign in with the same email on the other device.

The anon key is safe to put in a public website. The row-level security rules in `supabase.sql` stop anyone else from reading your data.

## Put it online for free (GitHub Pages)

1. Create a new repository on GitHub, for example `elijah-os`.
2. Upload every file in this folder to it. The `design-reference` folder is optional.
3. In the repository, go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, pick `main` and `/ (root)`, then press **Save**.
4. After a minute your app is at `https://YOUR-NAME.github.io/elijah-os/`.

When you change files later, change `VERSION` at the top of `sw.js` (for example `elijah-os-v2`) so phones load the new version.

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
- Workouts are saved per weekday, so Monday's workout is the same every Monday.
- Revision minutes start again from 0 each Monday. Weekly goals can be edited: tap the number.
- The Sunday review is saved separately for each week.

## Not built yet

These are not in the design yet: the month-end review flow (its button is disabled), a history of past weeks, editing the schedule inside the app (use `js/schedule.js` for now), and reminders.

The original design files are in `design-reference/`. `HANDOFF.md` is the full spec.
