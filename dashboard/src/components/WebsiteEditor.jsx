import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, faPenToSquare, faToggleOn, faToggleOff, faTrash, faPlus,
  faEnvelope, faShareNodes, faExternalLinkAlt, faWifi, faBars
} from '@fortawesome/free-solid-svg-icons';

const WebsiteEditor = ({ branding, siteConfig, setSiteConfig }) => {
  
  // Local state for the "Add New Link" inputs
  const [newLink, setNewLink] = useState({ label: '', link: '' });

  // --- HANDLERS ---
  const toggleSection = (section) => {
    setSiteConfig({ ...siteConfig, [section]: !siteConfig[section] });
  };

  const updateSocial = (platform, value) => {
    setSiteConfig({ 
        ...siteConfig, 
        socials: { ...siteConfig.socials, [platform]: value } 
    });
  };

  const addMenuItem = () => {
    if(!newLink.label) return;
    const item = { id: Date.now(), ...newLink };
    setSiteConfig({ ...siteConfig, menuItems: [...siteConfig.menuItems, item] });
    setNewLink({ label: '', link: '' }); // Reset inputs
  };

  const removeMenuItem = (id) => {
    const updatedMenu = siteConfig.menuItems.filter(item => item.id !== id);
    setSiteConfig({ ...siteConfig, menuItems: updatedMenu });
  };

  return (
    <div className="section active">
      <div className="header">
        <div>
          <h1><FontAwesomeIcon icon={faGlobe} style={{color:'var(--primary)', marginRight:'10px'}}/>Website Manager</h1>
          <p style={{color:'var(--text-muted)'}}>Manage your Storefront, Menu & Content</p>
        </div>
        
        <div style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)', 
            padding: '8px 15px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px'
        }}>
            <div style={{color:'var(--success)', fontSize:'12px'}}><FontAwesomeIcon icon={faWifi} /> Firebase Connected</div>
            <button className="btn btn-primary" onClick={()=> window.open('http://localhost:3000', '_blank')} style={{padding:'5px 15px', fontSize:'11px', borderRadius:'20px'}}>
                Visit Store <FontAwesomeIcon icon={faExternalLinkAlt} style={{marginLeft:'5px'}}/>
            </button>
        </div>
      </div>

      <div className="grid-2">
        {/* === LEFT COLUMN: CONTROLS === */}
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            
            {/* 1. NAVIGATION MANAGER (NEW) */}
            <div className="card" style={{borderLeft:'3px solid var(--accent-purple)'}}>
                <h3><FontAwesomeIcon icon={faBars} /> Navigation Manager</h3>
                <p style={{fontSize:'12px', color:'var(--text-muted)'}}>Customize your website navbar.</p>
                
                {/* Existing Items */}
                <div style={{marginBottom:'15px'}}>
                    {siteConfig.menuItems.map(item => (
                        <div key={item.id} style={{
                            display:'flex', justifyContent:'space-between', alignItems:'center',
                            background:'rgba(255,255,255,0.05)', padding:'10px', marginBottom:'5px', borderRadius:'5px'
                        }}>
                            <span style={{fontSize:'14px'}}>{item.label}</span>
                            <FontAwesomeIcon icon={faTrash} style={{cursor:'pointer', color:'var(--danger)', fontSize:'12px'}} onClick={()=>removeMenuItem(item.id)} />
                        </div>
                    ))}
                </div>

                {/* Add New Item */}
                <div style={{display:'flex', gap:'10px'}}>
                    <input 
                        className="input-neon" placeholder="Name (e.g. Sale)" 
                        value={newLink.label} onChange={(e)=>setNewLink({...newLink, label:e.target.value})} 
                        style={{marginBottom:0}}
                    />
                    <button className="btn btn-primary" onClick={addMenuItem}><FontAwesomeIcon icon={faPlus}/></button>
                </div>
            </div>

            {/* 2. COMMUNICATION HUB */}
            <div className="card">
                <h3><FontAwesomeIcon icon={faEnvelope} /> Communication Hub</h3>
                <label>Order Notification Email</label>
                <input 
                    className="input-neon" value={siteConfig.notificationEmail} 
                    onChange={(e)=>setSiteConfig({...siteConfig, notificationEmail:e.target.value})} 
                />
            </div>

            {/* 3. LAYOUT MANAGER */}
            <div className="card">
                <h3><FontAwesomeIcon icon={faPenToSquare} /> Layout & Sections</h3>
                {[{ id: 'showHero', label: 'Hero Banner' }, { id: 'showProducts', label: 'Product Grid' }].map(item => (
                    <div key={item.id} style={{display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)'}}>
                        <span>{item.label}</span>
                        <div onClick={() => toggleSection(item.id)} style={{cursor:'pointer', color: siteConfig[item.id] ? 'var(--primary)' : 'var(--text-muted)'}}>
                            <FontAwesomeIcon icon={siteConfig[item.id] ? faToggleOn : faToggleOff} size="lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* === RIGHT COLUMN: PREVIEW === */}
        <div className="card" style={{padding:0, overflow:'hidden', border:'2px solid var(--border)', height:'700px', display:'flex', flexDirection:'column'}}>
            <div style={{background:'#1e293b', padding:'10px', fontSize:'11px', color:'var(--text-muted)', textAlign:'center', borderBottom:'1px solid #334155'}}>
                Live Preview: launchaxis.com
            </div>
            
            <div style={{flex:1, background:'#fff', color:'#333', overflowY:'auto'}}>
                {/* PREVIEW NAVBAR (DYNAMIC) */}
                <div style={{padding:'15px 20px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>{branding.name}</span>
                    <div style={{display:'flex', gap:'15px', fontSize:'12px'}}>
                        {siteConfig.menuItems.map(item => (
                            <span key={item.id}>{item.label}</span>
                        ))}
                    </div>
                </div>

                {/* PREVIEW HERO */}
                {siteConfig.showHero && (
                    <div style={{background:'#f8fafc', padding:'50px 20px', textAlign:'center'}}>
                        <h2 style={{color:'#1e293b'}}>{branding.slogan || 'Welcome'}</h2>
                        <button style={{background: siteConfig.themeColor, color:'#fff', padding:'8px 20px', border:'none', borderRadius:'4px'}}>Shop Now</button>
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

export default WebsiteEditor;