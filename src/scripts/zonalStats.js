import L from 'leaflet';
import ZonalWrapper from '../templates/zonal_wrapper.html';
import ColorRampHub from '../templates/colorramp_hub.html';
import ColorRampAquatic from '../templates/colorramp_aquatic.html';
import ColorRampTerrestrial from '../templates/colorramp_terrestrial.html';
import ColorRampExposure from '../templates/colorramp_exposure.html';
import ColorRampAsset from '../templates/colorramp_asset.html';
import ColorRampThreat from '../templates/colorramp_threat.html';
import ZonalLong from '../templates/zonal_long.html';
import ZonalShort from '../templates/zonal_short.html';
import ZonalButtons from '../templates/zonal_buttons.html';
import ColorRampDriverNSHub from '../templates/colorramp_targetedwatershed_hub.html';
import ColorRampDriverNSExposure from '../templates/colorramp_targetedwatershed_exposure.html';
import ColorRampDriverNSAsset from '../templates/colorramp_targetedwatershed_asset.html';
import ColorRampDriverNSThreat from '../templates/colorramp_targetedwatershed_threat.html';
import ColorRampDriverNSFishAndWildlife from '../templates/colorramp_targetedwatershed_fishandwildlife.html';
import { Store } from './store';
import {
  checkValidObject,
  googleAnalyticsEvent,
  getIndexes,
  getAssetDrivers,
  getThreatDrivers
} from './utilitys';
import { bindZonalExportHandler } from './zonalFileExporter';
// required for bootstrap
window.$ = require('jquery');
// required for tooltip, popup...
window.Popper = require('popper.js');

window.jQuery = window.$;

const store = new Store({});

function shapeNavOff() {
  const elem = document.querySelector('.navbar-explore-shapes');
  if (elem) {
    elem.classList.add('long-graphs-active');
  }
}

function shapeNavOn() {
  const elem = document.querySelector('.navbar-explore-shapes');
  if (elem) {
    elem.classList.remove('long-graphs-active');
  }
}
// Checks if a value falls in the range of accepted values
// @param val | string || integer || float
// @return boolean
function checkNoData(val) {
  return Number.isNaN(Number.parseFloat(val)) || Number.parseInt(val, 10) === 255;
}

// Creates a div
function makeDiv() {
  return document.createElement('div');
}

// Creates a text element
// @param text | string
function makeTextElement(text) {
  return document.createTextNode(text);
}

function makeHTMLName(name) {
  return `-USERAREA-${name.replace(' ', '_')}`;
}

function stripUserArea(id) {
  if (!id) return id;
  const striptext = '-USERAREA-';
  const index = id.indexOf(striptext);
  const idLength = id.length;

  if (index >= 0) {
    return id.substring(index, idLength).trim();
  }

  return id;
}

// Gets text for an individual short zonal stats item title
// @return String
function makeLabelText(name) {
  return `Get Details for ${name}`;
}


function setGraphsState(name, activetype) {
  let newname = name;

  const striptext = ['raw-name', 'graph-name', 'dismiss-name', 'label-name'];

  striptext.map((replacetext) => {
    if (name.indexOf(replacetext) >= 0) {
      newname = name.replace(replacetext, 'name');
      return newname;
    }
    return newname;
  });

  newname = newname.replace('name--USERAREA', 'name---USERAREA');
  store.setStoreItem('zonalactive', [newname, activetype]);
  return newname;
}

function enableMainZonalButton() {
  const zonalHolders = document.querySelectorAll('.zonal-stats-button-holder');
  zonalHolders.forEach((zonalHolder) => {
    zonalHolder.classList.remove('d-none');
  });
}

function ZonalWrapperActiveRemove() {
  const x = document.querySelectorAll('.zonal-short-wrapper');
  let i;
  for (i = 0; i < x.length; i += 1) {
    x[i].classList.remove('active');
  }
}

function dissmissAllZonalStatsWrappers() {
  const zonalWrappers = document.querySelectorAll('.zonal-stats-wrapper');
  zonalWrappers.forEach((zonalwrapper) => {
    zonalwrapper.classList.remove('active');
    zonalwrapper.classList.add('d-none');
  });
}

function zonalStatsWrappersActive(name) {
  const zonalWrapper = document.getElementById(`zonal-stats-wrapper-${name}`);
  zonalWrapper.classList.remove('d-none');
  zonalWrapper.classList.add('active');
}

function disableMainZonalButton() {
  const zonalHolders = document.querySelectorAll('.zonal-stats-button-holder');
  zonalHolders.forEach((zonalHolder) => {
    zonalHolder.classList.add('d-none');
  });
}

function disableOverView(text = 'none') {
  const buttonHolder = document.getElementById('zonal-stats-short-title-holder');
  buttonHolder.classList.add('d-none');
}

function disableAllZonalButtons() {
  disableOverView();
  const buttons = document.querySelectorAll('.zonal-long-button-wrapper');
  buttons.forEach((button) => {
    button.classList.add('d-none');
  });
}

// set zonal buttons and header off
function disableZonalButtons(HTMLName) {
  disableMainZonalButton();
  disableAllZonalButtons();
  disableOverView();
  if (document.querySelector(`#button-name--${HTMLName}`)) {
    document.querySelector(`#button-name--${HTMLName}`).classList.add('d-none');
    document.querySelector(`#dismiss-name--${HTMLName}`).classList.add('d-none');
    document.querySelector(`#raw-name--${HTMLName}`).classList.add('d-none');
    document.querySelector(`#graph-name--${HTMLName}`).classList.add('d-none');
  }
}


function disableAllZonalWrappers() {
  const zonalWrappers = document.querySelectorAll('.zonal-long-wrapper ');
  zonalWrappers.forEach((zonalwrapper) => {
    zonalwrapper.classList.remove('active');
  });
}

function enableOverView(text = 'none') {
  const buttonHolder = document.getElementById('zonal-stats-short-title-holder');
  buttonHolder.classList.remove('d-none');
}

function ZonalWrapperActiveAdd() {
  const x = document.querySelectorAll('.zonal-short-wrapper');
  let i;
  for (i = 0; i < x.length; i += 1) {
    x[i].classList.add('active');
  }
}

// Switches the display to the short zonal stats
// @param wrapper | DOM element
function dismissLongZonalStats(wrapper) {
  wrapper.classList.remove('active');
  wrapper.classList.remove('active-table');
  document.getElementById('zonal-header').classList.remove('d-none');

  const id = wrapper.getAttribute('id');
  const HTMLName = stripUserArea(id);
  disableMainZonalButton();
  disableZonalButtons(HTMLName);
  disableAllZonalWrappers();
  enableOverView('dismissLongZonalStats');

  const hasShapeButtonElem = document.getElementById('hasshape-button-holder');
  hasShapeButtonElem.classList.remove('d-none');
  // wrapper.previousSibling.style.height = '100%';
  ZonalWrapperActiveAdd();
}

function enableAllZonalStatsWrappers() {
  const zonalWrappers = document.querySelectorAll('.zonal-stats-wrapper');
  zonalWrappers.forEach((zonalwrapper) => {
    zonalwrapper.classList.remove('d-none');
  });
}

function togglePermHighLightsOff(elem) {
  if (elem) {
    elem.classList.remove('path-highlight-perm');
    elem.classList.add('path-nohighlight-perm');
  }
}

function toggleALLPathsOff(elem) {
  const pathsHighlight = document.querySelectorAll('.path-highlight');
  const pathsHighlightPerm = document.querySelectorAll('.path-highlight-perm');

  pathsHighlight.forEach((path) => {
    path.classList.remove('path-highlight');
    path.classList.add('path-nohighlight');
  });

  pathsHighlightPerm.forEach((path) => {
    path.classList.remove('path-highlight-perm');
    path.classList.add('path-nohighlight-perm');
  });
}

function getZonalWrapper(elem) {
  const areanameid = elem.id;
  const areaname = stripUserArea(areanameid);
  const selector = `.zonal-long-wrapper.active#name-${areaname}`;
  const wrapperelem = document.querySelector(selector);
  return wrapperelem;
}
// Click handler to trigger the dismiss of the long zonal stats
function dismissZonalClickHandler(e) {
  // ga event action, category, label
  googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'dismiss graphs');
  shapeNavOn();

  e.preventDefault();
  setGraphsState('none', 'none');
  dismissLongZonalStats(getZonalWrapper(this));
  enableAllZonalStatsWrappers();
  const name = e.target.getAttribute('id');

  if (name) {
    const HTMLName = name.replace(' ', '_').replace('dismiss-name-', '');
    const path = document.querySelector(`.path-${HTMLName}`);
    togglePermHighLightsOff(path);
  }
  toggleALLPathsOff();
}

function displayRawValues(wrapper) {
  if (wrapper) {
    wrapper.classList.add('active-table');
    const holderElem = document.getElementById('zonal-stats-button-holder');
    if (holderElem) {
      holderElem.classList.add('active-table');
    }
  }
}

function displayGraphs(wrapper) {
  if (wrapper) {
    wrapper.classList.remove('active-table');
  }
  const holderElem = document.getElementById('zonal-stats-button-holder');
  if (holderElem) {
    holderElem.classList.remove('active-table');
  }
}

function displayZonalTableHandler(e) {
  // ga event action, category, label
  googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'display table');

  e.preventDefault();
  setGraphsState(this.getAttribute('id'), 'table');
  displayRawValues(getZonalWrapper(this));
}


function displayZonalGraphsHandler(e) {
  // ga event action, category, label
  googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'display graphs', 'from graphs');

  e.preventDefault();
  setGraphsState(this.getAttribute('id'), 'graph');
  displayGraphs(getZonalWrapper(this));
}


// Switches the display to the long zonal stats
// @param shortElem | DOM element
function viewLongZonalStats(shortElem) {
  if (shortElem) {
    enableMainZonalButton();
    shortElem.nextElementSibling.classList.add('active');
    setGraphsState(shortElem.nextElementSibling.getAttribute('id'), 'graph');
    document.getElementById('zonal-header').classList.add('d-none');
    shapeNavOff();
    ZonalWrapperActiveRemove();
    const HTMLName = stripUserArea(shortElem.id);
    dissmissAllZonalStatsWrappers();
    zonalStatsWrappersActive(HTMLName);
    const hasShapeButtonElem = document.getElementById('hasshape-button-holder');
    hasShapeButtonElem.classList.add('d-none');
    document.querySelector(`#dismiss-name--${HTMLName}`).addEventListener('click', dismissZonalClickHandler);
    document.querySelector(`#raw-name--${HTMLName}`).addEventListener('click', displayZonalTableHandler);
    document.querySelector(`#graph-name--${HTMLName}`).addEventListener('click', displayZonalGraphsHandler);
  }
}

// set zonal buttons and header on
function enableZonalButtons(HTMLName) {
  disableOverView();
  if (document.querySelector(`#button-name--${HTMLName}`)) {
    document.querySelector(`#button-name--${HTMLName}`).classList.remove('d-none');
    document.querySelector(`#dismiss-name--${HTMLName}`).classList.remove('d-none');
    document.querySelector(`#raw-name--${HTMLName}`).classList.remove('d-none');
    document.querySelector(`#graph-name--${HTMLName}`).classList.remove('d-none');


    document.querySelector(`#dismiss-name--${HTMLName}`).addEventListener('click', dismissZonalClickHandler);
    document.querySelector(`#raw-name--${HTMLName}`).addEventListener('click', displayZonalTableHandler);
    document.querySelector(`#graph-name--${HTMLName}`).addEventListener('click', displayZonalGraphsHandler);
    bindZonalExportHandler(HTMLName);
  }
}

function togglePermHighLightsOn(elem) {
  if (elem) {
    elem.classList.add('path-highlight-perm');
    elem.classList.remove('path-nohighlight-perm');
  }
}

// Click handler to trigger the load of the long zonal stats
function shortZonalClickHandler(e) {
  // ga event action, category, label
  googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'display graphs', 'from details');

  e.preventDefault();
  const id = e.target.getAttribute('id');
  const HTMLName = stripUserArea(id);
  setGraphsState(this.getAttribute('id'), 'graph');
  const shortChartElem = document.getElementById(`short-chart-${HTMLName}`);
  viewLongZonalStats(shortChartElem);
  enableZonalButtons(HTMLName);
  disableOverView();

  if (HTMLName) {
    if (HTMLName.indexOf('div_class') === -1) {
      const path = document.querySelector(`.path-${HTMLName}`);
      togglePermHighLightsOn(path);
    }
  }
}

// Makes main title for an individual short zonal stats item
// @return DOM element
function makeLabel(name) {
  const zonalLabel = makeDiv();
  const HTMLName = makeHTMLName(name);
  zonalLabel.classList.add('zonal-label');
  zonalLabel.classList.add('btn');
  zonalLabel.classList.add('btn-light');
  zonalLabel.classList.add('btn-details');
  zonalLabel.classList.add('user-shape');
  zonalLabel.classList.add('col-7');
  zonalLabel.classList.add('col-sm-8');
  zonalLabel.classList.add('col-md-8');
  zonalLabel.classList.add('col-lg-8');

  zonalLabel.setAttribute('id', `label-name-${HTMLName}`);
  zonalLabel.setAttribute('title', `Get Details for ${stripUserArea(name)}`);
  zonalLabel.setAttribute('aria-label', `Get Details for ${stripUserArea(name)}`);

  zonalLabel.innerHTML = '<span class="btn-icon" id="btn-details-icon" ><i class="far fa-chart-bar"></i></span>';
  // zonalLabel.setAttribute('id', 'zonal-label');
  zonalLabel.appendChild(makeTextElement(makeLabelText(name)));

  if (window.screen.availWidth < 769) {
    zonalLabel.addEventListener('click', shortZonalClickHandler);
  }

  return zonalLabel;
}

// adds a generic id attribute to all the children so the hover and
// highlghts work for the dom elements and their children
function addUserAreaIdsToChildren(children, name) {
  if (!checkValidObject(children)) { return false; }
  if (children.length > 0) {
    // create children nodes array so we can map and change it
    const childrenArray = [...children];
    childrenArray.map((childItem) => {
      // add userarea name only if the node is an HTML element
      if (childItem instanceof Element) {
        childItem.setAttribute('id', `generic-${name}`);
      }

      // check if the child has children if so recursivly call this function again
      if (!checkValidObject(childItem.childNodes)) { return false; }
      if (childItem.childNodes.length > 0) {
        const grandChild = childItem.childNodes;
        addUserAreaIdsToChildren(grandChild, name);
      } else {
        return false;
      }
      return true;
    });
  } else {
    return false;
  }
  return true;
}

// remove one of the user shapes in the userarea object
function removeUserareaByName(name) {
  const currentshapes = store.getStateItem('userareas');
  Object.keys(currentshapes).map((key) => {
    if (currentshapes[key][0].name === name) {
      delete currentshapes[key];
    }
    return currentshapes;
  });

  store.setStoreItem('userareas', currentshapes);

  const savedshapes = store.getStateItem('savedshapes');
  Object.keys(savedshapes).map((key) => {
    if (savedshapes[key][0].name === name) {
      delete savedshapes[key];
    }
    return savedshapes;
  });

  store.setStoreItem('savedshapes', savedshapes);
}

function dispatchRemoveEnd() {
  const removeUserAreaEvent = new CustomEvent('removeuserareend');
  window.dispatchEvent(removeUserAreaEvent);
}

function returnSimpleButtonElementId(element) {
  let areaname = element.getAttribute('id');

  if (element instanceof SVGElement) {
    const parentElem = element.parentElement;
    areaname = parentElem.getAttribute('id');
    if (element instanceof SVGElement) {
      const GParent = parentElem.parentElement;
      areaname = GParent.getAttribute('id');
    }
  }
  return areaname;
}

function ZoomGeoJSON(zoomlayer, mapComponent) {
  const zoomBounds = zoomlayer.getBounds();
  if (mapComponent.map) {
    mapComponent.map.flyToBounds(zoomBounds.pad(0.2));
  } else {
    mapComponent.flyToBounds(zoomBounds.pad(0.2));
  }
}

// Makes main title for an individual short zonal stats item
// @return DOM element
function makeOverviewLabel() {
  const Overview = makeDiv();

  Overview.setAttribute('title', 'Overview');
  Overview.setAttribute('aria-label', 'Overview');
  Overview.classList.add('col-12');
  Overview.setAttribute('id', 'overview-label');
  Overview.innerHTML = '<h3>Overview</h3>';
  return Overview;
}

// get geojson for path soo we can zoom to the area
async function getExlporeGeoJson(areahml, mapComponent) {
  const area = areahml.replace('_', ' ');
  const currentshapes = store.getStateItem('userareas');
  const shape = Object.keys(currentshapes).filter((value) => {
    const val = currentshapes[value][0].name === area;
    return val;
  });

  const val = shape[0];
  const shapeObj = currentshapes[val];
  const zoomgeojson = shapeObj[2].userarea_buffered;
  const zoomlayer = L.geoJSON(zoomgeojson);
  ZoomGeoJSON(zoomlayer, mapComponent);
}

async function getHubGeoJson(areahml, mapComponent) {
  const area = areahml.replace('_', ' ');
  const HubIntersectionJson = store.getStateItem('HubIntersectionJson');
  let shape = {};
  Object.keys(HubIntersectionJson).forEach((val) => {
    if (HubIntersectionJson[val].properties.mean.TARGET_FID.toString().trim() === area) {
      shape = HubIntersectionJson[val];
    }
  });

  const zoomlayer = L.geoJSON(shape);
  ZoomGeoJSON(zoomlayer, mapComponent);
}

async function getNatureServeHubGeoJson(areahml, mapComponent) {
  const area = areahml.replace('_', ' ');
  const NatureServeHubIntersectionJson = store.getStateItem('NatureServeHubIntersectionJson');
  let shape = {};
  Object.keys(NatureServeHubIntersectionJson).forEach((val) => {
    if (NatureServeHubIntersectionJson[val].properties.mean.TARGET_FID.toString().trim() === area) {
      shape = NatureServeHubIntersectionJson[val];
    }
  });

  const zoomlayer = L.geoJSON(shape);
  ZoomGeoJSON(zoomlayer, mapComponent);
}

// Makes main title for an individual short zonal stats item
// @return DOM element
function makeZoom(name, mapComponent) {
  const Zoom = makeDiv();
  const HTMLName = makeHTMLName(name);

  Zoom.classList.add('zonal-label-zoom');
  Zoom.classList.add('btn');
  Zoom.classList.add('btn-light');
  Zoom.classList.add('btn-details');
  Zoom.classList.add('user-shape');
  Zoom.classList.add('col-1');
  Zoom.setAttribute('id', `label-name-zoom-${HTMLName}`);
  Zoom.setAttribute('title', `Zoom to ${stripUserArea(name)}`);
  Zoom.setAttribute('aria-label', `Zoom to ${stripUserArea(name)}`);

  Zoom.innerHTML = `<i class="fas fa-search-location" id="svg-name-zoom-${HTMLName}" style="z-index: -99;"></i>`;
  Zoom.addEventListener('click', (e) => {
    // ga event action, category, label
    googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'zoom area');

    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();

    const areanameid = returnSimpleButtonElementId(e.target);
    let areaname = stripUserArea(areanameid);
    areaname = areaname.replace('-USERAREA-', '').replace('_', ' ');
    const activeNav = store.getStateItem('activeNav');

    if (activeNav) {
      switch (activeNav) {
        case 'main-nav-map-searchhubs':
          getHubGeoJson(areaname, mapComponent);
          break;
        case 'main-nav-map-examples':
          break;
        case 'main-nav-map-searchNShubs':
          getNatureServeHubGeoJson(areaname, mapComponent);
          break;
        case 'main-nav-map':
          getExlporeGeoJson(areaname, mapComponent);
          break;
        default:
          getExlporeGeoJson(areaname, mapComponent);
          break;
      }
    }
  });
  return Zoom;
}

// Makes main title for an individual short zonal stats item
// @return DOM element
function makeRemoveLabel(name, mapComponent) {
  const zonalLabel = makeDiv();
  const HTMLName = makeHTMLName(name);
  zonalLabel.classList.add('zonal-label-remove');
  zonalLabel.classList.add('btn');
  zonalLabel.classList.add('btn-light');
  zonalLabel.classList.add('btn-details');
  zonalLabel.classList.add('user-shape');
  zonalLabel.classList.add('text-danger');
  zonalLabel.classList.add('col-1');
  zonalLabel.setAttribute('id', `label-name-remove-${HTMLName}`);
  zonalLabel.setAttribute('title', `Remove ${stripUserArea(name)} from list`);
  zonalLabel.setAttribute('aria-label', `Remove ${stripUserArea(name)} from list`);

  zonalLabel.innerHTML = `<i class="far fa-trash-alt" id="svg-name-remove-${HTMLName}" style="z-index: -99;"></i>`;
  zonalLabel.addEventListener('click', (e) => {
    // ga event action, category, label
    googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'remove area');

    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();

    const areanameid = returnSimpleButtonElementId(e.target);
    let areaname = stripUserArea(areanameid);
    const removeElemName = `zonal-stats-wrapper-${areaname}`;
    const removeElem = document.getElementById(removeElemName);
    removeElem.parentNode.removeChild(removeElem);
    areaname = areaname.replace('-USERAREA-', '').replace('_', ' ');
    removeUserareaByName(areaname);

    // dispatch a event to window so we can redraw the map layers
    // and redraw the zonal stat area
    dispatchRemoveEnd();
  });

  return zonalLabel;
}

// Creates all of the interior html for the short zonal stats
// @param data | Object
// @return Array
function makeShortZonalStatsInterior(data, name) {
  return [
    makeLabel(name)
  ];
}


// checks if inner HTML of element is Plain old Text
// instead of another HTML element
function innerHTMLisText(innerHTML) {
  if (typeof innerHTML === 'string') {
    if (innerHTML.indexOf('div') === -1) {
      return true;
    }
  }
  return false;
}

function toggleMouseHighLightsOn(elem) {
  if (elem) {
    elem.classList.add('path-highlight');
    elem.classList.remove('path-nohighlight');
  }
}

function toggleMouseHighLightsOff(elem) {
  if (elem) {
    elem.classList.remove('path-highlight');
    elem.classList.add('path-nohighlight');
  }
}

function togglePermHighLightsAllOff(elem) {
  if (elem) {
    elem.classList.remove('path-highlight-perm');
    elem.classList.remove('path-nohighlight-perm');
  }
}

function toggleAllLongZonalsOff(elem) {
  const zonalLongWrapper = document.querySelectorAll('.zonal-long-wrapper');

  zonalLongWrapper.forEach((zonal) => {
    zonal.classList.remove('active');
  });
}

function toggleLabelHighLightsOff(elem) {
  if (elem) {
    elem.classList.remove('label-name-highlight');
    elem.classList.add('label-name-nohighlight');
  }
}

function toggleLabelHighLightsOn(elem) {
  if (elem) {
    elem.classList.add('label-name-highlight');
    elem.classList.remove('label-name-nohighlight');
  }
}

function hideLastLongStats() {
  const graphstate = store.getStateItem('zonalactive');
  // remove any prevous long chart
  if (checkValidObject(graphstate)) {
    const elemid = graphstate[0];
    const activestate = graphstate[1];
    if (activestate === 'graph' || activestate === 'table') {
      const lastactive = document.getElementById(elemid);
      if (lastactive) {
        lastactive.classList.remove('active');
      }
    }
  }
}

function hideLastHighlight() {
  const graphstate = store.getStateItem('zonalactive');
  // remove any prevous long chart
  if (checkValidObject(graphstate)) {
    const elemid = graphstate[0];

    const lastpathid = elemid.replace('name--USERAREA-', 'path--USERAREA-');
    const lastpathelem = document.querySelector(`.${lastpathid}`);

    togglePermHighLightsOff(lastpathelem);
    toggleMouseHighLightsOff(lastpathelem);
  }
}

function viewLongZonalStatsFromShape(name) {
  // ga event action, category, label
  googleAnalyticsEvent('click', `zonalstats ${store.getStateItem('activeNav')}`, 'display graphs', 'from shape');

  hideLastLongStats();
  hideLastHighlight();

  document.getElementById('zonal-header').classList.add('d-none');
  ZonalWrapperActiveRemove();
  disableAllZonalButtons();
  enableZonalButtons(`-USERAREA-${name}`);
  disableOverView();
  enableMainZonalButton();
  dissmissAllZonalStatsWrappers();
  zonalStatsWrappersActive(`-USERAREA-${name}`);

  const hasShapeButtonElem = document.getElementById('hasshape-button-holder');
  hasShapeButtonElem.classList.add('d-none');

  const pathid = `path--USERAREA-${name}`;
  if (pathid) {
    const pathelem = document.querySelector(`.${pathid}`);
    togglePermHighLightsOn(pathelem);
  }

  const idname = `name--USERAREA-${name}`;
  if (idname) {
    document.getElementById(idname).classList.add('active');
    setGraphsState(idname, 'graph');
  }
}

function zonalLabelMouseOverHandler(e) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();
  const id = e.target.getAttribute('id');
  const HTMLName = stripUserArea(id);
  if (innerHTMLisText(HTMLName)) {
    const path = document.querySelector(`.path-${HTMLName}`);
    togglePermHighLightsAllOff(path);
    toggleMouseHighLightsOn(path);
  }
}

function zonalLabelMouseOutHandler(e) {
  e.stopImmediatePropagation();
  e.stopPropagation();
  e.preventDefault();
  const id = e.target.getAttribute('id');
  const HTMLName = stripUserArea(id);

  if (innerHTMLisText(HTMLName)) {
    const path = document.querySelector(`.path-${HTMLName}`);
    toggleMouseHighLightsOff(path);

    const labelName = `label-name-${HTMLName}`;
    const labelElem = document.getElementById(labelName);
    toggleLabelHighLightsOff(labelElem);

    const labelzName = `zonal-wrapper-${HTMLName}`;
    const labelzElem = document.getElementById(labelzName);
    toggleLabelHighLightsOff(labelzElem);

    const shotChartsLabels = `short-chart-${HTMLName}`;
    const shotChartsLabelsElem = document.getElementById(shotChartsLabels);
    toggleLabelHighLightsOff(shotChartsLabelsElem);
  }
}

// This function finds the scaled position of a value from [0,100]
// It does the addition of scale and division by scaleGroups since the value falls into one of
// multiple ranges and so it needs to put the scaled value into the correct area.
//
// @param val - float
// @param rangeMin - int
// @param rangeMax - int
// @param scale - int. [0,scaleGroups - 1]
// @param scaleGroups - int. Number of groups the value could be scaled for. [1,]
function getValuePosition(val, rangeMin, rangeMax, scale, scaleGroups) {
  let valOveride = val;
  // no data overide
  if (val === '255') {
    valOveride = 0;
  }
  let position = (valOveride - rangeMin) / (rangeMax - rangeMin); // [0,1]
  position += scale; // [0,scaleGroups]
  position = (position / scaleGroups) * 100; // [0, 100]
  if (position === 100) {
    position = 99;
  }
  return position;
}

// Finds the scaled position for the drivers
// @param driver | float - value from the api for a driver
// @return float - [0,100]
function getDriverHeight(driver) {
  const LOW_RANGE = 0;
  const HIGH_RANGE = 5;
  const SCALE = 0;
  const SCALE_GROUPS = 1;

  return getValuePosition(driver, LOW_RANGE, HIGH_RANGE, SCALE, SCALE_GROUPS);
}

// Finds the scaled position for the drivers
// @param driver | float - value from the api for a driver
// @return float - [0,100]
function getTwoHeight(driver) {
  const LOW_RANGE = 0;
  const HIGH_RANGE = 5;
  const SCALE = 0;
  const SCALE_GROUPS = 2;

  return getValuePosition(driver, LOW_RANGE, HIGH_RANGE, SCALE, SCALE_GROUPS);
}

// Finds the scaled position for the drivers
// @param driver | float - value from the api for a driver
// @return float - [0,100]
function getThreeHeight(driver) {
  const LOW_RANGE = 0;
  const HIGH_RANGE = 3;
  const SCALE = 0;
  const SCALE_GROUPS = 1;

  return getValuePosition(driver, LOW_RANGE, HIGH_RANGE, SCALE, SCALE_GROUPS);
}

// Finds the scaled position for the drivers
// @param driver | float - value from the api for a driver
// @return float - [0,100]
function getSixHeight(driver) {
  const LOW_RANGE = 0;
  const HIGH_RANGE = 6;
  const SCALE = 0;
  const SCALE_GROUPS = 1;

  return getValuePosition(driver, LOW_RANGE, HIGH_RANGE, SCALE, SCALE_GROUPS);
}

// Finds the scaled position for the drivers
// @param driver | float - value from the api for a driver
// @return float - [0,100]
function getSevenHeight(driver) {
  const LOW_RANGE = 0;
  const HIGH_RANGE = 7;
  const SCALE = 0;
  const SCALE_GROUPS = 1;

  return getValuePosition(driver, LOW_RANGE, HIGH_RANGE, SCALE, SCALE_GROUPS);
}
// Finds the scaled position for the drivers
// @param driver | float - value from the api for a driver
// @return float - [0,100]
function getTenHeight(driver) {
  const LOW_RANGE = 0;
  const HIGH_RANGE = 10;
  const SCALE = 0;
  const SCALE_GROUPS = 1;

  return getValuePosition(driver, LOW_RANGE, HIGH_RANGE, SCALE, SCALE_GROUPS);
}

// Returns a position formatted as a percentage
// @param position | float
// @return String
function formatPosition(position) {
  return `${position}%`;
}

// Builds the inner HTML for the long zonal stats
// @param DOM Element | wrapper
function buildLongStatsHtml(wrapper) {
  // lint complains otherwise, but due to chaining of functions it's mistaken
  const innerWrapper = wrapper;
  innerWrapper.innerHTML = ZonalLong;

  innerWrapper.querySelector('.zonal-long-hub .zonal-long-table-wrapper').innerHTML = ColorRampHub;
  innerWrapper.querySelector('.zonal-long-table-index--aquatic .zonal-long-table-wrapper').innerHTML = ColorRampAquatic;
  innerWrapper.querySelector('.zonal-long-table-index--wildlife .zonal-long-table-wrapper').innerHTML = ColorRampTerrestrial;
  innerWrapper.querySelector('.zonal-long-exposure-box .zonal-long-table-wrapper').innerHTML = ColorRampExposure;
  innerWrapper.querySelector('.zonal-long-table-asset-sep .zonal-long-table-wrapper').innerHTML = ColorRampAsset;
  innerWrapper.querySelector('.zonal-long-table-threat-sep .zonal-long-table-wrapper').innerHTML = ColorRampThreat;

  innerWrapper.querySelector('.zonal-long-ns-hub .zonal-long-table-wrapper').innerHTML = ColorRampDriverNSHub;
  innerWrapper.querySelector('.zonal-long-ns-exposure-box .zonal-long-table-wrapper').innerHTML = ColorRampDriverNSExposure;
  innerWrapper.querySelector('.zonal-long-table-ns-asset-sep .zonal-long-table-wrapper').innerHTML = ColorRampDriverNSAsset;
  innerWrapper.querySelector('.zonal-long-table-ns-threat-sep .zonal-long-table-wrapper').innerHTML = ColorRampDriverNSThreat;
  innerWrapper.querySelector('.zonal-long-table-ns-fishandwildlife .zonal-long-table-wrapper').innerHTML = ColorRampDriverNSFishAndWildlife;
}

// convert a number to to the word representation
// of the number.  We are using the word in the HTML class
// and will use this to highlight the value in the chart details
function numberToWord(number) {
  let numberWord = 'none';

  switch (number) {
    case 0:
      numberWord = 'none';
      break;
    case 1:
      numberWord = 'one';
      break;
    case 2:
      numberWord = 'two';
      break;
    case 3:
      numberWord = 'three';
      break;
    case 4:
      numberWord = 'four';
      break;
    case 5:
      numberWord = 'five';
      break;
    case 6:
      numberWord = 'six';
      break;
    case 7:
      numberWord = 'seven';
      break;
    case 8:
      numberWord = 'eight';
      break;
    case 9:
      numberWord = 'nine';
      break;
    case 10:
      numberWord = 'ten';
      break;
    case 11:
      numberWord = 'eleven';
      break;
    case 12:
      numberWord = 'twelve';
      break;
    case 13:
      numberWord = 'thirteen';
      break;
    case 14:
      numberWord = 'fourteen';
      break;
    case 15:
      numberWord = 'fifteen';
      break;
    case 16:
      numberWord = 'sixteen';
      break;
    case 17:
      numberWord = 'seventeen';
      break;
    case 18:
      numberWord = 'eightteen';
      break;
    case 19:
      numberWord = 'nineteen';
      break;
    case 20:
      numberWord = 'twenty';
      break;
    default:
  }
  return numberWord;
}

function selectChartCell(wrapper, type, value) {
  const roundedValue = parseInt(value, 10);

  const roundedValueWord = numberToWord(roundedValue);
  let tooltipValue = Math.round(value * 100) / 100;
  if (Number.isNaN(tooltipValue)) {
    tooltipValue = 'None';
  }

  if (tooltipValue === 0) {
    tooltipValue = 'None';
  }

  if (checkValidObject(roundedValue)) {
    const selector = `.zonal-long-table-cell-${type}-${roundedValueWord}`;
    const cell = wrapper.querySelector(selector);
    if (cell) {
      cell.classList.add('selected-cell');
      cell.setAttribute('title', `${tooltipValue}`);
      cell.setAttribute('aria-label', `${tooltipValue}`);
      cell.setAttribute('data-toggle', 'tooltip');
      cell.setAttribute('data-placement', 'top');
    }
  }
}

// Configures each driver bar
// @param graph | DOM element
// @param driver | Object
function drawDriver(graph, name, type, driver) {
  let height = getDriverHeight(driver.value);
  let cssKey = driver.key;
  let csstype = type;
  let cssExtra = '';
  const activeNav = store.getStateItem('activeNav');

  switch (activeNav) {
    case 'main-nav-map-searchhubs':
      cssExtra = '';
      break;
    case 'main-nav-map-examples':
      cssExtra = '';
      break;
    case 'main-nav-map-searchNShubs':
      cssExtra = 'ns-';
      break;
    default:
      cssExtra = '';
      break;
  }

  if (driver.key === 'hubs') {
    height = getTenHeight(driver.value);
    cssKey = 'hub';
  }

  if (driver.key === 'ns-hubs') {
    height = getSixHeight(driver.value);
    cssKey = 'ns-hub';
  }

  if (driver.key === 'aquatic') {
    height = getSixHeight(driver.value);
    cssKey = 'fish';
  }

  if (driver.key === 'fishandwildlife') {
    height = getSevenHeight(driver.value);
    cssKey = 'fishandwildlife';
  }

  if (driver.key === 'ns-fishandwildlife') {
    height = getSixHeight(driver.value);
    cssKey = 'ns-fishandwildlife';
  }

  if (driver.key === 'terrestrial') {
    height = getSixHeight(driver.value);
    cssKey = 'wildlife';
  }

  if (driver.key === 'exposure') {
    height = getTenHeight(driver.value);
    cssKey = 'exposure-box';
  }

  if (driver.key === 'ns-exposure') {
    height = getSixHeight(driver.value);
    cssKey = 'ns-exposure-box';
  }

  if (driver.key === 'threat') {
    height = getTenHeight(driver.value);
    cssKey = 'threat';
  }

  if (driver.key === 'ns-threat') {
    height = getSixHeight(driver.value);
    cssKey = 'ns-threat';
  }

  if (driver.key === 'asset') {
    height = getTenHeight(driver.value);
    cssKey = 'asset';
  }

  if (driver.key === 'ns-asset') {
    height = getSixHeight(driver.value);
    cssKey = 'ns-asset';
  }

  if (driver.key === 'population-density') {
    height = getSixHeight(driver.value);
    csstype = 'popdensity';
  }

  if (driver.key === 'social-vulnerability') {
    height = getThreeHeight(driver.value);
    csstype = 'socvuln';
  }

  if (driver.key === 'critical-facilities') {
    height = getSixHeight(driver.value);
    csstype = 'critfac';
  }

  if (driver.key === 'critical-infrastructure') {
    height = getTwoHeight(driver.value);
    csstype = 'critinfra';
  }

  if (driver.key === 'drainage') {
    height = getSixHeight(driver.value);
    csstype = 'drainage';
  }

  if (driver.key === 'erosion') {
    height = getSixHeight(driver.value);
    csstype = 'erosion';
  }

  if (driver.key === 'floodprone-areas') {
    height = getSixHeight(driver.value);
    csstype = 'floodprone';
  }

  if (driver.key === 'sea-level-rise') {
    height = getSixHeight(driver.value);
    csstype = 'slr';
  }

  if (driver.key === 'storm-surge') {
    height = getSixHeight(driver.value);
    csstype = 'stormsurge';
  }

  if (driver.key === 'geostress') {
    height = getThreeHeight(driver.value);
    csstype = 'geostress';
  }

  if (driver.key === 'slope') {
    height = getSixHeight(driver.value);
    csstype = 'slope';
  }

  const roundedValue = parseInt(driver.value, 10);
  const roundedValueWord = numberToWord(roundedValue);
  // const bar = graph.querySelector(`.zonal-long-graph-bar-${cssExtra}${driver.key}`);
  const bar = graph.querySelector(`.zonal-long-graph-bar-${driver.key}`);
  const tooltipValue = Math.round(driver.value * 100) / 100;
  const toolTipword = numberToWord(roundedValue);

  if (bar) {
    bar.setAttribute('id', `zonal-long-graph-bar-${cssExtra}${name}`);
    bar.style.height = formatPosition(height);
    if (name) {
      bar.classList.add(`zonal-long-table-cell-${cssKey}-${toolTipword}`);
    // } else {
      // bar.style.backgroundColor = getDriverColor(height);
    }

    bar.classList.add(`driver-chart-backgroundColor-${csstype}-${roundedValueWord}`);
    bar.setAttribute('title', `${tooltipValue}`);
    bar.setAttribute('aria-label', `${tooltipValue}`);
    bar.setAttribute('data-toggle', 'tooltip');
    bar.setAttribute('data-placement', 'top');
  }
}

function drawShortChart(wrapper, drivers, name, activeNav) {
  let assetGraph = wrapper.querySelector('.zonal-long-graph-wrapper-short-chart .default-long-graphs .zonal-long-graph');
  switch (activeNav) {
    case 'main-nav-map-searchhubs':
      assetGraph = wrapper.querySelector('.zonal-long-graph-wrapper-short-chart .default-long-graphs .zonal-long-graph');
      assetGraph.setAttribute('id', `zonal-long-graph-${name}`);
      drivers.forEach(drawDriver.bind(null, assetGraph, name, ''));
      break;
    case 'main-nav-map-examples':
      assetGraph = wrapper.querySelector('zonal-long-graph-wrapper-short-chart .default-long-graphs .zonal-long-graph');
      assetGraph.setAttribute('id', `zonal-long-graph-${name}`);
      drivers.forEach(drawDriver.bind(null, assetGraph, name, ''));
      break;
    case 'main-nav-map-searchNShubs':
      assetGraph = wrapper.querySelector('.zonal-long-graph-wrapper-short-chart .ns-long-graphs .zonal-long-graph');
      assetGraph.setAttribute('id', `zonal-long-graph-${name}`);
      drivers.forEach(drawDriver.bind(null, assetGraph, name, ''));
      break;
    case 'main-nav-map':
      assetGraph = wrapper.querySelector('.zonal-long-graph-wrapper-short-chart .default-long-graphs .zonal-long-graph');
      assetGraph.setAttribute('id', `zonal-long-graph-${name}`);
      drivers.forEach(drawDriver.bind(null, assetGraph, name, ''));
      break;
    default:
      assetGraph = wrapper.querySelector('.zonal-long-graph-wrapper-short-chart .default-long-graphs .zonal-long-graph');
      assetGraph.setAttribute('id', `zonal-long-graph-${name}`);
      drivers.forEach(drawDriver.bind(null, assetGraph, name, ''));
      break;
  }
}

function drawMapInfoChart(drivers, name, graph) {
  const activeNav = store.getStateItem('activeNav');
  let mapInfoElemCalss = '';
  if (activeNav === 'main-nav-map-searchNShubs') {
    mapInfoElemCalss = '.ns-mapinfo';
  } else {
    mapInfoElemCalss = '.default-mapinfo';
  }
  const mapInfoGraph = graph.querySelector(`#mapinfodata ${mapInfoElemCalss} .zonal-long-graph`);
  drivers.forEach(drawDriver.bind(null, mapInfoGraph, name, ''));
}

// @return Array
function getShortDataChartData(data) {
  return [
    {
      label: 'hubs',
      key: 'hubs',
      value: data.hubs
    },
    {
      label: 'exposure',
      key: 'exposure',
      value: data.exposure
    },
    {
      label: 'asset',
      key: 'asset',
      value: data.asset
    },
    {
      label: 'threat',
      key: 'threat',
      value: data.threat
    },
    {
      label: 'aquatic',
      key: 'aquatic',
      value: data.aquatic
    },
    {
      label: 'terrestrial',
      key: 'terrestrial',
      value: data.terrestrial
    },
    {
      label: 'ns-hubs',
      key: 'ns-hubs',
      value: data.ns_hubs
    },
    {
      label: 'ns-fishandwildlife',
      key: 'ns-fishandwildlife',
      value: data.ns_fishandwildlife
    },
    {
      label: 'ns-asset',
      key: 'ns-asset',
      value: data.ns_asset
    },
    {
      label: 'ns-threat',
      key: 'ns-threat',
      value: data.ns_threat
    },
    {
      label: 'ns-exposure',
      key: 'ns-exposure',
      value: data.ns_exposure
    }
  ];
}

// Configures each asset driver bar
// @param wrapper | DOM element
// @param drivers | Array
function drawAssetDrivers(wrapper, drivers) {
  const assetGraph = wrapper.querySelector('.zonal-long-graph-wrapper-asset .zonal-long-graph');
  drivers.forEach(drawDriver.bind(null, assetGraph, '', 'asset'));
}

// draw the mapinfo chart. This is the indentify click function
function drawMapInfoStats(data, doc) {
  drawMapInfoChart(getShortDataChartData(data), 'mapInfo', doc);
}

// Creates the entire short zonal stats block of html
// @param data | Object
// @return DOM element
function drawShortZonalStats(data, name, mapComponent) {
  const wrapper = makeDiv();
  const activeNav = store.getStateItem('activeNav');

  wrapper.classList.add('zonal-short-wrapper');
  wrapper.classList.add('w-100');
  wrapper.classList.add('active');
  wrapper.classList.add('row');
  wrapper.classList.add('justify-content-center');

  const HTMLName = makeHTMLName(name);
  wrapper.setAttribute('id', `short-chart-${HTMLName}`);

  wrapper.innerHTML = ZonalShort;

  const shortChart = wrapper.querySelector('.zonal-short-wrappper');
  addUserAreaIdsToChildren(shortChart.childNodes, HTMLName);

  makeShortZonalStatsInterior(data, name).forEach((elem) => {
    wrapper.insertBefore(elem, wrapper.childNodes[0]);
  });

  drawShortChart(wrapper, getShortDataChartData(data), HTMLName, activeNav);

  if (window.screen.availWidth > 769) {
    wrapper.addEventListener('click', shortZonalClickHandler);
  }

  wrapper.addEventListener('mouseover', zonalLabelMouseOverHandler);
  wrapper.addEventListener('mouseout', zonalLabelMouseOutHandler);

  shortChart.addEventListener('mouseout', zonalLabelMouseOutHandler);
  shortChart.addEventListener('mouseover', zonalLabelMouseOverHandler);

  switch (activeNav) {
    case 'main-nav-map-searchhubs':
      break;
    case 'main-nav-map-examples':
      break;
    case 'main-nav-map-searchNShubs':
      break;
    case 'main-nav-map': {
      const rem = makeRemoveLabel(name, mapComponent);
      wrapper.insertBefore(rem, wrapper.childNodes[0]);
      break;
    }
    default: {
      const rem = makeRemoveLabel(name, mapComponent);
      wrapper.insertBefore(rem, wrapper.childNodes[0]);
      break;
    }
  }

  const zoom = makeZoom(name, mapComponent);

  const defaultLongGraphs = wrapper.querySelector('.default-long-graphs');
  const nsLongGraphs = wrapper.querySelector('.ns-long-graphs');

  switch (activeNav) {
    case 'main-nav-map-searchhubs':
      wrapper.insertBefore(zoom, wrapper.childNodes[1]);
      defaultLongGraphs.classList.remove('d-none');
      nsLongGraphs.classList.add('d-none');
      break;
    case 'main-nav-map-examples':
      break;
    case 'main-nav-map-searchNShubs':
      wrapper.insertBefore(zoom, wrapper.childNodes[1]);
      defaultLongGraphs.classList.add('d-none');
      nsLongGraphs.classList.remove('d-none');
      break;
    case 'main-nav-map':
      wrapper.insertBefore(zoom, wrapper.childNodes[2]);
      defaultLongGraphs.classList.remove('d-none');
      nsLongGraphs.classList.add('d-none');
      break;
    default:
      wrapper.insertBefore(zoom, wrapper.childNodes[2]);
      defaultLongGraphs.classList.remove('d-none');
      nsLongGraphs.classList.add('d-none');
      break;
  }

  const ovr = makeOverviewLabel();
  const buttonHolder = document.getElementById('zonal-stats-short-title-holder');
  buttonHolder.innerHTML = ovr.innerHTML;
  buttonHolder.classList.remove('d-none');
  disableMainZonalButton();
  return wrapper;
}

// Configures each threat driver bar
// @param wrapper | DOM element
// @param drivers | Array
function drawThreatDrivers(wrapper, drivers) {
  const threatGraph = wrapper.querySelector('.zonal-long-graph-wrapper-threat .zonal-long-graph');
  drivers.forEach(drawDriver.bind(null, threatGraph, '', 'threat'));
}

function findRawValue(wrapper, key) {
  return wrapper.querySelector(`.zonal-long-raw-value-${key}`);
}

function formatToThreePlaces(value) {
  return (Math.round(value * 1000) / 1000).toString();
}

function formatRawValue(value) {
  return checkNoData(value) ? 'No data' : formatToThreePlaces(value);
}

function drawRawValue(wrapper, value) {
  findRawValue(wrapper, value.key).appendChild(makeTextElement(formatRawValue(value.value)));
}

function populateRawTableRow(wrapper, value) {
  drawRawValue(wrapper, value);
}

function drawRawValues(wrapper, data) {
  data.forEach(populateRawTableRow.bind(null, wrapper));
}

function drawName(wrapper, name) {
  wrapper.querySelector('#zonal-long-name').textContent = name;
}

// creates zonal buttons in sticky header.
function drawZonalButtons(HTMLName, name) {
  const buttonHolder = document.getElementById('zonal-stats-button-holder');
  const wrapper = makeDiv();
  wrapper.innerHTML = ZonalButtons;
  drawName(wrapper, name);
  wrapper.querySelector('.zonal-long-button-wrapper').setAttribute('id', `button-name--${HTMLName}`);
  wrapper.querySelector('.zonal-long-buttons-holder').setAttribute('id', `button-holder-name--${HTMLName}`);
  wrapper.querySelector('.zonal-long-button-graphs').setAttribute('id', `graph-name--${HTMLName}`);
  wrapper.querySelector('.zonal-long-button-download').setAttribute('id', `download-name--${HTMLName}`);
  wrapper.querySelector('.zonal-long-button-raw').setAttribute('id', `raw-name--${HTMLName}`);
  wrapper.querySelector('.zonal-long-button-dismiss').setAttribute('id', `dismiss-name--${HTMLName}`);
  wrapper.querySelector('#zonal-long-name').setAttribute('id', `zonal-long-name--${HTMLName}`);

  buttonHolder.innerHTML += wrapper.innerHTML;
}

// make the input graphs invisible for
// nature server data there are no Inputs
function disableInputGraphs(wrapper, selector) {
  const elems = wrapper.querySelectorAll(selector);
  elems.forEach((elem) => {
    if (elem) {
      elem.classList.add('d-none');
    }
  });
}

// make the input graphs visible for
// nature server data there are no Inputs
function enableInputGraphs(wrapper, selector) {
  const elems = wrapper.querySelectorAll(selector);
  elems.forEach((elem) => {
    if (elem) {
      elem.classList.remove('d-none');
    }
  });
}

// Draws and configures the long zonal stats
// @param data | Object - results of API
// @return DOM element
function drawLongZonalStats(data, name) {
  const HTMLName = makeHTMLName(name);
  const wrapper = makeDiv();
  const activeNav = store.getStateItem('activeNav');

  wrapper.classList.add('zonal-long-wrapper');
  wrapper.setAttribute('id', `name-${HTMLName}`);
  buildLongStatsHtml(wrapper);
  drawName(wrapper, name);
  drawZonalButtons(HTMLName, name);

  const defaultdetailGraphs = wrapper.querySelector('.default-detail-graphs');
  const nsdetailGraphs = wrapper.querySelector('.ns-detail-graphs');

  drawRawValues(wrapper, getIndexes(data).concat(getAssetDrivers(data), getThreatDrivers(data)));

  switch (activeNav) {
    case 'main-nav-map-searchhubs':
      selectChartCell(wrapper, 'hub', data.hubs);
      selectChartCell(wrapper, 'asset', data.asset);
      selectChartCell(wrapper, 'threat', data.threat);
      selectChartCell(wrapper, 'exposure-box', data.exposure);
      selectChartCell(wrapper, 'fish', data.aquatic);
      selectChartCell(wrapper, 'wildlife', data.terrestrial);
      drawAssetDrivers(wrapper, getAssetDrivers(data));
      drawThreatDrivers(wrapper, getThreatDrivers(data));
      defaultdetailGraphs.classList.remove('d-none');
      nsdetailGraphs.classList.add('d-none');
      enableInputGraphs(wrapper, '.zonal-input-graph');
      disableInputGraphs(wrapper, '.zonal-long-raw-values tr.ns');
      enableInputGraphs(wrapper, '.zonal-long-raw-values tr.default');
      break;
    case 'main-nav-map-examples':
      selectChartCell(wrapper, 'hub', data.hubs);
      selectChartCell(wrapper, 'asset', data.asset);
      selectChartCell(wrapper, 'threat', data.threat);
      selectChartCell(wrapper, 'exposure-box', data.exposure);
      selectChartCell(wrapper, 'fish', data.aquatic);
      selectChartCell(wrapper, 'wildlife', data.terrestrial);
      drawAssetDrivers(wrapper, getAssetDrivers(data));
      drawThreatDrivers(wrapper, getThreatDrivers(data));
      defaultdetailGraphs.classList.remove('d-none');
      nsdetailGraphs.classList.add('d-none');
      enableInputGraphs(wrapper, '.zonal-input-graph');
      disableInputGraphs(wrapper, '.zonal-long-raw-values tr.ns');
      enableInputGraphs(wrapper, '.zonal-long-raw-values tr.default');
      break;
    case 'main-nav-map-searchNShubs':
      selectChartCell(wrapper, 'ns-hub', data.ns_hubs);
      selectChartCell(wrapper, 'ns-asset', data.ns_asset);
      selectChartCell(wrapper, 'ns-threat', data.ns_threat);
      selectChartCell(wrapper, 'ns-exposure-box', data.ns_exposure);
      selectChartCell(wrapper, 'ns-fishandwildlife', data.ns_fishandwildlife);
      disableInputGraphs(wrapper, '.zonal-input-graph');
      defaultdetailGraphs.classList.add('d-none');
      nsdetailGraphs.classList.remove('d-none');
      enableInputGraphs(wrapper, '.zonal-long-raw-values tr.ns');
      disableInputGraphs(wrapper, '.zonal-long-raw-values tr.default');
      break;
    case 'main-nav-map':
      selectChartCell(wrapper, 'hub', data.hubs);
      selectChartCell(wrapper, 'asset', data.asset);
      selectChartCell(wrapper, 'threat', data.threat);
      selectChartCell(wrapper, 'exposure-box', data.exposure);
      selectChartCell(wrapper, 'fish', data.aquatic);
      selectChartCell(wrapper, 'wildlife', data.terrestrial);
      drawAssetDrivers(wrapper, getAssetDrivers(data));
      drawThreatDrivers(wrapper, getThreatDrivers(data));
      defaultdetailGraphs.classList.remove('d-none');
      nsdetailGraphs.classList.add('d-none');
      disableInputGraphs(wrapper, '.zonal-long-raw-values tr.ns');
      enableInputGraphs(wrapper, '.zonal-long-raw-values tr.default');
      enableInputGraphs(wrapper, '.zonal-input-graph');
      break;
    default:
      selectChartCell(wrapper, 'hub', data.hubs);
      selectChartCell(wrapper, 'asset', data.asset);
      selectChartCell(wrapper, 'threat', data.threat);
      selectChartCell(wrapper, 'exposure-box', data.exposure);
      selectChartCell(wrapper, 'fish', data.aquatic);
      selectChartCell(wrapper, 'wildlife', data.terrestrial);
      drawAssetDrivers(wrapper, getAssetDrivers(data));
      drawThreatDrivers(wrapper, getThreatDrivers(data));
      defaultdetailGraphs.classList.remove('d-none');
      nsdetailGraphs.classList.add('d-none');
      disableInputGraphs(wrapper, '.zonal-long-raw-values tr.ns');
      enableInputGraphs(wrapper, '.zonal-long-raw-values tr.default');
      enableInputGraphs(wrapper, '.zonal-input-graph');
      break;
  }

  return wrapper;
}


// check if graph or table is the active state is so we can disable the
// mouse off event on the shape.  This prevents the map from removeing the
// highlighted shape.
function isGraphActivetate() {
  const graphstate = store.getStateItem('zonalactive');
  if (checkValidObject(graphstate)) {
    const activestate = graphstate[1];
    if (activestate === 'graph' || activestate === 'table') return true;
  }
  return false;
}

function restoreGraphState() {
  const graphstate = store.getStateItem('zonalactive');
  if (checkValidObject(graphstate)) {
    const elemid = graphstate[0];
    const activestate = graphstate[1];
    const elem = document.getElementById(elemid.replace('name-', 'name'));
    const path = document.querySelector(`.path${elemid.replace('name-', '')}`);

    const HTMLName = stripUserArea(elemid);

    switch (activestate) {
      case 'graph':
        displayGraphs(elem);
        if (elem) {
          shapeNavOff();
          elem.classList.add('active');
          document.getElementById('zonal-header').classList.add('d-none');
          togglePermHighLightsOn(path);
          ZonalWrapperActiveRemove();
          enableZonalButtons(HTMLName);
          enableMainZonalButton();
          dissmissAllZonalStatsWrappers();
          zonalStatsWrappersActive(HTMLName);
          store.setStoreItem('zonalactive', [elemid, activestate]);
          disableOverView();
          const hasShapeButtonElem = document.getElementById('hasshape-button-holder');
          hasShapeButtonElem.classList.add('d-none');
        }

        break;
      case 'table':
        if (elem) {
          shapeNavOff();
          elem.classList.add('active');
          elem.classList.add('active-table');
          document.getElementById('zonal-header').classList.add('d-none');
          displayRawValues(elem);
          togglePermHighLightsOn(path);
          ZonalWrapperActiveRemove();
          enableZonalButtons(HTMLName);
          enableMainZonalButton();
          dissmissAllZonalStatsWrappers();
          zonalStatsWrappersActive(HTMLName);
          store.setStoreItem('zonalactive', [elemid, activestate]);
          disableOverView();
          const hasShapeButtonElem = document.getElementById('hasshape-button-holder');
          hasShapeButtonElem.classList.add('d-none');
        }
        break;
      default:
        return null;
    }
  }
  return null;
}

// Draws and configures the entire zonal stats
// @param data | Object - results of API
function drawZonalStatsFromAPI(data, name, mapComponent) {
  const HTMLName = makeHTMLName(name);

  if (!document.getElementById('zonal-header')) {
    document.getElementById('zonal-area-wrapper').innerHTML = ZonalWrapper;
  }
  const wrapper = makeDiv();
  wrapper.classList.add('zonal-stats-wrapper');
  wrapper.classList.add('h-100');

  wrapper.setAttribute('id', `zonal-stats-wrapper-${HTMLName}`);

  wrapper.appendChild(drawShortZonalStats(data, name, mapComponent));
  wrapper.appendChild(drawLongZonalStats(data, name));

  // const child = document.getElementById('full-table-holder').childNodes[0];
  // document.getElementById('full-table-holder').replaceChild(zonalStatTable(), child);
  document.getElementById('zonal-content').appendChild(wrapper);

  // initalize new tooltips
  $(() => {
    $('#zonal-content [data-toggle="tooltip"]').tooltip({ trigger: 'hover focus' });
  });

  const iconelem = document.getElementById('btn-details-icon');
  iconelem.addEventListener('mouseover', zonalLabelMouseOverHandler);
  iconelem.addEventListener('mouseout', zonalLabelMouseOutHandler);
  disableMainZonalButton();

  restoreGraphState();
}

export {
  drawZonalStatsFromAPI,
  restoreGraphState,
  toggleMouseHighLightsOn,
  toggleLabelHighLightsOn,
  toggleMouseHighLightsOff,
  toggleLabelHighLightsOff,
  togglePermHighLightsAllOff,
  makeHTMLName,
  stripUserArea,
  isGraphActivetate,
  viewLongZonalStatsFromShape,
  drawMapInfoStats,
  enableOverView,
  disableOverView,
  enableZonalButtons,
  disableZonalButtons,
  toggleALLPathsOff,
  toggleAllLongZonalsOff,
  getIndexes,
  getAssetDrivers,
  getThreatDrivers
};

// Polyfill for Element.closest for IE9+ and Safari
// https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = (s) => {
    let el = this;

    if (!document.documentElement.contains(el)) {
      return null;
    }

    do {
      if (el.matches(s)) {
        return el;
      }
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);

    return null;
  };
}
