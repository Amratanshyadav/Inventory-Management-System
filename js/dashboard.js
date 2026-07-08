// Apex Stock - Dashboard Page Controller

let velocityChart = null;

document.addEventListener("DOMContentLoaded", () => {
  renderDashboard();
  lucide.createIcons();
});

function renderDashboard() {
  const products = db.getProducts();
  const txs = db.getTransactions();
  const warehouses = db.getWarehouses();

  // 1. Calculate statistics
  const totalProductsCount = products.length;
  const totalStockCount = products.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity <= p.minStockLevel).length;
  const valuation = products.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const totalTxs = txs.length;

  document.getElementById("stat-products").innerText = totalProductsCount;
  document.getElementById("stat-stock").innerText = totalStockCount;
  document.getElementById("stat-low-stock").innerText = lowStockCount;
  document.getElementById("stat-valuation").innerText = `$${valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  document.getElementById("stat-transactions").innerText = totalTxs;

  // 2. Pulse warning indicators on low stock card (Light Mode styling)
  const lowStockCard = document.getElementById("stat-low-stock-card");
  const lowStockIcon = document.getElementById("stat-low-stock-icon");
  if (lowStockCount > 0) {
    lowStockCard.className = "glass-panel p-5 rounded-2xl flex items-center justify-between border-rose-500/30 pulse-warning";
    lowStockIcon.className = "p-2.5 rounded-lg bg-rose-500/10 text-rose-500";
  } else {
    lowStockCard.className = "glass-panel p-5 rounded-2xl flex items-center justify-between border-slate-200";
    lowStockIcon.className = "p-2.5 rounded-lg bg-indigo-500/10 text-indigo-600";
  }

  // 3. Render low stock items listing
  const lowStockContainer = document.getElementById("dash-low-stock-list");
  lowStockContainer.innerHTML = "";
  const lowStockProducts = products.filter(p => p.quantity <= p.minStockLevel);
  if (lowStockProducts.length > 0) {
    lowStockProducts.forEach(p => {
      lowStockContainer.innerHTML += `
        <div class="flex justify-between items-center bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-xs">
          <div class="min-w-0">
            <span class="font-medium text-slate-800 block truncate">${p.name}</span>
            <span class="text-[10px] text-slate-400 font-mono block mt-0.5">${p.sku}</span>
          </div>
          <span class="font-bold text-rose-500 shrink-0 ml-2">${p.quantity} left</span>
        </div>
      `;
    });
  } else {
    lowStockContainer.innerHTML = `
      <div class="h-full flex items-center justify-center text-slate-400 text-xs py-14">No stock warnings.</div>
    `;
  }

  // 4. Render recent activity log
  const recentTxContainer = document.getElementById("dash-recent-tx");
  recentTxContainer.innerHTML = "";
  const sortedTxs = [...txs].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  
  if (sortedTxs.length > 0) {
    sortedTxs.forEach(t => {
      const prod = products.find(p => p.id === t.productId);
      const wh = warehouses.find(w => w.id === t.warehouseId);
      const dateStr = new Date(t.date).toLocaleDateString() + " " + new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      recentTxContainer.innerHTML += `
        <tr class="hover:bg-slate-100/30 transition-colors">
          <td class="p-3 text-slate-400 whitespace-nowrap">${dateStr}</td>
          <td class="p-3">
            <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
              t.type === 'STOCK_IN' ? 'bg-indigo-500/10 text-indigo-600' : 'bg-emerald-500/10 text-emerald-600'
            }">
              ${t.type === 'STOCK_IN' ? 'In' : 'Out'}
            </span>
          </td>
          <td class="p-3">
            <div class="font-semibold text-slate-800">${prod ? prod.name : 'Deleted Product'}</div>
            <div class="text-[10px] text-slate-400 mt-0.5">${wh ? wh.name : 'Global Allocation'}</div>
          </td>
          <td class="p-3 text-right font-bold text-slate-700">
            ${t.type === 'STOCK_IN' ? '+' : '-'}${t.quantity}
          </td>
        </tr>
      `;
    });
  } else {
    recentTxContainer.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-slate-400">No activity logged.</td></tr>`;
  }

  // 5. Draw line chart
  renderChart(txs);
}

function renderChart(transactions) {
  const chartElement = document.getElementById('stockVelocityChart');
  if (!chartElement) return;

  const ctx = chartElement.getContext('2d');
  
  if (velocityChart) {
    velocityChart.destroy();
  }

  const dateMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dateMap[dateStr] = { stockIn: 0, stockOut: 0 };
  }

  transactions.forEach(tx => {
    const txDateStr = tx.date.split('T')[0];
    if (dateMap[txDateStr]) {
      if (tx.type === "STOCK_IN") {
        dateMap[txDateStr].stockIn += tx.quantity;
      } else {
        dateMap[txDateStr].stockOut += tx.quantity;
      }
    }
  });

  const labels = Object.keys(dateMap).map(d => {
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  });
  const stockInValues = Object.values(dateMap).map(v => v.stockIn);
  const stockOutValues = Object.values(dateMap).map(v => v.stockOut);

  velocityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Stock In',
          data: stockInValues,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.08)',
          tension: 0.3,
          fill: true,
          borderWidth: 2
        },
        {
          label: 'Stock Out',
          data: stockOutValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          tension: 0.3,
          fill: true,
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '#475569',
            font: { family: 'Inter, sans-serif', size: 10 }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.03)' },
          ticks: { color: '#64748b', font: { size: 9 } }
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.03)' },
          ticks: { color: '#64748b', font: { size: 9 } }
        }
      }
    }
  });
}
