import { computeLayout } from '../utils/optimization.js';

self.onmessage = (event) => {
  const { polygon, carSize, angle } = event.data;
  try {
    const layout = computeLayout(polygon, carSize, angle);
    self.postMessage({ success: true, layout });
  } catch (err) {
    self.postMessage({ success: false, error: err.message });
  }
};
