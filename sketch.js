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

    fill(243, 232, 205);
    stroke(220);
    rect(x, y, w, h - 40);

    let shapeSize = min(w, h - 40) * 0.6;
    push();
    translate(x + w / 2, y + (h - 40) / 2);

    // Use the first activity's color for habitat shape fill
    let baseColor = getActivityColor(entry.activities[0]);

    // 1. Draw habitat shape with activity color
    drawHabitatShape(entry.habitat, 0, 0, shapeSize, baseColor);

    // 2. Draw Suprematist overlays for combined activities (beyond the first)
    if (entry.activities.length > 1) {
      drawSuprematistOverlay(entry.activities, shapeSize);
    }

    // 3. Draw PV Technology smaller overlay shape
    drawPVShape(entry.pvTech, 0, 0, shapeSize * 0.5, baseColor);

    pop();

    // Footer label box
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
      // Hexagon
      beginShape();
      for (let i = 0; i < 6; i++) {
        let angle = TWO_PI / 6 * i - PI / 2;
        vertex(cos(angle) * size * 0.5, sin(angle) * size * 0.5);
      }
      endShape(CLOSE);
      break;

    case 'native grasses':
      // Vertical slender rectangle
      rectMode(CENTER);
      rect(0, 0, size * 0.3, size);
      break;

    case 'naturalized':
      // Circle
      ellipse(0, 0, size, size);
      break;

    default:
      // Fallback circle smaller
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

function drawSuprematistOverlay(activities, size) {
  push();
  rectMode(CENTER);
  noStroke();

  // Draw semi-transparent stripes layered with rotation and offset
  for (let i = 0; i < activities.length; i++) {
    let c = getActivityColor(activities[i]);
    c.setAlpha(90);
    fill(c);
    push();
    rotate(radians(i * 25));
    rect(0, 0, size * 0.7 - i * 10, size * 0.2);
    pop();
  }

  pop();
}

function getActivityColor(activity) {
  switch (activity.trim().toLowerCase()) {
    case 'crop production':
      return color('#DA1E37'); // red
    case 'habitat':
      return color('#0A0A0A'); // near black
    case 'grazing':
      return color('#007CBE'); // blue
    case 'greenhouse':
      return color('#F2D43D'); // yellow
    default:
      return color(150); // grey fallback
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
