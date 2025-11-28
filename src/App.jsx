import React from "react";
import MapView from "./components/MapView.jsx";
import PaymentModal from "./components/PaymentModal.jsx";
import { useParkingStore } from "./state/useParkingStore.js";

export default function App() {
  const {
    carLength,
    carWidth,
    setCarLength,
    setCarWidth,
    selectedAngle,
    setSelectedAngle,
    showLanes,
    showSlots,
    toggleShowLanes,
    toggleShowSlots,
    resetAll,
    stats,
    exportLayout,
    isComputing,
    paidMode,
    openPayment,
    warning,
    clearWarning
  } = useParkingStore();

  return (
      <div className="app-container">
        <div className="sidebar">
          <div className="sidebar-header">
            <div>
              <p className="badge">ParkingMN – 100% Frontend</p>
              <h2>Parking Layout Optimizer</h2>
              <p className="sidebar-subtitle">
                Та OpenStreetMap дээр талбайгаа зурж, олон улсын стандартад
                ойролцоо автомашины зогсоолын оновчтой зохион байгуулалтыг
                автоматаар тооцоолуулна.
              </p>
            </div>
            <div className={`mode-pill ${paidMode ? "paid" : "free"}`}>
              {paidMode ? "PRO Mode" : "Free Trial"}
            </div>
          </div>

          {warning && (
              <div className="warning-banner" onClick={clearWarning}>
                {warning}
              </div>
          )}

          <div className="panel-section">
            <label>Машины стандарт хэмжээ (метр)</label>
            <div className="inline-fields">
              <label className="input-label">
                Урт
                <input
                    type="number"
                    min="3"
                    step="0.1"
                    value={carLength}
                    onChange={(e) =>
                        setCarLength(parseFloat(e.target.value) || 0)
                    }
                />
              </label>
              <label className="input-label">
                Өргөн
                <input
                    type="number"
                    min="1.8"
                    step="0.1"
                    value={carWidth}
                    onChange={(e) =>
                        setCarWidth(parseFloat(e.target.value) || 0)
                    }
                />
              </label>
            </div>
          </div>

          <div className="panel-section">
            <label>Зогсоолын өнцөг</label>
            <select
                value={selectedAngle}
                onChange={(e) => setSelectedAngle(Number(e.target.value))}
            >
              <option value={90}>90° (перпендикуляр)</option>
              <option value={60}>60°</option>
              <option value={45}>45°</option>
            </select>
          </div>

          <div className="panel-section toggles">
            <label className="toggle-row">
              <input
                  type="checkbox"
                  checked={showSlots}
                  onChange={toggleShowSlots}
              />
              Зогсоолын нүдийг харуулах
            </label>
            <label className="toggle-row">
              <input
                  type="checkbox"
                  checked={showLanes}
                  onChange={toggleShowLanes}
              />
              Замын зурвасууд харуулах
            </label>
          </div>

          <div className="panel-actions">
            <button
                className="secondary-btn"
                onClick={exportLayout}
                type="button"
            >
              JSON татах
            </button>

            {!paidMode && (
                <button
                    className="upgrade-btn"
                    onClick={openPayment}
                    type="button"
                >
                  PRO горим нээх
                </button>
            )}

            <button className="danger-btn" onClick={resetAll} type="button">
              Бүх зургийг цэвэрлэх
            </button>

            {isComputing && (
                <p style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>
                  Тооцоолол хийгдэж байна...
                </p>
            )}
          </div>

          <div className="panel-section stats-summary">
            <h3>Товч статистик</h3>
            <div className="stats-row">
              <span>Талбай:</span>
              <strong>{stats.siteAreaHa.toFixed(2)} га</strong>
            </div>
            <div className="stats-row">
              <span>Зогсоолын тоо:</span>
              <strong>{stats.slotCount}</strong>
            </div>
            <div className="stats-row">
              <span>Нягтрал:</span>
              <strong>{stats.densityPerHa} машин/га</strong>
            </div>
          </div>
        </div>

        <div className="map-container">
          <MapView />
        </div>

        <PaymentModal />
      </div>
  );
}
