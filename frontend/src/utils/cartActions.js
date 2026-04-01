import axios from 'axios';
import {
  createPendingCartItem,
  loadCartCache,
  removeCartItemFromCache,
  saveCartCache,
  updateCartItemInCache,
  upsertCartItemInCache,
} from './cartCache';
import {
  queuePendingCartAdd,
  queueServerCartRemove,
  queueServerCartUpdate,
  removePendingCartAdd,
  syncPendingCartAdd,
} from './cartQueue';

const isNetworkProblem = (error) => !error?.response;

export const addCartItem = async ({
  userId,
  product,
  quantity = 1,
  allowNetwork = true,
}) => {
  const onlineAllowed = allowNetwork && navigator.onLine;
  const payload = {
    user_id: userId,
    product_id: product.id,
    quantity,
  };

  if (onlineAllowed) {
    try {
      await axios.post('/cart', payload);
      return { queued: false, pending: false, cart: loadCartCache(userId) };
    } catch (error) {
      if (!isNetworkProblem(error)) {
        throw error;
      }
    }
  }

  const clientId = `pending-${product.id}-${Date.now()}`;
  const pendingItem = createPendingCartItem(product, quantity, clientId);
  const current = upsertCartItemInCache(userId, pendingItem);
  queuePendingCartAdd(userId, {
    type: 'add',
    clientId,
    payload,
  });

  return { queued: true, pending: true, cart: current };
};

export const updateCartItem = async ({
  userId,
  item,
  quantity,
  allowNetwork = true,
}) => {
  const nextQuantity = Math.max(1, quantity);
  const onlineAllowed = allowNetwork && navigator.onLine;

  if (item.pendingSync) {
    updateCartItemInCache(userId, item.clientId || item.id, {
      quantity: nextQuantity,
      pendingSync: true,
    });
    syncPendingCartAdd(userId, item.clientId || item.id, nextQuantity);
    return { queued: true, pending: true, cart: loadCartCache(userId) };
  }

  if (onlineAllowed) {
    try {
      await axios.put(`/cart/${item.id}`, { quantity: nextQuantity });
      updateCartItemInCache(userId, item.id, { quantity: nextQuantity });
      return { queued: false, pending: false, cart: loadCartCache(userId) };
    } catch (error) {
      if (!isNetworkProblem(error)) {
        throw error;
      }
    }
  }

  updateCartItemInCache(userId, item.id, { quantity: nextQuantity });
  queueServerCartUpdate(userId, {
    type: 'update',
    itemId: item.id,
    quantity: nextQuantity,
  });
  return { queued: true, pending: false, cart: loadCartCache(userId) };
};

export const removeCartItem = async ({
  userId,
  item,
  allowNetwork = true,
}) => {
  const onlineAllowed = allowNetwork && navigator.onLine;

  if (item.pendingSync) {
    removeCartItemFromCache(userId, item.clientId || item.id);
    removePendingCartAdd(userId, item.clientId || item.id);
    return { queued: true, pending: true, cart: loadCartCache(userId) };
  }

  if (onlineAllowed) {
    try {
      await axios.delete(`/cart/${item.id}`);
      removeCartItemFromCache(userId, item.id);
      return { queued: false, pending: false, cart: loadCartCache(userId) };
    } catch (error) {
      if (!isNetworkProblem(error)) {
        throw error;
      }
    }
  }

  removeCartItemFromCache(userId, item.id);
  queueServerCartRemove(userId, {
    type: 'remove',
    itemId: item.id,
  });
  return { queued: true, pending: false, cart: loadCartCache(userId) };
};

export const refreshCachedCart = (userId, items) => {
  saveCartCache(userId, items);
  return items;
};
