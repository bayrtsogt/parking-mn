import React from "react";
import { useParkingStore } from "../state/useParkingStore.js";

export default function DrawToolbar() {
    const {
        boundary,
        optimizeLayout,
        entranceMode,
        toggleEntranceMode,
        entrancePoints
    } = useParkingStore();

    return (
        <div className="map-top-toolbar">
            <button
                className={entranceMode ? "active" : ""}
                onClick={toggleEntranceMode}
                type="button"
            >
                Орох / гарах цэг тавих
                {entrancePoints.length > 0 && ` (${entrancePoints.length}/2)`}
            </button>

            <button
                disabled={!boundary}
                className="primary-btn"
                style={{ padding: "6px 14px" }}
                onClick={optimizeLayout}
                type="button"
            >
                Зогсоол тооцоолох
            </button>
        </div>
    );
}
