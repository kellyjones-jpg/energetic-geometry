// Updated sketch.js with timeline slider and dynamic year-based grouping
let table;
let entries = [];
let entriesByYear = {};
let yearSlider;
let selectedYear;
let availableYears = [];
let tooltipEntry = null;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

function setup() {
  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name') || '';
    let activityStr = table.getString(i, 'Agrivoltaic Activities') || '';
    let activities = activityStr ? activityStr.split(/,\s*/) : [];
    let habitat = table.getString(i, 'Habitat Type') || '';
    let pvTech = table.getString(i, 'PV Technology') || '';
    let animalTypeStr = table.getString(i, 'Animal Type') || '';
    let animalType = animalTypeStr ? animalTypeStr.split(/,\\s*/) : [];
    let cropType = table.getString(i, 'Crop Types') || '';
    let year = table.getString(i, 'Year Installed') || 'Unknown';

    let entry = {
      name,
      activities,
      habitat,
      pvTech,
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
  yearSlider.position(20, 20);
  yearSlider.style('width', '400px');
  yearSlider.input(() => {
    selectedYear = availableYears[yearSlider.value()];
    redraw();
  });

  createCanvas(1650, 800); // Temporary height, adjusted in draw()
  textFont('Helvetica');
  textSize(16);
  textAlign(LEFT, TOP);
  rectMode(CORNER);
  noLoop();
}

function draw() {
  let cols = 6;
  let tileHeight = 250;
  let yearEntries = entriesByYear[selectedYear] || [];
  let rows = ceil(yearEntries.length / cols);
  let canvasHeight = rows * tileHeight;

  resizeCanvas(1650, canvasHeight);
  background(255);

  let w = width / cols;
  let h = tileHeight;
  let padding = 28;
  tooltipEntry = null;

  fill(0);
  textSize(24);
  textAlign(LEFT, CENTER);
  text("Year: " + selectedYear, 440, 30);

  for (let i = 0; i < yearEntries.length; i++) {
    let x = (i % cols) * w;
    let y = floor(i / cols) * h;
    let entry = yearEntries[i];

    fill(255);
    noStroke();
    rect(x, y, w, h - 40);

    let shapeSize = min(w, h - 40) * 0.6;
    push();
    translate(x + w / 2, y + (h - 40) / 2);

    let baseColor = getActivityColor(entry.activities[0]);
    drawHabitatShape(entry.habitat, 0, 0, shapeSize, baseColor);

    if (entry.activities.length > 1) {
      drawCheckerboardPattern(entry.activities, entry.habitat, 0, 0, shapeSize);
    }

    drawCropEdgeStyle(entry.cropType, 0, 0, shapeSize);
    drawAnimalLine(entry.animalType, 0, 0, shapeSize);
    drawPVShape(entry.pvTech, 0, 0, shapeSize * 0.5, baseColor);
    pop();

    // Footer labels
    fill(255);
    noStroke();
    rect(x, y + h - 40, w, 40);

    fill(0);
    textSize(14);
    text(entry.name, x + padding, y + h - 55);
    text("Habitat: " + entry.habitat, x + padding, y + h - 35);
    text("Activities: " + entry.activities.join(', '), x + padding, y + h - 20);

    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h - 40) {
      tooltipEntry = { ...entry, x: mouseX, y: mouseY };
    }
  }

  if (tooltipEntry) {
    drawTooltip(tooltipEntry);
  }
}

const cropVisualGroups = {
  // Row Crops
  "hay": "row",
  "alfalfa": "row",
  "corn": "row",
  "soy": "row",
  "spring wheat": "row",
  "grain and specialty crops": "row",
  "saffron": "row",

  // Tree Crops
  "grapes": "tree",
  "persimmons": "tree",
  "blueberries": "tree",
  "peaches": "tree",
  "pears": "tree",
  "apples": "tree",
  "kiwis": "tree",
  "native berry plants": "tree",

  // Vine Crops
  "tomatoes": "vine",
  "peppers": "vine",
  "squash": "vine",
  "zucchini": "vine",
  "cucurbits & solanaceous crops": "vine",
  "eggplant": "vine",

  // Forage Crops
  "leafy greens": "forage",
  "herbs": "forage",
  "mixed vegetables": "forage",
  "broccoli": "forage",
  "kale": "forage",
  "cabbage": "forage",
  "lettuce": "forage",
  "radish": "forage",
  "daikon": "forage",
  "beets": "forage",
  "carrots": "forage",
  "parsley": "forage",
  "berries": "forage",
};

function drawCropEdgeStyle(cropType, x, y, size) {
  push();
  translate(x, y);
  noFill();
  strokeWeight(2);

  if (!cropType) {
    stroke(0, 50);
    ellipse(0, 0, size * 0.7);
    pop();
    return;
  }

  let group = cropVisualGroups[cropType.trim().toLowerCase()];
  if (!group) {
    // default fallback
    stroke(0, 50);
    ellipse(0, 0, size * 0.7);
    pop();
    return;
  }

  switch (group) {
    case 'row':
      stroke('#008000'); // Classic green, flat and universal, but separate
      beginShape();
      let steps = 36;
      for (let i = 0; i <= steps; i++) {
        let angle = TWO_PI * i / steps;
        let radius = size * 0.5 + (i % 2 === 0 ? 12 : -12);
        vertex(cos(angle) * radius, sin(angle) * radius);
      }
      endShape(CLOSE);
      break;

    case 'tree':
      stroke('#1155CC'); // Ultramarine-style Suprematist blue, clear sky blue
      beginShape();
      for (let a = 0; a <= TWO_PI; a += 0.1) {
        let r = size * 0.5 + 10 * sin(5 * a);
        vertex(cos(a) * r, sin(a) * r);
      }
      endShape(CLOSE);
      break;

    case 'vine':
      stroke('#6A0DAD'); // Vibrant violet, layered complexity like vines
      strokeWeight(3);
      let dots = 24;
      for (let i = 0; i < dots; i++) {
        let angle = TWO_PI * i / dots;
        let px = cos(angle) * size * 0.5;
        let py = sin(angle) * size * 0.5;
        point(px, py);
      }
      break;

    case 'forage':
      stroke('#B8860B'); // Earthy gold, dynamic ground coverage
      strokeWeight(2);
      let circumference = TWO_PI * size * 0.5;
      let dashLength = 10;
      let gapLength = 6;
      let totalDashes = floor(circumference / (dashLength + gapLength));
      for (let i = 0; i < totalDashes; i++) {
        let startAngle = (i * (dashLength + gapLength)) / (size * 0.5);
        let endAngle = startAngle + dashLength / (size * 0.5);
        arc(0, 0, size, size, startAngle, endAngle);
      }
      break;

    default:
      stroke(0, 50);
      ellipse(0, 0, size * 0.7);
  }

  pop();
}



// Draw different line styles based on Animal Type
function drawAnimalLine(animalType, x, y, size) {
  let style = getLineStyle(animalType);
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

    default:
      // fallback straight line
      line(x - size / 2, y, x + size / 2, y);
  }
}

// Map Animal Type to line style properties
function getLineStyle(animalType) {
  let typeStr = (animalType || '').trim().toLowerCase();

  if (!typeStr) return { type: 'straight', weight: 1, color: color('#A1A1A1AA') }; // Cool medium gray, semi-transparent

  switch (typeStr) {
    case 'sheep':
      return { type: 'wavy', weight: 2, color: color('#E63946CC') }; // Suprematist-inspired crimson
    case 'llamas & alpacas':
      return { type: 'dashed', weight: 2, color: color('#3A0CA3CC') }; // Deep violet-blue
    case 'horse':
      return { type: 'bezier', weight: 3, color: color('#FF6700CC') }; // Vivid orange
    case 'cows':
      return { type: 'straight', weight: 5, color: color('#222222DD') }; // Rich charcoal
    case 'cattle':
      return { type: 'textured', weight: 3, color: color('#E5E5E5BB') }; // Light neutral gray
    default:
      return { type: 'straight', weight: 1, color: color('#20C997AA') }; // Minty green-teal Op Art tone
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

function drawHabitatShape(habitat, x, y, size, colorVal) {
  push();
  translate(x, y);
  fill(colorVal);
  noStroke();

  switch (habitat?.trim().toLowerCase()) {
    case 'pollinator':
      beginShape();
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i - PI / 2;
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

    default:
      ellipse(0, 0, size * 0.5);
  }

  pop();
}

function drawCheckerboardPattern(activities, habitat, x, y, size) {
  push();
  translate(x, y);

  let gridCount = 6;
  let cellSize = size / gridCount;

  let activityColors = activities.map(act => getActivityColor(act));

  if (activityColors.length === 1) {
    activityColors.push(color(255, 100));
  }

  let colorA = activityColors[0];
  let colorB = activityColors[1];

  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      let isAlt = (row + col) % 2 === 0;
      fill(isAlt ? colorA : colorB);
      noStroke();

      let cx = col * cellSize - size / 2 + cellSize / 2;
      let cy = row * cellSize - size / 2 + cellSize / 2;

      if (isPointInHabitatShape(habitat, cx, cy, size)) {
        rect(cx, cy, cellSize, cellSize);
      }
    }
  }

  noFill();
  stroke(0, 80);
  strokeWeight(1.5);
  drawHabitatOutline(habitat, 0, 0, size);

  pop();
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
      return (px * px + py * py <= (size * 0.25) * (size * 0.25));
  }
}

function pointInHexagon(px, py, r) {
  px = abs(px);
  py = abs(py);

  if (px > r * 0.8660254 || py > r * 0.5 + r * 0.288675) return false;
  return r * 0.5 * r * 0.8660254 - px * r * 0.5 - py * r * 0.8660254 >= 0;
}

function drawHabitatOutline(habitat, x, y, size) {
  push();
  translate(x, y);
  noFill();

  switch (habitat?.trim().toLowerCase()) {
    case 'pollinator':
      beginShape();
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i - PI / 2;
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

    default:
      ellipse(0, 0, size * 0.5);
  }

  pop();
}

function drawPVShape(pvTech, x, y, size, baseColor) {
  push();
  translate(x, y);
  noStroke();

  switch (pvTech?.trim().toLowerCase()) {
    case 'monofacial':
      fill(baseColor);
      rotate(radians(-30));
      rectMode(CENTER);
      rect(0, 0, size, size * 0.3);
      break;

    case 'bifacial':
      fill(lerpColor(baseColor, color(255), 0.3));
      rectMode(CENTER);
      rect(0, -size * 0.2, size * 0.4, size * 0.3);
      rect(0, size * 0.2, size * 0.4, size * 0.3);
      break;

    case 'translucent':
      fill(baseColor.levels[0], baseColor.levels[1], baseColor.levels[2], 80);
      for (let i = 0; i < 3; i++) {
        ellipse(0, 0, size * 0.8 - i * 10, size * 0.8 - i * 10);
      }
      break;

    default:
      fill(baseColor);
      ellipse(0, 0, size * 0.6);
  }

  pop();
}

function getActivityColor(activity) {
  switch (activity.trim().toLowerCase()) {
    case 'crop production':
      return color('#DA1E37');
    case 'habitat':
      return color('#0A0A0A');
    case 'grazing':
      return color('#007CBE');
    case 'greenhouse':
      return color('#F2D43D');
    default:
      return color(150);
  }
}

function drawTooltip(entry) {
  let textLines = [
    "Name: " + entry.name,
    "Habitat: " + entry.habitat,
    "Activities: " + entry.activities.join(', '),
    "PV Tech: " + entry.pvTech,
    "Animal Type: " + entry.animalType.join(', '),
    "Crop Type: " + entry.cropType.join(', '),
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
