// Apex Stock - Suppliers Page Controller

document.addEventListener("DOMContentLoaded", () => {
  renderSuppliers();
  lucide.createIcons();
});

// --- RENDER SUPPLIERS GRID ---
function renderSuppliers() {
  const suppliers = db.getSuppliers();
  const products = db.getProducts();
  const suppliersGrid = document.getElementById("suppliers-grid");
  suppliersGrid.innerHTML = "";

  if (suppliers.length > 0) {
    suppliers.forEach(supp => {
      const linkedProductsCount = products.filter(p => p.supplierId === supp.id).length;
      
      suppliersGrid.innerHTML += `
        <div class="glass-panel border border-slate-200 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300/80 transition-all duration-300">
          <div class="space-y-4">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
                  <i data-lucide="truck" class="w-5.5 h-5.5"></i>
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 text-base leading-snug">${supp.name}</h4>
                  <span class="text-[10px] text-indigo-600 font-semibold tracking-wider uppercase block mt-0.5">PARTNER VENDOR</span>
                </div>
              </div>
              <button onclick="deleteSupplier('${supp.id}')" class="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-colors">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            
            <div class="space-y-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              ${supp.person ? `<div class="flex items-center gap-2"><i data-lucide="user" class="w-4 h-4 text-slate-400"></i><span>${supp.person}</span></div>` : ''}
              <div class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4 text-slate-400"></i><a href="mailto:${supp.email}" class="hover:text-indigo-600 transition-colors truncate">${supp.email}</a></div>
              <div class="flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4 text-slate-400"></i><a href="tel:${supp.phone}" class="hover:text-indigo-600 transition-colors">${supp.phone}</a></div>
              ${supp.address ? `<div class="flex items-start gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-slate-400 shrink-0 mt-0.5"></i><span class="text-slate-500 leading-relaxed">${supp.address}</span></div>` : ''}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
            <div class="flex items-center gap-1">
              <i data-lucide="boxes" class="w-3.5 h-3.5"></i>
              <span>Supplies ${linkedProductsCount} catalog item(s)</span>
            </div>
          </div>
        </div>
      `;
    });
  } else {
    suppliersGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-center text-slate-400">
        <i data-lucide="truck" class="w-10 h-10 mb-3 text-slate-350"></i>
        <span class="font-semibold text-slate-400 text-sm">No suppliers registered</span>
      </div>
    `;
  }
  lucide.createIcons();
}

// --- MODAL CONTROLS ---
function openSupplierModal() {
  const modal = document.getElementById("supplier-modal");
  const form = document.getElementById("supplier-form");
  form.reset();
  modal.classList.remove("hidden");
}

function closeSupplierModal() {
  const modal = document.getElementById("supplier-modal");
  modal.classList.add("hidden");
}

// --- ADD SUPPLIER SUBMIT ---
function handleSupplierSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("form-supplier-name").value;
  const person = document.getElementById("form-supplier-person").value;
  const email = document.getElementById("form-supplier-email").value;
  const phone = document.getElementById("form-supplier-phone").value;
  const address = document.getElementById("form-supplier-address").value;

  const suppliers = db.getSuppliers();
  const newSupplier = {
    id: "supp_" + Date.now(),
    name,
    person,
    email,
    phone,
    address
  };

  suppliers.push(newSupplier);
  db.saveSuppliers(suppliers);
  
  closeSupplierModal();
  renderSuppliers();
}

// --- DELETE SUPPLIER ---
function deleteSupplier(id) {
  if (confirm("Are you sure you want to remove this supplier? Linked products will remain in the catalog.")) {
    const suppliers = db.getSuppliers();
    const filtered = suppliers.filter(s => s.id !== id);
    db.saveSuppliers(filtered);
    renderSuppliers();
  }
}
