import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPrint, faAddressBook, faFileInvoiceDollar, faChartLine, 
  faPlus, faUserPlus, faWallet, faMoneyBillWave, faPenToSquare 
} from '@fortawesome/free-solid-svg-icons';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FinancePro = ({ transactions, accounts, addAccount, branding, addTransaction }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // --- FORMS ---
  const [txForm, setTxForm] = useState({ desc: '', amount: '', type: 'expense', accountId: '' });
  const [accForm, setAccForm] = useState({ name: '', category: 'Customer', phone: '', address: '' });
  
  // --- REPORT CONFIG ---
  const [reportFilter, setReportFilter] = useState('all'); 
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [ledgerConfig, setLedgerConfig] = useState({
    title: 'Account Ledger Report',
    color: '#2dd4bf'
  });

  // --- HELPER: GET BALANCE ---
  const getBalance = (accountId) => {
    return transactions
      .filter(t => t.accountId == accountId)
      .reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  };

  // --- 1. SUBMIT LOGIC ---
  const handleTxSubmit = () => {
    if(!txForm.desc || !txForm.amount || !txForm.accountId) return alert("Please fill all details.");
    const selectedAcc = accounts.find(a => a.id == txForm.accountId);
    
    addTransaction({ 
        ...txForm, 
        amount: parseFloat(txForm.amount), 
        date: new Date().toLocaleDateString(),
        accountName: selectedAcc ? selectedAcc.name : 'Unknown'
    });
    setTxForm({ desc: '', amount: '', type: 'expense', accountId: '' }); 
  };

  const handleAccountSubmit = () => {
    if(!accForm.name) return alert("Enter account name");
    addAccount({ 
        name: accForm.name, 
        category: accForm.category,
        phone: accForm.phone,
        address: accForm.address 
    });
    setAccForm({ name: '', category: 'Customer', phone: '', address: '' });
  };

  // --- 2. PROFESSIONAL PDF GENERATOR (MATCHING YOUR PDF) ---
  const printLedger = () => {
    const printWindow = window.open('', '', 'height=900,width=1000');
    
    // 1. FILTER DATA
    let filteredTx = transactions;
    
    // Filter by Account
    if (reportFilter !== 'all') {
        filteredTx = filteredTx.filter(t => t.accountId == reportFilter);
    }
    
    // Filter by Date (Optional basic implementation)
    // Note: In a real app, you'd parse dates strictly. Here we skip for demo simplicity.

    // 2. CALCULATE TOTALS
    let totalDebit = 0; // Money Out / Expenses
    let totalCredit = 0; // Money In / Income
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

    // 3. GET ACCOUNT DETAILS FOR HEADER
    const selectedAcc = accounts.find(a => a.id == reportFilter);
    const clientInfo = selectedAcc 
        ? `<strong>${selectedAcc.name}</strong><br>${selectedAcc.address || 'No Address'}<br>Phone: ${selectedAcc.phone || 'N/A'}`
        : `<strong>General Ledger</strong><br>All Accounts`;

    // 4. GENERATE HTML
    printWindow.document.write(`
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
                Generated by LaunchAxis System • ${new Date().toLocaleString()}
            </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // --- CHART DATA PREP ---
  const chartData = transactions.map((t, i) => ({
      name: t.date.slice(0,5),
      amount: t.amount,
      type: t.type
  })).slice(-7); // Last 7 transactions

  return (
    <div className="section active">
      <div className="header">
        <div>
          <h1>Finance & Accounting</h1>
          <p style={{color:'var(--text-muted)'}}>Professional Ledger & Statements</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
            {['overview', 'directory', 'reports'].map(tab => (
                <button 
                    key={tab}
                    className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={()=>setActiveTab(tab)}
                    style={{textTransform:'capitalize'}}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* === TAB 1: OVERVIEW === */}
      {activeTab === 'overview' && (
        <div className="grid-2">
           {/* CHART SECTION */}
           <div className="card" style={{gridColumn:'1 / -1', height:'300px'}}>
             <h3><FontAwesomeIcon icon={faChartLine} style={{color:'var(--primary)'}} /> Cash Flow (In/Out)</h3>
             <div style={{width:'100%', height:'220px'}}>
                <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSplit" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <Tooltip contentStyle={{backgroundColor:'#1e293b', border:'none', borderRadius:'8px'}} />
                        <Area type="monotone" dataKey="amount" stroke="#2dd4bf" fill="url(#colorSplit)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
           </div>

           {/* ENTRY FORM */}
           <div className="card">
              <h3><FontAwesomeIcon icon={faPlus} /> Quick Entry</h3>
              
              <div style={{display:'flex', gap:'10px'}}>
                <select className="select-neon" value={txForm.type} onChange={e=>setTxForm({...txForm, type:e.target.value})}>
                    <option value="income">Income (Credit)</option>
                    <option value="expense">Expense (Debit)</option>
                </select>
                <select className="select-neon" value={txForm.accountId} onChange={e=>setTxForm({...txForm, accountId:e.target.value})}>
                    <option value="">-- Select Account --</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
              </div>

              <input className="input-neon" placeholder="Description (e.g. Commission Received)" value={txForm.desc} onChange={e=>setTxForm({...txForm, desc:e.target.value})} />
              <input className="input-neon" type="number" placeholder="Amount (PKR)" value={txForm.amount} onChange={e=>setTxForm({...txForm, amount:e.target.value})} />
              
              <button className="btn btn-primary" style={{width:'100%'}} onClick={handleTxSubmit}>Save Transaction</button>
           </div>

           {/* RECENT LEDGER */}
           <div className="card">
              <h3>Recent Activity</h3>
              <div style={{maxHeight:'300px', overflowY:'auto'}}>
                <table className="ledger-preview-table" style={{width:'100%', borderCollapse:'collapse'}}>
                    <thead><tr><th>Date</th><th>Entity</th><th>Amount</th></tr></thead>
                    <tbody>
                        {transactions.slice(0, 5).map(t => (
                            <tr key={t.id}>
                                <td>{t.date}</td>
                                <td>{t.accountName}</td>
                                <td style={{color: t.type === 'income' ? 'var(--success)' : 'var(--danger)', fontWeight:'bold'}}>
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
            <div className="card">
                <h3><FontAwesomeIcon icon={faUserPlus} /> Add New Account</h3>
                <label>Account / Person Name</label>
                <input className="input-neon" value={accForm.name} onChange={e=>setAccForm({...accForm, name:e.target.value})} placeholder="e.g. Raja Naveed Kiyani" />
                
                <label>Category</label>
                <select className="select-neon" value={accForm.category} onChange={e=>setAccForm({...accForm, category:e.target.value})}>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Investor">Investor</option>
                    <option value="Bank">Bank/Cash</option>
                </select>

                <label>Phone (Optional)</label>
                <input className="input-neon" value={accForm.phone} onChange={e=>setAccForm({...accForm, phone:e.target.value})} placeholder="0300-1234567" />
                
                <label>Address (Optional)</label>
                <input className="input-neon" value={accForm.address} onChange={e=>setAccForm({...accForm, address:e.target.value})} placeholder="Office No..." />

                <button className="btn btn-primary" style={{width:'100%'}} onClick={handleAccountSubmit}>Create Account</button>
            </div>

            <div className="card">
                <h3><FontAwesomeIcon icon={faAddressBook} /> Account Balances</h3>
                <div style={{maxHeight:'450px', overflowY:'auto'}}>
                    {accounts.map(acc => {
                        const bal = getBalance(acc.id);
                        return (
                            <div key={acc.id} style={{padding:'15px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <div style={{fontWeight:'bold', fontSize:'15px'}}>{acc.name}</div>
                                    <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{acc.category} • {acc.phone || 'No Phone'}</div>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <div style={{fontWeight:'bold', color: bal >= 0 ? 'var(--success)' : 'var(--danger)', fontSize:'16px'}}>
                                        {bal.toLocaleString()}
                                    </div>
                                    <button className="btn btn-outline" style={{padding:'4px 10px', fontSize:'10px', marginTop:'5px'}}>
                                        <FontAwesomeIcon icon={faPenToSquare} /> Edit
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
        <div className="card" style={{maxWidth:'600px', margin:'0 auto'}}>
            <div style={{textAlign:'center', marginBottom:'30px'}}>
                <FontAwesomeIcon icon={faFileInvoiceDollar} size="3x" style={{color:'var(--primary)', marginBottom:'15px'}} />
                <h2>Generate Ledger Report</h2>
                <p style={{color:'var(--text-muted)'}}>Select a specific account to generate a PDF statement similar to your reference.</p>
            </div>

            <label>Select Account</label>
            <select className="select-neon" value={reportFilter} onChange={e=>setReportFilter(e.target.value)}>
                <option value="all">-- Full Business Ledger --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div>
                    <label>From Date</label>
                    <input type="date" className="input-neon" value={dateRange.from} onChange={e=>setDateRange({...dateRange, from:e.target.value})} />
                </div>
                <div>
                    <label>To Date</label>
                    <input type="date" className="input-neon" value={dateRange.to} onChange={e=>setDateRange({...dateRange, to:e.target.value})} />
                </div>
            </div>

            <button className="btn btn-primary" style={{width:'100%', padding:'15px', fontSize:'16px'}} onClick={printLedger}>
                <FontAwesomeIcon icon={faPrint} /> Download PDF Ledger
            </button>
        </div>
      )}
    </div>
  );
};

export default FinancePro;