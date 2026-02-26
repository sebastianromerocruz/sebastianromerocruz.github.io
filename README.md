# Building A Personal Site — A Complete Programming Walkthrough

This guide explains how to build this site from scratch, in the order you would actually write it. Every design decision, algorithm, and technique is explained. No prior knowledge of D3 or calendar arithmetic is assumed.

---

## Table of Contents

1. [**Project philosophy and file structure**](#1-project-philosophy-and-file-structure)
2. [**HTML skeleton and layout**](#2-html-skeleton-and-layout)
3. [**CSS design system**](#3-css-design-system)
4. [**The panel switching system**](#4-the-panel-switching-system)
5. [**Each panel, one by one**](#5-each-panel-one-by-one)
6. [**The French Republican Calendar**](#6-the-french-republican-calendar)
7. [**The D3 flight animation**](#7-the-d3-flight-animation)
8. [**The glitch and net-art layer**](#8-the-glitch-and-net-art-layer)
9. [**The motto — 諸行無常**](#9-the-motto--諸行無常)
10. [**Entrance animations**](#10-entrance-animations)
11. [**Deployment to GitHub Pages**](#11-deployment-to-github-pages)
12. [**Swapping in real assets**](#12-swapping-in-real-assets)

---

## 1. Project philosophy and file structure

Before writing a single line, it helps to understand the governing constraints, because they explain every decision that follows.

**Bauhaus / Dieter Rams principles applied to the web:**
- One accent colour only (`#cc3320`, signal red). Everything else is near-black, off-white, or mid-grey.
- No decorative elements other than 1px hairline rules.
- Typography carries all the hierarchy. No icons, no gradients, no shadows.
- Visual weight communicates meaning. A solid black chip means *mastered*. An outlined chip means *proficient*. No numbers needed.

**Glitch / net-art layer on top:**
- The Bauhaus structure is the skeleton. The glitch effects are the surface occasionally misbehaving.
- All glitch code is additive — removing it restores the clean site completely.

**File structure:**

```
personal-site/
  index.html    — markup only; no inline styles or scripts
  style.css     — all styles, organised by section
  main.js       — all JavaScript, wrapped in a single IIFE
  assets/
    portrait.jpg  — main profile photo
    cdmx.jpg      — childhood photo (Mexico City panel)
    kyudo.gif     — kyūdō practice animation
```

Three files. No build tools, no frameworks, no npm. It opens with `file://` in a browser and deploys by pushing to GitHub.

---

## 2. HTML skeleton and layout

### 2.1 The document head

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sebastián · NYC</title>

  <!-- Fonts loaded from Google Fonts before anything renders -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400&family=IBM+Plex+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="style.css" />

  <!-- D3 must load before main.js runs, so it goes in <head> not before </body> -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
</head>
```

**Why `preconnect` for Google Fonts?** The browser opens the TCP connection to `fonts.googleapis.com` and `fonts.gstatic.com` early, before it even knows which fonts it needs. This shaves ~100–300ms off first paint on a cold connection.

**Why IBM Plex?** It has a Sans and Mono variant that are designed to work together — same x-height, compatible proportions. IBM Plex Sans handles body text; IBM Plex Mono handles all labels, codes, indices, and captions, creating a clear visual register distinction without needing size or weight changes.

**Why D3 in `<head>`?** Normally you'd put scripts before `</body>` to avoid blocking render. But D3 must be available before `main.js` runs, and `main.js` is loaded before `</body>`. If both were at the end, execution order would still be correct. D3 in `<head>` is a defensive choice — it ensures D3 is definitely available no matter when `main.js` executes.

### 2.2 The two-column layout

```html
<body>
<div class="site">
  <div class="left">  <!-- biography -->  </div>
  <div class="right"> <!-- panels -->    </div>
</div>
```

The `.site` div is a CSS grid with two equal columns:

```css
.site {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
}
```

`1fr 1fr` means "each column gets one equal fraction of the available space." `height: 100vh` makes the grid fill exactly the viewport — no scroll. `overflow: hidden` on `html, body` enforces this.

### 2.3 The script tag placement and Cloudflare

```html
<script data-cfasync="false" src="main.js"></script>
</body>
```

The script goes right before `</body>` so the DOM is fully parsed when it runs. `document.querySelectorAll('.hl')` works correctly because every `.hl` element exists before the script evaluates.

`data-cfasync="false"` is a Cloudflare-specific attribute. When a site is hosted behind Cloudflare (common with GitHub Pages through a custom domain), Cloudflare's CDN injects an email-obfuscation script to protect email addresses in the HTML from scrapers. This injected script fails in sandboxed iframes and blocks all subsequent JavaScript execution. The `data-cfasync="false"` attribute tells Cloudflare not to inject its script relative to this tag.

---

## 3. CSS design system

### 3.1 Custom properties (design tokens)

The entire colour palette and type stack live in `:root` as CSS custom properties:

```css
:root {
  --black: #0c0c0c;   /* Near-black — slightly warm, not pure #000 */
  --white: #f4f3ef;   /* Warm off-white — slightly cream           */
  --mid:   #6e6e6e;   /* Mid-grey for secondary labels             */
  --rule:  #d0cfc9;   /* Light warm-grey for hairline rules        */
  --red:   #cc3320;   /* Signal red — the single accent            */

  --sans: 'IBM Plex Sans', Helvetica, sans-serif;
  --mono: 'IBM Plex Mono', monospace;
}
```

Using `--black: #0c0c0c` instead of `#000000` and `--white: #f4f3ef` instead of `#ffffff` makes the site feel warmer and less digital — closer to ink on paper. Pure black and white on screen look harsh and clinical.

Using custom properties instead of hardcoded values means you can change the entire palette by editing six lines.

### 3.2 Reset

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
```

`box-sizing: border-box` makes `width` and `height` include padding and borders, which is almost always what you want. Without it, adding `padding: 1rem` to a `width: 100%` element overflows its container.

### 3.3 Typography hierarchy

There are exactly four typographic registers, used consistently throughout:

| Register | Properties | Used for |
|---|---|---|
| Heading | IBM Plex Sans, 500 weight, uppercase, tight tracking | Name, panel titles |
| Body | IBM Plex Sans, 300 weight, 1.85 line-height | Bio paragraphs |
| Index | IBM Plex Mono, 0.55rem, 0.18em letter-spacing, uppercase | Section numbers, panel labels |
| Caption | IBM Plex Mono, 0.52–0.58rem, 0.1em tracking | Course codes, degree years, footer links |

`clamp()` is used for fluid font sizing:

```css
font-size: clamp(2.2rem, 4vw, 3.4rem);
```

This means: *never smaller than 2.2rem, never larger than 3.4rem, and proportional to the viewport width in between.* The heading scales smoothly as the window resizes without any media queries.

### 3.4 The index strip pattern

A recurring pattern throughout the site is a small label followed by a horizontal rule that extends to fill remaining space:

```html
<div class="left-index">
  <span class="left-index-label">01 / Biography</span>
  <div class="left-index-rule"></div>
</div>
```

```css
.left-index {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.left-index-rule {
  flex: 1;         /* fills all remaining horizontal space */
  height: 1px;
  background: var(--rule);
}
```

`flex: 1` on the rule div tells flexbox to give it all the leftover space after the label has been sized. This is the entire trick — one property.

The same pattern is used for `.panel-index` inside every right-column panel, using `::after` instead of a separate element:

```css
.panel-index::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--rule);
}
```

### 3.5 The chip system

Proficiency is communicated through visual weight rather than numbers. Three chip variants:

```css
/* Fully mastered — solid fill, white text */
.chip-solid {
  background: var(--black);
  color: var(--white);
  border: 1px solid var(--black);
}

/* Working knowledge — outline only */
.chip-outline {
  background: transparent;
  color: var(--black);
  border: 1px solid var(--black);
}

/* Early-stage — ghost, grey text */
.chip-ghost {
  background: transparent;
  color: var(--mid);
  border: 1px solid var(--rule);
}
```

No `border-radius`. Bauhaus doesn't round corners.

---

## 4. The panel switching system

This is the core JavaScript mechanism. Every interactive word in the biography is a `<span>` with two attributes:

```html
<span class="hl" data-panel="professor">professor</span>
```

`class="hl"` — styles it with a dotted underline, cursor crosshair, and red-on-hover treatment.

`data-panel="professor"` — links it to `id="panel-professor"` on the right side.

### 4.1 Panel stacking

All panels occupy the same space — the entire right column — using `position: absolute; inset: 0`:

```css
.panel {
  position: absolute;
  inset: 0;              /* shorthand for top:0; right:0; bottom:0; left:0 */
  opacity: 0;
  pointer-events: none;  /* invisible panels are click-through */
}

.panel.active {
  opacity: 1;
  pointer-events: auto;
}
```

`.right` has `position: relative; overflow: hidden` to act as the containing block for all the absolutely positioned panels.

### 4.2 The switching logic

```javascript
var hls         = document.querySelectorAll('.hl');
var panels      = document.querySelectorAll('.panel');
var defaultPanel = document.getElementById('panel-default');
var flightRaf   = null; // explained in section 7

function showPanel(id) {
  panels.forEach(function (p) { p.classList.remove('active'); });
  var target = document.getElementById('panel-' + id);
  if (target) {
    target.classList.add('active');
    if (id === 'moved') { runFlight(); }
  }
}

function reset() {
  panels.forEach(function (p) { p.classList.remove('active'); });
  defaultPanel.classList.add('active');
  hls.forEach(function (h) { h.classList.remove('active'); });
  if (flightRaf !== null) { cancelAnimationFrame(flightRaf); flightRaf = null; }
}
```

`showPanel` removes `.active` from every panel, then adds it to the target. `reset` does the same but targets the default panel and also cancels any in-progress flight animation.

### 4.3 The hover events and the mouseleave problem

Naively, you might write:

```javascript
hl.addEventListener('mouseenter', function () { showPanel(hl.dataset.panel); });
hl.addEventListener('mouseleave', function () { reset(); });
```

This breaks when hovering from one word directly to another — the first word fires `mouseleave`, calling `reset()`, which briefly flashes the default panel before the second word fires `mouseenter`. The fix is to check where the cursor is going:

```javascript
hl.addEventListener('mouseleave', function (e) {
  // e.relatedTarget is the element the cursor is entering
  if (!e.relatedTarget || !e.relatedTarget.classList.contains('hl')) {
    reset();
  }
  // If moving to another .hl, do nothing — the mouseenter on the next
  // word will call showPanel() and handle the transition.
});

// Final safety net for when the cursor leaves the whole site
document.querySelector('.site').addEventListener('mouseleave', reset);
```

`e.relatedTarget` is the element the cursor moved *to* when leaving. If it's another `.hl`, we skip the reset. If it's anything else (whitespace, a different element), we reset.

### 4.4 The IIFE (Immediately Invoked Function Expression)

The entire `main.js` is wrapped in:

```javascript
(function () {
  'use strict';
  // ... all code ...
})();
```

This creates a private scope. Variables like `hls`, `panels`, `defaultPanel`, `flightRaf` are local to this function and never pollute `window`. Without this, every `var` declaration would become a global variable, which can cause hard-to-debug collisions if any third-party script uses the same names.

`'use strict'` enables strict mode, which catches common mistakes: using undeclared variables, duplicate parameter names, writing to read-only properties, etc.

**Critical rule:** Any code that references variables declared inside the IIFE must also be inside the IIFE. Code appended after `})();` is outside the scope and cannot see `hls`, `panels`, etc.

---

## 5. Each panel, one by one

### 5.1 Default panel — Bauhaus geometric mark

The background SVG is built from a small set of geometric primitives — concentric circles, cross lines, diagonal lines, and a red square at the centre. It renders at 4% opacity as a texture:

```html
<svg viewBox="0 0 120 120" aria-hidden="true">
  <circle cx="60" cy="60" r="58" stroke="#0c0c0c" stroke-width="0.5"/>
  <circle cx="60" cy="60" r="35" stroke="#0c0c0c" stroke-width="0.5"/>
  <circle cx="60" cy="60" r="12" stroke="#0c0c0c" stroke-width="0.5"/>
  <line x1="60" y1="2"  x2="60"  y2="118" stroke="#0c0c0c" stroke-width="0.5"/>
  <line x1="2"  y1="60" x2="118" y2="60"  stroke="#0c0c0c" stroke-width="0.5"/>
  <line x1="18" y1="18" x2="102" y2="102" stroke="#0c0c0c" stroke-width="0.5"/>
  <line x1="102" y1="18" x2="18" y2="102" stroke="#0c0c0c" stroke-width="0.5"/>
  <rect x="55" y="55" width="10" height="10" stroke="#cc3320" stroke-width="0.8"/>
</svg>
```

The photo frame uses an offset shadow technique — two absolutely positioned divs, the shadow one offset by 7px down and right:

```html
<div class="default-photo-frame">
  <div class="default-photo-shadow"></div>  <!-- offset border -->
  <div class="default-photo-main">          <!-- actual frame -->
    <img src="assets/portrait.jpg" ... />
  </div>
</div>
```

```css
.default-photo-shadow {
  position: absolute;
  top: 7px; left: 7px; right: -7px; bottom: -7px;
  border: 1px solid var(--rule);
}
.default-photo-main {
  position: absolute;
  inset: 0;
  border: 1px solid var(--black);
  overflow: hidden; /* clips the image */
}
```

### 5.2 Professor panel — courses list

A two-column CSS grid: course code fixed-width on the left, name filling the right:

```css
.course-item {
  display: grid;
  grid-template-columns: 7rem 1fr;
  border-top: 1px solid var(--rule);
  padding: 0.85rem 0;
}
```

`border-top` on each item creates horizontal rules between rows. `border-bottom` on the last item closes the list:

```css
.course-item:last-child { border-bottom: 1px solid var(--rule); }
```

### 5.3 Kyūdō panel — archery target

The concentric ring target is an inline SVG — five circles of decreasing radius, the innermost two in red, with crosshair lines through the centre:

```html
<svg viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="98" stroke="#0c0c0c" stroke-width="0.5"/>
  <circle cx="100" cy="100" r="78" stroke="#0c0c0c" stroke-width="0.5"/>
  <circle cx="100" cy="100" r="58" stroke="#0c0c0c" stroke-width="0.5"/>
  <circle cx="100" cy="100" r="38" stroke="#0c0c0c" stroke-width="0.5"/>
  <circle cx="100" cy="100" r="18" stroke="#cc3320" stroke-width="0.8"/>
  <circle cx="100" cy="100" r="5"  fill="#cc3320" opacity="0.6"/>
  <line x1="100" y1="2"  x2="100" y2="198" stroke="#0c0c0c" stroke-width="0.3"/>
  <line x1="2"  y1="100" x2="198" y2="100" stroke="#0c0c0c" stroke-width="0.3"/>
</svg>
```

This renders at 8% opacity as a background texture. The foreground content (kanji, label, media frame) sits on top via `position: relative; z-index: 1`.

To swap the placeholder for a real gif or video, replace the `.kyudo-placeholder` div:

```html
<!-- Option A — gif -->
<img src="assets/kyudo.gif" alt="Kyūdō practice" class="kyudo-media" />

<!-- Option B — video (autoplay, loop, muted is required for autoplay to work) -->
<video src="assets/kyudo.mp4" autoplay loop muted class="kyudo-media"></video>
```

### 5.4 Language panels

Each language panel follows an identical structure:

```html
<div class="panel lang-panel" id="panel-lang-ja">
  <div class="panel-bar"></div>
  <div class="lang-badge" aria-hidden="true">日</div>   <!-- large ghosted character -->
  <div class="lang-index">Japanese / 日本語</div>
  <p class="lang-bio">
    ... translated bio ...
    <span class="lang-word">外国語の学習</span>
    ... rest of bio ...
  </p>
  <div class="lang-footer">
    <a href="...">GitHub</a>
    <a href="...">メール</a>
  </div>
</div>
```

The `.lang-badge` is a large character positioned in the top-right corner at 4% opacity — decorative, never interactive, `aria-hidden="true"` so screen readers skip it.

`.lang-word` highlights a key phrase in red with a red border-bottom, marking the translated equivalent of the bio's interactive word.

Special characters in the bio text are HTML-encoded to be safe across all encodings. For example, `&#12371;` instead of `こ`. This is defensive practice — it works even if the file is served with the wrong character encoding header.

---

## 6. The French Republican Calendar

This is the most algorithmically interesting part of the site. The Republican Calendar was adopted during the French Revolution and used from 1793 to 1805. Each year starts at the autumnal equinox (approximately 22 September Gregorian), has twelve 30-day months each named after a natural phenomenon, and ends with five (or six in leap years) complementary days.

Every day also has a name — a plant, animal, mineral, or tool — assigned by the poet Fabre d'Églantine.

### 6.1 The Julian Day Number

To convert between calendar systems, we use Julian Day Numbers (JDN) — a continuous count of days since 1 January 4713 BCE. Any calendar date can be converted to a JDN, and JDNs can be subtracted to find the difference in days between any two dates.

```javascript
function jdn(y, m, d) {
  var a  = Math.floor((14 - m) / 12);
  var yr = y + 4800 - a;
  var mo = m + 12 * a - 3;
  return d
    + Math.floor((153 * mo + 2) / 5)
    + 365 * yr
    + Math.floor(yr / 4)
    - Math.floor(yr / 100)
    + Math.floor(yr / 400)
    - 32045;
}
```

This is a standard formula for the proleptic Gregorian calendar. The terms `Math.floor(yr/4) - Math.floor(yr/100) + Math.floor(yr/400)` implement the leap-year rule: divisible by 4 is a leap year, except centuries which are not, except centuries divisible by 400 which are.

### 6.2 The epoch and conversion

The Republican epoch — day 1 of year 1 — was 22 September 1792 Gregorian:

```javascript
var EPOCH = jdn(1792, 9, 22);
```

To find today's Republican date, compute how many days have passed since the epoch:

```javascript
function toRep(date) {
  var days = jdn(date.getFullYear(), date.getMonth() + 1, date.getDate()) - EPOCH;
  if (days < 0) return null;  // before the Revolution
```

Then iterate through Republican years to find which year the day falls in. Republican leap years follow the same 4/100/400 rule as Gregorian:

```javascript
  var start = 0;
  for (var y = 1; y <= 300; y++) {
    var len = (y % 4 === 0) ? 366 : 365;
    if (days < start + len) {
      var doy = days - start;  // day-of-year within this Republican year
```

Within the year, days 0–359 fall in the twelve 30-day months. Days 360–364 (or 365) are complementary days:

```javascript
      if (doy < 360) {
        var mo  = Math.floor(doy / 30) + 1;   // month 1–12
        var day = (doy % 30) + 1;             // day 1–30
        return { year: y, month: mo, day: day, dayName: DN[mo][day-1] };
      } else {
        var c = doy - 360;
        return { year: y, comp: true, day: c + 1, dayName: COMP[c] };
      }
    }
    start += len;
  }
}
```

### 6.3 Roman numerals for the year

Republican years are traditionally written in Roman numerals. The conversion function uses a lookup table of value-to-symbol pairs and repeatedly subtracts:

```javascript
function toRoman(n) {
  var vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  var syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  var r = '';
  for (var i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}
```

Note the subtractive notation pairs: `CM` (900), `CD` (400), `XC` (90), `XL` (40), `IX` (9), `IV` (4). These are listed before their additive equivalents so the greedy subtraction hits them first.

### 6.4 Rendering into the DOM

```javascript
var rep = toRep(new Date());
if (rep) {
  document.getElementById('rep-date-main').textContent = rep.comp
    ? 'Jour comp. ' + rep.day + ' · An ' + toRoman(rep.year)
    : rep.day + ' ' + MONTHS[rep.month - 1] + ' An ' + toRoman(rep.year);

  document.getElementById('rep-date-day').textContent = rep.dayName;
}
```

`new Date()` returns the current local date. `getMonth()` returns 0–11, so `+ 1` converts it to 1–12 for the `jdn()` function.

---

## 7. The D3 flight animation

D3 (Data-Driven Documents) is a JavaScript library for creating SVG graphics from data. Here it is used for one specific task: drawing and animating a curved flight path.

### 7.1 Setting up the SVG

The `#flight-svg` element fills the entire `.flight-panel` div. D3 selects it and gets its pixel dimensions:

```javascript
function runFlight() {
  var el = document.getElementById('flight-svg');
  var W  = el.clientWidth  || 500;
  var H  = el.clientHeight || 400;

  var svg = d3.select(el);
  svg.selectAll('*').remove();  // clear any previous render before re-running
```

`svg.selectAll('*').remove()` is essential because `runFlight()` is called on every hover — without clearing, paths and markers would pile up on each re-trigger.

### 7.2 The background grid

```javascript
var grid = svg.append('g').attr('opacity', 0.06);

for (var x = 0; x < W; x += 40) {
  grid.append('line')
    .attr('x1', x).attr('y1', 0)
    .attr('x2', x).attr('y2', H)
    .attr('stroke', '#0c0c0c').attr('stroke-width', 0.5);
}
// same for horizontal lines
```

This creates an engineering-drawing / graph-paper texture. At 6% opacity it's barely perceptible but gives the panel depth.

### 7.3 The flight path — quadratic Bézier curve

A Bézier curve is defined by start, end, and one or more control points that pull the curve toward them without the curve passing through them.

```javascript
var mx  = { x: W * 0.28, y: H * 0.68 };  // Mexico City
var ny  = { x: W * 0.72, y: H * 0.28 };  // New York

var cpx = (mx.x + ny.x) / 2;              // control point x: midpoint
var cpy = Math.min(mx.y, ny.y) - H * 0.32; // control point y: above both cities

var trail = svg.append('path')
  .attr('d', 'M' + mx.x + ',' + mx.y +
             ' Q' + cpx + ',' + cpy +
             ' ' + ny.x + ',' + ny.y)
```

The SVG path command `M x,y` moves to a point. `Q cx,cy x,y` draws a quadratic Bézier from the current point to `x,y` with control point `cx,cy`.

### 7.4 The stroke-dashoffset animation trick

The path-drawing animation uses a CSS technique: set the stroke dash length equal to the total path length, then animate the offset from the full length down to zero. This reveals the path as if it were being drawn in real time.

```javascript
var pathLength = trail.node().getTotalLength();

trail
  .attr('stroke-dasharray',  pathLength)  // one dash exactly as long as the path
  .attr('stroke-dashoffset', pathLength)  // offset = full length = invisible
  .transition()
    .duration(2200)
    .ease(d3.easeCubicInOut)
    .attr('stroke-dashoffset', 0);        // animate offset to 0 = fully visible
```

`getTotalLength()` is a native SVG DOM method that returns the arc length of any path element.

`d3.easeCubicInOut` applies an easing function — the animation starts slow, accelerates through the middle, and decelerates at the end. This feels more physical than a linear animation.

### 7.5 Animating the plane

The plane emoji travels along the path using `requestAnimationFrame`, D3's easing function, and `getPointAtLength()`:

```javascript
var pathNode = trail.node();
var startTime = null;

function animatePlane(timestamp) {
  if (!startTime) startTime = timestamp;

  var progress = Math.min((timestamp - startTime) / 2200, 1);
  var eased    = d3.easeCubicInOut(progress);  // 0→1 with ease

  var pt  = pathNode.getPointAtLength(eased * pathLength);
  var pt2 = pathNode.getPointAtLength(Math.min(eased * pathLength + 2, pathLength));

  // heading angle: arctangent of the direction between pt and pt2
  var angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;

  plane.attr('transform', 'translate(' + pt.x + ',' + pt.y + ') rotate(' + angle + ')');

  if (progress < 1) {
    flightRaf = requestAnimationFrame(animatePlane);
  } else {
    flightRaf = null;
  }
}

flightRaf = requestAnimationFrame(animatePlane);
```

`getPointAtLength(n)` returns the `{x, y}` coordinate at distance `n` along the path. By sampling two points 2px apart (`pt` and `pt2`), we get the direction of travel and use `Math.atan2` to compute the heading angle, which is then applied as a CSS rotation.

`flightRaf` stores the current `requestAnimationFrame` handle so that `reset()` can call `cancelAnimationFrame(flightRaf)` when the user hovers away mid-animation. Without this, the plane would continue moving even after the panel is hidden.

---

## 8. The glitch and net-art layer

All glitch effects are in section 4 of `main.js` and section 9 of `style.css`. They are additive — removing them restores the clean Bauhaus site.

### 8.1 CRT scan lines

A faint repeating stripe pattern overlaid on the right panel using a CSS `::after` pseudo-element:

```css
.right::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent          0px,
    transparent          2px,
    rgba(0, 0, 0, 0.018) 2px,
    rgba(0, 0, 0, 0.018) 4px
  );
  pointer-events: none;
  z-index: 100;
}
```

`repeating-linear-gradient` tiles the pattern: 2px transparent, then 2px very-slightly-dark, repeat. At 1.8% opacity it's subliminal — you notice something without being able to say what.

`pointer-events: none` ensures the pseudo-element is invisible to mouse events — clicks and hovers pass straight through it.

### 8.2 Chromatic aberration on the name heading

Real chromatic aberration (colour fringing) occurs when a lens refracts different wavelengths of light differently. The CSS approximation uses `text-shadow` to create offset coloured ghost layers:

```css
.name-heading:hover {
  text-shadow:
    -2px 0 rgba(204, 51, 32, 0.65),  /* red ghost, shifted left  */
     2px 0 rgba(0,  0, 145, 0.5);   /* blue ghost, shifted right */
}
```

The name has one shadow shifted 2px left in red and one shifted 2px right in blue. Combined with the actual black text in the middle, this simulates the three colour channels being slightly out of register.

The `glitch-name` keyframe animates this sporadically:

```css
@keyframes glitch-name {
  0%,  90%  { text-shadow: /* normal aberration */; }
  91%        { text-shadow: /* exaggerated */; clip-path: inset(20% 0 60% 0); }
  92%        { text-shadow: /* flipped */;      clip-path: inset(60% 0 10% 0); }
  93%        { text-shadow: /* normal */;        clip-path: none; }
  100%       { text-shadow: /* normal */; }
}
```

`clip-path: inset(top right bottom left)` clips the element to a rectangle. At frame 91%, only the middle 20% of the text height is visible. At frame 92%, only a different slice. This creates a brief horizontal tearing effect — a classic CRT glitch artifact.

### 8.3 The glitchy panel bar

The red bar that slides in on panel activation normally uses a smooth CSS `transition`. For the glitch version, we replace the transition with a keyframe animation that stutters:

```css
.panel.active .panel-bar {
  animation: bar-glitch 0.45s cubic-bezier(0.22,1,0.36,1) both;
}

@keyframes bar-glitch {
  0%   { transform: scaleX(0);    opacity: 1; }
  30%  { transform: scaleX(0.55); opacity: 0.4; }
  31%  { transform: scaleX(0.3);  opacity: 1; }   /* sudden jump back */
  55%  { transform: scaleX(0.8);  opacity: 0.6; }
  56%  { transform: scaleX(0.65); opacity: 1; }   /* another stutter */
  100% { transform: scaleX(1);    opacity: 1; }
}
```

The 30%→31% and 55%→56% jumps create the stutter — the bar briefly retreats before pushing forward again.

### 8.4 The panel wipe transition

Instead of a clean opacity fade, panels appear with a stepped clip-path wipe:

```css
.panel.active {
  animation: panel-wipe 0.28s steps(8, end) both;
}

@keyframes panel-wipe {
  0%   { opacity: 0; clip-path: inset(0 100% 0 0); } /* fully clipped */
  40%  { opacity: 1; clip-path: inset(0 60%  0 0); }
  70%  { opacity: 1; clip-path: inset(0 15%  0 0); }
  85%  { opacity: 1; clip-path: inset(0 25%  0 0); } /* stutter back  */
  100% { opacity: 1; clip-path: inset(0 0    0 0); } /* fully visible */
}
```

`steps(8, end)` makes the animation jump through 8 discrete states instead of interpolating smoothly — this is what creates the stepped/scanline quality. `clip-path: inset(0 X 0 0)` clips `X%` from the right, revealing the panel from left to right.

### 8.5 Text scramble on hover

When hovering a `.hl` word, its characters are briefly replaced with noise before resolving:

```javascript
var GLITCH_CHARS = '!@#$%&?/\\|_-+~^`\'"<>.,:;';

function scrambleText(el, original, duration, steps) {
  var stepMs = duration / steps;
  var frame  = 0;

  var interval = setInterval(function () {
    frame++;
    if (frame >= steps) { el.textContent = original; clearInterval(interval); return; }

    var progress = frame / steps;
    var scrambled = original.split('').map(function (ch, i) {
      if (ch === ' ' || ch === ',' || ch === '.') return ch;  // punctuation passes through
      if (progress > (original.length - i) / original.length) return ch;  // resolved
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }).join('');

    el.textContent = scrambled;
  }, stepMs);
}
```

The resolution is right-to-left: `progress > (original.length - i) / original.length`. When `progress` is 0.5 (halfway through), the right half of the word has resolved and the left half is still noise. This feels more natural than resolving left-to-right, which reads like normal text appearing.

Using keyboard characters (`!@#$%&?`) rather than block elements (`▓▒░█`) keeps the scramble subtle — the characters fit within the same typographic metrics as the original text, so the word doesn't jump in width.

### 8.6 Cursor trail

A pool of 8 `<div>` elements is created and recycled:

```javascript
var TRAIL_SIZE = 8;
var trailPool  = [];

for (var i = 0; i < TRAIL_SIZE; i++) {
  var dot = document.createElement('div');
  dot.className = 'cursor-trail';
  document.body.appendChild(dot);
  trailPool.push(dot);
}
```

On each `mousemove` (throttled to 30ms intervals), the next dot in the pool is positioned at the cursor and its animation is re-triggered:

```javascript
document.addEventListener('mousemove', function (e) {
  var dot = trailPool[trailIndex % TRAIL_SIZE];
  trailIndex++;

  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';

  dot.classList.remove('visible');
  void dot.offsetWidth;  // force reflow — without this, removing and re-adding
                         // the class in the same frame has no effect
  dot.classList.add('visible');
});
```

`void dot.offsetWidth` forces the browser to perform a synchronous layout reflow, which flushes any pending style changes. Without it, removing and immediately re-adding `visible` in the same JavaScript task is a no-op — the browser batches the changes and never sees the class as removed.

The CSS animation fades the dot out and scales it up slightly:

```css
@keyframes trail-fade {
  0%   { opacity: 0.7; transform: translate(-50%,-50%) scale(1); }
  100% { opacity: 0;   transform: translate(-50%,-50%) scale(2); }
}
```

`translate(-50%, -50%)` centres the dot on the cursor position (since `left`/`top` position the top-left corner).

### 8.7 Periodic text corruption

The Republican date and motto hex block corrupt themselves on a random schedule using the same `scrambleText` function:

```javascript
function corruptRepDate() {
  scrambleText(repMainEl, repMainOriginal, 600, 8);
  setTimeout(function () {
    scrambleText(repDayEl, repDayOriginal, 420, 6);
  }, 80);  // slight offset — the day name corrupts 80ms after the date

  var nextDelay = 5000 + Math.random() * 4000;  // 5–9 seconds
  setTimeout(corruptRepDate, nextDelay);
}

setTimeout(corruptRepDate, 4000);  // first corruption after 4 seconds
```

`Math.random() * 4000` adds up to 4 seconds of jitter to the schedule, so the corruption feels organic rather than mechanical. The motto hex block uses a 7–15 second interval, offset from the date so they never corrupt simultaneously.

---

## 9. The motto — 諸行無常

The motto is encoded as UTF-8 hex bytes in the format matching the email signature:

```
;;;;;;;;;;;;;;;;;;;;;;;
;; E8 AB B8 E8 A1 8C ;;
;; E7 84 A1 E5 B8 B8 ;;
;;;;;;;;;;;;;;;;;;;;;;;
```

`E8 AB B8` are the three bytes of `諸` in UTF-8. `E8 A1 8C` are `行`. `E7 84 A1` are `無`. `E5 B8 B8` are `常`.

**Why is one Japanese character three bytes?** UTF-8 is a variable-length encoding. ASCII characters use 1 byte. Characters in the range U+0080–U+07FF use 2 bytes. Characters in the range U+0800–U+FFFF (which includes most CJK characters) use 3 bytes. Characters in the range U+10000–U+10FFFF use 4 bytes.

The hex block is in a `<pre>` element inside the default panel:

```html
<div class="motto" id="motto">
  <pre class="motto-hex">;;;;;;;;;;;;;;;;;;;;;;;
;; E8 AB B8 E8 A1 8C ;;
;; E7 84 A1 E5 B8 B8 ;;
;;;;;;;;;;;;;;;;;;;;;;;</pre>
  <span class="motto-kanji">諸行無常</span>
</div>
```

`<pre>` preserves whitespace and newlines, which is why the ASCII art box renders correctly. Without `<pre>`, the browser would collapse all whitespace into single spaces.

The hover reveals the kanji:

```css
.motto { position: absolute; bottom: 3rem; left: 50%; transform: translateX(-50%); }

.motto-hex  { color: var(--rule); transition: color 0.2s; }
.motto:hover .motto-hex { color: var(--mid); }

.motto-kanji {
  opacity: 0;
  transform: translateY(5px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.motto:hover .motto-kanji {
  opacity: 1;
  transform: translateY(0);
}
```

`left: 50%; transform: translateX(-50%)` is the standard technique for horizontally centring an absolutely positioned element of unknown width: position the left edge at the halfway point, then shift left by half the element's own width.

---

## 10. Entrance animations

Elements fade in on page load with staggered delays:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.name-heading    { animation: fadeIn 0.5s 0.00s ease both; }
.bio             { animation: fadeIn 0.5s 0.05s ease both; }
.left-index      { animation: fadeIn 0.5s 0.00s ease both; }
.left-footer     { animation: fadeIn 0.5s 0.10s ease both; }
#republican-date { animation: fadeIn 0.5s 0.15s ease both; }
```

The shorthand `animation: fadeIn 0.5s 0.05s ease both` means:
- `fadeIn` — the keyframe name
- `0.5s` — duration
- `0.05s` — delay before starting
- `ease` — easing function
- `both` — `animation-fill-mode: both`, which means the element starts at `opacity: 0` (the `from` state) before the delay fires, and stays at `opacity: 1` (the `to` state) after finishing

Without `both`, elements would be visible at full opacity during the delay, flash to invisible when the animation starts, and then fade in. `both` prevents this.

---

## 11. Deployment to GitHub Pages

GitHub Pages serves static files directly from a repository. No server required.

**Steps:**

1. Create a repository on GitHub named `yourusername.github.io` (this makes it your root domain). Or any other name for a project page (`yourusername.github.io/site-name`).

2. Push the three files and assets folder:

```bash
git init
git add index.html style.css main.js assets/
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

3. In the repository settings, go to **Pages** and set the source to the `main` branch, root directory.

4. The site will be live at `https://yourusername.github.io` within a minute or two.

**Custom domain:** In Pages settings, add your domain. Create a `CNAME` file in the repo containing just your domain name. Point your DNS `A` records to GitHub's IP addresses (listed in their docs). HTTPS is provisioned automatically via Let's Encrypt.

---

## 12. Swapping in real assets

All three asset placeholders follow the same pattern: a hatched placeholder div with a text label. To replace each one:

**Portrait photo (`assets/portrait.jpg`):**
In `#panel-default`, find `.default-photo-main` and replace its contents:
```html
<!-- Remove this: -->
<div class="default-photo-fill"><span>assets/portrait.jpg</span></div>

<!-- Add this: -->
<img src="assets/portrait.jpg" alt="Sebastián" class="default-photo-img" />
```

**Mexico City photo (`assets/cdmx.jpg`):**
In `#panel-mexico`, find `.photo-border-main` and replace its contents:
```html
<img src="assets/cdmx.jpg" alt="Sebastián as a child in Mexico City" class="photo-img" />
```

**Kyūdō gif (`assets/kyudo.gif`):**
In `#panel-kyudo`, find `.kyudo-placeholder` and replace its contents:
```html
<!-- For a gif: -->
<img src="assets/kyudo.gif" alt="Kyūdō practice" class="kyudo-media" />

<!-- For a video (note: autoplay requires muted in most browsers): -->
<video src="assets/kyudo.mp4" autoplay loop muted playsinline class="kyudo-media"></video>
```

The CSS classes `.default-photo-img`, `.photo-img`, and `.kyudo-media` are already defined in `style.css` with `width: 100%; height: 100%; object-fit: cover; display: block` — they fill their container and crop to fit without distortion.

---

*That's everything. The site is ~2,400 lines of hand-written HTML, CSS, and JavaScript — no build tools, no dependencies beyond D3 and Google Fonts, deployable with a single `git push`.*