export function filterPrompts(prompts, { searchTerm = '', category = 'all' } = {}) {
  const term = searchTerm.trim().toLowerCase();
  return prompts.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (!term) return true;
    return (
      p.title.toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (p.tags || []).some(t => t.toLowerCase().includes(term)) ||
      (p.model || '').toLowerCase().includes(term)
    );
  });
}

export function sortPrompts(prompts, favorites) {
  return [...prompts].sort((a, b) => {
    const aFav = favorites.has(a.id);
    const bFav = favorites.has(b.id);
    if (aFav !== bFav) return aFav ? -1 : 1;
    return 0;
  });
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
