// Apex Stock - Products Page Controller

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  populateSupplierSelector();
  lucide.createIcons();
});

// --- RENDER PRODUCTS CATALOG TABLE ---
function renderProducts() {
  const products = db.getProducts();
  const suppliers = db.getSuppliers();
  
  const searchInput = document.getElementById("product-search").value.toLowerCase();
  const categoryFilter = document.getElementById("product-filter-category").value;
  const stockFilter = document.getElementById("product-filter-stock").value;

  const tableBody = document.getElementById("products-table-body");
  tableBody.innerHTML = "";

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchInput) ||
                          p.sku.toLowerCase().includes(searchInput) ||
                          (p.barcode && p.barcode.includes(searchInput));
    const matchesCategory = categoryFilter === "" || p.category === categoryFilter;
    const matchesStock = stockFilter === "all" || (stockFilter === "low" && p.quantity <= p.minStockLevel);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  if (filteredProducts.length > 0) {
    filteredProducts.forEach(p => {
      const isLow = p.quantity <= p.minStockLevel;
      const supp = suppliers.find(s => s.id === p.supplierId);
      
      tableBody.innerHTML += `
        <tr class="hover:bg-slate-100/30 transition-colors">
          <td class="p-4">
            <div class="font-bold text-slate-800">${p.name}</div>
            <div class="text-xs text-slate-400 font-mono mt-0.5">${p.sku}</div>
          </td>
          <td class="p-4 text-slate-600 text-xs">${p.category}</td>
          <td class="p-4 text-right font-medium text-slate-700">$${parseFloat(p.price).toFixed(2)}</td>
          <td class="p-4 text-right">
            <div class="font-bold ${isLow ? 'text-rose-500' : 'text-slate-700'}">${p.quantity}</div>
            ${isLow ? '<span class="inline-flex text-[8px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded mt-1 animate-pulse">LOW STOCK</span>' : ''}
          </td>
          <td class="p-4 text-xs text-slate-500">
            ${p.expiryDate ? `<div class="flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-400"></i><span>${p.expiryDate}</span></div>` : '<span class="text-slate-400">—</span>'}
          </td>
          <td class="p-4 text-slate-500 text-xs">${supp ? supp.name : 'N/A'}</td>
          <td class="p-4">
            <div class="flex flex-col items-center gap-1">
              <div class="flex gap-[1px] h-5 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <div class="w-[1px] h-full bg-slate-500"></div>
                <div class="w-[2px] h-full bg-slate-500"></div>
                <div class="w-[1px] h-full bg-slate-500"></div>
                <div class="w-[3px] h-full bg-slate-500"></div>
                <div class="w-[1px] h-full bg-slate-500"></div>
                <div class="w-[2px] h-full bg-slate-500"></div>
              </div>
              <span class="text-[9px] font-mono text-slate-400">${p.barcode || 'NO BARCODE'}</span>
            </div>
          </td>
          <td class="p-4 text-right">
            <button onclick="deleteProduct('${p.id}')" class="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-100 rounded-lg transition-colors" title="Delete product">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } else {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="p-8 text-center text-slate-400 font-medium">No products found matching filters.</td>
      </tr>
    `;
  }
  lucide.createIcons();
}

// --- POPULATE SUPPLIER SELECTOR ---
function populateSupplierSelector() {
  const select = document.getElementById("form-product-supplier");
  if (!select) return;
  
  select.innerHTML = '<option value="">Select Supplier</option>';
  db.getSuppliers().forEach(s => {
    select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
  });
}

// --- MODAL CONTROLS ---
function openProductModal() {
  const modal = document.getElementById("product-modal");
  const form = document.getElementById("product-form");
  form.reset();
  populateSupplierSelector();
  modal.classList.remove("hidden");
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  modal.classList.add("hidden");
}

// --- ADD PRODUCT SUBMIT ---
function handleProductSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("form-product-name").value;
  const category = document.getElementById("form-product-category").value;
  const price = parseFloat(document.getElementById("form-product-price").value);
  const qty = parseInt(document.getElementById("form-product-qty").value);
  const minStock = parseInt(document.getElementById("form-product-min").value);
  const barcode = document.getElementById("form-product-barcode").value;
  const expiry = document.getElementById("form-product-expiry").value;
  const batch = document.getElementById("form-product-batch").value;
  const supplierId = document.getElementById("form-product-supplier").value;

  const products = db.getProducts();

  const cleanCategory = category.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
  const sku = `${cleanCategory}-${cleanName}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newProduct = {
    id: "prod_" + Date.now(),
    name,
    sku,
    category,
    price,
    quantity: qty,
    minStockLevel: minStock,
    barcode: barcode || Math.floor(Math.random() * 1000000000000).toString(),
    expiryDate: expiry,
    batchNumber: batch,
    supplierId
  };

  products.push(newProduct);
  db.saveProducts(products);

  if (qty > 0) {
    const txs = db.getTransactions();
    txs.push({
      id: "tx_" + Date.now(),
      type: "STOCK_IN",
      productId: newProduct.id,
      quantity: qty,
      warehouseId: "",
      reason: "Initial stock registration",
      date: new Date().toISOString()
    });
    db.saveTransactions(txs);
  }

  closeProductModal();
  renderProducts();
}

// --- DELETE PRODUCT ---
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product? All transaction history remains logged.")) {
    const products = db.getProducts();
    const filtered = products.filter(p => p.id !== id);
    db.saveProducts(filtered);
    renderProducts();
  }
}
