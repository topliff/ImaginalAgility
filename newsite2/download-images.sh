#!/bin/bash
# Download all images for the Imaginal Agility site
# Run from the newsite2 directory: bash download-images.sh

mkdir -p images

curl -fSL -o images/NEW-IA-LOGO-VECTOR.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/e559fab730434cb1a71dc28d57f554b0/original/NEW-IA-LOGO-VECTOR.png"

curl -fSL -o images/NEw-HI-BOOK-COVER-V.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/a548dd5b416b4a6999572731aaa370ed/original/NEw-HI-BOOK-COVER-V.png"

curl -fSL -o images/Human-AI-Gulf.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/c8adb1a404d44d5e9598c2536c473af3/original/Human-AI-Gulf.png"

curl -fSL -o images/3TSWXdBrgvg_XWDdRt7ZL.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/generated-images/3TSWXdBrgvg_XWDdRt7ZL.png"

curl -fSL -o images/Deloitte-quote.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/3a2037c0d6324641808695ac015fa6bb/original/Deloitte-quote.png"

curl -fSL -o images/PRISM-W.O-BRAIN.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/83ff707a2b8f46fe8ed99757bfdf7c6e/original/PRISM-W.O-BRAIN.png"

curl -fSL -o images/skills-cpababilities-table.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/198616bfd767432684ba302f43c4c6b3/original/skills-cpababilities-table.png"

curl -fSL -o images/serious-concentrated-student-girl-posing-desk-against-pink-wall.jpg \
  "https://cdn.gamma.app/d8jz92w05htvuyh/a0b7a0a6ba2f4f499658a7994f8b7206/optimized/serious-concentrated-student-girl-posing-desk-against-pink-wall.jpg"

curl -fSL -o images/practice-haiq.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/09c7251ebce64081be7a4b36aba878ba/original/practice-haiq.png"

curl -fSL -o images/FnbrQWrW6SuyCEML.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/edited-images/FnbrQWrW6SuyCEML.png"

curl -fSL -o images/imagine-future-together.png \
  "https://cdn.gamma.app/d8jz92w05htvuyh/304dcff6016c405fbf2241795530e914/original/imagine-future-together.png"

curl -fSL -o images/aurora-background.png \
  "https://cdn.gamma.app/theme_images/aurora-background.77ca5e0ff46d050807e8d907d1b774f8.png"

echo ""
echo "Done. Downloaded $(ls images/ | wc -l | tr -d ' ') images to images/"
