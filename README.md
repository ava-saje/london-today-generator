# What Should I Do in London Today

A single-page quiz: pick a category, a vibe, a budget, and a time of day, and get back one real London spot to go do right now.

Plain HTML/CSS/JS, no build step, no dependencies.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Files

- `index.html` — markup for all screens
- `style.css` — styling
- `data.js` — the pool of London spots, tagged by category/vibe/budget/time
- `script.js` — quiz logic and matching/fallback algorithm
