// =======================================
// Kyrtica Website — Main Script (Optimized)
// =======================================
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------
  // 0) Utilities & a11y helpers
  // ---------------------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Screen-reader utility (idempotent)
  (() => {
    if (!document.querySelector('style[data-sr-only]')) {
      const s = document.createElement('style');
      s.setAttribute('data-sr-only', '');
      s.textContent = `
        .sr-only{
          position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;
          overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0
        }`;
      document.head.appendChild(s);
    }
  })();

  // --------------------------------
  // 1) Mobile Menu (hamburger toggle)
  // --------------------------------
  (() => {
    const toggle = $('.hamburger') || $('.menu-toggle');
    const menu   = $('#site-nav')   || $('.menu');
    if (!toggle || !menu) return;

    const openMenu = (open) => {
      menu.classList.toggle('show', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', () => openMenu(!menu.classList.contains('show')));

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!menu.classList.contains('show')) return;
      if (!menu.contains(e.target) && e.target !== toggle) openMenu(false);
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('show')) openMenu(false);
    });
  })();

  // -----------------------
  // 2) Carousel (if present)
  // -----------------------
  (() => {
    const track = $('#track');
    if (!track) return;

    const prev = $('.ctrl[data-dir="prev"]');
    const next = $('.ctrl[data-dir="next"]');

    const scrollByCard = (dir) => {
      const card = track.querySelector('.card');
      const gap  = 18;
      const step = (card ? card.getBoundingClientRect().width + gap : 240) * (dir === 'prev' ? -1 : 1);
      track.scrollBy({ left: step, behavior: 'smooth' });
    };

    prev && prev.addEventListener('click', () => scrollByCard('prev'));
    next && next.addEventListener('click', () => scrollByCard('next'));

    // Horizontal scroll with mouse wheel
    track.addEventListener('wheel', (e) => {
      e.preventDefault();
      track.scrollBy({ left: e.deltaY < 0 ? -200 : 200, behavior: 'smooth' });
    }, { passive: false });

    // Keyboard arrows
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') scrollByCard('next');
      if (e.key === 'ArrowLeft')  scrollByCard('prev');
    });
  })();

  // ---------------------------------------------
  // 3) Partner Modal + Dynamic Fields (if present)
  // ---------------------------------------------
  (() => {
    const modal = $('#modal');
    const form  = $('#partner-form');
    if (!modal || !form) return;

    const openButtons = $$('.open-modal');
    const closeBtn    = modal.querySelector('.modal-close');
    const cancelBtn   = modal.querySelector('.modal-cancel');
    const roleField   = $('#role-field');
    const fieldsWrap  = $('#dynamic-fields');

    const STATES = [
      'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana',
      'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
      'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
      'Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh',
      'Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
    ];

    const COMMON_FIELDS = [
      { name:'business_name',  ph:'Business Name', required:true },
      { name:'signatory_name', ph:'Authorised Signatory Name', required:true },
      { name:'contact',        ph:'Mobile Number', required:true },
      { name:'email',          ph:'Email', type:'email', required:true },
      { name:'gst',            ph:'GSTIN' },
      { name:'state',          type:'select', ph:'State', required:true, options: STATES },
      { name:'city',           ph:'City', required:true },
      { name:'pincode',        ph:'Pincode (6 digits)', required:true },
      { name:'address',        type:'textarea', ph:'Full Address (Door No, Street, Area)', required:true, full:true }
    ];

    const roleConfigs = {
      wholesaler: {
        title: 'Apply as Wholesaler',
        subtitle: 'Tell us about your catalog and dispatch capabilities.',
        fields: [
          ...COMMON_FIELDS,
          { name:'categories', ph:'Categories (e.g., kitchenware, electronics)' },
          { name:'moq',        ph:'Typical MOQ (e.g., 20, 50)' },
          { name:'website',    ph:'Website (optional)' }
        ]
      },
      retailer: {
        title: 'Join as Retailer',
        subtitle: 'We’ll help you source and sync products.',
        fields: [
          ...COMMON_FIELDS,
          { name:'store_name',     ph:'Store Name', required:true },
          { name:'platform',       ph:'Platform (Shopify / Woo / Dukaan)', required:true },
          { name:'monthly_orders', ph:'Estimated Monthly Orders' }
        ]
      },
      logistics: {
        title: 'Partner as Logistics',
        subtitle: 'Share your coverage and services.',
        fields: [
          ...COMMON_FIELDS,
          { name:'coverage', ph:'Coverage (states/cities)' },
          { name:'services', ph:'Services (FTL / PTL / Courier)' }
        ]
      }
    };
    window.roleConfigs = roleConfigs; // optional external access

    const renderFields = (cfg) => {
      if (!fieldsWrap) return;
      fieldsWrap.innerHTML = '';
      cfg.fields.forEach(f => {
        let el;
        if (f.type === 'select') {
          el = document.createElement('select');
          el.name = f.name; el.required = !!f.required;
          const first = document.createElement('option');
          first.value = ''; first.textContent = f.ph || 'Select'; first.disabled = true; first.selected = true;
          el.appendChild(first);
          (f.options || []).forEach(opt => {
            const o = document.createElement('option');
            o.value = opt; o.textContent = opt;
            el.appendChild(o);
          });
        } else if (f.type === 'textarea') {
          el = document.createElement('textarea');
          el.name = f.name; el.required = !!f.required; el.rows = 3; el.placeholder = f.ph || '';
          if (f.full) el.classList.add('full');
        } else {
          el = document.createElement('input');
          el.type = f.type || 'text';
          el.name = f.name;
          el.required = !!f.required;
          el.placeholder = f.ph || '';
        }
        fieldsWrap.appendChild(el);
      });
    };

    const openForRole = (role) => {
      const cfg = roleConfigs[role];
      if (!cfg) return;
      const title    = $('#modal-title');
      const subtitle = $('#modal-subtitle');
      if (title)    title.textContent    = cfg.title;
      if (subtitle) subtitle.textContent = cfg.subtitle;
      if (roleField) roleField.value     = role;
      renderFields(cfg);
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        const first = fieldsWrap && fieldsWrap.querySelector('input,select,textarea');
        first && first.focus();
      }, 30);
    };

    const closeModal = () => {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    };

    openButtons.forEach(btn => btn.addEventListener('click', () => openForRole(btn.dataset.role)));
    $$('#partner-roles input[name="role"]').forEach(r => r.addEventListener('change', () => openForRole(r.value)));
    closeBtn  && closeBtn.addEventListener('click', closeModal);
    cancelBtn && cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
  })();

  // ----------------------------------------------------
  // 4) Toasts, UTM Capture, Validation & Submit (modal)
  // ----------------------------------------------------
  (() => {
    const modal = $('#modal');
    const form  = $('#partner-form');
    if (!modal || !form) return;

    const toastRoot = $('#toast-root');

    const showToast = (msg, isError = false) => {
      if (!toastRoot) { alert(msg); return; }
      const el = document.createElement('div');
      el.className = 'toast' + (isError ? ' error' : '');
      el.textContent = msg;
      toastRoot.appendChild(el);
      setTimeout(() => el.remove(), 4200);
    };

    // UTM capture
    const params  = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    utmKeys.forEach(k => {
      const v = params.get(k) || sessionStorage.getItem(k) || '';
      if (v) sessionStorage.setItem(k, v);
      const input = $('#' + k);
      if (input) input.value = v || '';
    });

    // Validation helpers
    const ensureHint = (input) => {
      let hint = input.nextElementSibling;
      if (!hint || !hint.classList || !hint.classList.contains('error-hint')) {
        hint = document.createElement('div');
        hint.className = 'error-hint';
        input.insertAdjacentElement('afterend', hint);
      }
      return hint;
    };
    const setError = (input, msg) => {
      const hint = ensureHint(input);
      hint.textContent = msg;
      hint.style.display = 'block';
      input.classList.add('input-error');
    };
    const clearError = (input) => {
      const hint = input.nextElementSibling;
      if (hint && hint.classList && hint.classList.contains('error-hint')) {
        hint.style.display = 'none'; hint.textContent = '';
      }
      input.classList.remove('input-error');
    };
    const validateInput = (input) => {
      clearError(input);
      const v = (input.value || '').trim();
      const n = input.name;

      if (input.required && !v) { setError(input, 'This field is required'); return false; }
      if (n === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setError(input, 'Enter a valid email'); return false; }
      if ((n === 'contact' || n === 'phone') && v && !/^[6-9]\d{9}$/.test(v)) { setError(input, 'Enter a valid 10-digit mobile'); return false; }
      if (n === 'pincode' && v && !/^\d{6}$/.test(v)) { setError(input, 'Enter a valid 6-digit pincode'); return false; }
      if (n === 'gst' && v && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.toUpperCase())) {
        setError(input, 'GSTIN format looks invalid'); return false;
      }
      return true;
    };

    form.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) validateInput(t);
    });

    // Keep hidden role synced
    const roleField = $('#role-field');
    $$('input[name="role"]').forEach(radio => {
      radio.addEventListener('change', () => { if (roleField) roleField.value = radio.value; });
    });

    // Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = form.querySelectorAll('input,select,textarea');
      let ok = true;
      inputs.forEach(i => { if (!validateInput(i)) ok = false; });
      if (!ok) { showToast('Please fix the highlighted fields.', true); return; }

      try {
        const fd = new FormData(form);
        fd.append('submitted_at', new Date().toISOString());
        fd.append('page', location.pathname + location.search);

        const resp = await fetch(form.action || '#', { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } });
        if (resp.ok) {
          showToast('Thanks! Your application has been submitted.');
          form.reset();
          setTimeout(() => { const close = modal.querySelector('.modal-close'); close && close.click(); }, 600);
        } else {
          showToast('Submission failed. Please try again.', true);
        }
      } catch {
        showToast('Network error. Please try again.', true);
      }
    });
  })();

  // -----------------------------------
  // 5) FAQ single-open (accordion style)
  // -----------------------------------
  (() => {
    const faqGrid = document.querySelector('.faq-grid[data-single]');
    if (!faqGrid) return;
    faqGrid.addEventListener('toggle', (e) => {
      if (e.target.tagName.toLowerCase() !== 'details' || !e.target.open) return;
      faqGrid.querySelectorAll('details[open]').forEach(d => { if (d !== e.target) d.open = false; });
    }, true);
  })();

  // -----------------------------------------
  // 6) Reveal-on-scroll (global, lightweight)
  // -----------------------------------------
  (() => {
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = $$('.reveal');
    if (!targets.length) return;

    // No IO or motion? Just show everything.
    if (prefersReduce || !('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('in'));
      return;
    }

    const onIntersect = (entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    };

    const io = new IntersectionObserver(onIntersect, {
      threshold: 0.18,
      rootMargin: '0px 0px -40px 0px' // nudge reveal a bit earlier
    });

    targets.forEach(el => io.observe(el));
  })();

  // -----------------------------------------
  // 7) Visit Counter (CountAPI, once/day/device)
  // -----------------------------------------
  (() => {
    const el = $('#visit-counter');
    if (!el) return;

    const NAMESPACE = 'kyrtica.in';
    const KEY       = 'homepage';
    const today     = new Date().toISOString().slice(0,10); // YYYY-MM-DD
    const lsKey     = `vc_${KEY}_date`;
    const last      = localStorage.getItem(lsKey);

    const readCount = () =>
      fetch(`https://api.countapi.xyz/get/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`)
        .then(r => r.json())
        .then(d => (d && typeof d.value === 'number') ? d.value : 0);

    const hitCount = () =>
      fetch(`https://api.countapi.xyz/hit/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`)
        .then(r => r.json())
        .then(d => (d && typeof d.value === 'number') ? d.value : 0);

    const setUI = (n) => { el.textContent = Number(n).toLocaleString(); };

    (async () => {
      try {
        const value = (last === today) ? await readCount() : await hitCount();
        if (last !== today) localStorage.setItem(lsKey, today);
        setUI(value);
      } catch {
        el.textContent = 'offline';
      }
    })();
  })();

  // -----------------------------------------
  // 8) Optional: highlight nav link on scroll
  // -----------------------------------------
  (() => {
    const nav = $('#site-nav');
    if (!nav || !('IntersectionObserver' in window)) return;

    const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
    if (!links.length) return;

    const map = new Map();
    links.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      const sec = id && document.getElementById(id);
      if (sec) map.set(sec, a);
    });
    if (!map.size) return;

    const clearActive = () => links.forEach(a => a.classList.remove('active'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          clearActive();
          const a = map.get(e.target);
          a && a.classList.add('active');
        }
      });
    }, { threshold: 0.4 });

    map.forEach((_, sec) => io.observe(sec));
  })();
  <script>
(function(){
  // 1) Check that CSS loaded by looking for a known rule
  var cssOk = !!getComputedStyle(document.documentElement).getPropertyValue('--bg');

  // 2) Check script loaded (this code itself proves it), but also test DOMContentLoaded handler ran
  var jsOk = true;

  // 3) Check a few critical assets exist (adjust paths to match your actual structure)
  var assets = [
    '/assets/hero.jpg',
    '/assets/logo.svg',
    '/assets/shopify.svg',
    '/assets/woocommerce.svg'
  ];
  var missing = [];
  var checks = assets.map(function (url){
    return new Promise(function(resolve){
      var img = new Image();
      img.onload = function(){ resolve({url, ok:true}); };
      img.onerror = function(){ resolve({url, ok:false}); };
      img.src = url + '?v=' + Date.now();
    });
  });

  Promise.all(checks).then(function(results){
    results.forEach(function(r){ if(!r.ok) missing.push(r.url); });

    // Visual badge if anything is wrong
    var badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:12px;right:12px;padding:10px 12px;border-radius:10px;background:#1b1b1b;color:#fff;border:1px solid #333;font:600 12px/1.2 system-ui;z-index:99999';
    var ok = cssOk && jsOk && missing.length === 0;
    badge.style.background = ok ? '#0d1f0d' : '#2a0f10';
    badge.style.borderColor = ok ? '#1f4d1f' : '#5a1f22';
    badge.textContent = ok ? '✅ All core assets loaded' : ('❌ Missing: ' + missing.join(', '));
    document.body.appendChild(badge);

    // Console details
    console.group('%cKyrtica debug', 'color:#f5c400;font-weight:700');
    console.log('CSS custom properties present:', cssOk);
    console.log('script.js executed:', jsOk);
    console.log('Missing assets:', missing);
    console.groupEnd();
  });
})();
</script>

});
