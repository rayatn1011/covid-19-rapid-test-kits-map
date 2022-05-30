import { upAndDown } from "ol/easing";

export function fitExtent(map, extent) {
  map.value.getView().fit(extent, {
    duration: 1000,
    padding: [64, 64, 64, 64],
    easing: upAndDown(),
  });
}
