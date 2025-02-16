// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";
import { getSheetData } from "./mapper";
import MapperMap from "./mapper_map";

const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "from Bike Bus World";

const loader = new Loader({
  apiKey,
});

const createMap = async () => {
  const mapEl = document.getElementById("map");
  if (!mapEl) {
    throw new Error("Map element not found");
  }

  const map = new MapperMap(loader);
  await map.setup(mapEl);
  return map;
};

const run = async () => {
  const [map, buses] = await Promise.all([
    createMap(),
    getSheetData(sheetId, range, apiKey),
  ]);

  // wait for all markers to be added
  await Promise.all(buses.map((bus) => map.addMarker(bus)));
  map.recenter();
};

window.addEventListener("load", run);
