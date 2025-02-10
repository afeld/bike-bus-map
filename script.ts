// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";

const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "Sheet1";

const loader = new Loader({
  apiKey,
});

class BikeBus {
  constructor(
    public name: string,
    public location: string,
    public url: string
  ) {
    this.name = name;
    this.location = location;
    this.url = url;
  }

  static fromRow(headers: [string], row: [string]) {
    const nameIndex = headers.indexOf("Name");
    const locationIndex = headers.indexOf("Combined");
    const urlIndex = headers.indexOf("URL");

    return new BikeBus(row[nameIndex], row[locationIndex], row[urlIndex]);
  }
}

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

const getSheetData = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  const headers: [string] = data.values[0];
  const rows = data.values.slice(1);
  const buses: [BikeBus] = rows.map((row: [string]) =>
    BikeBus.fromRow(headers, row)
  );

  return buses;
};

const addMarker = async (
  geocoder: google.maps.Geocoder,
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  infoWindow: google.maps.InfoWindow,
  bus: BikeBus
) => {
  const response = await geocoder.geocode({ address: bus.location });
  const position = response.results[0].geometry.location;
  bounds.extend(position);

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  const title = bus.name;
  const marker = new AdvancedMarkerElement({
    map,
    position,
    title,
    gmpClickable: true,
  });

  // https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers#make_a_marker_clickable
  marker.addListener("click", () => {
    infoWindow.close();

    const url = bus.url;
    infoWindow.setContent(`<h3>${title}</h3><a href="${url}">${url}</a>`);

    infoWindow.open(map, marker);
  });

  return marker;
};

const run = async () => {
  const [core, maps, geocoding, map, buses] = await Promise.all([
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
    buses.map((bus) => addMarker(geocoder, map, bounds, infoWindow, bus))
  );

  // automatically center the map
  map.fitBounds(bounds);
};

window.addEventListener("load", run);
