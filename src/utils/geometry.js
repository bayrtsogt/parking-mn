import area from "@turf/area";
import bboxPolygon from "@turf/bbox-polygon";
import booleanWithin from "@turf/boolean-within";

/**
 * Талбайг га нэгжээр буцаана.
 */
export function polygonAreaHectares(geo) {
  if (!geo) return 0;
  try {
    return area(geo) / 10000;
  } catch {
    return 0;
  }
}

/**
 * Арвайхээр орчим 5×5 км хайрцаг (үнэгүй горимд хэрэглэж болно).
 */
export function buildUvurkhangaiPolygon() {
  const centerLat = 46.26;
  const centerLng = 102.78;

  const halfSizeMeters = 2500; // 2.5 км
  const dLat = (halfSizeMeters / 111320) * 2; // нийт 5км
  const dLng =
      (halfSizeMeters / (111320 * Math.cos((centerLat * Math.PI) / 180))) * 2;

  const bbox = [
    centerLng - dLng / 2,
    centerLat - dLat / 2,
    centerLng + dLng / 2,
    centerLat + dLat / 2
  ];

  return bboxPolygon(bbox);
}

/**
 * Гео объектоос Арвайхээр хайрцаг дотор байгаа эсэх.
 */
export function isWithinUvurkhangai(feature) {
  try {
    const box = buildUvurkhangaiPolygon();
    return booleanWithin(feature, box);
  } catch {
    return true;
  }
}
