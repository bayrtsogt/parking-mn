import React, { useMemo, useState } from 'react';
import MapView from './components/MapView.jsx';
import PaymentModal from './components/PaymentModal.jsx';
import { useParkingStore } from './state/useParkingStore.js';

const App = () => {
  const {
    carLength,
    carWidth,
    setCarLength,
    setCarWidth,
    angle,
    setAngle,
    triggerOptimization,
    unlocked,
    toggleLanes,
    toggleSlots,
    showLanes,
    showSlots,
    resetLayout
  } = useParkingStore();

  const [showPayment, setShowPayment] = useState(false);
  const angleOptions = useMemo(() => [90, 60, 45], []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Parking Layout Optimizer</h1>
        {!unlocked && (
          <div className="notice">
            Free mode: draw only within the Arvaikheer 5km × 5km sandbox. Unlock to draw anywhere.
          </div>
        )}
        <div className="panel-section">
          <label htmlFor="carLength">Car length (m)</label>
          <input
            id="carLength"
            type="number"
            min="3"
            step="0.1"
            value={carLength}
            onChange={(e) => setCarLength(parseFloat(e.target.value))}
          />
        </div>
        <div className="panel-section">
          <label htmlFor="carWidth">Car width (m)</label>
          <input
            id="carWidth"
            type="number"
            min="1"
            step="0.05"
            value={carWidth}
            onChange={(e) => setCarWidth(parseFloat(e.target.value))}
          />
        </div>
        <div className="panel-section">
          <label htmlFor="angle">Parking angle</label>
          <select id="angle" value={angle} onChange={(e) => setAngle(parseInt(e.target.value, 10))}>
            {angleOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}°
              </option>
            ))}
          </select>
        </div>
        <div className="panel-section">
          <button onClick={triggerOptimization}>Optimize layout</button>
        </div>
        <div className="panel-section">
          <div className="toggle-row">
            <button className="outline" onClick={toggleLanes}>
              {showLanes ? 'Hide lanes' : 'Show lanes'}
            </button>
            <button className="outline" onClick={toggleSlots}>
              {showSlots ? 'Hide slots' : 'Show slots'}
            </button>
          </div>
        </div>
        <div className="panel-section">
          <button className="secondary" onClick={() => setShowPayment(true)}>
            Unlock full map (fake payment)
          </button>
        </div>
        <div className="panel-section">
          <button className="outline" onClick={resetLayout}>Reset layout</button>
        </div>
      </aside>
      <main>
        <MapView />
      </main>
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
    </div>
  );
};

export default App;
