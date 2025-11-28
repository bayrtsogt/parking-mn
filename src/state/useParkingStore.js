import { create } from "zustand";
import { polygonAreaHectares } from "../utils/geometry.js";

let workerInstance = null;

function getWorker() {
  if (!workerInstance) {
    workerInstance = new Worker(
        new URL("../workers/parkingWorker.js", import.meta.url),
        { type: "module" }
    );
  }
  return workerInstance;
}

export const useParkingStore = create((set, get) => ({
  boundary: null,          // Drawn polygon
  slots: null,             // FeatureCollection<Polygon>
  lanes: null,             // FeatureCollection<Polygon>
  showSlots: true,
  showLanes: true,

  // entrance/exit points – хэрэглэгч өөрөө тавина
  entrancePoints: [],      // [{lat,lng}, {lat,lng}]
  entranceMode: false,     // map дээр entrance тэмдэглэж байгаа эсэх

  carLength: 5,
  carWidth: 2.5,
  selectedAngle: 90,

  paidMode: true,          // одоо туршилтаар PRO байлгая
  unlocked: true,

  isComputing: false,
  computationMessage: null,
  paymentOpen: false,
  warning: null,

  stats: { siteAreaHa: 0, slotCount: 0, densityPerHa: 0 },

  // --- basic setters ---
  setBoundary: (geo) => {
    const ha = polygonAreaHectares(geo);
    set({
      boundary: geo,
      slots: null,
      lanes: null,
      stats: { siteAreaHa: ha, slotCount: 0, densityPerHa: 0 }
    });
  },

  setCarLength: (v) => set({ carLength: v }),
  setCarWidth: (v) => set({ carWidth: v }),
  setSelectedAngle: (a) => set({ selectedAngle: a }),

  toggleShowSlots: () => set((s) => ({ showSlots: !s.showSlots })),
  toggleShowLanes: () => set((s) => ({ showLanes: !s.showLanes })),

  setPaidMode: (v) => set({ paidMode: v, unlocked: v }),

  openPayment: () => set({ paymentOpen: true }),
  closePayment: () => set({ paymentOpen: false }),

  setWarning: (msg) => set({ warning: msg }),
  clearWarning: () => set({ warning: null }),

  // --- entrance / exit points ---
  toggleEntranceMode: () =>
      set((s) => ({ entranceMode: !s.entranceMode })),

  addEntrancePoint: (latlng) =>
      set((s) => {
        const next = [...s.entrancePoints];
        if (next.length >= 2) next.shift(); // хамгийн сүүлийн 2-ыг хадгална
        next.push(latlng);
        return { entrancePoints: next };
      }),

  clearEntrances: () => set({ entrancePoints: [] }),

  resetAll: () =>
      set({
        boundary: null,
        slots: null,
        lanes: null,
        entrancePoints: [],
        stats: { siteAreaHa: 0, slotCount: 0, densityPerHa: 0 }
      }),

  // --- export JSON (boundary + slots + lanes + entrances) ---
  exportLayout: () => {
    const { boundary, slots, lanes, entrancePoints } = get();
    if (!boundary) {
      alert("Талбай зурагдаагүй байна.");
      return;
    }

    const entrances =
        entrancePoints.length === 0
            ? null
            : {
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

    const payload = { boundary, slots, lanes, entrances };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parking-layout.json";
    a.click();
    URL.revokeObjectURL(url);
  },

  // --- core optimization ---
  optimizeLayout: () => {
    const { boundary, carLength, carWidth, selectedAngle } = get();
    if (!boundary) {
      alert("Эхлээд талбай зурна уу.");
      return;
    }

    set({
      isComputing: true,
      computationMessage: "Тооцоолол хийгдэж байна...",
      slots: null,
      lanes: null
    });

    const worker = getWorker();
    worker.postMessage({
      polygon: boundary,
      carSize: { length: carLength, width: carWidth },
      angle: selectedAngle
    });

    const handler = (e) => {
      const { success, layout, error } = e.data;

      if (!success || !layout) {
        alert(error || "Тооцоолол амжилтгүй.");
        set({
          isComputing: false,
          computationMessage: "Алдаа гарлаа."
        });
        worker.removeEventListener("message", handler);
        return;
      }

      const slotCount = layout.slots.features.length;
      const ha = get().stats.siteAreaHa;

      set({
        slots: layout.slots,
        lanes: layout.lanes,
        isComputing: false,
        computationMessage: "Тооцоолол амжилттай.",
        stats: {
          siteAreaHa: ha,
          slotCount,
          densityPerHa: ha ? +(slotCount / ha).toFixed(1) : 0
        }
      });

      worker.removeEventListener("message", handler);
    };

    worker.addEventListener("message", handler);
  }
}));
