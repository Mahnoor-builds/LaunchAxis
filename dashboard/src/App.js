import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// UPGRADED FIREBASE IMPORTS
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faUserCircle } from '@fortawesome/free-solid-svg-icons';
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
  transactions, addTransaction, accounts, addAccount, updateAccount, 
  activeSection, setActiveSection,
  siteConfig, setSiteConfig,
  features 
}) => {
  return (
    <div className="app-container split-theme" style={{ '--brand-color': siteConfig.themeColor }}>
      <Sidebar 
        activeSection={activeSection} setActiveSection={setActiveSection}
        branding={branding}
        features={features} 
      />
      
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="topbar-greeting">
            <h2>Welcome back, CEO</h2>
            <p>System Overview for <span className="highlight-cyan">{branding.name}</span></p>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" title="Settings">
              <FontAwesomeIcon icon={faCog} />
            </button>
            <button className="icon-btn profile-btn" title="Account Profile">
              <FontAwesomeIcon icon={faUserCircle} />
            </button>
          </div>
        </header>

        <main className="main-content">
          {activeSection === 'dashboard' && <Dashboard products={products} transactions={transactions} branding={branding} setActiveSection={setActiveSection} orders={orders} features={features} />}
          {activeSection === 'finance' && features?.wantsAccounting && <FinancePro transactions={transactions} accounts={accounts} addAccount={addAccount} updateAccount={updateAccount} branding={branding} addTransaction={addTransaction} />}
          {activeSection === 'branding' && features?.wantsBranding && <Branding branding={branding} setBranding={setBranding} />}
          {activeSection === 'website' && features?.wantsWebsite && <WebsiteEditor branding={branding} products={products} siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
          {activeSection === 'products' && <Products products={products} setProducts={setProducts} />}
          {activeSection === 'orders' && <Orders orders={orders} updateOrderStatus={updateOrderStatus} />}
        </main>
      </div>
    </div>
  );
};

// =========================================
// 2. THE MAIN APP (The Brain)
// =========================================
function App() {
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [userFeatures, setUserFeatures] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState(null); // NEW: Track logged-in user

  const [branding, setBranding] = useState({
    name: 'Loading...', slogan: '', industry: '',
    logo: '', owners: [{ name: 'Admin', role: 'Founder' }]
  });

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

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); 

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

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateQty = (id, change) => {
    setCart(prevCart => prevCart.map(item => {
        if (item.id === id) {
            const newQty = item.qty + change;
            return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
    }));
  };

  const [orders, setOrders] = useState([]);
  
  // FIXED INITIAL DATA (Properly linked IDs)
  const [accounts, setAccounts] = useState([{ id: 1, name: 'Cash Register', type: 'asset', category: 'Bank' }]);
  const [transactions, setTransactions] = useState([{ id: 1, date: new Date().toLocaleDateString(), desc: 'Initial Capital', amount: 100000, type: 'income', category: 'Capital', accountId: 1, accountName: 'Cash Register' }]);

  const [activeSection, setActiveSection] = useState('dashboard');

  // =========================================
  // 3. THE LIVE FIREBASE CONNECTION
  // =========================================
  useEffect(() => {
    const fetchLiveKernelData = async () => {
      try {
        let targetEmail = "ceo@ecosole.store"; 
        const rawMemory = localStorage.getItem("launchAxisTempData");
        if (rawMemory) {
            targetEmail = JSON.parse(rawMemory).email;
        }

        console.log("Connecting to Firebase for:", targetEmail);

        const docRef = doc(db, "users", targetEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const liveData = docSnap.data();
            const aiData = liveData.aiArchitecture;

            // Save email to state so we can push updates later
            setCurrentUserEmail(targetEmail);

            console.log("SUCCESS! Real AI Data Loaded:", aiData);

            // 1. Load Branding & Theme
            setBranding(prev => ({
                ...prev,
                name: aiData.businessName,
                slogan: aiData.tagline,
                industry: liveData.businessType
            }));
            setSiteConfig(prev => ({ 
                ...prev, 
                themeColor: aiData.colorPalette.primary || '#2dd4bf' 
            }));
            setUserFeatures({ wantsWebsite: true, wantsAccounting: true, wantsBranding: true });

            // 2. LOAD SAVED USER DATA FROM FIREBASE (If it exists)
            if (liveData.accounts) setAccounts(liveData.accounts);
            if (liveData.transactions) setTransactions(liveData.transactions);
            if (liveData.orders) setOrders(liveData.orders);
            if (liveData.products && liveData.products.length > 0) setProducts(liveData.products);

        } else {
            console.log("No Firebase document found for this email.");
        }
      } catch (error) {
          console.error("Firebase Sync Error:", error);
      } finally {
          setIsAiLoading(false);
      }
    };

    fetchLiveKernelData();
  }, []);

  // --- FIREBASE PUSH HELPER ---
  const syncToFirebase = async (field, data) => {
    if (!currentUserEmail) return;
    try {
      const docRef = doc(db, "users", currentUserEmail);
      await updateDoc(docRef, { [field]: data });
    } catch (error) {
      console.error(`Error saving ${field} to Firebase:`, error);
    }
  };

  // --- HELPERS (NOW EQUIPPED WITH FIREBASE SYNC) ---
  const updateOrderStatus = (id, status, trackId) => {
    const updated = orders.map(o => o.id === id ? { ...o, status, trackingId: trackId } : o);
    setOrders(updated);
    syncToFirebase("orders", updated);

    if(status === 'Delivered') {
      const ord = orders.find(o => o.id === id);
      if(ord) addTransaction({ date: new Date().toLocaleDateString(), desc: `Sale: Order #${id}`, amount: ord.amount, type: 'income', category: 'Sales', accountId: 1, accountName: 'Cash Register' });
    }
  };

  const addTransaction = (tx) => {
    const newTx = {...tx, id: Math.floor(Math.random() * 100000)};
    const updatedList = [newTx, ...transactions];
    setTransactions(updatedList);
    syncToFirebase("transactions", updatedList);
  };
  
  const addAccount = (acc) => {
    const newAcc = { ...acc, id: Math.floor(Math.random() * 100000) };
    const updatedList = [...accounts, newAcc];
    setAccounts(updatedList);
    syncToFirebase("accounts", updatedList);
  };
  
  const updateAccount = (id, updatedData) => {
    const updatedList = accounts.map(acc => acc.id === id ? { ...acc, ...updatedData } : acc);
    setAccounts(updatedList);
    syncToFirebase("accounts", updatedList);
  };

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
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    syncToFirebase("orders", updatedOrders);
    
    setCart([]); 
    setIsCartOpen(false); 
    alert("Order Placed Successfully!");
  };

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
            updateAccount={updateAccount}
            activeSection={activeSection} setActiveSection={setActiveSection}
            siteConfig={siteConfig} setSiteConfig={setSiteConfig}
            features={userFeatures}
          />
        } />
        <Route path="/checkout" element={<ShopCheckout cart={cart} branding={branding} onPlaceOrder={placeOrder} />} />
        <Route path="/" element={
          <>
            <ShopCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} />
            <ShopHome branding={branding} products={products} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} addToCart={addToCart} siteConfig={siteConfig} openCart={() => setIsCartOpen(true)} />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;