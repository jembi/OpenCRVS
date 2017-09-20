/*
 * @Author: Euan Millar 
 * @Date: 2017-07-05 01:19:24 
 * @Last Modified by: Euan Millar
 * @Last Modified time: 2017-09-05 15:39:48
 */
export const REQUEST_MAPVIEW_DATA = 'REQUEST_MAPVIEW_DATA';
export const MAPVIEW_DATA_SUCCESS = 'MAPVIEW_DATA_SUCCESS';
export const MAPVIEW_MAPDATA_SUCCESS = 'MAPVIEW_MAPDATA_SUCCESS';
export const REGION_SELECTED = 'REGION_SELECTED';
export const COUNTRY_SELECTED = 'COUNTRY_SELECTED';
export const EVENT_SELECTED = 'EVENT_SELECTED';
export const PERIOD_SELECTED = 'PERIOD_SELECTED';
export const UPDATE_ORIGIN = 'UPDATE_ORIGIN';
export const SET_TOOLTIP_MAP_DATA = 'SET_TOOLTIP_MAP_DATA';
export const REMOVE_TOOLTIP_MAP_DATA = 'REMOVE_TOOLTIP_MAP_DATA';
export const SET_REGION_MANAGER = 'SET_REGION_MANAGER';
export const SET_DISTRICT_MANAGER = 'SET_DISTRICT_MANAGER';
export const SET_LIST_FILTER = 'SET_LIST_FILTER';
export const SET_LIST_ORDER = 'SET_LIST_ORDER';
export const CASE_TRACKING = 'CASE_TRACKING';
export const CASE_TRACKING_CLEAR = 'CASE_TRACKING_CLEAR';



import { apiMiddleware } from 'utils/api-middleware';
import { BASE_URL } from 'constants/urls';
import { feature } from 'topojson-client';
import { filter, head, map, get } from 'lodash';
const Moment = require('moment');

export function fetchMapViewData() {
  
  return dispatch => {
    dispatch(requestMapViewData());
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };
    
    apiMiddleware(config, BASE_URL + 'manager', dispatch).then(items => {
      dispatch(mapViewDataSuccess(items));
      dispatch(getMapData());
    });
  };
}

export function getMapData() {
  
  return (dispatch, getState) => {
    const {country, regions } = getState().globalReducer;
    const config = {
      method: 'GET',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    };
    apiMiddleware(config, BASE_URL + 'maps/' + country, null).then(response => {
      const countryMapData = feature(response, response.objects.country).features;
      const subPromises = [];
      subPromises.push();
      regions.forEach((region) => {
        subPromises.push(apiMiddleware(config, BASE_URL + 'maps/' + country + '/' + region, null));
      });
      const regionMapData = [];
      Promise.all(subPromises).then(regionMaps => {
        regionMaps.forEach((regionMap) => {
          regionMapData.push(feature(regionMap, regionMap.objects.region).features);
        });
        dispatch(setMapViewMapData(countryMapData, regionMapData, ));
      });
    });
    
  };
}

function setMapViewMapData(countryMapData, regionMapData) {
  return {
    type: MAPVIEW_MAPDATA_SUCCESS,
    countryMapData,
    regionMapData,
  };
}

function mapViewDataSuccess(mapLocations) {
  const selectedLocation = mapLocations.country;
  const subLocations = mapLocations.country.subEntries.entries;
  const countryManager = mapLocations.country.staff.manager;
  const totalCerts = updateTotalCerts(mapLocations.country, 'birth', 'This year');
  return {
    type: MAPVIEW_DATA_SUCCESS,
    mapLocations,
    selectedLocation,
    subLocations,
    totalCerts,
    countryManager,
  };
}

function requestMapViewData() {
  return {
    type: REQUEST_MAPVIEW_DATA,
  };
}

function setRegionManager(regionManager) {
  return {
    type: SET_REGION_MANAGER,
    regionManager,
  };
}

function setDistrictManager(districtManager) {
  return {
    type: SET_DISTRICT_MANAGER,
    districtManager,
  };
}

export function disableTooltip() {
  return {
    type: REMOVE_TOOLTIP_MAP_DATA,
  };
}


export function selectListFilter(listFilter) {
  return {
    type: SET_LIST_FILTER,
    listFilter,
  };
}


export function selectListOrder(listOrder) {
  return {
    type: SET_LIST_ORDER,
    listOrder,
  };
}

export function setTooltipData(name) {
  // get data by name
  return (dispatch, getState) => {
    const { mapEvent, 
      subLocations, 
      mapTimePeriod, 
      countryLevel, 
      regionLevel, 
      selectedRegion } = getState().managerReducer;
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const tooltipObj = {
      title: title,
      certs: null,
      kpi: null,
    };
    let regionManager = null;
    let districtManager = null;
    if (countryLevel) {
      let regions = {};
      regions = head(filter(get(head(filter(subLocations, { title: title })), 'events'), { type: mapEvent }));
      tooltipObj.certs = get(head(filter(regions.timePeriod, { title: mapTimePeriod })), 'certifications');
      tooltipObj.kpi = get(head(filter(regions.timePeriod, { title: mapTimePeriod })), 'certificationsKpi');
      regionManager = get(head(filter(subLocations, { title: title })), 'staff.manager');
    }
    if (regionLevel) {
      const districtsUnfiltered = get(head(filter(subLocations, { title: selectedRegion })), 'subEntries').entries;
      let districts = {};
      districts = head(filter(get(head(filter(districtsUnfiltered, {title: title })), 'events'), { type: mapEvent }));
      tooltipObj.certs = get(head(filter(districts.timePeriod, { title: mapTimePeriod })), 'certifications');
      tooltipObj.kpi = get(head(filter(districts.timePeriod, { title: mapTimePeriod })), 'certificationsKpi');
      regionManager = get(head(filter(subLocations, { title: selectedRegion })), 'staff.manager');
      districtManager = head(filter(districtsUnfiltered, {title: title })).staff.manager;
    }
    dispatch(tooltipDataReady(tooltipObj));
    dispatch(setDistrictManager(districtManager));
    dispatch(setRegionManager(regionManager));
  };
}

function updateTotalCerts(data, mapEvent, mapTimePeriod) {
  let certs = 0;
  let obj = head(filter(head(filter(data.events, {type: mapEvent})).timePeriod, {title: mapTimePeriod}));
  certs = obj.certifications;
  return certs;
}

function tooltipDataReady(rolloverMapData) {
  return {
    type: SET_TOOLTIP_MAP_DATA,
    rolloverMapData,
  };
}

export function selectCountry() {
  return (dispatch, getState) => {
    const { mapLocations, 
      mapEvent, 
      mapTimePeriod } = getState().managerReducer;
    let obj = {};
    obj = mapLocations.country;
    let certs = updateTotalCerts(obj, mapEvent, mapTimePeriod);
    dispatch(setCountry(certs));
    dispatch(setDistrictManager(null));
    dispatch(setRegionManager(null));
  };
}

function setCountry(totalCerts) {
  return {
    type: COUNTRY_SELECTED,
    totalCerts,
  };
}

export function selectPeriod(period) {
  return (dispatch, getState) => {
    const { mapLocations, 
      mapEvent, 
      selectedRegion,
      countryLevel,
      regionLevel } = getState().managerReducer;
    let obj = {};
    if (countryLevel) {
      obj = mapLocations.country;
    }
    if (regionLevel) {
      obj = head(filter(mapLocations.country.subEntries.entries, {title: selectedRegion}));
    }

    let certs = updateTotalCerts(obj, mapEvent, period);
    dispatch(setPeriod(period, certs));
  };
}

function setPeriod(period, totalCerts) {
  return {
    type: PERIOD_SELECTED,
    mapTimePeriod: period,
    totalCerts,
  };
}


export function selectEvent(event) {
  return (dispatch, getState) => {
    const { mapLocations, 
      mapTimePeriod, 
      selectedRegion,
      countryLevel,
      regionLevel } = getState().managerReducer;
    let obj = {};
    if (countryLevel) {
      obj = mapLocations.country;
    }
    if (regionLevel) {
      obj = head(filter(mapLocations.country.subEntries.entries, {title: selectedRegion}));
    }

    let certs = updateTotalCerts(obj, event, mapTimePeriod);
    dispatch(setEvent(event, certs));
  };
}

function setEvent(event, totalCerts) {
  return {
    type: EVENT_SELECTED,
    mapEvent: event,
    totalCerts,
  };
}

export function caseTracking() {
  return {
    type: CASE_TRACKING,
    caseData: {
      firstName: 'Bashirah',
      middleName: 'Awo',
      family: 'Nkrumah',
      personalIDNummber: 'GH99856325',
      phone: '024 965 1365',
      addressLine1: 'P.O. Box 7986',
      addressLine2: '',
      addressLine3: '',
      county: 'Hohoe',
      state: 'Volta',
    },
    caseManager: {
      given: 'Cameron',
      family: 'Addo',
      title: 'District Operations Manager',
      email: 'c-addo@acme.com',
      phone: '555-165-111',
      avatar: 'male',
    },
    caseNotes: [
      {title: 'NOTIFICATION', notes: [
        {note: 'Power cut in the office.', date: Moment().subtract(29, 'days').format('Do MMM')},
      ]},
      {title: 'DECLARATION', notes: [
        {note: 'Power cut in the office', date: Moment().subtract(23, 'days').format('Do MMM')},
        {note: 'No ID document supplied.', date: Moment().subtract(20, 'days').format('Do MMM')},
      ]},
      {title: 'VALIDATION', notes: [
      ]},
      {title: 'SMS', notes: [
      ]},
      {title: 'PAYMENT', notes: [
        {note: 'MTN Mobile money payment', date: Moment().subtract(11, 'days').format('Do MMM')},
      ]},
      {title: 'CERTIFICATION', notes: [
      ]},
    ],
    caseGraphData: [
      {name: Moment().subtract(30, 'days').format('Do MMM'), kpi: 0, actual: 0, amt: 2400},
      {name: Moment().subtract(23, 'days').format('Do MMM'), kpi: 5, actual: 7, amt: 2210},
      {name: Moment().subtract(17, 'days').format('Do MMM'), kpi: 3, actual: 6, amt: 2290},
      {name: Moment().subtract(14, 'days').format('Do MMM'), kpi: 3, actual: 3, amt: 2000},
      {name: Moment().subtract(13, 'days').format('Do MMM'), kpi: 1, actual: 1, amt: 2181},
      {name: Moment().subtract(11, 'days').format('Do MMM'), kpi: 7, actual: 2, amt: 2500},
      {name: Moment().subtract(8, 'days').format('Do MMM'), kpi: 2, actual: 3, amt: 2100},
    ],
  };

}

export function caseTrackingClear() {
  return {
    type: CASE_TRACKING_CLEAR
  };
}

export function selectRegion(name) {
  return (dispatch, getState) => {
    const { mapLocations, regionMapData, mapEvent, mapTimePeriod } = getState().managerReducer;
    const title = name.charAt(0).toUpperCase() + name.slice(1);
    const obj = head(filter(mapLocations.country.subEntries.entries, {title: title}));
    let newMap;
    map(regionMapData, (mapData, index ) => {
      if (get(head(mapData), 'properties.NAME_1') == title) {
        newMap = mapData;
      }
    });
    let certs = updateTotalCerts(obj, mapEvent, mapTimePeriod);
    dispatch(regionSelected(obj, title, newMap, certs));
  };
}

function regionSelected(obj, title, newMap, totalCerts) {
  return {
    type: REGION_SELECTED,
    selectedLocation: obj,
    selectedRegion: title,
    selectedLocationMapData: newMap,
    totalCerts,
  };
}