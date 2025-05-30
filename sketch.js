// Loading the Dataset
let table;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

// Verifying Structure
function setup() {
  noCanvas();

  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activity = table.getString(i, 'Agrivoltaic Activities');
    let systemSize = table.getString(i, 'System Size');
    let siteSize = table.getString(i, 'Site Size');
    let year = table.getString(i, 'Year Installed');
    let tech = table.getString(i, 'PV Technology');
    let arrayType = table.getString(i, 'Type Of Array');
    let habitat = table.getString(i, 'Habitat Type');
    let crops = table.getString(i, 'Crop Types');
    let animals = table.getString(i, 'Animal Type');

    let siteInfo = `
      <strong>${name}</strong><br>
      Activities: ${activity}<br>
      System Size: ${systemSize}<br>
      Site Size: ${siteSize}<br>
      Year Installed: ${year}<br>
      PV Tech: ${tech}<br>
      Array Type: ${arrayType}<br>
      Habitat: ${habitat}<br>
      Crops: ${crops}<br>
      Animals: ${animals}<br><hr>
    `;

    createDiv(siteInfo);
  }
}

// Accessing Attributes
for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activity = table.getString(i, 'Agrivoltaic Activities');
    // Access other fields...
    print(`${name} | ${activity}`);
  }
}
