# Handoff: Elijah OS

## Overview
Elijah OS is a personal performance dashboard for one student-athlete (football academy player preparing for exams). It has five screens: Today, Week, Revision, Progress and Log. It must run on a phone and a laptop, and the two must show the same data (synced through one account).

## About the Design Files
The files in `design/` are **design references built in HTML**. They are a working prototype that shows the intended look and behaviour. They are not production code to ship as-is.

The task is to **recreate this design as a real app**. There is no existing codebase, so choose the stack. Recommended, because the owner is a beginner and wants free hosting:

- **Vite + React** (or plain HTML/CSS/JS if preferred), one responsive web app for both phone and laptop
- **Supabase** for login and the synced database
- **GitHub Pages** (or Vercel/Netlify) for hosting
- A web app manifest so it can be installed to the phone home screen and as a desktop app (PWA)

Build **one app** that changes layout at 900px. Do not build separate phone and desktop apps.

## Fidelity
**High-fidelity.** Colours, type, spacing and interactions are final. Recreate them closely. The exact CSS is in the `<style>` block at the top of `design/Elijah OS.dc.html`; class names start with `os-`. Base tokens and the `.btn`, `.input`, `.field`, `.table`, `.tag` classes come from `design/_ds/.../styles.css`.

## How to view the prototype
Open `design/Elijah OS.dc.html` in a browser (serve the folder with any static server, e.g. `npx serve design`). Resize the window across 900px to see both layouts.

The file is a "Design Component": the markup sits between `<x-dc>` and `</x-dc>`, with `{{ name }}` holes filled by the `renderVals()` method of the class in the `<script data-dc-script>` block at the bottom. `<sc-if>` is a conditional and `<sc-for>` is a loop. Read `renderVals()` for all behaviour; it is about 100 lines.

## Layout shell

| | Phone (< 900px) | Desktop (>= 900px) |
|---|---|---|
| Container | Column, max-width 430px, centred | Row, full width |
| Navigation | Floating pill dock, fixed, 16px from bottom, width `min(390px, 100% - 32px)` | Left rail, 220px wide, sticky, full height |
| Main padding | 26px 16px 110px | 30px 34px 40px, max-width 1240px |
| Content grid | Single column, 14px gap | `g3`: `repeat(auto-fit, minmax(300px, 1fr))`; `g2`: `repeat(auto-fit, minmax(360px, 1fr))` |

**Dock** (phone): pill, 6px padding, surface at 92% with 10px backdrop blur, 1px accent border at 40%, glow `0 0 22px accent 22%` plus `0 10px 30px rgba(0,0,0,.5)`. Five icon buttons, 46px tall. Only the active tab shows its text label; the active tab has an accent 18% fill and accent-300 text.

**Rail** (desktop): "ELIJAH OS" kicker at top, five nav rows (46px tall, pill radius, icon 22px + 14px label), and at the bottom the exam countdown ("FIRST EXAM", number in mono 22px, "days").

Tabs and icons (Phosphor, regular weight): Today `house`, Week `calendar-blank`, Revision `book-open`, Progress `chart-line-up`, Log `note-pencil`.

Background: `#161826` with a 28px grid of 1px lines (text colour at 3.5% opacity) and a soft accent radial glow (10%) from the top-left.

## Screens

### 1. Today
Purpose: see today's session first, check in, tick off the day, set the workout, write the 2-line log.

Header: kicker "ELIJAH OS" (accent-300), `h3` greeting ("Good morning/afternoon/evening, Elijah" by hour: <12, <18, else), date in mono 13px (e.g. "Friday 13 November 2026"). Right side: "EXAM IN" + days count (mono 20px) + "d".

**Adjust-today banner** (only if any readiness slider <= 2): amber border and text, amber 12% fill, warning icon. Copy: **"Adjust today"** then "`<Sleep and Energy>` is/are low. Drop the session one load level or shorten it."

Column 1:
- **Session card** (hero card: accent border at 85%, outer glow). Row: kicker "SESSION · `<DAYNAME>`" and a load pill ("High load" / "Medium load" / "Low load"). Title 21px/500. Clock icon + main time in mono 15px accent-300. Sub-line in mono 12px neutral-400. Then a 7-column week strip: each day is a button with the short day name and a one-letter load pill (H/M/L). Tapping a day selects it; the whole app then shows that day.
- **Progress ring + mission**: 108px ring (r 46, stroke 5, accent, rounded cap, track neutral-800, accent drop-shadow). Centre: percentage in mono 27px and "`n` OF 4". Beside it: kicker "TODAY'S MISSION" and the mission line at 16px.
- **Checklist tiles**: 2x2 grid, 10px gap. Each tile is a button, min-height 92px, with a 26px checkbox and a label. Items: "Morning check-in", "Revision block", "Football / physical session", "2-line log". Ticked: accent border, filled glowing checkbox, label struck through in neutral-500.

Column 2:
- **Morning readiness** card: three sliders, 1 to 5, step 1: "Sleep", "Energy", "Leg freshness". Value shown at right in mono accent-300. Default 3 each. Button "Log check-in".
  - Pressing it ticks "Morning check-in" and **collapses the card to a chip**: pulse icon, "Readiness", values "4 · 3 · 4", and "Edit" (re-opens the sliders).
- **Workout** card: header row "WORKOUT | SETS | REPS". One row per exercise: name input, sets input, reps input, remove (x) button. Grid `minmax(0,1fr) 56px 56px 44px`. Empty state: "No exercises for this day yet." Button "+ Add exercise". Workouts are stored **per weekday** (the same Monday workout every Monday).
- **2-line log** card: inputs "One win" and "One fix", button "Save entry" (reads "Saved" after saving). Saving ticks "2-line log".

Column 3 (desktop only): **This week** list, the same seven rows as on the Week screen with one-letter load pills.

### 2. Week
Header: kicker "WEEK", `h3` date range ("9 Nov – 15 Nov", Monday to Sunday).
- Seven-day strip: buttons 82px tall with day name, date number (mono 16px) and one-letter load pill.
- Hero card for the selected day: day name, load pill, title, time, sub-line.
- List card of all seven days: short day (mono), title, full load pill. Selected row has an accent border and 8% fill.

### 3. Revision
Header: kicker "REVISION", `h3` "Priority order".
- **Countdown** hero card: "FIRST EXAM", "10 May 2027", days remaining in mono 40px accent-300.
- **Past-paper scores** card: line chart (SVG, viewBox 300x120, y = 110 - score, so 0 to 100%), accent line 2px with glow, 16% accent area fill, hollow points, dashed guides at 50% and 100%. Score values printed under each point. Shows the last 8 scores. "latest NN%" at top right. Below: a "Score %" input, "Add score" (accepts 0 to 100, rounds to a whole number) and "Undo" (removes the last score). Empty state: "Add your first past-paper score to start the trend line."
- **Minutes this week**: five subject cards in priority order. Each has rank (01 to 05), name, "done / goal min", a 6px progress bar (accent, glowing) and a "+15" button.

| Rank | Subject | Weekly goal (min) |
|---|---|---|
| 01 | Maths | 150 |
| 02 | Physics | 120 |
| 03 | English | 90 |
| 04 | Biology / Chemistry | 90 |
| 05 | Spanish / PE | 60 |

The weekly goals are placeholders chosen by the designer. Make them editable.

### 4. Progress
Header: kicker "PROGRESS", `h3` "Benchmarks".
- **Benchmarks table**: columns Benchmark, Base, Latest, Target. Every cell is an input (the name too). Latest is accent-300. Button "+ Add benchmark" appends an empty row. Starting rows: 10m sprint, 20m sprint, Wall passes / 60s (L), Wall passes / 60s (R), Weak-foot finishes / 10, Pull-ups (base 12), Dips, Hollow hold, Handstand hold. All other values start empty.
- **Skill of the month** hero card: a name input ("Name this month's skill") and a five-step ladder. Each step is a round numbered button (36px) plus a text input. Tapping a number marks it as the current step; earlier steps show "done", the current shows "current". Hint: "Tap a number to mark your current step."

### 5. Log
Header: kicker "LOG", `h3` day name.
- **Quick entry** hero card: "Session done" checkbox row; RPE 1 to 10 as a 5x2 grid of 46px buttons (selected one glows), with "tap 1–10" or "7 / 10" at right; fields "One win" and "One fix"; "Save entry" button. Saving ticks "2-line log" on Today, and also ticks "Football / physical session" if "Session done" is on.
- **Sunday review** card with a "Sundays" tag. Three fields: "What went well this week?", "What held me back?", "One focus for next week".
- **Month-end review** card: "opens `<last day of month>`", copy "Re-test benchmarks, review the past-paper trend, pick next month's skill.", and a disabled "Start review" button. The review flow itself is not designed yet.
- **Recent entries**: the last four saved logs (date, RPE, win, fix). Empty state: "Saved entries appear here."

### 6. Sign in
Shown when there is no session. In the prototype, switch the `screen` prop ("Sign in" / "Check email") to view these; "Skip (prototype only)" must not ship.
- Layout: one hero card centred in the viewport on the grid background, max-width 380px, padding 24px, gap 14px. Same on phone and desktop. No rail or dock.
- Content: kicker "ELIJAH OS"; `h3` "Sign in"; copy "Enter your email and we'll send you a sign-in link. Use the same email on your phone and laptop to keep them in sync."; "Email" field (placeholder "you@example.com"); primary button "Send sign-in link".
- Validation: on submit, if the email is not valid show "Enter a valid email address." in amber, 13px, under the field. It clears when the user types.

### 7. Check your email
Shown after the link is sent.
- Same centred hero card. Envelope icon (`envelope-simple`, 32px, accent); `h3` "Check your email"; copy "We sent a sign-in link to `<email>`. Open it on this device to finish signing in." (email in accent-300).
- Buttons: "Resend link" (secondary; label changes to "Link sent again"), "Use a different email" (ghost; returns to Sign in).
- Opening the link signs the user in and lands on Today.

### Account row (on Log)
A card at the bottom of the Log screen: `cloud-check` icon (accent), "Synced" with the signed-in email under it (mono 12px, truncates), and a secondary "Sign out" button that returns to Sign in. Sync states other than "Synced" (saving, offline, error) are not designed.

## Weekly schedule (content)

| Day | Session | Load | Time | Sub-line | Mission |
|---|---|---|---|---|---|
| Mon | Recovery, upper-body calisthenics, Maths revision | Low | After school · Maths 60 min | Leave 08:20 · school 08:50–15:25 | Recover well. Upper body, then one hour of Maths. |
| Tue | Astro: skill sequences | Medium | 15:45–16:45 | (same school line) | Clean touches at speed. Repeat each sequence until it is automatic. |
| Wed | Academy training | High | 18:15 · leave 18:00 | (same school line) | Bring full focus to academy. Win your first action. |
| Thu | Academy training | High | 18:15 · leave 18:00 | (same school line) | Second academy night. Quality over volume. |
| Fri | Astro: speed and match-speed reps | Medium | 15:45–16:45 | (same school line) | Short, sharp speed reps. Stop while you are still fast. |
| Sat | Past paper, then rest | Low | Morning | Rest in the afternoon | Past paper under timed conditions, then switch off. |
| Sun | Match | High | Match day | | Match day. Play simple, play fast. |

Facts from the owner: school 08:50 to 15:25 with a 30-minute commute; academy training at 18:15 with a 15-minute commute; Astro sessions 15:45 for one hour; Maths revision for one hour after school on Monday; first exam 10 May 2027. The Saturday and Sunday times and all mission lines are placeholders. **Keep this schedule in one data file** (e.g. `src/data/schedule.js`) so the owner can edit it with Claude Code, and ideally make it editable in the app too.

## Interactions & Behaviour
- Selecting a day anywhere (strip or list) sets the app-wide selected day. It defaults to today's weekday. Check-in, checklist and log data are stored per calendar date of the selected day in the current week.
- Ring percentage = ticked items x 25. The ring animates with `stroke-dashoffset .35s`.
- Ticking "Morning check-in" by hand also collapses the readiness card; unticking re-opens it.
- All inputs save as the user types. No explicit save except the log "Save entry" button, which only drives the checklist ticks and the "Saved" label.
- Hover: nav and day buttons get a 7% text-colour fill; tiles and checkboxes shift border to accent. Focus: 2px accent outline, 2px offset. Disabled: 45% opacity.
- Tap targets are at least 44px.

## State & Data Model
The prototype keeps everything in one object in `localStorage` under `elijahos.v1`. In the real app this moves to Supabase, one row set per user:

- `daily[date]`: `{ r: [sleep, energy, legs], open: bool, chk: [bool x4] }`
- `logs[date]`: `{ done: bool, rpe: 0-10, win: string, fix: string }`
- `workouts[weekday 0-6]`: `[{ name, sets, reps }]`
- `bench`: `[{ name, base, latest, target }]`
- `scores`: `[number]` (past-paper percentages, in order)
- `mins`: `[number x5]` (minutes this week per subject; needs a weekly reset, not in the prototype)
- `skill`: `{ name, steps: [string x5], cur: index }`
- `review`: `[string x3]` (Sunday review answers; should become per-week)

Local UI state only: active tab, selected day, score draft, sign-in step (signed out / link sent / signed in), email draft.

The `sampleData` flag in the prototype shows example scores and minutes when none exist. Do not ship sample data.

## Sync requirements
- Email login (magic link is enough), one user.
- Phone and laptop sign in to the same account and read/write the same data.
- Suggested Supabase shape: one `user_state` table with `user_id` and a `jsonb` column holding the object above, or one table per collection. Enable row-level security so a user only reads their own rows.
- Save on change (debounced about 500ms) and re-fetch on focus, or use Supabase Realtime.
- Keep a local copy so the app opens offline and syncs when back online.

## Design Tokens

Colours:
- Background `#161826`, surface `#232532`, text `#e9e9ed`
- Accent `#9184d9`, accent-300 (accent text) `#d2cefd`
- Neutral 200 `#e4e7f5`, 400 `#b2b6ca`, 500 `#9397ab`, 600 `#75798c`, 800 `#3f424d`, 900 `#292b31`
- Divider: text colour at 16% opacity
- Amber (warning only) `oklch(0.8 0.125 75)`
- Optional cyan theme (a switch in the prototype): accent `oklch(0.8 0.125 205)`, accent-300 `oklch(0.88 0.09 205)`. The original brief asked for cyan; the owner has been reviewing the blurple default. Confirm which to ship.

Type:
- Sans: Inter (400 and 500 only; headings 500, never bold)
- Mono (all numbers, kickers, pills): `ui-monospace, "SF Mono", Menlo, Consolas, monospace`
- Sizes: h3 25px; session title 21px; mission 16px; body 14 to 15px; table 13px; kicker 11px mono, uppercase, letter-spacing .12em; pill 11px mono

Shape and spacing:
- Radius: 8px (controls), 14px (cards, tiles), 999px (pills, dock, nav, chip)
- Card padding 16px, internal gap 10px; grid gap 14px; section gap 16px
- Card: 1px accent border at 22%, vertical surface gradient (94% to 66%)
- Hero card: accent border at 85%, `0 0 22px accent 24%` glow plus a faint inset glow
- Buttons are outlined, never filled: primary has an accent border and accent text

## Assets
- Icons: Phosphor Icons, regular weight (`@phosphor-icons/web`). Used: house, calendar-blank, book-open, chart-line-up, note-pencil, clock, warning, pulse, check, plus, x, envelope-simple, cloud-check.
- Font: Inter.
- No images.

## Files
- `design/Elijah OS.dc.html`: the hi-fi prototype (all five screens, both layouts)
- `design/support.js`: runtime needed to open the prototype
- `design/_ds/nocturne-.../styles.css`: design tokens and base component classes
- `design/_ds/nocturne-.../_ds_bundle.js`: design-system bundle the prototype loads
- `design/Elijah OS Wireframes.dc.html`: earlier wireframes, for background only

## Not designed yet
- Sync states other than "Synced" (saving, offline, error)
- Month-end review flow
- Weekly reset of revision minutes and history of past weeks
- Editing the schedule, subjects and weekly goals inside the app
- Notifications or reminders
