import { isEqual as coordinatesAreEqual } from '@conveyal/lonlat'
import fetch from 'isomorphic-fetch'
import lineString from 'turf-linestring'

// Todo: fix error: blank page while adding stops if snap to streets checked.
//* Exported to EditShapePanel.js
export async function polyline (points, individualLegs = false, avoidMotorways = false) {
  // console.info("points, individualLegs, avoidMotorways:", points, individualLegs, avoidMotorways);

  try {
    if (points) {
      //* The main function
      const valhallaGeometry = []
      const valhallaData = await getValhallaData(points, individualLegs, avoidMotorways)
      await valhallaGeometry.push(...valhallaData)
      // console.info("valhallaGeometry:", valhallaGeometry);
      return valhallaGeometry
    }
  } catch (error) {
    console.info('error_1:', error)
    return null
  }
}

//* Used in: stropStrategies.js and map.js
export async function getSegment (points, followRoad, defaultToStraightLine = true, avoidMotorways = false) {
  // console.info("points:", points);
  try {
    const objectPoints = await points.map((elem) => {
      // console.info("elem:", elem);
      return { lng: elem[0], lat: elem[1] }
    })
    // console.info("objectPoints:", objectPoints);

    let geometry
    if (followRoad && objectPoints && objectPoints.length) {
      const encodedResults = await fetchValhallaData(objectPoints, avoidMotorways)
      // console.info("encodedResults:", encodedResults);

      const decodedChunkedData = await encodedResults.shapes.map((shape) => decodeValhallaPolyline(shape, 6))
      // console.info("decodedChunkedData:", decodedChunkedData);

      const decodedDataConverted = await decodedChunkedData.map((data) => convertLatLon(data))
      // console.info("decodedDataConverted:", decodedDataConverted);

      const coordinates = await decodedDataConverted.flat(1)
      // console.info("coordinates:", coordinates);

      if (!coordinates) {
        console.warn(`Routing unsuccessful. Returning ${defaultToStraightLine ? 'straight line' : 'null'}.`)
        if (defaultToStraightLine) {
          geometry = lineString(points).geometry
        } else {
          return null
        }
      } else {
        const c0 = coordinates[0]
        const epsilon = 1e-6
        if (!coordinatesAreEqual(c0, points[0], epsilon)) {
          coordinates.unshift(points[0])
        }
        geometry = {
          type: 'LineString',
          coordinates
        }
      }
    } else {
      geometry = lineString(points).geometry
    }
    // console.info("geometry:", geometry);
    return geometry
  } catch (error) {
    console.info('error_2:', error)
  }
}

//* 0. Base function
const getValhallaData = async (points, individualLegs, avoidMotorways) => {
  const pointLimit = +process.env.VALHALLA_POINT_LIMIT
  // console.info({ pointLimit });

  try {
    const chunkedPoints = await chunkArrayWithOverlap(points, pointLimit)
    // console.info("chunkedPoints:", chunkedPoints);

    const fetchPromises = await chunkedPoints.map((chunk) => {
      //* Fetch data, params: chunkedPoints, avoidMotorways
      return fetchValhallaData(chunk, avoidMotorways)
    })
    // console.info("fetchPromises:", fetchPromises);

    const encodedResults = await Promise.all(fetchPromises)
    // console.info("encodedResults:", encodedResults);

    const decodedChunkedData = await encodedResults
      .map((elem) => elem.shapes)
      .flat(1)
      .map((shape) => decodeValhallaPolyline(shape, 6))
    // console.info("decodedChunkedData:", decodedChunkedData);

    const decodedDataConverted = await decodedChunkedData.map((data) => convertLatLon(data))
    // console.info("decodedDataConverted:", decodedDataConverted);

    // Todo: What is individualLegs for?
    const dataToReturn = individualLegs ? decodedDataConverted : decodedDataConverted
    // console.info({ dataToReturn });
    return dataToReturn
  } catch (error) {
    console.info('error_3:', error)
    alert(`Error:, ${error.toString()}`)
  }
}

//* 1. Fetch Valhalla data
const fetchValhallaData = async (points, avoidMotorways) => {
  // console.info("points:", points);

  const baseUrl = process.env.VALHALLA_URL

  if (points.length < 2) {
    console.warn('need at least two points to route with graphhopper', points)
    return null
  }
  if (!baseUrl) {
    throw new Error('VALHALLA_URL not set')
  }

  const preparedPoints = await preparePoints(points)
  // console.info("preparedPoints:", preparedPoints);
  // console.info({ avoidMotorways });

  const dataToFetch = {
    locations: preparedPoints,
    costing_options: {
      auto: {
        avoid_motorways: avoidMotorways
      }
    },
    costing: 'bus',
    units: 'kilometers'
  }

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json'
      },
      body: JSON.stringify(dataToFetch)
    })

    if (!response.ok) {
      // throw new Error(`HTTP error! status: ${response.status}`);
      console.info(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    // console.info("data:", data);

    const {
      trip: { legs }
    } = data

    const shapes = await legs.map((leg) => leg.shape)
    // console.info({ shapes });
    return { shapes }
  } catch (error) {
    console.info('Error_4:', error)
    alert(`Error:, ${error.toString()}`)
    return null
  }
}

//* 2. Decode Valhalla Polyline string: https://valhalla.github.io/valhalla/decoding/#javascript
const decodeValhallaPolyline = (encoded, precision = 6) => {
  const factor = Math.pow(10, precision)
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates = []

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte

    // Decode latitude
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const latitudeChange = result & 1 ? ~(result >> 1) : result >> 1
    lat += latitudeChange

    result = 0
    shift = 0

    // Decode longitude
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    const longitudeChange = result & 1 ? ~(result >> 1) : result >> 1
    lng += longitudeChange

    // Store the decoded coordinates
    coordinates.push([lat / factor, lng / factor])
  }

  return coordinates
}

//* 3. Conversion [lat, lon] -> [lon, lat] and Vice Versa
const convertLatLon = (points) => {
  const changedPoints = points.map((point) => [point[1], point[0]])
  return changedPoints
}

//* 4. Helper function - divide into overlapping chunks
const chunkArrayWithOverlap = (array, chunkSize) => {
  const result = []
  for (let i = 0; i < array.length; i += chunkSize - 1) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result.filter((elem) => elem.length >= 2)
}

//* 5 - Helper function prepare point data
const preparePoints = (points) => {
  const reversedPoints = points.map((point) => {
    return { lat: point.lat, lon: point.lng }
  })
  return reversedPoints
}
