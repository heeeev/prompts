export function filterPrompts(prompts, { searchTerm = '', category = 'all' } = {}) {
  const term = searchTerm.trim().toLowerCase();
  return prompts.filter(p => {
    if (category !== 'all' && p.category !== category) return false;
    if (!term) return true;
    return (
      p.title.toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term) ||
      (p.tags || []).some(t => t.toLowerCase().includes(term))
    );
  });
}

export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
