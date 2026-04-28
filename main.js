/**
 * main.js
 * Personal site for Sebastián
 *
 * Responsibilities:
 *   2. Panel switching — show/hide right-column panels on .hl word hover
 *   3. D3 flight animation — animated arc from Mexico City to New York
 *
 * Dependencies:
 *   - D3 v7 (loaded before this script via CDN in index.html)
 *
 * Note: the entire script is wrapped in an IIFE to avoid polluting the
 * global scope. No external state is exported.
 */

(function () {
  'use strict';


  /* =========================================================================
     2. Panel switching
     =========================================================================
     Hovering an .hl word in the biography activates the corresponding panel
     on the right side of the layout. Each .hl element carries a data-panel
     attribute whose value maps to an element id of the form "panel-{value}".

     Behaviour:
       - mouseenter on .hl  → activate matching panel, mark word active
       - mouseleave on .hl  → reset to default (photo) panel, UNLESS the
                              cursor is moving directly to another .hl word
       - mouseleave on .site → reset (safety net for edge cases)
     ========================================================================= */

  /** All hoverable words in the biography */
  var hls = document.querySelectorAll('.hl');

  /** All right-column panels (including the default) */
  var panels = document.querySelectorAll('.panel');

  /** rAF handle for the flight animation — lets us cancel mid-flight */
  var flightRaf = null;

  /** The default panel — shows the portrait photo when nothing is hovered */
  var defaultPanel = document.getElementById('panel-default');


  /**
   * Activate a named panel, deactivating all others.
   * Triggers the flight animation on the first call with id='moved'.
   *
   * @param {string} id - The panel identifier (maps to element id "panel-{id}")
   */
  function showPanel(id) {
    panels.forEach(function (p) { p.classList.remove('active'); });
    var target = document.getElementById('panel-' + id);
    if (target) {
      target.classList.add('active');
      if (id === 'moved') {
        runFlight();
      }
    }
  }

  /**
   * Reset the right column to the default (portrait) panel.
   * Removes the active state from all .hl words.
   */
  function reset() {
    panels.forEach(function (p) { p.classList.remove('active'); });
    defaultPanel.classList.add('active');
    hls.forEach(function (h) { h.classList.remove('active'); });
    /* Cancel any in-progress flight animation */
    if (flightRaf !== null) { cancelAnimationFrame(flightRaf); flightRaf = null; }
  }

  /* Attach events to each hoverable word */
  hls.forEach(function (hl) {

    hl.addEventListener('mouseenter', function () {
      /* Deactivate any previously active word, then activate this one */
      hls.forEach(function (h) { h.classList.remove('active'); });
      hl.classList.add('active');
      showPanel(hl.dataset.panel);
    });

    hl.addEventListener('mouseleave', function (e) {
      /*
       * Only reset if the cursor is leaving to somewhere other than
       * another .hl element. This keeps transitions seamless when
       * moving quickly between adjacent words.
       */
      var next = e.relatedTarget;
      if (!next || !next.classList || !next.classList.contains('hl')) {
        reset();
      }
    });

  });

  /* Final safety net: reset if cursor exits the whole site grid */
  document.querySelector('.site').addEventListener('mouseleave', reset);


  /* =========================================================================
     3. D3 flight animation
     =========================================================================
     Draws an animated flight path from Mexico City to New York City inside
     the #flight-svg element, using a quadratic Bézier curve.

     The animation resets and reruns on every hover. It consists of:
       1. A faint background grid (engineering-drawing aesthetic)
       2. A red curved path that draws itself via stroke-dashoffset animation
       3. Square city markers that fade in at each endpoint
       4. City name labels that fade in after their marker appears
       5. A ✈ emoji that travels along the path via requestAnimationFrame
     ========================================================================= */

  /**
   * Initialise and run the flight animation.
   * Called exactly once when the "moved" panel is first activated.
   */
  function runFlight() {
    var el = document.getElementById('flight-svg');
    var W  = el.clientWidth  || 500;
    var H  = el.clientHeight || 400;

    var svg = d3.select(el);
    svg.selectAll('*').remove(); /* Clear any previous render */

    /* ── Background grid ── */
    var grid = svg.append('g').attr('opacity', 0.06);

    for (var x = 0; x < W; x += 40) {
      grid.append('line')
        .attr('x1', x).attr('y1', 0)
        .attr('x2', x).attr('y2', H)
        .attr('stroke', '#0c0c0c')
        .attr('stroke-width', 0.5);
    }
    for (var y = 0; y < H; y += 40) {
      grid.append('line')
        .attr('x1', 0).attr('y1', y)
        .attr('x2', W).attr('y2', y)
        .attr('stroke', '#0c0c0c')
        .attr('stroke-width', 0.5);
    }

    /* ── City coordinates (proportional to SVG dimensions) ── */
    var mx  = { x: W * 0.28, y: H * 0.68, lbl: 'MEXICO CITY' };
    var ny  = { x: W * 0.72, y: H * 0.28, lbl: 'NEW YORK'    };

    /* Control point for the Bézier arc — sits above the midpoint */
    var cpx = (mx.x + ny.x) / 2;
    var cpy = Math.min(mx.y, ny.y) - H * 0.32;

    /* ── Flight path ── */
    var trail = svg.append('path')
      .attr('d', 'M' + mx.x + ',' + mx.y + ' Q' + cpx + ',' + cpy + ' ' + ny.x + ',' + ny.y)
      .attr('fill', 'none')
      .attr('stroke', '#cc3320')
      .attr('stroke-width', 1)
      .attr('opacity', 0.75);

    /* Animate path drawing via stroke-dashoffset trick */
    var pathLength = trail.node().getTotalLength();
    trail
      .attr('stroke-dasharray',  pathLength)
      .attr('stroke-dashoffset', pathLength)
      .transition()
        .duration(2200)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);

    /* ── City markers and labels ── */
    [mx, ny].forEach(function (city, i) {
      var cg = svg.append('g');

      /* Square dot — more Bauhaus than a circle */
      cg.append('rect')
        .attr('x', city.x - 3.5)
        .attr('y', city.y - 3.5)
        .attr('width',  7)
        .attr('height', 7)
        .attr('fill', '#cc3320')
        .attr('opacity', 0)
        .transition()
          .delay(i ? 2200 : 100) /* NYC marker appears when path arrives */
          .duration(200)
          .attr('opacity', 1);

      /* City name label */
      cg.append('text')
        .attr('x', city.x + (i ?  12 : -12))
        .attr('y', city.y + (i ? -10 :  20))
        .attr('text-anchor',      i ? 'start' : 'end')
        .attr('font-family',      "'IBM Plex Mono',monospace")
        .attr('font-size',        '0.5rem')
        .attr('letter-spacing',   '0.14em')
        .attr('fill',             '#6e6e6e')
        .attr('opacity',          0)
        .text(city.lbl)
        .transition()
          .delay(i ? 2350 : 300)
          .duration(400)
          .attr('opacity', 1);
    });

    /* ── Plane emoji — travels along the path ── */
    var plane = svg.append('g').attr('opacity', 0);
    plane.append('text')
      .attr('text-anchor',       'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size',         '0.9rem')
      .text('\u2708'); /* ✈ */

    var pathNode = trail.node();
    var startTime = null;

    /**
     * Animation loop — moves the plane along the path each frame.
     * Uses the same 2200ms duration as the path-drawing transition.
     * Stores its rAF handle in the outer flightRaf so reset() can cancel it.
     *
     * @param {DOMHighResTimeStamp} timestamp - Provided by requestAnimationFrame
     */
    function animatePlane(timestamp) {
      if (!startTime) startTime = timestamp;

      var elapsed  = timestamp - startTime;
      var progress = Math.min(elapsed / 2200, 1);
      var eased    = d3.easeCubicInOut(progress);

      /* Current position and a lookahead point for heading calculation */
      var pt  = pathNode.getPointAtLength(eased * pathLength);
      var pt2 = pathNode.getPointAtLength(Math.min(eased * pathLength + 2, pathLength));

      var angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;

      plane
        .attr('transform', 'translate(' + pt.x + ',' + pt.y + ') rotate(' + angle + ')')
        .attr('opacity', (progress > 0.02 && progress < 0.98) ? 1 : 0);

      if (progress < 1) {
        flightRaf = requestAnimationFrame(animatePlane);
      } else {
        flightRaf = null;
      }
    }

    flightRaf = requestAnimationFrame(animatePlane);
  }



/* =========================================================================
   4. Glitch & net-art effects  (EXPERIMENTAL)
   =========================================================================
   These run on top of the existing panel switching and calendar logic.
   All effects are additive — removing this section restores the clean site.

   4a. Text scramble on .hl mouseenter
   4b. Cursor trail
   4c. Republican date periodic corruption
   ========================================================================= */


/* ── 4a. Text scramble
   ─────────────────────────────────────────────────────────────────────────
   On mouseenter, the hovered word's characters are briefly replaced with
   random glitch characters before resolving back to the real text.
   Uses a stepped interval so each frame snaps rather than interpolates.   */

/** Characters pulled from to simulate data corruption */
var GLITCH_CHARS = '!@#$%&?/\\|_-+~^`\'"<>.,:;';

/**
 * Scramble an element's text briefly, then restore it.
 *
 * @param {HTMLElement} el        - The element whose text to scramble
 * @param {string}      original  - The original text content to restore
 * @param {number}      duration  - Total scramble duration in ms
 * @param {number}      steps     - Number of scramble frames
 */
function scrambleText(el, original, duration, steps) {
  var stepMs = duration / steps;
  var frame  = 0;

  var interval = setInterval(function () {
    frame++;

    if (frame >= steps) {
      /* Final frame: restore original text exactly */
      el.textContent = original;
      clearInterval(interval);
      return;
    }

    /* Each character is either corrupted or resolved depending on progress.
       Later characters resolve first (right-to-left reveal feels more glitchy). */
    var progress = frame / steps;
    var scrambled = original.split('').map(function (ch, i) {
      /* Spaces and punctuation always pass through */
      if (ch === ' ' || ch === ',' || ch === '.') return ch;
      /* Characters resolved once progress exceeds their position ratio */
      if (progress > (original.length - i) / original.length) return ch;
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
    }).join('');

    el.textContent = scrambled;
  }, stepMs);
}

/* Attach scramble to every .hl word */
hls.forEach(function (hl) {
  var originalText = hl.textContent;

  hl.addEventListener('mouseenter', function () {
    /* Run subtle text scramble */
    scrambleText(hl, originalText, 150, 5);
  });

  /* Restore original text on mouseleave in case scramble is mid-flight */
  hl.addEventListener('mouseleave', function () {
    hl.textContent = originalText;
  });
});


/* ── 4b. Cursor trail
   ─────────────────────────────────────────────────────────────────────────
   A pool of small red square divs follows the cursor and fades out.
   Using a pool (rather than creating/destroying elements) avoids GC jank.  */

var TRAIL_SIZE  = 8;   /* Number of trail dots in the pool                  */
var TRAIL_DELAY = 30;  /* ms between spawning each dot while mouse is moving */

/* Build the pool and attach to body */
var trailPool = [];
for (var ti = 0; ti < TRAIL_SIZE; ti++) {
  var dot = document.createElement('div');
  dot.className = 'cursor-trail';
  document.body.appendChild(dot);
  trailPool.push(dot);
}

var trailIndex    = 0;
var lastTrailTime = 0;

document.addEventListener('mousemove', function (e) {
  var now = Date.now();
  if (now - lastTrailTime < TRAIL_DELAY) return;
  lastTrailTime = now;

  var dot = trailPool[trailIndex % TRAIL_SIZE];
  trailIndex++;

  /* Position the dot at the cursor */
  dot.style.left = e.clientX + 'px';
  dot.style.top  = e.clientY + 'px';

  /* Re-trigger the CSS animation by toggling the class */
  dot.classList.remove('visible');
  /* Force reflow so the browser registers the class removal */
  void dot.offsetWidth;
  dot.classList.add('visible');
});


/* ── 4c. Index label periodic corruption
   ─────────────────────────────────────────────────────────────────────────
   Every 5–9 seconds the "01 / README.md" label briefly scrambles and
   restores — same terminal-noise effect as the old Republican date.        */

var indexLabelEl = document.getElementById('left-index-label');

if (indexLabelEl) {
  var indexLabelOriginal = indexLabelEl.textContent;

  /**
   * Corrupt the index label for a short burst, then restore it.
   * Schedules itself again after a random interval.
   */
  function corruptIndexLabel() {
    var burstDuration = 500;
    var burstSteps    = 7;

    scrambleText(indexLabelEl, indexLabelOriginal, burstDuration, burstSteps);

    /* Schedule next corruption in 5–9 seconds */
    var nextDelay = 5000 + Math.random() * 4000;
    setTimeout(corruptIndexLabel, nextDelay);
  }

  /* First corruption fires 4 seconds after page load */
  setTimeout(corruptIndexLabel, 4000);
}


  /* ── 4d. Motto hex block — occasional corruption
     ───────────────────────────────────────────────────────────────────────
     The hex block glitches independently of the Republican date, on a
     slower, more irregular cadence. Impermanence corrupting itself.       */

  var mottoEl = document.querySelector('.motto-hex');

  if (mottoEl) {
    var mottoOriginal = mottoEl.textContent;

    function corruptMotto() {
      scrambleText(mottoEl, mottoOriginal, 800, 10);
      /* Next corruption: 8–16 seconds */
      setTimeout(corruptMotto, 8000 + Math.random() * 8000);
    }

    /* First fires after 7 seconds — offset from the date corruption */
    setTimeout(corruptMotto, 7000);
  }


  /* =========================================================================
     5. Espresso extraction dial
     =========================================================================
     A draggable semicircular gauge visualising the under → sweet → over
     extraction spectrum. Drawn into #espresso-dial on panel activation.

     Geometry:
       The arc spans 200° (from 190° to 350° in standard SVG angles, i.e.
       roughly 8 o'clock to 4 o'clock through the bottom). The needle is
       a line from the centre to a point on the arc, rotated by dragging.

     Zones (left → right across the arc):
       0.00–0.30  Under-extracted  — sour, sharp, thin
       0.30–0.70  Well-extracted   — balanced, sweet, complex
       0.70–1.00  Over-extracted   — bitter, dry, astringent

     The default position (0.48) sits just inside the sweet zone — a good
     dial-in target.
     ========================================================================= */

  /**
   * Zone definitions — position range, label, and flavour descriptors.
   * @type {Array.<{min:number, max:number, label:string, notes:string}>}
   */
  /* Extraction zones keyed to SCA (Specialty Coffee Association) parameters.
     EXT% = extraction yield percentage. TDS = total dissolved solids.
     Ranges reflect espresso (not filter) standards.                         */
  var ZONES = [
    {
      min:   0,    max:  0.30,
      label: 'UNDER-EXTRACTED',
      ext:   '< 18%',
      tds:   '< 8%  TDS',
      lines: ['EXT%  < 18.0', 'ACIDITY  HIGH', 'BODY     THIN', 'FINISH   SHORT']
    },
    {
      min:   0.30, max:  0.70,
      label: 'OPTIMAL',
      ext:   '18–22%',
      tds:   '8–12% TDS',
      lines: ['EXT%  18–22', 'ACIDITY  BALANCED', 'BODY     FULL', 'FINISH   CLEAN']
    },
    {
      min:   0.70, max:  1.00,
      label: 'OVER-EXTRACTED',
      ext:   '> 22%',
      tds:   '> 12% TDS',
      lines: ['EXT%  > 22.0', 'ACIDITY  MUTED', 'BODY     DRYING', 'FINISH   BITTER']
    }
  ];

  /**
   * Return the zone object for a given 0–1 position.
   * @param  {number} t
   * @returns {Object}
   */
  function getZone(t) {
    for (var i = 0; i < ZONES.length; i++) {
      if (t <= ZONES[i].max) return ZONES[i];
    }
    return ZONES[ZONES.length - 1];
  }

  /**
   * Initialise and render the extraction dial.
   * Called each time the espresso panel becomes active.
   *
   * @param {number} [initPos=0.48] - Starting needle position, 0 (under) → 1 (over)
   */
  function initDial(initPos) {
    var svgEl = document.getElementById('espresso-dial');
    if (!svgEl) return;

    var pos = (initPos !== undefined) ? initPos : 0.48;

    /* ── Geometry constants ── */
    var CX     = 160;   /* SVG viewBox centre x                          */
    var CY     = 165;   /* SVG viewBox centre y (below mid for arc room)  */
    var R      = 110;   /* Arc radius                                     */
    var R_TICK = 118;   /* Outer radius for tick marks                    */
    var START  = 200;   /* Arc start angle in degrees (8 o'clock)         */
    var END    = 340;   /* Arc end  angle in degrees (4 o'clock)          */
    var SPAN   = END - START;   /* 140° total span                        */

    /** Convert degrees to radians */
    function rad(deg) { return deg * Math.PI / 180; }

    /** Point on the arc at angle deg from centre */
    function arcPt(deg) {
      return {
        x: CX + R * Math.cos(rad(deg)),
        y: CY + R * Math.sin(rad(deg))
      };
    }

    /** Point at radius r at angle deg */
    function pt(r, deg) {
      return { x: CX + r * Math.cos(rad(deg)), y: CY + r * Math.sin(rad(deg)) };
    }

    /** Convert 0–1 position to angle in degrees */
    function posToAngle(t) { return START + t * SPAN; }

    /* ── Clear and build SVG ── */
    svgEl.innerHTML = '';

    var NS = 'http://www.w3.org/2000/svg';

    function el(tag, attrs) {
      var e = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
      return e;
    }

    /* Background track — full arc in rule colour */
    var aStart = arcPt(START);
    var aEnd   = arcPt(END);
    svgEl.appendChild(el('path', {
      d: 'M ' + aStart.x + ' ' + aStart.y +
         ' A ' + R + ' ' + R + ' 0 0 1 ' + aEnd.x + ' ' + aEnd.y,
      fill: 'none',
      stroke: '#d0cfc9',
      'stroke-width': '2',
      'stroke-linecap': 'round'
    }));

    /* Zone colour arcs — under (faint blue-grey), sweet (red), over (faint) */
    var zoneColors = ['#d0cfc9', '#cc3320', '#d0cfc9'];
    ZONES.forEach(function (zone, i) {
      var a0 = posToAngle(zone.min);
      var a1 = posToAngle(zone.max);
      var p0 = arcPt(a0);
      var p1 = arcPt(a1);
      var large = (a1 - a0) > 180 ? 1 : 0;
      svgEl.appendChild(el('path', {
        d: 'M ' + p0.x + ' ' + p0.y +
           ' A ' + R + ' ' + R + ' 0 ' + large + ' 1 ' + p1.x + ' ' + p1.y,
        fill: 'none',
        stroke: zoneColors[i],
        'stroke-width': i === 1 ? '2.5' : '1.5',
        'stroke-linecap': 'butt',
        opacity: i === 1 ? '0.35' : '1'
      }));
    });

    /* Tick marks at zone boundaries and ends */
    [0, 0.30, 0.70, 1].forEach(function (t) {
      var angle = posToAngle(t);
      var inner = pt(R - 6, angle);
      var outer = pt(R + 6, angle);
      svgEl.appendChild(el('line', {
        x1: inner.x, y1: inner.y,
        x2: outer.x, y2: outer.y,
        stroke: '#0c0c0c',
        'stroke-width': '0.75'
      }));
    });

    /* Arc labels — TDS LOW / OPTIMAL / TDS HIGH */
    var labelDefs = [
      { t: 0.15, text: 'TDS LOW'  },
      { t: 0.50, text: 'OPTIMAL'  },
      { t: 0.85, text: 'TDS HIGH' }
    ];
    labelDefs.forEach(function (def) {
      var angle  = posToAngle(def.t);
      var labelR = R + 24;
      var p      = pt(labelR, angle);
      var tEl    = document.createElementNS(NS, 'text');
      tEl.setAttribute('x', p.x);
      tEl.setAttribute('y', p.y);
      tEl.setAttribute('text-anchor', 'middle');
      tEl.setAttribute('dominant-baseline', 'middle');
      tEl.setAttribute('font-family', "'IBM Plex Mono', monospace");
      tEl.setAttribute('font-size', '6.5');
      tEl.setAttribute('letter-spacing', '0.08em');
      tEl.setAttribute('fill', def.text === 'OPTIMAL' ? '#cc3320' : '#6e6e6e');
      tEl.setAttribute('opacity', def.text === 'OPTIMAL' ? '0.55' : '0.65');
      tEl.textContent = def.text;
      svgEl.appendChild(tEl);
    });

    /* Centre dot */
    svgEl.appendChild(el('circle', {
      cx: CX, cy: CY, r: '4',
      fill: '#0c0c0c'
    }));

    /* Needle group — rotated around (CX, CY) */
    var needleGroup = document.createElementNS(NS, 'g');
    needleGroup.setAttribute('transform', 'rotate(' + posToAngle(pos) + ' ' + CX + ' ' + CY + ')');

    /* Needle shaft */
    needleGroup.appendChild(el('line', {
      x1: CX, y1: CY,
      x2: CX + R - 12, y2: CY,
      stroke: '#0c0c0c',
      'stroke-width': '1.5',
      'stroke-linecap': 'round'
    }));

    /* Needle tip — small red square */
    needleGroup.appendChild(el('rect', {
      x: CX + R - 16, y: CY - 3,
      width: '6', height: '6',
      fill: '#cc3320'
    }));

    svgEl.appendChild(needleGroup);

    /* ── Update descriptors ── */
    function updateDescriptors(t) {
      var zone = getZone(t);
      var zEl  = document.getElementById('espresso-zone');
      var nEl  = document.getElementById('espresso-notes');
      /* Interpolate a live extraction % value within the zone's ext range */
      var extPct = 16 + t * 10;   /* maps 0→1 to roughly 16%→26% */
      if (zEl) {
        zEl.textContent = zone.label + '  ·  EXT ' + extPct.toFixed(1) + '%';
      }
      if (nEl) {
        /* Render each readout line separated by newlines; CSS handles display */
        nEl.textContent = zone.lines.join('\n');
      }
    }

    updateDescriptors(pos);

    /* ── Drag interaction ── */

    /**
     * Convert a pointer event to a 0–1 position on the arc.
     * Projects the pointer angle onto the START–END span and clamps to [0,1].
     *
     * @param  {PointerEvent|MouseEvent} e
     * @returns {number}
     */
    function eventToPos(e) {
      var rect   = svgEl.getBoundingClientRect();
      /* Scale from screen pixels to SVG viewBox coordinates */
      var scaleX = 320 / rect.width;
      var scaleY = 200 / rect.height;
      var svgX   = (e.clientX - rect.left) * scaleX;
      var svgY   = (e.clientY - rect.top)  * scaleY;

      /* Angle from centre in degrees, 0° = right, going clockwise */
      var angleDeg = Math.atan2(svgY - CY, svgX - CX) * 180 / Math.PI;
      /* Normalize to [0, 360) */
      if (angleDeg < 0) angleDeg += 360;

      /* Map onto the START–END span */
      var t = (angleDeg - START) / SPAN;
      return Math.max(0, Math.min(1, t));
    }

    var dragging = false;

    svgEl.addEventListener('pointerdown', function (e) {
      dragging = true;
      svgEl.setPointerCapture(e.pointerId);  /* keep receiving events if cursor leaves SVG */
    });

    svgEl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      pos = eventToPos(e);
      needleGroup.setAttribute('transform',
        'rotate(' + posToAngle(pos) + ' ' + CX + ' ' + CY + ')');
      updateDescriptors(pos);
    });

    svgEl.addEventListener('pointerup',     function () { dragging = false; });
    svgEl.addEventListener('pointercancel', function () { dragging = false; });
  }

  /* Hook initDial into the panel switching — run whenever espresso panel activates */
  var _origShowPanel = showPanel;
  showPanel = function (id) {
    _origShowPanel(id);
    if (id === 'espresso') { initDial(); }
  };


})();
