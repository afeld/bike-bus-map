// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#js-api-loader
import { Loader } from "@googlemaps/js-api-loader";
import { arrayToObj, join } from "./utils";

export default class BikeBus {
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

  async geocode(loader: Loader, geocoder: google.maps.Geocoder) {
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
