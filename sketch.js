// Loading the Dataset
let table;

function preload() {
  table = loadTable('inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

// Verifying Structure
function setup() {
  noCanvas();
  if (table) {
    print('Rows:', table.getRowCount());
    print('Columns:', table.getColumnCount());
    print('Column Headers:', table.columns);
  } else {
    print('Error: Table not loaded');
  }
}

// Accessing Attributes
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

  print(`${i}: ${name}, ${activity}, ${systemSize}, ${siteSize}, ${year}, ${tech}, ${arrayType}, ${habitat}, ${crops}, ${animals}`);
}
