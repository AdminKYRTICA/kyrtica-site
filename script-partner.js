<script>
(() => {
  // Role → form definition
  const formDefs = {
    manufacturer: {
      title: "Manufacturer Application",
      fields: [
        {label:"Business Name", name:"business", required:true},
        {label:"Contact Person", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"GSTIN", name:"gstin"},
        {label:"Factory Address", name:"address"},
        {label:"Primary Categories (comma-separated)", name:"categories"},
        {label:"Production Capacity / Month", name:"capacity"},
        {label:"Minimum Order Quantity (MOQ)", name:"moq"},
        {label:"Website (optional)", name:"website"},
        {label:"Catalogue Upload (CSV, XLSX, PDF, JPG, PNG)", name:"catalog", type:"file", accept:".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    },
    wholesaler: {
      title: "Wholesaler / Distributor Application",
      fields: [
        {label:"Business Name", name:"business", required:true},
        {label:"Contact Person", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"GSTIN", name:"gstin"},
        {label:"Warehouse City", name:"city"},
        {label:"Brands / Lines Carried", name:"brands"},
        {label:"Minimum Order Quantity (MOQ)", name:"moq"},
        {label:"Average Dispatch Time (hours)", name:"dispatch_hours"},
        {label:"Catalogue Upload (CSV, XLSX, PDF, JPG, PNG)", name:"catalog", type:"file", accept:".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    },
    retail: {
      title: "Retail Business Entity Application",
      fields: [
        {label:"Business/Store Name", name:"business", required:true},
        {label:"Owner Name", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"City", name:"city"},
        {label:"Website / Store Link", name:"website"},
        {label:"Interested Categories", name:"categories"},
        {label:"Estimated Monthly Order Volume", name:"mov"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    },
    logistics: {
      title: "Logistics / 3PL Application",
      fields: [
        {label:"Company Name", name:"business", required:true},
        {label:"Contact Person", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"Service Regions (States/Pin prefixes)", name:"regions"},
        {label:"Services (first-mile, last-mile, warehousing, COD, etc.)", name:"services"},
        {label:"Average TAT (hours)", name:"tat"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    },
    legal: {
      title: "Legal Consultants Application",
      fields: [
        {label:"Firm/Consultant Name", name:"business", required:true},
        {label:"Contact Person", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"Services Offered (MSME, GST, IEC, Trademark)", name:"services"},
        {label:"Cities Served", name:"cities"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    },
    ca: {
      title: "Chartered Accountants Application",
      fields: [
        {label:"Firm Name", name:"business", required:true},
        {label:"Contact Person", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"Compliance & Filings (GST, IT, Audit)", name:"services"},
        {label:"Cities Served", name:"cities"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    },
    service: {
      title: "Other Service Provider Application",
      fields: [
        {label:"Business Name", name:"business", required:true},
        {label:"Contact Person", name:"person", required:true},
        {label:"Email", name:"email", type:"email", required:true},
        {label:"Phone", name:"phone", required:true},
        {label:"Service Category (Packaging, Design, IT, Finance, etc.)", name:"category"},
        {label:"Cities Served", name:"cities"},
        {label:"Notes", name:"notes", type:"textarea"}
      ]
    }
  };

  const tiles = document.querySelectorAll(".role-tile");
  const formContainer = document.getElementById("form-container");
  const toast = document.getElementById("toast");

  function fieldEl(f) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<label>${f.label}</label>`;
    const el = f.type === "textarea" ? document.createElement("textarea") : document.createElement("input");
    el.className = "input";
    el.name = f.name;
    el.required = !!f.required;
    if (f.type && f.type !== "textarea") el.type = f.type;
    if (f.accept) el.accept = f.accept;
    if (f.type === "textarea") el.rows = 4;
    wrap.appendChild(el);
    return wrap;
  }

  function renderForm(role) {
    const def = formDefs[role];
    if (!def) return;
    formContainer.innerHTML = "";

    const left = document.createElement("div");
    left.className = "k-card";
    left.innerHTML = `<div class="k-topbar"></div><h3>${def.title}</h3>`;

    const form = document.createElement("form");
    form.id = "partner-form";
    form.method = "post";
    form.enctype = "multipart/form-data";
    form.action = "#"; // TODO: change to your backend endpoint

    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.gap = "12px";
    grid.style.gridTemplateColumns = "1fr 1fr";

    def.fields.forEach(f => {
      const node = fieldEl(f);
      if (f.type === "textarea" || /Address|Brands|Services|Notes/i.test(f.label)) {
        node.style.gridColumn = "1 / -1";
      }
      grid.appendChild(node);
    });

    form.appendChild(grid);
    left.appendChild(form);
    formContainer.appendChild(left);

    const right = document.createElement("div");
    right.className = "k-card";
    right.innerHTML = `<div class="k-topbar"></div>
      <p class="k-sub">Upload your catalogue if available (CSV/XLSX/PDF/Images). We’ll verify and get back to you.</p>
      <button class="btn btn-primary" type="submit" form="partner-form">Submit</button>`;
    formContainer.appendChild(right);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Collect payload (demo only; replace with fetch to your API)
      const data = new FormData(form);
      console.log("Submitting role:", role);
      for (const [k, v] of data.entries()) console.log(k, v);
      toast.style.display = "block";
      setTimeout(() => (toast.style.display = "none"), 3000);
    });
  }

  tiles.forEach(btn => {
    btn.addEventListener("click", () => {
      tiles.forEach(t => t.classList.remove("active"));
      btn.classList.add("active");
      renderForm(btn.dataset.role);
      document.getElementById("apply").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
</script>
