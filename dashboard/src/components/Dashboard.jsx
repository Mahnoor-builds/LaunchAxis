import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, faBolt, faWallet, 
  faIdBadge, faBullseye, faPalette 
} from '@fortawesome/free-solid-svg-icons';

// 1. Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Make sure this path points to your firebase config file!

const Dashboard = ({ products = [], transactions = [], branding, setActiveSection, orders = [] }) => {
  
  // --- AI KERNEL STATE ---
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

  // --- FINANCIAL LOGIC ---
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
    <section className="section active">
      <div className="header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Welcome back, CEO</h1>
          <p style={{color:'var(--text-muted)'}}>
            System Overview for <strong style={{color:'var(--neon-teal, #2dd4bf)'}}>
              {aiData ? aiData.businessName : branding?.name || 'Your Startup'}
            </strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveSection('products')}>
          <span>+</span> Add Product
        </button>
      </div>

      {/* --- PREMIUM AI ARCHITECTURE ROW --- */}
      {loadingKernel ? (
        <div style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          <FontAwesomeIcon icon={faBolt} className="fa-spin" style={{ color: 'var(--neon-teal)', marginRight: '10px' }} />
          Syncing LaunchAxis Kernel Data...
        </div>
      ) : aiData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '3rem' }}>
          
          <div className="card" style={{ gridColumn: '1 / -1', background: 'rgba(15, 15, 15, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '10px' }}>
              <FontAwesomeIcon icon={faIdBadge} style={{ color: 'var(--neon-teal, #2dd4bf)', marginRight: '8px' }} /> Core Identity
            </h4>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0' }}>{aiData.businessName}</h2>
            <p style={{ color: 'var(--neon-teal, #2dd4bf)', fontStyle: 'italic', fontSize: '1.1rem', marginTop: '5px' }}>"{aiData.tagline}"</p>
          </div>

          <div className="card" style={{ background: 'rgba(15, 15, 15, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '10px' }}>
              <FontAwesomeIcon icon={faBullseye} style={{ color: 'var(--neon-teal, #2dd4bf)', marginRight: '8px' }} /> Target Demographic
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>{aiData.targetAudience}</p>
          </div>

          <div className="card" style={{ background: 'rgba(15, 15, 15, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '15px' }}>
              <FontAwesomeIcon icon={faPalette} style={{ color: 'var(--neon-teal, #2dd4bf)', marginRight: '8px' }} /> Generated Palette
            </h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Object.values(aiData.colorPalette).map((color, index) => (
                <div key={index} style={{
                  backgroundColor: color, width: '50px', height: '50px', borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}></div>
              ))}
            </div>
          </div>

        </div>
      ) : null}

      {/* --- EXISTING FINANCIAL TILES --- */}
      <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Live Metrics</h3>
      <div className="grid-4">
        <div className="finance-tile">
          <h3>Product Sales</h3>
          <div className="amount">PKR {salesRevenue.toLocaleString()}</div>
          <div className="trend"><FontAwesomeIcon icon={faArrowTrendUp} /> From Website Orders</div>
        </div>

        <div className="finance-tile" style={{borderTopColor: 'var(--accent-purple, #8B5CF6)'}}>
          <h3>Active Products</h3>
          <div className="amount">{products.length}</div>
          <div className="trend">Live on website</div>
        </div>

        <div className="finance-tile" style={{borderTopColor: 'var(--danger, #ef4444)'}}>
          <h3>Pending Orders</h3>
          <div className="amount">{pendingOrdersCount}</div>
          <div className="trend">Needs fulfillment</div>
        </div>

        <div className="finance-tile" style={{borderTopColor: '#f59e0b'}}>
          <h3>Current Balance</h3>
          <div className="amount" style={{color: currentBalance >= 0 ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'}}>
            PKR {currentBalance.toLocaleString()}
          </div>
          <div className="trend"><FontAwesomeIcon icon={faWallet} /> Sales + Capital - Expenses</div>
        </div>
      </div>

      <div className="card" style={{marginTop: '20px'}}>
        <h3><FontAwesomeIcon icon={faBolt} style={{color:'var(--neon-teal, #2dd4bf)'}}/> Business Insights</h3>
        <p style={{color:'var(--text-muted)'}}>
           {salesRevenue > 0 
             ? `Great job! You have generated PKR ${salesRevenue.toLocaleString()} in pure sales revenue.`
             : "No sales recorded yet. Your current balance is mostly from your Initial Capital."}
        </p>
      </div>
    </section>
  );
};

export default Dashboard;