// Cleaned-up sketch.js
// Removed fallback/default visuals for missing values in draw functions

let table;
let entries = [];
let entriesByYear = {};
let yearSlider;
let selectedYear;
let availableYears = [];
let cnv;
let tooltipEntry = null;

const cropVisualGroups = {
  "hay": "row",
  "alfalfa": "row",
  "corn": "row",
  "soy": "row",
  "spring wheat": "row",
  "grain and specialty crops": "row",
  "saffron": "row",

  "grapes": "tree",
  "persimmons": "tree",
  "blueberries": "tree",
  "peaches": "tree",
  "pears": "tree",
  "apples": "tree",
  "kiwis": "tree",
  "native berry plants": "tree",

  "tomatoes": "vine",
  "peppers": "vine",
  "squash": "vine",
  "zucchini": "vine",
  "cucurbits & solanaceous crops": "vine",
  "eggplant": "vine",

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
  "berries": "forage"
};

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
      stroke('#008000');
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
      stroke('#1155CC');
      beginShape();
      for (let a = 0; a <= TWO_PI; a += 0.1) {
        let r = size * 0.5 + 10 * sin(5 * a);
        vertex(cos(a) * r, sin(a) * r);
      }
      endShape(CLOSE);
      break;

    case 'vine':
      stroke('#6A0DAD');
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
      stroke('#B8860B');
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
  }

  pop();
}

function getLineStyle(animalType) {
  let typeStr = String(animalType || '').trim().toLowerCase();
  if (!typeStr) return null;

  switch (typeStr) {
    case 'sheep':
      return { type: 'wavy', weight: 2, color: color('#E63946CC') };
    case 'llamas & alpacas':
      return { type: 'dashed', weight: 2, color: color('#3A0CA3CC') };
    case 'horse':
      return { type: 'bezier', weight: 3, color: color('#FF6700CC') };
    case 'cows':
      return { type: 'straight', weight: 5, color: color('#222222DD') };
    case 'cattle':
      return { type: 'textured', weight: 3, color: color('#E5E5E5BB') };
    default:
      return null;
  }
}

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
