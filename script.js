// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";

const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "Sheet1";

const loader = new Loader({
  apiKey,
});

const createMap = async () => {
  const { Map } = await loader.importLibrary("maps");

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

const addMarker = async (geocoder, map, address, title) => {
  const response = await geocoder.geocode({ address });

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  return new AdvancedMarkerElement({
    map,
    position: response.results[0].geometry.location,
    title,
  });
};

const run = async () => {
  const { Geocoder } = await loader.importLibrary("geocoding");
  const geocoder = new Geocoder();

  const data = await getSheetData();
  const headers = data.values[0];
  const titleIndex = headers.indexOf("Name");
  const locIndex = headers.indexOf("Combined");

  const map = await createMap();

  const rows = data.values.slice(1);
  rows.forEach((row) => {
    const title = row[titleIndex];
    const loc = row[locIndex];
    addMarker(geocoder, map, loc, title);
  });
};

window.addEventListener("load", run);
