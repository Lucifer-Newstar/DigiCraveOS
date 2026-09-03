const STORAGE_KEY = "digicrave-offline-orders";

const notifyQueueChanged = () => { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("digicrave:queue-changed")); };

const readQueue = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
};

export const queueOrder = (order) => {
  const queued = { ...order, idempotencyKey: order.idempotencyKey || crypto.randomUUID(), queuedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...readQueue(), queued]));
  notifyQueueChanged();
  return queued;
};

export const getQueuedOrders = () => readQueue();
export const getQueueStats = () => ({ queued: readQueue().length });
export const clearQueuedOrders = () => { localStorage.removeItem(STORAGE_KEY); notifyQueueChanged(); };

export const syncQueuedOrders = async (postOrder) => {
  const queue = readQueue();
  if (!queue.length) return { synced: 0, failed: 0 };
  const remaining = [];
  let synced = 0;
  for (const order of queue) {
    try {
      await postOrder(order);
      synced += 1;
    } catch {
      remaining.push(order);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  notifyQueueChanged();
  return { synced, failed: remaining.length };
};
