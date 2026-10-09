# Promethia website (v2)

Static, multi-page site: plain HTML + one stylesheet + one small vanilla JS file. No build step is needed to deploy.

## Structure
- `index.html`: Home
- `students.html`, `parents.html`, `institutes.html`: audience pages
- `programs.html`: summer camp, weekly school program, 8 domain tracks, activities
- `curriculum.html`: week-by-week outline (DRAFT)
- `about.html`: mission, Fire of Knowledge story, philosophy, team (sample), brand marks
- `register.html`: Get Started form (opens a pre-filled email to hello@promethia.live), FAQ, login placeholder
- `404.html`
- `assets/`: `styles.css`, `main.js`, logos, hero image, favicons, og-image
- `_source/`: optional Python generator that writes the HTML files (`python3 _source/build.py`). Jekyll on GitHub Pages ignores underscore folders, so it is not published.

## Deploy (GitHub Pages)
Push the folder contents to a repo and enable Pages from the root of the default branch. All links are relative.

## Placeholders to replace before launch
Search the HTML for `sample-tag`. It marks: homepage stats, testimonials, team, summer dates, fees and pricing, the example mock cards, and the "Coming soon" login.
