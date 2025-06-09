let table;
let entries = [];
let antonFont;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
  antonFont = loadFont('fonts/anton-regular.ttf'); 
}

function setup() {
  // First, parse all entries from the table
  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activityStr = table.getString(i, 'Agrivoltaic Activities');
    let activities = activityStr.split(/,\s*/);

    entries.push({
      name,
      activities
    });
  }

  // Determine number of columns and calculate required rows and canvas height
  let cols = 6;
  let tileHeight = 250;
  let rows = ceil(entries.length / cols);
  let canvasHeight = rows * tileHeight;

  // Create a canvas that fits all the entries
  createCanvas(1650, canvasHeight);
  noLoop();

  // Set text and layout styles
  textFont(antonFont);
  textSize(18);
  textAlign(LEFT, TOP);
  rectMode(CORNER);
  noStroke();
}

function draw() {
  background(243, 232, 205);
  let cols = 6;
  let w = width / cols;
  let h = 250;
  let padding = 28; // padding around text inside the tile

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

    // Draw a light background for the text area
    fill(255, 245); // semi-transparent white
    rect(x, y + h - 40, w, 40);

    // Text with margin
    fill(0);
    text(entry.name, x + padding, y + h - 35);
    text("Activities: " + entry.activities.join(', '), x + padding, y + h - 20);
  }
}

function drawCheckerboard(x, y, w, h, activities) {
  let cols = 6;
  let rows = 6;
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
      return color(200); // fallback gray
  }
}
