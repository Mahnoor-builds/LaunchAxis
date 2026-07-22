import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, faToggleOn, faToggleOff, faTrash, faPlus,
  faEnvelope, faBars, faPalette, faFont, faHeading, faMagic, faTags, faLock, faUpload
} from '@fortawesome/free-solid-svg-icons';
import ShopHome from '../components/shop/ShopHome'; 

const WebsiteEditor = ({ branding, siteConfig, setSiteConfig, products = [], addToCart = () => {} }) => {
  
  const [newLink, setNewLink] = useState({ label: '', link: '' });
  const [newCategory, setNewCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState({ hero: false, about: false });

  // --- IRON-CLAD CORE LINKS LOGIC ---
  let baseMenu = siteConfig.menuItems || [];

  // 1. Retroactively lock existing system links if they don't have the security flag
  baseMenu = baseMenu.map(item => {
      if (item.link === '#home' || item.link === '#catalog' || item.link === '#about') {
          return { ...item, isCore: true };
      }
      return item;
  });

  // 2. Ensure core links exist. If they were accidentally deleted, auto-restore them.
  const hasHome = baseMenu.some(i => i.link === '#home');
  const hasCatalog = baseMenu.some(i => i.link === '#catalog');
  const hasAbout = baseMenu.some(i => i.link === '#about');
  
  if (!hasHome) baseMenu.unshift({ id: 'core-home', label: 'Home', link: '#home', isCore: true });
  if (!hasCatalog) baseMenu.splice(1, 0, { id: 'core-catalog', label: 'Catalog', link: '#catalog', isCore: true });
  if (!hasAbout) baseMenu.push({ id: 'core-about', label: 'About', link: '#about', isCore: true });

  const currentMenu = baseMenu;

  // Sync the patched menu back to state on load
  useEffect(() => {
    setSiteConfig(prev => ({ ...prev, menuItems: currentMenu }));
  }, []);

  // --- SECURE INPUT SANITIZATION ---
  const sanitizeInput = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

  // --- CONFIGURATION HANDLERS ---
  const handleToggle = (field) => setSiteConfig({ ...siteConfig, [field]: !siteConfig[field] });

  const handleTextChange = (section, field, value, maxChars = 250) => {
    if (value.length > maxChars) return;
    const cleanValue = sanitizeInput(value);
    if (section === 'global') setSiteConfig({ ...siteConfig, [field]: cleanValue });
    else setSiteConfig({ ...siteConfig, [section]: { ...siteConfig[section], [field]: cleanValue } });
  };

  const handleImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSiteConfig({ ...siteConfig, [field]: imageUrl });
    }
  };

  // --- NAVBAR LOGIC ---
  const updateMenuLabel = (id, newLabel) => {
    const updatedMenu = currentMenu.map(item => 
        item.id === id ? { ...item, label: sanitizeInput(newLabel).substring(0, 20) } : item
    );
    setSiteConfig({ ...siteConfig, menuItems: updatedMenu });
  };

  const addMenuItem = () => {
    if (!newLink.label.trim()) return;
    const item = { id: Date.now(), label: sanitizeInput(newLink.label.trim()).substring(0, 20), link: sanitizeInput(newLink.link.trim() || '#').substring(0, 100), isCore: false };
    setSiteConfig({ ...siteConfig, menuItems: [...currentMenu, item] });
    setNewLink({ label: '', link: '' });
  };

  const removeMenuItem = (id) => setSiteConfig({ ...siteConfig, menuItems: currentMenu.filter(item => item.id !== id || item.isCore) });

  // --- CATEGORY LOGIC (MAX 6) ---
  const addCategory = () => {
    if (!newCategory.trim()) return;
    const currentCategories = siteConfig.categories || [];
    if (currentCategories.length >= 6) return; 
    const item = { id: Date.now(), label: sanitizeInput(newCategory.trim()).substring(0, 20) };
    setSiteConfig({ ...siteConfig, categories: [...currentCategories, item] });
    setNewCategory('');
  };

  const removeCategory = (id) => setSiteConfig({ ...siteConfig, categories: (siteConfig.categories || []).filter(cat => cat.id !== id) });

  // --- AI GENERATOR ---
  const triggerAIGenerator = async (section) => {
    setIsGenerating({ ...isGenerating, [section]: true });
    setTimeout(() => {
      if (section === 'hero') {
        setSiteConfig(prev => ({
          ...prev,
          heroTitle: `Next-Gen ${branding?.name || 'Products'} Engineered for Tomorrow`,
          heroSubtitle: "Experience premium structural efficiency and elegant asset styling combinations tailored to your precise routine requirements."
        }));
      } else if (section === 'about') {
        setSiteConfig(prev => ({
          ...prev,
          aboutText: `Our mission at ${branding?.name || 'LaunchAxis'} is rooted in radical architectural simplicity. We design high-performance physical structures and systems optimized directly for sustainability and modern lifestyle parameters.`
        }));
      }
      setIsGenerating({ ...isGenerating, [section]: false });
    }, 1200);
  };

  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
  const inputStyle = { width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' };

  const currentCategories = siteConfig.categories || [];
  const isCategoryLimitReached = currentCategories.length >= 6;

  return (
    <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', padding: '0 20px 20px', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px 0', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--primary)' }} /> Website Engine
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Configure themes, content blocks, and storefront navigation</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* === LEFT COLUMN: CONTROLS === */}
        <div style={{ width: '420px', flexShrink: 0, overflowY: 'auto', paddingRight: '10px', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar-webkit">
          <style>{`.hide-scrollbar-webkit::-webkit-scrollbar { display: none; }`}</style>
            
            {/* DESIGN BOARD */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}><FontAwesomeIcon icon={faPalette} style={{ color: 'var(--primary)' }} /> Design Board</h3>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Global Theme Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <input type="color" value={siteConfig.themeColor || '#2dd4bf'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{ border: 'none', background: 'none', cursor: 'pointer', width: '40px', height: '40px', padding: 0 }} />
                    <input type="text" value={siteConfig.themeColor || '#2dd4bf'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{...inputStyle, marginTop: 0, fontFamily: 'monospace', flex: 1}} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Global Font Identity</label>
                  <select value={siteConfig.fontFamily || 'Inter'} onChange={(e) => handleTextChange('global', 'fontFamily', e.target.value, 30)} style={{...inputStyle, cursor: 'pointer'}}>
                    <option value="'Inter', sans-serif">Inter (Minimal Tech)</option>
                    <option value="'Manrope', sans-serif">Manrope (Modern Geometric)</option>
                    <option value="'Playfair Display', serif">Playfair (Premium Luxury)</option>
                  </select>
                </div>
            </div>

            {/* ANNOUNCEMENT */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}><FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--primary)' }} /> Announcement Bar</h3>
                  <div onClick={() => handleToggle('showAnnouncement')} style={{ cursor: 'pointer', color: siteConfig.showAnnouncement ? 'var(--primary)' : '#cbd5e1' }}><FontAwesomeIcon icon={siteConfig.showAnnouncement ? faToggleOn : faToggleOff} size="lg" /></div>
                </div>
                {siteConfig.showAnnouncement && (
                  <input type="text" placeholder="e.g. Free shipping on all orders over $50!" value={siteConfig.announcementText || ''} onChange={(e) => handleTextChange('global', 'announcementText', e.target.value, 120)} style={{...inputStyle, marginTop: '16px'}} />
                )}
            </div>

            {/* NAVIGATION (LOCKED CORE LINKS) */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}><FontAwesomeIcon icon={faBars} style={{ color: 'var(--primary)' }} /> Header Links</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', marginTop: 0 }}>Rename labels to match your brand. Core routing is securely locked.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {currentMenu.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '10px' }}>
                            <input 
                                value={item.label} 
                                onChange={(e) => updateMenuLabel(item.id, e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '14px', color: '#334155', fontWeight: 'bold', outline: 'none', flex: 1 }}
                            />
                            {item.isCore ? (
                                <FontAwesomeIcon icon={faLock} style={{ color: '#cbd5e1', fontSize: '13px' }} title="System Core Link" />
                            ) : (
                                <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '14px' }} onClick={() => removeMenuItem(item.id)} />
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input placeholder="Add custom link..." value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} style={{...inputStyle, marginTop: 0}} />
                    <button onClick={addMenuItem} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', cursor: 'pointer', fontWeight: 'bold' }}><FontAwesomeIcon icon={faPlus}/></button>
                </div>
            </div>

            {/* PRODUCT CATEGORIES */}
            <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}><FontAwesomeIcon icon={faTags} style={{ color: 'var(--primary)' }} /> Product Collections</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', marginTop: 0 }}>Organize your storefront. Max 6 categories.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {currentCategories.map(cat => (
                        <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>{cat.label}</span>
                            <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '14px' }} onClick={() => removeCategory(cat.id)} />
                        </div>
                    ))}
                </div>
                
                {isCategoryLimitReached ? (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', color: '#ef4444', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                        Maximum of 6 categories reached.
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input placeholder="e.g. Summer Wear..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{...inputStyle, marginTop: 0}} />
                        <button onClick={addCategory} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', cursor: 'pointer', fontWeight: 'bold' }}><FontAwesomeIcon icon={faPlus}/></button>
                    </div>
                )}
            </div>

            {/* HERO SECTION (WITH IMAGE UPLOAD) */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: siteConfig.showHero ? '20px' : '0' }}>
                  <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}><FontAwesomeIcon icon={faHeading} style={{ color: 'var(--primary)' }} /> Hero Banner</h3>
                  <div onClick={() => handleToggle('showHero')} style={{ cursor: 'pointer', color: siteConfig.showHero ? 'var(--primary)' : '#cbd5e1' }}><FontAwesomeIcon icon={siteConfig.showHero ? faToggleOn : faToggleOff} size="lg" /></div>
                </div>
                {siteConfig.showHero && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button onClick={() => triggerAIGenerator('hero')} disabled={isGenerating.hero} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faMagic} /> {isGenerating.hero ? 'Generating...' : 'Generate Copy with AI'}
                    </button>
                    
                    <div>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Background Image</label>
                      <input type="file" accept="image/*" id="hero-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('heroImage', e)} />
                      <label htmlFor="hero-upload" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', marginTop: '6px', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>
                          <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} /> 
                          {siteConfig.heroImage ? 'Change Image' : 'Upload Image'}
                      </label>
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Main Title</label>
                      <input value={siteConfig.heroTitle || ''} onChange={(e) => handleTextChange('global', 'heroTitle', e.target.value, 100)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Subtext</label>
                      <textarea rows="3" value={siteConfig.heroSubtitle || ''} onChange={(e) => handleTextChange('global', 'heroSubtitle', e.target.value, 300)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
            </div>

            {/* ABOUT SECTION (WITH IMAGE UPLOAD) */}
            <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: siteConfig.showAbout ? '20px' : '0' }}>
                  <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}><FontAwesomeIcon icon={faFont} style={{ color: 'var(--primary)' }} /> Brand Bio</h3>
                  <div onClick={() => handleToggle('showAbout')} style={{ cursor: 'pointer', color: siteConfig.showAbout ? 'var(--primary)' : '#cbd5e1' }}><FontAwesomeIcon icon={siteConfig.showAbout ? faToggleOn : faToggleOff} size="lg" /></div>
                </div>
                {siteConfig.showAbout && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button onClick={() => triggerAIGenerator('about')} disabled={isGenerating.about} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faMagic} /> {isGenerating.about ? 'Writing Bio...' : 'Generate Bio with AI'}
                    </button>
                    
                    <div>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Brand Image</label>
                      <input type="file" accept="image/*" id="about-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('aboutImage', e)} />
                      <label htmlFor="about-upload" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', marginTop: '6px', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>
                          <FontAwesomeIcon icon={faUpload} style={{ marginRight: '8px' }} /> 
                          {siteConfig.aboutImage ? 'Change Image' : 'Upload Image'}
                      </label>
                    </div>

                    <div>
                      <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Narrative Body Copy</label>
                      <textarea rows="5" value={siteConfig.aboutText || ''} onChange={(e) => handleTextChange('global', 'aboutText', e.target.value, 600)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
            </div>
        </div>

        {/* === RIGHT COLUMN: UNBREAKABLE PREVIEW FRAME === */}
        <div style={{ 
            flex: 1, position: 'relative', background: '#0f172a', borderRadius: '16px', border: '1px solid #cbd5e1',
            display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: 'calc(100% - 440px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{ flexShrink: 0, height: '45px', background: '#1e293b', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
              <div style={{ margin: '0 auto', background: '#0f172a', padding: '4px 24px', borderRadius: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                launchaxis.com/preview
              </div>
            </div>
            
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', overflowX: 'hidden', background: '#fff' }}>
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
    </div>
  );
};

export default WebsiteEditor;