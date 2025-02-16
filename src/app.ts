import { mapFromSheet } from "./mapper";

const sheetId = "1_BGSepevkTl0xade-TrJISX5Bp6r5tsBDy5_XY2umwc";
const apiKey = "AIzaSyChiRwOLGsaXitE3ZrgM2qIoPpZm1cBjPs";
const range = "from Bike Bus World";

const run = async () => {
  const mapEl = document.getElementById("map");
  if (!mapEl) {
    throw new Error("Map element not found");
  }

  mapFromSheet(mapEl, sheetId, range, apiKey);
};

window.addEventListener("load", run);
