// Apex Stock - Shared LocalStorage Database Engine

// ==========================================
// 1. DEFAULT SEED DATA
// ==========================================
const DEFAULT_PRODUCTS = [
  {
    id: "prod_1",
    name: "Copper Wire Coils",
    sku: "RAW-COP-4820",
    category: "Raw Materials",
    price: 45.99,
    quantity: 120,
    minStockLevel: 15,
    barcode: "837492047392",
    expiryDate: "2026-12-31",
    batchNumber: "LOT-B12",
    supplierId: "supp_1"
  },
  {
    id: "prod_2",
    name: "Microprocessor Alpha",
    sku: "ELC-MIC-9920",
    category: "Electronics",
    price: 189.50,
    quantity: 4,
    minStockLevel: 10, // Triggers a low stock alert out of the box
    barcode: "102938475610",
    expiryDate: "",
    batchNumber: "LOT-E81",
    supplierId: "supp_2"
  },
  {
    id: "prod_3",
    name: "Corrugated Shipping Boxes",
    sku: "PKG-BOX-1020",
    category: "Packaging",
    price: 2.15,
    quantity: 450,
    minStockLevel: 50,
    barcode: "482019472619",
    expiryDate: "",
    batchNumber: "",
    supplierId: "supp_1"
  },
  {
    id: "prod_4",
    name: "LED Display Panel 10px",
    sku: "ELC-DIS-7721",
    category: "Electronics",
    price: 79.00,
    quantity: 35,
    minStockLevel: 5,
    barcode: "572910482619",
    expiryDate: "2027-05-15",
    batchNumber: "LOT-D09",
    supplierId: "supp_2"
  }
];

const DEFAULT_SUPPLIERS = [
  {
    id: "supp_1",
    name: "Acme Metal & Packaging Corp",
    email: "procurement@acmemetals.com",
    phone: "+1 (555) 0199",
    person: "Sarah Connor",
    address: "100 Industrial Parkway, Austin, TX 78701"
  },
  {
    id: "supp_2",
    name: "Silicon Tech Semiconductors",
    email: "orders@silicontech.com",
    phone: "+1 (555) 8721",
    person: "Linus Torvalds",
    address: "404 Circuit Boulevard, San Jose, CA 95101"
  }
];

const DEFAULT_WAREHOUSES = [
  {
    id: "wh_1",
    name: "Austin Logistics Hub",
    location: "Austin, TX, USA"
  },
  {
    id: "wh_2",
    name: "San Jose Electronics Depot",
    location: "San Jose, CA, USA"
  }
];

const DEFAULT_TRANSACTIONS = [
  {
    id: "tx_1",
    type: "STOCK_IN",
    productId: "prod_1",
    quantity: 100,
    warehouseId: "wh_1",
    reason: "Initial purchase order",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tx_2",
    type: "STOCK_IN",
    productId: "prod_2",
    quantity: 15,
    warehouseId: "wh_2",
    reason: "Vendor restock",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tx_3",
    type: "STOCK_OUT",
    productId: "prod_2",
    quantity: 11,
    warehouseId: "wh_2",
    reason: "Client sales dispatch",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "tx_4",
    type: "STOCK_IN",
    productId: "prod_3",
    quantity: 450,
    warehouseId: "wh_1",
    reason: "Bulk shipment",
    date: new Date().toISOString()
  }
];

// ==========================================
// 2. DATABASE GETTERS / SETTERS
// ==========================================
const db = {
  getProducts: () => {
    ensureInitialized();
    return JSON.parse(localStorage.getItem("apex_products"));
  },
  saveProducts: (data) => {
    localStorage.setItem("apex_products", JSON.stringify(data));
  },
  
  getSuppliers: () => {
    ensureInitialized();
    return JSON.parse(localStorage.getItem("apex_suppliers"));
  },
  saveSuppliers: (data) => {
    localStorage.setItem("apex_suppliers", JSON.stringify(data));
  },
  
  getWarehouses: () => {
    ensureInitialized();
    return JSON.parse(localStorage.getItem("apex_warehouses"));
  },
  saveWarehouses: (data) => {
    localStorage.setItem("apex_warehouses", JSON.stringify(data));
  },
  
  getTransactions: () => {
    ensureInitialized();
    return JSON.parse(localStorage.getItem("apex_transactions"));
  },
  saveTransactions: (data) => {
    localStorage.setItem("apex_transactions", JSON.stringify(data));
  }
};

// ==========================================
// 3. INITIALIZATION CHECKER
// ==========================================
function ensureInitialized() {
  if (!localStorage.getItem("apex_products")) {
    localStorage.setItem("apex_products", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("apex_suppliers")) {
    localStorage.setItem("apex_suppliers", JSON.stringify(DEFAULT_SUPPLIERS));
  }
  if (!localStorage.getItem("apex_warehouses")) {
    localStorage.setItem("apex_warehouses", JSON.stringify(DEFAULT_WAREHOUSES));
  }
  if (!localStorage.getItem("apex_transactions")) {
    localStorage.setItem("apex_transactions", JSON.stringify(DEFAULT_TRANSACTIONS));
  }
}

// Perform instant initialization when script is loaded on any page
ensureInitialized();
