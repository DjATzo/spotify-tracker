# Claude Rules

## Model
- Always use Claude Sonnet 4.6 by default
- If message starts with "opus:" — use Opus for that prompt only, then revert to Sonnet

## Input Interpretation
- "rule: ..." → add/update a rule in CLAUDE.md
- "future list: ..." → add to the Future Features list in CLAUDE.md
- "opus: ..." → use Opus model for that prompt only
- Anything else → treat as a code task for index.html

## Tool Usage
- Minimize tool calls — only use them when necessary

## General Behavior
- Keep responses short and direct
- No emojis unless explicitly asked
- No trailing summaries after completing tasks
- Ask before taking destructive or irreversible actions

## Code Style
- Write no comments unless the reason is non-obvious
- No unnecessary abstractions or extra features beyond what was asked
- Prefer editing existing files over creating new ones
- No error handling for scenarios that cannot happen

## Git
- Never commit unless explicitly told to — accumulate all changes until user says "commit"
- When told to commit, do it immediately without asking for confirmation
- Never force push to main/master
- Never skip pre-commit hooks

## Project-Specific Notes
- This CLAUDE.md applies only to the `spotify-tracker` folder.
- The app name in index.html displays a version number as `v<number>` (e.g. `<em>v6</em>` in the logo). Increment this number by 1 on every GitHub commit.

## Future Features

### When Spotify API is connected
- Real album art on track thumbnails
- Real artist images (circular)
- Login page with "Connect with Spotify" button
- Loading skeleton — placeholder rows while data loads
- Real play counts from listening history (calculated by storing recently played over time — needs Python backend)

### Track details
- Energy, danceability, valence (mood/happiness), tempo, acousticness shown as small bars or icons on each track row

### Navigation
- Click track row → opens Spotify (web on desktop, app on mobile)
- Click artist row → opens Spotify (web on desktop, app on mobile)

### Playback control (Spotify Premium required)
- Play/pause a track
- Skip next/previous
- Add to queue

### Playlists
- Create playlist from top tracks
- Add tracks to existing playlist

### Library
- Like/unlike a track from app
- Follow/unfollow artist from app (already in Tools — connect to real API)

### Stats
- Listening history calendar (GitHub-style contribution heatmap)
- Export stats as image (like Spotify Wrapped card)
- Mood over time (valence + energy chart over weeks)
- Stats summary card at top of page (total plays, top genre, etc.)

### Tools
- Notification listener — get notified when followed artist releases new song
- New songs: remove if listened (requires playback listener — Tier 2)
- New songs: remove if liked or disliked (requires listener — Tier 2)

### Tier 2 (paid subscription feature)
- New songs playlist — full auto-sync to Spotify
- Auto-remove songs after duration expires
- Auto-remove if listened
- Auto-remove if liked or disliked

### Other
- Search/filter bar on Tracks page
- Click track → detail page with full track stats
- Click artist → detail page with full artist stats
- Recently played: remove if listened / liked subtab filters connect to real data

### Known bugs to fix
- Page blank on first load — tracks only show after manual interaction (JS render timing issue)

### End of project
- Split into separate files (HTML, CSS, JS) so the source is not easily tracked or copied

## Files to Work On
- `index.html` — the entire app (HTML, CSS, and JS are all in this single file)
