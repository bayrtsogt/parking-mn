import React from "react";
import { useParkingStore } from "../state/useParkingStore.js";

export default function PaymentModal() {
  const { paymentOpen, closePayment, setPaidMode } = useParkingStore();

  if (!paymentOpen) return null;

  const activatePro = () => {
    setPaidMode(true);
    closePayment();
    localStorage.setItem("parking_pro_unlocked", "true");
  };

  return (
      <div className="modal-backdrop">
        <div className="modal">
          <h3>ParkingMN PRO горим</h3>
          <p>
            Энэ демо хувилбар backend шаардлагагүй, зөвхөн таньд талбайгаа
            зураглаж хамгийн их багтаамжтай зогсоолын зохион байгуулалтыг
            туршиж үзэх зориулалттай. PRO горимыг идэвхжүүлснээр хүссэн
            байршил дээрээ ашиглах боломжтой.
          </p>
          <div className="modal-actions">
            <button className="secondary-btn" onClick={closePayment}>
              Болих
            </button>
            <button className="primary-btn" onClick={activatePro}>
              PRO горим идэвхжүүлэх
            </button>
          </div>
        </div>
      </div>
  );
}
