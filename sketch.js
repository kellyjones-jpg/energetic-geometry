
// Agrivoltaics Visualization with Suprematism/Op Art Influence
let table;
let sites = [];
let zoom = 1;
let offsetX = 0, offsetY = 0;
let gui;
let params = {
  dataMode: false
};

function preload() {
  table = loadTable('result.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  gui = createGui('Mode Toggle');
  gui.addObject(params);
  gui.setPosition(10, 10);

  let cols = 30;
  for (let i = 0; i < table.getRowCount(); i++) {
    let row = table.rows[i];
    let site = {
      name: row.get('Site Name') || 'Unknown',
      size: parseFloat(row.get('System Size (kW)')) || 0,
      siteSize: parseFloat(row.get('Site Size (Acres)')) || 0,
      year: row.get('Year Installed') || '',
      tech: row.get('PV Technology') || '',
      arrayType: row.get('Type of Array') || '',
      habitat: row.get('Habitat Types') || '',
      crop: row.get('Crop Type') || '',
      animal: row.get('Animal Type') || '',
      activity: row.get('Agrivoltaics Activities') || '',
      shape: getShapeFromArrayType(row.get('Type of Array') || ''),
      ...abstractGridPosition(i, cols)
    };
    sites.push(site);
  }
}

function draw() {
  background(255);
  translate(offsetX, offsetY);
  scale(zoom);

  for (let site of sites) {
    drawSite(site);
  }

  if (params.dataMode) {
    for (let site of sites) {
      if (isMouseOverSite(site)) {
        drawTooltip(site);
        break;
      }
    }
  }
}

function abstractGridPosition(index, cols) {
  let spacing = 80;
  let x = (index % cols) * spacing;
  let y = floor(index / cols) * spacing;
  return { x, y };
}

function getShapeFromArrayType(type) {
  type = type.toLowerCase();
  if (type.includes('fixed')) return 'square';
  if (type.includes('track')) return 'triangle';
  if (type.includes('vertical')) return 'circle';
  return 'circle';
}

function getSiteColor(site) {
  let activity = site.activity.toLowerCase();
  if (activity.includes('grazing')) return color('#0047AB');
  if (activity.includes('crop')) return color('#D30000');
  if (activity.includes('pollinator')) return color('#FFD700');
  return color('#000000');
}

function getTintFromCrop(crop) {
  crop = crop.toLowerCase();
  if (crop.includes('vegetable')) return color(0, 255, 0, 100);
  if (crop.includes('fruit')) return color(255, 0, 255, 100);
  if (crop.includes('grain')) return color(255, 255, 0, 100);
  return color(255, 255, 255, 50);
}

function getMotionOffset(animal) {
  animal = animal.toLowerCase();
  if (animal.includes('sheep')) return sin(frameCount * 0.1) * 2;
  if (animal.includes('chicken')) return cos(frameCount * 0.05) * 1.5;
  return 0;
}

function getFreqFromHabitat(habitat) {
  habitat = habitat.toLowerCase();
  if (habitat.includes('pollinator')) return 4;
  if (habitat.includes('native')) return 6;
  return 8;
}

function applyStrokeFromTech(pg, tech) {
  if (tech.toLowerCase().includes('mono')) {
    pg.stroke(0);
    pg.strokeWeight(1);
  } else if (tech.toLowerCase().includes('thin')) {
    pg.stroke(0);
    pg.strokeWeight(0.5);
    pg.drawingContext.setLineDash([4, 2]);
  } else {
    pg.stroke(50);
    pg.strokeWeight(0.8);
  }
}

function generateInteractivePattern(w, h, type, freq, phaseOffset, tech) {
  let pg = createGraphics(w, h);
  pg.background(255);
  applyStrokeFromTech(pg, tech);

  if (type === 'vertical') {
    for (let i = 0; i < w; i += freq) {
      pg.line(i + phaseOffset, 0, i + phaseOffset, h);
    }
  } else if (type === 'diagonal') {
    for (let i = -w; i < w * 2; i += freq) {
      pg.line(i + phaseOffset, 0, i - h + phaseOffset, h);
    }
  } else if (type === 'checkerboard') {
    for (let y = 0; y < h; y += freq) {
      for (let x = 0; x < w; x += freq) {
        pg.noStroke();
        pg.fill((x + y) / freq % 2 === 0 ? 0 : 255);
        pg.rect(x, y, freq, freq);
      }
    }
  } else if (type === 'radial') {
    pg.translate(w / 2, h / 2);
    for (let angle = 0; angle < TWO_PI; angle += PI / freq) {
      pg.line(0, 0, cos(angle + phaseOffset) * w, sin(angle + phaseOffset) * h);
    }
  }

  return pg;
}

// Draw a single site using visual mappings inspired by generative artists
// Reas: Systems and rules drive visual logic
// Fry: Clarity in visualizing complex environmental data
// Lieberman: Interaction makes the viewer a co-creator
// Watz: Pattern + motion = living geometry
// Malevich: Minimal abstract shapes; pure spatial form
// Vasarely: Vibrational patterns & interactive illusions

function drawSite(site) {
  let d = dist((mouseX - offsetX) / zoom, (mouseY - offsetY) / zoom, site.x, site.y);
  let freq = getFreqFromHabitat(site.habitat);
  let zoomFreq = map(zoom, 0.5, 5, freq + 5, freq);
  let offsetPhase = map(d, 0, 200, 0, PI);
  let patternType = getPatternType(site.activity);
  // Vasarely: optical texture changes with distance and movement
  let tex = generateInteractivePattern(40, 40, patternType, zoomFreq, offsetPhase, site.tech);
  let s = map(site.size, 0, 1000, 20, 60);
  let motionShift = getMotionOffset(site.animal);

  push();
  imageMode(CENTER);

  if (d < 100) {
    drawingContext.shadowBlur = map(d, 0, 100, 20, 0);
    drawingContext.shadowColor = color(255, 255, 255, 200);
  }

  if (params.dataMode) {
    stroke(0);
    fill(getSiteColor(site));
    if (site.shape === 'circle') ellipse(site.x, site.y, s);
    else if (site.shape === 'square') rect(site.x - s / 2, site.y - s / 2, s, s);
    else if (site.shape === 'triangle')
      triangle(site.x, site.y - s / 2, site.x - s / 2, site.y + s / 2, site.x + s / 2, site.y + s / 2);
  } else {
    tint(getSiteColor(site));
    image(tex, site.x + motionShift, site.y, s, s);
    noTint();
    // Fry + Watz: subtle data overlays, enriching visual semantics
    fill(getTintFromCrop(site.crop));
    ellipse(site.x + motionShift, site.y, s * 0.6);
  }

  pop();
}

function getPatternType(activity) {
  activity = activity.toLowerCase();
  if (activity.includes('grazing')) return 'diagonal';
  if (activity.includes('crop')) return 'checkerboard';
  if (activity.includes('pollinator')) return 'radial';
  return 'vertical';
}

function isMouseOverSite(site) {
  let d = dist((mouseX - offsetX) / zoom, (mouseY - offsetY) / zoom, site.x, site.y);
  let s = map(site.size, 0, 1000, 20, 60);
  return d < s / 2;
}

function drawTooltip(site) {
  let info = 
    `Site: ${site.name}
Size: ${site.size} kW
Acreage: ${site.siteSize}
Installed: ${site.year}
Tech: ${site.tech}
Array: ${site.arrayType}
Habitat: ${site.habitat}
Crop: ${site.crop}
Animal: ${site.animal}
Activity: ${site.activity}`;

  push();
  fill(255);
  stroke(0);
  let boxWidth = 250;
  let boxHeight = 140;
  rect(mouseX, mouseY - boxHeight - 10, boxWidth, boxHeight);
  fill(0);
  noStroke();
  textSize(10);
  textAlign(LEFT, TOP);
  text(info, mouseX + 5, mouseY - boxHeight);
  pop();
}

function mouseDragged() {
  offsetX += movedX;
  offsetY += movedY;
}

function mouseWheel(event) {
  zoom += event.delta * -0.001;
  zoom = constrain(zoom, 0.5, 5);
}
