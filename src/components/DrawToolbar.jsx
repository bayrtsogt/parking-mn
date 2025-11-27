import React from "react";
import { useParkingStore } from "../state/useParkingStore.js";

export default function DrawToolbar() {
    const { optimizeLayout, boundary, isComputing } = useParkingStore();

    const zoomIn = () => {
        const map = window.__parkingMap;
        map && map.setZoom(map.getZoom() + 1);
    };

    const zoomOut = () => {
        const map = window.__parkingMap;
        map && map.setZoom(map.getZoom() - 1);
    };

    const fit = () => {
        const map = window.__parkingMap;
        if (map && boundary) {
            const g = L.geoJSON(boundary);
            map.fitBounds(g.getBounds(), { padding: [40, 40] });
        }
    };

    return (
        <div className="draw-toolbar">
            <button onClick={zoomIn}>＋</button>
            <button onClick={zoomOut}>－</button>
            <button onClick={fit} disabled={!boundary}>
                Тааруулах
            </button>
            <button onClick={optimizeLayout} disabled={!boundary || isComputing}>
                {isComputing ? "Тооцоо…" : "Зогсоол тооцоолох"}
            </button>
        </div>
    );
}
