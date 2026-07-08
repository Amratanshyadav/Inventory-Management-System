# Apex Stock - Multi-Page Inventory Management System

A lightweight, multi-page static web application designed for business inventory management. This application is optimized to run locally on the **VS Code Live Server** extension without any backend dependencies, using the browser's native **LocalStorage** for data persistence.

---

## Features

* **Dashboard Analytics**: Real-time stats cards tracking total products, total stock, low-stock warnings, and capital valuations alongside a weekly transaction velocity chart (powered by Chart.js).
* **Product Catalog**: Live database-like product tracking (SKUs, categories, safety limits, custom mock barcodes, and batch expiry tracking).
* **Stock Adjustments**: Auditable Stock-In and Stock-Out ledger updates with quantity checks to prevent negative stock states.
* **Multi-Warehouse Auditor**: Interactive facility directory with inventory breakdowns and live asset valuation audits.
* **Procurement Forecasting**: A moving-average demand forecasting tool that evaluates sales rates to recommend restock quantities.
* **Spreadsheet Exporters**: Export catalog statements, sales ledgers, and vendor directories to Excel-compatible CSV files.

---

## Directory Layout

```text
d:\INVENTORY MANAGEMENT SYSTEM 2.0
 ├── css/
 │    └── style.css          # Shared glassmorphic stylesheet
 ├── js/
 │    ├── db.js              # Shared LocalStorage data connector
 │    ├── dashboard.js       # Dashboard page logic and line chart
 │    ├── products.js        # Catalog search and modal controls
 │    ├── transactions.js    # Inbound/outbound ledger adjustments
 │    ├── suppliers.js       # Partner vendor card directories
 │    ├── warehouses.js      # Multi-warehouse allocation inspections
 │    └── reports.js         # CSV exports & forecasting mathematics
 ├── index.html              # Dashboard Panel
 ├── products.html           # Product Catalog
 ├── transactions.html       # Stock adjustment ledger
 ├── suppliers.html          # Supplier Registry
 ├── warehouses.html         # Warehouse hubs
 └── reports.html            # Analytics and Forecasting
```

---

## Getting Started

### Prerequisites
* **VS Code** (Visual Studio Code) editor.
* **Live Server** extension (by Ritwick Dey) installed in VS Code.

### Running the Project
1. Open the project folder in VS Code.
2. Right-click on **`index.html`** and select **"Open with Live Server"**.
3. The application will open automatically in your browser at `http://127.0.0.1:5500/index.html`.

---

## Technical Stack
* **Markup**: HTML5
* **CSS Framework**: Tailwind CSS (loaded via CDN)
* **Icons**: Lucide Icons (loaded via CDN)
* **Graphs**: Chart.js (loaded via CDN)
* **Data Persistence**: Browser LocalStorage
