import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faBolt, faWallet } from '@fortawesome/free-solid-svg-icons';

const Dashboard = ({ products, transactions, branding, setActiveSection, orders }) => {
  
  // 1. LOGIC FIX: "Total Revenue" (Only counts Product Sales)
  // We ignore 'Capital' or 'Loans' here. Only 'Sales'.
  const salesRevenue = transactions
    .filter(t => t.type === 'income' && t.category === 'Sales')
    .reduce((sum, t) => sum + t.amount, 0);

  // 2. LOGIC: "Total Cash In" (Includes Capital + Sales)
  const totalCashIn = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // 3. LOGIC: "Total Expenses"
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // 4. LOGIC: "Net Profit / Current Balance" 
  // This shows (All Money In - All Money Out) = Actual Cash in Hand
  const currentBalance = totalCashIn - totalExpense;

  // 5. Count Pending Orders
  const pendingOrdersCount = orders 
    ? orders.filter(o => o.status === 'Pending').length 
    : 0;

  return (
    <section className="section active">
      <div className="header">
        <div>
          <h1>Welcome back, CEO</h1>
          <p style={{color:'var(--text-muted)'}}>
            Overview for <strong style={{color:'var(--primary)'}}>{branding.name}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveSection('products')}>
          <span>+</span> Add Product
        </button>
      </div>

      <div className="grid-4">
        {/* TILE 1: SALES REVENUE (Strictly Sales) */}
        <div className="finance-tile">
          <h3>Product Sales</h3>
          <div className="amount">PKR {salesRevenue.toLocaleString()}</div>
          <div className="trend">
            <FontAwesomeIcon icon={faArrowTrendUp} /> From Website Orders
          </div>
        </div>

        {/* TILE 2: ACTIVE PRODUCTS */}
        <div className="finance-tile" style={{borderTopColor: 'var(--accent-purple)'}}>
          <h3>Active Products</h3>
          <div className="amount">{products.length}</div>
          <div className="trend">Live on website</div>
        </div>

        {/* TILE 3: PENDING ORDERS */}
        <div className="finance-tile" style={{borderTopColor: 'var(--danger)'}}>
          <h3>Pending Orders</h3>
          <div className="amount">{pendingOrdersCount}</div>
          <div className="trend">Needs fulfillment</div>
        </div>

        {/* TILE 4: NET BALANCE (Actual Cash in Hand) */}
        <div className="finance-tile" style={{borderTopColor: '#f59e0b'}}>
          <h3>Current Balance</h3>
          <div className="amount" style={{color: currentBalance >= 0 ? 'var(--success)' : 'var(--danger)'}}>
            PKR {currentBalance.toLocaleString()}
          </div>
          <div className="trend">
            <FontAwesomeIcon icon={faWallet} /> Sales + Capital - Expenses
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop: '20px'}}>
        <h3><FontAwesomeIcon icon={faBolt} style={{color:'var(--primary)'}}/> Business Insights</h3>
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