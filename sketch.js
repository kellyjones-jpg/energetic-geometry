let table;

function preload() {
  table = loadTable('data/inspire-agrivoltaics-20250529.csv', 'csv', 'header');
}

function setup() {
  noCanvas();

  for (let i = 0; i < table.getRowCount(); i++) {
    let name = table.getString(i, 'Name');
    let activityStr = table.getString(i, 'Agrivoltaic Activities');
    let activities = activityStr.split(/,\s*/); // handle combined activities
    let systemSize = table.getString(i, 'System Size');
    let siteSize = table.getString(i, 'Site Size');
    let year = table.getString(i, 'Year Installed');
    let tech = table.getString(i, 'PV Technology');
    let arrayType = table.getString(i, 'Type Of Array');
    let habitat = table.getString(i, 'Habitat Type');
    let crops = table.getString(i, 'Crop Types');
    let animals = table.getString(i, 'Animal Type');

    let div = createDiv();
    div.style('padding', '10px');
    div.style('color', '#fff');
    div.style('margin', '10px 0');
    div.style('font-family', 'Arial, sans-serif');

    if (activities.length > 1) {
      // Checkerboard: use linear gradient
      let colors = activities.map(getActivityColor);
      let gradient = `repeating-linear-gradient(
        45deg,
        ${colors[0]} 0 20px,
        ${colors[1 % colors.length]} 20px 40px
      )`;
      div.style('background', gradient);
    } else {
      div.style('background-color', getActivityColor(activities[0]));
    }

    let content = `
      <strong>${name}</strong><br>
      Activities: ${activityStr}<br>
      System Size: ${systemSize}<br>
      Site Size: ${siteSize}<br>
      Year Installed: ${year}<br>
      PV Tech: ${tech}<br>
      Array Type: ${arrayType}<br>
      Habitat: ${habitat}<br>
      Crops: ${crops}<br>
      Animals: ${animals}<br>
    `;
    div.html(content);
  }
}

function getActivityColor(activity) {
  switch (activity.trim().toLowerCase()) {
    case 'crop production':
      return '#DA1E37'; // Suprematism red
    case 'habitat':
      return '#0A0A0A'; // Op Art black
    case 'grazing':
      return '#007CBE'; // Suprematism blue
    case 'greenhouse':
      return '#F2D43D'; // Op Art yellow
    default:
      return '#888'; // fallback gray
  }
}
