// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";
// https://developers.google.com/maps/documentation/javascript/marker-clustering
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import BikeBus from "./bike_bus";

export default class MapperMap {
  bounds: google.maps.LatLngBounds;
  clusterer: MarkerClusterer;
  geocoder: google.maps.Geocoder;
  infoWindow: google.maps.InfoWindow;
  loader: Loader;
  map: google.maps.Map;

  constructor(loader: Loader) {
    this.loader = loader;
  }

  async setup(el: HTMLElement) {
    const [core, maps, geocoding] = await Promise.all([
      this.loader.importLibrary("core"),
      this.loader.importLibrary("maps"),
      this.loader.importLibrary("geocoding"),
    ]);

    this.bounds = new core.LatLngBounds();
    this.infoWindow = new maps.InfoWindow();
    this.geocoder = new geocoding.Geocoder();

    this.map = new maps.Map(el, {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      mapId: "DEMO_MAP_ID",
      // gestureHandling: "cooperative",
      maxZoom: 13,
      streetViewControl: false,
      mapTypeControl: false,
    });

    this.clusterer = new MarkerClusterer({ map: this.map });
  }

  async addMarker(bus: BikeBus) {
    const [position, markerLib] = await Promise.all([
      bus.geocode(this.loader, this.geocoder),
      this.loader.importLibrary("marker"),
    ]);

    const marker = new markerLib.AdvancedMarkerElement({
      map: this.map,
      position,
      title: bus.name,
      gmpClickable: true,
    });

    // https://developers.google.com/maps/documentation/javascript/advanced-markers/accessible-markers#make_a_marker_clickable
    marker.addListener("click", () => {
      this.infoWindow.close();

      const header = document.createElement("h3");
      header.textContent = bus.name;
      this.infoWindow.setHeaderContent(header);
      this.infoWindow.setContent(bus.toHTML());

      this.infoWindow.open(this.map, marker);
    });

    this.bounds.extend(position);
    this.clusterer.addMarker(marker);

    return marker;
  }

  // automatically center the map
  recenter() {
    this.map.fitBounds(this.bounds);
  }
}
