let table;
let entries = [];
let tooltipEntry = null;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

function setup() {
  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activityStr = table.getString(i, 'Agrivoltaic Activities');
    let activities = activityStr.split(/,\s*/);
    let habitat = table.getString(i, 'Habitat Type');
    let pvTech = table.getString(i, 'PV Technology');

    entries.push({
      name,
      activities,
      habitat,
      pvTech
    });
  }

  let cols = 6;
  let tileHeight = 250;
  let rows = ceil(entries.length / cols);
  let canvasHeight = rows * tileHeight;

  createCanvas(1650, canvasHeight);
  textFont('Helvetica');
  textSize(16);
  textAlign(LEFT, TOP);
  rectMode(CORNER);
  noLoop();
}

function draw() {
  background(243, 232, 205);
  let cols = 6;
  let w = width / cols;
  let h = 250;
  let padding = 28;
  tooltipEntry = null;

  for (let i = 0; i < entries.length; i++) {
    let x = (i % cols) * w;
    let y = floor(i / cols) * h;
    let entry = entries[i];

    // Tile background
    fill(243, 232, 205);
    stroke(220);
    rect(x, y, w, h - 40);

    let shapeSize = min(w, h - 40) * 0.6;

    push();
    translate(x + w / 2, y + (h - 40) / 2);

    // Orientation from PV Technology
    if (entry.pvTech) {
      let tech = entry.pvTech.trim().toLowerCase();
      if (tech === 'monofacial') {
        rotate(radians(-30));
      } else if (tech === 'bifacial') {
        scale(1, -1);
      }
    }

    let shapeType = getShapeType(entry.habitat);

    if (entry.activities.length === 1) {
      fill(getActivityColor(entry.activities[0]));
      drawHabitatShape(-shapeSize / 2, -shapeSize / 2, shapeSize, entry.habitat);
    } else {
      let patternImg = createPattern(entry.activities, shapeSize, shapeType);
      imageMode(CENTER);
      image(patternImg, 0, 0);
    }

    pop();

    // Text labels
    fill(255, 245);
    noStroke();
    rect(x, y + h - 40, w, 40);

    fill(0);
    textSize(14);
    text("Habitat: " + entry.habitat, x + padding, y + h - 55);
    text(entry.name, x + padding, y + h - 35);
    text("Activities: " + entry.activities.join(', '), x + padding, y + h - 20);

    // Tooltip detection
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h - 40) {
      tooltipEntry = { ...entry, x: mouseX, y: mouseY };
    }
  }

  if (tooltipEntry) {
    drawTooltip(tooltipEntry);
  }
}

function drawHabitatShape(x, y, size, type) {
  switch (type.trim().toLowerCase()) {
    case 'pollinator':
      drawHexagon(x + size / 2, y + size / 2, size / 2);
      break;
    case 'native grasses':
      rect(x + size * 0.4, y + size * 0.2, size * 0.2, size * 0.6);
      break;
    case 'naturalized':
      ellipse(x + size / 2, y + size / 2, size * 0.8);
      break;
    default:
      ellipse(x + size / 2, y + size / 2, size * 0.6);
  }
}

function drawHexagon(x, y, radius) {
  beginShape();
  for (let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i;
    let vx = x + cos(angle) * radius;
    let vy = y + sin(angle) * radius;
    vertex(vx, vy);
  }
  endShape(CLOSE);
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
      return color(200); // fallback gray
  }
}

function getShapeType(habitat) {
  switch (habitat.trim().toLowerCase()) {
    case 'pollinator':
      return 'hexagon';
    case 'native grasses':
    case 'naturalized':
    default:
      return 'ellipse';
  }
}

function createPattern(activities, size, shapeType = 'ellipse') {
  let pattern = createGraphics(size, size);
  pattern.noStroke();

  if (activities.length === 2) {
    // Diagonal split
    let c1 = getActivityColor(activities[0]);
    let c2 = getActivityColor(activities[1]);
    pattern.fill(c1);
    pattern.triangle(0, 0, size, 0, 0, size);
    pattern.fill(c2);
    pattern.triangle(size, size, size, 0, 0, size);
  } else {
    // Striped pattern
    let stripeHeight = size / activities.length;
    for (let i = 0; i < activities.length; i++) {
      pattern.fill(getActivityColor(activities[i]));
      pattern.rect(0, i * stripeHeight, size, stripeHeight);
    }
  }

  // Create mask shape
  let mask = createGraphics(size, size);
  mask.background(0);
  mask.noStroke();
  mask.fill(255);

  if (shapeType === 'hexagon') {
    mask.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = TWO_PI / 6 * i;
      let x = size / 2 + cos(angle) * size * 0.5;
      let y = size / 2 + sin(angle) * size * 0.5;
      mask.vertex(x, y);
    }
    mask.endShape(CLOSE);
  } else {
    mask.ellipse(size / 2, size / 2, size * 0.95, size * 0.95);
  }

  let finalPattern = pattern.get();
  finalPattern.mask(mask.get());
  return finalPattern;
}

function drawTooltip(entry) {
  let textLines = [
    "Name: " + entry.name,
    "Habitat: " + entry.habitat,
    "Activities: " + entry.activities.join(', '),
    "PV Tech: " + entry.pvTech
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
