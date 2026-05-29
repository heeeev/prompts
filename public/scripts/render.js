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

export function renderCards(container, prompts, categories, handlers) {
  container.innerHTML = '';
  const catMap = new Map(categories.map(c => [c.id, c]));

  for (const p of prompts) {
    const cat = catMap.get(p.category);
    const card = document.createElement('article');
    card.className = 'card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${p.title} 상세 보기`);

    card.innerHTML = `
      <div class="card-header">
        <span class="card-category">
          <span class="card-category-dot" style="--dot-color: var(--color-cat-${p.category})"></span>
          ${escapeHTML(cat?.label || p.category)}
        </span>
      </div>
      <h3 class="card-title">${escapeHTML(p.title)}</h3>
      <p class="card-description">${escapeHTML(p.description || '')}</p>
      <div class="card-footer">
        <div class="card-tags">
          ${(p.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('')}
        </div>
        <button class="copy-btn" data-action="copy" aria-label="${escapeHTML(p.title)} 프롬프트 복사">
          <span class="copy-btn-default">복사</span>
          <span class="copy-btn-done">복사됨!</span>
        </button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="copy"]')) return;
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

    container.appendChild(card);
  }
}

export function openModal(prompt, categories, promptText) {
  const modal = document.getElementById('prompt-modal');
  const catMap = new Map(categories.map(c => [c.id, c]));
  const cat = catMap.get(prompt.category);

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

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
