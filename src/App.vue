<script setup>
import {
  onMounted,
  provide,
  reactive,
  ref,
  shallowRef,
  onUnmounted,
} from "vue";
import AppDialog from "./components/AppDialog.vue";
import MapBtnUserLocation from "./components/MapBtnUserLocation.vue";
import { fitExtent } from "./utils/mapFitExtent";
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
import { KML } from "ol/format";
import axios from "axios";
import { createMap } from "./utils/createMap.js";
import csvToJson from "./utils/csvToJson.js";
import twConfig from "./utils/theme.js";

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
    const response = await axios.get("/Fstdata-220524.csv");
    return csvToJson(response.data);
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
    distance: 40,
    minDistance: 80,
    source: source,
  });
  const layer = new VectorLayer({
    source: clusterSource,
    style: (feature) => {
      const size = feature.get("features").length;
      const style = new Style({
        image: new CircleStyle({
          radius: 16,
          stroke: new Stroke({
            color: "#fff",
          }),
          fill: new Fill({
            color: "#39C",
          }),
        }),
        text: new Text({
          text: String(size),
          font: "0.875rem sans-serif",
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
          fitExtent(map, extent);
          setDialogVisible(false);
        } else {
          const coordinate = features[0].getGeometry().getCoordinates();
          const extent = [...coordinate, ...coordinate];
          fitExtent(map, extent);
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
  dataTime: "",
});
const setDialogVisible = (booleanValue, clusterId = null) => {
  dialog.isVisible = booleanValue;
  if (booleanValue) {
    addDialogData();
  }

  function addDialogData() {
    const currentDatum = clusterData.value.find(
      (datum) => datum.醫事機構代碼 === clusterId
    );
    if (currentDatum) {
      dialog.name = currentDatum.醫事機構名稱;
      dialog.loacation = currentDatum.醫事機構地址;
      dialog.contactNumber = currentDatum.醫事機構電話;
      dialog.remark = currentDatum["備註\r"];
      dialog.num = currentDatum.快篩試劑截至目前結餘存貨數量;
      dialog.dataTime = currentDatum.來源資料時間;
    }
  }
};

/**
 * 判斷寬度
 */
const isMobile = ref();
const onReSize = () => {
  isMobile.value = window.innerWidth < twConfig.theme.screens.lg.slice(0, -2);
};
const addReSizeEvent = () => {
  onReSize();
  window.addEventListener("resize", onReSize);
};
const removeReSizeEvent = () => {
  window.removeEventListener("resize", onReSize);
};

/**
 * Lifecycle Hook
 */
onMounted(async () => {
  addReSizeEvent();
  map.value = createMap();
  map.value.addLayer(createCountryLayer());
  createCluster();
});

onUnmounted(() => {
  removeReSizeEvent();
});

/**
 * Provide
 */
provide("map", map);
provide("isMobile", isMobile);
</script>

<template>
  <article id="map" class="relative h-screen w-screen">
    <section class="absolute right-6 bottom-12 z-20">
      <MapBtnUserLocation />
    </section>
  </article>
  <article id="sideBar" class="fixed top-0 left-0 bottom-0">
    <AppDialog v-model="dialog.isVisible" :title="dialog.title">
      <template #default>
        <div class="flex flex-col gap-y-2 lg:gap-y-4">
          <div class="text-lg font-bold">{{ dialog.name }}</div>
          <div class="rounded-lg bg-gray-100 p-2">
            <div class="mb-1 text-sm text-gray-500">地址</div>
            <div>
              <a
                class="text-indigo-500 underline decoration-2 transition hover:text-indigo-700"
                target="blank"
                :href="`https://www.google.com.tw/maps/place/${dialog.name} ${dialog.loacation}`"
                :alt="`google地圖-${dialog.name}`"
                >{{ dialog.loacation }}</a
              >
            </div>
          </div>
          <div class="rounded-lg bg-gray-100 p-2">
            <div class="mb-1 text-sm text-gray-500">電話</div>
            <div class="font-bold">{{ dialog.contactNumber }}</div>
          </div>
          <div class="rounded-lg bg-gray-100 p-2">
            <div class="mb-1 text-sm text-gray-500">備註</div>
            <div>{{ dialog.remark || "無" }}</div>
          </div>
          <div class="rounded-lg bg-gray-100 p-2">
            <div class="mb-4 text-sm text-gray-500">剩餘存量</div>
            <div
              class="text-right text-4xl font-bold"
              :class="
                dialog.num > 50
                  ? 'text-indigo-500'
                  : dialog.num > 10
                  ? 'text-amber-500'
                  : 'text-red-500'
              "
            >
              {{ dialog.num }}
            </div>
          </div>
          <div class="text-right text-sm text-gray-400">
            {{ `來源資料時間：${dialog.dataTime}` }}
          </div>
          <hr />
          <div>
            <button
              type="button"
              class="w-full rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 py-2 text-white"
              @click="setDialogVisible(false)"
            >
              確定
            </button>
          </div>
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
