const FAVORITES_KEY = 'prompt-favorites';
const COUNTS_KEY = 'prompt-counts';

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

export function isFavorite(id) {
  return getFavorites().has(id);
}

export function toggleFavorite(id) {
  const favs = getFavorites();
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
  return favs.has(id);
}

export function getCounts() {
  try {
    const raw = localStorage.getItem(COUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getCount(id) {
  return getCounts()[id] || 0;
}

export function incrementCount(id) {
  const counts = getCounts();
  counts[id] = (counts[id] || 0) + 1;
  localStorage.setItem(COUNTS_KEY, JSON.stringify(counts));
  return counts[id];
}
