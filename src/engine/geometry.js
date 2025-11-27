import bboxPolygon from '@turf/bbox-polygon';
import transformRotate from '@turf/transform-rotate';
import turfArea from '@turf/area';
import turfCentroid from '@turf/centroid';
import intersect from '@turf/intersect';
import { polygon as turfPolygon } from '@turf/helpers';

// 5km x 5km bounding box centered on Arvaikheer, Mongolia.
// [minLon, minLat, maxLon, maxLat]
export const UVURKHANGAI_BBOX = [102.7435, 46.2405, 102.8085, 46.2855];

// Build Arvaikheer 5×5km polygon
export const buildUvurkhangaiPolygon = () => bboxPolygon(UVURKHANGAI_BBOX);

// Compute polygon area in hectares
export const polygonAreaHectares = (polygon) => {
  return Math.round((turfArea(polygon) / 10000) * 10) / 10;
};

// Rotate polygon geometry around its centroid
export const rotateGeometry = (geojson, angle) =>
    transformRotate(geojson, angle, { pivot: turfCentroid(geojson) });

// Restrict polygon to bounding box (FREE MODE)
export const ensureWithinBounds = (polygon, bboxArray) => {
  const bbox = bboxPolygon(bboxArray);
  const poly = turfPolygon(
      polygon.geometry ? polygon.geometry.coordinates : polygon.coordinates
  );

  try {
    const clipped = intersect(poly, bbox);
    return clipped || polygon;
  } catch (e) {
    return polygon;
  }
};
