import { getSheetData, MapperMap } from "./mapper";

const createMap = async () => {
  const mapEl = document.getElementById("map");
  if (!mapEl) {
    throw new Error("Map element not found");
  }

  const map = new MapperMap();
  await map.setup(mapEl);
  return map;
};

const run = async () => {
  const [map, buses] = await Promise.all([createMap(), getSheetData()]);

  // wait for all markers to be added
  await Promise.all(buses.map((bus) => map.addMarker(bus)));
  map.recenter();
};

window.addEventListener("load", run);
