# Imaginal Agility — Static Site

Static HTML/CSS reproduction of the Imaginal Agility landing page, built for GitHub Pages.

## Setup

1. Download images:
   ```bash
   cd newsite2
   bash download-images.sh
   ```

2. Serve locally:
   ```bash
   python3 -m http.server 8000
   ```

3. Open http://localhost:8000

## Structure

```
newsite2/
  index.html              Main page
  style.css               All styles
  download-images.sh      Fetches images from Gamma CDN
  images/                 All image assets (after download)
  README.md               This file
```

## Dependencies

- Google Fonts (Montserrat + Heebo) — loaded via CDN
- AOS (Animate On Scroll) — loaded via unpkg CDN
- No build step, no npm, no frameworks
