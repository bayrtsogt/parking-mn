// src/App.jsx
import React from "react";
import MapView from "./components/MapView.jsx";
import "./styles.css";
import { useParkingStore } from "./state/useParkingStore.js";
import PaymentModal from "./components/PaymentModal.jsx";

export default function App() {
  const {
    optimizeLayout,
    resetAll,
    paidMode,
    setPaidMode,
    selectedAngle,
    setSelectedAngle,
    exportLayout,
    stats
  } = useParkingStore();

  return (
      <div className="app-container">
        <div className="sidebar">
          <h2>ParkingMn PRO</h2>
          <p className="sidebar-subtitle">
            Зогсоолын талбай дээр зурж, олон улсын стандартын дагуу
            зогсоолын зохион байгуулалтыг автоматаар тооцоолно.
          </p>

          {!paidMode && (
              <div className="free-warning">
                <strong>Үнэгүй горим:</strong> Арвайхээр хотын 5×5 км радиуст талбай
                зурж тест хийж болно. Бүрэн газрын зураг ашиглах бол доорх
                “Бүрэн нээх” товчийг дарна уу.
              </div>
          )}

          <div className="panel-section">
            <label>Машины стандарт хэмжээ</label>
            <div className="inline-fields">
              <span>Урт: 4.8 м</span>
              <span>Өргөн: 2.4 м</span>
            </div>
          </div>

          <div className="panel-section">
            <label>Машины байрлалын өнцөг</label>
            <select
                value={selectedAngle}
                onChange={(e) => setSelectedAngle(Number(e.target.value))}
            >
              <option value={0}>0° (шулуун)</option>
              <option value={30}>30°</option>
              <option value={45}>45°</option>
              <option value={60}>60°</option>
            </select>
          </div>

          <div className="panel-section">
            <button className="primary-btn" onClick={optimizeLayout}>
              Зогсоолын зохион байгуулалт гаргах
            </button>
          </div>

          <div className="panel-section">
            <button className="primary-btn" onClick={exportLayout}>
              Талбай, зогсоолын өгөгдөл татаж авах (JSON)
            </button>
          </div>

          {!paidMode && (
              <div className="panel-section">
                <button className="upgrade-btn" onClick={() => setPaidMode(true)}>
                  Бүрэн газрын зураг нээх (PRO mode)
                </button>
              </div>
          )}

          <div className="panel-section">
            <button className="danger-btn" onClick={resetAll}>
              Дахин эхлэх / Цэвэрлэх
            </button>
          </div>

          <div className="panel-section stats-summary">
            <h3>Товч статистик</h3>
            <div className="stats-row">
              <span>Талбай:</span>
              <strong>{stats.siteAreaHa.toFixed(1)} га</strong>
            </div>
            <div className="stats-row">
              <span>Зогсоолын тоо:</span>
              <strong>{stats.slotCount}</strong>
            </div>
            <div className="stats-row">
              <span>Нягтрал:</span>
              <strong>{stats.densityPerHa} машин / га</strong>
            </div>
          </div>
        </div>

        <MapView />
        <PaymentModal />
      </div>
  );
}
