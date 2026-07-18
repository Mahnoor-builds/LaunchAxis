import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPrint, faAddressBook, faFileInvoiceDollar, 
  faPlus, faUserPlus, faPenToSquare, faXmark,
  faBoxOpen, faBoxesStacked, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

const FinancePro = ({ transactions, accounts, addAccount, updateAccount, branding, addTransaction, inventory, addInventoryItem, updateInventoryItem }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // --- FORMS & STATE ---
  const [txForm, setTxForm] = useState({ desc: '', amount: '', type: 'expense', accountId: '' });
  const [accForm, setAccForm] = useState({ name: '', category: 'Customer', phone: '', address: '' });
  const [editingAccountId, setEditingAccountId] = useState(null); 
  
  // NEW: INVENTORY FORM
  const [invForm, setInvForm] = useState({ name: '', type: 'Finished Goods', quantity: '', cost: '', lowStockThreshold: '5' });
  const [editingInvId, setEditingInvId] = useState(null);

  // REPORTS STATE
  const [reportFilter, setReportFilter] = useState('all'); 
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const getBalance = (accountId) => {
    return transactions.filter(t => t.accountId == accountId).reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  };

  // --- SUBMIT LOGIC ---
  const handleTxSubmit = () => {
    if(!txForm.desc || !txForm.amount || !txForm.accountId) return alert("Please fill all details.");
    const selectedAcc = accounts.find(a => a.id == txForm.accountId);
    addTransaction({ ...txForm, amount: parseFloat(txForm.amount), date: new Date().toLocaleDateString(), accountName: selectedAcc ? selectedAcc.name : 'Unknown Account' });
    setTxForm({ desc: '', amount: '', type: 'expense', accountId: '' }); 
  };

  const handleAccountSubmit = () => {
    if(!accForm.name) return alert("Enter account name");
    if (editingAccountId) {
        updateAccount(editingAccountId, { ...accForm });
        setEditingAccountId(null);
    } else {
        addAccount({ ...accForm });
    }
    setAccForm({ name: '', category: 'Customer', phone: '', address: '' });
  };

  const handleInvSubmit = () => {
    if(!invForm.name || !invForm.cost) return alert("Please enter a name and cost/value.");
    const itemData = {
        name: invForm.name,
        type: invForm.type,
        cost: parseFloat(invForm.cost),
        quantity: invForm.type === 'Finished Goods' ? parseInt(invForm.quantity || 0) : null,
        lowStockThreshold: invForm.type === 'Finished Goods' ? parseInt(invForm.lowStockThreshold || 5) : null
    };

    if (editingInvId) {
        updateInventoryItem(editingInvId, itemData);
        setEditingInvId(null);
    } else {
        addInventoryItem(itemData);
    }
    setInvForm({ name: '', type: 'Finished Goods', quantity: '', cost: '', lowStockThreshold: '5' });
  };

  const handleEditClick = (acc) => { setAccForm({ name: acc.name, category: acc.category, phone: acc.phone || '', address: acc.address || '' }); setEditingAccountId(acc.id); };
  const handleCancelEdit = () => { setAccForm({ name: '', category: 'Customer', phone: '', address: '' }); setEditingAccountId(null); };
  
  const handleEditInvClick = (item) => { setInvForm({ name: item.name, type: item.type, quantity: item.quantity || '', cost: item.cost, lowStockThreshold: item.lowStockThreshold || '5' }); setEditingInvId(item.id); };
  const handleCancelInvEdit = () => { setInvForm({ name: '', type: 'Finished Goods', quantity: '', cost: '', lowStockThreshold: '5' }); setEditingInvId(null); };

  // --- STRICT & SECURE PDF GENERATOR ---
  const printLedger = () => {
    const printWindow = window.open('', '', 'height=900,width=1000');
    
    // 1. STRICT ACCOUNT FILTERING
    let filteredTx = transactions;
    const isSpecificAccount = reportFilter !== 'all';
    
    if (isSpecificAccount) {
        filteredTx = filteredTx.filter(t => t.accountId == reportFilter);
    }

    // 2. STRICT DATE FILTERING (Security Fix)
    if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        filteredTx = filteredTx.filter(t => new Date(t.date) >= fromDate);
    }
    if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the entire 'To' day
        filteredTx = filteredTx.filter(t => new Date(t.date) <= toDate);
    }
    
    // Sort transactions chronologically for the report
    filteredTx.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 3. CALCULATE TOTALS
    let totalDebit = 0; 
    let totalCredit = 0; 
    let runningBalance = 0;

    const tableRows = filteredTx.map(t => {
        const debit = t.type === 'expense' ? t.amount : 0; 
        const credit = t.type === 'income' ? t.amount : 0;
        
        totalDebit += debit; 
        totalCredit += credit; 
        runningBalance += (credit - debit);

        return `
        <tr>
            <td style="text-align:center;">${t.date}</td>
            <td style="text-align:center;">Ref-${t.id.toString().slice(-4)}</td>
            <td>${t.desc} ${!isSpecificAccount ? `<br><small style="color:#666;">Entity: ${t.accountName}</small>` : ''}</td>
            <td style="text-align:right">${debit > 0 ? debit.toLocaleString() : '-'}</td>
            <td style="text-align:right">${credit > 0 ? credit.toLocaleString() : '-'}</td>
            <td style="text-align:right; font-weight:bold; background:#fafafa;">${runningBalance.toLocaleString()} ${runningBalance >= 0 ? 'CR' : 'DR'}</td>
        </tr>`;
    }).join('');

    // 4. DYNAMIC HEADERS
    const selectedAcc = accounts.find(a => a.id == reportFilter);
    const documentTitle = isSpecificAccount ? "STATEMENT OF ACCOUNT" : "MASTER GENERAL LEDGER";
    
    const clientInfo = isSpecificAccount 
        ? `<strong>${selectedAcc.name}</strong><br>${selectedAcc.address || 'Address Not Provided'}<br>Phone: ${selectedAcc.phone || 'N/A'}<br>Category: ${selectedAcc.category}`
        : `<strong>Internal Financial Record</strong><br>All Entities & Accounts`;

    // 5. SECURE HTML TEMPLATE
    const htmlContent = `
      <html>
        <head>
          <title>${documentTitle}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; font-size: 13px; }
            .header-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; border-bottom: 3px solid #0f172a; padding-bottom: 20px; }
            .company-name { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; }
            .report-title { font-size: 18px; font-weight: bold; color: #2dd4bf; text-transform: uppercase; }
            
            .meta-box { margin-top: 20px; border: 1px solid #e2e8f0; padding: 15px; display: flex; justify-content: space-between; background: #f8fafc; border-radius: 6px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 25px; }
            th { border: 1px solid #cbd5e1; padding: 10px; background: #f1f5f9; text-align: center; font-weight: 700; font-size: 12px; text-transform: uppercase; }
            td { border: 1px solid #cbd5e1; padding: 10px; }
            
            .totals-row td { border-top: 3px solid #0f172a; font-weight: 800; background: #f8fafc; font-size: 14px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 15px; color: #64748b; }
            
            .no-data { text-align: center; padding: 30px; font-style: italic; color: #64748b; }
          </style>
        </head>
        <body>
            <div class="header-grid">
                <div>
                    <div style="font-size:11px; color:#64748b; font-weight:bold; letter-spacing:1px;">AUTHORIZED ISSUER</div>
                    <div class="company-name" style="margin-top:5px;">${branding.name}</div>
                    <div style="margin-top:5px;">Operated by: ${branding.owners && branding.owners[0] ? branding.owners[0].name : 'System Admin'}</div>
                </div>
                <div style="text-align:right;">
                    <div class="report-title">${documentTitle}</div>
                    <div style="margin-top:10px; line-height: 1.5;">${clientInfo}</div>
                </div>
            </div>

            <div class="meta-box">
                <div>
                    <strong>Statement Period:</strong><br> 
                    ${dateRange.from ? new Date(dateRange.from).toLocaleDateString() : 'Account Inception'} 
                    &nbsp;—&nbsp; 
                    ${dateRange.to ? new Date(dateRange.to).toLocaleDateString() : 'Current Date'}
                </div>
                <div style="text-align:right;">
                    <strong>Opening Balance:</strong><br> 0.00
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width:12%">Date</th>
                        <th style="width:10%">Ref #</th>
                        <th style="width:38%">Transaction Details</th>
                        <th style="width:12%">Debit (Out)</th>
                        <th style="width:12%">Credit (In)</th>
                        <th style="width:16%">Running Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredTx.length > 0 ? tableRows : `<tr><td colspan="6" class="no-data">No transactions found for this entity within the selected dates.</td></tr>`}
                    
                    ${filteredTx.length > 0 ? `
                    <tr class="totals-row">
                        <td colspan="3" style="text-align:right;">CLOSING TOTALS:</td>
                        <td style="text-align:right;">${totalDebit.toLocaleString()}</td>
                        <td style="text-align:right;">${totalCredit.toLocaleString()}</td>
                        <td style="text-align:right; color: ${runningBalance >= 0 ? '#10b981' : '#ef4444'};">${runningBalance.toLocaleString()} ${runningBalance >= 0 ? 'CR' : 'DR'}</td>
                    </tr>` : ''}
                </tbody>
            </table>

            <div class="footer">
                <strong>CONFIDENTIAL & SECURE DOCUMENT</strong><br>
                Generated by the LaunchAxis Financial Intelligence Engine • ${new Date().toLocaleString()}
            </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent); 
    printWindow.document.close();
    
    // Tiny delay ensures CSS loads before print dialog opens
    setTimeout(() => {
        printWindow.print();
    }, 250);
  };

  return (
    <div className="section active">
      <div className="header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontSize: '24px' }}>Finance & Accounting</h1>
          <p style={{ color:'var(--text-muted)', margin: 0 }}>Professional Ledger & Statements</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
            {['overview', 'directory', 'inventory', 'reports'].map(tab => (
                <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab(tab)} style={{ textTransform:'capitalize' }}>
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* === TAB 1: OVERVIEW === */}
      {activeTab === 'overview' && (
        <div className="grid-2">
           <div className="card">
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}><FontAwesomeIcon icon={faPlus} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }} /> Quick Entry</h3>
              <div style={{ display:'flex', gap:'12px', marginBottom: '12px' }}>
                <select className="input-neon" style={{ marginBottom: 0 }} value={txForm.type} onChange={e=>setTxForm({...txForm, type:e.target.value})}><option value="income">Income (Credit)</option><option value="expense">Expense (Debit)</option></select>
                <select className="input-neon" style={{ marginBottom: 0 }} value={txForm.accountId} onChange={e=>setTxForm({...txForm, accountId:e.target.value})}><option value="">-- Select Account --</option>{accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}</select>
              </div>
              <input className="input-neon" style={{ marginBottom: '12px' }} placeholder="Description (e.g. Commission Received)" value={txForm.desc} onChange={e=>setTxForm({...txForm, desc:e.target.value})} />
              <input className="input-neon" style={{ marginBottom: '20px' }} type="number" placeholder="Amount (PKR)" value={txForm.amount} onChange={e=>setTxForm({...txForm, amount:e.target.value})} />
              <button className="btn btn-primary" style={{ width:'100%', padding: '12px' }} onClick={handleTxSubmit}>Save Transaction</button>
           </div>
           <div className="card">
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>Recent Activity</h3>
              <div style={{ maxHeight:'300px', overflowY:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', textAlign: 'left' }}>
                    <thead><tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)' }}><th style={{ paddingBottom: '12px' }}>Date</th><th style={{ paddingBottom: '12px' }}>Description</th><th style={{ paddingBottom: '12px' }}>Account</th><th style={{ paddingBottom: '12px', textAlign: 'right' }}>Amount</th></tr></thead>
                    <tbody>
                        {transactions.slice(0, 10).map((t, idx) => (
                            <tr key={t.id} style={{ borderBottom: idx === 9 ? 'none' : '1px solid #f1f5f9' }}><td style={{ padding: '16px 0', color: 'var(--text-dark)', fontSize: '13px' }}>{t.date}</td><td style={{ padding: '16px 0', color: 'var(--text-dark)', fontWeight: '600' }}>{t.desc}</td><td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>{t.accountName || 'Unknown'}</td><td style={{ padding: '16px 0', textAlign: 'right', color: t.type === 'income' ? '#10b981' : '#ef4444', fontWeight:'800' }}>{t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}</td></tr>
                        ))}
                    </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

     {/* === TAB 2: DIRECTORY === */}
      {activeTab === 'directory' && (
        <div className="grid-2">
            <div className="card" style={{ border: editingAccountId ? '2px solid var(--neon-cyan)' : '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>
                    <FontAwesomeIcon icon={faUserPlus} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}/> 
                    {editingAccountId ? 'Edit Account Details' : 'Add New Account'}
                </h3>
                
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Account / Person Name</label>
                <input className="input-neon" value={accForm.name} onChange={e=>setAccForm({...accForm, name:e.target.value})} placeholder="e.g. Raja Naveed Kiyani" />
                
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Category</label>
                <select className="input-neon" value={accForm.category} onChange={e=>setAccForm({...accForm, category:e.target.value})}>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Investor">Investor</option>
                    <option value="Bank">Bank/Cash</option>
                </select>

                {/* --- RESTORED CRM FIELDS --- */}
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Phone (Optional)</label>
                <input className="input-neon" value={accForm.phone} onChange={e=>setAccForm({...accForm, phone:e.target.value})} placeholder="0300-1234567" />
                
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Address (Optional)</label>
                <input className="input-neon" value={accForm.address} onChange={e=>setAccForm({...accForm, address:e.target.value})} placeholder="Office No..." />

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={handleAccountSubmit}>
                        {editingAccountId ? 'Save Changes' : 'Create Account'}
                    </button>
                    {editingAccountId && (
                        <button className="btn btn-outline" style={{ padding: '12px' }} onClick={handleCancelEdit}>
                            <FontAwesomeIcon icon={faXmark} style={{ marginRight: '5px' }} /> Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="card">
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}><FontAwesomeIcon icon={faAddressBook} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}/> Account Balances</h3>
                <div style={{ maxHeight:'450px', overflowY:'auto' }}>
                    {accounts.map(acc => {
                        const bal = getBalance(acc.id);
                        return (
                            <div key={acc.id} style={{ padding:'16px 0', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', opacity: editingAccountId === acc.id ? 0.5 : 1 }}>
                                <div>
                                    <div style={{ fontWeight:'700', fontSize:'15px', color: 'var(--text-dark)' }}>{acc.name}</div>
                                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop: '4px' }}>
                                        {acc.category} • {acc.phone || 'No Phone'}
                                    </div>
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontWeight:'800', color: bal >= 0 ? '#10b981' : '#ef4444', fontSize:'16px' }}>
                                        {bal.toLocaleString()}
                                    </div>
                                    <button 
                                        className="btn btn-outline" 
                                        style={{ padding:'4px 10px', fontSize:'11px', marginTop:'8px' }}
                                        onClick={() => handleEditClick(acc)}
                                    >
                                        <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: '5px' }} /> Edit
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

      
      {/* === TAB 3: INVENTORY / STOCKROOM === */}
      {activeTab === 'inventory' && (
        <div className="grid-2">
            <div className="card" style={{ border: editingInvId ? '2px solid var(--neon-cyan)' : '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>
                    <FontAwesomeIcon icon={faBoxOpen} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}/> 
                    {editingInvId ? 'Edit Inventory Item' : 'Add to Stockroom'}
                </h3>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Item / Material Name</label>
                <input className="input-neon" value={invForm.name} onChange={e=>setInvForm({...invForm, name:e.target.value})} placeholder="e.g. Blue Ribbon Bulk, Summer Dress M" />
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Tracking Type</label>
                <select className="input-neon" value={invForm.type} onChange={e=>setInvForm({...invForm, type:e.target.value})}><option value="Finished Goods">Finished Goods (Track Quantity)</option><option value="Raw Materials">Raw Materials (Track Total Financial Value Only)</option></select>
                {invForm.type === 'Finished Goods' && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Total Qty</label><input type="number" className="input-neon" style={{ marginBottom: 0 }} value={invForm.quantity} onChange={e=>setInvForm({...invForm, quantity:e.target.value})} placeholder="50" /></div>
                        <div style={{ flex: 1 }}><label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Low Stock Alert</label><input type="number" className="input-neon" style={{ marginBottom: 0 }} value={invForm.lowStockThreshold} onChange={e=>setInvForm({...invForm, lowStockThreshold:e.target.value})} placeholder="5" /></div>
                    </div>
                )}
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Total Cost to Business (PKR)</label>
                <input type="number" className="input-neon" value={invForm.cost} onChange={e=>setInvForm({...invForm, cost:e.target.value})} placeholder="What did you pay for this?" />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={handleInvSubmit}>{editingInvId ? 'Save Changes' : 'Add to Warehouse'}</button>
                    {editingInvId && (<button className="btn btn-outline" style={{ padding: '12px' }} onClick={handleCancelInvEdit}><FontAwesomeIcon icon={faXmark} style={{ marginRight: '5px' }} /> Cancel</button>)}
                </div>
            </div>

            <div className="card">
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>
                    <FontAwesomeIcon icon={faBoxesStacked} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}/> Current Warehouse
                </h3>
                <div style={{ maxHeight:'450px', overflowY:'auto' }}>
                    {inventory.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginTop: '20px' }}>Your stockroom is currently empty.</p>
                    ) : (
                        inventory.map(item => (
                            <div key={item.id} style={{ padding:'16px 0', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', opacity: editingInvId === item.id ? 0.5 : 1 }}>
                                <div>
                                    <div style={{ fontWeight:'700', fontSize:'15px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {item.name}
                                        {item.type === 'Finished Goods' && item.quantity <= item.lowStockThreshold && (
                                            <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fecaca' }}>
                                                <FontAwesomeIcon icon={faTriangleExclamation} /> Low Stock
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop: '4px' }}>{item.type} • {item.type === 'Finished Goods' ? ` Qty: ${item.quantity}` : ' Bulk Value'}</div>
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontWeight:'800', color: 'var(--text-dark)', fontSize:'16px' }}>PKR {item.cost.toLocaleString()}</div>
                                    <button className="btn btn-outline" style={{ padding:'4px 10px', fontSize:'11px', marginTop:'8px' }} onClick={() => handleEditInvClick(item)}><FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: '5px' }} /> Edit</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}

      {/* === TAB 4: SECURE REPORTS === */}
      {activeTab === 'reports' && (
        <div className="card" style={{ maxWidth:'600px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'30px' }}>
                <FontAwesomeIcon icon={faFileInvoiceDollar} size="3x" style={{ color:'var(--neon-cyan)', marginBottom:'16px' }} />
                <h2 style={{ color: 'var(--text-dark)', margin: '0 0 8px 0' }}>Generate Secure Statement</h2>
                <p style={{ color:'var(--text-muted)', margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                    Select a specific account and date range to generate a secure financial statement. 
                    If dates are selected, all out-of-bounds history is strictly excluded from the document.
                </p>
            </div>

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>Select Target Account</label>
            <select className="input-neon" value={reportFilter} onChange={e=>setReportFilter(e.target.value)}>
                <option value="all">-- Full Business Ledger (All Accounts) --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.category})</option>)}
            </select>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>From Date (Optional)</label>
                    <input type="date" className="input-neon" style={{ marginBottom: 0 }} value={dateRange.from} onChange={e=>setDateRange({...dateRange, from:e.target.value})} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-dark)', fontWeight: '600' }}>To Date (Optional)</label>
                    <input type="date" className="input-neon" style={{ marginBottom: 0 }} value={dateRange.to} onChange={e=>setDateRange({...dateRange, to:e.target.value})} />
                </div>
            </div>

            <button className="btn btn-primary" style={{ width:'100%', padding:'16px', fontSize:'16px', marginTop: '10px' }} onClick={printLedger}>
                <FontAwesomeIcon icon={faPrint} style={{ marginRight: '8px' }} /> Download Secure PDF Statement
            </button>
        </div>
      )}
    </div>
  );
};

export default FinancePro;