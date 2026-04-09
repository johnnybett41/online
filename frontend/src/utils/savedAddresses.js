const STORAGE_PREFIX = 'electrohub_saved_addresses_v1:';
const MAX_ADDRESSES = 5;

const getKey = (userId) => `${STORAGE_PREFIX}${userId}`;

export const loadSavedAddresses = (userId) => {
  if (!userId) {
    return [];
  }

  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to load saved addresses:', error);
    return [];
  }
};

export const saveAddressBookEntry = (userId, entry) => {
  if (!userId || !entry) {
    return [];
  }

  try {
    const current = loadSavedAddresses(userId).filter((saved) => {
      return !(
        saved.delivery_address === entry.delivery_address &&
        saved.delivery_county === entry.delivery_county &&
        saved.delivery_town === entry.delivery_town &&
        saved.delivery_postal_code === entry.delivery_postal_code
      );
    });

    const next = [
      {
        ...entry,
        savedAt: Date.now(),
      },
      ...current,
    ].slice(0, MAX_ADDRESSES);

    localStorage.setItem(getKey(userId), JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Unable to save address book entry:', error);
    return loadSavedAddresses(userId);
  }
};

