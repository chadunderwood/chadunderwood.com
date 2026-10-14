/**
 * Dark/light persistence on html[data-theme]. Default: dark.
 * Optional UI tick sound (localStorage cu:sound).
 */
(function () {
  'use strict';

  var THEME_KEY = 'cu:theme';
  var SOUND_KEY = 'cu:sound';

  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    return t === 'light' ? 'light' : 'dark';
  }

  function syncSwitch(el, on) {
    if (!el) return;
    el.setAttribute('aria-checked', on ? 'true' : 'false');
  }

  function isSoundEnabled() {
    try {
      return localStorage.getItem(SOUND_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setSoundEnabled(on) {
    try {
      localStorage.setItem(SOUND_KEY, on ? '1' : '0');
    } catch (e) {
      /* ignore */
    }
  }

  function playTick() {
    if (!isSoundEnabled()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      var ctx = new Ctx();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 680;
      g.gain.value = 0.03;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      o.stop(ctx.currentTime + 0.09);
      o.onended = function () {
        ctx.close();
      };
    } catch (e) {
      /* ignore */
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore */
    }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      syncSwitch(btn, theme === 'dark');
    });
  }

  function syncSoundSwitches() {
    var on = isSoundEnabled();
    document.querySelectorAll('[data-sound-toggle]').forEach(function (el) {
      if (el instanceof HTMLInputElement) {
        el.checked = on;
      } else {
        syncSwitch(el, on);
      }
    });
  }

  function initThemeToggle() {
    applyTheme(currentTheme());
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        playTick();
      });
    });
  }

  function initSoundToggle() {
    syncSoundSwitches();
    document.querySelectorAll('[data-sound-toggle]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el instanceof HTMLInputElement) return;
        e.preventDefault();
        e.stopPropagation();
        var next = !isSoundEnabled();
        setSoundEnabled(next);
        syncSoundSwitches();
        if (next) playTick();
      });
      if (el instanceof HTMLInputElement) {
        el.addEventListener('change', function () {
          setSoundEnabled(el.checked);
          syncSoundSwitches();
          if (el.checked) playTick();
        });
      }
    });
  }

  // Expose for dock.js
  window.ChadTheme = {
    playTick: playTick,
    isSoundEnabled: isSoundEnabled,
    setSoundEnabled: setSoundEnabled,
    applyTheme: applyTheme,
    currentTheme: currentTheme,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initThemeToggle();
      initSoundToggle();
    });
  } else {
    initThemeToggle();
    initSoundToggle();
  }
})();
