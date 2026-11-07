import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, faWallet, faPlus,
  faTriangleExclamation, faCheckCircle, faCircle,
  faArrowRight, faBoxOpen, faClock, faUsers,
  faPalette, faBriefcase, faStore, faLightbulb,
  faClipboardCheck, faGlobe
} from '@fortawesome/free-solid-svg-icons';

// Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig'; 

const Dashboard = ({ 
  products = [], 
  transactions = [], 
  branding = {}, 
  setActiveSection, 
  orders = [], 
  features = {}, 
  inventory = [] 
}) => {
  
  const [aiData, setAiData] = useState(null);
  const [loadingKernel, setLoadingKernel] = useState(true);

  useEffect(() => {
    async function fetchKernelData() {
      try {
        let userEmail = auth.currentUser?.email;
        if (!userEmail) {
          const rawMemory = localStorage.getItem("launchAxisTempData");
          if (rawMemory) {
            userEmail = JSON.parse(rawMemory).email;
          }
        }
        
        if (userEmail) {
          const docRef = doc(db, "users", userEmail);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().aiArchitecture) {
            setAiData(docSnap.data().aiArchitecture);
          }
        }
      } catch (error) {
        console.error("Kernel sync failed:", error);
      } finally {
        setLoadingKernel(false);
      }
    }
    fetchKernelData();
  }, []);

  // --- SYNCED FINANCIAL LOGIC (Matches FinancePro.jsx) ---
  const salesRevenue = transactions
    .filter(t => ['income', 'payment_in', 'invoice_out'].includes(t.type) && ['Sales', 'Sales Revenue', 'Website Sales'].includes(t.category))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalCashIn = transactions
    .filter(t => ['income', 'payment_in'].includes(t.type))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => ['expense', 'payment_out'].includes(t.type))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const currentBalance = totalCashIn - totalExpense;

  const pendingOrdersCount = orders 
    ? orders.filter(o => o.status === 'Pending').length 
    : 0;

  // --- INVENTORY ALERTS ---
  const lowStockItems = inventory.filter(item => item.quantity !== null && item.quantity <= (item.lowStockThreshold || 5));

  // --- BUSINESS TYPE CHECK ---
  const isService = branding?.industry === 'service';

  // --- DISPLAY DATA FALLBACKS ---
  const displayBrandName = branding?.name && branding.name !== 'Loading...' 
    ? branding.name 
    : (aiData?.businessName || 'Your Business');
    
  const displayTagline = branding?.slogan || aiData?.tagline || 'Build and scale your operations from one place.';
  const displayAudience = aiData?.targetAudience || 'Everyday customers and clients looking for reliable, high-quality solutions.';
  const displayPalette = aiData?.colorPalette 
    ? Object.values(aiData.colorPalette) 
    : [branding?.color || '#0d9488', '#0f172a', '#f8fafc'];

  // --- INTERACTIVE TO-DO LIST FOR NEW FOUNDERS ---
  const setupTasks = [
    {
      id: 'brand',
      title: 'Review your brand identity & logo',
      desc: 'Customize your colors, fonts, and slogan in the Branding studio.',
      done: Boolean(branding?.logo || (branding?.name && branding?.name !== 'Loading...')),
      actionText: 'Open Branding',
      target: 'branding'
    },
    {
      id: 'catalog',
      title: isService ? 'Add your first service project' : 'Add your first product to sell',
      desc: isService ? 'Showcase your agency work and services to clients.' : 'Upload product photos and prices for your web store.',
      done: products.length > 0 || inventory.length > 0,
      actionText: isService ? 'Add Project' : 'Add Product',
      target: isService ? 'projects' : 'products'
    },
    {
      id: 'finance',
      title: 'Record your starting cash or first sale',
      desc: 'Keep your books clean by logging your opening balance or first receipt.',
      done: transactions.length > 0,
      actionText: 'Open Finance',
      target: 'finance'
    },
    {
      id: 'website',
      title: 'Customize your live website',
      desc: 'Update your homepage headline, biography, and contact links.',
      done: false,
      actionText: 'Edit Website',
      target: 'website'
    }
  ];

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- 1. TOP HEADER BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#ea580c', display: 'block', marginBottom: '4px' }}>
            Daily Overview
          </span>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Business Summary
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveSection('website')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px', borderRadius: '10px', background: '#ffffff', color: '#334155', border: '1px solid #cbd5e1', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
          >
            <FontAwesomeIcon icon={faGlobe} style={{ color: '#6366f1' }} /> Edit Website
          </button>
          <button 
            onClick={() => setActiveSection(isService ? 'projects' : 'products')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '10px', background: '#0f172a', color: '#ffffff', border: 'none', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)' }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ color: '#f97316' }} /> {isService ? 'Add Service / Project' : 'Add New Product'}
          </button>
        </div>
      </div>

      {/* --- 2. FOUR KEY NUMBERS (CLEAR & COLOR-CODED) --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CARD 1: TOTAL SALES (Emerald Accent) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Total Sales</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
              <FontAwesomeIcon icon={faArrowTrendUp} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', wordBreak: 'break-word' }}>
            Rs {salesRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
            {salesRevenue > 0 ? 'Money earned from sales' : 'No sales recorded yet'}
          </div>
        </div>

        {/* CARD 2: CASH IN HAND (Blue Accent) */}
        {features?.wantsAccounting !== false && (
          <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Available Cash</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                <FontAwesomeIcon icon={faWallet} />
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: currentBalance >= 0 ? '#0f172a' : '#dc2626', marginBottom: '6px', wordBreak: 'break-word' }}>
              Rs {currentBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
              Cash received minus expenses
            </div>
          </div>
        )}

        {/* CARD 3: ORDERS / LEADS (Orange/Amber Accent) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
              {isService ? 'Client Inquiries' : 'Orders to Pack'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            {pendingOrdersCount}
          </div>
          <div style={{ fontSize: '12px', color: pendingOrdersCount > 0 ? '#ea580c' : '#64748b', fontWeight: pendingOrdersCount > 0 ? '700' : '500' }}>
            {pendingOrdersCount > 0 ? 'Waiting for your action' : 'All caught up right now'}
          </div>
        </div>

        {/* CARD 4: ACTIVE ITEMS (Indigo Accent) */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>
              {isService ? 'Listed Services' : 'Products in Store'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
              <FontAwesomeIcon icon={isService ? faBriefcase : faBoxOpen} />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
            {products.length}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
            Visible to your visitors
          </div>
        </div>

      </div>

      {/* --- 3. MIDDLE SECTION: TO-DO LIST & BRAND SNAPSHOT --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '24px' }}>
        
        {/* LEFT COLUMN: ACTION ITEMS & LAUNCH CHECKLIST */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faClipboardCheck} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Next Steps & Tasks</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Simple steps to grow and manage your business</p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ea580c', background: '#fff7ed', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fed7aa' }}>
                {setupTasks.filter(t => t.done).length} of {setupTasks.length} Done
              </span>
            </div>

            {/* URGENT ALERTS (IF ANY) */}
            {lowStockItems.length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#dc2626', fontSize: '18px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>Low Stock Warning</div>
                    <div style={{ fontSize: '12px', color: '#b91c1c' }}>
                      {lowStockItems.map(i => `${i.name} (${i.quantity} left)`).join(', ')}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('finance')}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Restock
                </button>
              </div>
            )}

            {pendingOrdersCount > 0 && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FontAwesomeIcon icon={faClock} style={{ color: '#d97706', fontSize: '18px' }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#92400e' }}>
                      You have {pendingOrdersCount} pending {pendingOrdersCount === 1 ? 'order' : 'orders'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#b45309' }}>Review customer details and mark as shipped.</div>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSection('orders')}
                  style={{ background: '#d97706', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  View Orders
                </button>
              </div>
            )}

            {/* STEP-BY-STEP CHECKLIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {setupTasks.map((task) => (
                <div 
                  key={task.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 16px', 
                    borderRadius: '12px', 
                    background: task.done ? '#f8fafc' : '#ffffff', 
                    border: task.done ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: '1 1 200px' }}>
                    <FontAwesomeIcon 
                      icon={task.done ? faCheckCircle : faCircle} 
                      style={{ color: task.done ? '#10b981' : '#cbd5e1', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} 
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: task.done ? '#64748b' : '#0f172a', textDecoration: task.done ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: '1.4' }}>
                        {task.desc}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveSection(task.target)}
                    style={{ 
                      background: task.done ? 'transparent' : '#f1f5f9', 
                      color: task.done ? '#64748b' : '#0f172a', 
                      border: task.done ? '1px solid #e2e8f0' : 'none', 
                      padding: '8px 14px', 
                      borderRadius: '8px', 
                      fontSize: '12px', 
                      fontWeight: '700', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0
                    }}
                  >
                    {task.done ? 'Review' : task.actionText} <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '10px', color: '#ea580c' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HELPFUL TIP FOOTER */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748b' }}>
            <FontAwesomeIcon icon={faLightbulb} style={{ color: '#f59e0b', fontSize: '15px' }} />
            <span>
              <strong style={{ color: '#0f172a' }}>Quick Tip:</strong> Recording every sale and expense in the Finance tab keeps your available cash accurate automatically.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: ONE-GLANCE BRAND & AUDIENCE PROFILE */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faStore} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Your Brand & Customers</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Who you are and who buys from you</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveSection('branding')}
                style={{ background: 'none', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
              >
                Edit Brand
              </button>
            </div>

            {/* BRAND NAME & SLOGAN BOX */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748b', marginBottom: '6px' }}>
                Business Name & Slogan
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', marginBottom: '6px', wordBreak: 'break-word' }}>
                {loadingKernel ? 'Loading Brand...' : displayBrandName}
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#ea580c', lineHeight: '1.4' }}>
                "{displayTagline}"
              </div>
            </div>

            {/* WHO BUYS FROM YOU (TARGET AUDIENCE) */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748b', marginBottom: '8px' }}>
                <FontAwesomeIcon icon={faUsers} style={{ color: '#2563eb' }} /> Best Customers For Your Business
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#1e293b', fontWeight: '500' }}>
                {displayAudience}
              </p>
            </div>

            {/* BRAND COLORS */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748b', marginBottom: '12px' }}>
                <FontAwesomeIcon icon={faPalette} style={{ color: '#059669' }} /> Brand Colors
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {displayPalette.map((color, index) => (
                  <div 
                    key={index} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '6px 12px 6px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  >
                    <span style={{ width: '22px', height: '22px', borderRadius: '6px', backgroundColor: color, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }}></span>
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '700', color: '#334155' }}>
                      {String(color).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
            <span>Business Model: <strong style={{ color: '#0f172a', textTransform: 'capitalize' }}>{isService ? 'Service & Agency' : 'Product Store'}</strong></span>
            <span style={{ color: '#059669', fontWeight: '700' }}>Active & Online</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Dashboard;