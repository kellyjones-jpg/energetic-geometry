let table;
let entries = [];
let entriesByYear = {};
let yearSlider;
let selectedYear;
let availableYears = [];
let cnv;
let tooltipEntry = null; 

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
}

function setup() {
  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name') || '';
    let activityStr = table.getString(i, 'Agrivoltaic Activities') || '';
    let activities = activityStr ? activityStr.split(/,\s*/) : [];
    let habitatStr = table.getString(i, 'Habitat Type') || '';
    let habitat = habitatStr ? habitatStr.split(/,\s*/) : [];
    let animalTypeStr = table.getString(i, 'Animal Type') || '';
    let animalType = animalTypeStr ? animalTypeStr.split(/,\s*/) : [];
    let cropTypeStr = table.getString(i, 'Crop Types') || '';
    let cropType = cropTypeStr ? cropTypeStr.split(/,\s*/) : [];
    let year = table.getString(i, 'Year Installed') || 'Unknown';

    let entry = {
      name,
      activities,
      habitat,
      animalType,
      cropType,
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

  cnv = createCanvas(1650, 985);
  centerCanvas();
  centerSlider();
  
  cnv.canvas.style.outline = 'none';
  cnv.canvas.style.userSelect = 'none';

  textFont('Helvetica');
  textSize(16);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);
  noLoop();
}

function windowResized() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSize = 150;
  let availableHeight = height - 160; // account for top/bottom margins
  let maxEntries = yearEntries.length;
  let padding = (availableHeight - (shapeSize * maxEntries)) / (maxEntries + 1);
  padding = max(10, padding); // minimum padding
  let startY = 80 + padding;


  resizeCanvas(1650, 985);
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
  background(255);
  fill(0);
  textSize(24);
  textAlign(CENTER, TOP);
  text("Year: " + selectedYear, width / 2, 30);

  let yearEntries = entriesByYear[selectedYear] || [];

  if (yearEntries.length === 0) {
    text("No data available for this year.", width / 2, height / 2);
    return;
  }

let shapeSize = 150;
let availableHeight = height - 160; // account for top/bottom margins
let maxEntries = yearEntries.length;
let padding = (availableHeight - (shapeSize * maxEntries)) / (maxEntries + 1);
padding = max(10, padding); // minimum padding
let startY = 80 + padding;


  for (let i = 0; i < yearEntries.length; i++) {
  let entry = yearEntries[i];
  let centerX = width / 2;
  let centerY = startY + i * (shapeSize + padding);
  let baseColor = getActivityColor(entry.activities?.[0] || '');

  push();
  translate(centerX, centerY);

  // Habitat shape
  if (Array.isArray(entry.habitat) && entry.habitat.length > 0) {
    drawHabitatShape(entry.habitat, 0, 0, shapeSize, baseColor);
  }

// Activities
if (Array.isArray(entry.activities) && entry.activities.length > 0) {
  let activityColors = entry.activities.map(act => getActivityColor(act));
  if (activityColors.length === 1) {
    activityColors.push(activityColors[0]); // duplicate for checkerboard to work
  }
  drawCheckerboardPattern(entry.activities, entry.habitat, 0, 0, shapeSize);
}


  // Crop edges
  if (entry.cropType && entry.cropType.length > 0) {
    drawCropEdgeStyle(entry.cropType, 0, 0, shapeSize);
  }

  // Animal line
  if (entry.animalType && entry.animalType.length > 0) {
    drawAnimalLine(entry.animalType, 0, 0, shapeSize);
  }

  // Draw label (NOT rotated)
  textSize(14);
  textAlign(CENTER, TOP);
  text(entry.name, centerX, centerY + shapeSize / 2 + 8);
}


  if (tooltipEntry) {
    drawTooltip(tooltipEntry);
  }
}

function drawTooltip(entry) {
  let textLines = [
    "Name: " + entry.name,
    "Habitat Type: " + (Array.isArray(entry.habitat) ? entry.habitat.join(', ') : entry.habitat),
    "Activities: " + entry.activities.join(', '),
    "Animal Type: " + entry.animalType.join(', '),
    "Crop Type: " + (Array.isArray(entry.cropType) ? entry.cropType.join(', ') : String(entry.cropType))
  ];

  textSize(14);
  let w = 0;
  for (let line of textLines) {
    w = max(w, textWidth(line));
  }
  let h = textLines.length * 18 + 10;

  let x = entry.x + 15;
  let y = entry.y + 15;

  if (x + w + 10 > width) x -= w + 30;
  if (y + h + 10 > height) y -= h + 30;

  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(x, y, w + 10, h, 6);

  noStroke();
  fill(0);
  for (let i = 0; i < textLines.length; i++) {
    text(textLines[i], x + 5, y + 20 + i * 18 - 10);
  }
}

function mousePressed() {
  let yearEntries = entriesByYear[selectedYear] || [];
  let shapeSize = 150;
  let padding = 60;
  let startY = 80;

  tooltipEntry = null;

  for (let i = 0; i < yearEntries.length; i++) {
    let columns = floor(width / (shapeSize + padding));
    let row = floor(i / columns);
    let col = i % columns;

    let centerX = padding / 2 + col * (shapeSize + padding) + shapeSize / 2;
    let centerY = startY + row * (shapeSize + padding);
    let d = dist(mouseX, mouseY, centerX, centerY);

    if (d < shapeSize / 2) {
      tooltipEntry = { ...yearEntries[i], x: mouseX, y: mouseY };
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
  }

  // Move between tiles with arrow keys
  let yearEntries = entriesByYear[selectedYear];
  if (!yearEntries) return;

  let currentIndex = yearEntries.findIndex(e => e.name === tooltipEntry.name);
  if (currentIndex === -1) return;

  if (keyCode === RIGHT_ARROW && currentIndex < yearEntries.length - 1) {
    tooltipEntry = { ...yearEntries[currentIndex + 1], x: 100, y: 100 };
    redraw();
  } else if (keyCode === LEFT_ARROW && currentIndex > 0) {
    tooltipEntry = { ...yearEntries[currentIndex - 1], x: 100, y: 100 };
    redraw();
  }
}

function drawCropEdgeStyle(cropTypes, x, y, size) {
  if (!Array.isArray(cropTypes) || cropTypes.length === 0) return;

  // Map each crop to its group
  const groups = cropTypes
    .map(crop => cropEdgeGroups[crop.trim().toLowerCase()])
    .filter(Boolean);

  // Collect unique crop groups
  const uniqueGroups = [...new Set(groups)];
  if (uniqueGroups.length === 0) return;

  push();
  translate(x, y);
  noFill();
  strokeWeight(2);

  for (let i = 0; i < uniqueGroups.length; i++) {
    let group = uniqueGroups[i];

    // Set stroke color by group
     switch (group) {
      case 'root':
        stroke('#A020F0'); // Purple
        drawPointedEdge(size, i);
        break;
      case 'leafy':
        stroke('#D2691E'); // Earthy orange-brown
        drawWavyEdge(size, i);
        break;
      case 'fruit':
        stroke('#1155CC'); // Blue
        drawLobedEdge(size, i);
        break;
      case 'grain':
        stroke('#DAA520'); // Goldenrod
        drawLinearSpikes(size, i);
        break;
      case 'vine':
        stroke('#FF1493'); // Hot pink
        drawSpiralOverlay(size, i);
        break;
      case 'mixed':
        stroke('#20C997'); // Mint-teal
        drawWavyEdge(size, i);
        break;
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
function drawAnimalLine(animalType, x, y, size) {
  let style = getLineStyle(animalType);
  if (!style) return;
  stroke(style.color);
  strokeWeight(style.weight);
  noFill();

  switch (style.type) {
    case 'wavy':
      drawWavyLine(x, y, size);
      break;

    case 'dashed':
      drawDashedLine(x, y, size);
      break;

    case 'bezier':
      drawBezierLine(x, y, size);
      break;

    case 'straight':
      line(x - size / 2, y, x + size / 2, y);
      break;

    case 'textured':
      drawTexturedLine(x, y, size);
      break;

  }
}

// Map Animal Type to line style properties
function getLineStyle(animalType) {
  let typeStr = String(animalType || '').trim().toLowerCase();

  if (!typeStr) return null;

  switch (typeStr) {
    case 'sheep':
      return { type: 'wavy', weight: 2, color: color('#E63946CC') }; // Suprematist-inspired crimson
    case 'llamas & alpacas':
      return { type: 'dashed', weight: 2, color: color('#3A0CA3CC') }; // Deep violet-blue
    case 'horse':
      return { type: 'bezier', weight: 3, color: color('#FF6700CC') }; // Vivid orange
    case 'cows':
      return { type: 'straight', weight: 5, color: color('#B7410ECC') }; // Warm brick tone
    case 'cattle':
      return { type: 'textured', weight: 3, color: color('#D8837FCC') }; // Dusty rose
    default:
        pop(); 
        return;
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
  if (!Array.isArray(habitatList) || habitatList.length === 0) return;

  push();
  translate(x, y);

  let angleOffset = 15; // degrees to rotate each shape slightly
  let alphaStep = 255 / (habitatList.length + 1); // transparency per shape

  for (let i = 0; i < habitatList.length; i++) {
    let habitat = habitatList[i]?.trim().toLowerCase();
    let shapeAlpha = 180 - i * alphaStep;

    fill(red(baseColor), green(baseColor), blue(baseColor), shapeAlpha);
    noStroke();
    push();
    rotate(radians(i * angleOffset));

    switch (habitat) {
      case 'pollinator':
        beginShape();
        for (let j = 0; j < 6; j++) {
          let angle = TWO_PI / 6 * j - PI / 2;
          vertex(cos(angle) * size * 0.5, sin(angle) * size * 0.5);
        }
        endShape(CLOSE);
        break;

      case 'native grasses':
        rectMode(CENTER);
        rect(0, 0, size * 0.3, size);
        break;

      case 'naturalized':
        ellipse(0, 0, size, size);
        break;
    }

    pop();
  }

  pop();
}


function drawCheckerboardPattern(activities, shapeType, x, y, size) {
  let gridCount = 6;
  let cellSize = size / gridCount;

  let activityColors = activities.map(act => getActivityColor(act));
  if (activityColors.length === 1) activityColors.push(activityColors[0]); // Ensure at least 2

  // Step 1: Draw checkerboard pattern to graphics
  let patternGfx = createGraphics(size, size);
  patternGfx.noStroke();

  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      let colorIndex = (row * gridCount + col) % activityColors.length;
      patternGfx.fill(activityColors[colorIndex]);
      patternGfx.rect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }

  // Step 2: Draw shape mask
  let maskGfx = createGraphics(size, size);
  maskGfx.translate(size / 2, size / 2);
  maskGfx.noStroke();
  maskGfx.fill(255); // white shows through mask

  if (Array.isArray(shapeType) && shapeType.length > 0) {
    for (let i = 0; i < shapeType.length; i++) {
      let shape = shapeType[i]?.trim().toLowerCase();
      maskGfx.push();
      maskGfx.rotate(radians(i * 15));
      switch (shape) {
        case 'pollinator':
          maskGfx.beginShape();
          for (let j = 0; j < 6; j++) {
            let angle = TWO_PI / 6 * j - PI / 2;
            let vx = cos(angle) * size * 0.25;
            let vy = sin(angle) * size * 0.25;
            maskGfx.vertex(vx, vy);
          }
          maskGfx.endShape(CLOSE);
          break;
        case 'native grasses':
          maskGfx.rectMode(CENTER);
          maskGfx.rect(0, 0, size * 0.15, size * 0.5);
          break;
        case 'naturalized':
          maskGfx.ellipse(0, 0, size * 0.5);
          break;
      }
      maskGfx.pop();
    }
  }

  // Step 3: Convert patternGfx and maskGfx to p5.Image
  let patternImg = patternGfx.get();
  let maskImg = maskGfx.get();
  patternImg.mask(maskImg); // this now works

  // Step 4: Draw the masked pattern at (x, y)
  imageMode(CENTER);
  image(patternImg, x, y);
}



function isPointInHabitatShape(habitat, px, py, size) {
  switch (habitat?.trim().toLowerCase()) {
    case 'pollinator':
      return pointInHexagon(px, py, size * 0.5);
    case 'native grasses':
      return (abs(px) <= size * 0.15 && abs(py) <= size * 0.5);
    case 'naturalized':
      return (px * px + py * py <= (size / 2) * (size / 2));
    default:
        return false;
  }
}

function pointInHexagon(px, py, r) {
  px = abs(px);
  py = abs(py);

  if (px > r * 0.8660254 || py > r * 0.5 + r * 0.288675) return false;
  return r * 0.5 * r * 0.8660254 - px * r * 0.5 - py * r * 0.8660254 >= 0;
}


function getActivityColor(activity) {
  switch (activity.trim().toLowerCase()) {
 case 'crop production':
      return color('#DA1E37'); // Bold red
    case 'habitat':
      return color('#228B22'); // Forest green
    case 'grazing':
      return color('#007CBE'); // Blue
    case 'greenhouse':
      return color('#F2D43D'); // Yellow
    default:
        pop(); 
        return;
  }
}
