<script setup>
import { fitExtent } from "../utils/mapFitExtent.js";
import { inject, onMounted, onUnmounted } from "vue";
import { fromLonLat } from "ol/proj";

const map = inject("map");
let watcher;
let userCoordinates;
const locateUserCoordinates = () => {
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
    userCoordinates = fromLonLat([
      position.coords.longitude,
      position.coords.latitude,
    ]);
  }
  function error(err) {
    console.warn("ERROR(" + err.code + "): " + err.message);
  }
};
const clearWatcher = () => {
  navigator.geolocation.clearWatch(watcher);
};

onMounted(() => {
  addWatcher();
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
    123
  </button>
</template>

<style scoped></style>
