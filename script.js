// =======================================
// Kyrtica Website — Main Script (Final)
// =======================================
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // 0) Screen-reader utility: adds .sr-only class (safe to load multiple times)
  (function(){
    if (!document.querySelector('style[data-sr-only]')) {
      const s = document.createElement('style');
      s.setAttribute('data-sr-only','');
      s.textContent = `
        .sr-only{
          position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;
          overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0
        }`;
      document.head.appendChild(s);
    }
  })();

  // Small helpers
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  /* ==============================
   * 1) Mobile Menu Toggle
   * ============================== */
  (function () {
    // Support both .hamburger (new) and .menu-toggle (old)
    const toggle = $('.hamburger') || $('.menu-toggle');
    const menu = $('#site-nav') || $('.menu');
    if (!toggle || !menu) return;

    const openMenu = (open) => {
      menu.classList.toggle('show', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    toggle.addEventListener('click', () => openMenu(!menu.classList.contains('show')));

    // Close when clicking outside on small screens
    document.addEventListener('click', (e) => {
      if (!menu.classList.contains('show')) return;
      if (!menu.contains(e.target) && e.target !== toggle) openMenu(false);
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('show')) openMenu(false);
    });
  })();

  /* ==============================
   * 2) Carousel (if present)
   * ============================== */
  (function () {
    const track = document.getElementById('track');
    if (!track) return;

    const prev = document.querySelector('.ctrl[data-dir="prev"]');
    const next = document.querySelector('.ctrl[data-dir="next"]');

    function scrollByCard(dir){
      const card = track.querySelector('.card');
      const gap = 18;
      const step = (card ? card.getBoundingClientRect().width + gap : 240) * (dir==='prev' ? -1 : 1);
      track.scrollBy({ left: step, behavior: 'smooth' });
    }

    prev && prev.addEventListener('click', () => scrollByCard('prev'));
    next && next.addEventListener('click', () => scrollByCard('next'));

    // Horizontal scroll with mouse wheel
    track.addEventListener('wheel', (e) => {
      e.preventDefault();
      track.scrollBy({ left: e.deltaY < 0 ? -200 : 200, behavior: 'smooth' });
    }, { passive:false });

    // Keyboard arrows
    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') scrollByCard('next');
      if (e.key === 'ArrowLeft')  scrollByCard('prev');
    });
  })();

  /* ==============================
   * 3) Partner Modal + Dynamic Fields
   * ============================== */
  (function () {
    const modal = document.getElementById('modal');
    const form = document.getElementById('partner-form');
    if (!modal || !form) return;

    const openButtons = $$('.open-modal');
    const closeBtn   = modal.querySelector('.modal-close');
    const cancelBtn  = modal.querySelector('.modal-cancel');
    const roleField  = document.getElementById('role-field');
    const fieldsWrap = document.getElementById('dynamic-fields');

    const STATES = [
      "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
      "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
      "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
      "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry"
    ];

    const COMMON_FIELDS = [
      { name:'business_name', ph:'Business Name', required:true },
      { name:'signatory_name', ph:'Authorised Signatory Name', required:true },
      { name:'contact', ph:'Mobile Number', required:true },
      { name:'email', ph:'Email', type:'email', required:true },
      { name:'gst', ph:'GSTIN' },
      { name:'state', type:'select', ph:'State', required:true, options: STATES },
      { name:'city', ph:'City', required:true },
      { name:'pincode', ph:'Pincode (6 digits)', required:true },
      { name:'address', type:'textarea', ph:'Full Address (Door No, Street, Area)', required:true, full:true }
    ];

    const roleConfigs = {
      wholesaler: {
        title: 'Apply as Wholesaler',
        subtitle: 'Tell us about your catalog and dispatch capabilities.',
        fields: [
          ...COMMON_FIELDS,
          { name:'categories', ph:'Categories (e.g., kitchenware, electronics)' },
          { name:'moq', ph:'Typical MOQ (e.g., 20, 50)' },
          { name:'website', ph:'Website (optional)' }
        ]
      },
      retailer: {
        title: 'Join as Retailer',
        subtitle: 'We’ll help you source and sync products.',
        fields: [
          ...COMMON_FIELDS,
          { name:'store_name', ph:'Store Name', required:true },
          { name:'platform', ph:'Platform (Shopify / Woo / Dukaan)', required:true },
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

    function renderFields(cfg) {
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
    }

    function openForRole(role) {
      const cfg = roleConfigs[role];
      if (!cfg) return;
      const title = document.getElementById('modal-title');
      const subtitle = document.getElementById('modal-subtitle');
      if (title) title.textContent = cfg.title;
      if (subtitle) subtitle.textContent = cfg.subtitle;
      if (roleField) roleField.value = role;
      renderFields(cfg);
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => {
        const first = fieldsWrap.querySelector('input,select,textarea');
        if (first) first.focus();
      }, 30);
    }

    function closeModal() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
    }

    openButtons.forEach(btn => btn.addEventListener('click', () => openForRole(btn.dataset.role)));
    $$('#partner-roles input[name="role"]').forEach(r => r.addEventListener('change', () => openForRole(r.value)));

    closeBtn && closeBtn.addEventListener('click', closeModal);
    cancelBtn && cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
  })();

  /* ==============================
   * 4) Toasts, UTM Capture, Validation & Submit
   * ============================== */
  (function () {
    const modal = document.getElementById('modal');
    const form = document.getElementById('partner-form');
    if (!modal || !form) return;

    const toastRoot = document.getElementById('toast-root');

    function showToast(msg, isError = false) {
      if (!toastRoot) { alert(msg); return; }
      const el = document.createElement('div');
      el.className = 'toast' + (isError ? ' error' : '');
      el.textContent = msg;
      toastRoot.appendChild(el);
      setTimeout(() => el.remove(), 4200);
    }

    // UTM capture
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    utmKeys.forEach(k => {
      const v = params.get(k) || sessionStorage.getItem(k) || '';
      if (v) sessionStorage.setItem(k, v);
      const input = document.getElementById(k);
      if (input) input.value = v || '';
    });

    // Validation helpers
    function ensureHint(input) {
      let hint = input.nextElementSibling;
      if (!hint || !hint.classList || !hint.classList.contains('error-hint')) {
        hint = document.createElement('div');
        hint.className = 'error-hint';
        input.insertAdjacentElement('afterend', hint);
      }
      return hint;
    }
    function setError(input, msg) {
      const hint = ensureHint(input);
      hint.textContent = msg;
      hint.style.display = 'block';
      input.classList.add('input-error');
    }
    function clearError(input) {
      const hint = input.nextElementSibling;
      if (hint && hint.classList && hint.classList.contains('error-hint')) {
        hint.style.display = 'none'; hint.textContent = '';
      }
      input.classList.remove('input-error');
    }
    function validateInput(input) {
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
    }

    form.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) validateInput(t);
    });

    // Keep hidden role synced
    const roleField = document.getElementById('role-field');
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
      } catch (err) {
        showToast('Network error. Please try again.', true);
      }
    });
  })();

  /* ==============================
   * 5) FAQ single-open behavior
   * ============================== */
  (function(){
    const faqGrid = document.querySelector('.faq-grid[data-single]');
    if (!faqGrid) return;
    faqGrid.addEventListener('toggle', (e) => {
      if (e.target.tagName.toLowerCase() !== 'details' || !e.target.open) return;
      faqGrid.querySelectorAll('details[open]').forEach(d => { if (d !== e.target) d.open = false; });
    }, true);
  })();

  /* ==============================
   * 6) Reveal-on-scroll for .k-card
   * ============================== */
  (function () {
    const cards = $$('.k-card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('in-view'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    cards.forEach(c => io.observe(c));
  })();

  <script>
  const onIntersect = (entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }});
  };
  const io = new IntersectionObserver(onIntersect, { threshold: 0.2 });
  document.querySelectorAll('.cashless .reveal').forEach(el => io.observe(el));
</script>

});
<script>
(function(){
  const el = document.getElementById('visit-counter');
  if(!el) return;

  const NAMESPACE = 'kyrtica.in';
  const KEY = 'homepage';
  const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  const lsFlagKey = `vc_${KEY}_date`;
  const last = localStorage.getItem(lsFlagKey);

  // Helper: GET current value (no increment)
  const readCount = () =>
    fetch(`https://api.countapi.xyz/get/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`)
      .then(r => r.json())
      .then(d => (d?.value ?? 0));

  // Helper: HIT increments by +1
  const hitCount = () =>
    fetch(`https://api.countapi.xyz/hit/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`)
      .then(r => r.json())
      .then(d => (d?.value ?? 0));

  // Update UI safely
  const setUI = (n) => { el.textContent = Number(n).toLocaleString(); };

  // Strategy: increment once per device per day; otherwise just read
  const go = async () => {
    try {
      let value;
      if (last === today) {
        value = await readCount();
      } else {
        value = await hitCount();
        localStorage.setItem(lsFlagKey, today);
      }
      setUI(value);
    } catch (e) {
      el.textContent = 'offline';
    }
  };

  go();
})();
</script>
