// ===== Kyrtica Global Script =====
document.addEventListener('DOMContentLoaded', () => {
  /* ==============================
   * 1) Mobile Menu Toggle
   * ============================== */
  (function () {
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => menu.classList.toggle('show'));
    }
  })();

  /* ==============================
   * 2) Partner Modal + Dynamic Fields
   * ============================== */
  (function () {
    const modal = document.getElementById('modal');
    const form = document.getElementById('partner-form');
    if (!modal || !form) return;

    const openButtons = document.querySelectorAll('.open-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const cancelBtn = modal.querySelector('.modal-cancel');
    const roleField = document.getElementById('role-field');
    const fieldsWrap = document.getElementById('dynamic-fields');

    // --- Field presets ---
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
      { name:'gst', ph:'GSTIN', required:false },
      { name:'state', type:'select', ph:'State', required:true, options: STATES },
      { name:'city', ph:'City', required:true },
      { name:'pincode', ph:'Pincode (6 digits)', required:true },
      { name:'address', type:'textarea', ph:'Full Address (Door No, Street, Area)', required:true, full:true }
    ];

    // Expose to window for safety if other scripts reference it
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
    window.roleConfigs = roleConfigs;

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
      document.getElementById('modal-title').textContent = cfg.title;
      document.getElementById('modal-subtitle').textContent = cfg.subtitle;
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
    const radios = document.querySelectorAll('input[name="role"]');
    radios.forEach(r => r.addEventListener('change', () => openForRole(r.value)));

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
  })();

  /* ==============================
   * 3) Toasts, UTM Capture, Validation & Submit
   * ============================== */
  (function () {
    const modal = document.getElementById('modal');
    const form = document.getElementById('partner-form');
    if (!modal || !form) return;

    const toastRoot = document.getElementById('toast-root');

    function showToast(msg, isError = false) {
      if (!toastRoot) {
        alert(msg);
        return;
      }
      const el = document.createElement('div');
      el.className = 'toast' + (isError ? ' error' : '');
      el.textContent = msg;
      toastRoot.appendChild(el);
      setTimeout(() => { el.remove(); }, 4200);
    }

    // UTM capture (preserve in sessionStorage and fill hidden inputs if present)
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
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
        hint.style.display = 'none';
        hint.textContent = '';
      }
      input.classList.remove('input-error');
    }
    function validateInput(input) {
      clearError(input);
      const v = (input.value || '').trim();
      const n = input.name;

      if (input.required && !v) {
        setError(input, 'This field is required');
        return false;
      }
      if (n === 'email' && v) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
          setError(input, 'Enter a valid email');
          return false;
        }
      }
      if ((n === 'contact' || n === 'phone') && v) {
        // Strict 10-digit Indian mobile
        if (!/^[6-9]\d{9}$/.test(v)) {
          setError(input, 'Enter a valid 10-digit mobile');
          return false;
        }
      }
      if (n === 'pincode' && v) {
        if (!/^\d{6}$/.test(v)) {
          setError(input, 'Enter a valid 6-digit pincode');
          return false;
        }
      }
      if (n === 'gst' && v) {
        if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.toUpperCase())) {
          setError(input, 'GSTIN format looks invalid');
          return false;
        }
      }
      return true;
    }

    // Validate on blur
    form.addEventListener('focusout', (e) => {
      const t = e.target;
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) validateInput(t);
    });

    // Keep hidden role in sync if radios exist
    const roleField = document.getElementById('role-field');
    document.querySelectorAll('input[name="role"]').forEach(radio => {
      radio.addEventListener('change', () => {
        if (roleField) roleField.value = radio.value;
      });
    });

    // Submit with fetch
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

        const resp = await fetch(form.action, {
          method: 'POST',
          body: fd,
          headers: { 'Accept': 'application/json' }
        });

        if (resp.ok) {
          showToast('Thanks! Your application has been submitted.');
          form.reset();
          setTimeout(() => {
            const close = modal.querySelector('.modal-close');
            if (close) close.click();
          }, 600);
        } else {
          showToast('Submission failed. Please try again.', true);
        }
      } catch (err) {
        showToast('Network error. Please try again.', true);
      }
    });
  })();

  /* ==============================
   * 4) Cards: Reveal on Scroll
   * ============================== */
  (function () {
    const cards = document.querySelectorAll('.card');
    if (!cards.length) return;

    // If IntersectionObserver unsupported, show immediately
    if (!('IntersectionObserver' in window)) {
      cards.forEach(c => c.classList.add('in-view'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    cards.forEach(c => io.observe(c));
  })();
});
