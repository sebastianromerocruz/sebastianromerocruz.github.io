/**
 * main.js
 * Personal site for Sebastián
 *
 * Responsibilities:
 *   1. French Republican Calendar — compute and render today's date
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
     1. French Republican Calendar
     =========================================================================
     Converts today's Gregorian date into the French Republican calendar
     introduced during the Revolution (epoch: 22 September 1792).

     Each Republican year has twelve 30-day months, each named after a season
     or natural phenomenon. Every day is also assigned a plant, animal, or
     tool (the "jour" name). Five or six complementary days (jours
     complémentaires) follow the twelfth month.

     Algorithm: Julian Day Number arithmetic, then offset from the epoch.
     ========================================================================= */

  /**
   * Republican month names, in order (index 0 = Vendémiaire = month 1).
   * @type {string[]}
   */
  var MONTHS = [
    'Vendémiaire', 'Brumaire',  'Frimaire',
    'Nivôse',      'Pluviôse',  'Ventôse',
    'Germinal',    'Floréal',   'Prairial',
    'Messidor',    'Thermidor', 'Fructidor'
  ];

  /**
   * Day names (plant/animal/tool) for each month.
   * Keyed by month number 1–12; each array has 30 entries.
   * @type {Object.<number, string[]>}
   */
  var DN = {
    1:  ['Raisin','Safran','Châtaigne','Colchique','Cheval','Balsamine','Carotte','Amaranthe','Panais','Cuve','Pomme de terre','Immortelle','Potiron','Réséda','Âne','Belle de nuit','Citrouille','Sarrasin','Tournesol','Pressoir','Chanvre','Pêche','Navet','Amaryllis','Bœuf','Aubergine','Piment','Tomate','Orge','Tonneau'],
    2:  ['Pomme','Céleri','Poire','Betterave','Oie','Héliotrope','Figue','Scorsonère','Alisier','Charrue','Salsifis','Mâcre','Topinambour','Endive','Dindon','Chervis','Cresson','Dentelaire','Grenade','Herse','Bacchante','Azerole','Garance','Orange','Faisan','Pistache','Macjonc','Coing','Cormier','Rouleau'],
    3:  ['Raiponce','Turneps','Chicorée','Nèfle','Cochon','Mâche','Chou-fleur','Miel','Genièvre','Pioche','Cire','Raifort','Cèdre','Sapin','Chevreuil','Ajonc','Cyprès','Lierre','Sabine','Hoyau','Érable à sucre','Bruyère','Roseau','Oseille','Grillon','Pignon','Liège','Truffe','Olive','Pelle'],
    4:  ['Tourbe','Houille','Bitume','Soufre','Chien','Lave','Terre végétale','Fumier','Salpêtre','Fléau','Granit','Argile','Ardoise','Grès','Lapin','Silex','Marne','Pierre à chaux','Marbre','Van','Pierre à plâtre','Sel','Fer','Cuivre','Chat','Étain','Plomb','Zinc','Mercure','Crible'],
    5:  ['Laurustine','Mousse','Fragon','Perce-neige','Taureau','Laurier-thym','Fungus','Mézéréon','Peuplier','Coignée','Ellébore','Brocoli','Laurier','Fungus','Bouc','Asaret','Alaterne','Violette','Marsault','Bêche','Narcisse','Orme','Fumeterre','Vélar','Chèvre','Épinard','Doronic','Mouron','Cerfeuil','Cordeau'],
    6:  ['Tussilage','Cornouiller','Violier','Troène','Bouc','Alaterne','Violette','Marsault','Bêche','If','Châtaignier','Ficaire','Cornouiller mâle','Pervenche','Charme','Morille','Hêtre','Abeille','Laitue','Mélèze','Ciguë','Radis','Gainier','Venus-cheveux','Cerf','Soufre','Pin sylvestre','Perce-neige','Chèvre-feuille','Fusain'],
    7:  ['Primevère','Platane','Asperge','Tulipe','Poule','Bette','Bouleau','Jonquille','Aulne','Couvoir','Pervenche','Charme','Morille','Hêtre','Abeille','Laitue','Mélèze','Ciguë','Radis','Ruche','Gainier','Orobe','Buglosse','Sénevé','Bœuf','Gouet','Aunée','Robinier','Narcisse','Omelette'],
    8:  ['Œuf','Taureau','Aubépine','Bouleau','Coucou','Champignon','Hyacinthe','Râteau','Rhubarbe','Sainfoin','Bâton d\'or','Chamedrys','Ver à soie','Consoude','Pimprenelle','Corbeille d\'or','Arroche','Sarcloir','Statice','Fritillaire','Bourrache','Valériane','Carpe','Fusain','Civette','Buglosse','Sénevé','Romarin','Pivoine','Chariot'],
    9:  ['Luzerne','Hémérocalle','Trèfle','Angélique','Canard','Mélisse','Fromental','Martagon','Serpolet','Faux','Fraise','Wormwood','Bétoine','Pois','Acacia','Caille','Œillet','Sureau','Pavot','Tilleul','Barbeau','Camomille','Chèvrefeuille','Caille-lait','Tanche','Jasmin','Verveine','Thym','Pivoine','Chariot'],
    10: ['Seigle','Avoine','Oignon','Véronique','Mulet','Romarin','Concombre','Échalote','Absinthe','Faucille','Coriandre','Artichaut','Girofle','Lavande','Chamois','Tabac','Groseille','Gesse','Cerise','Parc','Menthe','Cumin','Haricot','Orcanette','Pintade','Sauge','Ail','Vesce','Blé','Chalumeau'],
    11: ['Épeautre','Bouillon blanc','Melon','Ivraie','Bélier','Prêle','Armoise','Carthame','Mûre','Arrosoir','Panic','Salicorne','Apricot','Basilic','Brebis','Guimauve','Lin','Amande','Gentiane','Écluse','Carline','Câprier','Lentille','Aunée','Loutre','Myrte','Colza','Lupin','Coton','Moulin'],
    12: ['Prune','Millet','Lycoperdon','Escourgeon','Saumon','Tubéreuse','Sucrion','Apocyn','Réglisse','Échelle','Pastèque','Fenouil','Épine vinette','Noix','Truite','Citron','Cardère','Nerprun','Tagette','Hotte','Églantier','Noisette','Houblon','Sorgho','Écrevisse','Bigarade','Verge d\'or','Maïs','Marron','Panier']
  };

  /**
   * Names for the five (or six in leap years) complementary days.
   * @type {string[]}
   */
  var COMP = [
    'La Fête de la Vertu',
    'La Fête du Génie',
    'La Fête du Travail',
    'La Fête de l\'Opinion',
    'La Fête des Récompenses',
    'La Fête de la Révolution'
  ];

  /**
   * Convert an integer to a Roman numeral string.
   * Used to render the Republican year (e.g. CCXXXIV).
   *
   * @param  {number} n - Positive integer
   * @returns {string}
   */
  function toRoman(n) {
    var vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
    var r = '';
    for (var i = 0; i < vals.length; i++) {
      while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
    }
    return r;
  }

  /**
   * Compute the Julian Day Number for a proleptic Gregorian date.
   * Used as a common integer baseline for calendar arithmetic.
   *
   * @param  {number} y - Full year (e.g. 2024)
   * @param  {number} m - Month 1–12
   * @param  {number} d - Day 1–31
   * @returns {number} Julian Day Number
   */
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

  /** JDN of the Republican epoch (22 September 1792 Gregorian). */
  var EPOCH = jdn(1792, 9, 22);

  /**
   * Convert a JavaScript Date object into a Republican calendar date.
   *
   * @param  {Date} date
   * @returns {{ year: number, month: number|null, day: number, dayName: string, comp: boolean }|null}
   *   Returns null if the date is before the Republican epoch.
   *   comp=true indicates a complementary day (month is null in that case).
   */
  function toRep(date) {
    var days = jdn(date.getFullYear(), date.getMonth() + 1, date.getDate()) - EPOCH;
    if (days < 0) return null;

    var start = 0;
    for (var y = 1; y <= 300; y++) {
      var len = (y % 4 === 0) ? 366 : 365;
      if (days < start + len) {
        var doy = days - start;
        if (doy < 360) {
          /* Regular day within one of the twelve months */
          var mo  = Math.floor(doy / 30) + 1;
          var day = (doy % 30) + 1;
          return {
            year:    y,
            month:   mo,
            day:     day,
            dayName: (DN[mo] || [])[day - 1] || '',
            comp:    false
          };
        } else {
          /* Complementary day */
          var c = doy - 360;
          return {
            year:    y,
            month:   null,
            day:     c + 1,
            dayName: COMP[c] || '',
            comp:    true
          };
        }
      }
      start += len;
    }
    return null;
  }

  /* Render the Republican date into the DOM */
  var rep = toRep(new Date());
  if (rep) {
    var mainEl = document.getElementById('rep-date-main');
    var dayEl  = document.getElementById('rep-date-day');

    if (mainEl) {
      mainEl.textContent = rep.comp
        ? 'Jour comp. ' + rep.day + ' \u00b7 An ' + toRoman(rep.year)
        : rep.day + ' ' + MONTHS[rep.month - 1] + ' An ' + toRoman(rep.year);
    }
    if (dayEl) {
      dayEl.textContent = rep.dayName;
    }
  }


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
// var GLITCH_CHARS = '!@#$%&?/\\|_-+~^`\'"<>.,:;';
var GLITCH_CHARS = '@#$%&?/\\|+~<>:;';
// var GLITCH_CHARS = '▓▒░█';

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


/* ── 4c. Republican date periodic corruption
   ─────────────────────────────────────────────────────────────────────────
   Every 5–9 seconds, the Republican date text briefly corrupts into noise
   and then restores itself — like a terminal with a bad connection.
   Only runs if the date elements actually exist in the DOM.                */

var repMainEl = document.getElementById('rep-date-main');
var repDayEl  = document.getElementById('rep-date-day');

if (repMainEl && repDayEl) {
  var repMainOriginal = repMainEl.textContent;
  var repDayOriginal  = repDayEl.textContent;

  /**
   * Corrupt the Republican date for a short burst, then restore it.
   * Schedules itself again after a random interval.
   */
  function corruptRepDate() {
    var burstDuration = 600;  /* ms total corruption */
    var burstSteps    = 8;

    scrambleText(repMainEl, repMainOriginal, burstDuration, burstSteps);

    /* Corrupt the day name with a short offset */
    setTimeout(function () {
      scrambleText(repDayEl, repDayOriginal, burstDuration * 0.7, 6);
    }, 80);

    /* Schedule next corruption in 5–9 seconds */
    var nextDelay = 5000 + Math.random() * 4000;
    setTimeout(corruptRepDate, nextDelay);
  }

  /* First corruption fires 4 seconds after page load */
  setTimeout(corruptRepDate, 4000);
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

})();
