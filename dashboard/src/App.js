import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faUserCircle } from '@fortawesome/free-solid-svg-icons';

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
import ShopCatalog from './components/shop/ShopCatalog'; 
import './App.css'; 

// =========================================
// 1. THE ADMIN PANEL
// =========================================
const AdminPanel = ({ 
  branding, setBranding, 
  products, setProducts, 
  orders, updateOrderStatus,
  transactions, addTransaction, 
  accounts, addAccount, updateAccount, 
  inventory, addInventoryItem, updateInventoryItem, 
  activeSection, setActiveSection,
  siteConfig, setSiteConfig,
  features 
}) => {
  return (
    <div className="app-container split-theme" style={{ '--brand-color': siteConfig.themeColor }}>
      <Sidebar 
        activeSection={activeSection} setActiveSection={setActiveSection}
        branding={branding} features={features} 
      />
      
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="topbar-greeting">
            <h2>Welcome back, CEO</h2>
            <p>System Overview for <span className="highlight-cyan">{branding.name}</span></p>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" title="Settings"><FontAwesomeIcon icon={faCog} /></button>
            <button className="icon-btn profile-btn" title="Account Profile"><FontAwesomeIcon icon={faUserCircle} /></button>
          </div>
        </header>

        <main className="main-content">
          {activeSection === 'dashboard' && <Dashboard products={products} transactions={transactions} branding={branding} setActiveSection={setActiveSection} orders={orders} features={features} inventory={inventory} />}
          {activeSection === 'finance' && features?.wantsAccounting && <FinancePro transactions={transactions} accounts={accounts} addAccount={addAccount} updateAccount={updateAccount} inventory={inventory} addInventoryItem={addInventoryItem} updateInventoryItem={updateInventoryItem} branding={branding} addTransaction={addTransaction} />}
          {activeSection === 'branding' && features?.wantsBranding && <Branding branding={branding} setBranding={setBranding} />}
          {activeSection === 'website' && features?.wantsWebsite && <WebsiteEditor branding={branding} products={products} siteConfig={siteConfig} setSiteConfig={setSiteConfig} />}
          {activeSection === 'products' && <Products siteConfig={siteConfig} />}
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
  const [currentUserEmail, setCurrentUserEmail] = useState(null); 

  const [branding, setBranding] = useState({ name: 'Loading...', slogan: '', industry: '', logo: '', owners: [{ name: 'Admin', role: 'Founder' }] });
  const [siteConfig, setSiteConfig] = useState({ themeColor: '#2dd4bf', showHero: true, notificationEmail: 'orders@launchaxis.com', supportEmail: 'help@launchaxis.com', socials: { facebook: '', instagram: '' }, menuItems: [{ id: 1, label: 'Home', link: '#home' }, { id: 2, label: 'Catalog', link: '#catalog' }, { id: 3, label: 'About', link: '#about' }] });
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); 
  const [orders, setOrders] = useState([]);
  
  const [accounts, setAccounts] = useState([{ id: 1, name: 'Cash Register', type: 'asset', category: 'Bank' }]);
  const [transactions, setTransactions] = useState([{ id: 1, date: new Date().toLocaleDateString(), desc: 'Initial Capital', amount: 100000, type: 'income', category: 'Capital', accountId: 1, accountName: 'Cash Register' }]);
  
  const [inventory, setInventory] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.cartId === product.cartId);
      if (existing) {
        return prevCart.map(item => item.cartId === product.cartId ? { ...item, qty: item.qty + product.qty } : item);
      }
      return [...prevCart, product];
    });
    setIsCartOpen(true); 
  };
  
  const removeFromCart = (cartId) => setCart(prevCart => prevCart.filter(item => item.cartId !== cartId));
  
  const updateQty = (cartId, change) => setCart(prevCart => prevCart.map(item => { 
    if (item.cartId === cartId) { 
        const newQty = item.qty + change; 
        return newQty > 0 ? { ...item, qty: newQty } : item; 
    } 
    return item; 
  }));

  // =========================================
  // 3. THE LIVE FIREBASE CONNECTION
  // =========================================
  useEffect(() => {
    let unsubscribeProducts = null;
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        let targetId = "ceo@ecosole.store"; 
        const rawMemory = localStorage.getItem("launchAxisTempData");
        if (rawMemory) targetId = JSON.parse(rawMemory).email;

        if (user) {
          targetId = user.uid;
        }

        const docRef = doc(db, "users", targetId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const liveData = docSnap.data();
            setCurrentUserEmail(targetId);

            if (liveData.aiArchitecture) {
                setBranding(prev => ({ ...prev, name: liveData.aiArchitecture.businessName, slogan: liveData.aiArchitecture.tagline, industry: liveData.businessType }));
            }

            if (liveData.siteConfig) {
                setSiteConfig(liveData.siteConfig);
            } else if (liveData.aiArchitecture?.colorPalette?.primary) {
                setSiteConfig(prev => ({ ...prev, themeColor: liveData.aiArchitecture.colorPalette.primary }));
            }

            setUserFeatures({ wantsWebsite: true, wantsAccounting: true, wantsBranding: true });

            if (liveData.accounts) setAccounts(liveData.accounts);
            if (liveData.transactions) setTransactions(liveData.transactions);
            if (liveData.inventory) setInventory(liveData.inventory); 
        }

        // --- 1. LIVE PRODUCTS SUBCOLLECTION LISTENER ---
        const productsRef = collection(db, `users/${targetId}/products`);
        unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
            const liveProducts = [];
            snapshot.forEach((docSnap) => {
                liveProducts.push({ id: docSnap.id, ...docSnap.data() });
            });
            setProducts(liveProducts);
        });

        // --- 2. LIVE ORDERS SUBCOLLECTION LISTENER ---
        const ordersRef = collection(db, `users/${targetId}/orders`);
        unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
            const liveOrders = [];
            snapshot.forEach((docSnap) => {
                liveOrders.push({ id: docSnap.id, ...docSnap.data() });
            });
            setOrders(liveOrders);
        });

      } catch (error) {
          console.error("Firebase Sync Error:", error);
      } finally {
          setIsAiLoading(false);
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeProducts) unsubscribeProducts();
        if (unsubscribeOrders) unsubscribeOrders();
    };
  }, []);

  const syncToFirebase = async (field, data) => {
    if (!currentUserEmail) return;
    try {
      const docRef = doc(db, "users", currentUserEmail);
      await updateDoc(docRef, { [field]: data });
    } catch (error) {
      console.error(`Error saving ${field} to Firebase:`, error);
    }
  };

  // --- HELPERS (DECOUPLED FROM FINANCE) ---
  const updateOrderStatus = async (id, status, trackId) => {
    try {
      let targetId = "ceo@ecosole.store"; 
      if (auth.currentUser) targetId = auth.currentUser.uid;

      // Update order status in subcollection directly without touching Finance!
      const orderRef = doc(db, `users/${targetId}/orders`, id);
      await updateDoc(orderRef, { status, trackingId: trackId });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const addTransaction = (tx) => {
    const newTx = {...tx, id: Math.floor(Math.random() * 100000)};
    const updatedList = [newTx, ...transactions];
    setTransactions(updatedList);
    syncToFirebase("transactions", updatedList);
  };
  
  const addAccount = (acc) => {
    const updatedList = [...accounts, { ...acc, id: Math.floor(Math.random() * 100000) }];
    setAccounts(updatedList);
    syncToFirebase("accounts", updatedList);
  };
  
  const updateAccount = (id, updatedData) => {
    const updatedList = accounts.map(acc => acc.id === id ? { ...acc, ...updatedData } : acc);
    setAccounts(updatedList);
    syncToFirebase("accounts", updatedList);
  };

  const addInventoryItem = (item) => {
    const updatedList = [...inventory, { ...item, id: Math.floor(Math.random() * 100000) }];
    setInventory(updatedList);
    syncToFirebase("inventory", updatedList);
  };

  const updateInventoryItem = (id, updatedData) => {
    const updatedList = inventory.map(item => item.id === id ? { ...item, ...updatedData } : item);
    setInventory(updatedList);
    syncToFirebase("inventory", updatedList);
  };

  // --- UPDATED PLACE ORDER LOGIC (FULL NAME & EMAIL) ---
  const placeOrder = async (orderDetails) => {
    const orderId = `ord_${Math.floor(Math.random() * 100000)}`;
    
    const newOrder = {
        customerName: orderDetails.customer.fullName, // Clean single Full Name
        email: orderDetails.customer.email,           // Stored for order notifications
        phone: orderDetails.customer.phone,
        address: `${orderDetails.customer.address}, ${orderDetails.customer.city}`,
        productName: orderDetails.items.map(i => i.name).join(', '),
        qty: orderDetails.items.length,
        amount: orderDetails.total,
        status: 'Pending',
        trackingId: '',
        timestamp: Date.now()
    };

    try {
        let targetId = "ceo@ecosole.store"; 
        if (auth.currentUser) targetId = auth.currentUser.uid;

        // Save directly to subcollection
        const orderRef = doc(db, `users/${targetId}/orders`, orderId);
        await setDoc(orderRef, newOrder);
        
        setCart([]); 
        setIsCartOpen(false); 
        alert("Order Placed Successfully!");
    } catch (error) {
        console.error("Error saving order:", error);
        alert("Failed to place order.");
    }
  };

  if (isAiLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#111', color: '#2dd4bf', fontSize: '24px', fontWeight: 'bold' }}>INITIALIZING LAUNCHAXIS AI KERNEL...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={
          <AdminPanel 
            branding={branding} setBranding={setBranding}
            products={products} setProducts={setProducts}
            orders={orders} updateOrderStatus={updateOrderStatus}
            transactions={transactions} addTransaction={addTransaction}
            accounts={accounts} addAccount={addAccount} updateAccount={updateAccount}
            inventory={inventory} addInventoryItem={addInventoryItem} updateInventoryItem={updateInventoryItem} 
            activeSection={activeSection} setActiveSection={setActiveSection}
            siteConfig={siteConfig} setSiteConfig={setSiteConfig}
            features={userFeatures}
          />
        } />
        <Route path="/checkout" element={<ShopCheckout cart={cart} branding={branding} onPlaceOrder={placeOrder} siteConfig={siteConfig} />} />
        
        <Route path="/catalog" element={
          <>
            <ShopCartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} />
            <ShopCatalog branding={branding} products={products} cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} addToCart={addToCart} siteConfig={siteConfig} openCart={() => setIsCartOpen(true)} />
          </>
        } />

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