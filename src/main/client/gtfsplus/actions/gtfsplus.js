import JSZip from 'jszip'

import { secureFetch } from '../../common/util/util'
import { fetchFeedVersions } from '../../manager/actions/feeds'

export function addGtfsPlusRow (tableId) {
  const table = DT_CONFIG.modules.gtfsplus.spec.find(t => t.id === tableId)

  let rowData = {}
  for(const field of table.fields) {
    rowData[field.name] = null
  }

  return {
    type: 'ADD_GTFSPLUS_ROW',
    tableId,
    rowData
  }
}

export function updateGtfsPlusField (tableId, rowIndex, fieldName, newValue) {
  return {
    type: 'UPDATE_GTFSPLUS_FIELD',
    tableId,
    rowIndex,
    fieldName,
    newValue
  }
}

export function deleteGtfsPlusRow (tableId, rowIndex) {
  return {
    type: 'DELETE_GTFSPLUS_ROW',
    tableId,
    rowIndex
  }
}


export function requestingGtfsPlusContent () {
  return {
    type: 'REQUESTING_GTFSPLUS_CONTENT',
  }
}

export function clearGtfsPlusContent () {
  return {
    type: 'CLEAR_GTFSPLUS_CONTENT',
  }
}

export function receiveGtfsPlusContent (feedVersionId, filenames, fileContent, timestamp) {
  return {
    type: 'RECEIVE_GTFSPLUS_CONTENT',
    feedVersionId,
    filenames,
    fileContent,
    timestamp
  }
}

export function downloadGtfsPlusFeed (feedVersionId) {
  return function (dispatch, getState) {
    dispatch(requestingGtfsPlusContent())

    const fetchFeed = fetch('/api/manager/secure/gtfsplus/'+  feedVersionId, {
      method: 'get',
      cache: 'default',
      headers: { 'Authorization': 'Bearer ' + getState().user.token }
    }).then((response) => {
      if(response.status !== 200) {
        console.log('error downloading gtfs+ feed', response.statusCode)
        dispatch(clearGtfsPlusContent())
      }
      return response.blob()
    })

    const fetchTimestamp = secureFetch(`/api/manager/secure/gtfsplus/${feedVersionId}/timestamp`, getState())
    .then(response => response.json())

    Promise.all([fetchFeed, fetchTimestamp]).then(([feed, timestamp]) => {
      JSZip.loadAsync(feed).then((zip) => {
        let filenames = []
        let filePromises = []
        zip.forEach((path,file) => {
          filenames.push(path)
          filePromises.push(file.async('string'))
        })
        Promise.all(filePromises).then(fileContent => {
          dispatch(receiveGtfsPlusContent(feedVersionId, filenames, fileContent, timestamp))
        })
      })
    })
  }
}

export function uploadingGtfsPlusFeed () {
  return {
    type: 'UPLOADING_GTFSPLUS_FEED',
  }
}

export function uploadedGtfsPlusFeed () {
  return {
    type: 'UPLOADED_GTFSPLUS_FEED',
  }
}

export function uploadGtfsPlusFeed (feedVersionId, file) {
  return function (dispatch, getState) {
    dispatch(uploadingGtfsPlusFeed())
    const url = `/api/manager/secure/gtfsplus/${feedVersionId}`
    var data = new FormData()
    data.append('file', file)

    return fetch(url, {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + getState().user.token },
      body: data
    }).then(result => {
      dispatch(uploadedGtfsPlusFeed())
    })
  }
}

export function receiveGtfsEntities (gtfsEntities) {
  return {
    type: 'RECEIVE_GTFS_ENTITIES',
    gtfsEntities
  }
}

export function loadGtfsEntities (tableId, rows, feedSource) {

  return function (dispatch, getState) {

    // lookup table for mapping tableId:fieldName keys to inputType values
    const typeLookup = {}
    const getDataType = function(tableId, fieldName) {
      const lookupKey = tableId + ':' + fieldName
      if(lookupKey in typeLookup) return typeLookup[lookupKey]
      const fieldInfo = DT_CONFIG.modules.gtfsplus.spec
        .find(t => t.id === tableId).fields.find(f => f.name === fieldName)
      if(!fieldInfo) return null
      typeLookup[lookupKey] = fieldInfo.inputType
      return fieldInfo.inputType
    }

    // determine which routes, stops, etc. aren't currently in the gtfsEntityLookup table and need to be loaded from the API
    const routesToLoad = []
    const stopsToLoad = []

    const currentLookup = getState().gtfsplus.gtfsEntityLookup

    for(const rowData of rows) {
      for(const fieldName in rowData) {
        switch(getDataType(tableId, fieldName)) {
          case 'GTFS_ROUTE':
            const routeId = rowData[fieldName]
            if(routeId && !(`route_${routeId}` in currentLookup)) routesToLoad.push(routeId)
            break;
          case 'GTFS_STOP':
            const stopId = rowData[fieldName]
            if(stopId && !(`stop_${stopId}` in currentLookup)) stopsToLoad.push(stopId)
            break;
        }
      }
    }

    if(routesToLoad.length === 0 && stopsToLoad.length === 0) return

    var loadRoutes = Promise.all(routesToLoad.map(routeId => {
      const url = `/api/manager/routes/${routeId}?feed=${feedSource.externalProperties.MTC.AgencyId}`
      return fetch(url)
      .then((response) => {
        return response.json()
      })
    }))

    var loadStops = Promise.all(stopsToLoad.map(stopId => {
      const url = `/api/manager/stops/${stopId}?feed=${feedSource.externalProperties.MTC.AgencyId}`
      return fetch(url)
      .then((response) => {
        return response.json()
      })
    }))

    Promise.all([loadRoutes, loadStops]).then(results => {
      const loadedRoutes = results[0]
      const loadedStops = results[1]
      dispatch(receiveGtfsEntities(loadedRoutes.concat(loadedStops)))
    })
  }
}

export function publishingGtfsPlusFeed () {
  return {
    type: 'PUBLISHING_GTFSPLUS_FEED',
  }
}

export function publishGtfsPlusFeed (feedVersion) {
  return function (dispatch, getState) {
    dispatch(publishingGtfsPlusFeed())
    const url = `/api/manager/secure/gtfsplus/${feedVersion.id}/publish`
    return secureFetch(url, getState(), 'post')
      .then((res) => {
        console.log('published done');
        return dispatch(fetchFeedVersions(feedVersion.feedSource))
      })
  }
}
