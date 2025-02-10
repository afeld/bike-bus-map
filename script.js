const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "Sheet1";

const createMap = async () => {
  const { Map } = await google.maps.importLibrary("maps");

  const mapEl = document.getElementById("map");
  return new Map(mapEl, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
};

const getSheetData = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  return await response.json();
};

const run = async () => {
  const data = await getSheetData();
  const headers = data.values[0];

  const map = await createMap();
  console.log(data);
};

window.addEventListener("load", run);

//   function initMap() {
//     // Initialize the map
//     const map = new google.maps.Map(document.getElementById("map"), {
//       center: { lat: -34.397, lng: 150.644 },
//       zoom: 8,
//     });

//     // Load the Google Visualization API
//     google.charts.load("current", { packages: ["corechart", "table"] });
//     google.charts.setOnLoadCallback(() => {
//       // Fetch data from the public Google Sheet
//       const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
//       const range = "Sheet1!A2:C"; // Adjust the range as needed
//       const query = new google.visualization.Query(
//         `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?range=${range}`
//       );

//       query.send((response) => {
//         if (response.isError()) {
//           console.error(
//             "Error fetching data from Google Sheets:",
//             response.getMessage()
//           );
//           return;
//         }

//         const data = response.getDataTable();
//         const numRows = data.getNumberOfRows();

//         // Place markers on the map
//         for (let i = 0; i < numRows; i++) {
//           const name = data.getValue(i, 0);
//           const lat = parseFloat(data.getValue(i, 1));
//           const lng = parseFloat(data.getValue(i, 2));

//           new google.maps.Marker({
//             position: { lat: lat, lng: lng },
//             map: map,
//             title: name,
//           });
//         }
//       });
//     });
//   }

//   window.onload = initMap;
