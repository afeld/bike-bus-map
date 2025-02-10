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
  if (!mapEl) {
    throw new Error("Map element not found");
  }

  return new Map(mapEl, {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    mapId: "DEMO_MAP_ID",
    // gestureHandling: "cooperative",
    maxZoom: 13,
  });
};

const arrayToObj = (headers: [string], row: [string]) => {
  const result = {};
  headers.forEach((header, i) => {
    result[header] = row[i];
  });
  return result;
};

const getSheetData = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  const headers: [string] = data.values[0];
  const rows = data.values.slice(1);
  return rows.map((row: [string]) => arrayToObj(headers, row));
};

const addMarker = async (
  geocoder: google.maps.Geocoder,
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  address: string,
  title: string
) => {
  const response = await geocoder.geocode({ address });
  const position = response.results[0].geometry.location;
  bounds.extend(position);

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  return new AdvancedMarkerElement({
    map,
    position,
    title,
    gmpClickable: true,
  });
};

const run = async () => {
  const [core, maps, geocoding, map, rows] = await Promise.all([
    loader.importLibrary("core"),
    loader.importLibrary("maps"),
    loader.importLibrary("geocoding"),
    createMap(),
    getSheetData(),
  ]);

  const bounds = new core.LatLngBounds();
  const infoWindow = new maps.InfoWindow();
  const geocoder = new geocoding.Geocoder();

  // wait for all markers to be added
  await Promise.all(
    rows.map(async (row: [string]) => {
      const title = row["Name"];
      const loc = row["Combined"];
      const marker = await addMarker(geocoder, map, bounds, loc, title);

      // https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers#make_a_marker_clickable
      marker.addListener("click", () => {
        infoWindow.close();

        const url = row["URL"];
        infoWindow.setContent(`<h3>${title}</h3><a href="${url}">${url}</a>`);

        infoWindow.open(marker.map, marker);
      });
    })
  );

  // automatically center the map
  map.fitBounds(bounds);
};

window.addEventListener("load", run);
