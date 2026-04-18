# Claude Rules

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
- Never commit unless explicitly asked
- Never force push to main/master
- Never skip pre-commit hooks

## Project-Specific Notes
- The app name in index.html displays a version number as `v<number>` (e.g. `<em>v5</em>` in the logo). Increment this number by 1 on every GitHub commit.
