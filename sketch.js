let table;
let entries = [];
let entriesByYear = {};
let yearSlider;
let selectedYear;
let availableYears = [];
let cnv;
let tooltipEntry = null; 

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

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

function setup() {
  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name') || '';
    let activityStr = table.getString(i, 'Agrivoltaic Activities') || '';
    let activities = activityStr ? activityStr.split(/,\s*/) : [];
    let habitatRaw = table.getString(i, 'Habitat Type') || '';
    let habitat = habitatRaw.split(/,\s*/); // always an array
    let pvTech = table.getString(i, 'PV Technology') || '';
    let animalTypeStr = table.getString(i, 'Animal Type') || '';
    let animalType = animalTypeStr ? animalTypeStr.split(/,\s*/) : [];
    let cropTypeStr = table.getString(i, 'Crop Types') || '';
    let cropType = cropTypeStr ? cropTypeStr.split(/,\s*/) : [];
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
  let totalHeight = 100 + yearEntries.length * (shapeSize + padding);

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

  let padding = 60;
  let shapeSize = 150;
  let startY = 80;

  for (let i = 0; i < yearEntries.length; i++) {
    let entry = yearEntries[i];
    let centerX = width / 2;
    let centerY = startY + i * (shapeSize + padding);

    push();
    translate(centerX, centerY);

    let baseColor = getActivityColor(entry.activities?.[0] || '');


    // Habitat shape (only if valid)
    if (Array.isArray(entry.habitat)) {
      for (let j = 0; j < entry.habitat.length; j++) {
        let h = entry.habitat[j];
        if (typeof h === 'string' && h.trim() !== '') {
          push();
          rotate(radians(j * 15)); // optional Suprematist offset
          drawHabitatShape(h, 0, 0, shapeSize, baseColor);
          pop();
        }
      }
    }



    // Activities treatment
    if (Array.isArray(entry.activities) && entry.activities.length > 0) {
      if (entry.activities.length === 1) {
        // Single activity: solid color ring
        noFill();
        stroke(getActivityColor(entry.activities[0]));
        strokeWeight(6);
        ellipse(0, 0, shapeSize * 0.9);
      } else if (entry.activities.length === 2) {
        // Two activities: checkerboard overlay
        drawCheckerboardPattern(entry.activities, entry.habitat, 0, 0, shapeSize);
      } else {
        // Three or more: suprematist-style wedges
        let angleStep = TWO_PI / entry.activities.length;
        for (let j = 0; j < entry.activities.length; j++) {
          let startAngle = j * angleStep;
          let endAngle = startAngle + angleStep;
          fill(getActivityColor(entry.activities[j]));
          noStroke();
          arc(0, 0, shapeSize * 0.85, shapeSize * 0.85, startAngle, endAngle, PIE);
        }
      }
    }

    // Crop edge (only if cropType exists)
    if (entry.cropType && entry.cropType.length > 0) {
      drawCropEdgeStyle(entry.cropType, 0, 0, shapeSize);
    }

    // Animal line (only if animalType exists)
    if (entry.animalType && entry.animalType.length > 0) {
      drawAnimalLine(entry.animalType, 0, 0, shapeSize);
    }

    // PV shape (only if pvTech exists)
    if (entry.pvTech && entry.pvTech.trim() !== '') {
      drawPVShape(entry.pvTech, 0, 0, shapeSize * 0.5, baseColor);
    }

    pop();

    // Labels
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
    "Habitat: " + (entry.habitat?.trim() || 'None'),
    "Activities: " + entry.activities.join(', '),
    "PV Tech: " + entry.pvTech,
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
    let centerX = width / 2;
    let centerY = startY + i * (shapeSize + padding);
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

function drawCropEdgeStyle(cropType, x, y, size) {
  push();
  translate(x, y);
  noFill();
  strokeWeight(2);

  if (!cropType) {
    pop();
    return;
  }

  let cleanCrop = String(cropType || '').trim().toLowerCase();
  let group = cropVisualGroups[cleanCrop];
  if (!group) {
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
        pop(); 
        return;
  }

  pop();
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
      return { type: 'straight', weight: 5, color: color('#222222DD') }; // Rich charcoal
    case 'cattle':
      return { type: 'textured', weight: 3, color: color('#E5E5E5BB') }; // Light neutral gray
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
        pop(); 
        return;
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
        pop(); 
        return;
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
        pop(); 
        return;
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
        pop(); 
        return;
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
        pop(); 
        return;
  }
}
