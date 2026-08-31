import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowTrendUp, faBolt, faWallet, 
  faIdBadge, faBullseye, faPalette, faPlus,
  faChartLine, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// 1. Firebase Imports
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 

const Dashboard = ({ products = [], transactions = [], branding, setActiveSection, orders = [], features, inventory = [] }) => {
  
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

  // --- CHART LOGIC ---
  const chartData = transactions.map((t) => ({
    name: t.date.slice(0,5),
    amount: t.amount,
    type: t.type
  })).slice(-7);

  // --- INVENTORY LOGIC (For Phase 3) ---
  const lowStockItems = inventory.filter(item => item.quantity <= (item.lowStockThreshold || 5));

  return (
    <section className="section active" style={{ paddingBottom: '40px' }}>
      
      {/* --- SLEEK ACTION BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: 'var(--text-dark)' }}>Command Center</h3>
        <button 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '100px', flex: '1 1 auto', justifyContent: 'center', maxWidth: '200px' }} 
          onClick={() => setActiveSection('products')}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Product
        </button>
      </div>

      {/* --- PREMIUM AI ARCHITECTURE ROW --- */}
      {loadingKernel ? (
        <div style={{ color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }} className="card">
          <FontAwesomeIcon icon={faBolt} className="fa-spin" style={{ color: 'var(--neon-cyan)' }} />
          Syncing LaunchAxis Kernel Data...
        </div>
      ) : aiData ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '24px', marginBottom: '40px' }}>
          
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faIdBadge} style={{ color: 'var(--neon-cyan)' }} /> Core Identity
            </h4>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px', color: 'var(--text-dark)', wordBreak: 'break-word' }}>{aiData.businessName}</h2>
            <p style={{ color: 'var(--neon-cyan)', fontSize: '1.2rem', margin: '0', fontWeight: '600', lineHeight: '1.4' }}>"{aiData.tagline}"</p>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faBullseye} style={{ color: 'var(--neon-cyan)' }} /> Target Demographic
            </h4>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-dark)', margin: 0 }}>{aiData.targetAudience}</p>
          </div>

          <div className="card">
            <h4 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faPalette} style={{ color: 'var(--neon-cyan)' }} /> Generated Palette
            </h4>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.values(aiData.colorPalette).map((color, index) => (
                <div key={index} style={{
                  backgroundColor: color, width: '48px', height: '48px', borderRadius: '50%',
                  border: `1px solid #e2e8f0`
                }}></div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* --- ENTERPRISE METRICS MATRIX --- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-dark)' }}>Live Metrics</h3>
        <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }}></div>
      </div>
      
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--neon-cyan)' }}></div>
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Product Sales</h3>
          <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)', wordBreak: 'break-word' }}>PKR {salesRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontWeight: '600' }}><FontAwesomeIcon icon={faArrowTrendUp} /> From Website Orders</div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Active Products</h3>
          <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)' }}>{products.length}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>Live on website</div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Pending Orders</h3>
          <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)' }}>{pendingOrdersCount}</div>
          <div style={{ fontSize: '12px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>Needs fulfillment</div>
        </div>

        {/* CONDITIONALLY RENDER BALANCE VS GROSS REVENUE */}
        {features?.wantsAccounting ? (
          <div className="card" style={{ background: '#f8fafc' }}>
            <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Current Balance</h3>
            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: currentBalance >= 0 ? 'var(--text-dark)' : '#ef4444', wordBreak: 'break-word' }}>
              PKR {currentBalance.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}><FontAwesomeIcon icon={faWallet} /> Sales + Capital - Expenses</div>
          </div>
        ) : (
          <div className="card" style={{ background: '#f8fafc' }}>
             <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', letterSpacing: '1px' }}>Gross Revenue</h3>
             <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-dark)', wordBreak: 'break-word' }}>
                PKR {salesRevenue.toLocaleString()}
             </div>
             <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>Total E-commerce Earnings</div>
          </div>
        )}
      </div>

      {/* --- CONDITIONAL CASH FLOW CHART --- */}
      {features?.wantsAccounting && (
        <div className="card" style={{ height: '350px', marginBottom: '24px', overflow: 'hidden' }}>
          <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', fontSize: '16px' }}>
            <FontAwesomeIcon icon={faChartLine} style={{color:'var(--neon-cyan)', marginRight: '8px'}} /> 
            Cash Flow (In/Out)
          </h3>
          <div style={{ width: '100%', height: '260px' }}>
             <ResponsiveContainer>
                 <AreaChart data={chartData}>
                     <defs>
                         <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                             <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                         </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                     <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                     <Tooltip contentStyle={{backgroundColor:'#ffffff', border:'1px solid #e2e8f0', borderRadius:'8px', color: '#1e293b'}} />
                     <Area type="monotone" dataKey="amount" stroke="#2dd4bf" fill="url(#colorSplit)" />
                 </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- INVENTORY ALERTS (Shows if low stock exists) --- */}
      {lowStockItems.length > 0 && (
         <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '24px', background: '#fef2f2' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#991b1b', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
               <FontAwesomeIcon icon={faTriangleExclamation} /> Critical Inventory Alert
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#7f1d1d' }}>The following items are running dangerously low:</p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#991b1b', fontSize: '14px', fontWeight: '600' }}>
               {lowStockItems.map((item, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{item.name} — Only {item.quantity} left in stock!</li>
               ))}
            </ul>
         </div>
      )}

      <div className="card">
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', color: 'var(--text-dark)' }}>
          <FontAwesomeIcon icon={faBolt} style={{color:'var(--neon-cyan)'}}/> Business Insights
        </h3>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
           {salesRevenue > 0 
             ? `Great job! You have generated PKR ${salesRevenue.toLocaleString()} in pure sales revenue.`
             : "No sales recorded yet. Keep pushing your marketing efforts to get that first order!"}
        </p>
      </div>
    </section>
  );
};

export default Dashboard;