import { copyToClipboard } from './clipboard.js';
import { filterPrompts, debounce } from './filter.js';
import { renderCategoryFilters, renderCards, openModal, closeModal } from './render.js';

const state = {
  categories: [],
  prompts: [],
  searchTerm: '',
  category: 'all',
  promptCache: new Map(),
};

async function init() {
  initTheme();
  try {
    await loadData();
  } catch (err) {
    console.error('Failed to load prompts:', err);
    showLoadError();
    return;
  }
  initEvents();
  render();
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || saved === 'light') {
    document.documentElement.dataset.theme = saved;
  }
}

async function loadData() {
  const res = await fetch('data/prompts.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  state.categories = data.categories || [];
  state.prompts = data.prompts || [];
}

async function getPromptText(prompt) {
  if (state.promptCache.has(prompt.id)) {
    return state.promptCache.get(prompt.id);
  }
  let text = '';
  if (prompt.promptFile) {
    const res = await fetch(prompt.promptFile, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } else if (prompt.prompt) {
    text = prompt.prompt;
  }
  state.promptCache.set(prompt.id, text);
  return text;
}

function showLoadError() {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '<p style="grid-column: 1/-1; padding: 80px 20px; text-align: center; color: var(--color-text-muted);">프롬프트를 불러오지 못했어요. 새로고침해주세요.</p>';
}

function initEvents() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', debounce((e) => {
    state.searchTerm = e.target.value;
    writeHash();
    render();
  }, 150));

  document.querySelector('.theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme;
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = current === 'dark' || (!current && systemDark);
    const next = isDark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });

  document.getElementById('prompt-modal').addEventListener('click', (e) => {
    if (e.target.dataset.close !== undefined) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById('modal-copy').addEventListener('click', async () => {
    const text = document.getElementById('modal-prompt').textContent;
    const btn = document.getElementById('modal-copy');
    const ok = await copyToClipboard(text);
    if (ok) {
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 1500);
    }
  });

  window.addEventListener('hashchange', () => {
    readHash();
    document.getElementById('search-input').value = state.searchTerm;
    render();
  });

  readHash();
  searchInput.value = state.searchTerm;
}

function readHash() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  state.category = params.get('cat') || 'all';
  state.searchTerm = params.get('q') || '';
}

function writeHash() {
  const params = new URLSearchParams();
  if (state.category !== 'all') params.set('cat', state.category);
  if (state.searchTerm) params.set('q', state.searchTerm);
  const hash = params.toString();
  const url = hash ? `${window.location.pathname}#${hash}` : window.location.pathname;
  history.replaceState(null, '', url);
}

function render() {
  renderCategoryFilters(
    document.getElementById('category-filters'),
    state.categories,
    state.category,
    (cat) => {
      state.category = cat;
      writeHash();
      render();
    }
  );

  const filtered = filterPrompts(state.prompts, {
    searchTerm: state.searchTerm,
    category: state.category,
  });

  const grid = document.getElementById('cards-grid');
  const empty = document.getElementById('empty-state');

  if (filtered.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  renderCards(grid, filtered, state.categories, {
    onCardClick: async (p) => {
      try {
        const text = await getPromptText(p);
        openModal(p, state.categories, text);
      } catch (err) {
        console.error('Failed to load prompt body:', err);
      }
    },
    onCopyClick: async (p, btn) => {
      try {
        const text = await getPromptText(p);
        const ok = await copyToClipboard(text);
        if (ok) {
          btn.classList.add('copied');
          setTimeout(() => btn.classList.remove('copied'), 1500);
        }
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    },
  });
}

init();
