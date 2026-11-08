import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPrint, faAddressBook, faFileInvoiceDollar, 
  faPlus, faUserPlus, faPenToSquare,
  faBoxOpen, faBoxesStacked, faTriangleExclamation, faGlobe, faTags,
  faMoneyBillWave, faBuildingColumns, faUserTie, faHashtag, faBox, faTruckFast,
  faLightbulb, faCheckCircle, faFileInvoice, faReceipt, faMoneyCheckDollar,
  faArrowTrendUp, faArrowTrendDown, faWallet, faClock, faLayerGroup,
  faCalendarDays, faTimesCircle, faPhone, faLocationDot
} from '@fortawesome/free-solid-svg-icons';

const FinancePro = ({ 
  transactions = [], 
  accounts = [], 
  addAccount, 
  updateAccount, 
  branding = {}, 
  addTransaction, 
  inventory = [], 
  addInventoryItem, 
  updateInventoryItem 
}) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [currency, setCurrency] = useState('Rs');
  
  // --- FORMS & STATE (UNCHANGED) ---
  const [txForm, setTxForm] = useState({ desc: '', amount: '', type: 'payment_in', category: 'Sales Revenue', accountId: '' });
  const [accForm, setAccForm] = useState({ name: '', category: 'Customer', phone: '', address: '' });
  const [editingAccountId, setEditingAccountId] = useState(null); 
  
  const [invForm, setInvForm] = useState({ name: '', type: 'Finished Goods', quantity: '', baseCost: '', shipping: '', sellingPrice: '', lowStockThreshold: '5' });
  const [editingInvId, setEditingInvId] = useState(null);

  const [reportFilter, setReportFilter] = useState('all'); 
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Custom UI Alert Modal (Replaces browser alert)
  const [uiAlert, setUiAlert] = useState({ show: false, title: '', message: '' });
  const triggerAlert = (title, message) => setUiAlert({ show: true, title, message });

  // --- QUOTA LOGIC (CADET / FREE PLAN) ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const txThisMonth = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  }).length;
  
  const FREE_TX_LIMIT = 50;
  const isTxLimitReached = txThisMonth >= FREE_TX_LIMIT;

  // --- SMART BALANCE CALCULATOR (UNCHANGED) ---
  const getAccountStatus = (account) => {
    let balance = 0;
    const accTx = transactions.filter(t => t.accountId == account.id);
    
    if (account.category === 'Customer') {
        const invoiced = accTx.filter(t => t.type === 'invoice_out').reduce((sum, t) => sum + t.amount, 0);
        const paid = accTx.filter(t => t.type === 'payment_in' || t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        balance = invoiced - paid;
        return { balance, text: balance > 0 ? 'Awaiting Payment' : balance < 0 ? 'Account in Credit' : 'Fully Settled', color: balance > 0 ? '#ea580c' : '#059669', bg: balance > 0 ? '#fff7ed' : '#ecfdf5' };
    } 
    else if (account.category === 'Supplier') {
        const billed = accTx.filter(t => t.type === 'bill_in').reduce((sum, t) => sum + t.amount, 0);
        const paid = accTx.filter(t => t.type === 'payment_out' || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        balance = billed - paid;
        return { balance, text: balance > 0 ? 'Unpaid Balance' : balance < 0 ? 'Supplier Owes You' : 'Fully Settled', color: balance > 0 ? '#dc2626' : '#059669', bg: balance > 0 ? '#fef2f2' : '#ecfdf5' };
    }
    else {
        const moneyIn = accTx.filter(t => t.type === 'payment_in' || t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const moneyOut = accTx.filter(t => t.type === 'payment_out' || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        balance = moneyIn - moneyOut;
        return { balance, text: 'Available Cash', color: '#2563eb', bg: '#eff6ff' };
    }
  };

  // --- SUMMARY METRICS FOR TOP BENTO ROW ---
  const totalCashReceived = transactions
    .filter(t => ['payment_in', 'income'].includes(t.type))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalCashPaid = transactions
    .filter(t => ['payment_out', 'expense'].includes(t.type))
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalReceivables = accounts
    .filter(a => a.category === 'Customer')
    .reduce((sum, a) => {
      const { balance } = getAccountStatus(a);
      return sum + (balance > 0 ? balance : 0);
    }, 0);

  const totalPayables = accounts
    .filter(a => a.category === 'Supplier')
    .reduce((sum, a) => {
      const { balance } = getAccountStatus(a);
      return sum + (balance > 0 ? balance : 0);
    }, 0);

  // Inventory Math
  const qty = parseFloat(invForm.quantity) || 0;
  const base = parseFloat(invForm.baseCost) || 0;
  const ship = parseFloat(invForm.shipping) || 0;
  const sell = parseFloat(invForm.sellingPrice) || 0;
  const unitLandedCost = qty > 0 ? base + (ship / qty) : base;
  const expectedProfit = sell - unitLandedCost;

  // --- SUBMIT LOGIC (UNCHANGED) ---
  const handleTxSubmit = () => {
    if(isTxLimitReached) return triggerAlert("Limit Reached", "Monthly transaction limit reached on the Free plan.");
    if(!txForm.desc || !txForm.amount || !txForm.accountId) return triggerAlert("Missing Details", "Please select a contact, enter a description, and specify the amount.");
    const selectedAcc = accounts.find(a => a.id == txForm.accountId);
    addTransaction({ ...txForm, amount: parseFloat(txForm.amount), date: new Date().toLocaleDateString(), accountName: selectedAcc ? selectedAcc.name : 'Unknown Account' });
    setTxForm({ desc: '', amount: '', type: 'payment_in', category: 'Sales Revenue', accountId: '' }); 
  };

  const handleAccountSubmit = () => {
    if(!accForm.name) return triggerAlert("Missing Name", "Please enter a contact or company name.");
    if (editingAccountId) { updateAccount(editingAccountId, { ...accForm }); setEditingAccountId(null); } 
    else { addAccount({ ...accForm }); }
    setAccForm({ name: '', category: 'Customer', phone: '', address: '' });
  };

  const handleInvSubmit = () => {
    if(!invForm.name || !invForm.baseCost) return triggerAlert("Missing Details", "Please enter a product name and unit base cost.");
    const itemData = {
        name: invForm.name, type: invForm.type, baseCost: parseFloat(invForm.baseCost),
        shipping: parseFloat(invForm.shipping || 0), landedCost: unitLandedCost, sellingPrice: parseFloat(invForm.sellingPrice || 0),
        quantity: invForm.type === 'Finished Goods' ? parseInt(invForm.quantity || 0) : null,
        lowStockThreshold: invForm.type === 'Finished Goods' ? parseInt(invForm.lowStockThreshold || 5) : null
    };
    if (editingInvId) { updateInventoryItem(editingInvId, itemData); setEditingInvId(null); } 
    else { addInventoryItem(itemData); }
    setInvForm({ name: '', type: 'Finished Goods', quantity: '', baseCost: '', shipping: '', sellingPrice: '', lowStockThreshold: '5' });
  };

  const handleEditClick = (acc) => { setAccForm({ name: acc.name, category: acc.category, phone: acc.phone || '', address: acc.address || '' }); setEditingAccountId(acc.id); };
  const handleCancelEdit = () => { setAccForm({ name: '', category: 'Customer', phone: '', address: '' }); setEditingAccountId(null); };
  
  const handleEditInvClick = (item) => { setInvForm({ name: item.name, type: item.type, quantity: item.quantity || '', baseCost: item.baseCost, shipping: item.shipping || '', sellingPrice: item.sellingPrice || '', lowStockThreshold: item.lowStockThreshold || '5' }); setEditingInvId(item.id); };
  const handleCancelInvEdit = () => { setInvForm({ name: '', type: 'Finished Goods', quantity: '', baseCost: '', shipping: '', sellingPrice: '', lowStockThreshold: '5' }); setEditingInvId(null); };

  // --- NATIVE HTML PRINT GENERATOR (UNCHANGED) ---
  const printLedger = () => {
    let filteredTx = transactions;

    const normalizeDate = (dateString) => {
        const d = new Date(dateString);
        d.setHours(0, 0, 0, 0); 
        return d.getTime();
    };
    
    if (reportFilter !== 'all') {
        filteredTx = filteredTx.filter(tx => tx.accountId == reportFilter || tx.accountName === reportFilter);
    }
    if (dateRange.from) {
        filteredTx = filteredTx.filter(tx => normalizeDate(tx.date) >= normalizeDate(dateRange.from));
    }
    if (dateRange.to) {
        filteredTx = filteredTx.filter(tx => normalizeDate(tx.date) <= normalizeDate(dateRange.to));
    }

    let totalIncome = 0;
    let totalExpense = 0;
    
    const tableRowsHTML = filteredTx.map(tx => {
        if (['payment_in', 'invoice_out', 'income'].includes(tx.type)) {
            totalIncome += parseFloat(tx.amount);
        } else {
            totalExpense += parseFloat(tx.amount);
        }
        
        let typeLabel = tx.type;
        if (tx.type === 'invoice_out') typeLabel = 'Sales Invoice';
        if (tx.type === 'payment_in') typeLabel = 'Cash Receipt';
        if (tx.type === 'bill_in') typeLabel = 'Supplier Bill';
        if (tx.type === 'payment_out') typeLabel = 'Cash Payment';

        return `
            <tr>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; color: #475569;">${tx.date}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${tx.desc}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${tx.category || 'General'}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${typeLabel}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; font-weight: 800; text-align: right;">${currency} ${parseFloat(tx.amount).toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const net = totalIncome - totalExpense;
    const brandName = branding?.name || 'LaunchAxis Store';
    const accountLabel = reportFilter === 'all' ? 'Master Ledger (All Accounts)' : `Target Account: ${accounts.find(a => a.id == reportFilter)?.name || reportFilter}`;

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${brandName} - Financial Statement</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; margin: 0; }
                .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
                .header h1 { margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
                .header p { margin: 5px 0 0 0; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; }
                .meta { margin-bottom: 40px; line-height: 1.8; background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; text-align: left; }
                th { background: #0f172a; color: #fff; padding: 14px; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
                th:last-child { text-align: right; }
                .empty-state { text-align: center; padding: 40px; color: #94a3b8; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
                .totals-box { width: 350px; margin-left: auto; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .totals-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #475569; font-weight: 600; font-size: 14px; }
                .totals-row.net { margin-top: 15px; padding-top: 15px; border-top: 1px solid #cbd5e1; font-size: 18px; color: #0f172a; font-weight: 900; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>${brandName}</h1>
                    <p>Official Financial Statement</p>
                </div>
                <div style="text-align: right; font-size: 12px; color: #64748b; font-weight: 600;">
                    Generated<br/>
                    <span style="color: #0f172a; font-size: 14px;">${new Date().toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="meta">
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 800; margin-bottom: 4px;">Statement For</div>
                <strong style="font-size: 18px; color: #0f172a;">${accountLabel}</strong><br>
                <div style="margin-top: 8px; font-size: 14px; color: #475569;"><strong>Period:</strong> ${dateRange.from || 'Beginning of time'} &nbsp;&mdash;&nbsp; ${dateRange.to || 'Present'}</div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRowsHTML || '<tr><td colspan="5" class="empty-state">No transactions found for this period.</td></tr>'}
                </tbody>
            </table>

            <div class="totals-box">
                <div class="totals-row">
                    <span>Total Money In</span>
                    <span>${currency} ${totalIncome.toLocaleString()}</span>
                </div>
                <div class="totals-row">
                    <span>Total Money Out</span>
                    <span>${currency} ${totalExpense.toLocaleString()}</span>
                </div>
                <div class="totals-row net">
                    <span>Net Movement</span>
                    <span style="color: ${net >= 0 ? '#10b981' : '#ef4444'}">${currency} ${net.toLocaleString()}</span>
                </div>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };

  // --- REFINED BENTO SAAS STYLES ---
  const bentoCardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    flex: '1 1 340px'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155'
  };

  const saasInputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    marginBottom: '18px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const primaryBtnStyle = {
    width: '100%',
    padding: '14px 20px',
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
    transition: 'all 0.2s ease'
  };

  const navTabs = [
    { id: 'overview', label: 'Ledger & Cash', icon: faWallet, color: '#2563eb' },
    { id: 'directory', label: 'Contacts', icon: faAddressBook, color: '#ea580c' },
    { id: 'inventory', label: 'Inventory', icon: faBoxesStacked, color: '#059669' },
    { id: 'reports', label: 'Statements', icon: faFileInvoiceDollar, color: '#4f46e5' }
  ];

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- 1. TOP HEADER & NAVIGATION BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#2563eb', display: 'block', marginBottom: '4px' }}>
            Accounting & Stock
          </span>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Financial Center
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Currency Selector Pill */}
          <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', padding: '0 14px', height: '42px', borderRadius: '10px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
            <FontAwesomeIcon icon={faGlobe} style={{ color: '#2563eb', marginRight: '8px', fontSize: '14px' }} />
            <select 
              style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: '700', color: '#0f172a', cursor: 'pointer', fontSize: '13px', margin: 0, padding: 0 }} 
              value={currency} 
              onChange={e => setCurrency(e.target.value)}
            >
              <option value="Rs">PKR (Rs)</option>
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
            </select>
          </div>

          {/* Segmented Pill Navigation */}
          <div style={{ background: '#e2e8f0', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  style={{ 
                    padding: '8px 16px', 
                    borderRadius: '9px', 
                    border: 'none', 
                    background: isActive ? '#ffffff' : 'transparent', 
                    color: isActive ? '#0f172a' : '#475569',
                    fontWeight: isActive ? '800' : '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <FontAwesomeIcon icon={tab.icon} style={{ color: isActive ? tab.color : '#64748b', fontSize: '13px' }} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- 2. FOUR KEY FINANCIAL PULSE CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CASH IN */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Cash Received</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faArrowTrendUp} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {currency} {totalCashReceived.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Total money in</div>
        </div>

        {/* CASH OUT */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Cash Paid Out</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faArrowTrendDown} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {currency} {totalCashPaid.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>Expenses & bills paid</div>
        </div>

        {/* RECEIVABLES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Customers Owe You</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faClock} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {currency} {totalReceivables.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>Pending sales invoices</div>
        </div>

        {/* PAYABLES */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>You Owe Suppliers</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faFileInvoice} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {currency} {totalPayables.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>Unpaid supplier bills</div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW (LEDGER & CASH ENTRY)                     */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
           
          {/* LEFT CARD: RECORD TRANSACTION */}
          <div style={bentoCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>New Ledger Entry</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Log a receipt, payment, or invoice</p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: isTxLimitReached ? '#dc2626' : '#ea580c', background: isTxLimitReached ? '#fef2f2' : '#fff7ed', border: isTxLimitReached ? '1px solid #fecaca' : '1px solid #fed7aa', padding: '4px 10px', borderRadius: '20px' }}>
                {txThisMonth} / {FREE_TX_LIMIT} Entries
              </span>
            </div>
            
            <label style={labelStyle}>
              <FontAwesomeIcon icon={faMoneyCheckDollar} style={{ color: '#2563eb' }} /> Entry Type
            </label>
            <select 
              style={saasInputStyle} 
              value={txForm.type} 
              onChange={e=>setTxForm({...txForm, type:e.target.value, category: (e.target.value === 'payment_in' || e.target.value === 'invoice_out') ? 'Sales Revenue' : 'General Expense'})} 
              disabled={isTxLimitReached}
            >
              <optgroup label="Cash Movement">
                <option value="payment_in">Cash Receipt</option>
                <option value="payment_out">Cash Payment</option>
              </optgroup>
              <optgroup label="Credit & Invoices">
                <option value="invoice_out">Sales Invoice</option>
                <option value="bill_in">Supplier Bill</option>
              </optgroup>
            </select>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ flex: '1 1 150px' }}>
                <label style={labelStyle}>
                  <FontAwesomeIcon icon={faUserTie} style={{ color: '#ea580c' }} /> Account / Contact
                </label>
                <select 
                  style={saasInputStyle} 
                  value={txForm.accountId} 
                  onChange={e=>setTxForm({...txForm, accountId:e.target.value})} 
                  disabled={isTxLimitReached}
                >
                  <option value="">Select Account</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.category})</option>)}
                </select>
              </div>

              <div style={{ flex: '1 1 150px' }}>
                <label style={labelStyle}>
                  <FontAwesomeIcon icon={faTags} style={{ color: '#059669' }} /> Category
                </label>
                <select 
                  style={saasInputStyle} 
                  value={txForm.category} 
                  onChange={e=>setTxForm({...txForm, category:e.target.value})} 
                  disabled={isTxLimitReached}
                >
                  <option value="Sales Revenue">Sales Revenue</option>
                  <option value="Owner Capital">Owner Capital</option>
                  <option value="Inventory Purchase">Inventory Purchase</option>
                  <option value="Payroll">Payroll & Salary</option>
                  <option value="Shipping">Shipping & Delivery</option>
                  <option value="Marketing">Marketing & Ads</option>
                  <option value="General Expense">General Expense</option>
                </select>
              </div>
            </div>

            <label style={labelStyle}>
              <FontAwesomeIcon icon={faPenToSquare} style={{ color: '#4f46e5' }} /> Description
            </label>
            <input 
              style={saasInputStyle} 
              placeholder="e.g. Initial capital deposit or Client design fee" 
              value={txForm.desc} 
              onChange={e=>setTxForm({...txForm, desc:e.target.value})} 
              disabled={isTxLimitReached} 
            />
            
            <label style={labelStyle}>
              <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#059669' }} /> Amount ({currency})
            </label>
            <div style={{ position: 'relative', marginBottom: '22px' }}>
              <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b', fontWeight: '800', fontSize: '14px' }}>{currency}</span>
              <input 
                style={{ ...saasInputStyle, marginBottom: 0, paddingLeft: '42px', fontSize: '16px', fontWeight: '800' }} 
                type="number" 
                placeholder="0.00" 
                value={txForm.amount} 
                onChange={e=>setTxForm({...txForm, amount:e.target.value})} 
                disabled={isTxLimitReached} 
              />
            </div>

            {isTxLimitReached && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} /> Monthly limit of 50 entries reached. Upgrade to unlock unlimited bookkeeping.
              </div>
            )}

            <button 
              style={{ ...primaryBtnStyle, opacity: isTxLimitReached ? 0.5 : 1, cursor: isTxLimitReached ? 'not-allowed' : 'pointer' }} 
              onClick={handleTxSubmit} 
              disabled={isTxLimitReached}
            >
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} /> Save Transaction
            </button>
          </div>
           
          {/* RIGHT CARD: RECENT TRANSACTIONS */}
          <div style={bentoCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faReceipt} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Recent Activity</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Complete history of your logged entries</p>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{transactions.length} Total</span>
            </div>

            <div style={{ maxHeight: '440px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <FontAwesomeIcon icon={faReceipt} style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '10px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>No transactions recorded yet</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Use the form on the left to log your starting balance or first sale.</div>
                </div>
              ) : transactions.map((t) => {
                const isMoneyIn = ['payment_in', 'invoice_out', 'income'].includes(t.type);
                
                let typeLabel = 'Entry';
                if (t.type === 'invoice_out') typeLabel = 'Sales Invoice';
                if (t.type === 'payment_in') typeLabel = 'Cash Receipt';
                if (t.type === 'bill_in') typeLabel = 'Supplier Bill';
                if (t.type === 'payment_out') typeLabel = 'Cash Payment';

                return (
                  <div 
                    key={t.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '14px 16px', 
                      background: '#f8fafc', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: isMoneyIn ? '#ecfdf5' : '#fef2f2', 
                        color: isMoneyIn ? '#059669' : '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                      }}>
                        <FontAwesomeIcon icon={isMoneyIn ? faArrowTrendUp : faArrowTrendDown} />
                      </div>
                      <div>
                        <div style={{ color: '#0f172a', fontWeight: '700', fontSize: '14px', marginBottom: '4px', wordBreak: 'break-word' }}>
                          {t.desc}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{t.date} • {t.accountName}</span>
                          <span style={{ fontSize: '10px', background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                            {t.category || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: isMoneyIn ? '#059669' : '#dc2626' }}>
                        {isMoneyIn ? '+' : '-'}{currency} {parseFloat(t.amount).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginTop: '2px', fontWeight: '700' }}>
                        {typeLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CONTACTS & DIRECTORY                               */}
      {/* ========================================================= */}
      {activeTab === 'directory' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* ADD / EDIT CONTACT */}
          <div style={{ ...bentoCardStyle, border: editingAccountId ? '2px solid #ea580c' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  {editingAccountId ? 'Update Contact Profile' : 'Add Client or Vendor'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Create accounts to track balances</p>
              </div>
            </div>
            
            <label style={labelStyle}><FontAwesomeIcon icon={faBuildingColumns} style={{ color: '#2563eb' }} /> Contact or Company Name</label>
            <input style={saasInputStyle} value={accForm.name} onChange={e=>setAccForm({...accForm, name:e.target.value})} placeholder="e.g. Apex Digital Agency" />
            
            <label style={labelStyle}><FontAwesomeIcon icon={faTags} style={{ color: '#ea580c' }} /> Account Type</label>
            <select style={saasInputStyle} value={accForm.category} onChange={e=>setAccForm({...accForm, category:e.target.value})}>
              <option value="Customer">Customer / Client</option>
              <option value="Supplier">Supplier / Vendor</option>
              <option value="Employee">Staff / Employee</option>
              <option value="Bank">Bank / Cash Register</option>
            </select>

            <label style={labelStyle}><FontAwesomeIcon icon={faPhone} style={{ color: '#059669' }} /> Phone Number</label>
            <input style={saasInputStyle} value={accForm.phone} onChange={e=>setAccForm({...accForm, phone:e.target.value})} placeholder="0300-1234567" />
            
            <label style={labelStyle}><FontAwesomeIcon icon={faLocationDot} style={{ color: '#4f46e5' }} /> Billing Address</label>
            <input style={{ ...saasInputStyle, marginBottom: '24px' }} value={accForm.address} onChange={e=>setAccForm({...accForm, address:e.target.value})} placeholder="Office or Street Address" />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...primaryBtnStyle, flex: 1 }} onClick={handleAccountSubmit}>
                <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#f97316' }} /> {editingAccountId ? 'Save Changes' : 'Save Contact'}
              </button>
              {editingAccountId && (
                <button 
                  style={{ padding: '14px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', cursor: 'pointer' }} 
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* DIRECTORY LIST */}
          <div style={bentoCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faAddressBook} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Account Balances</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Track who owes you and who you owe</p>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{accounts.length} Saved</span>
            </div>

            <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {accounts.map(acc => {
                const status = getAccountStatus(acc);
                return (
                  <div 
                    key={acc.id} 
                    style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}
                  >
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>{acc.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                        {acc.category} • {acc.phone || 'No phone added'}
                      </div>
                      <button 
                        style={{ padding: '5px 12px', fontSize: '11px', marginTop: '10px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', cursor: 'pointer' }} 
                        onClick={() => handleEditClick(acc)}
                      >
                        <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: '6px', color: '#ea580c' }} /> Edit Details
                      </button>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: status.color, background: status.bg, padding: '4px 8px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px' }}>
                        {status.text}
                      </span>
                      <div style={{ fontWeight: '900', color: '#0f172a', fontSize: '19px' }}>
                        {currency} {Math.abs(status.balance).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: INVENTORY & COST CALCULATOR                        */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          
          <div style={bentoCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  {editingInvId ? 'Edit Stock Item' : 'Add Stock & Calculate Margin'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Calculate landed unit cost and expected profit</p>
              </div>
            </div>
            
            <label style={labelStyle}><FontAwesomeIcon icon={faBox} style={{ color: '#2563eb' }} /> Item Name</label>
            <input style={saasInputStyle} value={invForm.name} onChange={e=>setInvForm({...invForm, name:e.target.value})} placeholder="e.g. Signature Perfume 50ml" />
            
            <label style={labelStyle}><FontAwesomeIcon icon={faLayerGroup} style={{ color: '#ea580c' }} /> Stock Category</label>
            <select style={saasInputStyle} value={invForm.type} onChange={e=>setInvForm({...invForm, type:e.target.value})}>
              <option value="Finished Goods">Retail Product (Ready for Sale)</option>
              <option value="Raw Materials">Raw Material / Packaging</option>
            </select>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ flex: '1 1 130px' }}>
                <label style={labelStyle}><FontAwesomeIcon icon={faHashtag} style={{ color: '#4f46e5' }} /> Quantity</label>
                <input type="number" style={saasInputStyle} value={invForm.quantity} onChange={e=>setInvForm({...invForm, quantity:e.target.value})} placeholder="50" />
              </div>
              <div style={{ flex: '1 1 130px' }}>
                <label style={labelStyle}><FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#059669' }} /> Unit Cost ({currency})</label>
                <input type="number" style={saasInputStyle} value={invForm.baseCost} onChange={e=>setInvForm({...invForm, baseCost:e.target.value})} placeholder="0.00" />
              </div>
            </div>

            <label style={labelStyle}><FontAwesomeIcon icon={faTruckFast} style={{ color: '#ea580c' }} /> Batch Delivery / Shipping Fee ({currency})</label>
            <input type="number" style={{ ...saasInputStyle, marginBottom: '12px' }} value={invForm.shipping} onChange={e=>setInvForm({...invForm, shipping:e.target.value})} placeholder="0.00" />
            
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 14px', borderRadius: '10px', marginBottom: '18px', fontSize: '12px', color: '#1e40af', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faLightbulb} style={{ color: '#2563eb' }} /> True Landed Cost: {currency} {unitLandedCost.toFixed(2)} per unit
            </div>

            {invForm.type === 'Finished Goods' && (
              <>
                <label style={labelStyle}><FontAwesomeIcon icon={faTags} style={{ color: '#059669' }} /> Retail Selling Price ({currency})</label>
                <input type="number" style={saasInputStyle} value={invForm.sellingPrice} onChange={e=>setInvForm({...invForm, sellingPrice:e.target.value})} placeholder="0.00" />
                
                <div style={{ background: expectedProfit > 0 ? '#ecfdf5' : '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '22px', border: expectedProfit > 0 ? '1px solid #a7f3d0' : '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '13px', color: expectedProfit > 0 ? '#059669' : '#64748b', margin: 0, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {expectedProfit > 0 ? `Net Profit Margin: ${currency} ${expectedProfit.toFixed(2)} per unit sold` : 'Enter cost and selling price to preview profit'}
                  </p>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{ ...primaryBtnStyle, flex: 1 }} onClick={handleInvSubmit}>
                <FontAwesomeIcon icon={faPlus} style={{ color: '#10b981' }} /> {editingInvId ? 'Update Stock' : 'Save to Warehouse'}
              </button>
              {editingInvId && (
                <button style={{ padding: '14px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', cursor: 'pointer' }} onClick={handleCancelInvEdit}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* WAREHOUSE LIST */}
          <div style={bentoCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faBoxesStacked} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Warehouse Inventory</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Current stock levels and unit economics</p>
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>{inventory.length} Items</span>
            </div>

            <div style={{ maxHeight: '450px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {inventory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '28px', color: '#94a3b8', marginBottom: '10px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>Your warehouse is empty</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Add retail items or packaging materials to track unit costs.</div>
                </div>
              ) : inventory.map(item => (
                <div 
                  key={item.id} 
                  style={{ padding: '18px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}
                >
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.name}
                      <span style={{ fontSize: '10px', background: item.type === 'Finished Goods' ? '#eef2ff' : '#fff7ed', color: item.type === 'Finished Goods' ? '#4f46e5' : '#ea580c', padding: '3px 8px', borderRadius: '6px', fontWeight: '800' }}>
                        {item.type === 'Finished Goods' ? 'Retail' : 'Material'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                      Stock Qty: <strong style={{ color: '#0f172a' }}>{item.quantity ?? 'N/A'}</strong> • Landed Cost: <strong style={{ color: '#0f172a' }}>{currency} {item.landedCost?.toFixed(2)}</strong>
                    </div>
                    <button 
                      style={{ padding: '5px 12px', fontSize: '11px', marginTop: '10px', borderRadius: '6px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', cursor: 'pointer' }} 
                      onClick={() => handleEditInvClick(item)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: '6px', color: '#2563eb' }} /> Edit Item
                    </button>
                  </div>

                  {item.type === 'Finished Goods' && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', marginBottom: '4px' }}>Retail Price</div>
                      <div style={{ fontWeight: '900', color: '#059669', fontSize: '18px' }}>
                        {currency} {item.sellingPrice?.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: OFFICIAL PDF STATEMENTS                            */}
      {/* ========================================================= */}
      {activeTab === 'reports' && (
        <div style={{ ...bentoCardStyle, maxWidth: '680px', margin: '0 auto', padding: '36px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
              <FontAwesomeIcon icon={faFileInvoiceDollar} />
            </div>
            <h2 style={{ color: '#0f172a', margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800' }}>Account Statement Generator</h2>
            <p style={{ color: '#64748b', margin: '0 auto', fontSize: '14px', lineHeight: '1.6', maxWidth: '480px' }}>
              Export a clean, print-ready PDF statement for any client, supplier, or your master ledger.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <label style={labelStyle}><FontAwesomeIcon icon={faUserTie} style={{ color: '#4f46e5' }} /> Select Account</label>
            <select style={{ ...saasInputStyle, background: '#ffffff' }} value={reportFilter} onChange={e=>setReportFilter(e.target.value)}>
              <option value="all">Master Ledger (All Accounts)</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.category})</option>)}
            </select>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}><FontAwesomeIcon icon={faCalendarDays} style={{ color: '#ea580c' }} /> Start Date</label>
                <input type="date" style={{ ...saasInputStyle, background: '#ffffff' }} value={dateRange.from} onChange={e=>setDateRange({...dateRange, from:e.target.value})} />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}><FontAwesomeIcon icon={faCalendarDays} style={{ color: '#059669' }} /> End Date</label>
                <input type="date" style={{ ...saasInputStyle, background: '#ffffff' }} value={dateRange.to} onChange={e=>setDateRange({...dateRange, to:e.target.value})} />
              </div>
            </div>

            <button style={primaryBtnStyle} onClick={printLedger}>
              <FontAwesomeIcon icon={faPrint} style={{ color: '#f97316' }} /> Generate Printable PDF Statement
            </button>
          </div>
        </div>
      )}

      {/* --- CUSTOM MODAL FOR ALERTS --- */}
      {uiAlert.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '28px 24px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ea580c' }} /> {uiAlert.title}
              </h3>
              <button onClick={() => setUiAlert({ show: false, title: '', message: '' })} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 22px 0', textAlign: 'left' }}>{uiAlert.message}</p>
            <button onClick={() => setUiAlert({ show: false, title: '', message: '' })} style={primaryBtnStyle}>
              Got It
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export default FinancePro;