import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, faToggleOn, faToggleOff, faTrash, faPlus,
  faEnvelope, faBars, faPalette, faFont, faHeading, faMagic
} from '@fortawesome/free-solid-svg-icons';
import ShopHome from '../components/shop/ShopHome';

const WebsiteEditor = ({ branding, siteConfig, setSiteConfig, products = [], addToCart = () => {} }) => {
  
  const [newLink, setNewLink] = useState({ label: '', link: '' });
  const [isGenerating, setIsGenerating] = useState({ hero: false, about: false });

  // --- SECURE INPUT SANITIZATION ---
  const sanitizeInput = (text) => {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  };

  // --- CONFIGURATION HANDLERS ---
  const handleToggle = (field) => {
    setSiteConfig({ ...siteConfig, [field]: !siteConfig[field] });
  };

  const handleTextChange = (section, field, value, maxChars = 250) => {
    if (value.length > maxChars) return;
    const cleanValue = sanitizeInput(value);
    if (section === 'global') {
      setSiteConfig({ ...siteConfig, [field]: cleanValue });
    } else {
      setSiteConfig({ ...siteConfig, [section]: { ...siteConfig[section], [field]: cleanValue } });
    }
  };

  const addMenuItem = () => {
    if (!newLink.label.trim()) return;
    const item = { 
      id: Date.now(), 
      label: sanitizeInput(newLink.label.trim()).substring(0, 20), 
      link: sanitizeInput(newLink.link.trim() || '#').substring(0, 100) 
    };
    setSiteConfig({ ...siteConfig, menuItems: [...siteConfig.menuItems, item] });
    setNewLink({ label: '', link: '' });
  };

  const removeMenuItem = (id) => {
    setSiteConfig({ ...siteConfig, menuItems: siteConfig.menuItems.filter(item => item.id !== id) });
  };

  const triggerAIGenerator = async (section) => {
    setIsGenerating({ ...isGenerating, [section]: true });
    setTimeout(() => {
      if (section === 'hero') {
        setSiteConfig(prev => ({
          ...prev,
          heroTitle: `Next-Gen ${branding.name || 'Products'} Engineered for Tomorrow`,
          heroSubtitle: "Experience premium structural efficiency and elegant asset styling combinations tailored to your precise routine requirements."
        }));
      } else if (section === 'about') {
        setSiteConfig(prev => ({
          ...prev,
          aboutText: `Our mission at ${branding.name || 'LaunchAxis'} is rooted in radical architectural simplicity. We design high-performance physical structures and systems optimized directly for sustainability and modern lifestyle parameters.`
        }));
      }
      setIsGenerating({ ...isGenerating, [section]: false });
    }, 1200);
  };

  // Shared inner styles for clean, uniform cards
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.2)', 
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', 
    color: '#fff', fontSize: '13px', outline: 'none', marginTop: '6px'
  };

  return (
    // STRICT HEIGHT CONTAINER: Locks the entire editor to the screen, preventing page scrolls
    <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', padding: '0 20px 20px' }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FontAwesomeIcon icon={faGlobe} style={{ color: '#2dd4bf' }} /> Website Engine
        </h1>
        <p style={{ color: '#888', fontSize: '13px', margin: '5px 0 0' }}>Configure themes, content blocks, and navigation</p>
      </div>

      {/* TWO-COLUMN LOCKED LAYOUT */}
      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* === LEFT COLUMN: SCROLLABLE SETTINGS PANEL === */}
        {/* We use standard CSS to hide the ugly scrollbar but keep it scrollable */}
        <div style={{ 
            width: '400px', flexShrink: 0, overflowY: 'auto', paddingRight: '10px',
            scrollbarWidth: 'none', msOverflowStyle: 'none' /* Hides scrollbar in Firefox/IE */
          }}
          className="hide-scrollbar-webkit"
        >
          <style>{`.hide-scrollbar-webkit::-webkit-scrollbar { display: none; }`}</style>
            
            {/* 1. BRAND BOARD */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '15px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faPalette} style={{ color: '#2dd4bf' }} /> Design Board
                </h3>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', color: '#888' }}>Global Theme Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <input type="color" value={siteConfig.themeColor || '#2dd4bf'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{ border: 'none', background: 'none', cursor: 'pointer', width: '35px', height: '35px', padding: 0 }} />
                    <input type="text" value={siteConfig.themeColor || '#2dd4bf'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{...inputStyle, marginTop: 0, fontFamily: 'monospace'}} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#888' }}>Global Font Identity</label>
                  <select value={siteConfig.fontFamily || 'Inter'} onChange={(e) => handleTextChange('global', 'fontFamily', e.target.value, 30)} style={{...inputStyle, cursor: 'pointer'}}>
                    <option value="Inter">Inter (Minimal Tech)</option>
                    <option value="'Manrope', sans-serif">Manrope (Modern Geometric)</option>
                    <option value="'Playfair Display', serif">Playfair (Premium Luxury)</option>
                  </select>
                </div>
            </div>

            {/* 2. ANNOUNCEMENT */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faEnvelope} style={{ color: '#2dd4bf' }} /> Announcement Bar</h3>
                  <div onClick={() => handleToggle('showAnnouncement')} style={{ cursor: 'pointer', color: siteConfig.showAnnouncement ? '#2dd4bf' : '#555' }}><FontAwesomeIcon icon={siteConfig.showAnnouncement ? faToggleOn : faToggleOff} size="lg" /></div>
                </div>
                {siteConfig.showAnnouncement && (
                  <input type="text" placeholder="e.g. Free shipping!" value={siteConfig.announcementText || ''} onChange={(e) => handleTextChange('global', 'announcementText', e.target.value, 120)} style={{...inputStyle, marginTop: '15px'}} />
                )}
            </div>

            {/* 3. NAVIGATION */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '15px', margin: '0 0 15px', display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faBars} style={{ color: '#2dd4bf' }} /> Navbar Links</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    {siteConfig.menuItems?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '13px' }}>{item.label}</span>
                            <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '12px' }} onClick={() => removeMenuItem(item.id)} />
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="Label (e.g., Sale)" value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} style={{...inputStyle, marginTop: 0}} />
                    <button onClick={addMenuItem} style={{ background: '#2dd4bf', color: '#000', border: 'none', borderRadius: '6px', padding: '0 15px', cursor: 'pointer' }}><FontAwesomeIcon icon={faPlus}/></button>
                </div>
            </div>

            {/* 4. HERO SECTION */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: siteConfig.showHero ? '15px' : '0' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faHeading} style={{ color: '#2dd4bf' }} /> Hero Section</h3>
                  <div onClick={() => handleToggle('showHero')} style={{ cursor: 'pointer', color: siteConfig.showHero ? '#2dd4bf' : '#555' }}><FontAwesomeIcon icon={siteConfig.showHero ? faToggleOn : faToggleOff} size="lg" /></div>
                </div>
                {siteConfig.showHero && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button onClick={() => triggerAIGenerator('hero')} disabled={isGenerating.hero} style={{ background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', border: '1px solid #2dd4bf', padding: '10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faMagic} /> {isGenerating.hero ? 'Generating...' : 'Generate Copy with AI'}
                    </button>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888' }}>Main Title</label>
                      <input value={siteConfig.heroTitle || ''} onChange={(e) => handleTextChange('global', 'heroTitle', e.target.value, 100)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888' }}>Subtext</label>
                      <textarea rows="3" value={siteConfig.heroSubtitle || ''} onChange={(e) => handleTextChange('global', 'heroSubtitle', e.target.value, 300)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
            </div>

            {/* 5. ABOUT SECTION */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: siteConfig.showAbout ? '15px' : '0' }}>
                  <h3 style={{ fontSize: '15px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><FontAwesomeIcon icon={faFont} style={{ color: '#2dd4bf' }} /> About Brand Block</h3>
                  <div onClick={() => handleToggle('showAbout')} style={{ cursor: 'pointer', color: siteConfig.showAbout ? '#2dd4bf' : '#555' }}><FontAwesomeIcon icon={siteConfig.showAbout ? faToggleOn : faToggleOff} size="lg" /></div>
                </div>
                {siteConfig.showAbout && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button onClick={() => triggerAIGenerator('about')} disabled={isGenerating.about} style={{ background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', border: '1px solid #2dd4bf', padding: '10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faMagic} /> {isGenerating.about ? 'Writing Bio...' : 'Generate Bio with AI'}
                    </button>
                    <div>
                      <label style={{ fontSize: '12px', color: '#888' }}>Narrative Body Copy</label>
                      <textarea rows="5" value={siteConfig.aboutText || ''} onChange={(e) => handleTextChange('global', 'aboutText', e.target.value, 600)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
            </div>
        </div>

        {/* === RIGHT COLUMN: BROWSER FRAME PREVIEW === */}
        <div style={{ 
            flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', 
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', background: '#000' 
        }}>
            {/* Fake Browser Toolbar */}
            <div style={{ 
              background: '#1e293b', padding: '12px 16px', display: 'flex', alignItems: 'center', 
              gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px 12px 0 0' 
            }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }}></div>
              <div style={{ margin: '0 auto', background: 'rgba(0,0,0,0.3)', padding: '4px 20px', borderRadius: '12px', fontSize: '11px', color: '#888' }}>
                launchaxis.com/preview
              </div>
            </div>
            
            {/* The Live Render Container (Internally Scrollable, Externally Locked) */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: '#fff', borderRadius: '0 0 12px 12px' }}>
                <ShopHome 
                  branding={branding}
                  products={products}
                  siteConfig={siteConfig}
                  addToCart={addToCart}
                  cartCount={0}
                  openCart={() => alert('Operational Simulation View Layer Only')}
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default WebsiteEditor;