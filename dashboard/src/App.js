import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// ADMIN COMPONENTS
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FinancePro from './components/FinancePro';
import Branding from './components/Branding';
import WebsiteEditor from './components/WebsiteEditor';
import Products from './components/Products';
import Orders from './components/Orders';

// SHOP COMPONENTS
import ShopHome from './components/shop/ShopHome';
import ShopCheckout from './components/shop/ShopCheckout';
import './App.css'; // Global Styles

// =========================================
// 1. THE ADMIN PANEL
// =========================================
const AdminPanel = ({ 
  branding, setBranding, 
  products, setProducts, 
  orders, updateOrderStatus,
  transactions, addTransaction, accounts, addAccount,
  activeSection, setActiveSection,
  siteConfig, setSiteConfig // <--- NEW PROP
}) => {
  return (
    <div className="app-container">
      <Sidebar 
        activeSection={activeSection} setActiveSection={setActiveSection}
        branding={branding}
      />
      <main className="main">
        {activeSection === 'dashboard' && <Dashboard products={products} transactions={transactions} branding={branding} setActiveSection={setActiveSection} orders={orders} />}
        {activeSection === 'finance' && <FinancePro transactions={transactions} accounts={accounts} addAccount={addAccount} branding={branding} addTransaction={addTransaction} />}
        {activeSection === 'branding' && <Branding branding={branding} setBranding={setBranding} />}
        
        {/* WE PASS siteConfig HERE SO YOU CAN EDIT IT */}
        {activeSection === 'website' && <WebsiteEditor branding={branding} products={products} siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
        
        {activeSection === 'products' && <Products products={products} setProducts={setProducts} />}
        {activeSection === 'orders' && <Orders orders={orders} updateOrderStatus={updateOrderStatus} />}
      </main>
    </div>
  );
};

// =========================================
// 2. THE MAIN APP (The Brain)
// =========================================
function App() {
  // --- BRANDING STATE ---
  const [branding, setBranding] = useState({
    name: 'Neon Startups', slogan: 'Future of Retail', industry: 'Fashion',
    logo: '', owners: [{ name: 'Ali Khan', role: 'Founder' }]
  });

  // --- WEBSITE CONFIGURATION (Moved to Brain) ---
  const [siteConfig, setSiteConfig] = useState({
    themeColor: '#2dd4bf', 
    showHero: true,
    notificationEmail: 'orders@launchaxis.com',
    supportEmail: 'help@launchaxis.com',
    socials: { facebook: '', instagram: '' },
    
    // NEW: DYNAMIC MENU BUILDER
    menuItems: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'Catalog', link: '#products' },
        { id: 3, label: 'Sale', link: '#sale' }
    ]
  });

  // --- PRODUCTS STATE ---
  const [products, setProducts] = useState([
    { id: 1, name: 'Cyber Sneakers', price: 4500, description: 'High-top glowing sneakers.', status: 'active', images: [] },
    { id: 2, name: 'Neon Hoodie', price: 2500, description: 'Cotton fleece with LED strip.', status: 'active', images: [] }
  ]);

  // --- ORDERS & FINANCE STATE ---
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [accounts, setAccounts] = useState([{ id: 1, name: 'Cash Register', type: 'asset', category: 'Cash' }]);
  const [transactions, setTransactions] = useState([{ id: 1, date: '1/26/2026', desc: 'Initial Capital', amount: 100000, type: 'income', category: 'Capital', accountId: 99 }]);

  // --- ACTIVE SECTION ---
  const [activeSection, setActiveSection] = useState('dashboard');

  // --- HELPERS ---
  const addToCart = (product) => {
    setCart([...cart, product]);
    // We will replace this alert with the Drawer later today!
    alert(`${product.name} added to cart!`); 
  };

  const updateOrderStatus = (id, status, trackId) => {
    const updated = orders.map(o => o.id === id ? { ...o, status, trackingId: trackId } : o);
    setOrders(updated);
    if(status === 'Delivered') {
      const ord = orders.find(o => o.id === id);
      if(ord) addTransaction({ date: new Date().toLocaleDateString(), desc: `Sale: Order #${id}`, amount: ord.amount, type: 'income', category: 'Sales', accountId: 1 });
    }
  };

  const addTransaction = (tx) => setTransactions([tx, ...transactions]);
  const addAccount = (acc) => setAccounts([...accounts, acc]);

  const placeOrder = (orderDetails) => {
    const newOrder = {
        id: Math.floor(Math.random() * 10000) + 1000,
        customerName: `${orderDetails.customer.firstName} ${orderDetails.customer.lastName}`,
        phone: orderDetails.customer.phone,
        address: `${orderDetails.customer.address}, ${orderDetails.customer.city}`,
        productName: orderDetails.items.map(i => i.name).join(', '),
        qty: orderDetails.items.length,
        amount: orderDetails.total,
        status: 'Pending',
        trackingId: ''
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    alert("Order Placed Successfully!");
  };

  return (
    <Router>
      <Routes>
        {/* ROUTE 1: ADMIN DASHBOARD */}
        <Route path="/admin" element={
          <AdminPanel 
            branding={branding} setBranding={setBranding}
            products={products} setProducts={setProducts}
            orders={orders} updateOrderStatus={updateOrderStatus}
            transactions={transactions} addTransaction={addTransaction}
            accounts={accounts} addAccount={addAccount}
            activeSection={activeSection} setActiveSection={setActiveSection}
            siteConfig={siteConfig} setSiteConfig={setSiteConfig}
          />
        } />

        {/* ROUTE 2: CHECKOUT */}
        <Route path="/checkout" element={
          <ShopCheckout cart={cart} branding={branding} onPlaceOrder={placeOrder} />
        } />

        {/* ROUTE 3: CUSTOMER STOREFRONT */}
        <Route path="/" element={
          <ShopHome 
            branding={branding} 
            products={products} 
            cartCount={cart.length} 
            addToCart={addToCart}
            siteConfig={siteConfig} // <--- PASSING THE CONFIG HERE
          />
        } />
      </Routes>
    </Router>
  );
}

export default App;