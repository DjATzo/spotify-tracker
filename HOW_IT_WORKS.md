# How Playcount Works

---

## Login

You click "Connect with Spotify" and get sent to Spotify to approve access. Spotify sends you back with a code. The app swaps that code for two keys — one that expires in an hour, one that never expires. Both are saved in your browser and database. You never log in again unless you log out. When the short key expires the app silently gets a new one.

---

## Where Data Lives

**Spotify** — your live listening data. The app reads from it, never writes to it.

**Firebase** — the app's own database. Stores your play counts, timestamps, settings, and your permanent login key. Grows over time.

---

## How Plays Are Counted

Each play is saved with its exact timestamp. Same song played three times = three different timestamps = three plays. Before saving, the app checks if that timestamp already exists — if it does, it skips it. So no double counting no matter how many times the sync runs.

The count is plays captured since you connected the app, not your all-time Spotify history.

---

## When the App is Open

On every load:
1. Your saved data loads from Firebase
2. The app loads your recently played, top tracks, and top artists — served from a local 5-minute cache if available, otherwise fetched from Spotify one at a time with gaps between requests
3. Everything renders on screen

Every 30 seconds while the app is visible, it checks if you played something new. If you switch to another tab or app, it slows to every 60 seconds. If a new play is detected, a banner appears at the bottom. Tap it to refresh.

---

## When the App is Closed

GitHub Actions runs every 5 minutes on GitHub's servers. It calls your Vercel function which:
1. Gets every user from Firebase
2. Uses their saved login key to access Spotify
3. Fetches their last 50 plays
4. Saves anything new to Firebase

No browser needed. Runs around the clock.

---

## When You Reopen the App

Your plays were already saved by the background sync. Everything is up to date the moment the app loads.

---

## Rate Limits

Spotify limits how many requests any app can make in a short time. If the limit is hit, the app automatically waits however long Spotify says and retries — you don't need to do anything. Only if you make an unusually large number of requests in a very short time will you notice a delay.

---

## The Only Gap

Spotify returns a maximum of 50 recent plays at once. If you play more than 50 songs in 5 minutes the oldest ones beyond 50 are lost. In practice impossible — that would be a new song every 6 seconds.

---

## The Pages

**Recently Played** — tracks in order of when you last played them. No numbers, just a timeline.

**Most Listened** — ranked by Spotify's own data. Defaults to all time, falls back to last 4 weeks if empty. Can switch to your app's play count.

**Top Artists** — your most listened artists from Spotify across different time periods.

**Stats** — breakdowns of your listening activity and patterns.

**Tools** — manage followed artists, see new releases from artists you follow.

---

## The Servers

- **Spotify** — source of your data, handles login
- **Firebase** — stores everything the app tracks
- **Vercel** — runs the sync function when called
- **GitHub Actions** — triggers the sync every 5 minutes
- **Your browser** — runs the app, polls every minute when visible
