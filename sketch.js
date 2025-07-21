let table;
let entries = [];
let entriesByYear = {};
let selectedYear;
let availableYears = [];
let cnv;
let hoveredEntry = null;  // Currently hovered entry (for hover enlargement)
let bgImg;

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
    element.textContent = currentValue;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// Update counters given entries of the selected year
function updateCounters(entries) {
  // Sum up the counts from the entries
  let siteCount = entries.length;
  let megawattCount = entries.reduce((sum, e) => sum + (e.megawatts || 0), 0);
  let acreCount = entries.reduce((sum, e) => sum + (e.acres || 0), 0);

  // Animate each counter
  animateCount('site-count', 0, siteCount, 1000);
  animateCount('megawatt-count', 0, Math.round(megawattCount), 1000);
  animateCount('acre-count', 0, Math.round(acreCount), 1000);
}


function setup() {
  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name') || '';
    let activityStr = table.getString(i, 'Agrivoltaic Activities') || '';
    let activities = activityStr
      .split(/,\s*/)
      .map(a => a.trim().toLowerCase())
      .filter(a => a.length > 0);
    let habitatStr = String(table.getString(i, 'Habitat Type') || '').trim();
    let habitat = habitatStr ? habitatStr.split(/,\s*/) : [];
    let animalTypeStr = table.getString(i, 'Animal Type') || '';
    let animalType = animalTypeStr
      .split(/,\s*/)
      .map(a => a.trim().toLowerCase())
      .filter(a => a.length > 0);
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
      currentScale: 1 // for smooth animation
    };

    entries.push(entry);

    if (!entriesByYear[year]) {
      entriesByYear[year] = [];
    }
    entriesByYear[year].push(entry);
  }

  availableYears = Object.keys(entriesByYear).sort();
  selectedYear = availableYears[0];

  // Create the canvas
  let initialWidth = windowWidth * 0.9;
  let shapeSize = 150;
  let padding = 60;
  let yearEntries = entriesByYear[selectedYear] || [];
  let numCols = floor((initialWidth - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);
  let numRows = ceil(yearEntries.length / numCols);
  let fixedHeight = 865;
  cnv = createCanvas(initialWidth, fixedHeight);
  cnv.parent('sketch-container');

  // Create caption
  let caption = createP("Image from Pexels");
  caption.style('text-align', 'left', true);
  caption.class('image-caption');
  caption.parent('sketch-container');

  // YEAR BUTTONS
  let timelineContainer = createDiv().id('timeline');
  timelineContainer.style('text-align', 'center', true);
  timelineContainer.parent('sketch-container');

  availableYears.forEach((year, index) => {
    let yearDiv = createDiv().class('timeline-year');
    yearDiv.parent(timelineContainer);

    let label = createP(year)
      .class('year-label')
      .addClass('suprematist-underline');
    label.parent(yearDiv);

    if (index % 2 === 0) {
      label.addClass('above');
    } else {
      label.addClass('below');
    }

    let node = createDiv().class('year-node');
    node.parent(yearDiv);

    label.mousePressed(() => {
      selectedYear = year;
      windowResized();
      updateCounters(entriesByYear[selectedYear]);

      selectAll('.year-label').forEach(lbl => lbl.removeClass('active'));
      label.addClass('active');
    });

    if (index === 0) label.addClass('active');
  });

  textFont('Helvetica');
  textSize(32);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  loop();
  updateCounters(entriesByYear[selectedYear]);
}


function windowResized() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSize = 150;
  let padding = 60;
  let numCols = floor((windowWidth * 0.9 - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);

  let numRows = ceil(yearEntries.length / numCols);
  let fixedHeight = 865;
  resizeCanvas(windowWidth * 0.9, fixedHeight);
  
  redraw();
}


function draw() {
  // Draw background image dimmed and semi-transparent
  image(bgImg, 0, 0, width, height);
  noStroke();
  rectMode(CORNER);
  fill(0, 215);
  rect(0, 0, width, height);
  rectMode(CENTER);

  // === MINIMAL SUPREMATIST YEAR LABEL ===
  const centerX = width / 2;
  const labelY = 40;
  const yearY = labelY + 40;

  textFont('Helvetica');
  textSize(28);
  textAlign(CENTER, BOTTOM);
  fill(255);
  text("Year Installed:", centerX, labelY);

  textStyle(BOLD);
  textSize(36);
  text(" " + selectedYear, centerX, yearY);
  textStyle(NORMAL);

  // Underline aligned with selectedYear
  const lineY = yearY + 6;
  const lineWidth = textWidth(selectedYear) + 40;
  stroke('#0A0A0A');
  strokeWeight(3);
  line(centerX - lineWidth / 2, lineY, centerX + lineWidth / 2, lineY);
  noStroke();

  // Get entries for the selected year
  const yearEntries = entriesByYear[selectedYear] || [];
  if (yearEntries.length === 0) {
    text("No data available for this year.", centerX, height / 2);
    return;
  }

  // Calculate max megawatts safely
  let maxMW = Math.max(...yearEntries.map(e => e.megawatts || 0));
  if (maxMW <= 0) maxMW = 1;

  // Layout parameters
  const startY = 80;
  const count = yearEntries.length;
  const minSiteSize = Math.min(...yearEntries.map(e => e.acres || 0.1));
  const maxSiteSize = Math.max(...yearEntries.map(e => e.acres || 1));
  const baseShapeSize = map(count, 10, 120, 140, 50);
  const padding = map(count, 10, 120, 60, 15);
  let numCols = floor((width - padding) / (baseShapeSize + padding));
  numCols = max(numCols, 1);
  const numRows = ceil(count / numCols);
  const maxCellHeight = (height - startY - 50) / numRows;

  for (let i = 0; i < count; i++) {
    const entry = yearEntries[i];
    const col = i % numCols;
    const row = floor(i / numCols);

    // Calculate center positions
    const cx = padding + col * (baseShapeSize + padding) + baseShapeSize / 2;
    const cy = startY + row * maxCellHeight + maxCellHeight / 2;

    // Shape size and stroke weight scaled by acres
    let entryShapeSize = map(entry.acres, minSiteSize, maxSiteSize, baseShapeSize * 0.6, baseShapeSize);
    entryShapeSize = constrain(entryShapeSize, 30, maxCellHeight * 0.85);
    let strokeW = map(entry.acres, minSiteSize, maxSiteSize, 2, 5.5);
    strokeW = constrain(strokeW, 2, 5.5);

    // Base color from first activity
    const baseColor = getActivityColor(entry.activities?.[0] || '');

    // Hover and glow animation
    const isHovered = hoveredEntry && hoveredEntry.name === entry.name;
    const baseGlow = map(entry.megawatts || 0, 0, maxMW, 5, 30);
    const glowStrength = isHovered ? baseGlow * 1.5 : baseGlow;
    const targetScale = isHovered ? 1.2 : 1;
    entry.currentScale = lerp(entry.currentScale || 1, targetScale, 0.1);

    push();
    translate(cx, cy);
    scale(entry.currentScale);

   // Convert activity strings to p5 color objects
    const activityColors = (entry.activities || []).map(getActivityColor);

    // Suprematist Op Shadow
    const shadowInfo = drawSuprematistOpShadowRect(
      entryShapeSize,
      entry.megawatts,
      entry.habitat,
      0, 0,
      glowStrength,
      isHovered,
      (entry.animalType?.[0] || ''),
      activityColors // passing colors, not raw strings
    );

    // === Main Habitat Shape Fill ===
    if (Array.isArray(entry.habitat) && entry.habitat.length > 0) {
      drawHabitatShape(entry.habitat, 0, 0, entryShapeSize, baseColor);
    }

    // === Texture from Activities on top ===
    if (entry.activities && entry.habitat) {
      drawCombinedHabitatOverlay(entry.habitat, entry.activities, 0, 0, entryShapeSize);
    }

    // === Draw Array Overlay with shader (inside shadowInfo transform) ===
    if (entry.arrayType) {
      push();
      translate(shadowInfo.offsetX, shadowInfo.offsetY);
      rotate(shadowInfo.angle);
      drawArrayOverlay(
        entry.arrayType,
        entry.activities,
        0, 0,
        shadowInfo.size,
        1.2,
        10
      );
      pop();
    }

    // === Crop Edge Style (outline) ===
    if (entry.cropType && entry.cropType.length > 0) {
      drawCropEdgeStyle(entry.cropType, entry.activities, entry.habitat, 0, 0, entryShapeSize, strokeW);
    }

    // === Animal Line Type ===
    if (entry.animalType && entry.animalType.length > 0) {
      drawAnimalLine(entry.animalType, entry.activities, 0, 0, entryShapeSize, strokeW);
    }

    pop();
  }
}


function showModalWithEntry(entry) {
  const modalTitle = document.getElementById('siteModalLabel');
  const modalBody = document.getElementById('siteModalBody');

  const capitalizeWords = (str) => str.replace(/\b\w/g, c => c.toUpperCase());
  const formatArray = (arr) =>
    Array.isArray(arr) ? arr.map(s => capitalizeWords(s)).join(', ') : String(arr);

  let lines = [];

  if (entry.activities?.length) lines.push(`<strong>Agrivoltaic Activities:</strong> ${formatArray(entry.activities)}`);
  if (!isNaN(entry.megawatts)) lines.push(`<strong>System Size:</strong> ${entry.megawatts} MW`);
  if (!isNaN(entry.acres)) lines.push(`<strong>Site Size:</strong> ${entry.acres} Acres`);
  if (entry.year) lines.push(`<strong>Year Installed:</strong> ${entry.year}`);
  if (entry.arrayType) lines.push(`<strong>Type of Array:</strong> ${capitalizeWords(entry.arrayType)}`);
  if (entry.habitat?.length) lines.push(`<strong>Habitat Types:</strong> ${formatArray(entry.habitat)}`);
  if (entry.cropType?.length) lines.push(`<strong>Crop Type:</strong> ${formatArray(entry.cropType)}`);
  if (entry.animalType?.length) lines.push(`<strong>Animal Type:</strong> ${formatArray(entry.animalType)}`);

  // If entry.url exists, wrap entry.name in an <a> tag, else just show the name
  modalTitle.innerHTML = entry.url
  ? `<a href="${entry.url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">
       ${entry.name}${combinedIcon}
     </a>`
  : entry.name;

  modalBody.innerHTML = lines.join('<br>'); // No more Visit Site link

  const siteModal = new bootstrap.Modal(document.getElementById('siteModal'));
  siteModal.show();
}

function mouseMoved() {
  // Skip hover detection on touch devices
  if ('ontouchstart' in window) return;

  // Disable hover when Bootstrap modal is open
  const modalElement = document.getElementById('siteModal');
  if (modalElement && modalElement.classList.contains('show')) {
    hoveredEntry = null;
    cursor('default');
    return;
  }

  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSizeEstimate = 150;
  let padding = map(yearEntries.length, 10, 120, 60, 15);
  let startY = 80;
  let count = yearEntries.length;
  let baseShapeSize = map(count, 10, 120, 140, 50);
  let numCols = floor((width - padding) / (baseShapeSize + padding));
  numCols = max(numCols, 1);

  hoveredEntry = null;
  let hovering = false;

  for (let i = 0; i < yearEntries.length; i++) {
    let col = i % numCols;
    let row = floor(i / numCols);
    let centerX = padding + col * (baseShapeSize + padding) + baseShapeSize / 2;
    let centerY = startY + row * ((height - startY - 50) / ceil(count / numCols)) + ((height - startY - 50) / ceil(count / numCols)) / 2;
    let entry = yearEntries[i];

    let minSiteSize = Math.min(...yearEntries.map(e => e.acres || 0.1));
    let maxSiteSize = Math.max(...yearEntries.map(e => e.acres || 1));
    let entryShapeSize = map(entry.acres, minSiteSize, maxSiteSize, baseShapeSize * 0.6, baseShapeSize);
    entryShapeSize = constrain(entryShapeSize, 30, ((height - startY - 50) / ceil(count / numCols)) * 0.85);

    let d = dist(mouseX, mouseY, centerX, centerY);
    if (d < entryShapeSize / 2) {
      hoveredEntry = entry;
      hovering = true;
      break;
    }
  }

  cursor(hovering ? 'pointer' : 'default');
}

function mousePressed() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let padding = map(yearEntries.length, 10, 120, 60, 15);
  let shapeSizeEstimate = 150;
  let startY = 80;
  let baseShapeSize = map(yearEntries.length, 10, 120, 140, 50);
  let numCols = floor((width - padding) / (baseShapeSize + padding));
  numCols = max(numCols, 1);

  for (let i = 0; i < yearEntries.length; i++) {
    let col = i % numCols;
    let row = floor(i / numCols);
    let centerX = padding + col * (baseShapeSize + padding) + baseShapeSize / 2;
    let centerY = startY + row * ((height - startY - 50) / ceil(yearEntries.length / numCols)) +
                  ((height - startY - 50) / ceil(yearEntries.length / numCols)) / 2;

    let entry = yearEntries[i];
    let minSiteSize = Math.min(...yearEntries.map(e => e.acres || 0.1));
    let maxSiteSize = Math.max(...yearEntries.map(e => e.acres || 1));
    let entryShapeSize = map(entry.acres, minSiteSize, maxSiteSize, baseShapeSize * 0.6, baseShapeSize);
    entryShapeSize = constrain(entryShapeSize, 30, ((height - startY - 50) / ceil(yearEntries.length / numCols)) * 0.85);

    let d = dist(mouseX, mouseY, centerX, centerY);
    if (d < entryShapeSize / 2) {
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

  // ESC closes modal if open
  if (keyCode === ESCAPE && modalVisible) {
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) modalInstance.hide();
    return;
  }

  // Modal navigation: LEFT/RIGHT arrows move to previous/next entry
  if (modalVisible && (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
    const modalTitle = document.getElementById('siteModalLabel');
    if (!modalTitle) return;

    const currentName = modalTitle.textContent.trim();
    const currentIndex = yearEntries.findIndex(e => e.name === currentName);
    if (currentIndex === -1) return;

    let newIndex = currentIndex + (keyCode === RIGHT_ARROW ? 1 : -1);
    newIndex = constrain(newIndex, 0, yearEntries.length - 1);

    if (newIndex !== currentIndex) {
      showModalWithEntry(yearEntries[newIndex]);
    }
    return;
  }

  // Global year navigation (when modal is not open)
  const currentYearIndex = availableYears.indexOf(selectedYear);
  if (!modalVisible && (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW)) {
    const delta = keyCode === RIGHT_ARROW ? 1 : -1;
    const newIndex = constrain(currentYearIndex + delta, 0, availableYears.length - 1);
    if (newIndex !== currentYearIndex) {
      selectedYear = availableYears[newIndex];
      updateYear(selectedYear, newIndex);
    }
    return;
  }

  // HOME to go to first year
  if (!modalVisible && keyCode === HOME) {
    selectedYear = availableYears[0];
    updateYear(selectedYear, 0);
    return;
  }

  // END to go to last year
  if (!modalVisible && keyCode === END) {
    selectedYear = availableYears[availableYears.length - 1];
    updateYear(selectedYear, availableYears.length - 1);
    return;
  }
}



function updateYear(year, index) {
  windowResized();
  updateCounters(entriesByYear[year]);

  document.querySelectorAll('.year-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  let selectedBtn = document.querySelector(`.year-btn[data-year="${year}"]`);
  if (selectedBtn) selectedBtn.classList.add('selected');

  // Screen reader update
  const srLive = document.getElementById('sr-live');
  if (srLive) {
    srLive.textContent = `Year changed to ${year}`;
  }
}

function drawCropEdgeStyle(cropTypes, activities, habitat, x, y, size, strokeW = 2) {
  if (!Array.isArray(cropTypes) || cropTypes.length === 0) return;
  if (!Array.isArray(activities) || activities.length === 0) return;

  const groups = cropTypes
    .map(crop => cropEdgeGroups[crop.trim().toLowerCase()])
    .filter(Boolean);
  const uniqueGroups = [...new Set(groups)];
  if (uniqueGroups.length === 0) return;

  const baseShape = getHabitatShapeType(habitat);

  push();
  translate(x, y);
  angleMode(RADIANS);

  // Create clipping mask with habitat shape
  beginShape();
  drawingContext.save(); // Save global canvas state
  drawingContext.beginPath();

  // Approximate the clipping region
  pathShapeByType(baseShape, size); // defines path only (no fill/stroke)
  drawingContext.clip(); // Activate clip

  // Draw the crop edge overlays (they will now be clipped to the shape)
  noFill();
  strokeWeight(strokeW);

  for (let i = 0; i < activities.length; i++) {
    let activity = activities[i];
    let strokeColor = getActivityColor(activity);
    if (!strokeColor) continue;

    stroke(strokeColor);

    for (let j = 0; j < uniqueGroups.length; j++) {
      let group = uniqueGroups[j];
      switch (group) {
        case 'root':
        case 'cruciferous':
          drawPointedEdge(size, j + i);
          break;
        case 'leafy':
        case 'herb':
          drawWavyEdge(size, j + i);
          break;
        case 'fruit':
        case 'berry':
          drawLobedEdge(size, j + i);
          break;
        case 'grain':
        case 'legume':
          drawLinearSpikes(size, j + i);
          break;
        case 'vine':
          drawSpiralOverlay(size, j + i);
          break;
        case 'mixed':
        case 'various':
          drawDotRing(size, j + i);
          break;
      }
    }
  }

  drawingContext.restore(); // Restore drawing context
  pop();
}

function drawPointedEdge(size, offsetIndex = 0) {
  let steps = 72;
  beginShape();
  for (let i = 0; i <= steps; i++) {
    let angle = TWO_PI * i / steps;
    let radius = size * 0.45 + (i % 2 === 0 ? 10 : -10);
    let x = cos(angle) * radius;
    let y = sin(angle) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawWavyEdge(size, offsetIndex = 0) {
  let waves = 8 + offsetIndex * 2;
  beginShape();
  for (let angle = 0; angle <= TWO_PI + 0.1; angle += 0.05) {
    let r = size * 0.4 + 10 * sin(waves * angle);
    let x = cos(angle) * r;
    let y = sin(angle) * r;
    curveVertex(x, y);
  }
  endShape(CLOSE);
}

function drawLobedEdge(size, offsetIndex = 0) {
  let lobes = 5 + offsetIndex;
  beginShape();
  for (let angle = 0; angle <= TWO_PI + 0.1; angle += 0.05) {
    let r = size * 0.4 + 8 * sin(lobes * angle);
    let x = cos(angle) * r;
    let y = sin(angle) * r;
    curveVertex(x, y);
  }
  endShape(CLOSE);
}

function drawLinearSpikes(size, offsetIndex = 0) {
  let lines = 12;
  for (let i = 0; i < lines; i++) {
    let angle = TWO_PI * i / lines + offsetIndex * 0.05;
    let x1 = cos(angle) * size * 0.3;
    let y1 = sin(angle) * size * 0.3;
    let x2 = cos(angle) * size * 0.5;
    let y2 = sin(angle) * size * 0.5;
    line(x1, y1, x2, y2);
  }
}

function drawSpiralOverlay(size, offsetIndex = 0) {
  noFill();
  beginShape();
  for (let a = 0; a < TWO_PI * 3; a += 0.1) {
    let r = size * 0.05 * a + offsetIndex * 2;
    let x = cos(a) * r;
    let y = sin(a) * r;
    vertex(x, y);
  }
  endShape();
}

function drawDotRing(size, offsetIndex = 0) {
  let dots = 12 + offsetIndex;
  for (let i = 0; i < dots; i++) {
    let angle = TWO_PI * i / dots;
    let r = size * 0.4;
    let x = cos(angle) * r;
    let y = sin(angle) * r;
    ellipse(x, y, 4);
  }
}


// Draw different line styles based on Animal Type
function drawAnimalLine(animalType, activities, x, y, size, strokeW = 2) {
  if (!animalType || activities.length === 0) return;
  let style = getLineStyle(animalType);
  if (!style) return;

  push();
  noFill();
  strokeWeight(strokeW || style.weight);

  for (let i = 0; i < activities.length; i++) {
    let strokeColor = getActivityColor(activities[i]);
    if (!strokeColor) continue;
    stroke(strokeColor);

    switch (style.type) {
      case 'wavy': drawWavyLine(x, y + i * 4, size); break;
      case 'dashed': drawDashedLine(x, y + i * 4, size); break;
      case 'bezier': drawBezierLine(x, y + i * 4, size); break;
      case 'straight': line(x - size / 2, y + i * 4, x + size / 2, y + i * 4); break;
      case 'textured': drawTexturedLine(x, y + i * 4, size); break;
    }
  }

  pop();
}

function getLineStyle(animalType) {
  let typeStr = String(animalType || '').trim().toLowerCase();
  if (!typeStr) return null;

  switch (typeStr) {
    case 'sheep': return { type: 'wavy', weight: 2 };
    case 'llamas and alpacas': return { type: 'dashed', weight: 2 };
    case 'horse': return { type: 'bezier', weight: 3 };
    case 'cows': return { type: 'straight', weight: 5 };
    case 'cattle': return { type: 'textured', weight: 3 };
    default: return null;
  }
}


// Wavy line: sinusoidal wave along the horizontal axis
function drawWavyLine(x, y, length) {
  noFill();
  beginShape();
  let amplitude = 5;
  let waves = 6;
  for (let i = 0; i <= waves; i++) {
    let px = x - length / 2 + (length / waves) * i;
    let py = y + sin(i * TWO_PI / waves) * amplitude;
    vertex(px, py);
  }
  endShape();
}

// Dashed line: repeated short dashes with gaps
function drawDashedLine(x, y, length) {
  let dashLength = 10;
  let gapLength = 7;
  let startX = x - length / 2;
  let endX = x + length / 2;
  for (let px = startX; px < endX; px += dashLength + gapLength) {
    line(px, y, px + dashLength, y);
  }
}

// Bezier curved line with smooth S shape
function drawBezierLine(x, y, length) {
  noFill();
  bezier(
    x - length / 2, y,
    x - length / 4, y - length / 3,
    x + length / 4, y + length / 3,
    x + length / 2, y
  );
}

function drawTexturedLine(x, y, length) {
  let segmentLength = 6;
  let gap = 4;
  let startX = x - length / 2;
  let endX = x + length / 2;
  let jitterY = 0; // No jitter

  for (let px = startX; px < endX; px += segmentLength + gap) {
    line(px, y + jitterY, px + segmentLength, y + jitterY);
  }
}

function drawHabitatShape(habitatList, x, y, size, baseColor) {
  if (!Array.isArray(habitatList)) return;

  // Filter out empty strings, null, undefined, or whitespace-only values
  habitatList = habitatList
    .map(h => (typeof h === 'string' ? h.trim().toLowerCase() : ''))
    .filter(h => h !== '');

  // Stop if nothing valid remains
  if (habitatList.length === 0) return;

  push();
  translate(x, y);
  rectMode(CENTER);
  angleMode(RADIANS);
  noStroke();

  for (let i = 0; i < habitatList.length; i++) {
    let habitat = habitatList[i];
    let angleOffset = PI / 8 * i;
    let alpha = map(i, 0, habitatList.length, 180, 100);
    let fillColor = color(baseColor.levels[0], baseColor.levels[1], baseColor.levels[2], alpha);

    fill(fillColor);
    rotate(angleOffset);

    switch (habitat) {
      case 'pollinator':
        beginShape();
        for (let j = 0; j < 6; j++) {
          let angle = TWO_PI / 6 * j - PI / 2;
          let vx = cos(angle) * size * 0.5;
          let vy = sin(angle) * size * 0.5;
          vertex(vx, vy);
        }
        endShape(CLOSE);
        break;

      case 'native grasses':
        rect(0, 0, size * 0.3, size);
        break;

      case 'naturalized':
        ellipse(0, 0, size, size);
        break;
    }
  }

  pop();
}

function drawCombinedHabitatOverlay(habitatList, activities, x, y, size) {
  if (!Array.isArray(habitatList) || !Array.isArray(activities)) return;

  const cleanedHabitats = habitatList
    .map(h => (typeof h === 'string' ? h.trim().toLowerCase() : ''))
    .filter(h => h !== '');

  const cleanedActivities = activities
    .map(a => (typeof a === 'string' ? a.trim().toLowerCase() : ''))
    .filter(a => a !== '');

  if (cleanedHabitats.length === 0 || cleanedActivities.length === 0) return;

  // Determine number of layers to draw — always one per activity
  const nestingCount = cleanedActivities.length;

  push();
  translate(x, y);
  angleMode(RADIANS);
  rectMode(CENTER);
  noStroke();

  const layerStep = 0.85 / nestingCount;

  for (let i = 0; i < nestingCount; i++) {
    // Repeat habitat shapes if fewer than activities
    const habitat = cleanedHabitats[i % cleanedHabitats.length];
    const shapeType = getHabitatShapeType(habitat);

    // Cycle activity color
    const activity = cleanedActivities[i];
    const fillCol = getActivityColor(activity);
    if (!fillCol) continue;

    const angleOffset = radians(i * 10); // rotation for contrast
    const scaleFactor = 1 - i * layerStep;
    const shapeSize = size * scaleFactor;

    fill(fillCol);

    push();
    rotate(angleOffset);

    // Tall/narrow for "native grasses"
    if (shapeType === 'rect') {
      drawShapeByType(shapeType, shapeSize * 0.35, shapeSize * 1.1);
    } else {
      drawShapeByType(shapeType, shapeSize, shapeSize);
    }

    pop();
  }

  pop();
}

function getHabitatShapeType(habitat) {
  if (habitat.includes('pollinator')) return 'hexagon';
  if (habitat.includes('native grasses')) return 'rect';
  if (habitat.includes('naturalized')) return 'ellipse';
}


function pointInHexagon(px, py, r) {
  px = abs(px);
  py = abs(py);

  if (px > r * 0.8660254 || py > r * 0.5 + r * 0.288675) return false;
  return r * 0.5 * r * 0.8660254 - px * r * 0.5 - py * r * 0.8660254 >= 0;
}

function drawArrayOverlay(arrayType, activities, x, y, size, strokeW = 1.2, density = 7) {
  if (!arrayType || !Array.isArray(activities) || activities.length === 0) return;

  push();
  translate(x, y);
  rectMode(CENTER);
  strokeWeight(strokeW);
  noFill();

  switch (arrayType) {
   case 'fixed':
    drawCrosshatchGridMultiColor(activities, size, density); break;
  case 'single-axis tracking':
    drawIsometricGridMultiColor(activities, size, density, 1.1); break;
  case 'dual-axis tracking':
    drawDottedMatrixMultiColor(activities, size, density); break;
  }

  pop();
}

function drawCrosshatchGridMultiColor(activities, size, density = 10) {
  let colorCount = activities.length;

  push();
  rotate(PI / 4); // Rotate 45 degrees for diamond orientation

  for (let i = -size / 2, idx = 0; i <= size / 2; i += density, idx++) {
    let col = getActivityColor(activities[idx % colorCount]);
    stroke(col);
    line(i, -size / 2, i, size / 2); // vertical
    line(-size / 2, i, size / 2, i); // horizontal
  }

  pop();
}

function drawIsometricGridMultiColor(activities, size, density = 2, slope = 1.1) {
  let colorCount = activities.length;
  let idx = 0;
  let halfSize = size / 2;

  push(); // Start inner transformation for rotation
  rotate(PI);

  for (let x = -halfSize; x <= halfSize; x += density) {
    // Forward-slanting lines
    stroke(getActivityColor(activities[idx % colorCount]));
    let y1a = -halfSize * slope;
    let y2a = halfSize * slope;
    line(x, y1a, x + halfSize, y2a);
    idx++;

    // Backward-slanting lines
    stroke(getActivityColor(activities[idx % colorCount]));
    let y1b = -halfSize * slope;
    let y2b = halfSize * slope;
    line(x + halfSize, y1b, x, y2b);
    idx++;
  }

  pop(); // End inner transformation
}


function drawDottedMatrixMultiColor(activities, size, density = 10) {
  let step = 10;
  let colorCount = activities.length;
  let dotSize = 3;
  let idx = 0;

  for (let x = -size / 2; x < size / 2; x += density) {
  for (let y = -size / 2; y < size / 2; y += density) {
      fill(getActivityColor(activities[idx % colorCount]));
      noStroke();
      ellipse(x, y, dotSize, dotSize);
      idx++;
    }
  }
}
  
function getActivityColor(activity) {
  switch (activity.trim().toLowerCase()) {
 case 'crop production':
      return color('#E4572E'); // Vivd Orange
    case 'habitat':
      return color('#2E8B57'); // Sea Green
    case 'grazing':
      return color('#005A99'); // Deep Blue
    case 'greenhouse':
      return color('#FFD100'); // Solar Gold
    default:
        pop(); 
        return;
  }
}

function drawMinimalSite(site) {
  const { x, y, activity = 'habitat', systemSize = 0.1, siteSize = 0.1 } = site;

  const baseColor = getActivityColor(activity); 
  const dotBaseSize = map(siteSize, 0, 10, 16, 60);       // Boosted min/max size
  const shadowOffset = map(systemSize, 0, 10, 1, 8);      // Optional: adjust if larger systems need more offset

  push();
  translate(x, y);
  noStroke();

  // Suprematist-style drop shadow
  fill(0, 140); 
  ellipse(shadowOffset, shadowOffset, dotBaseSize, dotBaseSize);

  // White glow ring
  stroke(255, 200);              // Brighter glow
  strokeWeight(dotBaseSize * 0.25); // Glow thickness scales with dot size
  ellipse(0, 0, dotBaseSize * 1.5, dotBaseSize * 1.5);

  // Core dot
  noStroke();
  fill(baseColor);
  ellipse(0, 0, dotBaseSize, dotBaseSize);
  pop();
}

function drawSuprematistOpShadowRect(baseSize, systemSize, habitat = [], posX, posY, glowStrength = 40, isHover = false, animalLineType = '', agrivoltaicColors = []) {
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

  // Positioning
  push();
  translate(posX, posY);
  rectMode(CENTER);
  noStroke();

  // Size & offsets
  let offset = map(sz, 0, 10, 2, 10);
  let shadowSize = map(sz, 0, 10, baseSize * 0.9, baseSize * 1.4);
  let highlightSize = shadowSize * 0.95;

  let widthFactor = 1;
  let heightFactor = 1;
  let rotateRectVertical = false;

  if (shapeType === 'diamond' || shapeType === 'square') {
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

  // Glow alpha pulsating
  let pulse = map(sin(frameCount * 0.08), -1, 1, 0.8, 1);
  let glowAlpha = glowStrength * pulse;
  if (isHover) glowAlpha = min(glowAlpha * 3.5, 255);

  // Default to white if no colors provided
  if (agrivoltaicColors.length === 0) agrivoltaicColors = [color(255)];

  // Color cycling through agrivoltaicColors
  let colorIndex = floor(frameCount / 60) % agrivoltaicColors.length;
  let nextIndex = (colorIndex + 1) % agrivoltaicColors.length;
  let lerpAmt = (frameCount % 60) / 60;
  let baseGlowColor = lerpColor(agrivoltaicColors[colorIndex], agrivoltaicColors[nextIndex], lerpAmt);
  baseGlowColor.setAlpha(glowAlpha);

  // ✨ Blur-like glow layers
  for (let i = 3; i > 0; i--) {
    let layerW = glowW * (1 + i * 0.05);
    let layerH = glowH * (1 + i * 0.05);
    let layerAlpha = glowAlpha * (0.3 / i);
    let layerColor = lerpColor(agrivoltaicColors[colorIndex], agrivoltaicColors[nextIndex], lerpAmt);
    layerColor.setAlpha(layerAlpha);
    fill(layerColor);
    drawShapeByType(shapeType, layerW, layerH);
  }

  // Shadow layers
  fill('#0A0A0A');
  push();
  rotate(radians(-12));
  translate(offset, offset);
  if (rotateRectVertical) rotate(PI);
  drawShapeByType(shapeType, shadowW, shadowH);
  pop();

  fill(255);
  push();
  rotate(radians(8));
  translate(offset * 1.4, offset * 0.8);
  if (rotateRectVertical) rotate(PI);
  drawShapeByType(shapeType, highlightW, highlightH);
  pop();

  fill('#0A0A0A');
  push();
  rotate(radians(3));
  translate(-offset * 0.6, offset * 0.5);
  if (rotateRectVertical) rotate(PI);
  drawShapeByType(shapeType, shadowW * 0.88, shadowH * 0.88);
  pop();

  // Outline
  stroke(255);
  noFill();
  strokeWeight(1);
  if (rotateRectVertical) {
    push();
    rotate(PI);
    drawShapeByType(shapeType, shadowW * 0.7, shadowH * 0.7);
    pop();
  } else {
    drawShapeByType(shapeType, shadowW * 0.7, shadowH * 0.7);
  }

  pop(); // pop positioning

  return {
    offsetX: offset * 1.4,
    offsetY: offset * 0.8,
    angle: radians(8),
    size: highlightSize,
    glowAlpha,
  };
}

function drawShapeByType(type, w, h) {
  switch (type) {
    case 'hexagon':
      beginShape();
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i - PI / 2;
        vertex(cos(angle) * w / 2, sin(angle) * h / 2);
      }
      endShape(CLOSE);
      break;
    case 'ellipse':
      ellipse(0, 0, w, h);
      break;
    case 'rect':
      rect(0, 0, w, h);
      break;
    case 'diamond':
      push();
      rotate(PI / 4); // Rotate square 45 degrees to get diamond
      rect(0, 0, w, h);
      pop();
      break;
    case 'square':
    default:
      rect(0, 0, w, h);
      break;
  }
}

function pathShapeByType(type, size) {
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
      ctx.ellipse(0, 0, size, size);
      break;

    case 'rect':
      ctx.rect(-size * 0.275, -size * 0.5, size * 0.55, size);
      break;

    case 'diamond':
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      break;

    case 'square':
    default:
      ctx.rect(-r, -r, size, size);
      break;
  }
}

function drawPVWarpStyle(pvType, activities, x, y, size) {
  if (!pvType || !activities || activities.length === 0) return;

  let type = pvType.trim().toLowerCase();
  let warpStyle = pvWarpStyles[type];
  if (!warpStyle) return;

  push();
  translate(x, y);
  noFill();
  strokeWeight(3.5);
  blendMode(ADD); // enhances glow-style overlap

  switch (warpStyle) {
    case 'linear':
      for (let i = -size; i <= size; i += 8) {
        let offset = sin((frameCount + i) * 0.05) * 10; // wave for movement
        let colorIndex = Math.floor((i + size) / 8) % activities.length;
        stroke(getActivityColor(activities[colorIndex])); // Bright contrasting color
        line(i, -size + offset, -i * 0.2, size - offset); // Diagonal distortion
      }
      break;

    case 'symmetric':
      for (let i = 0; i < size; i += 4) {
        let yOffset = sin((i + frameCount) * 0.12) * 12; // More pronounced wave
        let colorIndex = Math.floor(i / 4) % activities.length;
        stroke(getActivityColor(activities[colorIndex]));
        line(-size / 2 + i, -yOffset, -size / 2 + i, yOffset);
      }
      break;

    case 'radial':
      for (let r = 12, idx = 0; r < size; r += 10, idx++) {
        stroke(getActivityColor(activities[idx % activities.length]));
        strokeWeight(2 + sin((frameCount + r) * 0.1) * 1.5); // Pulse thickness
        ellipse(0, 0, r * 2, r * 2);
      }
      break;
  }

  pop();
}
