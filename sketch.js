let table;
let entries = [];
let antonFont;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
  antonFont = loadFont('fonts/anton-regular.ttf'); 
}

function setup() {
  createCanvas(1200, 800);
  noLoop();
  textFont(antonFont);
  textSize(14);
  textAlign(LEFT, TOP);
  rectMode(CORNER);
  noStroke();

  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activityStr = table.getString(i, 'Agrivoltaic Activities');
    let activities = activityStr.split(/,\s*/);

    entries.push({
      name,
      activities
    });
  }
}

function draw() {
  background(255);
  let cols = 4;
  let w = width / cols;
  let h = 150;

  for (let i = 0; i < entries.length; i++) {
    let x = (i % cols) * w;
    let y = floor(i / cols) * h;
    let entry = entries[i];

    if (entry.activities.length > 1) {
      drawCheckerboard(x, y, w, h - 40, entry.activities);
    } else {
      fill(getActivityColor(entry.activities[0]));
      rect(x, y, w, h - 40);
    }

    fill(20); // Near black for text
    text(entry.name, x + 10, y + h - 35);
    text("Activities: " + entry.activities.join(', '), x + 10, y + h - 20);
  }
}

function drawCheckerboard(x, y, w, h, activities) {
  let cols = 4;
  let rows = 4;
  let cw = w / cols;
  let ch = h / rows;

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let index = (i + j) % activities.length;
      fill(getActivityColor(activities[index]));
      rect(x + i * cw, y + j * ch, cw, ch);
    }
  }
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
      return color(180);
  }
}
