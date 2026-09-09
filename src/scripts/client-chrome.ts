import { playTick, isSoundEnabled, setSoundEnabled } from './sound';
const THEME_KEY = 'cu:theme';

function currentTheme(): 'light' | 'dark' {
  const t = document.documentElement.getAttribute('data-theme');
  return t === 'light' ? 'light' : 'dark';
}

function syncSwitch(el: HTMLElement | null, on: boolean): void {
  if (!el) return;
  el.setAttribute('aria-checked', on ? 'true' : 'false');
}

function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((btn) => {
    syncSwitch(btn, theme === 'dark');
  });
}

function initThemeToggle(): void {
  applyTheme(currentTheme());
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      playTick();
    });
  });
}

function initSoundToggle(): void {
  const sync = () => {
    const on = isSoundEnabled();
    document.querySelectorAll<HTMLElement>('[data-sound-toggle]').forEach((btn) => {
      if (btn instanceof HTMLInputElement) {
        btn.checked = on;
      } else {
        syncSwitch(btn, on);
      }
    });
  };
  sync();
  document.querySelectorAll<HTMLElement>('[data-sound-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      // Colophon uses checkbox change; fan uses button role=switch
      if (el instanceof HTMLInputElement) return;
      e.preventDefault();
      e.stopPropagation();
      const next = !isSoundEnabled();
      setSoundEnabled(next);
      sync();
      if (next) playTick();
    });
  });
}


const SEEN_KEY = 'cu:writing-seen-id';

function initWritingBadge(): void {
  const latestId = document.body.dataset.latestWritingId || '';
  const badge = document.querySelector<HTMLElement>('[data-writing-badge]');
  if (!badge || !latestId) return;

  let seen = '';
  try {
    seen = localStorage.getItem(SEEN_KEY) || '';
  } catch {
    seen = '';
  }

  const path = location.pathname.replace(/\/$/, '') || '/';
  const onWriting = path === '/writing' || path.startsWith('/writing/');

  if (onWriting) {
    try {
      localStorage.setItem(SEEN_KEY, latestId);
    } catch {
      /* ignore */
    }
    badge.hidden = true;
    return;
  }

  badge.hidden = seen === latestId;
}

function initReadingProgress(): void {
  if (document.body.dataset.essayProgress !== '1') return;
  const ring = document.querySelector<HTMLElement>('[data-writing-progress]');
  if (!ring) return;

  ring.dataset.active = '1';

  const onScroll = () => {
    const el = document.documentElement;
    const article = document.querySelector<HTMLElement>('[data-essay]');
    const target = article || el;
    const rect = target.getBoundingClientRect();
    const total = target.scrollHeight - window.innerHeight;
    const scrolled = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
    const pct = Math.round(scrolled * 100);
    ring.style.boxShadow = `inset 0 0 0 2px color-mix(in srgb, #34C759 ${pct}%, transparent), 0 0 ${8 + pct / 8}px color-mix(in srgb, #34C759 ${Math.max(20, pct)}%, transparent)`;
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initElsewhere(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-elsewhere-toggle]');
  const stack = document.getElementById('cmd-fan') || document.getElementById('elsewhere-stack');
  if (!toggle || !stack) return;

  const wrap = toggle.closest('.elsewhere-wrap') || toggle.parentElement;

  const close = () => {
    stack.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  const open = () => {
    stack.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    playTick();
  };

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (stack.hidden) open();
    else close();
  });

  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (stack.hidden) open();
      else close();
    } else if (e.key === 'ArrowDown' && stack.hidden) {
      e.preventDefault();
      open();
      const first = stack.querySelector<HTMLElement>('a, button');
      first?.focus();
    } else if (e.key === 'Escape' && !stack.hidden) {
      e.preventDefault();
      close();
    }
  });

  document.addEventListener('click', (e) => {
    const t = e.target as Node | null;
    if (stack.hidden) return;
    const el = t instanceof Element ? t : t?.parentElement;
    if (el?.closest('#cmd-fan') || el?.closest('[data-elsewhere-toggle]') || (wrap && el?.closest('.elsewhere-wrap') === wrap)) {
      return;
    }
    close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !stack.hidden) {
      close();
      toggle.focus();
    }
  });
}

function initDockTicks(): void {
  document.querySelectorAll<HTMLAnchorElement>('.dock-item[href]').forEach((a) => {
    a.addEventListener('click', () => playTick());
  });
}

export function initClientChrome(): void {
  initWritingBadge();
  initReadingProgress();
  initElsewhere();
  initThemeToggle();
  initSoundToggle();
  initDockTicks();
}
