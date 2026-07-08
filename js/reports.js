// Apex Stock - Reports & Forecasting Page Controller

document.addEventListener("DOMContentLoaded", () => {
  populateForecastProductSelector();
  lucide.createIcons();
});

// --- POPULATE FORECAST SELECTOR ---
function populateForecastProductSelector() {
  const products = db.getProducts();
  const select = document.getElementById("forecast-product-select");
  if (!select) return;

  select.innerHTML = '<option value="">Choose product...</option>';
  products.forEach(p => {
    select.innerHTML += `<option value="${p.id}">${p.name} (SKU: ${p.sku})</option>`;
  });
}

// --- RUN DEMAND FORECASTING MATHEMATICS ---
function runForecasting() {
  const prodId = document.getElementById("forecast-product-select").value;
  const container = document.getElementById("forecast-result-container");
  
  if (!prodId) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");

  const products = db.getProducts();
  const txs = db.getTransactions();
  const product = products.find(p => p.id === prodId);

  // Group Stock-Out dispatches in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const stockOuts = txs.filter(t => 
    t.productId === prodId && 
    t.type === "STOCK_OUT" && 
    new Date(t.date) >= thirtyDaysAgo
  );

  const totalSold = stockOuts.reduce((acc, curr) => acc + curr.quantity, 0);
  const adsr = totalSold / 30; // Average Daily Sales Rate
  const projectedDemand = Math.round(adsr * 30);
  
  const leadTimeDays = 7;
  const safetyStock = Math.round(adsr * leadTimeDays);
  const reorderPoint = safetyStock + 5;
  
  const needsReorder = product.quantity <= reorderPoint;
  const suggestedQty = needsReorder ? Math.max(projectedDemand - product.quantity, 10) : 0;

  // Render values
  document.getElementById("forecast-current-stock").innerText = `${product.quantity} units`;
  document.getElementById("forecast-sold-30").innerText = `${totalSold} units`;
  document.getElementById("forecast-adsr").innerText = `${adsr.toFixed(2)} units/day`;
  document.getElementById("forecast-projected").innerText = `${projectedDemand} units`;
  document.getElementById("forecast-safety-stock").innerText = `${safetyStock} units`;
  document.getElementById("forecast-reorder-point").innerText = `${reorderPoint} units`;

  // Render advisory card styles
  const recCard = document.getElementById("forecast-recommendation-card");
  const recIcon = document.getElementById("forecast-rec-icon");
  const recTitle = document.getElementById("forecast-rec-title");
  const recDesc = document.getElementById("forecast-rec-desc");
  const suggestedContainer = document.getElementById("forecast-suggested-qty-container");
  const suggestedLabel = document.getElementById("forecast-suggested-qty");

  if (needsReorder) {
    recCard.className = "p-6 rounded-xl border flex flex-col justify-between text-center bg-rose-50 border-rose-200 animate-fade-in";
    recIcon.className = "w-12 h-12 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-600 mx-auto";
    recIcon.innerHTML = '<i data-lucide="trending-down" class="w-6 h-6"></i>';
    recTitle.innerText = "REORDER CRITICAL";
    recTitle.className = "text-xl font-bold text-rose-600";
    recDesc.innerText = `Stock level has fallen below safety point (${reorderPoint} units). A restock is recommended.`;
    
    suggestedContainer.classList.remove("hidden");
    suggestedLabel.innerHTML = `<i data-lucide="shopping-cart" class="w-5 h-5 inline mr-1.5"></i><span>${suggestedQty} units</span>`;
  } else {
    recCard.className = "p-6 rounded-xl border flex flex-col justify-between text-center bg-emerald-50 border-emerald-200 animate-fade-in";
    recIcon.className = "w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-600 mx-auto";
    recIcon.innerHTML = '<i data-lucide="activity" class="w-6 h-6"></i>';
    recTitle.innerText = "STOCK LEVEL SAFE";
    recTitle.className = "text-xl font-bold text-emerald-600";
    recDesc.innerText = "Current inventory is sufficient to meet projected 30-day demand and supplier lead times.";
    
    suggestedContainer.classList.add("hidden");
  }
  lucide.createIcons();
}

// --- EXCEL CSV EXPORTER ---
function exportCSV(type) {
  let csvContent = "";

  if (type === "inventory") {
    const products = db.getProducts();
    const suppliers = db.getSuppliers();
    
    csvContent += "SKU,Product Name,Category,Price,Quantity,Min Stock Level,Barcode,Supplier\n";
    products.forEach(p => {
      const supp = suppliers.find(s => s.id === p.supplierId);
      const supplierName = supp ? supp.name : "N/A";
      csvContent += `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.category}",${p.price},${p.quantity},${p.minStockLevel},"${p.barcode || ""}","${supplierName}"\n`;
    });
  } 
  else if (type === "sales") {
    const txs = db.getTransactions();
    const products = db.getProducts();
    
    csvContent += "Timestamp,Type,SKU,Product Name,Quantity,Reason\n";
    txs.forEach(t => {
      if (t.type === "STOCK_OUT") {
        const prod = products.find(p => p.id === t.productId);
        const sku = prod ? prod.sku : "N/A";
        const name = prod ? prod.name : "Deleted Product";
        csvContent += `"${t.date}","${t.type}","${sku}","${name.replace(/"/g, '""')}",${t.quantity},"${(t.reason || "").replace(/"/g, '""')}"\n`;
      }
    });
  } 
  else if (type === "suppliers") {
    const suppliers = db.getSuppliers();
    
    csvContent += "Supplier Name,Contact Person,Email,Phone,Address\n";
    suppliers.forEach(s => {
      csvContent += `"${s.name.replace(/"/g, '""')}","${(s.person || "").replace(/"/g, '""')}","${s.email}","${s.phone}","${(s.address || "").replace(/"/g, '""')}"\n`;
    });
  }

  // Trigger browser download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${type}_report_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
