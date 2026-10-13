/**
 * Bio hotspots: wrap triggers as buttons (server-rendered), panel on click,
 * discovery counter (found/total), localStorage progress.
 */
(function () {
  'use strict';

  var VISITED_KEY = 'cu:bio-visited';
  var SECRET_KEY = 'cu:secret-unlocked';

  function playTick() {
    if (window.ChadTheme && typeof window.ChadTheme.playTick === 'function') {
      window.ChadTheme.playTick();
    }
  }

  function loadVisited() {
    try {
      var raw = localStorage.getItem(VISITED_KEY);
      if (!raw) return new Set();
      var arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch (e) {
      return new Set();
    }
  }

  function saveVisited(set) {
    try {
      localStorage.setItem(VISITED_KEY, JSON.stringify(Array.from(set)));
    } catch (e) {
      /* ignore */
    }
  }

  function initBio() {
    var root = document.querySelector('[data-bio]');
    if (!root) return;

    var visited = loadVisited();
    var total = Number(root.dataset.total || '0');
    var countEl = root.querySelector('[data-bio-count]');
    var backdrop = root.querySelector('[data-bio-backdrop]');
    var hotspots = Array.prototype.slice.call(root.querySelectorAll('[data-hotspot-id]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-panel-id]'));
    var openId = null;

    function updateCounter() {
      if (countEl) countEl.textContent = String(visited.size);
    }

    function markVisitedStyles() {
      hotspots.forEach(function (btn) {
        var id = btn.dataset.hotspotId;
        btn.classList.toggle('is-visited', visited.has(id));
      });
    }

    function closePanel() {
      panels.forEach(function (p) {
        p.classList.remove('is-open');
        p.hidden = true;
      });
      hotspots.forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
      });
      if (backdrop) backdrop.hidden = true;
      openId = null;
    }

    function openPanel(id) {
      closePanel();
      var panel = panels.find(function (p) {
        return p.dataset.panelId === id;
      });
      var btn = hotspots.find(function (b) {
        return b.dataset.hotspotId === id;
      });
      if (!panel || !btn) return;
      panel.hidden = false;
      requestAnimationFrame(function () {
        panel.classList.add('is-open');
      });
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
        } catch (e) {
          /* ignore */
        }
      }
    }

    hotspots.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var id = btn.dataset.hotspotId;
        if (openId === id) closePanel();
        else openPanel(id);
      });
    });

    panels.forEach(function (panel) {
      var closeBtn = panel.querySelector('[data-panel-close]');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          closePanel();
        });
      }
    });

    if (backdrop) {
      backdrop.addEventListener('click', function () {
        closePanel();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && openId) closePanel();
    });

    updateCounter();
    markVisitedStyles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBio);
  } else {
    initBio();
  }
})();
