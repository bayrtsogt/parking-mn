import React, { useEffect, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    GeoJSON,
    LayersControl,
    useMap
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

import DrawToolbar from "./DrawToolbar.jsx";
import {
    buildUvurkhangaiPolygon,
    isWithinUvurkhangai
} from "../utils/geometry.js";
import { useParkingStore } from "../state/useParkingStore.js";

const { BaseLayer } = LayersControl;

// Fix default marker icon (Vite + Leaflet bug)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

/**
 * Polygon зурдаг / edit хийдэг manager
 */
function DrawingManager() {
    const map = useMap();
    const { setBoundary, setWarning, clearEntrances } = useParkingStore();

    useEffect(() => {
        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            position: "topleft",
            draw: {
                polygon: {
                    allowIntersection: false,
                    showArea: true,
                    shapeOptions: { color: "#2563eb", weight: 2, fillOpacity: 0.15 }
                },
                rectangle: false,
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false
            },
            edit: {
                featureGroup: drawnItems
            }
        });

        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, (e) => {
            const layer = e.layer;
            const geo = layer.toGeoJSON();

            // Жишээ нь: хүсвэл энд free-zone шалгалт хийж болно
            if (!isWithinUvurkhangai(geo)) {
                setWarning("Жишээ болгон Арвайхээр хайрцаг дотор туршиж үзээрэй.");
            }

            drawnItems.clearLayers();
            drawnItems.addLayer(layer);
            setBoundary(geo);
            clearEntrances(); // шинэ талбайд entrance-уудыг цэвэрлэнэ
            map.fitBounds(layer.getBounds().pad(0.05));
        });

        return () => {
            map.removeLayer(drawnItems);
            map.removeControl(drawControl);
        };
    }, [map, setBoundary, setWarning, clearEntrances]);

    return null;
}

/**
 * Entrance/Exit цэг тавих handler
 */
function EntranceClickHandler() {
    const map = useMap();
    const { entranceMode, addEntrancePoint } = useParkingStore();

    useEffect(() => {
        const handleClick = (e) => {
            if (!entranceMode) return;
            addEntrancePoint(e.latlng);
        };

        map.on("click", handleClick);
        return () => {
            map.off("click", handleClick);
        };
    }, [map, entranceMode, addEntrancePoint]);

    return null;
}

export default function MapView() {
    const bbox = useMemo(() => buildUvurkhangaiPolygon(), []);
    const { slots, lanes, showSlots, showLanes, entrancePoints } =
        useParkingStore();

    const entrancesGeoJSON = useMemo(() => {
        if (!entrancePoints || entrancePoints.length === 0) return null;
        return {
            type: "FeatureCollection",
            features: entrancePoints.map((p, idx) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [p.lng, p.lat]
                },
                properties: {
                    label: idx === 0 ? "Entrance" : "Exit"
                }
            }))
        };
    }, [entrancePoints]);

    return (
        <MapContainer
            center={[46.255, 102.775]}
            zoom={16}
            style={{ height: "100vh", width: "100%" }}
        >
            <LayersControl position="topright">
                <BaseLayer checked name="OpenStreetMap">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </BaseLayer>
                <BaseLayer name="Topo">
                    <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" />
                </BaseLayer>
            </LayersControl>

            {/* free demo area (optional visual) */}
            <GeoJSON
                data={bbox}
                style={{ color: "#f59e0b", weight: 1, fillOpacity: 0.05 }}
            />

            <DrawingManager />
            <EntranceClickHandler />
            <DrawToolbar />

            {showSlots && slots && (
                <GeoJSON
                    data={slots}
                    style={{ color: "#2563eb", weight: 0.5, fillOpacity: 0.7 }}
                />
            )}

            {showLanes && lanes && (
                <GeoJSON
                    data={lanes}
                    style={{
                        color: "#111827",
                        weight: 2,
                        dashArray: "4 6",
                        fillOpacity: 0.1
                    }}
                />
            )}

            {entrancesGeoJSON && (
                <GeoJSON
                    data={entrancesGeoJSON}
                    pointToLayer={(feature, latlng) =>
                        L.circleMarker(latlng, {
                            radius: 6,
                            color:
                                feature.properties.label === "Entrance" ? "#16a34a" : "#ef4444",
                            weight: 2,
                            fillOpacity: 0.9
                        })
                    }
                />
            )}
        </MapContainer>
    );
}
