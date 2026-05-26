import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// IMPORT YOUR NEW AI ENGINE HERE
import { generateBusinessSetup } from './components/AiEngine'; 

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
import ShopCartDrawer from './components/shop/ShopCartDrawer';
import './App.css'; 

// =========================================
// 1. THE ADMIN PANEL
// =========================================
const AdminPanel = ({ 
  branding, setBranding, 
  products, setProducts, 
  orders, updateOrderStatus,
  transactions, addTransaction, accounts, addAccount,
  activeSection, setActiveSection,
  siteConfig, setSiteConfig,
  features // Added to hide/show tabs based on AI preferences
}) => {
  return (
    <div className="app-container" style={{ '--brand-color': siteConfig.themeColor }}>
      <Sidebar 
        activeSection={activeSection} setActiveSection={setActiveSection}
        branding={branding}
        features={features} // Pass features to Sidebar so it knows what to hide
      />
      <main className="main">
        {activeSection === 'dashboard' && <Dashboard products={products} transactions={transactions} branding={branding} setActiveSection={setActiveSection} orders={orders} />}
        {activeSection === 'finance' && features?.wantsAccounting && <FinancePro transactions={transactions} accounts={accounts} addAccount={addAccount} branding={branding} addTransaction={addTransaction} />}
        {activeSection === 'branding' && features?.wantsBranding && <Branding branding={branding} setBranding={setBranding} />}
        {activeSection === 'website' && features?.wantsWebsite && <WebsiteEditor branding={branding} products={products} siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
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
  // --- AI LOADING STATE ---
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [userFeatures, setUserFeatures] = useState(null);

  // --- BRANDING STATE ---
  const [branding, setBranding] = useState({
    name: 'Loading...', slogan: '', industry: '',
    logo: '', owners: [{ name: 'Admin', role: 'Founder' }]
  });

  // --- WEBSITE CONFIGURATION ---
  const [siteConfig, setSiteConfig] = useState({
    themeColor: '#2dd4bf', 
    showHero: true,
    notificationEmail: 'orders@launchaxis.com',
    supportEmail: 'help@launchaxis.com',
    socials: { facebook: '', instagram: '' },
    menuItems: [
        { id: 1, label: 'Home', link: '#home' },
        { id: 2, label: 'Catalog', link: '#catalog' },
        { id: 3, label: 'About', link: '#about' }
    ]
  });

  // --- PRODUCTS STATE ---
  const [products, setProducts] = useState([]);

  // --- SMART CART LOGIC ---
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); 

  // Add Item
  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, qty: 1 }];
      }
    });
    setIsCartOpen(true); 
  };

  // Remove Item
  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Update Quantity
  const updateQty = (id, change) => {
    setCart(prevCart => prevCart.map(item => {
        if (item.id === id) {
            const newQty = item.qty + change;
            return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
    }));
  };

  // --- ORDERS & FINANCE STATE ---
  const [orders, setOrders] = useState([]);
  const [accounts, setAccounts] = useState([{ id: 1, name: 'Cash Register', type: 'asset', category: 'Cash' }]);
  const [transactions, setTransactions] = useState([{ id: 1, date: new Date().toLocaleDateString(), desc: 'Initial Capital', amount: 100000, type: 'income', category: 'Capital', accountId: 99 }]);

  // --- ACTIVE SECTION ---
  const [activeSection, setActiveSection] = useState('dashboard');

  // =========================================
  // 3. THE AI ENGINE CONNECTION
  // =========================================
  useEffect(() => {
    const fireUpAiEngine = async () => {
      // Mock data for testing. Later, this will pull directly from Firestore!
      const mockUserForm = {
        businessName: "Cyber Nexus",
        businessType: "Products",
        businessDesc: "High-end futuristic tech accessories.",
        email: "ceo@launchaxis.com",
        preferences: ["Business Website", "Accounting Setup", "Logo & Branding Kit"]
      };

      console.log("Sending user data to AI Engine...");
      const aiResult = await generateBusinessSetup(mockUserForm);
      
      if (aiResult) {
        // Automatically overwrite the default states with the AI generated data!
        setBranding(aiResult.branding);
        setProducts(aiResult.products);
        setUserFeatures(aiResult.features);
        setSiteConfig(prev => ({ ...prev, themeColor: aiResult.themeColor }));
      }
      
      setIsAiLoading(false);
    };

    fireUpAiEngine();
  }, []);

  // --- HELPERS ---
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
    setIsCartOpen(false); 
    alert("Order Placed Successfully!");
  };

  // --- LOADING SCREEN ---
  if (isAiLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111', color: '#2dd4bf', fontSize: '24px', fontWeight: 'bold' }}>
        INITIALIZING LAUNCHAXIS AI KERNEL...
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={
          <AdminPanel 
            branding={branding} setBranding={setBranding}
            products={products} setProducts={setProducts}
            orders={orders} updateOrderStatus={updateOrderStatus}
            transactions={transactions} addTransaction={addTransaction}
            accounts={accounts} addAccount={addAccount}
            activeSection={activeSection} setActiveSection={setActiveSection}
            siteConfig={siteConfig} setSiteConfig={setSiteConfig}
            features={userFeatures}
          />
        } />

        <Route path="/checkout" element={
          <ShopCheckout cart={cart} branding={branding} onPlaceOrder={placeOrder} />
        } />

        <Route path="/" element={
          <>
            <ShopCartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                cart={cart}
                updateQty={updateQty}
                removeFromCart={removeFromCart}
            />
            
            <ShopHome 
              branding={branding} 
              products={products} 
              cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} 
              addToCart={addToCart}
              siteConfig={siteConfig}
              openCart={() => setIsCartOpen(true)}
            />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;