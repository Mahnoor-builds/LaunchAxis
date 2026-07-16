import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, faBolt, faWallet, 
  faIdBadge, faBullseye, faPalette, faPlus 
} from '@fortawesome/free-solid-svg-icons';

// 1. Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Make sure this path points to your firebase config file!

const Dashboard = ({ products = [], transactions = [], branding, setActiveSection, orders = [] }) => {
  
  // --- AI KERNEL STATE (UNTOUCHED) ---
  const [aiData, setAiData] = useState(null);
  const [loadingKernel, setLoadingKernel] = useState(true);

  useEffect(() => {
    async function fetchKernelData() {
      try {
        const rawMemory = localStorage.getItem("launchAxisTempData");
        if (rawMemory) {
          const userEmail = JSON.parse(rawMemory).email;
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

  // --- FINANCIAL LOGIC (UNTOUCHED) ---
  const salesRevenue = transactions
    .filter(t => t.type === 'income' && t.category === 'Sales')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCashIn = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalCashIn - totalExpense;

  const pendingOrdersCount = orders 
    ? orders.filter(o => o.status === 'Pending').length 
    : 0;

  return (
    <section className="section active" style={{ paddingBottom: '40px' }}>
      
      {/* --- SLEEK ACTION BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--text-main)' }}>Command Center</h3>
        <button 
          className="btn" 
          style={{ 
            background: 'var(--neon-cyan)', color: '#000', fontWeight: 'bold', 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
            borderRadius: '100px', boxShadow: '0 4px 15px rgba(45, 212, 191, 0.3)' 
          }} 
          onClick={() => setActiveSection('products')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Product
        </button>
      </div>

      {/* --- PREMIUM AI ARCHITECTURE ROW --- */}
      {loadingKernel ? (
        <div style={{ color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--glass-panel)', padding: '20px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
          <FontAwesomeIcon icon={faBolt} className="fa-spin" style={{ color: 'var(--neon-cyan)' }} />
          Syncing LaunchAxis Kernel Data...
        </div>
      ) : aiData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          
          <div className="card" style={{ gridColumn: '1 / -1', background: 'var(--glass-panel)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '32px' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faIdBadge} style={{ color: 'var(--neon-cyan)' }} /> Core Identity
            </h4>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>{aiData.businessName}</h2>
            <p style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', margin: '0' }}>"{aiData.tagline}"</p>
          </div>

          <div className="card" style={{ background: 'var(--glass-panel)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faBullseye} style={{ color: 'var(--neon-cyan)' }} /> Target Demographic
            </h4>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-light)', margin: 0 }}>{aiData.targetAudience}</p>
          </div>

          <div className="card" style={{ background: 'var(--glass-panel)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faPalette} style={{ color: 'var(--neon-cyan)' }} /> Generated Palette
            </h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              {Object.values(aiData.colorPalette).map((color, index) => (
                <div key={index} style={{
                  backgroundColor: color, width: '48px', height: '48px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.1)', boxShadow: `0 0 20px ${color}40`
                }}></div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* --- ENTERPRISE METRICS MATRIX --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-light)' }}>Live Metrics</h3>
        <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--glass-border), transparent)' }}></div>
      </div>
      
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {/* We removed the old inline border colors and replaced them with glass variables */}
        <div className="card" style={{ background: 'var(--glass-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--neon-cyan)', opacity: 0.5 }}></div>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Product Sales</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>PKR {salesRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}><FontAwesomeIcon icon={faArrowTrendUp} /> From Website Orders</div>
        </div>

        <div className="card" style={{ background: 'var(--glass-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Active Products</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>{products.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>Live on website</div>
        </div>

        <div className="card" style={{ background: 'var(--glass-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Pending Orders</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>{pendingOrdersCount}</div>
          <div style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>Needs fulfillment</div>
        </div>

        <div className="card" style={{ background: 'var(--glass-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px', boxShadow: 'inset 0 0 40px rgba(45, 212, 191, 0.05)' }}>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Current Balance</h3>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: currentBalance >= 0 ? 'var(--text-light)' : '#ef4444' }}>
            PKR {currentBalance.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}><FontAwesomeIcon icon={faWallet} /> Sales + Capital - Expenses</div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--glass-panel)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '24px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FontAwesomeIcon icon={faBolt} style={{color:'var(--neon-cyan)'}}/> Business Insights
        </h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
           {salesRevenue > 0 
             ? `Great job! You have generated PKR ${salesRevenue.toLocaleString()} in pure sales revenue.`
             : "No sales recorded yet. Your current balance is mostly from your Initial Capital."}
        </p>
      </div>
    </section>
  );
};

export default Dashboard;