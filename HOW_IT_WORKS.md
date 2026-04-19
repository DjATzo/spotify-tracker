# How Playcount Works

---

## The Big Picture

Playcount is a Spotify tracking app. Its job is to record every song you listen to, count how many times you've played each one, and display your listening history in a clean interface. It does this by connecting to Spotify on your behalf and reading your listening data.

---

## Authentication — How You Log In

When you click "Connect with Spotify", the app sends you to Spotify's own login page. You approve access there, and Spotify sends you back to the app with a one-time code.

The app exchanges that code for two things:
- An **access token** — a temporary key (lasts 1 hour) that lets the app read your Spotify data
- A **refresh token** — a permanent key used to get a new access token when the old one expires

Both are stored in your browser and in the database. From this point on, you never need to log in again unless you explicitly log out.

Every time the access token expires, the app silently uses the refresh token to get a new one in the background. You never notice this happening.

---

## The Database — Where Your Data Lives

The app uses two databases:

**Spotify** holds your live listening data — recently played tracks, top tracks, top artists, followed artists. The app reads from here but never writes to it.

**Firebase** is the app's own database. It stores everything the app tracks itself — how many times you've played each song, the timestamps of each play, your settings, and your refresh token. This data persists between sessions and grows over time.

---

## How Plays Get Counted

Every time you finish a song, Spotify logs it internally. The app reads those logs and saves them to Firebase. Each play is identified by the exact timestamp it happened — so if you play the same song three times, it gets counted three times because each has a different timestamp.

The count stored in Firebase is "plays captured by this app" — not your all-time Spotify history. Plays before you connected the app are not counted.

**Deduplication** — the app never double-counts. Before saving a play, it checks whether that exact timestamp already exists in Firebase. If it does, it skips it. This means the sync can run as many times as it wants without inflating your counts.

---

## Data Flow — App Open

When you open the app and are already logged in, this is what happens in order:

1. Firebase loads your saved play history and settings
2. Seven requests go to Spotify simultaneously asking for your recently played tracks, top tracks across three time periods, and top artists across three time periods
3. The app also fetches the full list of artists you follow on Spotify
4. Once everything comes back, the screen is built and shown to you

While you stay on the page, every 30 seconds the app quietly asks Spotify for just your single most recently played track. It compares this to what is already on screen. If it is different, a banner appears at the bottom of the screen telling you new data is available. Tapping it re-fetches everything and updates the screen.

---

## Data Flow — App Closed

When the app is closed, GitHub Actions (a scheduling service on GitHub's servers) runs every 5 minutes around the clock. It calls a function on your Vercel server.

That function:
1. Reads all users from Firebase
2. For each user, uses their stored refresh token to get a fresh Spotify access token
3. Fetches their last 50 recently played tracks from Spotify
4. Checks each play against what is already saved in Firebase
5. Saves any new plays with their timestamps and updates the play count for each track

This happens completely in the background with no app, no browser, and no interaction needed.

---

## Data Flow — When You Reopen the App

When you come back to the app after it has been closed, the background sync will have already saved your plays to Firebase. When the app loads and fetches your data, those counts are already up to date. You see your accurate history immediately.

---

## The Gap Problem

Spotify only ever returns your last 50 recently played tracks at once. If you somehow play more than 50 songs in the 5 minutes between two background syncs, the oldest ones beyond 50 would be lost. In practice this is nearly impossible — 50 songs in 5 minutes would mean a new song every 6 seconds.

---

## The Two Listening Sections

**Recently Played** shows your tracks in order of when you last played them. No counts, no ranks — just a timeline of what you listened to and how long ago.

**Most Listened** shows how much you listen to each track. By default it uses Spotify's own ranking across all time. If all-time data is empty (new account), it falls back to the last 4 weeks. You can switch to your app's own play count instead, which is the number the background sync has been building up over time.

---

## The Servers Involved

- **Spotify's servers** — source of your listening data, handles login
- **Firebase** — stores your play history, counts, settings, and refresh token
- **Vercel** — hosts the sync function that runs when called
- **GitHub Actions** — calls the Vercel sync function every 5 minutes on a timer
- **Your browser** — runs the app interface and polls every 30 seconds when open
