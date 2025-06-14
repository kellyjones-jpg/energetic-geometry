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

    entries.push({ name, activities, habitat, pvTech });
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

    fill(243, 232, 205);
    stroke(220);
    rect(x, y, w, h - 40);

    let shapeSize = min(w, h - 40) * 0.6;
    push();
    translate(x + w / 2, y + (h - 40) / 2);

    let baseColor = getActivityColor(entry.activities[0]);

    // Determine habitat shape color
    let habitatColor = getHabitatColor(entry.habitat);

    // --- Suprematist Overlays ---
    if (entry.activities.length > 1) {
      drawSuprematistOverlay(entry.activities, shapeSize);
    }

    // --- Habitat Shape ---
    drawHabitatShape(entry.habitat, 0, 0, shapeSize, habitatColor);

    // --- PV Technology Shape Overlay ---
    if (entry.pvTech) {
      drawPVShape(entry.pvTech, 0, 0, shapeSize * 0.5, baseColor);
    }

    pop();

    // Footer info area
    fill(255, 245);
    noStroke();
    rect(x, y + h - 40, w, 40);

    fill(0);
    textSize(14);
    text(entry.name, x + padding, y + h - 35);
    text("Habitat: " + entry.habitat, x + padding, y + h - 55);
    text("Activities: " + entry.activities.join(', '), x + padding, y + h - 20);

    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h - 40) {
      tooltipEntry = { ...entry, x: mouseX, y: mouseY };
    }
  }

  if (tooltipEntry) {
    drawTooltip(tooltipEntry);
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
      ellipse(0, 0, size * 0.5); // fallback
  }

  pop();
}

function drawPVShape(pvTech, x, y, size, colorVal) {
  push();
  translate(x, y);
  fill(colorVal);
  noStroke();

  switch (pvTech?.trim().toLowerCase()) {
    case 'monofacial':
      rotate(radians(-30));
      rectMode(CENTER);
      rect(0, 0, size, size * 0.3);
      break;

    case 'bifacial':
      fill(lerpColor(colorVal, color(255), 0.3));
      rectMode(CENTER);
      rect(0, -size * 0.2, size * 0.4, size * 0.3);
      rect(0, size * 0.2, size * 0.4, size * 0.3);
      break;

    case 'translucent':
      fill(colorVal.levels[0], colorVal.levels[1], colorVal.levels[2], 80);
      for (let i = 0; i < 3; i++) {
        ellipse(0, 0, size * 0.8 - i * 10, size * 0.8 - i * 10);
      }
      break;

    default:
      ellipse(0, 0, size * 0.6);
  }

  pop();
}

function drawSuprematistOverlay(activities, size) {
  for (let i = 0; i < activities.length; i++) {
    push();
    rotate(radians(30 * i));
    fill(getActivityColor(activities[i]));
    drawingContext.globalAlpha = 0.5;
    rectMode(CENTER);
    rect(0, 0, size * 0.6 - i * 10, size * 0.2);
    drawingContext.globalAlpha = 1;
    pop();
  }
}

function getActivityColor(activity) {
  switch (activity.trim().toLowerCase()) {
    case 'crop production':
      return color('#DA1E37'); // Red
    case 'habitat':
      return color('#0A0A0A'); // Black
    case 'grazing':
      return color('#007CBE'); // Blue
    case 'greenhouse':
      return color('#F2D43D'); // Yellow
    default:
      return color(180); // Neutral gray
  }
}

function getHabitatColor(habitat) {
  switch (habitat?.trim().toLowerCase()) {
    case 'pollinator':
      return color('#FFC30B'); // Golden Yellow
    case 'native grasses':
      return color('#4CAF50'); // Green
    case 'naturalized':
      return color('#1E90FF'); // Blue
    default:
      return color(120); // fallback gray
  }
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
