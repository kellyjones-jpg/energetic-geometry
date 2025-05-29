// Loading the Dataset
let table;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

// Verifying Structure
function setup() {
  noCanvas();
  
  if (!table) {
    print("Table not loaded");
    return;
  }

  print('Rows:', table.getRowCount());
  print('Columns:', table.getColumnCount());
  print('Column Headers:', table.columns);

// Accessing Attributes
for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activity = table.getString(i, 'Agrivoltaic Activities');
    // Access other fields...
    print(`${name} | ${activity}`);
  }
}
