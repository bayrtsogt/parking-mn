import { create } from "zustand";
import { computeLayout } from "../engine/optimization.js";
import { polygonAreaHectares } from "../engine/geometry.js";

export const useParkingStore = create((set, get) => ({
  boundary: null,
  slots: null,
  lanes: null,
  entrances: null,

  selectedAngle: 45,
  paidMode: false,
  isComputing: false,

  stats: {
    siteAreaHa: 0,
    slotCount: 0,
    densityPerHa: 0
  },

  setSelectedAngle: (v) => set({ selectedAngle: v }),
  setPaidMode: (v) => set({ paidMode: v }),

  setBoundary: (geo) => {
    const areaHa = polygonAreaHectares(geo);

    set({
      boundary: geo,
      slots: null,
      lanes: null,
      entrances: null,
      stats: { siteAreaHa: areaHa, slotCount: 0, densityPerHa: 0 }
    });
  },

  optimizeLayout: () => {
    const { boundary, selectedAngle } = get();

    if (!boundary) return alert("Талбай зураагүй байна.");

    set({ isComputing: true });

    try {
      const car = { length: 4.8, width: 2.4 };
      const layout = computeLayout(boundary, car, selectedAngle);

      const slotCount = layout.slots.features.length;
      const ha = get().stats.siteAreaHa;

      set({
        slots: layout.slots,
        lanes: layout.lanes,
        entrances: layout.entrances,
        stats: {
          siteAreaHa: ha,
          slotCount,
          densityPerHa: ha ? +(slotCount / ha).toFixed(1) : 0
        }
      });
    } finally {
      set({ isComputing: false });
    }
  }
}));
