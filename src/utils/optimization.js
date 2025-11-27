import { polygon as turfPolygon, lineString, featureCollection, point } from '@turf/helpers';
import buffer from '@turf/buffer';
import lineOffset from '@turf/line-offset';
import lineIntersect from '@turf/line-intersect';
import lineSliceAlong from '@turf/line-slice-along';
import transformRotate from '@turf/transform-rotate';
import centroid from '@turf/centroid';
import distance from '@turf/distance';
import area from '@turf/area';

const metersToDegrees = (meters) => meters / 111000;

const buildBaseAxis = (polygonGeoJSON, angle) => {
  const center = centroid(polygonGeoJSON);
  const bbox = polygonGeoJSON.bbox || [
    Math.min(...polygonGeoJSON.geometry.coordinates[0].map((c) => c[0])),
    Math.min(...polygonGeoJSON.geometry.coordinates[0].map((c) => c[1])),
    Math.max(...polygonGeoJSON.geometry.coordinates[0].map((c) => c[0])),
    Math.max(...polygonGeoJSON.geometry.coordinates[0].map((c) => c[1]))
  ];

  const midX = (bbox[0] + bbox[2]) / 2;
  const line = lineString([
    [midX, bbox[1]],
    [midX, bbox[3]]
  ]);
  return transformRotate(line, angle, { pivot: center });
};

const createEntrances = (polygonGeoJSON) => {
  const ring = polygonGeoJSON.geometry.coordinates[0];
  const center = centroid(polygonGeoJSON).geometry.coordinates;
  const accessPoints = [ring[0], ring[Math.floor(ring.length / 2)]];
  return featureCollection(
    accessPoints.map((coord, idx) =>
      point(coord, { label: idx === 0 ? 'Entrance' : 'Exit' })
    )
  );
};

export const computeLayout = (polygonGeoJSON, carSize, angleDeg) => {
  const angle = parseFloat(angleDeg) || 90;
  const parking = polygonGeoJSON.type === 'Feature' ? polygonGeoJSON : turfPolygon(polygonGeoJSON.geometry.coordinates);
  const laneWidth = 6; // meters
  const slotDepth = carSize.length + 0.5;
  const slotWidth = carSize.width + 0.4;
  const rotation = -angle + 90;

  // Align polygon to simplify grid creation
  const rotatedPoly = transformRotate(parking, rotation, { pivot: centroid(parking) });
  const baseAxis = buildBaseAxis(rotatedPoly, 0);

  const slots = [];
  const lanes = [];

  const bbox = rotatedPoly.bbox || [
    Math.min(...rotatedPoly.geometry.coordinates[0].map((c) => c[0])),
    Math.min(...rotatedPoly.geometry.coordinates[0].map((c) => c[1])),
    Math.max(...rotatedPoly.geometry.coordinates[0].map((c) => c[0])),
    Math.max(...rotatedPoly.geometry.coordinates[0].map((c) => c[1]))
  ];

  const step = metersToDegrees(slotDepth + laneWidth);
  const startX = bbox[0];
  const endX = bbox[2];
  const laneBuffer = laneWidth / 2;

  for (let offset = 0; startX + offset <= endX; offset += step) {
    const axisLine = lineOffset(baseAxis, metersToDegrees(offset), { units: 'degrees' });
    const intersections = lineIntersect(axisLine, rotatedPoly);
    if (!intersections || intersections.features.length < 2) continue;

    const sortedPoints = intersections.features
      .map((f) => f.geometry.coordinates)
      .sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < sortedPoints.length; i += 2) {
      const start = sortedPoints[i];
      const end = sortedPoints[i + 1];
      if (!end) break;
      const segment = lineString([start, end]);
      const segmentLength = distance(point(start), point(end), { units: 'kilometers' }) * 1000;
      if (segmentLength < slotWidth * 2) continue;

      // Driving lane polygon
      const lanePoly = buffer(segment, laneBuffer, { units: 'meters' });
      lanes.push(lanePoly.features ? lanePoly.features[0] : lanePoly);

      // Build slots on both sides of the lane
      const spacing = slotWidth + 0.2;
      const slotCount = Math.floor(segmentLength / spacing);
      for (let s = 0; s < slotCount; s++) {
        const startDistance = s * spacing;
        const endDistance = startDistance + slotWidth;
        const centerSlice = lineSliceAlong(segment, startDistance, endDistance, { units: 'meters' });
        const slot = buffer(centerSlice, slotDepth, { units: 'meters' });
        if (slot) {
          slots.push(slot.features ? slot.features[0] : slot);
        }
      }
    }
  }

  const entrancePoints = createEntrances(parking);

  // Rotate layout back to original orientation
  const rotatedSlots = slots.map((s) => transformRotate(s, -rotation, { pivot: centroid(parking) }));
  const rotatedLanes = lanes.map((l) => transformRotate(l, -rotation, { pivot: centroid(parking) }));

  // Clip to polygon to keep geometry within bounds
  const filteredSlots = rotatedSlots.filter((slot) => area(slot) > 1);

  return {
    slots: featureCollection(filteredSlots),
    lanes: featureCollection(rotatedLanes),
    entrances: entrancePoints
  };
};
