export function renderCategoryFilters(container, categories, activeCategory, onClick) {
  container.innerHTML = '';
  const all = createChip('all', '전체', null, activeCategory === 'all');
  all.addEventListener('click', () => onClick('all'));
  container.appendChild(all);

  for (const cat of categories) {
    const chip = createChip(cat.id, cat.label, cat.id, activeCategory === cat.id);
    chip.addEventListener('click', () => onClick(cat.id));
    container.appendChild(chip);
  }
}

function createChip(id, label, dotId, isActive) {
  const btn = document.createElement('button');
  btn.className = 'category-chip' + (isActive ? ' active' : '');
  btn.dataset.category = id;
  if (dotId) {
    const dot = document.createElement('span');
    dot.className = 'category-chip-dot';
    dot.style.setProperty('--dot-color', `var(--color-cat-${dotId})`);
    btn.appendChild(dot);
  }
  const text = document.createElement('span');
  text.textContent = label;
  btn.appendChild(text);
  return btn;
}

export function renderCards(container, prompts, categories, state, handlers) {
  container.innerHTML = '';
  const catMap = new Map(categories.map(c => [c.id, c]));

  for (const p of prompts) {
    const cat = catMap.get(p.category);
    const isFav = state.favorites.has(p.id);

    const card = document.createElement('article');
    card.className = 'card' + (isFav ? ' is-favorite' : '');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${p.title} 상세 보기`);
    card.dataset.id = p.id;

    card.innerHTML = `
      <div class="card-header">
        <span class="card-category">
          <span class="card-category-dot" style="--dot-color: var(--color-cat-${p.category})"></span>
          ${escapeHTML(cat?.label || p.category)}
        </span>
        <div class="card-header-right">
          ${p.model ? `<span class="model-badge" title="권장 모델: ${escapeHTML(p.model)}">${escapeHTML(p.model)}</span>` : ''}
          <button class="fav-btn ${isFav ? 'active' : ''}" data-action="favorite" aria-label="${isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}" title="${isFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}">
            <svg class="fav-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9 4.75 17.65l1-5.85L1.5 7.65l5.9-.85L10 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <h3 class="card-title">${escapeHTML(p.title)}</h3>
      <p class="card-description">${escapeHTML(p.description || '')}</p>
      <div class="card-footer">
        <div class="card-tags">
          ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="copy-btn" data-action="copy" aria-label="${escapeHTML(p.title)} 프롬프트 복사">
            <span class="copy-btn-default">복사</span>
            <span class="copy-btn-done">복사됨!</span>
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="copy"]') || e.target.closest('[data-action="favorite"]')) return;
      handlers.onCardClick(p);
    });

    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        handlers.onCardClick(p);
      }
    });

    const copyBtn = card.querySelector('[data-action="copy"]');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onCopyClick(p, copyBtn);
    });

    const favBtn = card.querySelector('[data-action="favorite"]');
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onFavoriteClick(p, favBtn, card);
    });

    container.appendChild(card);
  }
}

export function openModal(prompt, categories, promptText) {
  const modal = document.getElementById('prompt-modal');
  const catMap = new Map(categories.map(c => [c.id, c]));
  const cat = catMap.get(prompt.category);

  modal.dataset.promptId = prompt.id;
  document.getElementById('modal-title').textContent = prompt.title;

  const catEl = modal.querySelector('.modal-category');
  catEl.innerHTML = '';
  const dot = document.createElement('span');
  dot.className = 'modal-category-dot';
  dot.style.setProperty('--dot-color', `var(--color-cat-${prompt.category})`);
  catEl.appendChild(dot);
  const catText = document.createElement('span');
  catText.textContent = cat?.label || prompt.category;
  catEl.appendChild(catText);

  const modelEl = modal.querySelector('.modal-model');
  if (prompt.model) {
    modelEl.textContent = prompt.model;
    modelEl.classList.remove('hidden');
  } else {
    modelEl.classList.add('hidden');
  }

  const tagsEl = modal.querySelector('.modal-tags');
  tagsEl.innerHTML = '';
  for (const t of (prompt.tags || [])) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = t;
    tagsEl.appendChild(tag);
  }

  modal.querySelector('.modal-description').textContent = prompt.description || '';
  document.getElementById('modal-prompt').textContent = promptText;

  const usageSection = document.getElementById('modal-usage-section');
  const copyBtn = document.getElementById('modal-copy');
  copyBtn.classList.remove('copied');

  if (prompt.usage) {
    document.getElementById('modal-usage').textContent = prompt.usage;
    usageSection.classList.remove('hidden');
  } else {
    usageSection.classList.add('hidden');
  }

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-copy').focus();
}

export function closeModal() {
  const modal = document.getElementById('prompt-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

export function updateCardFavorite(container, promptId, isFav) {
  const card = container.querySelector(`.card[data-id="${promptId}"]`);
  if (!card) return;
  card.classList.toggle('is-favorite', isFav);
  const btn = card.querySelector('[data-action="favorite"]');
  btn.classList.toggle('active', isFav);
  btn.setAttribute('aria-label', isFav ? '즐겨찾기 해제' : '즐겨찾기 추가');
  btn.setAttribute('title', isFav ? '즐겨찾기 해제' : '즐겨찾기 추가');
}

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
