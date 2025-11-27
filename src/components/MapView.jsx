// src/components/MapView.jsx
import React, { useEffect, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    LayersControl
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// LEAFLET DRAW IMPORT — ҮНДСЭН ШААРДЛАГА
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

import { useParkingStore } from "../state/useParkingStore.js";
import DrawToolbar from "./DrawToolbar.jsx";
import { UVURKHANGAI_BBOX } from "../engine/geometry.js";

const { BaseLayer } = LayersControl;

// Marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

export default function MapView() {
    const mapRef = useRef(null);
    const { boundary, slots, lanes, entrances, setBoundary } = useParkingStore();

    // ------------------------------
    //   DRAW CONTROL ИДЭВХЖҮҮЛЭХ
    // ------------------------------
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        // Drawn layers
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Draw control
        const drawControl = new L.Control.Draw({
            draw: {
                polygon: {
                    allowIntersection: true,
                    shapeOptions: {
                        color: "#2563eb",
                        weight: 2
                    },
                    showArea: true
                },
                polyline: false,
                rectangle: false,
                circle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems
            }
        });

        map.addControl(drawControl);

        // Draw event listener
        map.on("draw:created", (event) => {
            drawnItems.clearLayers();
            drawnItems.addLayer(event.layer);

            const geojson = event.layer.toGeoJSON();
            setBoundary(geojson);

            map.fitBounds(event.layer.getBounds(), { padding: [40, 40] });
        });
    }, []);

    return (
        <div className="map-wrapper">
            <MapContainer
                whenCreated={(map) => (mapRef.current = map)}
                center={[46.255, 102.77]}
                zoom={16}
                style={{ height: "100vh", width: "100%" }}
            >
                <LayersControl position="topright">
                    <BaseLayer checked name="OSM">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </BaseLayer>
                    <BaseLayer name="Сансрын зураг">
                        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                    </BaseLayer>
                </LayersControl>

                <DrawToolbar />

                {boundary && (
                    <GeoJSON data={boundary} style={{ color: "#2563eb", weight: 2 }} />
                )}

                {slots && (
                    <GeoJSON
                        data={slots}
                        style={{ color: "#22c55e", fillOpacity: 0.5, weight: 1 }}
                    />
                )}

                {lanes && (
                    <GeoJSON
                        data={lanes}
                        style={{ color: "#6b7280", dashArray: "4 4", weight: 1 }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
