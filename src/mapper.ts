// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";
import BikeBus from "./bike_bus";
import MapperMap from "./mapper_map";

export const getSheetData = async (
  sheetId: string,
  range: string,
  apiKey: string
) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  const values: string[][] = data.values;
  const headers = values[0];
  const rows = values.slice(1);
  const buses = rows.map((row) => BikeBus.fromRow(headers, row));

  return buses;
};

const createMap = async (mapEl: HTMLElement, apiKey: string) => {
  const loader = new Loader({
    apiKey,
  });

  const map = new MapperMap(loader);
  await map.setup(mapEl);
  return map;
};

export const mapFromSheet = async (
  mapEl: HTMLElement,
  sheetId: string,
  range: string,
  apiKey: string
) => {
  const [map, buses] = await Promise.all([
    createMap(mapEl, apiKey),
    getSheetData(sheetId, range, apiKey),
  ]);

  // wait for all markers to be added
  await Promise.all(buses.map((bus) => map.addMarker(bus)));
  map.recenter();
};
