import { Map, View } from "ol";
import { WMTS } from "ol/source";
import { Tile as TileLayer, Group as LayerGroup } from "ol/layer";
import { fromLonLat, get as getProjection } from "ol/proj";
import { getWidth, getTopLeft } from "ol/extent";
import WMTSTileGrid from "ol/tilegrid/WMTS";

const getBaseLayer = () => {
  const projection = getProjection("EPSG:3857");
  const projectionExtent = projection.getExtent();
  const size = getWidth(projectionExtent) / 256;
  let resolutions = new Array(21);
  let matrixIds = new Array(21);
  for (let z = 0; z < 21; ++z) {
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = z;
  }

  const emap5Layer = new TileLayer({
    source: new WMTS({
      url: "https://wmts.nlsc.gov.tw/wmts/EMAP5/default/EPSG:3857/{TileMatrix}/{TileRow}/{TileCol}",
      layer: "EMAP",
      crossOrigin: "anonymous",
      requestEncoding: "REST",
      matrixSet: "GoogleMapsCompatible",
      format: "image/png",
      transparente: true,
      projection: projection,
      tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        matrixIds: matrixIds,
        resolutions: resolutions,
      }),
      style: "default",
      maxZoom: 20,
    }),
  });

  const baseLayerGroup = new LayerGroup({
    layers: [emap5Layer],
  });
  return baseLayerGroup;
};

const createMap = () => {
  const baseLayerGroup = getBaseLayer();
  const map = new Map({
    target: "map",
    layers: [baseLayerGroup],
    view: new View({
      center: fromLonLat([121.0211024, 23.553118]),
      zoom: 8,
      minZoom: 7,
      maxZoom: 19,
      extent: [
        12852360.476946937, 2411354.9201547536, 14170212.585782683,
        3098422.608146722,
      ],
    }),
    controls: [],
  });
  return map;
};
export { createMap };
