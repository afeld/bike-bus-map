const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "Sheet1";

const geocoder = new google.maps.Geocoder();

const createMap = async () => {
  const { Map } = await google.maps.importLibrary("maps");

  const mapEl = document.getElementById("map");
  return new Map(mapEl, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    mapId: "DEMO_MAP_ID",
  });
};

const getSheetData = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  return await response.json();
};

const addMarker = async (map, address, title) => {
  const response = await geocoder.geocode({ address });

  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  return new AdvancedMarkerElement({
    map,
    position: response.results[0].geometry.location,
    title,
  });
};

const run = async () => {
  const data = await getSheetData();
  const headers = data.values[0];

  const map = await createMap();
  console.log(data);

  addMarker(map, "New York, NY", "New York");
};

window.addEventListener("load", run);
