// src/components/PaymentModal.jsx
import React from "react";
import { useParkingStore } from "../state/useParkingStore.js";

export default function PaymentModal() {
  // Хэрэв дараа нь төлбөртэй горимын popup нэмж хөгжүүлэх бол эндээс үргэлжилнэ.
  // Одоохондоо UI дээр зөвхөн sidebar-н "Бүрэн газрын зураг нээх" товч paidMode-г true болгодог.
  const { paidMode } = useParkingStore();

  if (paidMode) {
    return null;
  }

  return null;
}
