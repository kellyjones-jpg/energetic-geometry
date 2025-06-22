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
  "garlic": "root",
  "onions": "root",
  "yams": "root",
  "turnips": "root",
  "potatoes": "root",

  // Leafy greens
  "spinach": "leafy",
  "kale": "leafy",
  "chard": "leafy",
  "lettuce": "leafy",
  "cabbage": "leafy",
  "arugula": "leafy",
  "herbs": "leafy",
  "greens": "leafy",

  // Fruit-bearing
  "tomatoes": "fruit",
  "squash": "fruit",
  "peppers": "fruit",
  "melons": "fruit",
  "eggplant": "fruit",
  "cucumbers": "fruit",
  "berries": "fruit",

  // Grains & grasses
  "hay": "grain",
  "spring wheat": "grain",
  "corn": "grain",
  "saffron": "grain",

  // Vining / perennial
  "grapes": "vine",
  "vanilla": "vine",
  "tea": "vine",
  "kiwi": "vine",
  "lavender": "vine",
  "peppercorn": "vine",
  "maile": "vine",

  // Mixed
  "mixed vegetables": "mixed",
  "assorted vegetables": "mixed"
};

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
  bgImg = loadImage('images/pexels-tomfisk-19117245.jpg');
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

  yearSlider = createSlider(0, availableYears.length - 1, 0);
  yearSlider.style('width', '400px');
  yearSlider.input(() => {
    selectedYear = availableYears[yearSlider.value()];
    windowResized(); // triggers height adjustment
  });

  cnv = createCanvas(windowWidth * 0.9, windowHeight * 0.8);
  centerCanvas();
  centerSlider();

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

  resizeCanvas(windowWidth * 0.9, max(windowHeight * 0.8, totalHeight));
  centerCanvas();
  centerSlider();
  redraw();
}

function centerCanvas() {
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2 - 30;
  cnv.position(x, y);
}

function centerSlider() {
  let sliderWidth = parseInt(yearSlider.style('width'));
  let x = windowWidth / 2 - sliderWidth / 2;
  let y = windowHeight - 60;
  yearSlider.position(x, y);
}

function draw() {
  // Draw background image dimmed and semi-transparent
  tint(150, 200);  // soften colors, 200 alpha opacity
  image(bgImg, 0, 0, width, height);
  tint(255);       // reset tint to default
  
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

  if (tooltipEntry) {
    drawTooltip(tooltipEntry);
  }
}


function drawTooltip(entry) {
  const formatArray = arr =>
    Array.isArray(arr) ? arr.map(s => capitalizeWords(s)).join(', ') : String(arr);

  let textLines = [];

  if (entry.name) textLines.push("Name: " + entry.name);
  if (entry.habitat && entry.habitat.length > 0) textLines.push("Habitat Type: " + formatArray(entry.habitat));
  if (entry.activities && entry.activities.length > 0) textLines.push("Activities: " + formatArray(entry.activities));
  if (entry.animalType && entry.animalType.length > 0) textLines.push("Animal Type: " + formatArray(entry.animalType));
  if (entry.cropType && entry.cropType.length > 0) textLines.push("Crop Type: " + formatArray(entry.cropType));
  if (entry.arrayType) textLines.push("Array Type: " + capitalizeWords(entry.arrayType));

  // TEXT STYLE
  let lineHeight = 16;
  let padding = 12;
  textSize(14);
  textAlign(LEFT, TOP);
  let w = 0;

  for (let line of textLines) {
    w = max(w, textWidth(line));
  }

  let h = textLines.length * lineHeight + padding;

  // Position
  let x = entry.x + 15;
  let y = entry.y + 15;

  if (x + w + 20 > width) x -= w + 30;
  if (y + h + 20 > height) y -= h + 30;

  // Draw background
  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(x, y, w + 20, h, 12); // width auto-adjusts to longest line

  // Draw text
  noStroke();
  fill(0);
  for (let i = 0; i < textLines.length; i++) {
    text(textLines[i], x + 10, y + 8 + i * lineHeight);
  }
}


function capitalizeWords(str) {
  return String(str)
    .trim()
    .split(/\s+/)
    .map(word => {
      // Preserve acronyms (already all uppercase, 2+ letters)
      if (word.length > 1 && word === word.toUpperCase()) return word;
      // Otherwise capitalize normally
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function mousePressed() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSize = 150;
  let padding = 60;
  let startY = 80;

  tooltipEntry = null;

  // Calculate number of columns fitting in the current canvas width
  let numCols = floor((width - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);

  for (let i = 0; i < yearEntries.length; i++) {
    let col = i % numCols;
    let row = floor(i / numCols);

    let centerX = padding + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding) + shapeSize / 2;

    let d = dist(mouseX, mouseY, centerX, centerY);

    if (d < shapeSize / 2) {
      // Show tooltip near the shape center (you can also use mouseX/mouseY if preferred)
      tooltipEntry = { ...yearEntries[i], x: centerX, y: centerY };
      break;
    }
  }

  redraw();
}

function keyPressed() {
  if (!tooltipEntry) return;

  // Press 'Escape' to close tooltip
  if (keyCode === ESCAPE) {
    tooltipEntry = null;
    redraw();
    return;
  }

  // Move between tiles with arrow keys
  let yearEntries = entriesByYear[selectedYear];
  if (!yearEntries) return;

  let currentIndex = yearEntries.findIndex(e => e.name === tooltipEntry.name);
  if (currentIndex === -1) return;

  let shapeSize = 150;
  let padding = 60;
  let startY = 80;
  let numCols = floor((width - padding) / (shapeSize + padding));
  numCols = max(numCols, 1);

  if (keyCode === RIGHT_ARROW && currentIndex < yearEntries.length - 1) {
    let newIndex = currentIndex + 1;
    let col = newIndex % numCols;
    let row = floor(newIndex / numCols);
    let centerX = padding + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding) + shapeSize / 2;

    tooltipEntry = { ...yearEntries[newIndex], x: centerX, y: centerY };
    redraw();

  } else if (keyCode === LEFT_ARROW && currentIndex > 0) {
    let newIndex = currentIndex - 1;
    let col = newIndex % numCols;
    let row = floor(newIndex / numCols);
    let centerX = padding + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding) + shapeSize / 2;

    tooltipEntry = { ...yearEntries[newIndex], x: centerX, y: centerY };
    redraw();
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
        case 'root': drawPointedEdge(size, j + i); break;
        case 'leafy': drawWavyEdge(size, j + i); break;
        case 'fruit': drawLobedEdge(size, j + i); break;
        case 'grain': drawLinearSpikes(size, j + i); break;
        case 'vine': drawSpiralOverlay(size, j + i); break;
        case 'mixed': drawWavyEdge(size, j + i); break;
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

// Draw different line styles based on Animal Type
function drawAnimalLine(animalType, activities, x, y, size) {
  if (!animalType || activities.length === 0) return;
  let style = getLineStyle(animalType);
  if (!style) return;

  push();
  noFill();
  strokeWeight(style.weight);

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
    case 'llamas & alpacas': return { type: 'dashed', weight: 2 };
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

// Textured line: short broken segments with jitter
function drawTexturedLine(x, y, length) {
  let segmentLength = 6;
  let gap = 4;
  let startX = x - length / 2;
  let endX = x + length / 2;
  for (let px = startX; px < endX; px += segmentLength + gap) {
    let jitterY = random(-2, 2);
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
