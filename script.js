document.addEventListener('DOMContentLoaded',()=>{const t=document.querySelector('.menu-toggle'),e=document.querySelector('.menu');t&&e&&t.addEventListener('click',()=>e.classList.toggle('show'))});

// Partner modal logic
(function(){
  const modal = document.getElementById('modal');
  if(!modal) return;

  const openButtons = document.querySelectorAll('.open-modal');
  const closeBtn = modal.querySelector('.modal-close');
  const cancelBtn = modal.querySelector('.modal-cancel');
  const form = document.getElementById('partner-form');
  const roleField = document.getElementById('role-field');
  const fieldsWrap = document.getElementById('dynamic-fields');
  const radios = document.querySelectorAll('input[name="role"]');

  const roleConfigs = {
    wholesaler: {
      title: 'Apply as Wholesaler',
      subtitle: 'Tell us about your catalog and dispatch capabilities.',
      fields: [
        { name:'business_name', ph:'Business Name', required:true },
        { name:'contact', ph:'Contact Number / WhatsApp', required:true },
        { name:'gst', ph:'GSTIN (optional)', required:false },
        { name:'city', ph:'City', required:false },
        { name:'categories', ph:'Categories (e.g., kitchenware, electronics)', required:false },
        { name:'moq', ph:'Typical MOQ (e.g., 20, 50)', required:false }
      ]
    },
    retailer: {
      title: 'Join as Retailer',
      subtitle: 'We’ll help you source and sync products.',
      fields: [
        { name:'store_name', ph:'Store Name', required:true },
        { name:'platform', ph:'Platform (Shopify / Woo / Dukaan)', required:true },
        { name:'email', ph:'Email', type:'email', required:true },
        { name:'city', ph:'City', required:false },
        { name:'categories', ph:'Interested Categories', required:false },
        { name:'monthly_orders', ph:'Estimated Monthly Orders', required:false }
      ]
    },
    logistics: {
      title: 'Partner as Logistics',
      subtitle: 'Share your coverage and services.',
      fields: [
        { name:'company', ph:'Company Name', required:true },
        { name:'contact', ph:'Contact Number', required:true },
        { name:'coverage', ph:'Coverage (states/cities)', required:false },
        { name:'services', ph:'Services (FTL / PTL / Courier)', required:false },
        { name:'gst', ph:'GSTIN (optional)', required:false }
      ]
    }
  };

  function openForRole(role){
    const cfg = roleConfigs[role];
    if(!cfg) return;
    document.getElementById('modal-title').textContent = cfg.title;
    document.getElementById('modal-subtitle').textContent = cfg.subtitle;
    roleField.value = role;
    fieldsWrap.innerHTML = '';
    cfg.fields.forEach(f => {
      const input = document.createElement('input');
      input.name = f.name;
      input.placeholder = f.ph;
      input.required = !!f.required;
      input.type = f.type || 'text';
      input.className = '';
      fieldsWrap.appendChild(input);
    });
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    // basic focus
    setTimeout(()=>{
      const first = fieldsWrap.querySelector('input');
      if(first) first.focus();
    }, 30);
  }

  function closeModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => openForRole(btn.dataset.role));
  });

  radios.forEach(r => {
    r.addEventListener('change', () => openForRole(r.value));
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{
    if(e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });
})();


// --- Validation, UTM tracking, and success toast for Partner form ---
(function(){
  const modal = document.getElementById('modal');
  const form = document.getElementById('partner-form');
  if(!modal || !form) return;

  const toastRoot = document.getElementById('toast-root');

  function showToast(msg, isError=false){
    if(!toastRoot) return alert(msg);
    const el = document.createElement('div');
    el.className = 'toast' + (isError ? ' error' : '');
    el.textContent = msg;
    toastRoot.appendChild(el);
    setTimeout(()=>{ el.remove(); }, 4200);
  }

  // Capture UTM params once and fill hidden inputs
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  utmKeys.forEach(k => {
    const v = params.get(k) || sessionStorage.getItem(k) || '';
    if(v) sessionStorage.setItem(k, v);
    const input = document.getElementById(k);
    if(input) input.value = v || '';
  });

  // Inline validation helpers
  function ensureHint(input){
    let hint = input.nextElementSibling;
    if(!hint || !hint.classList || !hint.classList.contains('error-hint')){
      hint = document.createElement('div');
      hint.className = 'error-hint';
      input.insertAdjacentElement('afterend', hint);
    }
    return hint;
  }
  function setError(input, msg){
    const hint = ensureHint(input);
    hint.textContent = msg;
    hint.style.display = 'block';
    input.classList.add('input-error');
  }
  function clearError(input){
    const hint = input.nextElementSibling;
    if(hint && hint.classList && hint.classList.contains('error-hint')){
      hint.style.display = 'none';
      hint.textContent = '';
    }
    input.classList.remove('input-error');
  }

  function validateInput(input){
    clearError(input);
    if(input.required && !input.value.trim()){
      setError(input, 'This field is required');
      return false;
    }
    if(input.type === 'email' && input.value){
      const ok = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(input.value);
      if(!ok){ setError(input, 'Enter a valid email'); return false; }
    }
    if(input.name === 'contact' || input.name === 'phone'){
      if(input.value && !/^[0-9+\\-()\\s]{7,15}$/.test(input.value)){
        setError(input, 'Enter a valid phone number'); return false;
      }
    }
    return true;
  }

  // Validate on blur
  form.addEventListener('focusout', (e)=>{
    if(e.target && e.target.tagName === 'INPUT') validateInput(e.target);
  });

  // Intercept submit: validate required inputs, submit via fetch for smooth UX
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const inputs = form.querySelectorAll('input');
    let ok = true;
    inputs.forEach(inp => { if(!validateInput(inp)) ok = false; });
    if(!ok){ showToast('Please fix the highlighted fields.', true); return; }

    try{
      const fd = new FormData(form);
      // Include a timestamp and current page path for context
      fd.append('submitted_at', new Date().toISOString());
      fd.append('page', location.pathname + location.search);

      const resp = await fetch(form.action, { method:'POST', body:fd, headers: { 'Accept':'application/json' } });
      if(resp.ok){
        showToast('Thanks! Your application has been submitted.');
        form.reset();
        // Close modal after a short delay
        setTimeout(()=>{
          const close = modal.querySelector('.modal-close');
          if(close) close.click();
        }, 600);
      }else{
        showToast('Submission failed. Please try again.', true);
      }
    }catch(err){
      showToast('Network error. Please try again.', true);
    }
  });

  // When role changes, prefill hidden role input (already handled in opener, but ensure here)
  const roleField = document.getElementById('role-field');
  document.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener('change', ()=>{
      if(roleField) roleField.value = radio.value;
    });
  });
})();
