import * as L from "leaflet";

declare module "leaflet" {
  function heatLayer(
    latlngs: Array<[number, number] | [number, number, number]>,
    options?: HeatLayerOptions
  ): HeatLayer;

  interface HeatLayerOptions {
    /** Radius of each point of the heatmap (default: 25) */
    radius?: number;
    /** Amount of blur (default: 15) */
    blur?: number;
    /** Max point intensity (default: 1.0) */
    maxZoom?: number;
    /** Maximum point intensity. (default: 1.0) */
    max?: number;
    /** Minimum opacity the heat will start at */
    minOpacity?: number;
    /** Color gradient config, e.g. {0.4: 'blue', 0.65: 'lime', 1: 'red'} */
    gradient?: { [key: number]: string };
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<[number, number] | [number, number, number]>): this;
    addLatLng(latlng: [number, number] | [number, number, number]): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }
}
