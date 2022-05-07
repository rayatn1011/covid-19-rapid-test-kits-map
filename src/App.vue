<script setup>
import { onMounted, provide, reactive, ref, shallowRef } from "vue";
import AppDialog from "./components/AppDialog.vue";
import { Feature } from "ol";
import { Cluster, Vector as VectorSource } from "ol/source";
import {
  Vector as VectorLayer,
  VectorImage as VectorImageLayer,
} from "ol/layer";
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from "ol/style";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import { boundingExtent } from "ol/extent";
import { upAndDown } from "ol/easing";
import { KML } from "ol/format";
import axios from "axios";
import { createMap } from "./utils/createMap.js";

const map = shallowRef();

/**
 * 縣市界線
 */
const createCountryLayer = () => {
  const countryLayer = new VectorImageLayer({
    source: new VectorSource({
      url: "/countryBoundary.kml",
      format: new KML({
        extractStyles: false,
      }),
    }),
    style: [
      new Style({
        stroke: new Stroke({
          color: "#FFF7",
          width: 4,
        }),
      }),
      new Style({
        stroke: new Stroke({
          color: "#9707",
          width: 2,
        }),
      }),
    ],
  });
  return countryLayer;
};

/**
 * 快篩存量集群
 */
const clusterData = ref([]);
let clusterLayer;
const createCluster = async () => {
  clusterData.value = await getClusterData();
  clusterLayer = createClusterLayer();
  map.value.addLayer(clusterLayer);
  createClusterEvent();
};
const getClusterData = async () => {
  try {
    const response = await axios.get("/data.json");
    return response.data;
  } catch (error) {
    console.error(error);
    alert("資料取得失敗");
    return [];
  }
};
const createClusterLayer = () => {
  const features = clusterData.value.map((datum) => {
    const coordinate = [datum.經度, datum.緯度];
    return new Feature({
      id: datum.醫事機構代碼,
      geometry: new Point(fromLonLat(coordinate)),
    });
  });
  const source = new VectorSource({
    features: features,
  });
  const clusterSource = new Cluster({
    distance: 20,
    minDistance: 40,
    source: source,
  });
  const layer = new VectorLayer({
    source: clusterSource,
    style: (feature) => {
      const size = feature.get("features").length;
      const style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: "#fff",
          }),
          fill: new Fill({
            color: "#39C",
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: "#fff",
          }),
        }),
      });
      return style;
    },
  });
  return layer;
};
const createClusterEvent = () => {
  map.value.on("click", (e) => {
    clusterLayer.getFeatures(e.pixel).then((clickedFeatures) => {
      if (clickedFeatures.length) {
        const features = clickedFeatures[0].get("features");
        if (features.length > 1) {
          const extent = boundingExtent(
            features.map((r) => r.getGeometry().getCoordinates())
          );
          fitExtent(extent);
          setDialogVisible(false);
        } else {
          const coordinate = features[0].getGeometry().getCoordinates();
          const extent = [...coordinate, ...coordinate];
          fitExtent(extent);
          const featureId = features[0].get("id");
          setDialogVisible(true, featureId);
        }
      }
    });
  });
  map.value.on("pointermove", (e) => {
    clusterLayer.getFeatures(e.pixel).then((clickedFeatures) => {
      e.map.getTargetElement().style.cursor = clickedFeatures.length
        ? "pointer"
        : "";
    });
  });
};

/**
 * 讓視圖符合指定範圍
 */
const fitExtent = (extent) => {
  map.value.getView().fit(extent, {
    duration: 1000,
    padding: [64, 64, 64, 64],
    easing: upAndDown(),
  });
};

/**
 * 彈出窗
 */
const dialog = reactive({
  isVisible: false,
  title: "快篩試劑存量查詢",
  name: "",
  loacation: "",
  contactNumber: "",
  remark: "",
  num: 0,
});
const setDialogVisible = (booleanValue, clusterId = null) => {
  dialog.isVisible = booleanValue;
  if (booleanValue) {
    addDialogData(clusterId);
  } else {
    clearDialogData();
  }

  function addDialogData(id) {
    if (id !== +id) return;
    const currentDatum = clusterData.value.find(
      (datum) => datum.醫事機構代碼 === clusterId
    );
    if (currentDatum) {
      dialog.name = currentDatum.醫事機構名稱;
      dialog.loacation = currentDatum.醫事機構地址;
      dialog.contactNumber = currentDatum.醫事機構電話;
      dialog.remark = currentDatum.備註;
      dialog.num = currentDatum.快篩試劑截至目前結餘存貨數量;
    } else {
      clearDialogData();
    }
  }
  function clearDialogData() {
    dialog.name = "";
    dialog.loacation = "";
    dialog.contactNumber = "";
    dialog.remark = "";
    dialog.num = 0;
  }
};

/**
 * Lifecycle Hook
 */
onMounted(async () => {
  map.value = createMap();
  map.value.addLayer(createCountryLayer());
  createCluster();
});

/**
 * Provide
 */
provide("map", map);
</script>

<template>
  <article id="map" class="w-screen h-screen"></article>
  <article id="sideBar" class="fixed top-0 left-0 bottom-0">
    <AppDialog v-model="dialog.isVisible" :title="dialog.title">
      <template #default>
        <div class="text-lg font-bold">{{ dialog.name }}</div>
        <div class="text-sm text-stone-700">地址：{{ dialog.loacation }}</div>
        <div class="text-sm text-stone-700">電話：{{ dialog.contactNumber }}</div>
        <div class="text-sm text-stone-700">備註：{{ dialog.remark }}</div>
        <div class="rounded-lg p-4 bg-green-900 text-white">
          <div>快篩試劑剩餘存量</div>
          <div>{{ dialog.num }}</div>
        </div>
      </template>
    </AppDialog>
  </article>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
