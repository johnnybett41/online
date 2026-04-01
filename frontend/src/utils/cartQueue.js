import axios from 'axios';
import { loadCartCache, saveCartCache } from './cartCache';

const CART_QUEUE_PREFIX = 'electrohub_cart_queue_v1';

const getQueueKey = (userId) => `${CART_QUEUE_PREFIX}_${userId}`;

const loadQueue = (userId) => {
  try {
    const raw = localStorage.getItem(getQueueKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const saveQueue = (userId, queue) => {
  try {
    localStorage.setItem(getQueueKey(userId), JSON.stringify(queue));
  } catch (error) {
    console.warn('Unable to save cart queue:', error);
  }
};

const isPendingAdd = (action) => action?.type === 'add' && action?.clientId;

const upsertQueueAction = (userId, action, predicate) => {
  const queue = loadQueue(userId);
  const index = queue.findIndex(predicate);
  const next = index === -1 ? [...queue, action] : queue.map((item, currentIndex) => (currentIndex === index ? action : item));
  saveQueue(userId, next);
  return next;
};

export const queuePendingCartAdd = (userId, action) => {
  return upsertQueueAction(userId, action, (item) => isPendingAdd(item) && item.clientId === action.clientId);
};

export const syncPendingCartAdd = (userId, clientId, quantity) => {
  const queue = loadQueue(userId);
  const next = queue
    .map((action) => {
      if (isPendingAdd(action) && action.clientId === clientId) {
        return {
          ...action,
          payload: {
            ...action.payload,
            quantity,
          },
        };
      }

      return action;
    })
    .filter(Boolean);

  saveQueue(userId, next);
  return next;
};

export const removePendingCartAdd = (userId, clientId) => {
  const queue = loadQueue(userId).filter((action) => !(isPendingAdd(action) && action.clientId === clientId));
  saveQueue(userId, queue);
  return queue;
};

export const queueServerCartUpdate = (userId, action) => {
  const queue = loadQueue(userId);
  const index = queue.findIndex((item) => item.type === 'update' && item.itemId === action.itemId);
  const next = index === -1 ? [...queue, action] : queue.map((item, currentIndex) => (currentIndex === index ? action : item));
  saveQueue(userId, next);
  return next;
};

export const queueServerCartRemove = (userId, action) => {
  const queue = loadQueue(userId);
  const index = queue.findIndex((item) => item.type === 'remove' && item.itemId === action.itemId);
  const next = index === -1 ? [...queue, action] : queue.map((item, currentIndex) => (currentIndex === index ? action : item));
  saveQueue(userId, next);
  return next;
};

export const flushQueuedCartActions = async (userId) => {
  const queue = loadQueue(userId);
  if (!queue.length || !navigator.onLine) {
    return { flushed: 0, remaining: queue.length };
  }

  const remaining = [];
  let flushed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const action = queue[index];

    try {
      if (action.type === 'add') {
        await axios.post('/cart', action.payload);
      } else if (action.type === 'update') {
        await axios.put(`/cart/${action.itemId}`, { quantity: action.quantity });
      } else if (action.type === 'remove') {
        await axios.delete(`/cart/${action.itemId}`);
      }
      flushed += 1;
    } catch (error) {
      remaining.push(...queue.slice(index));
      break;
    }
  }

  saveQueue(userId, remaining);
  return { flushed, remaining: remaining.length };
};

export const getQueuedCartActions = (userId) => loadQueue(userId);
