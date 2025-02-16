// https://developers.google.com/maps/documentation/javascript/marker-clustering
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { addMarker, createMap, getSheetData, loader } from "./mapper";

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
  const markers = await Promise.all(
    buses.map((bus) => addMarker(geocoder, map, bounds, infoWindow, bus))
  );

  // automatically center the map
  map.fitBounds(bounds);
  new MarkerClusterer({ markers, map });
};

window.addEventListener("load", run);
