// Apex Stock - Warehouses Page Controller

let selectedWarehouseId = "";

document.addEventListener("DOMContentLoaded", () => {
  renderWarehouses();
  lucide.createIcons();
});

// --- RENDER WAREHOUSE LIST ---
function renderWarehouses() {
  const warehouses = db.getWarehouses();
  const warehousesGrid = document.getElementById("warehouses-grid");
  warehousesGrid.innerHTML = "";

  if (warehouses.length > 0) {
    // Default selection
    if (!selectedWarehouseId) {
      selectedWarehouseId = warehouses[0].id;
    }

    warehouses.forEach(wh => {
      const isSelected = selectedWarehouseId === wh.id;
      warehousesGrid.innerHTML += `
        <div onclick="selectWarehouse('${wh.id}')" class="cursor-pointer border p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 relative group flex flex-col justify-between ${
          isSelected ? 'bg-indigo-50 border-indigo-500 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
        }">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center border ${
                isSelected ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-50 text-slate-500 border-slate-200'
              }">
                <i data-lucide="warehouse" class="w-5.5 h-5.5"></i>
              </div>
              <button onclick="event.stopPropagation(); deleteWarehouse('${wh.id}')" class="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
              </button>
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-base">${wh.name}</h4>
              <div class="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 shrink-0"></i>
                <span class="truncate">${wh.location}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    renderWarehouseInspector();
  } else {
    selectedWarehouseId = "";
    warehousesGrid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-center text-slate-450">
        <i data-lucide="warehouse" class="w-10 h-10 mb-3 text-slate-300"></i>
        <span class="font-semibold text-slate-400 text-sm">No warehouses registered</span>
      </div>
    `;
    document.getElementById("warehouse-inspector").classList.add("hidden");
  }
  lucide.createIcons();
}

function selectWarehouse(id) {
  selectedWarehouseId = id;
  renderWarehouses();
}

// --- RENDER WAREHOUSE STOCK INSPECTOR ---
function renderWarehouseInspector() {
  const warehouses = db.getWarehouses();
  const products = db.getProducts();
  const txs = db.getTransactions();

  const activeWh = warehouses.find(w => w.id === selectedWarehouseId);
  if (!activeWh) return;

  const inspector = document.getElementById("warehouse-inspector");
  inspector.classList.remove("hidden");
  document.getElementById("inspector-title").innerText = `Stock Allocation Inspector: ${activeWh.name}`;

  const tableBody = document.getElementById("inspector-table-body");
  tableBody.innerHTML = "";

  const stockMap = {};
  txs.forEach(tx => {
    if (tx.warehouseId === selectedWarehouseId) {
      if (!stockMap[tx.productId]) {
        stockMap[tx.productId] = 0;
      }
      if (tx.type === "STOCK_IN") {
        stockMap[tx.productId] += tx.quantity;
      } else {
        stockMap[tx.productId] -= tx.quantity;
      }
    }
  });

  let hasStock = false;
  Object.keys(stockMap).forEach(prodId => {
    const qty = stockMap[prodId];
    if (qty > 0) {
      const prod = products.find(p => p.id === prodId);
      if (prod) {
        hasStock = true;
        const assetValue = qty * prod.price;
        tableBody.innerHTML += `
          <tr class="hover:bg-slate-100/30 transition-colors">
            <td class="p-4">
              <div class="font-semibold text-slate-800">${prod.name}</div>
              <div class="text-xs text-slate-400 font-mono mt-0.5">${prod.sku}</div>
            </td>
            <td class="p-4 text-slate-600 text-xs">${prod.category}</td>
            <td class="p-4 text-right text-slate-700">$${prod.price.toFixed(2)}</td>
            <td class="p-4 text-right font-bold text-indigo-600">${qty}</td>
            <td class="p-4 text-right font-bold text-slate-700">$${assetValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      }
    }
  });

  if (!hasStock) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="p-8 text-center text-slate-400 font-medium">No products currently allocated in this warehouse facility.</td>
      </tr>
    `;
  }
}

// --- MODAL CONTROLS ---
function openWarehouseModal() {
  const modal = document.getElementById("warehouse-modal");
  const form = document.getElementById("warehouse-form");
  form.reset();
  modal.classList.remove("hidden");
}

// --- CLOSE MODAL ---
function closeWarehouseModal() {
  const modal = document.getElementById("warehouse-modal");
  modal.classList.add("hidden");
}

// --- ADD WAREHOUSE SUBMIT ---
function handleWarehouseSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("form-warehouse-name").value;
  const location = document.getElementById("form-warehouse-location").value;

  const warehouses = db.getWarehouses();
  const newWarehouse = {
    id: "wh_" + Date.now(),
    name,
    location
  };

  warehouses.push(newWarehouse);
  db.saveWarehouses(warehouses);

  closeWarehouseModal();
  renderWarehouses();
}

// --- DELETE WAREHOUSE ---
function deleteWarehouse(id) {
  if (confirm("Warning: Deleting this warehouse facility will remove all its stock allocation logs from the inspector. Are you sure?")) {
    const warehouses = db.getWarehouses();
    const filtered = warehouses.filter(w => w.id !== id);
    db.saveWarehouses(filtered);
    
    const txs = db.getTransactions();
    const cleanedTxs = txs.map(t => {
      if (t.warehouseId === id) {
        return { ...t, warehouseId: "" };
      }
      return t;
    });
    db.saveTransactions(cleanedTxs);

    if (selectedWarehouseId === id) {
      selectedWarehouseId = "";
    }
    renderWarehouses();
  }
}
