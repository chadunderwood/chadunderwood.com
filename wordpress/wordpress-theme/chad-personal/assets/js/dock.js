/**
 * ⌘ fan open/close. Theme/sound toggles live in theme.js.
 */
(function () {
  'use strict';

  function playTick() {
    if (window.ChadTheme && typeof window.ChadTheme.playTick === 'function') {
      window.ChadTheme.playTick();
    }
  }

  function initElsewhere() {
    var toggle = document.querySelector('[data-elsewhere-toggle]');
    var stack = document.getElementById('cmd-fan');
    if (!toggle || !stack) return;

    var wrap = toggle.closest('.elsewhere-wrap') || toggle.parentElement;

    function close() {
      stack.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }

    function open() {
      stack.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      playTick();
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (stack.hidden) open();
      else close();
    });

    toggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        if (stack.hidden) open();
        else close();
      } else if (e.key === 'ArrowDown' && stack.hidden) {
        e.preventDefault();
        open();
        var first = stack.querySelector('a, button');
        if (first) first.focus();
      } else if (e.key === 'Escape' && !stack.hidden) {
        e.preventDefault();
        close();
      }
    });

    document.addEventListener('click', function (e) {
      if (stack.hidden) return;
      var t = e.target;
      var el = t instanceof Element ? t : t && t.parentElement;
      if (
        el &&
        (el.closest('#cmd-fan') ||
          el.closest('[data-elsewhere-toggle]') ||
          (wrap && el.closest('.elsewhere-wrap') === wrap))
      ) {
        return;
      }
      close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !stack.hidden) {
        close();
        toggle.focus();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElsewhere);
  } else {
    initElsewhere();
  }
})();
