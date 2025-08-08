let table;
let entries = [];
let entriesByYear = {};
let selectedYear;
let availableYears = [];
let cnv;
let hoveredEntry = null;
let bgImg;
let shapeSize, padding, startY, numCols, numRows;
let hasSelectedYear = false;
let fadeAlpha = 255;
let placeholderContainer;
let modalPreviewEntry = null;
let modalPreviewCallback = null;

const cropEdgeGroups = {
   // Root vegetables
   "carrots": "root",
   "beets": "root",
   "radish": "root",
   "daikon": "root",
   "garlic": "root",
   "onions": "root",
   "shallots": "root",
   "leeks": "root",
   "yams": "root",
   "turnips": "root",
   "potatoes": "root",
   "sweet potato": "root",
   "dryland taro": "root",
   "asparagus": "root",
   "celery": "root",
   "fennel": "root",

   // Leafy greens
   "spinach": "leafy",
   "kale": "leafy",
   "chard": "leafy",
   "swiss chard": "leafy",
   "lettuce": "leafy",
   "buttercrunch head lettuce": "leafy",
   "red salad bowl lettuce": "leafy",
   "arugula": "leafy",
   "greens": "leafy",
   "leafy greens": "leafy",
   "collards": "leafy",
   "salad greens": "leafy",
   "microgreens": "leafy",

   // Fruit-bearing vegetables (Solanaceae, cucurbits)
   "tomatoes": "fruit",
   "cherry tomatoes": "fruit",
   "peppers": "fruit",
   "bell pepper": "fruit",
   "squash": "fruit",
   "summer squash": "fruit",
   "winter squash": "fruit",
   "melons": "fruit",
   "eggplant": "fruit",
   "cucumbers": "fruit",
   "cucurbits & solanaceous crops": "fruit",
   "pumpkins": "fruit",
   "zucchini": "fruit",
   "chiles": "fruit",

   // Fruits & berries
   "berries": "berry",
   "blueberries": "berry",
   "raspberry": "berry",
   "strawberries": "berry",
   "native berry plants": "berry",
   "poha berries": "berry",
   "persimmons": "fruit",
   "peaches": "fruit",
   "pears": "fruit",
   "apples": "fruit",
   "watermelon": "fruit",

   // Herbs
   "herbs": "herb",
   "basil": "herb",
   "genovese basil": "herb",
   "cilantro": "herb",
   "parsley": "herb",

   // Grains & grasses
   "hay": "grain",
   "corn": "grain",
   "soy": "grain",
   "soybean": "grain",
   "spring wheat": "grain",
   "saffron": "grain",
   "sorghum": "grain",
   "clover": "grain",
   "grain and specialty crops": "grain",
   "alfalfa": "grain",

   // Legumes
   "beans": "legume",
   "bush beans": "legume",
   "string beans": "legume",
   "green beans": "legume",
   "peas": "legume",

   // Vining / perennial
   "grapes": "vine",
   "kiwis": "vine",
   "kiwi": "vine",
   "lavender": "vine",
   "vanilla": "vine",
   "tea": "vine",
   "mamaki tea": "vine",
   "peppercorn": "vine",
   "maile": "vine",
   "coffee": "vine",
   "protea": "vine",

   // Cruciferous vegetables
   "broccoli": "cruciferous",
   "cabbage": "cruciferous",
   "bok choy": "cruciferous",
   "kohlrabi": "cruciferous",
   "cauliflower": "cruciferous",

   // Mixed / general
   "mixed vegetables": "mixed",
   "assorted vegetables": "mixed",
   "various vegetables": "mixed",
   "vegetables": "mixed",
   "vegetables, herbs, fruits": "mixed",
   "leafy greens, berries": "mixed",
   "tomato, pepper, 20+ crop types": "mixed",
   "tomato, pepper, kale, radish, eggplant, 30+ crop types": "mixed",
   "pepper, kale, broccoli, beans, chard": "mixed",
   "peppers, tomatoes, squash, lettuce, herbs": "mixed",
   "potatoes, tomatoes, basil, beans, squash": "mixed",
   "vegetables (kohlrabi, cabbage, broccoli, kale, chard, peppers, parsley, tomatoes)": "mixed",
   "vegetables (kohlrabi, cabbage, kale, chard, peppers, basil, tomatoes)": "mixed",
   "native berry plants, vegetable crops, and forage crops": "mixed",
};

const pvWarpStyles = {
   'monofacial': 'linear',
   'bifacial': 'symmetric',
   'translucent': 'radial'
};

const combinedIcon = `
<svg
  width="16" height="16" viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
  style="vertical-align: middle; margin-left: 4px;"
>
  <defs>
    <!-- Default shadow -->
    <filter id="defaultShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="-2" dy="2" stdDeviation="0" flood-color="#0A0A0A" />
      <feDropShadow dx="-3" dy="3" stdDeviation="0" flood-color="#4C8CF5" />
    </filter>
  </defs>

  <g filter="url(#defaultShadow)">
    <!-- Rotated square frame -->
    <rect
      x="4" y="4" width="16" height="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      transform="rotate(45 12 12)"
      rx="1"
      ry="1"
    />
    <!-- Arrow shaft -->
    <line
      x1="9" y1="15"
      x2="15" y2="9"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
    />
    <!-- Arrowhead -->
    <polyline
      points="9,9 15,9 15,15"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linejoin="round"
    />
  </g>
</svg>
`;

function preload() {
   table = loadTable('data/inspire-agrivoltaics-20250702.csv', 'csv', 'header');
   bgImg = loadImage('images/pexels-tomfisk-19117245.jpg');
}

// Animate number count from start to end over 'duration' milliseconds
function animateCount(id, start, end, duration) {
   const element = document.getElementById(id);
   if (!element) return; // safety check

   let startTime = null;

   function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(progress * (end - start) + start);
      element.textContent = currentValue.toLocaleString();
      if (progress < 1) {
         requestAnimationFrame(step);
      }
   }

   requestAnimationFrame(step);
}

function updateCounters(entries) {
   if (!hasSelectedYear) {
      select('#site-count').html('');
      select('#megawatt-count').html('');
      select('#acre-count').html('');
      return;
   }

   let siteCount = entries.length;
   let megawattCount = entries.reduce((sum, e) => sum + (e.megawatts || 0), 0);
   let acreCount = entries.reduce((sum, e) => sum + (e.acres || 0), 0);

   // Get current displayed values (or use 0 if not available)
   const currentSite = parseInt(document.getElementById('site-count')?.textContent.replace(/,/g, '')) || 0;
   const currentMW = parseInt(document.getElementById('megawatt-count')?.textContent.replace(/,/g, '')) || 0;
   const currentAcres = parseInt(document.getElementById('acre-count')?.textContent.replace(/,/g, '')) || 0;

   // Animate each number
   animateCount('site-count', currentSite, siteCount, 1000);
   animateCount('megawatt-count', currentMW, Math.round(megawattCount), 1000);
   animateCount('acre-count', currentAcres, Math.round(acreCount), 1000);
}

function updatePlaceholderVisibility() {
   if (placeholderContainer) {
      if (hasSelectedYear) {
         placeholderContainer.hide();
      } else {
         placeholderContainer.show();
      }
   }
}

function setup() {
   // Parse table data
   for (let i = 0; i < table.getRowCount(); i++) {
      let name = table.getString(i, 'Name') || '';
      let activityStr = table.getString(i, 'Agrivoltaic Activities') || '';
      let activities = activityStr.split(/,\s*/).map(a => a.trim().toLowerCase()).filter(a => a.length > 0);
      let habitatStr = String(table.getString(i, 'Habitat Type') || '').trim();
      let habitat = habitatStr ? habitatStr.split(/,\s*/) : [];
      let animalTypeStr = table.getString(i, 'Animal Type') || '';
      let animalType = animalTypeStr.split(/,\s*/).map(a => a.trim().toLowerCase()).filter(a => a.length > 0);
      let cropTypeStr = table.getString(i, 'Crop Types') || '';
      let cropType = cropTypeStr ? cropTypeStr.split(/,\s*/) : [];
      let arrayTypeStr = table.getString(i, 'Type Of Array') || '';
      let year = table.getString(i, 'Year Installed') || 'Unknown';
      let megawatts = parseFloat(table.getString(i, 'System Size') || 0);
      let acres = parseFloat(table.getString(i, 'Site Size') || 0);
      let url = table.getString(i, 'URL') || '';

      let entry = {
         name,
         activities,
         habitat,
         animalType,
         cropType,
         arrayType: arrayTypeStr.trim().toLowerCase(),
         year,
         megawatts,
         acres,
         url: url.trim(),
         currentScale: 1
      };

      entries.push(entry);
      if (!entriesByYear[year]) entriesByYear[year] = [];
      entriesByYear[year].push(entry);
   }

   availableYears = Object.keys(entriesByYear).sort();
   selectedYear = null;
   hasSelectedYear = false;
   updateCounters([]);

   let canvasWidth = windowWidth * 0.9;
   let canvasHeight = min(850, windowHeight);
   cnv = createCanvas(canvasWidth, canvasHeight);
   cnv.parent('sketch-container');

   let caption = createP("Image from Pexels");
   caption.style('text-align', 'center');
   caption.class('image-caption');
   caption.parent('sketch-container');

   let timelineContainer = createDiv().id('timeline');
   timelineContainer.style('text-align', 'center');
   timelineContainer.parent('sketch-container');

   availableYears.forEach((year, index) => {
      let yearDiv = createDiv().class('timeline-year');
      yearDiv.parent(timelineContainer);

      let label = createP(year).class('year-label').addClass('suprematist-underline');
      label.parent(yearDiv);
      if (index % 2 === 0) label.addClass('above');
      else label.addClass('below');

      let node = createDiv().class('year-node');
      node.parent(yearDiv);

      label.mousePressed(() => {
         selectedYear = year;
         hasSelectedYear = true;
         updatePlaceholderVisibility();
         windowResized();
         updateCounters(entriesByYear[selectedYear]);
         if (typeof drawSites === 'function') {
            drawSites(entriesByYear[selectedYear]);
         }
         selectAll('.year-label').forEach(lbl => lbl.removeClass('active'));
         label.addClass('active');
      });
   });

   textFont('Helvetica');
   textSize(32);
   textAlign(CENTER, CENTER);
   rectMode(CENTER);
   pixelDensity(displayDensity());

   setupArrows();

   placeholderContainer = createDiv().id('placeholder-container');
   placeholderContainer.parent('sketch-container');
   placeholderContainer.style('text-align', 'center');
   placeholderContainer.style('margin-top', '420px');

   // === PLACEHOLDER CONTAINER ===
   placeholderContainer.html(`
  <div class="placeholder-text">
    Use the controls to navigate through time and reveal agrivoltaic patterns across the land.
    <div class="placeholder-subtext" style="margin-top: 35px; font-size: 22px;">
      Select a shape to reveal site details.
    </div>
  </div>
`);

   updatePlaceholderVisibility();
}

function setupArrows() {
   const prevBtn = document.getElementById('prev-year');
   const nextBtn = document.getElementById('next-year');

   if (!prevBtn || !nextBtn) return;

   // Make buttons keyboard-focusable
   prevBtn.setAttribute('tabindex', '0');
   nextBtn.setAttribute('tabindex', '0');

   prevBtn.classList.add('arrow-button');
   nextBtn.classList.add('arrow-button');

   prevBtn.addEventListener('click', () => {
      if (!hasSelectedYear) {
         updateYear(availableYears[0], 0);
      } else {
         changeYear(-1);
      }
   });

   nextBtn.addEventListener('click', () => {
      if (!hasSelectedYear) {
         updateYear(availableYears[0], 0);
      } else {
         changeYear(1);
      }
   });

   // Keyboard support
   prevBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         if (!hasSelectedYear) {
            updateYear(availableYears[0], 0);
         } else {
            changeYear(-1);
         }
      }
   });

   nextBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
         e.preventDefault();
         if (!hasSelectedYear) {
            updateYear(availableYears[0], 0);
         } else {
            changeYear(1);
         }
      }
   });

   // Swipe support (mobile)
   let touchStartX = null;

   window.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
   });

   window.addEventListener('touchend', (e) => {
      if (touchStartX === null) return;
      const touchEndX = e.changedTouches[0].screenX;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) > 50) {
         if (!hasSelectedYear) {
            updateYear(availableYears[0], 0);
         } else {
            if (deltaX > 0) changeYear(-1);
            else changeYear(1);
         }
      }
      touchStartX = null;
   });
}

function changeYear(direction) {
   let currentIndex = availableYears.indexOf(selectedYear);

   // If no year has been selected yet, select the first one and return
   if (!hasSelectedYear) {
      updateYear(availableYears[0], 0);
      return;
   }

   let nextIndex = currentIndex + direction;

   if (nextIndex < 0) nextIndex = availableYears.length - 1;
   else if (nextIndex >= availableYears.length) nextIndex = 0;

   selectedYear = availableYears[nextIndex];
   updateYear(selectedYear, nextIndex);
}

function updateLayout(lockedHeight = 850) {
   const yearEntries = entriesByYear[selectedYear] || [];
   const count = yearEntries.length;

   startY = 130;
   padding = 40;

   const availableWidth = windowWidth * 0.9;
   const maxShapeSize = 130;
   const minShapeSize = 20;

   // Shape sizes from largest to smallest
   for (let s = maxShapeSize; s >= minShapeSize; s -= 2) {
      const tentativeNumCols = max(floor((availableWidth + padding) / (s + padding)), 1);
      const tentativeNumRows = ceil(count / tentativeNumCols);
      const totalHeight = startY + tentativeNumRows * (s + padding) + 100;

      // Prioritize fitting within locked height first
      if (totalHeight <= lockedHeight) {
         shapeSize = s;
         numCols = tentativeNumCols;
         numRows = tentativeNumRows;
         return lockedHeight;
      }
   }

   // Fallback: minimum shape size
   shapeSize = minShapeSize;
   numCols = max(floor((availableWidth + padding) / (shapeSize + padding)), 1);
   numRows = ceil(count / numCols);
   return lockedHeight;
}

function windowResized() {
   let canvasWidth = windowWidth * 0.9;
   let targetHeight = windowHeight < 855 ? windowHeight : 850;

   updateLayout(targetHeight);
   resizeCanvas(canvasWidth, targetHeight);
   redraw(); // if you're using noLoop(), this ensures one frame renders
}

function renderEntryVisual(entry, pg) {
  // Ensure pg is a valid drawing context
  if (!pg || typeof pg.push !== 'function') {
    pg = window; // fallback to main canvas context
  }

  pg.push();

  const size = 140;
  const strokeW = 3;

  const activityColors = (entry.activities || []).map(getActivityColor);
  const baseColor = getActivityColor(entry.activities?.[0] || '');

  // You may want to set these explicitly here to avoid referencing undeclared vars
  const entryShapeSize = size; // or however you want to define it for previews
  const glowStrength = 20;     // or a computed value
  const isHovered = false;     // previews aren't hover states

  // Shadow + base shape
  const shadowInfo = drawSuprematistOpShadowRect(
    entryShapeSize,
    entry.megawatts,
    entry.habitat,
    0, 0,
    glowStrength,
    isHovered,
    entry.animalType?.[0] || '',
    activityColors,
    { flipped: true, pg }
  );

  if (entry.habitat?.length) {
    pg.stroke(0, 80);
    pg.strokeWeight(strokeW + 1);
    drawHabitatShape(entry.habitat, 0, 0, size, baseColor, strokeW, pg);
  }

  if (entry.activities && entry.habitat) {
    pg.stroke(0, 80);
    pg.strokeWeight(strokeW + 1);
    drawCombinedHabitatOverlay(entry.habitat, entry.activities, 0, 0, size, 1.5, pg);
  }

  if (entry.arrayType) {
    pg.push();
    pg.translate(-shadowInfo.offsetX, -shadowInfo.offsetY);
    pg.rotate(-shadowInfo.angle);
    pg.stroke(0, 80);
    pg.strokeWeight(strokeW + 1);
    drawArrayOverlay(entry.arrayType, entry.activities, 0, 0, shadowInfo.size, 1.1, 7, strokeW, pg);
    pg.pop();
  }

  if (entry.cropType?.length > 0) {
    drawCropEdgeStyle(entry.cropType, entry.activities, 0, 0, size * 1.3, strokeW, pg);
  }

  if (entry.animalType?.length > 0) {
    const yOffset = size * 0.15;
    const animalSize = size * 0.9;
    pg.stroke(0, 80);
    pg.strokeWeight(strokeW + 0.5);
    drawAnimalLine(entry.animalType, entry.activities, 0, yOffset, animalSize, strokeW, pg);
  }

  pg.pop();
}

function draw() {
   // === BACKGROUND ===
   image(bgImg, 0, 0, width, height);
   noStroke();
   rectMode(CORNER);
   fill(0, 130);
   rect(0, 0, width, height);
   rectMode(CENTER);

   const centerX = width / 2;
   const labelY = 40;
   const yearY = labelY + 25;
   const baseYearY = yearY;
   const adjustedYearY = hasSelectedYear ? baseYearY : baseYearY;

   textFont('Helvetica');
   textAlign(CENTER, BOTTOM);
   fill(255, fadeAlpha);
   textSize(28);

   let displayYear = ""; // Ensure variable is always declared

   if (hasSelectedYear) {
      // Text shadow (drawn first, slightly offset)
      fill(0, fadeAlpha); // Shadow color (black, transparent)
      text("Year Installed:", centerX + 2, labelY + 2);

      // Main text
      fill(255, fadeAlpha); // White text
      text("Year Installed:", centerX, labelY);
      textStyle(BOLD);
      textSize(36);
      displayYear = " " + selectedYear;
      textAlign(CENTER, CENTER);

      // Shadow for selected year
      fill(0, fadeAlpha);
      text(displayYear, centerX + 2, adjustedYearY + 2);

      // Main year label
      fill(255, fadeAlpha);
      text(displayYear, centerX, adjustedYearY);

      let maxLineWidth = 0;
      displayYear.split('\n').forEach(line => {
         const w = textWidth(line);
         if (w > maxLineWidth) maxLineWidth = w;
      });
      const lineWidth = maxLineWidth + 40;

      const startX = centerX - lineWidth / 2;
      const endX = centerX + lineWidth / 2;

      let baseLineY = adjustedYearY + 17;
      stroke(10, 10, 10, fadeAlpha);
      strokeWeight(3);
      line(startX, baseLineY, endX, baseLineY);
      noStroke();
   }

   // === DATA FOR SELECTED YEAR ===
   if (!hasSelectedYear || !selectedYear || !entriesByYear[selectedYear]) {
      return; // Stop early if no user interaction has occurred
   }

   const yearEntries = entriesByYear[selectedYear];
   const sortedEntries = [...yearEntries].sort((a, b) => (b.acres || 0) - (a.acres || 0));

   if (sortedEntries.length === 0) {
      fill(255, fadeAlpha);
      textAlign(CENTER, CENTER);
      textSize(20);
      text("No data available for this year.", centerX, height / 2);
      return;
   }

   // === VALUE RANGES ===
   const minSiteSize = Math.min(...sortedEntries.map(e => e.acres || 0.1));
   const maxSiteSize = Math.max(...sortedEntries.map(e => e.acres || 1));
   const maxMW = Math.max(1, ...sortedEntries.map(e => e.megawatts || 0));
   const count = sortedEntries.length;

   // === SPACING CONFIG ===
   const totalCols = max(Math.ceil(count / numRows), 2);
   const totalRows = Math.min(count, numRows);
   const availableW = width * 0.85;
   const availableH = height - startY - 70;
   const colSpacing = constrain(availableW / totalCols, shapeSize * 1.4, shapeSize * 2.4);
   const rowSpacing = constrain(availableH / totalRows, shapeSize * 1.3, shapeSize * 2.2);

   // === DRAW EACH ENTRY ===
   for (let i = 0; i < count; i++) {
      const entry = sortedEntries[i];
      const row = i % numRows;
      const col = Math.floor(i / numRows);

      // === SHAPE SIZE ===
      let entryShapeSize = map(entry.acres, minSiteSize, maxSiteSize, shapeSize * 0.6, shapeSize);
      entryShapeSize = constrain(entryShapeSize, 30, (availableH / numRows) * 0.85);
      let strokeW = map(entry.acres, minSiteSize, maxSiteSize, 2, 5.5);
      strokeW = constrain(strokeW, 2, 5.5);

      // === SCALE ANIMATION ===
      const baseScale = 1;
      const maxScale = 1.2;
      const minScale = 1.05;
      const sizeNorm = map(shapeSize, 30, 150, 0, 1);
      const hoverScale = minScale + sizeNorm * (maxScale - minScale);
      const isHovered = hoveredEntry && hoveredEntry.name === entry.name;
      const targetScale = isHovered ? hoverScale : baseScale;
      const opArtWave = 0.02 * sin(frameCount * 0.05 + col * 0.5 + row);
      entry.currentScale = lerp(entry.currentScale || baseScale, targetScale + opArtWave, 0.1);

      // === SLIGHT RANDOM SCALE VARIATION ===
      const scaleJitter = map(noise(row * 0.2 + 1000, col * 0.2 + 500), 0, 1, 0.98, 1.04);
      entry.currentScale *= scaleJitter;
      entry.currentScale = constrain(entry.currentScale, 0.95, 1.2);

      // === POSITION CALCULATION ===
      const outwardOffset = pow(Math.abs(col - totalCols / 2), 1.2) * 3;
      const horizontalWaveOffset = 10 * sin((row + col) * 0.7);
      const colStaggerOffset = (col % 2) * (shapeSize * 0.3);
      const gridWidth = (totalCols - 1) * colSpacing;
      const startX = max((width - gridWidth) / 2, 30); // ensure margin of 30px
      const cx = startX + col * colSpacing + horizontalWaveOffset;
      const bottomPadding = 65;
      const rowOffset = shapeSize * 0.15;
      const cy = height - bottomPadding - row * rowSpacing - rowOffset - entryShapeSize / 2 - colStaggerOffset - outwardOffset;


      // === EASING POSITION ===
      const jitterX = map(noise(i * 0.2, frameCount * 0.002), 0, 1, -4, 4);
      const jitterY = map(noise(i * 0.2 + 500, frameCount * 0.002), 0, 1, -3, 3);
      const targetX = cx + jitterX;
      const targetY = cy + jitterY;
      entry._screenX = lerp(entry._screenX || targetX, targetX, 0.1);
      entry._screenY = lerp(entry._screenY || targetY, targetY, 0.1);

      // === ANGLE OFFSET ===
      const baseAngle = (col % 2 === 0) ? PI / 36 : -PI / 36;
      const randomAngle = map(noise(row * 0.3, col * 0.2), 0, 1, -PI / 90, PI / 90);

      // === DRAW ENTRY ===
      push();
      translate(entry._screenX, entry._screenY);
      rotate(baseAngle + randomAngle);
      scale(entry.currentScale);
      entry._radius = entryShapeSize * entry.currentScale * 0.5;

      const activityColors = (entry.activities || []).map(getActivityColor);
      const baseColor = getActivityColor(entry.activities?.[0] || '');
      const glowStrength = isHovered ?
         map(entry.megawatts || 0, 0, maxMW, 5, 30) * 1.5 :
         map(entry.megawatts || 0, 0, maxMW, 5, 30);

      const shadowInfo = drawSuprematistOpShadowRect(
         entryShapeSize,
         entry.megawatts,
         entry.habitat,
         0, 0,
         glowStrength,
         isHovered,
         entry.animalType?.[0] || '',
         activityColors,
         true // flipped orientation
      );

      if (entry.habitat?.length) {
         stroke(0, 80);
         strokeWeight(strokeW + 1.5);
         drawHabitatShape(entry.habitat, 0, 0, entryShapeSize, baseColor, strokeW, window);
      }

      if (entry.activities && entry.habitat) {
         stroke(0, 80);
         strokeWeight(strokeW + 1.5);
         drawCombinedHabitatOverlay(entry.habitat, entry.activities, 0, 0, entryShapeSize, 2, window);
      }

      if (entry.arrayType) {
         push();
         translate(-shadowInfo.offsetX, -shadowInfo.offsetY);
         rotate(-shadowInfo.angle);
         stroke(0, 80);
         strokeWeight(strokeW + 1.5);
         drawArrayOverlay(entry.arrayType, entry.activities, 0, 0, shadowInfo.size, 1.2, 10, strokeW, window);
         pop();
      }

      if (entry.cropType?.length > 0) {
         drawCropEdgeStyle(entry.cropType, entry.activities, 0, 0, entryShapeSize * 1.35, strokeW, window);
      }

      if (entry.animalType?.length > 0) {
         const yOffset = entryShapeSize * 0.15;
         const animalSize = entryShapeSize * 0.9;
         stroke(0, 80);
         strokeWeight(strokeW + 1.1);
         drawAnimalLine(entry.animalType, entry.activities, 0, yOffset, animalSize, strokeW, window);
         strokeWeight(strokeW);
         drawAnimalLine(entry.animalType, entry.activities, 0, yOffset, animalSize, strokeW, window);
      }
      pop(); // end entry group
   }

   if (modalPreviewEntry && modalPreviewCallback) {
   const entry = modalPreviewEntry;

   const scaleFactor = 0.2; 

   const pg = createGraphics(200, 200);
   pg.pixelDensity(1);
   pg.clear();

   pg.translate(100, 100); 
   pg.scale(scaleFactor);

   renderEntryVisual(entry, pg);

   setTimeout(() => {
      modalPreviewCallback(pg.canvas.toDataURL());
      modalPreviewEntry = null;
      modalPreviewCallback = null;
   }, 10);
   }
}

function showModalWithEntry(entry) {
   modalPreviewEntry = entry;
   modalPreviewCallback = (imgDataURL) => {
   insertModalContent(entry, imgDataURL); // New helper
};
}

function insertModalContent(entry, visualImg) {
  const modalTitle = document.getElementById('siteModalLabel');
  const modalBody = document.getElementById('siteModalBody');

  const capitalizeWords = (str) => str.replace(/\b\w/g, c => c.toUpperCase());
  const formatArray = (arr) => Array.isArray(arr) ? arr.map(s => capitalizeWords(s)).join(', ') : String(arr);

  let lines = [];
  if (entry.activities?.length)
    lines.push(`<strong>Agrivoltaic Activities:</strong> ${formatArray(entry.activities)}`);
  if (!isNaN(entry.megawatts))
    lines.push(`<strong>System Size:</strong> ${entry.megawatts} MW`);
  if (!isNaN(entry.acres))
    lines.push(`<strong>Site Size:</strong> ${entry.acres} Acres`);
  if (entry.year)
    lines.push(`<strong>Year Installed:</strong> ${entry.year}`);
  if (entry.arrayType)
    lines.push(`<strong>Type of Array:</strong> ${capitalizeWords(entry.arrayType)}`);
  if (entry.habitat?.length)
    lines.push(`<strong>Habitat Types:</strong> ${formatArray(entry.habitat)}`);
  if (entry.cropType?.length)
    lines.push(`<strong>Crop Type:</strong> ${formatArray(entry.cropType)}`);
  if (entry.animalType?.length)
    lines.push(`<strong>Animal Type:</strong> ${formatArray(entry.animalType)}`);

  modalTitle.innerHTML = entry.url
    ? `<a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="hyperlink">
         ${entry.name}${combinedIcon}
       </a>`
    : entry.name;

  modalBody.querySelectorAll('.dynamic-content').forEach(el => el.remove());

  const wrapper = document.createElement('div');
  wrapper.classList.add('dynamic-content');

  wrapper.innerHTML = `
     <div class="modal-site-visual-wrapper">
       <div class="col-md-4 float-right">
       <figure class="modal-site-visual">
         <img class="modal-site-thumbnail" src="${visualImg}" alt="Encoded visual of ${entry.name}" />
         </figure>
      </div>
       <div class="modal-site-details">
         ${lines.map(line => `<p>${line}</p>`).join('')}
       </div>
     </div>
   `;

  const toggleLegend = document.getElementById('toggle-legend');
  modalBody.insertBefore(wrapper, toggleLegend);

  const siteModal = new bootstrap.Modal(document.getElementById('siteModal'));
  siteModal.show();
}

document.getElementById('toggle-legend').addEventListener('click', function () {
   const legend = document.getElementById('encoding-legend');
   const expanded = this.getAttribute('aria-expanded') === 'true';

   legend.hidden = expanded;
   this.setAttribute('aria-expanded', String(!expanded));
   this.classList.toggle('collapsed', expanded);

   this.firstChild.textContent = !expanded ?
      'Hide Visual Encoding Guide' :
      'Show Visual Encoding Guide';
});

function mouseMoved() {
   if ('ontouchstart' in window) return;

   const modalElement = document.getElementById('siteModal');
   if (modalElement && modalElement.classList.contains('show')) {
      hoveredEntry = null;
      cursor('default');
      return;
   }

   let yearEntries = entriesByYear[selectedYear] || [];
   hoveredEntry = null;
   let hovering = false;

   for (let entry of yearEntries) {
      const dx = mouseX - (entry._screenX || 0);
      const dy = mouseY - (entry._screenY || 0);
      const r = entry._radius || 30;

      if (dx * dx + dy * dy < r * r) {
         hoveredEntry = entry;
         hovering = true;
         break;
      }
   }

   cursor(hovering ? 'pointer' : 'default');
}

function mousePressed() {
   const modalElement = document.getElementById('siteModal');
   if (modalElement && modalElement.classList.contains('show')) {
      return; // Prevent clicking sites while modal is open
   }

   const yearEntries = entriesByYear[selectedYear] || [];

   for (let entry of yearEntries) {
      const dx = mouseX - (entry._screenX || 0);
      const dy = mouseY - (entry._screenY || 0);
      const r = entry._radius || 30;

      if (dx * dx + dy * dy < r * r) {
         showModalWithEntry(entry);
         break;
      }
   }
}

function keyPressed() {
   const yearEntries = entriesByYear[selectedYear];
   if (!yearEntries || yearEntries.length === 0) return;

   const modalElement = document.getElementById('siteModal');
   const modalVisible = modalElement.classList.contains('show');

   if (keyCode === ESCAPE && modalVisible) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) modalInstance.hide();
      return;
   }

   // Global year navigation
   if (!modalVisible && (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
      if (!hasSelectedYear) {
         updateYear(availableYears[0], 0);
         return;
      }

      const currentYearIndex = availableYears.indexOf(selectedYear);
      const delta = keyCode === RIGHT_ARROW ? 1 : -1;
      const newIndex = constrain(currentYearIndex + delta, 0, availableYears.length - 1);

      if (newIndex !== currentYearIndex) {
         updateYear(availableYears[newIndex], newIndex);
      }
      return;
   }


   // Global year navigation
   if (!modalVisible && (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
      const currentYearIndex = availableYears.indexOf(selectedYear);
      const delta = keyCode === RIGHT_ARROW ? 1 : -1;
      const newIndex = constrain(currentYearIndex + delta, 0, availableYears.length - 1);
      if (newIndex !== currentYearIndex) {
         updateYear(availableYears[newIndex], newIndex); // Centralized logic
      }
      return;
   }

   if (!modalVisible && keyCode === HOME) {
      updateYear(availableYears[0], 0);
      return;
   }

   if (!modalVisible && keyCode === END) {
      updateYear(availableYears[availableYears.length - 1], availableYears.length - 1);
      return;
   }
}

function updateYear(year, index) {
   selectedYear = year;
   hasSelectedYear = true;
   updatePlaceholderVisibility();

   updateCounters(entriesByYear[year]);
   windowResized();

   // Clear and reassign year label classes
   document.querySelectorAll('.year-label').forEach(label => {
      label.classList.remove('active');
      if (label.textContent.trim() === year) {
         label.classList.add('active');
      }
   });

   // Update screen reader live region
   const srLive = document.getElementById('sr-live');
   if (srLive) srLive.textContent = `Year changed to ${year}`;
}

function drawCropEdgeStyle(cropTypes, activities, x, y, size, strokeW = 2, pg) {
   if (!Array.isArray(cropTypes) || cropTypes.length === 0) return;
   if (!Array.isArray(activities) || activities.length === 0) return;

   const groups = cropTypes
      .map(crop => cropEdgeGroups[crop.trim().toLowerCase()])
      .filter(Boolean);
   const uniqueGroups = [...new Set(groups)];
   if (uniqueGroups.length === 0) return;

   pg.push();
   pg.translate(x, y);
   pg.noFill();

   for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const strokeColor = getActivityColor(activity);
      if (!strokeColor) continue;

      pg.strokeWeight(strokeW);
      pg.stroke(strokeColor);

      for (let j = 0; j < uniqueGroups.length; j++) {
         const group = uniqueGroups[j];
         const offsetIndex = j + i;

         switch (group) {
            case 'root':
            case 'cruciferous':
               drawPointedEdge(size, offsetIndex, pg);
               break;
            case 'leafy':
            case 'herb':
               drawWavyEdge(size, offsetIndex, pg);
               break;
            case 'fruit':
            case 'berry':
               drawLobedEdge(size, offsetIndex, pg);
               break;
            case 'grain':
            case 'legume':
               drawLinearSpikes(size, offsetIndex, pg);
               break;
            case 'vine':
               drawSpiralOverlay(size, offsetIndex, pg);
               break;
            case 'mixed':
            case 'various':
               drawDotRing(size, offsetIndex, pg);
               break;
         }
      }
   }

   pg.pop();
}

function drawPointedEdge(size, offsetIndex = 0, pg) {
  let steps = 72;
  let extraSpacing = offsetIndex * 6;
  pg.push();
  pg.rotate(radians((offsetIndex * 17) % 360));
  pg.beginShape();
  for (let i = 0; i <= steps; i++) {
    let angle = TWO_PI * i / steps;
    let radius = size * 0.6 + extraSpacing + (i % 2 === 0 ? 12 : -10);
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    pg.vertex(x, y);
  }
  pg.endShape(CLOSE);
  pg.pop();
}


function drawWavyEdge(size, offsetIndex = 0, pg) {
   let waves = 6 + offsetIndex * 2;
   let amp = 10 + offsetIndex * 1.5;
   let extraSpacing = offsetIndex * 6;
   pg.push();
   pg.rotate(radians((offsetIndex * 23) % 360));
   pg.beginShape();
   for (let angle = 0; angle <= TWO_PI + 0.05; angle += 0.05) {
      let r = size * 0.55 + extraSpacing + amp * sin(waves * angle);
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      pg.curveVertex(x, y);
   }
   pg.endShape(CLOSE);
   pg.pop();
}

function drawLobedEdge(size, offsetIndex = 0, pg) {
   let lobes = 4 + offsetIndex * 1.5;
   let amp = 8 + offsetIndex;
   let extraSpacing = offsetIndex * 6;
   pg.push();
   pg.rotate(radians((offsetIndex * 31) % 360));
   pg.beginShape();
   for (let angle = 0; angle <= TWO_PI + 0.05; angle += 0.05) {
      let r = size * 0.55 + extraSpacing + amp * sin(lobes * angle);
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      pg.curveVertex(x, y);
   }
   pg.endShape(CLOSE);
   pg.pop();
}

function drawLinearSpikes(size, offsetIndex = 0, pg) {
   let lines = 12 + offsetIndex * 2; // more lines per layer
   let baseRadius = size * 0.4 + offsetIndex * 5; // inner radius spacing
   let spikeLength = size * 0.3 + offsetIndex * 3; // grows with index

   pg.push();
   pg.rotate(radians((offsetIndex * 15) % 360)); // rotational tension
   for (let i = 0; i < lines; i++) {
      let angle = TWO_PI * i / lines;
      let x1 = cos(angle) * baseRadius;
      let y1 = sin(angle) * baseRadius;
      let x2 = cos(angle) * (baseRadius + spikeLength);
      let y2 = sin(angle) * (baseRadius + spikeLength);
      pg.line(x1, y1, x2, y2);
   }
   pg.pop();
}

function drawSpiralOverlay(size, offsetIndex = 0, pg) {
   pg.noFill();
   let turns = 100;
   let spacing = size * 0.005; // smaller spacing
   pg.push();
   pg.rotate(radians((offsetIndex * 37) % 360));
   pg.beginShape();
   for (let i = 0; i < turns; i++) {
      let angle = i * 0.2;
      let r = spacing * i + offsetIndex * 2;
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      pg.curveVertex(x, y);
   }
   pg.endShape();
   pg.pop();
}

function drawDotRing(size, offsetIndex = 0, pg) {
   let dots = 24 + offsetIndex * 2;
   let r = size * 0.65 + offsetIndex * 6;
   let dotSize = 4 + offsetIndex * 0.5;
   pg.push();
   pg.rotate(radians((offsetIndex * 19) % 360));
   for (let i = 0; i < dots; i++) {
      let angle = TWO_PI * i / dots;
      let x = cos(angle) * r;
      let y = sin(angle) * r;
      ellipse(x, y, dotSize, dotSize);
   }
   pg.pop();
}

// Draw different line styles based on Animal Type
function drawAnimalLine(animalType, activities, x, y, size, strokeW = 1.3, pg) {
   if (!animalType || activities.length === 0) return;
   let style = getLineStyle(animalType);
   if (!style) return;

   pg.push();
   pg.noFill();

   const baseStrokeW = strokeW || style.weight * 1; // Thicker lines
   const lineLength = size * 1.5; // Slightly longer lines
   const lineSpacing = 7; // Increased vertical spacing

   for (let i = 0; i < activities.length; i++) {
      let strokeColor = getActivityColor(activities[i]);
      if (!strokeColor) continue;

      // Shadow for depth
      pg.stroke(0, 60);
      pg.strokeWeight(baseStrokeW * 1.1);
      pg.push();
      pg.translate(2, 2); // subtle offset shadow
      drawAnimalLineShape(style.type, x, y + i * lineSpacing, lineLength, pg);
      pg.pop();

      // Main colored line
      pg.stroke(strokeColor);
      pg.strokeWeight(baseStrokeW);
      drawAnimalLineShape(style.type, x, y + i * lineSpacing, lineLength, pg);
   }

   pg.pop();
}

function drawAnimalLineShape(type, x, y, length, pg = window) {
   switch (type) {
      case 'wavy':
         drawWavyLine(x, y, length, pg);
         break;
      case 'dashed':
         drawDashedLine(x, y, length, pg);
         break;
      case 'bezier':
         drawBezierLine(x, y, length, pg);
         break;
      case 'straight':
         pg.line(x - length / 2, y, x + length / 2, y);
         break;
      case 'textured':
         drawTexturedLine(x, y, length, pg);
         break;
   }
}

function getLineStyle(animalType) {
   let typeStr = String(animalType || '').trim().toLowerCase();
   if (!typeStr) return null;

   switch (typeStr) {
      case 'sheep':
         return {
            type: 'wavy', weight: 3
         };
      case 'llamas and alpacas':
         return {
            type: 'dashed', weight: 3
         };
      case 'horse':
         return {
            type: 'bezier', weight: 4
         };
      case 'cows':
         return {
            type: 'straight', weight: 6
         };
      case 'cattle':
         return {
            type: 'textured', weight: 4
         };
      default:
         return null;
   }
}

// Enhanced Wavy line: smoother waves, higher amplitude for boldness
function drawWavyLine(x, y, length, pg = window) {
   pg.noFill();
   pg.beginShape();
   let amplitude = 7;
   let waves = 5;
   let steps = 50;
   for (let i = 0; i <= steps; i++) {
      let px = x - length / 2 + (length / steps) * i;
      let py = y + sin((i / steps) * waves * TWO_PI) * amplitude;
      pg.vertex(px, py);
   }
   pg.endShape();
}

// Enhanced Dashed line: longer dashes, sharper gaps, crisp edges
function drawDashedLine(x, y, length, pg = window) {
   let dashLength = 14;
   let gapLength = 8;
   let startX = x - length / 2;
   let endX = x + length / 2;
   for (let px = startX; px < endX; px += dashLength + gapLength) {
      pg.line(px, y, px + dashLength, y);
   }
}

// Enhanced Bezier line: stronger curvature, more elegant S shape
function drawBezierLine(x, y, length, pg = window) {
   pg.noFill();
   pg.strokeJoin(ROUND);
   pg.bezier(
      x - length / 2, y,
      x - length / 3, y - length / 2,
      x + length / 3, y + length / 2,
      x + length / 2, y
   );
}

// Textured line: clean segmented lines
function drawTexturedLine(x, y, length, pg = window) {
   let segmentLength = 8;
   let gap = 5;
   let startX = x - length / 2;
   let endX = x + length / 2;

   for (let px = startX; px < endX; px += segmentLength + gap) {
      pg.line(px, y, px + segmentLength, y);
   }
}

function drawHabitatShape(habitatList, x, y, size, baseColor, strokeW = 2, pg = window) {
   if (!Array.isArray(habitatList)) return;

   habitatList = habitatList
      .map(h => (typeof h === 'string' ? h.trim().toLowerCase() : ''))
      .filter(h => h !== '');

   if (habitatList.length === 0) return;

   pg.push();
   pg.translate(x, y);
   pg.rectMode(CENTER);
   pg.angleMode(RADIANS);
   pg.strokeWeight(strokeW);
   pg.stroke(0, 60);

   for (let i = 0; i < habitatList.length; i++) {
      let habitat = habitatList[i];
      let angleOffset = PI / 6 * i;
      let alpha = map(i, 0, habitatList.length, 200, 60);
      let fillColor = color(
         pg.red(baseColor),
         pg.green(baseColor),
         pg.blue(baseColor),
         alpha
      );

      // Slight scaling and rotation per layer
      let scaleFactor = 1 - i * 0.08;
      pg.push();
      pg.rotate(angleOffset);
      pg.scale(scaleFactor);

      // Shadow layer (deeper)
      pg.fill(0, 30);
      pg.translate(3, 3);
      switch (habitat) {
         case 'pollinator':
            drawSolarHexagon(size * 0.5, pg);
            break;
         case 'native grasses':
            rect(0, 0, size * 0.3, size, pg);
            break;
         case 'naturalized':
            ellipse(0, 0, size, size, pg);
            break;
      }
      pg.translate(-3, -3);

      // Main filled layer
      pg.fill(fillColor);
      switch (habitat) {
         case 'pollinator':
            drawSolarHexagon(size * 0.5, pg);
            break;
         case 'native grasses':
            pg.rect(0, 0, size * 0.3, size, pg);
            drawVerticalLines(size * 0.3, size, 5, baseColor, pg);
            break;
         case 'naturalized':
            pg.ellipse(0, 0, size, size);
            drawGlowEllipse(size, baseColor, pg);
            break;
      }

      pg.pop();
   }

   pg.pop();
}

// Helper: Draw hexagon with inner "cell" lines to evoke solar panel cells
function drawSolarHexagon(r, pg = window) {
   pg.stroke(255, 150);
   pg.strokeWeight(1);
   pg.noFill();
   pg.beginShape();
   for (let j = 0; j < 6; j++) {
      let angle = TWO_PI / 6 * j - PI / 2;
      pg.vertex(cos(angle) * r, sin(angle) * r);
   }
   pg.endShape(CLOSE);

   // Inner lines to mimic cell grid
   for (let k = 1; k <= 2; k++) {
      let innerR = r * (1 - k * 0.3);
      pg.beginShape();
      for (let j = 0; j < 6; j++) {
         let angle = TWO_PI / 6 * j - PI / 2;
         pg.vertex(cos(angle) * innerR, sin(angle) * innerR);
      }
      pg.endShape(CLOSE);
   }
}

// Helper: Draw vertical lines inside a rectangle (native grasses)
function drawVerticalLines(w, h, count, baseColor, pg = window) {
   pg.stroke(red(baseColor), pg.green(baseColor), pg.blue(baseColor), 100);
   pg.strokeWeight(0.5);
   for (let i = 1; i < count; i++) {
      let x = map(i, 1, count - 1, -w / 2, w / 2);
      pg.line(x, -h / 2, x, h / 2);
   }
}

// Helper: Draw subtle glow effect on ellipse
function drawGlowEllipse(size, baseColor, pg = window) {
   pg.noFill();
   pg.stroke(red(baseColor), pg.green(baseColor), pg.blue(baseColor), 50);
   pg.strokeWeight(3);
   pg.ellipse(0, 0, size * 1.1, size * 1.1);
   pg.strokeWeight(1);
   pg.ellipse(0, 0, size * 1.3, size * 1.3);
}


function drawCombinedHabitatOverlay(habitatList, activities, x, y, size, strokeW = 1.2, pg = window) {
   if (!Array.isArray(habitatList) || !Array.isArray(activities)) return;

   const cleanedHabitats = habitatList
      .map(h => (typeof h === 'string' ? h.trim().toLowerCase() : ''))
      .filter(h => h !== '');

   const cleanedActivities = activities
      .map(a => (typeof a === 'string' ? a.trim().toLowerCase() : ''))
      .filter(a => a !== '');

   if (cleanedHabitats.length === 0 || cleanedActivities.length === 0) return;

   const nestingCount = cleanedActivities.length;

   pg.push();
   translate(x, y);
   pg.angleMode(RADIANS);
   pg.rectMode(CENTER);
   pg.strokeWeight(strokeW);
   pg.stroke(0, 60);

   const layerStep = 0.85 / nestingCount;

   for (let i = 0; i < nestingCount; i++) {
      const habitat = cleanedHabitats[i % cleanedHabitats.length];
      const shapeType = getHabitatShapeType(habitat);
      const activity = cleanedActivities[i];
      const fillCol = getActivityColor(activity);
      if (!fillCol) continue;

      const angleOffset = pg.radians(i * 12); // more offset per layer
      const scaleFactor = 1 - i * layerStep;
      const shapeSize = size * scaleFactor;

      pg.push();
      pg.rotate(angleOffset);

      // Glow ring
      pg.noFill();
      pg.stroke(red(fillCol), green(fillCol), blue(fillCol), 40);
      pg.strokeWeight(6);
      pg.ellipse(0, 0, shapeSize * 1.1, shapeSize * 1.1);
      pg.strokeWeight(1);
      pg.noStroke();

      // Slight blur fill base
      pg.fill(0, 20);
      pg.push();
      pg.translate(2, 2);
      drawShapeByType(shapeType, shapeSize * 0.95, shapeSize * 0.95, pg);
      pg.pop();

      // Main layer
      pg.fill(fillCol);
      if (shapeType === 'rect') {
         drawShapeByType(shapeType, shapeSize * 0.35, shapeSize * 1.1, pg);
      } else {
         drawShapeByType(shapeType, shapeSize, shapeSize, pg);
      }

      pg.pop();
   }

   pg.pop();
}

function getHabitatShapeType(habitat) {
   if (habitat.includes('pollinator')) return 'hexagon';
   if (habitat.includes('native grasses')) return 'rect';
   if (habitat.includes('naturalized')) return 'ellipse';
}

function pointInHexagon(px, py, r,) {
   px = abs(px);
   py = abs(py);

   if (px > r * 0.8660254 || py > r * 0.5 + r * 0.288675) return false;
   return r * 0.5 * r * 0.8660254 - px * r * 0.5 - py * r * 0.8660254 >= 0;
}

function drawArrayOverlay(arrayType, activities, x, y, size, strokeW = 1.2, density = 7, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window; // fallback to main canvas context
  }
   if (!arrayType || !Array.isArray(activities) || activities.length === 0) return;

   pg.push();
   pg.translate(x, y);
   pg.rectMode(CENTER);
   pg.strokeWeight(strokeW);
   pg.stroke(0, 60);
   pg.noFill();

   switch (arrayType?.toLowerCase()) {
      case 'fixed':
         drawCrosshatchGridMultiColor(activities, size, density, pg);
         break;
      case 'single-axis tracking':
         drawIsometricGridMultiColor(activities, size, density, 1.1, pg);
         break;
      case 'dual-axis tracking':
         drawDottedMatrixMultiColor(activities, size, density, pg);
         break;
   }

   pg.pop();
}

function drawCrosshatchGridMultiColor(activities, size, density = 10, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }

  let colorCount = activities.length;

  pg.push();
  pg.rotate(PI / 4); // Diamond orientation

   for (let i = -size / 2, idx = 0; i <= size / 2; i += density, idx++) {
      let col = getActivityColor(activities[idx % colorCount]);

      // === Black base lines for depth ===
      pg.stroke(0, 120); // semi-opaque black
      pg.strokeWeight(2);
      pg.line(i, -size / 2, i, size / 2);
      pg.line(-size / 2, i, size / 2, i);

      // === Colored lines on top ===
      pg.stroke(col);
      pg.strokeWeight(1.2);
      pg.line(i, -size / 2, i, size / 2);
      pg.line(-size / 2, i, size / 2, i);

      // === Glow at grid intersections ===
      pg.push();
      pg.noStroke();
      pg.fill(0, 80); // black shadow
      pg.ellipse(i + 0.5, i + 0.5, density * 0.4);
      pg.ellipse(i - 0.5, -i + 0.5, density * 0.4);
      pg.fill(col.levels ? color(col.levels[0], col.levels[1], col.levels[2], 100) : col);
      pg.ellipse(i, i, density * 0.3);
      pg.ellipse(i, -i, density * 0.3);
      pg.pop();
   }

   pg.pop();
}

function drawIsometricGridMultiColor(activities, size, density = 2, slope = 1.1, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }

  let colorCount = activities.length;
  let idx = 0;
  let halfSize = size / 2;

  pg.push();
  pg.rotate(HALF_PI);

   for (let x = -halfSize; x <= halfSize; x += density) {
      let colA = getActivityColor(activities[idx % colorCount]);
      let y1a = -halfSize * slope;
      let y2a = halfSize * slope;

      // === Black base stroke ===
      pg.stroke(0, 120);
      pg.strokeWeight(2);
      pg.line(x, y1a, x + halfSize, y2a);

      // === Colored line ===
      pg.stroke(colA);
      pg.strokeWeight(1.2);
      pg.line(x, y1a, x + halfSize, y2a);
      idx++;

      let colB = getActivityColor(activities[idx % colorCount]);
      let y1b = -halfSize * slope;
      let y2b = halfSize * slope;

      pg.stroke(0, 120);
      pg.strokeWeight(2);
      pg.line(x + halfSize, y1b, x, y2b);

      pg.stroke(colB);
      pg.strokeWeight(1.2);
      pg.line(x + halfSize, y1b, x, y2b);
      idx++;
   }

   // Highlight lines
   pg.stroke(255, 70);
   pg.strokeWeight(0.8);
   for (let i = -halfSize; i <= halfSize; i += density * 5) {
      pg.line(i, -halfSize * slope, i + halfSize, halfSize * slope);
   }

   pg.pop();
}

function drawDottedMatrixMultiColor(activities, size, density = 10, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }

  let colorCount = activities.length;
  let dotSize = 4;
  let idx = 0;

   for (let x = -size / 2; x < size / 2; x += density) {
      for (let y = -size / 2; y < size / 2; y += density) {
         let col = getActivityColor(activities[idx % colorCount]);

         // === Black shadow circle ===
         pg.noStroke();
         pg.fill(0, 120);
         pg.ellipse(x + 0.5, y + 0.5, dotSize + 1.5);

         // === Colored dot ===
         pg.fill(col);
         pg.ellipse(x, y, dotSize);

         // === White highlight glint ===
         pg.fill(255, 150);
         pg.ellipse(x - dotSize * 0.15, y - dotSize * 0.15, dotSize * 0.3);

         idx++;
      }
   }
}

function getActivityColor(activity) {
   switch (activity.trim().toLowerCase()) {
      case 'crop production':
         return color('#E4572E'); // Vivid Orange
      case 'habitat':
         return color('#2E8B57'); // Sea Green
      case 'grazing':
         return color('#005A99'); // Deep Blue
      case 'greenhouse':
         return color('#FFD100'); // Solar Gold
      default:
         return null; // No matching activity
   }
}

function drawMinimalSite(site, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }

  const { x, y, activity = 'habitat', systemSize = 0.1, siteSize = 0.1 } = site;
  const baseColor = getActivityColor(activity);
  const dotBaseSize = map(siteSize, 0, 10, 16, 60);
  const shadowOffset = map(systemSize, 0, 10, 1, 8);

  pg.push();
  pg.translate(x, y);
   pg.noStroke();

   // Suprematist-style drop shadow (with light angle)
   pg.fill(0, 140);
   const lightAngle = radians(10);
   pg.push();
   pg.rotate(lightAngle);
   pg.ellipse(shadowOffset, shadowOffset, dotBaseSize, dotBaseSize);
   pg.pop();

   // Glow ring
   pg.stroke(baseColor); // Reduced opacity
   pg.strokeWeight(dotBaseSize * 0.15); // Thinner glow
   pg.ellipse(0, 0, dotBaseSize * 1.4);

   // Add subtle linear glow overlays to mimic panel reflections
   pg.stroke(baseColor);
   pg.strokeWeight(1);
   const linesCount = 5;
   for (let i = 1; i <= linesCount; i++) {
      let posX = map(i, 1, linesCount + 1, -dotBaseSize * 0.75, dotBaseSize * 0.75);
      pg.line(posX, -dotBaseSize * 0.75, posX, dotBaseSize * 0.75);
   }

   // Core dot
   pg.noStroke();
   pg.fill(baseColor);
   pg.ellipse(0, 0, dotBaseSize);

   pg.pop();
}

function drawSuprematistOpShadowRect(baseSize, systemSize, habitat, posX, posY, glowStrength = 40, isHover = false, animalLineType = '', agrivoltaicColors = [], options = {}) {
  let { flipped = false, pg } = options;
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }
   let sz = constrain(systemSize || 0.1, 0.1, 10);

   let shapeType = 'diamond'; // fallback

   if (Array.isArray(habitat) && habitat.length > 0) {
      const cleaned = habitat.map(h => (h || '').trim().toLowerCase());
      if (cleaned.includes('pollinator')) {
         shapeType = 'hexagon';
      } else if (cleaned.includes('naturalized')) {
         shapeType = 'ellipse';
      } else if (cleaned.includes('native grasses')) {
         shapeType = 'rect';
      }
   } else if (animalLineType) {
      shapeType = animalLineType.toLowerCase();
   }

   pg.push();
   pg.translate(posX, posY);
   pg.rectMode(CENTER);
   pg.noStroke();

   // Size & offsets based on system size
   let offset = map(sz, 0, 10, 2, 10);
   let shadowSize = map(sz, 0, 10, baseSize * 0.9, baseSize * 1.4);
   let highlightSize = shadowSize * 0.95;

   let widthFactor = 1;
   let heightFactor = 1;
   let rotateRectVertical = false;

   if (shapeType === 'diamond') {
      widthFactor = 1;
      heightFactor = 1.15;
   } else if (shapeType === 'rect') {
      widthFactor = 0.55;
      heightFactor = 1.6;
      rotateRectVertical = true;
   }

   let shadowW = shadowSize * widthFactor;
   let shadowH = shadowSize * heightFactor;
   let highlightW = highlightSize * widthFactor;
   let highlightH = highlightSize * heightFactor;

   let glowW = shadowW * map(sz, 0.1, 10, 1.2, 1.6);
   let glowH = shadowH * map(sz, 0.1, 10, 1.2, 1.6);

   // Glow alpha pulsation
   let pulse = map(sin(frameCount * 0.08), -1, 1, 0.8, 1);
   let glowAlpha = glowStrength * pulse;
   if (isHover) glowAlpha = min(glowAlpha * 3.5, 255);

   if (agrivoltaicColors.length === 0) agrivoltaicColors = [color(255)];

   // Color cycling through agrivoltaic colors
   let colorIndex = floor(frameCount / 60) % agrivoltaicColors.length;
   let nextIndex = (colorIndex + 1) % agrivoltaicColors.length;
   let lerpAmt = (frameCount % 60) / 60;
   let baseGlowColor = lerpColor(agrivoltaicColors[colorIndex], agrivoltaicColors[nextIndex], lerpAmt);
   baseGlowColor.setAlpha(glowAlpha);

   // --- Glow layers with alternating diamond and original shapes ---
   for (let i = 3; i > 0; i--) {
      let layerW = glowW * (1 + i * 0.05);
      let layerH = glowH * (1 + i * 0.05);
      let layerAlpha = glowAlpha * (0.3 / i);
      let layerColor = lerpColor(agrivoltaicColors[colorIndex], agrivoltaicColors[nextIndex], lerpAmt);
      layerColor.setAlpha(layerAlpha);
      pg.fill(layerColor);

      if (i % 2 === 0) {
         pg.push();
         pg.rotate(PI / 6); // simulate panel angle
         drawShapeByType('diamond', layerW, layerH, pg);
         pg.pop();
      } else {
         drawShapeByType(shapeType, layerW, layerH, pg);
      }
   }

   const panelLightAngle = pg.radians(10);

   // --- Shadow layers with consistent light angle ---
   pg.fill('#0A0A0A');
   pg.push();
   pg.rotate(panelLightAngle);
   pg.translate(offset, offset);
   if (rotateRectVertical) pg.rotate(PI);
   drawShapeByType(shapeType, shadowW, shadowH, pg);
   pg.pop();

   fill(255);
   pg.push();
   pg.rotate(panelLightAngle - pg.radians(4));
   pg.translate(offset * 1.4, offset * 0.8);
   if (rotateRectVertical) pg.rotate(PI);
   drawShapeByType(shapeType, highlightW, highlightH, pg);
   pg.pop();

   pg.fill('#0A0A0A');
   pg.push();
   pg.rotate(panelLightAngle - pg.radians(7));
   pg.translate(-offset * 0.6, offset * 0.5);
   if (rotateRectVertical) pg.rotate(PI);
   drawShapeByType(shapeType, shadowW * 0.88, shadowH * 0.88, pg);
   pg.pop();

   // --- Sharp highlight outline for "glass panel" effect ---
   pg.stroke(255, glowAlpha * 0.7);
   pg.noFill();
   pg.strokeWeight(2);
   if (rotateRectVertical) {
      pg.push();
      pg.rotate(PI);
      drawShapeByType(shapeType, shadowW * 0.75, shadowH * 0.75, pg);
      pg.pop();
   } else {
      drawShapeByType(shapeType, shadowW * 0.75, shadowH * 0.75, pg);
   }

   pg.pop();

   return {
      offsetX: offset * 1.4,
      offsetY: offset * 0.8,
      angle: panelLightAngle - pg.radians(4),
      size: highlightSize,
      glowAlpha,
   };
}

function drawShapeByType(type, w, h, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }
   switch (type) {
      case 'hexagon':
         pg.beginShape();
         for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i - PI / 2;
            pg.vertex(cos(angle) * w / 2, sin(angle) * h / 2);
         }
         pg.endShape(CLOSE);
         break;
      case 'ellipse':
         pg.ellipse(0, 0, w, h);
         break;
      case 'rect':
         pg.rect(0, 0, w, h);
         break;
      case 'diamond':
      default:
         pg.push();
         pg.rotate(PI / 4); // Rotate square 45 degrees to get diamond
         pg.rect(0, 0, w, h);
         pg.pop();
         break;
   }
}

function pathShapeByType(type, size, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }
   let r = size / 2;
   let ctx = drawingContext;

   switch (type) {
      case 'hexagon':
         for (let i = 0; i < 6; i++) {
            let angle = TWO_PI / 6 * i - PI / 6;
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
         }
         ctx.closePath();
         break;

      case 'ellipse':
         ctx.ellipse(0, 0, size, size, pg);
         break;

      case 'rect':
         ctx.rect(-size * 0.275, -size * 0.5, size * 0.55, size, pg);
         break;

      case 'diamond':
      default:
         ctx.moveTo(0, -r);
         ctx.lineTo(r, 0);
         ctx.lineTo(0, r);
         ctx.lineTo(-r, 0);
         ctx.closePath();
         break;
   }
}

function drawPVWarpStyle(pvType, activities, x, y, size, pg) {
  if (!pg || typeof pg.push !== 'function') {
    pg = window;
  }
   if (!pvType || !activities || activities.length === 0) return;

   let type = pvType.trim().toLowerCase();
   let warpStyle = pvWarpStyles[type];
   if (!warpStyle) return;

   pg.push();
   pg.translate(x, y);
   pg.noFill();
   pg.blendMode(ADD); // enhances glow-style overlap

   switch (warpStyle) {
      case 'linear':
         pg.strokeWeight(2);
         // Draw dynamic diagonal zig-zag lines with subtle wave movement
         for (let i = -size; i <= size; i += 8) {
            let waveOffset = sin((frameCount * 0.03 + i) * 3) * 6;
            let colorIndex = Math.floor((i + size) / 8) % activities.length;
            pg.stroke(getActivityColor(activities[colorIndex]));
            pg.line(i, -size + waveOffset, -i * 0.2, size - waveOffset);
         }
         // Add subtle horizontal grid lines for photovoltaic cell effect
         pg.stroke(255, 80);
         pg.strokeWeight(0.5);
         for (let yOff = -size; yOff <= size; yOff += 10) {
            let horizOffset = sin(frameCount * 0.05 + yOff) * 2;
            pg.line(-size, yOff + horizOffset, size, yOff + horizOffset);
         }
         break;

      case 'symmetric':
         pg.strokeWeight(3.5);
         // Vertical wave-distorted lines
         for (let i = 0; i < size; i += 4) {
            let yOffset = sin((i + frameCount) * 0.12) * 12;
            let colorIndex = Math.floor(i / 4) % activities.length;
            pg.stroke(getActivityColor(activities[colorIndex]));
            pg.line(-size / 2 + i, -yOffset, -size / 2 + i, yOffset);

            // Add crossing horizontal lines to form subtle grid cells
            if (i % 12 === 0) {
               pg.stroke(255, 80);
               pg.strokeWeight(1);
               pg.line(-size / 2 + i - 2, -yOffset / 2, -size / 2 + i + 2, yOffset / 2);
            }
         }
         break;

      case 'radial':
         // Pulsating concentric ellipses with color cycling
         for (let r = 12, idx = 0; r < size; r += 10, idx++) {
            pg.stroke(getActivityColor(activities[idx % activities.length]));
            pg.strokeWeight(2 + sin((frameCount + r) * 0.1) * 1.5);
            pg.ellipse(0, 0, r * 2, r * 2);
         }
   }
   pg.pop();
}
