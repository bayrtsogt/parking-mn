import React, { useEffect, useMemo, useRef } from 'react';
import { FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import bboxPolygon from '@turf/bbox-polygon';
import booleanWithin from '@turf/boolean-within';
import { useParkingStore } from '../state/useParkingStore.js';
import { UVURKHANGAI_BBOX, ensureWithinBounds } from '../utils/geometry.js';

const DrawToolbar = () => {
  const featureGroupRef = useRef(null);
  const map = useMap();
  const {
    unlocked,
    setPolygon,
    setWarning,
    clearWarning,
    parkingPolygon,
    resetLayout
  } = useParkingStore();

  const bbox = useMemo(() => bboxPolygon(UVURKHANGAI_BBOX), []);

  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  const enforceBounds = (geojson) => {
    if (!unlocked) {
      const inside = booleanWithin(geojson, bbox);
      if (!inside) {
        setWarning('Drawing must stay inside the Arvaikheer sandbox.');
        return false;
      }
    }
    clearWarning();
    return true;
  };

  const handleCreated = (e) => {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    if (!enforceBounds(geojson)) {
      featureGroupRef.current?.removeLayer(layer);
      return;
    }
    resetLayout();
    setPolygon(geojson);
  };

  const handleEdited = (e) => {
    const { layers } = e;
    layers.eachLayer((layer) => {
      const geojson = layer.toGeoJSON();
      if (enforceBounds(geojson)) {
        resetLayout();
        setPolygon(geojson);
      }
    });
  };

  const handleDeleted = () => {
    resetLayout();
    setPolygon(null);
  };

  useEffect(() => {
    if (!unlocked && parkingPolygon) {
      const clamped = ensureWithinBounds(parkingPolygon, UVURKHANGAI_BBOX);
      if (clamped) {
        setPolygon(clamped);
      }
    }
  }, [parkingPolygon, setPolygon, unlocked]);

  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        position="topleft"
        onCreated={handleCreated}
        onEdited={handleEdited}
        onDeleted={handleDeleted}
        draw={{
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
          polyline: false,
          polygon: { allowIntersection: false, showArea: true }
        }}
      />
    </FeatureGroup>
  );
};

export default DrawToolbar;
