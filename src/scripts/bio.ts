import { playTick } from './sound';

const VISITED_KEY = 'cu:bio-visited';
const SECRET_KEY = 'cu:secret-unlocked';

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveVisited(set: Set<string>): void {
  try {
    localStorage.setItem(VISITED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function initBio(): void {
  const root = document.querySelector<HTMLElement>('[data-bio]');
  if (!root) return;

  const visited = loadVisited();
  const total = Number(root.dataset.total || '0');
  const countEl = root.querySelector<HTMLElement>('[data-bio-count]');
  const backdrop = root.querySelector<HTMLElement>('[data-bio-backdrop]');
  const hotspots = [...root.querySelectorAll<HTMLButtonElement>('[data-hotspot-id]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-panel-id]')];
  let openId: string | null = null;

  function updateCounter(): void {
    if (countEl) countEl.textContent = String(visited.size);
  }

  function markVisitedStyles(): void {
    for (const btn of hotspots) {
      const id = btn.dataset.hotspotId!;
      btn.classList.toggle('is-visited', visited.has(id));
    }
  }

  function closePanel(): void {
    for (const p of panels) {
      p.classList.remove('is-open');
      p.hidden = true;
    }
    for (const btn of hotspots) {
      btn.setAttribute('aria-expanded', 'false');
    }
    if (backdrop) backdrop.hidden = true;
    openId = null;
  }

  function openPanel(id: string): void {
    closePanel();
    const panel = panels.find((p) => p.dataset.panelId === id);
    const btn = hotspots.find((b) => b.dataset.hotspotId === id);
    if (!panel || !btn) return;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    btn.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.hidden = false;
    openId = id;
    playTick();

    if (!visited.has(id)) {
      visited.add(id);
      saveVisited(visited);
      updateCounter();
      markVisitedStyles();
    }

    if (btn.dataset.secret === '1') {
      try {
        localStorage.setItem(SECRET_KEY, '1');
      } catch {
        /* ignore */
      }
    }
  }

  for (const btn of hotspots) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = btn.dataset.hotspotId!;
      if (openId === id) closePanel();
      else openPanel(id);
    });
  }

  for (const panel of panels) {
    panel.querySelector('[data-panel-close]')?.addEventListener('click', () => closePanel());
  }

  backdrop?.addEventListener('click', () => closePanel());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && openId) closePanel();
  });

  updateCounter();
  markVisitedStyles();
}
