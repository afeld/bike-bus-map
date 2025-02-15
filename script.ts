// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";
// https://developers.google.com/maps/documentation/javascript/marker-clustering
import { MarkerClusterer } from "@googlemaps/markerclusterer";

const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "from Bike Bus World";

const loader = new Loader({
  apiKey,
});

const arrayToObj = (headers: string[], row: string[]) => {
  const result = {};
  headers.forEach((header, i) => {
    result[header] = row[i];
  });
  return result;
};

// https://stackoverflow.com/a/2843625/358804
const join = (parts: (string | null)[], separator = ", ") =>
  parts.filter(Boolean).join(separator);

class BikeBus {
  constructor(
    public name: string,
    public street: string | null,
    public city: string,
    public state: string,
    public zip: string | null,
    public country: string,
    public lat: number,
    public lng: number,
    public url: string
  ) {
    this.name = name;

    this.street = street;
    this.city = city;
    this.state = state;
    this.zip = zip;
    this.country = country;

    this.lat = lat;
    this.lng = lng;

    this.url = url;
  }

  shortLocation() {
    return join([this.city, this.state, this.country]);
  }

  // used for geocoding
  location() {
    return join([this.street, this.city, this.state, this.zip, this.country]);
  }

  async geocode(geocoder: google.maps.Geocoder) {
    if (this.lat && this.lng) {
      const core = await loader.importLibrary("core");
      return new core.LatLng(this.lat, this.lng);
    }

    const response = await geocoder.geocode({ address: this.location() });
    return response.results[0].geometry.location;
  }

  toHTML() {
    if (this.url) {
      return `
        <p>${this.shortLocation()}</p>
        <p>
          <a href="${this.url}">${this.url}</a>
        </p>
      `;
    }

    return this.shortLocation();
  }

  static fromRow(headers: string[], row: string[]) {
    const rowObj = arrayToObj(headers, row);
    const name = join([rowObj["School Name"], rowObj["Route Name"]], " - ");

    return new BikeBus(
      name,
      null,
      rowObj["City"],
      rowObj["State"],
      null,
      rowObj["Country"],
      parseFloat(rowObj["Lat"]),
      parseFloat(rowObj["Lon"]),
      rowObj["Link"]
    );
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
    streetViewControl: false,
    mapTypeControl: false,
  });
};

const getSheetData = async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();

  const values: string[][] = data.values;
  const headers = values[0];
  const rows = values.slice(1);
  const buses = rows.map((row) => BikeBus.fromRow(headers, row));

  return buses;
};

const addMarker = async (
  geocoder: google.maps.Geocoder,
  map: google.maps.Map,
  bounds: google.maps.LatLngBounds,
  infoWindow: google.maps.InfoWindow,
  bus: BikeBus
) => {
  const position = await bus.geocode(geocoder);
  bounds.extend(position);

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  const marker = new AdvancedMarkerElement({
    map,
    position,
    title: bus.name,
    gmpClickable: true,
  });

  // https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers#make_a_marker_clickable
  marker.addListener("click", () => {
    infoWindow.close();

    const header = document.createElement("h3");
    header.textContent = bus.name;
    infoWindow.setHeaderContent(header);
    infoWindow.setContent(bus.toHTML());

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
  const markers = await Promise.all(
    buses.map((bus) => addMarker(geocoder, map, bounds, infoWindow, bus))
  );

  // automatically center the map
  map.fitBounds(bounds);
  new MarkerClusterer({ markers, map });
};

window.addEventListener("load", run);
