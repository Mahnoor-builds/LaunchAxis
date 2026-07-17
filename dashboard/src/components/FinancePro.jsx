import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPrint, faAddressBook, faFileInvoiceDollar, 
  faPlus, faUserPlus, faPenToSquare, faXmark
} from '@fortawesome/free-solid-svg-icons';

const FinancePro = ({ transactions, accounts, addAccount, updateAccount, branding, addTransaction }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  
  const [txForm, setTxForm] = useState({ desc: '', amount: '', type: 'expense', accountId: '' });
  const [accForm, setAccForm] = useState({ name: '', category: 'Customer', phone: '', address: '' });
  const [editingAccountId, setEditingAccountId] = useState(null); 
  
  const [reportFilter, setReportFilter] = useState('all'); 
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [ledgerConfig, setLedgerConfig] = useState({
    title: 'Account Ledger Report',
    color: '#2dd4bf'
  });

  const getBalance = (accountId) => {
    return transactions
      .filter(t => t.accountId == accountId)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  };

  const handleTxSubmit = () => {
    if(!txForm.desc || !txForm.amount || !txForm.accountId) return alert("Please fill all details.");
    const selectedAcc = accounts.find(a => a.id == txForm.accountId);
    
    addTransaction({ 
        ...txForm, 
        amount: parseFloat(txForm.amount), 
        date: new Date().toLocaleDateString(),
        accountName: selectedAcc ? selectedAcc.name : 'Unknown Account'
    });
    setTxForm({ desc: '', amount: '', type: 'expense', accountId: '' }); 
  };

  const handleAccountSubmit = () => {
    if(!accForm.name) return alert("Enter account name");
    
    if (editingAccountId) {
        updateAccount(editingAccountId, { 
            name: accForm.name, 
            category: accForm.category,
            phone: accForm.phone,
            address: accForm.address 
        });
        setEditingAccountId(null);
    } else {
        addAccount({ 
            name: accForm.name, 
            category: accForm.category,
            phone: accForm.phone,
            address: accForm.address 
        });
    }
    setAccForm({ name: '', category: 'Customer', phone: '', address: '' });
  };

  const handleEditClick = (acc) => {
    setAccForm({
        name: acc.name,
        category: acc.category,
        phone: acc.phone || '',
        address: acc.address || ''
    });
    setEditingAccountId(acc.id);
  };

  const handleCancelEdit = () => {
    setAccForm({ name: '', category: 'Customer', phone: '', address: '' });
    setEditingAccountId(null);
  };

  const printLedger = () => {
    const printWindow = window.open('', '', 'height=900,width=1000');
    let filteredTx = transactions;
    if (reportFilter !== 'all') {
        filteredTx = filteredTx.filter(t => t.accountId == reportFilter);
    }
    
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
            <td>${t.date}</td>
            <td>Ref-${t.id.toString().slice(-4)}</td>
            <td>${t.desc}</td>
            <td style="text-align:right">${debit > 0 ? debit.toLocaleString() : '-'}</td>
            <td style="text-align:right">${credit > 0 ? credit.toLocaleString() : '-'}</td>
            <td style="text-align:right; font-weight:bold;">${runningBalance.toLocaleString()} ${runningBalance >= 0 ? 'CR' : 'DR'}</td>
        </tr>`;
    }).join('');

    const selectedAcc = accounts.find(a => a.id == reportFilter);
    const clientInfo = selectedAcc 
        ? `<strong>${selectedAcc.name}</strong><br>${selectedAcc.address || 'No Address'}<br>Phone: ${selectedAcc.phone || 'N/A'}`
        : `<strong>General Ledger</strong><br>All Accounts`;

    const htmlContent = `
      <html>
        <head>
          <title>Ledger Report</title>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #000; font-size: 12px; }
            .header-grid { display: grid; grid-template-columns: 1fr 1fr; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            h1 { font-size: 24px; margin: 0; text-transform: uppercase; }
            .meta-box { margin-top: 20px; border: 1px solid #ccc; padding: 10px; display: flex; justify-content: space-between; background: #f9f9f9; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { border: 1px solid #000; padding: 8px; background: #eee; text-align: center; font-weight: bold; }
            td { border: 1px solid #ccc; padding: 8px; }
            .totals-row td { border-top: 2px solid #000; font-weight: bold; background: #f0f0f0; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; border-top: 1px solid #ccc; padding-top: 10px; }
          </style>
        </head>
        <body>
            <div class="header-grid">
                <div>
                    <div style="font-size:10px; color:#666;">ACCOUNTS MANAGER</div>
                    <div style="font-size:16px; font-weight:bold; margin-top:5px;">${branding.name}</div>
                    <div>${branding.owners && branding.owners[0] ? branding.owners[0].name : 'Owner'}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:16px; font-weight:bold;">${ledgerConfig.title}</div>
                    <div style="margin-top:10px;">${clientInfo}</div>
                </div>
            </div>
            <div class="meta-box">
                <div><strong>From:</strong> ${dateRange.from || 'Start'} <strong>To:</strong> ${dateRange.to || 'Now'}</div>
                <div><strong>Previous Balance:</strong> 0.00</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width:15%">Date</th>
                        <th style="width:10%">Ref #</th>
                        <th style="width:35%">Description</th>
                        <th style="width:12%">Debit</th>
                        <th style="width:12%">Credit</th>
                        <th style="width:15%">Balance</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="totals-row">
                        <td colspan="3" style="text-align:right;">Total Period Movement:</td>
                        <td style="text-align:right;">${totalDebit.toLocaleString()}</td>
                        <td style="text-align:right;">${totalCredit.toLocaleString()}</td>
                        <td style="text-align:right;">${runningBalance.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
                Generated by LaunchAxis System • ${new Date().toLocaleDateString()}
            </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="section active">
      <div className="header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontSize: '24px' }}>Finance & Accounting</h1>
          <p style={{ color:'var(--text-muted)', margin: 0 }}>Professional Ledger & Statements</p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
            {['overview', 'directory', 'reports'].map(tab => (
                <button 
                    key={tab}
                    className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={() => setActiveTab(tab)}
                    style={{ textTransform:'capitalize' }}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* === TAB 1: OVERVIEW (CLEAN LEDGER) === */}
      {activeTab === 'overview' && (
        <div className="grid-2">
           {/* ENTRY FORM */}
           <div className="card">
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>
                <FontAwesomeIcon icon={faPlus} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }} /> 
                Quick Entry
              </h3>
              
              <div style={{ display:'flex', gap:'12px', marginBottom: '12px' }}>
                <select className="input-neon" style={{ marginBottom: 0 }} value={txForm.type} onChange={e=>setTxForm({...txForm, type:e.target.value})}>
                    <option value="income">Income (Credit)</option>
                    <option value="expense">Expense (Debit)</option>
                </select>
                <select className="input-neon" style={{ marginBottom: 0 }} value={txForm.accountId} onChange={e=>setTxForm({...txForm, accountId:e.target.value})}>
                    <option value="">-- Select Account --</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>

              <input className="input-neon" style={{ marginBottom: '12px' }} placeholder="Description (e.g. Commission Received)" value={txForm.desc} onChange={e=>setTxForm({...txForm, desc:e.target.value})} />
              <input className="input-neon" style={{ marginBottom: '20px' }} type="number" placeholder="Amount (PKR)" value={txForm.amount} onChange={e=>setTxForm({...txForm, amount:e.target.value})} />
              
              <button className="btn btn-primary" style={{ width:'100%', padding: '12px' }} onClick={handleTxSubmit}>Save Transaction</button>
           </div>

           {/* RECENT LEDGER */}
           <div className="card">
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>Recent Activity</h3>
              <div style={{ maxHeight:'300px', overflowY:'auto' }}>
                {/* UPGRADED TABLE: Added Description Column */}
                <table style={{ width:'100%', borderCollapse:'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', color: 'var(--text-muted)' }}>
                        <th style={{ paddingBottom: '12px' }}>Date</th>
                        <th style={{ paddingBottom: '12px' }}>Description</th>
                        <th style={{ paddingBottom: '12px' }}>Account</th>
                        <th style={{ paddingBottom: '12px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                        {transactions.slice(0, 10).map((t, idx) => (
                            <tr key={t.id} style={{ borderBottom: idx === 9 ? 'none' : '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 0', color: 'var(--text-dark)', fontSize: '13px' }}>{t.date}</td>
                                <td style={{ padding: '16px 0', color: 'var(--text-dark)', fontWeight: '600' }}>{t.desc}</td>
                                <td style={{ padding: '16px 0', color: 'var(--text-muted)' }}>{t.accountName || 'Unknown'}</td>
                                <td style={{ padding: '16px 0', textAlign: 'right', color: t.type === 'income' ? '#10b981' : '#ef4444', fontWeight:'800' }}>
                                    {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
           </div>
        </div>
      )}

      {/* === TAB 2: DIRECTORY (ACCOUNTS) === */}
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
                                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop: '4px' }}>{acc.category} • {acc.phone || 'No Phone'}</div>
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
                                        <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: '5px' }} /> {editingAccountId === acc.id ? 'Editing...' : 'Edit'}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

      {/* === TAB 3: REPORTS (PDF) === */}
      {activeTab === 'reports' && (
        <div className="card" style={{ maxWidth:'600px', margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'30px' }}>
                <FontAwesomeIcon icon={faFileInvoiceDollar} size="3x" style={{ color:'var(--neon-cyan)', marginBottom:'16px' }} />
                <h2 style={{ color: 'var(--text-dark)', margin: '0 0 8px 0' }}>Generate Ledger Report</h2>
                <p style={{ color:'var(--text-muted)', margin: 0 }}>Select a specific account to generate a PDF statement similar to your reference.</p>
            </div>

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>Select Account</label>
            <select className="input-neon" value={reportFilter} onChange={e=>setReportFilter(e.target.value)}>
                <option value="all">-- Full Business Ledger --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>From Date</label>
                    <input type="date" className="input-neon" style={{ marginBottom: 0 }} value={dateRange.from} onChange={e=>setDateRange({...dateRange, from:e.target.value})} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>To Date</label>
                    <input type="date" className="input-neon" style={{ marginBottom: 0 }} value={dateRange.to} onChange={e=>setDateRange({...dateRange, to:e.target.value})} />
                </div>
            </div>

            <button className="btn btn-primary" style={{ width:'100%', padding:'16px', fontSize:'16px' }} onClick={printLedger}>
                <FontAwesomeIcon icon={faPrint} style={{ marginRight: '8px' }} /> Download PDF Ledger
            </button>
        </div>
      )}
    </div>
  );
};

export default FinancePro;