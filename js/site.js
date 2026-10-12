(function () {
  'use strict';
  document.documentElement.classList.add('js');

  // Confirm before destructive actions.
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-confirm]');
    if (el && !window.confirm(el.getAttribute('data-confirm'))) e.preventDefault();
  });

  // Close the mobile menu with Escape or when clicking outside.
  var menu = document.querySelector('.nav-mobile');
  if (menu) {
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  // Auto-continue to the store after activating an offer.
  var go = document.querySelector('[data-auto-redirect]');
  if (go) {
    var ms = parseInt(go.getAttribute('data-auto-redirect'), 10) || 2500;
    setTimeout(function () { window.location.href = go.href; }, ms);
  }

  // Payout method: show only the fields for the selected method.
  var sw = document.querySelector('[data-method-switch]');
  if (sw) {
    var update = function () {
      var checked = sw.querySelector('input:checked');
      var m = checked ? checked.value : 'upi';
      document.querySelectorAll('[data-method]').forEach(function (g) {
        var on = g.getAttribute('data-method') === m;
        g.hidden = !on;
        g.querySelectorAll('input').forEach(function (i) { i.required = on; });
      });
    };
    sw.addEventListener('change', update);
    update();
  }

  // Accessible inline validation for forms marked data-validate.
  function message(input) {
    var v = input.validity;
    var label = (document.querySelector('label[for="' + input.id + '"]') || {}).textContent || 'This field';
    label = label.replace(/\(optional\)/, '').trim();
    if (v.valueMissing) return input.type === 'checkbox' ? 'Please tick this box to continue.' : label + ' is required.';
    if (v.typeMismatch && input.type === 'email') return 'Enter a valid email address.';
    if (v.typeMismatch && input.type === 'url') return 'Enter a valid URL.';
    if (v.tooShort) return label + ' must be at least ' + input.minLength + ' characters.';
    if (v.patternMismatch) return 'Please check the format of ' + label.toLowerCase() + '.';
    return input.validationMessage;
  }
  function clear(input) {
    input.removeAttribute('aria-invalid');
    var err = document.getElementById(input.id + '-err');
    if (err) err.remove();
  }
  function show(input) {
    clear(input);
    input.setAttribute('aria-invalid', 'true');
    var p = document.createElement('p');
    p.className = 'field-error';
    p.id = input.id + '-err';
    p.textContent = message(input);
    var host = input.closest('.field, .check') || input.parentNode;
    host.appendChild(p);
    var desc = (input.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== p.id; });
    desc.push(p.id);
    input.setAttribute('aria-describedby', desc.join(' '));
  }
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var first = null;
      form.querySelectorAll('input, select, textarea').forEach(function (i) {
        if (!i.id || i.closest('[hidden]') || i.type === 'hidden') return;
        if (!i.checkValidity()) { show(i); if (!first) first = i; } else clear(i);
      });
      if (first) { e.preventDefault(); first.focus(); return; }
      var btn = form.querySelector('button[type=submit]');
      if (btn) { setTimeout(function () { btn.disabled = true; }, 0); }
      window.addEventListener('pageshow', function () { if (btn) btn.disabled = false; }, { once: true });
    });
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid') && e.target.checkValidity()) clear(e.target); });
  });
})();
