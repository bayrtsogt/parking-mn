// Web Worker – parking layout computation
import { computeLayout } from "../utils/optimization.js";

self.onmessage = (e) => {
  const { polygon, carSize, angle } = e.data || {};
  try {
    const layout = computeLayout(polygon, carSize, angle);
    self.postMessage({ success: true, layout });
  } catch (err) {
    self.postMessage({
      success: false,
      error: err?.message || String(err)
    });
  }
};
