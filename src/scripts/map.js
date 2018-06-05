
import '../css/_custom_leaflet.scss'
import L from 'leaflet'
import { basemapLayer, featureLayer } from 'esri-leaflet';
import { Component } from './components.js'

//downloaded esri-leaflet-vector to utuls directory so the package worked with webpack es6
//run updates will have to be manually!
//see github issue https://github.com/Esri/esri-leaflet-vector/issues/31  from tgirgin23
import * as vector from './utils/esri-leaflet-vector/EsriLeafletVector';

const template = '<div id="map" ref="mapContainer" class="map"></div>'

/**
 * Leaflet Map Component
 * Render map items, and provide user interactivity.
 * @extends Component
 */
export class Map extends Component {
  /** Map Component Constructor
   * @param { String } placeholderId Element ID to inflate the map into
   * @param { Object } props.events.click Map item click listener
   */
  constructor (mapPlaceholderId, props) {
    super(mapPlaceholderId, props, template)

    // Initialize Leaflet map
    this.map = L.map(this.refs.mapContainer, {
      center: [ 35.5951, -82.5515 ],
      zoom: 13,
      maxZoom: 18,
      minZoom: 4
    })

    this.map.zoomControl.setPosition('topleft') // Position zoom control
    this.layers = {} // Map layer dict (key/value = title/layer)
    this.selectedRegion = null // Store currently selected region

    // Render default baselayer
    // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(this.map);

    // add ESRI vector map
    var vectorTiles = vector.basemap('DarkGray');
    vectorTiles.addTo(this.map);

  }
}
