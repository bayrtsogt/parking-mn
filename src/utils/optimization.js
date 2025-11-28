// ---------------------------------------------------------------------
// AUTO-CAD LEVEL PARKING LAYOUT ENGINE
// Full polygon clipping, scanline slicing, stable geometry ops
// ---------------------------------------------------------------------

import {
  polygon as turfPolygon,
  lineString,
  featureCollection,
  point
} from "@turf/helpers";

import centroid from "@turf/centroid";
import transformRotate from "@turf/transform-rotate";
import lineIntersect from "@turf/line-intersect";
import lineSliceAlong from "@turf/line-slice-along";
import lineOffset from "@turf/line-offset";
import buffer from "@turf/buffer";
import intersect from "@turf/intersect";
import area from "@turf/area";
import distance from "@turf/distance";

// High-stability safe intersect
function safeIntersect(a, b) {
  try {
    if (!a || !b) return null;
    if (!a.geometry || !b.geometry) return null;
    return intersect(a, b);
  } catch {
    return null;
  }
}

export function computeLayout(polygonGeoJSON, carSize, angleDeg) {
  const poly = turfPolygon(
      polygonGeoJSON.geometry.coordinates,
      polygonGeoJSON.properties || {}
  );

  const center = centroid(poly);

  // parking params
  const angle = angleDeg || 90;
  const slotW = (carSize.width || 2.5) + 0.2;
  const slotD = (carSize.length || 5.0) + 0.6;
  const laneW = 6;

  // rotate boundary (AutoCAD style normalization)
  const rot = -angle + 90;
  const rotated = transformRotate(poly, rot, { pivot: center });

  // extract bounds
  const ring = rotated.geometry.coordinates[0];
  const xs = ring.map(p => p[0]);
  const ys = ring.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // 1m = 1/100000 degrees
  const M = 1 / 100000;

  // scanline step – AutoCAD style
  const rowStep = laneW + slotD * 2;

  const slots = [];
  const lanes = [];

  // vertical slicing → AutoCAD algorithm
  for (let x = minX - 300*M; x <= maxX + 300*M; x += rowStep * M) {
    const scan = lineString([[x, minY - 1], [x, maxY + 1]]);
    const ints = lineIntersect(scan, rotated);

    if (ints.features.length < 2) continue;

    // sorted intersections
    const pts = ints.features
        .map(f => f.geometry.coordinates)
        .sort((a, b) => a[1] - b[1]);

    for (let i = 0; i < pts.length - 1; i += 2) {
      const A = pts[i];
      const B = pts[i + 1];

      // lane center line
      const seg = lineString([A, B]);

      // lane polygon
      const lanePoly = buffer(seg, laneW / 2, { units: "meters" });
      const clippedLane = safeIntersect(rotated, lanePoly);
      if (clippedLane && area(clippedLane) > 1)
        lanes.push(clippedLane);

      // slot count
      const len = distance(point(A), point(B), { units: "kilometers" }) * 1000;
      const count = Math.floor(len / slotW);

      for (let s = 0; s < count; s++) {
        const d1 = s * slotW;
        const d2 = d1 + slotW;

        const piece = lineSliceAlong(seg, d1, d2, { units: "meters" });

        // left + right side
        [slotD, -slotD].forEach(d => {
          const outline = lineOffset(piece, d*M, { units: "degrees" });
          const raw = buffer(outline, slotD / 2, { units: "meters" });

          const clipped = safeIntersect(rotated, raw);

          if (clipped && area(clipped) > 1.0) {
            slots.push(clipped);
          }
        });
      }
    }
  }

  // rotate back
  const finalSlots = slots.map(s =>
      transformRotate(s, -rot, { pivot: center })
  );
  const finalLanes = lanes.map(s =>
      transformRotate(s, -rot, { pivot: center })
  );

  return {
    slots: featureCollection(finalSlots),
    lanes: featureCollection(finalLanes)
  };
}
