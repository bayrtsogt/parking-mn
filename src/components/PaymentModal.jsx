import React, { useState } from 'react';
import { useParkingStore } from '../state/useParkingStore.js';

const PaymentModal = ({ onClose }) => {
  const { unlock } = useParkingStore();
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      unlock();
      setProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Unlock full drawing</h2>
        <p>One-time unlock for global drawing access. This is a sandboxed, client-side payment simulation.</p>
        <button onClick={handlePay} disabled={processing}>
          {processing ? 'Processing…' : 'Pay & Unlock'}
        </button>
        <button className="outline" style={{ marginTop: 8 }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
