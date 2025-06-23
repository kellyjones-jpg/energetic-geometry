let table;
let entries = [];
let entriesByYear = {};
let yearSlider;
let selectedYear;
let availableYears = [];
let cnv;
let tooltipEntry = null; 
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


function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
  bgImg = loadImage('images/pexels-tomfisk-19117245.jpg');
}

function setup() {
  // Load and organize data
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

    let entry = {
      name,
      activities,
      habitat,
      animalType,
      cropType,
      arrayType: arrayTypeStr.trim().toLowerCase(), 
      year
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
  let totalHeight = 100 + numRows * (shapeSize + padding);
  let maxCanvasHeight = 1080;
  let initialHeight = min(windowHeight * 0.8, maxCanvasHeight);

  cnv = createCanvas(initialWidth, min(totalHeight, initialHeight));
  cnv.parent('sketch-container');

  // Create the slider
  yearSlider = createSlider(0, availableYears.length - 1, 0);
  yearSlider.style('width', '400px');
  yearSlider.parent('sketch-container');
  yearSlider.input(() => {
    selectedYear = availableYears[yearSlider.value()];
    windowResized();
  });

  textFont('Helvetica');
  textSize(16);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  noLoop();
}

function windowResized() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSize = 150;
  let padding = 60;
  let numCols = floor((windowWidth * 0.9 - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);

  let numRows = ceil(yearEntries.length / numCols);
  let totalHeight = 100 + numRows * (shapeSize + padding);
  let maxCanvasHeight = 1000;

  resizeCanvas(windowWidth * 0.9, min(windowHeight * 0.8, maxCanvasHeight, totalHeight));
  redraw();
}


function draw() {
  // Draw background image dimmed and semi-transparent
  image(bgImg, 0, 0, width, height);
  noStroke();
  rectMode(CORNER);          // switch to CORNER mode to cover full canvas
  fill(0, 180);              // black with semi-transparent alpha
  rect(0, 0, width, height); // cover entire canvas
  rectMode(CENTER);          // restore if needed for other rects
  
  fill(255);
  textSize(24);
  textAlign(CENTER, TOP);
  text("Year: " + selectedYear, width / 2, 30);

  let yearEntries = entriesByYear[selectedYear] || [];

  if (yearEntries.length === 0) {
    text("No data available for this year.", width / 2, height / 2);
    return;
  }

  let padding = 60;
  let shapeSize = 150;
  let startY = 80;
  let numCols = floor((width - padding) / (shapeSize + padding)); // calculate number of columns that fit

  for (let i = 0; i < yearEntries.length; i++) {
    let entry = yearEntries[i];
    let col = i % numCols;
    let row = floor(i / numCols);

    let centerX = padding + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding) + shapeSize / 2;
    let baseColor = getActivityColor(entry.activities?.[0] || '');

    push();
    translate(centerX, centerY);

    if (Array.isArray(entry.habitat) && entry.habitat.length > 0) {
      drawHabitatShape(entry.habitat, 0, 0, shapeSize, baseColor);
    }

    if (Array.isArray(entry.activities) && entry.activities.length > 0 &&
        Array.isArray(entry.habitat) && entry.habitat.length > 0) {
      drawCheckerboardPattern(entry.activities, entry.habitat, 0, 0, shapeSize);
    }

    if (entry.cropType && entry.cropType.length > 0) {
      drawCropEdgeStyle(entry.cropType, entry.activities, 0, 0, shapeSize);

    }

    if (entry.animalType && entry.animalType.length > 0) {
      drawAnimalLine(entry.animalType, entry.activities, 0, 0, shapeSize);
    }
    if (entry.arrayType) {
      drawArrayOverlay(entry.arrayType, entry.activities, 0, 0, shapeSize);
    }
    
    pop();
  }
}


function showTooltip(entry) {
  tooltipEntry = entry; // Keep track of current tooltip for keyboard nav
  const tooltip = document.getElementById('tooltip');

  if (!entry) {
    tooltip.style.display = 'none';
    return;
  }

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, c => c.toUpperCase());

  const formatArray = (arr) =>
    Array.isArray(arr) ? arr.map(s => capitalizeWords(s)).join(', ') : String(arr);

  let lines = [];

  if (entry.name) lines.push(`<strong>Name:</strong> ${entry.name}`);
  if (entry.activities && entry.activities.length) lines.push(`<strong>Agrivoltaic Activities:</strong> ${formatArray(entry.activities)}`);
  if (entry.arrayType) lines.push(`<strong>Type of Array:</strong> ${capitalizeWords(entry.arrayType)}`);
  if (entry.habitat && entry.habitat.length) lines.push(`<strong>Habitat Types:</strong> ${formatArray(entry.habitat)}`);
  if (entry.cropType && entry.cropType.length) lines.push(`<strong>Crop Type:</strong> ${formatArray(entry.cropType)}`);
  if (entry.animalType && entry.animalType.length) lines.push(`<strong>Animal Type:</strong> ${formatArray(entry.animalType)}`);

  tooltip.innerHTML = lines.join('<br>');

  // Position tooltip relative to canvas on the page
  let canvasRect = cnv.elt.getBoundingClientRect();

  let left = canvasRect.left + entry.x + 15;
  let top = canvasRect.top + entry.y + 15;

  // Prevent tooltip from going off screen horizontally
  if (left + tooltip.offsetWidth + 20 > window.innerWidth) {
    left = canvasRect.left + entry.x - tooltip.offsetWidth - 20;
  }
  // Prevent tooltip from going off screen vertically
  if (top + tooltip.offsetHeight + 20 > window.innerHeight) {
    top = canvasRect.top + entry.y - tooltip.offsetHeight - 20;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.style.display = 'block';
}

function mousePressed() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSize = 150;
  let padding = 60;
  let startY = 80;

  let foundEntry = null;

  let numCols = floor((width - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);

  for (let i = 0; i < yearEntries.length; i++) {
    let col = i % numCols;
    let row = floor(i / numCols);

    let centerX = padding + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding) + shapeSize / 2;

    let d = dist(mouseX, mouseY, centerX, centerY);

    if (d < shapeSize / 2) {
      foundEntry = { ...yearEntries[i], x: centerX, y: centerY };
      break;
    }
  }

  if (foundEntry) {
    showTooltip(foundEntry);
  } else {
    showTooltip(null);
  }
}

function keyPressed() {
  let yearEntries = entriesByYear[selectedYear];
  if (!yearEntries) return;
  if (!tooltipEntry) return;

  let currentIndex = yearEntries.findIndex(e => e.name === tooltipEntry.name);
  if (currentIndex === -1) return;

  let shapeSize = 150;
  let padding = 60;
  let startY = 80;
  let numCols = floor((width - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);

  let newIndex = currentIndex;

  if (keyCode === ESCAPE) {
    showTooltip(null);
    return;
  } else if (keyCode === RIGHT_ARROW && currentIndex < yearEntries.length - 1) {
    newIndex = currentIndex + 1;
  } else if (keyCode === LEFT_ARROW && currentIndex > 0) {
    newIndex = currentIndex - 1;
  }

  if (newIndex !== currentIndex) {
    let col = newIndex % numCols;
    let row = floor(newIndex / numCols);
    let centerX = padding + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding) + shapeSize / 2;

    let newEntry = { ...yearEntries[newIndex], x: centerX, y: centerY };
    showTooltip(newEntry);
  }
}

function drawCropEdgeStyle(cropTypes, activities, x, y, size) {
  if (!Array.isArray(cropTypes) || cropTypes.length === 0) return;
  if (!Array.isArray(activities) || activities.length === 0) return;

  const groups = cropTypes
    .map(crop => cropEdgeGroups[crop.trim().toLowerCase()])
    .filter(Boolean);
  const uniqueGroups = [...new Set(groups)];
  if (uniqueGroups.length === 0) return;

  push();
  translate(x, y);
  noFill();
  strokeWeight(2);

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
function drawAnimalLine(animalTypes, activities, x, y, size) {
  if (!Array.isArray(animalTypes) || animalTypes.length === 0 || activities.length === 0) return;

  push();
  translate(x, y);

  for (let i = 0; i < animalTypes.length; i++) {
    let type = animalTypes[i];
    let style = getLineStyle(type);
    if (!style) continue;

    let activity = activities[i % activities.length];
    let activityColor = getActivityColor(activity);

    // Skip drawing if no color found for this activity (no fallback)
    if (!activityColor) continue;

    stroke(activityColor);
    strokeWeight(style.weight || 2);

    switch (style.type) {
      case 'wavy':
        drawWavyLine(size, i);
        break;
      case 'dashed':
        drawDashedLine(size, i);
        break;
      case 'bezier':
        drawBezierLine(size, i);
        break;
      case 'straight':
        drawStraightLine(size, i);
        break;
      case 'textured':
        drawTexturedLine(size, i);
        break;
    }
  }

  pop();
}

function getLineStyle(typeStr) {
  if (typeof typeStr !== 'string') return null;
  typeStr = typeStr.toLowerCase().trim().replace(/and/g, '&');

  switch (typeStr) {
    case 'sheep': return { type: 'wavy', weight: 2 };
    case 'llamas & alpacas': return { type: 'dashed', weight: 2 };
    case 'horse': return { type: 'bezier', weight: 3 };
    case 'cows': return { type: 'straight', weight: 5 };
    case 'cattle': return { type: 'textured', weight: 3 };
    default: return null;
  }
}

function drawWavyLine(size, offsetIndex = 0) {
  fill(activityColor);
  strokeWeight(2);
  beginShape();
  let waves = 8 + offsetIndex * 2;
  for (let angle = 0; angle <= TWO_PI + 0.1; angle += 0.05) {
    let r = size * 0.4 + 10 * sin(waves * angle);
    let x = cos(angle) * r;
    let y = sin(angle) * r;
    vertex(x, y);
  }
  endShape(CLOSE);
}

function drawDashedLine(size, offset = 0) {
  let dashLength = 10;
  for (let x = -size / 2; x < size / 2; x += dashLength * 2) {
    line(x, 0, x + dashLength, 0);
  }
}

function drawBezierLine(size, offset = 0) {
  noFill();
  bezier(-size / 2, 0, -size / 4, -size / 4, size / 4, size / 4, size / 2, 0);
}

function drawStraightLine(size, offset = 0) {
  line(-size / 2, 0, size / 2, 0);
}

function drawTexturedLine(size, offset = 0) {
  for (let x = -size / 2; x < size / 2; x += 6) {
    line(x, -3, x, 3);
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

function drawCheckerboardPattern(activities, habitat, x, y, size) {
  if (!Array.isArray(activities) || activities.length === 0) return;
  if (!Array.isArray(habitat) || habitat.length === 0) return;

  // Sanitize habitat list
  habitat = habitat
    .map(h => (typeof h === 'string' ? h.trim().toLowerCase() : ''))
    .filter(h => h !== '');
  if (habitat.length === 0) return;

  push();
  translate(x, y);
  rectMode(CENTER);
  noStroke();

  let gridCount = 8; // 8x8 grid
  let cellSize = size / gridCount;
  let colors = activities.map(act => getActivityColor(act)).filter(Boolean);
  let colorCount = colors.length;
  if (colorCount === 0) return;

  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      let index = (row + col) % colorCount;  // alternate diagonally
      let fillColor = colors[index];

      let cx = col * cellSize - size / 2 + cellSize / 2;
      let cy = row * cellSize - size / 2 + cellSize / 2;

      if (isPointInHabitatShape(habitat, cx, cy, size)) {
        fill(fillColor);
        rect(cx, cy, cellSize, cellSize);
      }
    }
  }

  pop();
}


function isPointInHabitatShape(habitat, px, py, size) {
  // Ensure habitat is an array
  let habitats = Array.isArray(habitat) ? habitat : [habitat];

  for (let h of habitats) {
  if (typeof h !== 'string') continue;

  let cleaned = h.trim().toLowerCase();
    switch (cleaned) {
      case 'pollinator':
        if (pointInHexagon(px, py, size * 0.5)) return true;
        break;
      case 'native grasses':
        if (abs(px) <= size * 0.15 && abs(py) <= size * 0.5) return true;
        break;
      case 'naturalized':
        if (px * px + py * py <= (size / 2) * (size / 2)) return true;
        break;
    }
  }

  return false; // if no matches
}

function pointInHexagon(px, py, r) {
  px = abs(px);
  py = abs(py);

  if (px > r * 0.8660254 || py > r * 0.5 + r * 0.288675) return false;
  return r * 0.5 * r * 0.8660254 - px * r * 0.5 - py * r * 0.8660254 >= 0;
}

function drawArrayOverlay(arrayType, activities, x, y, size) {
  if (!arrayType || !Array.isArray(activities) || activities.length === 0) return;

  push();
  translate(x, y);
  rectMode(CENTER);
  strokeWeight(1.2);
  noFill();

  switch (arrayType) {
   case 'fixed':
    drawCrosshatchGridMultiColor(activities, size, 18); break;
   case 'single-axis tracking':
    drawIsometricGridMultiColor(activities, size, 11, 1.35);
    break;
  case 'dual-axis tracking':
    drawDottedMatrixMultiColor(activities, size, 8); break;
  }

  pop();
}

function drawCrosshatchGridMultiColor(activities, size, step = 11) {
  let colorCount = activities.length;

  push();
  rotate(PI / 4); // Rotate 45 degrees for diamond orientation

  for (let i = -size / 2, idx = 0; i <= size / 2; i += step, idx++) {
    let col = getActivityColor(activities[idx % colorCount]);
    stroke(col);
    line(i, -size / 2, i, size / 2); // vertical
    line(-size / 2, i, size / 2, i); // horizontal
  }

  pop();
}

function drawIsometricGridMultiColor(activities, size, step = 7, slope = 1.35) {
  let colorCount = activities.length;
  let idx = 0;
  let halfSize = size / 2;

  push(); // Start inner transformation for rotation
  rotate(HALF_PI);

  for (let x = -halfSize; x <= halfSize; x += step) {
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


function drawDottedMatrixMultiColor(activities, size) {
  let step = 10;
  let colorCount = activities.length;
  let dotSize = 3;
  let idx = 0;

  for (let x = -size / 2; x < size / 2; x += step) {
    for (let y = -size / 2; y < size / 2; y += step) {
      fill(getActivityColor(activities[idx % colorCount]));
      noStroke();
      ellipse(x, y, dotSize, dotSize);
      idx++;
    }
  }
}
  
function getActivityColor(activity) {
  switch (activity.toLowerCase()) {
    case 'grazing': return color('#005A99');
    case 'crop production': return color('#E4572E');
    case 'habitat': return color('#2E8B57');
    case 'greenhouse': return color('#FFD100');
    default: return null;  // <-- no fallback color here
  }
}
