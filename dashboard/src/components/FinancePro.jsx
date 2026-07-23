import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPrint, faAddressBook, faFileInvoiceDollar, 
  faPlus, faUserPlus, faPenToSquare, faXmark,
  faBoxOpen, faBoxesStacked, faTriangleExclamation, faGlobe, faTags
} from '@fortawesome/free-solid-svg-icons';

const FinancePro = ({ transactions, accounts, addAccount, updateAccount, branding, addTransaction, inventory, addInventoryItem, updateInventoryItem }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [currency, setCurrency] = useState('Rs');
  
  // --- FORMS & STATE ---
  const [txForm, setTxForm] = useState({ desc: '', amount: '', type: 'payment_in', category: 'Website Sales', accountId: '' });
  const [accForm, setAccForm] = useState({ name: '', category: 'Customer', phone: '', address: '' });
  const [editingAccountId, setEditingAccountId] = useState(null); 
  
  const [invForm, setInvForm] = useState({ name: '', type: 'Finished Goods', quantity: '', baseCost: '', shipping: '', sellingPrice: '', lowStockThreshold: '5' });
  const [editingInvId, setEditingInvId] = useState(null);

  const [reportFilter, setReportFilter] = useState('all'); 
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // --- SMART BALANCE CALCULATOR ---
  const getAccountStatus = (account) => {
    let balance = 0;
    const accTx = transactions.filter(t => t.accountId == account.id);
    
    if (account.category === 'Customer') {
        const invoiced = accTx.filter(t => t.type === 'invoice_out').reduce((sum, t) => sum + t.amount, 0);
        const paid = accTx.filter(t => t.type === 'payment_in' || t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        balance = invoiced - paid;
        return { balance, text: balance > 0 ? 'Customer Owes You' : balance < 0 ? 'Overpaid / Credit' : 'Settled', color: balance > 0 ? '#eab308' : '#10b981' };
    } 
    else if (account.category === 'Supplier') {
        const billed = accTx.filter(t => t.type === 'bill_in').reduce((sum, t) => sum + t.amount, 0);
        const paid = accTx.filter(t => t.type === 'payment_out' || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        balance = billed - paid;
        return { balance, text: balance > 0 ? 'You Owe Supplier' : balance < 0 ? 'Supplier Owes You' : 'Settled', color: balance > 0 ? '#ef4444' : '#10b981' };
    }
    else {
        const moneyIn = accTx.filter(t => t.type === 'payment_in' || t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const moneyOut = accTx.filter(t => t.type === 'payment_out' || t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        balance = moneyIn - moneyOut;
        return { balance, text: 'Available Funds', color: '#3b82f6' };
    }
  };

  // Inventory Math
  const qty = parseFloat(invForm.quantity) || 0;
  const base = parseFloat(invForm.baseCost) || 0;
  const ship = parseFloat(invForm.shipping) || 0;
  const sell = parseFloat(invForm.sellingPrice) || 0;
  const unitLandedCost = qty > 0 ? base + (ship / qty) : base;
  const expectedProfit = sell - unitLandedCost;

  // --- SUBMIT LOGIC ---
  const handleTxSubmit = () => {
    if(!txForm.desc || !txForm.amount || !txForm.accountId) return alert("Please fill all details.");
    const selectedAcc = accounts.find(a => a.id == txForm.accountId);
    addTransaction({ ...txForm, amount: parseFloat(txForm.amount), date: new Date().toLocaleDateString(), accountName: selectedAcc ? selectedAcc.name : 'Unknown Account' });
    setTxForm({ desc: '', amount: '', type: 'payment_in', category: 'Website Sales', accountId: '' }); 
  };

  const handleAccountSubmit = () => {
    if(!accForm.name) return alert("Enter account name");
    if (editingAccountId) { updateAccount(editingAccountId, { ...accForm }); setEditingAccountId(null); } 
    else { addAccount({ ...accForm }); }
    setAccForm({ name: '', category: 'Customer', phone: '', address: '' });
  };

  const handleInvSubmit = () => {
    if(!invForm.name || !invForm.baseCost) return alert("Please enter a name and base cost.");
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

  // --- NATIVE HTML PRINT GENERATOR (The "Side Popup" Method) ---
  const printLedger = () => {
    let filteredTx = transactions;

    // Helper: strips time so "today" matches exactly
    const normalizeDate = (dateString) => {
        const d = new Date(dateString);
        d.setHours(0, 0, 0, 0); 
        return d.getTime();
    };
    
    // 1. Apply Filters
    if (reportFilter !== 'all') {
        // Use loose equality (==) to safely match strings to IDs
        filteredTx = filteredTx.filter(tx => tx.accountId == reportFilter || tx.accountName === reportFilter);
    }
    if (dateRange.from) {
        filteredTx = filteredTx.filter(tx => normalizeDate(tx.date) >= normalizeDate(dateRange.from));
    }
    if (dateRange.to) {
        filteredTx = filteredTx.filter(tx => normalizeDate(tx.date) <= normalizeDate(dateRange.to));
    }

    // 2. Calculate Totals & Build HTML Rows
    let totalIncome = 0;
    let totalExpense = 0;
    
    const tableRowsHTML = filteredTx.map(tx => {
        if (['payment_in', 'invoice_out', 'income'].includes(tx.type)) {
            totalIncome += parseFloat(tx.amount);
        } else {
            totalExpense += parseFloat(tx.amount);
        }
        
        return `
            <tr>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; color: #475569;">${tx.date}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${tx.desc}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${tx.category || 'General'}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${tx.type.replace('_', ' ').toUpperCase()}</td>
                <td style="padding: 14px; border-bottom: 1px solid #e2e8f0; font-weight: 800; text-align: right;">${currency} ${parseFloat(tx.amount).toLocaleString()}</td>
            </tr>
        `;
    }).join('');

    const net = totalIncome - totalExpense;
    const brandName = branding?.name || 'LaunchAxis Store';
    const accountLabel = reportFilter === 'all' ? 'Master Ledger (All Accounts)' : `Target Account: ${accounts.find(a => a.id == reportFilter)?.name || reportFilter}`;

    // 3. Open New Window & Inject Premium HTML
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>${brandName} - Official Statement</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #0f172a; margin: 0; }
                .header { border-bottom: 4px solid #2dd4bf; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
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
                    <p>Official Account Statement</p>
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
                    <span>Total Cash In</span>
                    <span>${currency} ${totalIncome.toLocaleString()}</span>
                </div>
                <div class="totals-row">
                    <span>Total Cash Out</span>
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
    
    // 4. Trigger the native browser print dialogue
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };

  return (
    <div className="section active" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* PREMIUM HEADER - ALIGNMENT FIXED */}
      <div className="header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', color: 'var(--text-dark)', fontSize: '26px', fontWeight: '800' }}>Omni-Ledger</h1>
          <p style={{ color:'var(--text-muted)', margin: 0, fontSize: '14px' }}>Invoicing, Expenses & Cashflow</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '0 14px', height: '42px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--text-muted)', marginRight: '8px' }} />
                <select style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 'bold', color: 'var(--text-dark)', cursor: 'pointer', fontSize: '14px' }} value={currency} onChange={e => setCurrency(e.target.value)}>
                    <option value="Rs">PKR (Rs)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                </select>
            </div>
            <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px', height: '42px', boxSizing: 'border-box' }}>
                {['overview', 'directory', 'inventory', 'reports'].map(tab => (
                    <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab(tab)} style={{ textTransform:'capitalize', padding: '0 16px', borderRadius: '6px', border: 'none', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text-muted)', height: '100%' }}>
                        {tab}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* === TAB 1: OVERVIEW (OMNI-LEDGER) === */}
      {activeTab === 'overview' && (
        <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
           
           <div className="card" style={{ padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center' }}>
                  <FontAwesomeIcon icon={faPlus} style={{ color: 'var(--primary)', marginRight: '10px' }} /> Transaction & Invoicing
              </h3>
              
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>Transaction Type</label>
              <select className="input-neon" style={{ marginBottom: '20px', padding: '12px' }} value={txForm.type} onChange={e=>setTxForm({...txForm, type:e.target.value, category: e.target.value === 'invoice_out' ? 'Website Sales' : 'General'})}>
                  <option value="invoice_out">📄 Sales Invoice (Customer owes you)</option>
                  <option value="payment_in">💵 Payment Received (Cash In)</option>
                  <option value="bill_in">🧾 Purchase Bill (You owe Supplier)</option>
                  <option value="payment_out">💸 Payment Sent (Cash Out)</option>
              </select>
              
              <div style={{ display:'flex', gap:'16px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>Target Account</label>
                    <select className="input-neon" style={{ marginBottom: 0, padding: '12px' }} value={txForm.accountId} onChange={e=>setTxForm({...txForm, accountId:e.target.value})}>
                        <option value="">-- Select Entity --</option>
                        {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.category})</option>)}
                    </select>
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>Category</label>
                    <select className="input-neon" style={{ marginBottom: 0, padding: '12px' }} value={txForm.category} onChange={e=>setTxForm({...txForm, category:e.target.value})}>
                        <option value="Website Sales">Website Sales</option>
                        <option value="Inventory Purchase">Inventory Purchase</option>
                        <option value="Payroll">Payroll / Salary</option>
                        <option value="Shipping">Shipping Costs</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Capital">Initial Capital</option>
                        <option value="General">General / Other</option>
                    </select>
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-dark)' }}>Details & Amount</label>
              <input className="input-neon" style={{ marginBottom: '16px', padding: '12px' }} placeholder="Short Description (e.g. Partial Payment for Shirts)" value={txForm.desc} onChange={e=>setTxForm({...txForm, desc:e.target.value})} />
              
              <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{currency}</span>
                  <input className="input-neon" style={{ marginBottom: '24px', padding: '12px 12px 12px 40px', fontSize: '16px', fontWeight: 'bold' }} type="number" placeholder="0.00" value={txForm.amount} onChange={e=>setTxForm({...txForm, amount:e.target.value})} />
              </div>

              <button className="btn btn-primary" style={{ width:'100%', padding: '16px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px' }} onClick={handleTxSubmit}>Record Transaction</button>
           </div>
           
           <div className="card" style={{ padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-dark)' }}>Audit Trail</h3>
              <div style={{ maxHeight:'400px', overflowY:'auto', paddingRight: '10px' }}>
                {transactions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No transactions recorded yet.</p> : transactions.map((t, idx) => {
                    const isMoneyIn = ['payment_in', 'invoice_out', 'income'].includes(t.type);
                    
                    return (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx === transactions.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                            <div>
                                <div style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>{t.desc}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b' }}>{t.date} • {t.accountName}</span>
                                    <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                        <FontAwesomeIcon icon={faTags} style={{ marginRight: '4px' }}/> {t.category || 'General'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '15px', fontWeight: '800', color: isMoneyIn ? '#10b981' : '#ef4444' }}>
                                    {isMoneyIn ? '+' : '-'}{currency}{parseFloat(t.amount).toLocaleString()}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '2px' }}>
                                    {t.type.replace('_', ' ')}
                                </div>
                            </div>
                        </div>
                    )
                })}
              </div>
           </div>
        </div>
      )}

      {/* === TAB 2: DIRECTORY & CRM === */}
      {activeTab === 'directory' && (
        <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
            <div className="card" style={{ padding: '30px', borderRadius: '16px', border: editingAccountId ? '2px solid var(--primary)' : 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faUserPlus} style={{ color: 'var(--primary)', marginRight: '10px' }}/> 
                    {editingAccountId ? 'Edit Entity Details' : 'Add Client / Supplier'}
                </h3>
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Entity Name</label>
                <input className="input-neon" style={{ padding: '12px', marginBottom: '16px' }} value={accForm.name} onChange={e=>setAccForm({...accForm, name:e.target.value})} placeholder="e.g. Samz Technologies" />
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Category</label>
                <select className="input-neon" style={{ padding: '12px', marginBottom: '16px' }} value={accForm.category} onChange={e=>setAccForm({...accForm, category:e.target.value})}>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Employee">Employee</option>
                    <option value="Bank">Bank/Cash Register</option>
                </select>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Phone</label>
                <input className="input-neon" style={{ padding: '12px', marginBottom: '16px' }} value={accForm.phone} onChange={e=>setAccForm({...accForm, phone:e.target.value})} placeholder="0300-1234567" />
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Address</label>
                <input className="input-neon" style={{ padding: '12px', marginBottom: '24px' }} value={accForm.address} onChange={e=>setAccForm({...accForm, address:e.target.value})} placeholder="Office No..." />

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '8px' }} onClick={handleAccountSubmit}>
                        {editingAccountId ? 'Save Changes' : 'Create Record'}
                    </button>
                    {editingAccountId && (
                        <button className="btn btn-outline" style={{ padding: '14px', borderRadius: '8px' }} onClick={handleCancelEdit}>Cancel</button>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-dark)' }}>Accounts Payable & Receivable</h3>
                <div style={{ maxHeight:'450px', overflowY:'auto' }}>
                    {accounts.map(acc => {
                        const status = getAccountStatus(acc);
                        return (
                            <div key={acc.id} style={{ padding:'20px', border:'1px solid #e2e8f0', borderRadius: '12px', marginBottom: '12px', display:'flex', justifyContent:'space-between', alignItems:'center', background: '#fff' }}>
                                <div>
                                    <div style={{ fontWeight:'800', fontSize:'16px', color: 'var(--text-dark)', marginBottom: '4px' }}>{acc.name}</div>
                                    <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{acc.category} • {acc.phone || 'No Phone'}</div>
                                    <button className="btn btn-outline" style={{ padding:'4px 12px', fontSize:'11px', marginTop:'12px', borderRadius: '6px' }} onClick={() => handleEditClick(acc)}>
                                        <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: '6px' }} /> Edit
                                    </button>
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontSize:'11px', fontWeight: 'bold', textTransform: 'uppercase', color: status.color, marginBottom: '4px' }}>
                                        {status.text}
                                    </div>
                                    <div style={{ fontWeight:'900', color: 'var(--text-dark)', fontSize:'20px' }}>
                                        {currency}{Math.abs(status.balance).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

      {/* === TAB 3: INVENTORY === */}
      {activeTab === 'inventory' && (
        <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
            <div className="card" style={{ padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-dark)' }}>
                    <FontAwesomeIcon icon={faBoxOpen} style={{ color: 'var(--primary)', marginRight: '10px' }}/> 
                    {editingInvId ? 'Edit Stock Item' : 'Add to Stockroom'}
                </h3>
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Product / Material Name</label>
                <input className="input-neon" style={{ padding: '12px', marginBottom: '16px' }} value={invForm.name} onChange={e=>setInvForm({...invForm, name:e.target.value})} placeholder="e.g. Summer Dress M" />
                
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Tracking Type</label>
                <select className="input-neon" style={{ padding: '12px', marginBottom: '16px' }} value={invForm.type} onChange={e=>setInvForm({...invForm, type:e.target.value})}>
                    <option value="Finished Goods">Finished Goods (For Sale)</option>
                    <option value="Raw Materials">Raw Materials (For Supplies/Packaging)</option>
                </select>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Total Qty</label>
                        <input type="number" className="input-neon" style={{ padding: '12px', marginBottom: 0 }} value={invForm.quantity} onChange={e=>setInvForm({...invForm, quantity:e.target.value})} placeholder="50" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Base Cost (Unit)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{currency}</span>
                            <input type="number" className="input-neon" style={{ padding: '12px 12px 12px 35px', marginBottom: 0 }} value={invForm.baseCost} onChange={e=>setInvForm({...invForm, baseCost:e.target.value})} />
                        </div>
                    </div>
                </div>

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Total Shipping Fee (For entire batch)</label>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{currency}</span>
                    <input type="number" className="input-neon" style={{ padding: '12px 12px 12px 35px', marginBottom: '8px' }} value={invForm.shipping} onChange={e=>setInvForm({...invForm, shipping:e.target.value})} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '20px' }}>
                    💡 Landed Cost: {currency}{unitLandedCost.toFixed(2)} per unit.
                </p>

                {invForm.type === 'Finished Goods' && (
                    <>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Selling Price (Per Unit)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{currency}</span>
                            <input type="number" className="input-neon" style={{ padding: '12px 12px 12px 35px', marginBottom: '16px' }} value={invForm.sellingPrice} onChange={e=>setInvForm({...invForm, sellingPrice:e.target.value})} />
                        </div>
                        
                        <div style={{ background: expectedProfit > 0 ? '#ecfdf5' : '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: expectedProfit > 0 ? '1px solid #10b981' : '1px solid #e2e8f0' }}>
                            <p style={{ fontSize: '13px', color: expectedProfit > 0 ? '#059669' : 'var(--text-muted)', margin: '0', fontWeight: 'bold' }}>
                                {expectedProfit > 0 ? `✨ You earn ${currency}${expectedProfit.toFixed(2)} pure profit per sale.` : 'Awaiting cost & price logic...'}
                            </p>
                        </div>
                    </>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: invForm.type === 'Raw Materials' ? '24px' : '0' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '8px' }} onClick={handleInvSubmit}>{editingInvId ? 'Update Stock' : 'Add to Warehouse'}</button>
                    {editingInvId && (<button className="btn btn-outline" style={{ padding: '14px', borderRadius: '8px' }} onClick={handleCancelInvEdit}>Cancel</button>)}
                </div>
            </div>

            <div className="card" style={{ padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-dark)' }}>Warehouse Status</h3>
                <div style={{ maxHeight:'450px', overflowY:'auto' }}>
                    {inventory.map(item => (
                        <div key={item.id} style={{ padding:'20px', border:'1px solid #e2e8f0', borderRadius: '12px', marginBottom: '12px', display:'flex', justifyContent:'space-between', alignItems:'center', background: '#fff' }}>
                            <div>
                                <div style={{ fontWeight:'800', fontSize:'16px', color: 'var(--text-dark)', marginBottom: '4px' }}>
                                    {item.name}
                                    <span style={{ fontSize: '10px', background: item.type === 'Finished Goods' ? '#e0e7ff' : '#fef3c7', color: item.type === 'Finished Goods' ? '#4338ca' : '#d97706', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontWeight: 'bold' }}>
                                        {item.type === 'Finished Goods' ? 'Retail' : 'Raw'}
                                    </span>
                                </div>
                                <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Qty: {item.quantity} • True Cost: {currency}{item.landedCost?.toFixed(2)}</div>
                            </div>
                            {item.type === 'Finished Goods' && (
                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontSize:'11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '4px' }}>Selling For</div>
                                    <div style={{ fontWeight:'900', color: '#10b981', fontSize:'18px' }}>{currency}{item.sellingPrice?.toLocaleString()}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* === TAB 4: SECURE REPORTS === */}
      {activeTab === 'reports' && (
        <div className="card" style={{ maxWidth:'700px', margin:'0 auto', padding: '40px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <FontAwesomeIcon icon={faFileInvoiceDollar} size="3x" style={{ color:'var(--primary)', marginBottom:'20px' }} />
            <h2 style={{ color: 'var(--text-dark)', margin: '0 0 12px 0', fontSize: '24px', fontWeight: '800' }}>Statement Generator</h2>
            <p style={{ color:'var(--text-muted)', margin: '0 auto 30px auto', fontSize: '15px', lineHeight: '1.6', maxWidth: '80%' }}>
                Select a client or supplier below to generate a professional, print-ready PDF statement of their account balance and payment history.
            </p>

            <div style={{ textAlign: 'left', background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>Target Account</label>
                <select className="input-neon" style={{ padding: '14px', marginBottom: '20px' }} value={reportFilter} onChange={e=>setReportFilter(e.target.value)}>
                    <option value="all">-- Master Ledger (All Data) --</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.category})</option>)}
                </select>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>From Date</label>
                        <input type="date" className="input-neon" style={{ padding: '12px', marginBottom: 0 }} value={dateRange.from} onChange={e=>setDateRange({...dateRange, from:e.target.value})} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>To Date</label>
                        <input type="date" className="input-neon" style={{ padding: '12px', marginBottom: 0 }} value={dateRange.to} onChange={e=>setDateRange({...dateRange, to:e.target.value})} />
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width:'100%', padding:'16px', fontSize:'16px', fontWeight: 'bold', borderRadius: '8px' }} onClick={printLedger}>
                    <FontAwesomeIcon icon={faPrint} style={{ marginRight: '10px' }} /> Generate PDF Statement
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default FinancePro;