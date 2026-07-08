// Apex Stock - Transactions Page Controller

let txDirection = "STOCK_IN";

document.addEventListener("DOMContentLoaded", () => {
  populateSelectors();
  renderLedger();
  lucide.createIcons();
});

// --- POPULATE FORM SELECTORS ---
function populateSelectors() {
  const products = db.getProducts();
  const warehouses = db.getWarehouses();

  const prodSelect = document.getElementById("tx-product");
  prodSelect.innerHTML = '<option value="">Choose item...</option>';
  products.forEach(p => {
    prodSelect.innerHTML += `<option value="${p.id}">${p.name} (SKU: ${p.sku})</option>`;
  });

  const whSelect = document.getElementById("tx-warehouse");
  whSelect.innerHTML = '<option value="">Global Allocation</option>';
  warehouses.forEach(w => {
    whSelect.innerHTML += `<option value="${w.id}">${w.name}</option>`;
  });
}

// --- SET TRANSACTION DIRECTION ---
function setTxDirection(dir) {
  txDirection = dir;
  const btnIn = document.getElementById("tx-btn-in");
  const btnOut = document.getElementById("tx-btn-out");

  if (dir === "STOCK_IN") {
    btnIn.className = "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-md";
    btnOut.className = "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800";
  } else {
    btnIn.className = "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all text-slate-500 hover:text-slate-800";
    btnOut.className = "flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow-md";
  }
}

// --- COMMIT LOGISTICS TRANSACTION ---
function handleTransactionSubmit(e) {
  e.preventDefault();
  const prodId = document.getElementById("tx-product").value;
  const whId = document.getElementById("tx-warehouse").value;
  const qty = parseInt(document.getElementById("tx-qty").value);
  const reason = document.getElementById("tx-reason").value;

  if (!prodId) {
    alert("Please select a product.");
    return;
  }
  if (qty <= 0) {
    alert("Quantity must be greater than zero.");
    return;
  }

  const products = db.getProducts();
  const product = products.find(p => p.id === prodId);
  if (!product) return;

  // Validation for stock outbound adjustments
  if (txDirection === "STOCK_OUT") {
    if (product.quantity < qty) {
      alert(`Insufficient stock. Available global stock is only ${product.quantity} units.`);
      return;
    }
    
    // Check warehouse-specific quantities if target warehouse is defined
    if (whId) {
      const txs = db.getTransactions();
      let whStock = 0;
      txs.forEach(tx => {
        if (tx.productId === prodId && tx.warehouseId === whId) {
          whStock += tx.type === "STOCK_IN" ? tx.quantity : -tx.quantity;
        }
      });

      if (whStock < qty) {
        alert(`Insufficient stock in this warehouse. Available stock here is only ${whStock} units.`);
        return;
      }
    }
  }

  // Update Global Product Quantity
  if (txDirection === "STOCK_IN") {
    product.quantity += qty;
  } else {
    product.quantity -= qty;
  }
  db.saveProducts(products);

  // Append new Transaction row
  const txs = db.getTransactions();
  const newTx = {
    id: "tx_" + Date.now(),
    type: txDirection,
    productId: prodId,
    quantity: qty,
    warehouseId: whId || "",
    reason: reason || (txDirection === "STOCK_IN" ? "Manual Restock" : "Manual Dispatch"),
    date: new Date().toISOString()
  };
  txs.push(newTx);
  db.saveTransactions(txs);

  // Reset input parameters
  document.getElementById("tx-qty").value = 1;
  document.getElementById("tx-reason").value = "";
  populateSelectors();
  renderLedger();
}

// --- RENDER COMPLETE TRANSACTION LEDGER ---
function renderLedger() {
  const products = db.getProducts();
  const warehouses = db.getWarehouses();
  const txs = db.getTransactions();

  const ledgerTableBody = document.getElementById("ledger-table-body");
  ledgerTableBody.innerHTML = "";

  // Sort logs by newest first
  const sortedTxs = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (sortedTxs.length > 0) {
    sortedTxs.forEach(tx => {
      const prod = products.find(p => p.id === tx.productId);
      const wh = warehouses.find(w => w.id === tx.warehouseId);
      const formattedDate = new Date(tx.date).toLocaleDateString() + " " + new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      ledgerTableBody.innerHTML += `
        <tr class="hover:bg-slate-100/30 transition-colors">
          <td class="p-3 text-slate-400 whitespace-nowrap">${formattedDate}</td>
          <td class="p-3">
            <span class="inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
              tx.type === 'STOCK_IN' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'
            }">
              ${tx.type === 'STOCK_IN' ? 'In' : 'Out'}
            </span>
          </td>
          <td class="p-3">
            <div class="font-semibold text-slate-800">${prod ? prod.name : 'Deleted Product'}</div>
            <div class="text-[10px] text-slate-400 font-mono mt-0.5">${prod ? prod.sku : 'N/A'}</div>
          </td>
          <td class="p-3 text-right font-bold text-sm ${tx.type === 'STOCK_IN' ? 'text-indigo-600' : 'text-emerald-600'}">
            ${tx.type === 'STOCK_IN' ? '+' : '-'}${tx.quantity}
          </td>
          <td class="p-3 text-slate-600 text-xs">${wh ? wh.name : 'Global'}</td>
          <td class="p-3 text-slate-500 text-xs">${tx.reason || '—'}</td>
        </tr>
      `;
    });
  } else {
    ledgerTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="p-8 text-center text-slate-400 font-medium">Ledger is empty.</td>
      </tr>
    `;
  }
}
