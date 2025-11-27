import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, GeoJSON } from 'react-leaflet';
import { useParkingStore } from '../state/useParkingStore.js';
import { UVURKHANGAI_BBOX } from '../utils/geometry.js';
import DrawToolbar from './DrawToolbar.jsx';

const MapView = () => {
  const { parkingPolygon, slots, lanes, showLanes, showSlots, warning, unlocked } = useParkingStore();
  const bboxShape = useMemo(
    () => [
      [UVURKHANGAI_BBOX[1], UVURKHANGAI_BBOX[0]],
      [UVURKHANGAI_BBOX[3], UVURKHANGAI_BBOX[2]]
    ],
    []
  );

  return (
    <div className="map-wrapper">
      {warning && <div className="notice">{warning}</div>}
      <MapContainer center={[46.263, 102.776]} zoom={15} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!unlocked && <Rectangle bounds={bboxShape} pathOptions={{ color: '#f97316', weight: 2 }} />}
        {parkingPolygon && <GeoJSON data={parkingPolygon} pathOptions={{ color: '#2563eb', weight: 2 }} />}
        {showLanes && lanes && <GeoJSON data={lanes} pathOptions={{ color: '#0ea5e9', weight: 3 }} />}
        {showSlots && slots && <GeoJSON data={slots} pathOptions={{ color: '#22c55e', weight: 1, fillOpacity: 0.5 }} />}
        <DrawToolbar />
      </MapContainer>
    </div>
  );
};

export default MapView;
