# Hive Motorsports

Marketing site for Hive Motorsports — car culture, racing, and sim racing apparel brand.

## Structure

- `index.html` — single-scroll site (nav, hero, about/mission, racing/team, sim racing, shop, community, footer)
- `assets/css/style.css` — design system: color tokens, hex textures, angular livery cuts, type scale, responsive breakpoints
- `assets/js/main.js` — scroll reveals, nav scroll state, mobile menu toggle, parallax hex grid, newsletter form stub
- `assets/img/` — logo and image assets

## Running locally

No build step. Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:

```
python -m http.server 8080
```

## Adding photos

Image slots are placeholder `<div class="ph-block">` elements with the correct aspect ratio and dark overlay baked into the CSS. Replace them with `<img>` tags pointed at files in `assets/img/` to drop in real photography.
