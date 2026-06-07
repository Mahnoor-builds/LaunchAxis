import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Make sure this path is correct for your setup!
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
  features, // <--- ADDED THE COMMA HERE!
  theme, toggleTheme 
}) => {
  return (
    // Make sure to use the backticks (`) and the ${theme} variable here!
    <div className={`app-container ${theme}`} style={{ '--brand-color': siteConfig.themeColor }}>
      <Sidebar 
        activeSection={activeSection} setActiveSection={setActiveSection}
        branding={branding}
        features={features} 
        theme={theme}             
        toggleTheme={toggleTheme} 
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

// --- THEME STATE ---
  const [theme, setTheme] = useState('dark'); // Defaulting to your awesome dark mode

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

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
  // =========================================
  // 3. THE LIVE FIREBASE CONNECTION
  // =========================================
  useEffect(() => {
    const fetchLiveKernelData = async () => {
      try {
        // 1. Get the email we saved during the HTML form step
        let targetEmail = "ceo@ecosole.store"; // Fallback to your test email
        const rawMemory = localStorage.getItem("launchAxisTempData");
        if (rawMemory) {
            targetEmail = JSON.parse(rawMemory).email;
        }

        console.log("Connecting to Firebase for:", targetEmail);

        // 2. Fetch the REAL AI data from Firestore
        const docRef = doc(db, "users", targetEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const liveData = docSnap.data();
            const aiData = liveData.aiArchitecture;

            console.log("SUCCESS! Real AI Data Loaded:", aiData);

            // 3. Paint the React UI with the real data!
            setBranding(prev => ({
                ...prev,
                name: aiData.businessName,
                slogan: aiData.tagline,
                industry: liveData.businessType
            }));
            
            // Apply the AI colors to the website configuration
            setSiteConfig(prev => ({ 
                ...prev, 
                themeColor: aiData.colorPalette.primary || '#2dd4bf' 
            }));

            // 4. UNLOCK THE DASHBOARD TABS
            // This tells React to stop hiding your protected pages!
            setUserFeatures({
                wantsWebsite: true,
                wantsAccounting: true,
                wantsBranding: true
            });

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
            theme={theme}              
            toggleTheme={toggleTheme}
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