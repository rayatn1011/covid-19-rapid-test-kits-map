<script setup>
import { fitExtent } from "../utils/mapFitExtent.js";
import { inject, nextTick, onMounted, onUnmounted } from "vue";
import { fromLonLat } from "ol/proj";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style, Icon } from "ol/style";
import locationUserIcon from "../assets/location-user.svg";

const map = inject("map");
const componentSource = new VectorSource();
const componentLayer = new VectorLayer({
  source: componentSource,
  zIndex: 999,
});
let watcher;
let userCoordinates;

const locateUserCoordinates = () => {
  // 未開啟定位則跳出
  if (!userCoordinates) {
    alert("此功能需開啟定位權限");
    addWatcher();
    return;
  }

  const extent = [...userCoordinates, ...userCoordinates];
  fitExtent(map, extent);
};

const addWatcher = () => {
  watcher = navigator.geolocation.watchPosition(success, error);
  function success(position) {
    const coordinates = fromLonLat([
      position.coords.longitude,
      position.coords.latitude,
    ]);

    saveCoordinates(coordinates);
    drawIconFeature(coordinates);

    function saveCoordinates(coordinates) {
      userCoordinates = coordinates;
    }
    function drawIconFeature(coordinates) {
      const iconFeature = new Feature(new Point(coordinates));
      const iconStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: locationUserIcon,
          scale: 2,
        }),
      });
      iconFeature.setStyle(iconStyle);
      componentSource.addFeature(iconFeature);
    }
  }
  function error(err) {
    console.warn("ERROR(" + err.code + "): " + err.message);
    alert("請開啟裝置定位，並允許使用定位權限");
  }
};

const clearWatcher = () => {
  navigator.geolocation.clearWatch(watcher);
};

onMounted(() => {
  nextTick(() => {
    map.value.addLayer(componentLayer);
    addWatcher();
  });
});
onUnmounted(() => {
  clearWatcher();
});
</script>

<template>
  <button
    type="button"
    class="h-12 w-12 rounded-lg border bg-white shadow-lg transition hover:scale-110 active:scale-100"
    @click="locateUserCoordinates()"
  >
    <i-mdi-crosshairs-gps class="mx-auto" />
  </button>
</template>

<style scoped></style>
