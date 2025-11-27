import { create } from 'zustand';

const worker = new Worker(new URL('../workers/parkingWorker.js', import.meta.url), { type: 'module' });

export const useParkingStore = create((set, get) => ({
  carLength: 5,
  carWidth: 2.5,
  angle: 90,
  parkingPolygon: null,
  slots: null,
  lanes: null,
  entrances: null,
  warning: '',
  showSlots: true,
  showLanes: true,
  unlocked: Boolean(localStorage.getItem('unlocked')),
  optimizing: false,

  setCarLength: (val) => set({ carLength: val || 4.8 }),
  setCarWidth: (val) => set({ carWidth: val || 2.4 }),
  setAngle: (val) => set({ angle: val }),
  setPolygon: (polygon) => set({ parkingPolygon: polygon }),
  setWarning: (warning) => set({ warning }),
  clearWarning: () => set({ warning: '' }),
  toggleSlots: () => set((state) => ({ showSlots: !state.showSlots })),
  toggleLanes: () => set((state) => ({ showLanes: !state.showLanes })),
  unlock: () => {
    localStorage.setItem('unlocked', 'true');
    set({ unlocked: true, warning: '' });
  },
  resetLayout: () => set({ slots: null, lanes: null, entrances: null }),

  triggerOptimization: () => {
    const state = get();
    if (!state.parkingPolygon) {
      set({ warning: 'Draw a parking polygon first.' });
      return;
    }
    set({ optimizing: true, warning: '' });
    worker.postMessage({
      polygon: state.parkingPolygon,
      carSize: { length: state.carLength, width: state.carWidth },
      angle: state.angle
    });
  }
}));

worker.onmessage = (event) => {
  const { success, layout, error } = event.data;
  const { setState } = useParkingStore;
  if (success) {
    setState({ slots: layout.slots, lanes: layout.lanes, entrances: layout.entrances, optimizing: false });
  } else {
    setState({ warning: error || 'Failed to optimize layout', optimizing: false });
  }
};
