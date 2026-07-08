// Apex Stock - Main JavaScript Logic Engine

// ==========================================
// 1. SEED DATABASE ON FIRST LOAD
// ==========================================
const SEED_PRODUCTS = [
  { id: "p1", name: "Copper Wire Coils", category: "Raw Materials", price: 45.00, quantity: 150, minStockLevel: 20 },
  { id: "p2", name: "Alpha Microprocessors", category: "Electronics", price: 120.00, quantity: 5, minStockLevel: 10 },
  { id: "p3", name: "Corrugated Shipping Boxes", category: "Packaging", price: 1.50, quantity: 500, minStockLevel: 50 }
];

const SEED_TRANSACTIONS = [
  { id: "t1", type: "STOCK_IN", productId: "p1", quantity: 150, reason: "Initial registration", date: new Date(Date.now() - 3*24*60*60*1000).toISOString() },
  { id: "t2", type: "STOCK_IN", productId: "p2", quantity: 10, reason: "Initial registration", date: new Date(Date.now() - 2*24*60*60*1000).toISOString() },
  { id: "t3", type: "STOCK_OUT", productId: "p2", quantity: 5, reason: "Client dispatch", date: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
  { id: "t4", type: "STOCK_IN", productId: "p3", quantity: 500, reason: "Initial registration", date: new Date().toISOString() }
];

// LocalStorage Database Helpers
function getProducts() {
  if (!localStorage.getItem("simple_products")) {
    localStorage.setItem("simple_products", JSON.stringify(SEED_PRODUCTS));
  }
  return JSON.parse(localStorage.getItem("simple_products"));
}

function saveProducts(data) {
  localStorage.setItem("simple_products", JSON.stringify(data));
}

function getTransactions() {
  if (!localStorage.getItem("simple_transactions")) {
    localStorage.setItem("simple_transactions", JSON.stringify(SEED_TRANSACTIONS));
  }
  return JSON.parse(localStorage.getItem("simple_transactions"));
}

function saveTransactions(data) {
  localStorage.setItem("simple_transactions", JSON.stringify(data));
}

// --- TAB SWITCHER LOGIC ---
function switchTab(tabId) {
  // Toggle active views
  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');

  // Update Nav Buttons styles
  document.querySelectorAll('#sidebar-nav button').forEach(btn => {
    btn.className = "nav-btn flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-slate-400 hover:bg-slate-900/50 hover:text-slate-200";
  });
  document.getElementById('nav-' + tabId).className = "nav-btn flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all bg-indigo-600 text-white shadow-md font-medium";

  // Re-render the active view
  renderAll();
}

// --- VIEW RENDERING ENGINE ---
function renderAll() {
  const products = getProducts();
  const txs = getTransactions();

  // 1. Render Dashboard
  const lowStockList = products.filter(p => p.quantity <= p.minStockLevel);
  
  document.getElementById("stat-products").innerText = products.length;
  document.getElementById("stat-stock").innerText = products.reduce((acc, c) => acc + c.quantity, 0);
  document.getElementById("stat-low-stock").innerText = lowStockList.length;

  // Warning styling on Low Stock card
  const lowStockCard = document.getElementById("stat-low-stock-card");
  const lowStockIcon = document.getElementById("stat-low-stock-icon");
  if (lowStockList.length > 0) {
    lowStockCard.className = "glass-panel p-5 rounded-2xl flex items-center justify-between border-rose-500/20 pulse-warning";
    lowStockIcon.className = "p-2.5 rounded-lg bg-rose-500/10 text-rose-400";
  } else {
    lowStockCard.className = "glass-panel p-5 rounded-2xl flex items-center justify-between border-slate-900";
    lowStockIcon.className = "p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400";
  }

  // Render Low Stock List on Dashboard
  const lowStockContainer = document.getElementById("dash-low-stock-list");
  lowStockContainer.innerHTML = "";
  if (lowStockList.length > 0) {
    lowStockList.forEach(p => {
      lowStockContainer.innerHTML += `
        <div class="flex justify-between items-center bg-slate-950/45 border border-slate-900 p-2.5 rounded-xl text-xs">
          <span class="font-medium text-slate-200">${p.name}</span>
          <span class="font-bold text-rose-400">${p.quantity} units left</span>
        </div>
      `;
    });
  } else {
    lowStockContainer.innerHTML = `
      <div class="h-full flex items-center justify-center text-slate-600 text-xs py-10">No stock warnings.</div>
    `;
  }

  // Render Recent activity
  const recentTxContainer = document.getElementById("dash-recent-tx");
  recentTxContainer.innerHTML = "";
  const sortedTxs = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);
  if (sortedTxs.length > 0) {
    sortedTxs.forEach(t => {
      const prod = products.find(p => p.id === t.productId);
      const dateStr = new Date(t.date).toLocaleDateString();
      recentTxContainer.innerHTML += `
        <tr>
          <td class="p-3 text-slate-500">${dateStr}</td>
          <td class="p-3 font-semibold ${t.type === 'STOCK_IN' ? 'text-indigo-400' : 'text-emerald-400'}">${t.type === 'STOCK_IN' ? 'In' : 'Out'}</td>
          <td class="p-3 text-slate-200">${prod ? prod.name : 'Deleted Product'}</td>
          <td class="p-3 text-right font-bold text-slate-300">${t.quantity}</td>
        </tr>
      `;
    });
  } else {
    recentTxContainer.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-500">No logs.</td></tr>`;
  }

  // 2. Render Products Table
  const productsTable = document.getElementById("products-table-body");
  productsTable.innerHTML = "";
  products.forEach(p => {
    const isLow = p.quantity <= p.minStockLevel;
    productsTable.innerHTML += `
      <tr class="hover:bg-slate-900/10">
        <td class="p-3 font-medium text-slate-200">
          <div>${p.name}</div>
          <div class="text-[10px] text-slate-500 font-mono mt-0.5">${p.id.toUpperCase()}</div>
        </td>
        <td class="p-3 text-slate-400">${p.category}</td>
        <td class="p-3 text-right text-slate-300">$${p.price.toFixed(2)}</td>
        <td class="p-3 text-right font-bold ${isLow ? 'text-rose-400' : 'text-slate-200'}">${p.quantity}</td>
        <td class="p-3 text-right">
          <button onclick="deleteProduct('${p.id}')" class="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-950 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </td>
      </tr>
    `;
  });

  // 3. Render Stock adjustment selectors and ledger table
  const adjProductSelect = document.getElementById("adj-product");
  adjProductSelect.innerHTML = '<option value="">Choose product...</option>';
  products.forEach(p => {
    adjProductSelect.innerHTML += `<option value="${p.id}">${p.name} (Qty: ${p.quantity})</option>`;
  });

  const ledgerTable = document.getElementById("ledger-table-body");
  ledgerTable.innerHTML = "";
  const fullSortedTxs = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));
  if (fullSortedTxs.length > 0) {
    fullSortedTxs.forEach(t => {
      const prod = products.find(p => p.id === t.productId);
      const dateStr = new Date(t.date).toLocaleDateString() + " " + new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      ledgerTable.innerHTML += `
        <tr class="hover:bg-slate-900/10">
          <td class="p-3 text-slate-500">${dateStr}</td>
          <td class="p-3 font-bold text-[10px] ${t.type === 'STOCK_IN' ? 'text-indigo-400' : 'text-emerald-400'}">${t.type}</td>
          <td class="p-3 font-medium text-slate-200">${prod ? prod.name : 'Deleted Product'}</td>
          <td class="p-3 text-right font-bold ${t.type === 'STOCK_IN' ? 'text-indigo-400' : 'text-emerald-400'}">${t.type === 'STOCK_IN' ? '+' : '-'}${t.quantity}</td>
          <td class="p-3 text-slate-400">${t.reason || 'Manual log'}</td>
        </tr>
      `;
    });
  } else {
    ledgerTable.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-600">Ledger statement is empty.</td></tr>`;
  }

  // Re-trigger Lucide Icons
  lucide.createIcons();
}

// --- FORM SUBMIT HANDLERS ---

// 1. Add Product
function handleProductAdd(e) {
  e.preventDefault();
  const name = document.getElementById("prod-name").value;
  const category = document.getElementById("prod-category").value;
  const price = parseFloat(document.getElementById("prod-price").value);
  const qty = parseInt(document.getElementById("prod-qty").value);
  const minStock = parseInt(document.getElementById("prod-min").value);

  const products = getProducts();
  const newProduct = {
    id: "p_" + Date.now().toString().slice(-4), // Simple 4-char ID
    name,
    category,
    price,
    quantity: qty,
    minStockLevel: minStock
  };
  products.push(newProduct);
  saveProducts(products);

  // Log stock-in transaction
  if (qty > 0) {
    const txs = getTransactions();
    txs.push({
      id: "t_" + Date.now(),
      type: "STOCK_IN",
      productId: newProduct.id,
      quantity: qty,
      reason: "Initial registration",
      date: new Date().toISOString()
    });
    saveTransactions(txs);
  }

  // Reset form inputs
  document.getElementById("prod-name").value = "";
  document.getElementById("prod-price").value = "";
  document.getElementById("prod-qty").value = "";
  document.getElementById("prod-min").value = "10";

  renderAll();
}

// 2. Adjust Stock (In/Out)
function handleStockAdjust(e) {
  e.preventDefault();
  const prodId = document.getElementById("adj-product").value;
  const type = document.getElementById("adj-type").value;
  const qty = parseInt(document.getElementById("adj-qty").value);
  const reason = document.getElementById("adj-reason").value;

  if (!prodId) {
    alert("Please select a product.");
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === prodId);
  if (!product) return;

  // Validate stock out
  if (type === "STOCK_OUT" && product.quantity < qty) {
    alert(`Insufficient stock. Only ${product.quantity} units available.`);
    return;
  }

  // Update quantity
  if (type === "STOCK_IN") {
    product.quantity += qty;
  } else {
    product.quantity -= qty;
  }
  saveProducts(products);

  // Log transaction
  const txs = getTransactions();
  txs.push({
    id: "t_" + Date.now(),
    type,
    productId: prodId,
    quantity: qty,
    reason: reason || (type === "STOCK_IN" ? "Manual Restock" : "Sales Dispatch"),
    date: new Date().toISOString()
  });
  saveTransactions(txs);

  // Reset input fields
  document.getElementById("adj-qty").value = "1";
  document.getElementById("adj-reason").value = "";

  renderAll();
}

// 3. Delete Product
function deleteProduct(id) {
  if (confirm("Are you sure you want to delete this product? Transaction logs will remain.")) {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
    renderAll();
  }
}

// Start rendering on window load
window.onload = () => {
  renderAll();
};
