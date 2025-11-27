import bboxPolygon from '@turf/bbox-polygon';
import transformRotate from '@turf/transform-rotate';
import { polygon as turfPolygon, area as turfArea, centroid as turfCentroid } from '@turf/helpers';
import { GeoJSONReader, GeoJSONWriter } from 'jsts/org/locationtech/jts/io';
import { BufferParameters, OffsetCurveBuilder } from 'jsts/org/locationtech/jts/operation/buffer';

// 5km x 5km bounding box centered on Arvaikheer, Mongolia.
// [minX, minY, maxX, maxY] => [minLon, minLat, maxLon, maxLat]
export const UVURKHANGAI_BBOX = [102.7435, 46.2405, 102.8085, 46.2855];

export const buildUvurkhangaiPolygon = () => bboxPolygon(UVURKHANGAI_BBOX);

export const polygonAreaHectares = (polygon) => Math.round((turfArea(polygon) / 10000) * 10) / 10;

export const rotateGeometry = (geojson, angle) => transformRotate(geojson, angle, {
  pivot: turfCentroid(geojson)
});

export const jstsFromGeoJSON = (geojson) => {
  const reader = new GeoJSONReader();
  return reader.read(geojson);
};

export const geoJSONFromJsts = (geom) => {
  const writer = new GeoJSONWriter();
  return writer.write(geom);
};

// Clamp a polygon into the bounding box to ensure free-mode enforcement.
export const ensureWithinBounds = (polygon, bboxArray) => {
  const bbox = bboxPolygon(bboxArray);
  const poly = turfPolygon(polygon.geometry ? polygon.geometry.coordinates : polygon.coordinates);
  if (bbox && poly) {
    const reader = new GeoJSONReader();
    const writer = new GeoJSONWriter();
    const jstsPoly = reader.read(poly);
    const jstsBox = reader.read(bbox);
    const intersection = jstsPoly.intersection(jstsBox);
    if (intersection && !intersection.isEmpty()) {
      return writer.write(intersection);
    }
  }
  return polygon;
};

// Build a buffered polygon (negative for inset) using JSTS for cleaner rings.
export const bufferedPolygon = (polygon, distanceMeters) => {
  const geom = jstsFromGeoJSON(polygon);
  const params = new BufferParameters();
  params.setJoinStyle(BufferParameters.JOIN_ROUND);
  const buffered = geom.buffer(distanceMeters / 111000, params);
  return geoJSONFromJsts(buffered);
};

// Offset a linestring safely using JSTS to avoid self-intersections.
export const offsetLine = (lineGeojson, distanceMeters) => {
  const geom = jstsFromGeoJSON(lineGeojson);
  const curveBuilder = new OffsetCurveBuilder(null);
  curveBuilder.setQuadrantSegments(8);
  const offsetCurve = curveBuilder.getOffsetCurve(geom.getCoordinates(), distanceMeters / 111000);
  return offsetCurve ? geoJSONFromJsts(geom.getFactory().createLineString(offsetCurve)) : null;
};
