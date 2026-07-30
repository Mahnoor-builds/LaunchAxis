import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, faToggleOn, faToggleOff, faTrash, faPlus,
  faEnvelope, faBars, faPalette, faFont, faHeading, faMagic, faTags, faLock, faUpload,
  faSave, faLink, faExternalLinkAlt, faExclamationTriangle, faShareAlt, faTruck, faImage, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

import ShopHome from '../components/shop/ShopHome'; 

const WebsiteEditor = ({ branding, siteConfig, setSiteConfig, products = [], addToCart = () => {} }) => {
  // Navigation Tabs for Left Panel
  const [activeTab, setActiveTab] = useState('hero_about'); 
  const [activeSubSection, setActiveSubSection] = useState('hero'); // 'hero' or 'about' toggle
  
  const [newLink, setNewLink] = useState({ label: '', link: '' });
  const [newCategory, setNewCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState({ hero: false, about: false });
  const [isSaving, setIsSaving] = useState(false);
  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // --- IRON-CLAD CORE LINKS LOGIC ---
  let baseMenu = siteConfig.menuItems || [];

  baseMenu = baseMenu.map(item => {
    if (item.link === '#home' || item.link === '#catalog' || item.link === '#about') {
      return { ...item, isCore: true };
    }
    return item;
  });

  const hasHome = baseMenu.some(i => i.link === '#home');
  const hasCatalog = baseMenu.some(i => i.link === '#catalog');
  const hasAbout = baseMenu.some(i => i.link === '#about');
  
  if (!hasHome) baseMenu.unshift({ id: 'core-home', label: 'Home', link: '#home', isCore: true });
  if (!hasCatalog) baseMenu.splice(1, 0, { id: 'core-catalog', label: 'Catalog', link: '#catalog', isCore: true });
  if (!hasAbout) baseMenu.push({ id: 'core-about', label: 'About', link: '#about', isCore: true });

  const currentMenu = baseMenu;

  useEffect(() => {
    setSiteConfig(prev => ({ ...prev, menuItems: currentMenu }));
  }, []);

  const sanitizeInput = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

  const handleSubdomainChange = (val) => {
    const cleanSubdomain = val.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 30);
    setSiteConfig({ ...siteConfig, subdomain: cleanSubdomain });
  };

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

  // --- NEW: UNSPLASH API IMAGE SEARCH ---
  const handleUnsplashSearch = async (targetField) => {
    const keyword = prompt("Enter a keyword to search Unsplash for an image (e.g., 'luxury shoes', 'modern office', 'fashion'):");
    if (!keyword) return;

    setIsSearchingImage(true);
    try {
      const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        alert("Please ensure REACT_APP_UNSPLASH_ACCESS_KEY is set in your .env file.");
        setIsSearchingImage(false);
        return;
      }

      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`, {
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      });
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const photoUrl = data.results[0].urls.regular;
        setSiteConfig(prev => ({ ...prev, [targetField]: photoUrl }));
      } else {
        alert("No images found for that keyword. Try another term!");
      }
    } catch (error) {
      console.error("Unsplash Search Error:", error);
      alert("Could not fetch image from Unsplash. Please check your API key or internet connection.");
    } finally {
      setIsSearchingImage(false);
    }
  };

  // --- FIREBASE SAVE FUNCTION ---
  const handleSaveToFirebase = async () => {
    try {
      setIsSaving(true);
      const user = auth.currentUser;
      const userId = user ? user.uid : 'ceo@ecosole.store';
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { siteConfig }, { merge: true });
      alert("✨ Website configuration successfully published to Firebase!");
    } catch (error) {
      console.error("Error saving site config:", error);
      alert("Failed to save website config: " + error.message);
    } finally {
      setIsSaving(false);
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
    const item = { id: Date.now(), label: sanitizeInput(newCategory.trim()).substring(0, 20), image: '' };
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
  const currentSubdomain = siteConfig.subdomain || 'yourstore';
  const liveUrl = `https://${currentSubdomain}.launchaxis.com`;

  return (
    <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', padding: '0 20px 20px', boxSizing: 'border-box' }}>
      
      {/* HEADER WITH ACTION BUTTONS & VIEW STORE */}
      <div style={{ padding: '20px 0', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Website & Storefront Engine
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Configure themes, navigation, collections, and live styling</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* OPEN LIVE SITE BUTTON */}
          <button 
            onClick={() => window.open(liveUrl, '_blank')}
            style={{ 
              background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', 
              borderRadius: '8px', padding: '12px 20px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} /> View Live Store
          </button>

          {/* SAVE & PUBLISH BUTTON */}
          <button 
            onClick={handleSaveToFirebase} 
            disabled={isSaving}
            style={{ 
              background: '#0f172a', color: '#fff', border: 'none', 
              borderRadius: '8px', padding: '12px 24px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Publishing to Cloud...' : 'Save & Publish'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, overflow: 'hidden' }}>
        
        {/* === LEFT COLUMN: TABBED CONTROLS === */}
        <div style={{ width: '450px', flexShrink: 0, overflowY: 'auto', paddingRight: '10px' }}>
          
          {/* SECTION NAVIGATION BUTTON TABS */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: '#f1f5f9', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
            {[
              { id: 'hero_about', label: 'Hero & Bio', icon: faPalette },
              { id: 'navbar', label: 'Navbar', icon: faBars },
              { id: 'categories', label: 'Collections', icon: faTags },
              { id: 'footer', label: 'Footer & Legal', icon: faShareAlt },
              { id: 'delivery', label: 'COD & Bar', icon: faTruck }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: '1 1 auto', padding: '10px 12px', border: 'none',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#0f172a' : '#64748b',
                  fontWeight: activeTab === tab.id ? '700' : '600',
                  borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                  boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <FontAwesomeIcon icon={tab.icon} /> {tab.label}
              </button>
            ))}
          </div>

          {/* ========================================================= */}
          {/* TAB 1: HERO BANNER & BRAND BIO (WITH SWITCHER & AI IMAGE) */}
          {/* ========================================================= */}
          {activeTab === 'hero_about' && (
            <div style={{ animation: 'fadeIn 0.2s' }}>
              
              {/* SUBDOMAIN & THEME COLOR BOARD */}
              <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                  <FontAwesomeIcon icon={faLink} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Store Subdomain & Theme
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', marginBottom: '16px' }}>
                  <input 
                    type="text" 
                    value={siteConfig.subdomain || ''} 
                    onChange={(e) => handleSubdomainChange(e.target.value)} 
                    placeholder="eco-sole"
                    style={{ border: 'none', background: 'transparent', padding: '12px 0', fontSize: '14px', outline: 'none', flex: 1, fontWeight: 'bold', color: '#0f172a' }} 
                  />
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>.launchaxis.com</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Accent Color:</label>
                  <input type="color" value={siteConfig.themeColor || '#2dd4bf'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{ border: 'none', background: 'none', cursor: 'pointer', width: '36px', height: '36px', padding: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px' }}>{(siteConfig.themeColor || '#2dd4bf').toUpperCase()}</span>
                </div>
              </div>

              {/* TWO-BUTTON SUB-TOGGLE: HERO vs. ABOUT */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setActiveSubSection('hero')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    background: activeSubSection === 'hero' ? '#0f172a' : '#f8fafc',
                    color: activeSubSection === 'hero' ? '#fff' : '#475569',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faHeading} style={{ marginRight: '6px' }} /> Edit Header / Hero
                </button>
                <button
                  onClick={() => setActiveSubSection('about')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    background: activeSubSection === 'about' ? '#0f172a' : '#f8fafc',
                    color: activeSubSection === 'about' ? '#fff' : '#475569',
                    fontWeight: '700', fontSize: '13px', cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faFont} style={{ marginRight: '6px' }} /> Edit Brand Bio / About
                </button>
              </div>

              {/* HERO EDITOR BOX */}
              {activeSubSection === 'hero' && (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', margin: 0, color: '#0f172a' }}>Hero Banner Content</h3>
                    <div onClick={() => handleToggle('showHero')} style={{ cursor: 'pointer', color: siteConfig.showHero ? '#10b981' : '#cbd5e1' }}>
                      <FontAwesomeIcon icon={siteConfig.showHero ? faToggleOn : faToggleOff} size="lg" />
                    </div>
                  </div>

                  {siteConfig.showHero && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <button onClick={() => triggerAIGenerator('hero')} disabled={isGenerating.hero} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMagic} /> {isGenerating.hero ? 'Writing Hero Copy...' : 'Generate Hero Text with AI'}
                      </button>

                      {/* IMAGE UPLOAD & UNSPLASH AI SEARCH */}
                      <div>
                        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Hero Background Image</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <input type="file" accept="image/*" id="hero-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('heroImage', e)} />
                          <label htmlFor="hero-upload" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>
                            <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} /> Upload
                          </label>
                          <button onClick={() => handleUnsplashSearch('heroImage')} disabled={isSearchingImage} style={{ flex: 1.2, padding: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} /> {isSearchingImage ? 'Searching...' : 'Search Unsplash (AI)'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Hero Title</label>
                        <input value={siteConfig.heroTitle || ''} onChange={(e) => handleTextChange('global', 'heroTitle', e.target.value, 100)} style={inputStyle} placeholder="Welcome to our store" />
                      </div>
                      <div>
                        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Hero Subtext</label>
                        <textarea rows="3" value={siteConfig.heroSubtitle || ''} onChange={(e) => handleTextChange('global', 'heroSubtitle', e.target.value, 300)} style={{...inputStyle, resize: 'none'}} placeholder="High quality products for your lifestyle." />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ABOUT / BRAND BIO EDITOR BOX */}
              {activeSubSection === 'about' && (
                <div style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', margin: 0, color: '#0f172a' }}>Brand Bio / About Section</h3>
                    <div onClick={() => handleToggle('showAbout')} style={{ cursor: 'pointer', color: siteConfig.showAbout ? '#10b981' : '#cbd5e1' }}>
                      <FontAwesomeIcon icon={siteConfig.showAbout ? faToggleOn : faToggleOff} size="lg" />
                    </div>
                  </div>

                  {siteConfig.showAbout && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <button onClick={() => triggerAIGenerator('about')} disabled={isGenerating.about} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faMagic} /> {isGenerating.about ? 'Writing Bio...' : 'Generate Brand Bio with AI'}
                      </button>

                      {/* IMAGE UPLOAD & UNSPLASH AI SEARCH */}
                      <div>
                        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>About Section Image</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <input type="file" accept="image/*" id="about-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('aboutImage', e)} />
                          <label htmlFor="about-upload" style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>
                            <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} /> Upload
                          </label>
                          <button onClick={() => handleUnsplashSearch('aboutImage')} disabled={isSearchingImage} style={{ flex: 1.2, padding: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                            <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} /> {isSearchingImage ? 'Searching...' : 'Search Unsplash (AI)'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>Narrative Body Copy</label>
                        <textarea rows="5" value={siteConfig.aboutText || ''} onChange={(e) => handleTextChange('global', 'aboutText', e.target.value, 600)} style={{...inputStyle, resize: 'none'}} placeholder="Tell your brand story here..." />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: RESTORED NAVBAR & HEADER LINKS                    */}
          {/* ========================================================= */}
          {activeTab === 'navbar' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <FontAwesomeIcon icon={faBars} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Header Menu Links
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', marginTop: 0 }}>
                Rename labels to match your brand. Core system routes are securely locked.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {currentMenu.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '10px' }}>
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
                <input placeholder="Add custom link label..." value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} style={{...inputStyle, marginTop: 0}} />
                <button onClick={addMenuItem} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: RESTORED CATEGORY COLLECTIONS (MAX 6)               */}
          {/* ========================================================= */}
          {activeTab === 'categories' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <FontAwesomeIcon icon={faTags} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Product Collections
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', marginTop: 0 }}>
                Organize your storefront with circular images. Max 6 categories.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {currentCategories.map((cat, idx) => (
                  <div key={cat.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    
                    {/* Circular Thumbnail Preview */}
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: '#cbd5e1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '9px', color: '#fff', fontWeight: 'bold' }}>Img</span>
                      )}
                    </div>

                    <span style={{ fontSize: '14px', color: '#334155', fontWeight: 'bold', flex: 1, wordBreak: 'break-all' }}>{cat.label}</span>

                    <input 
                      type="file" 
                      accept="image/*" 
                      id={`cat-upload-${cat.id || idx}`} 
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result;
                            const updatedCats = currentCategories.map(c => c.id === cat.id ? { ...c, image: base64String } : c);
                            setSiteConfig({ ...siteConfig, categories: updatedCats });
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <label htmlFor={`cat-upload-${cat.id || idx}`} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>
                      Upload
                    </label>

                    <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '14px', marginLeft: '4px' }} onClick={() => removeCategory(cat.id)} />
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
                  <button onClick={addCategory} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', cursor: 'pointer', fontWeight: 'bold' }}>
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FOOTER & LEGAL REQUIREMENTS (PRIVACY POLICY ALERT) */}
          {/* ========================================================= */}
          {activeTab === 'footer' && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '16px', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <FontAwesomeIcon icon={faShareAlt} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Footer Links & Socials
              </h3>

              {/* MANDATORY LEGAL ALERT BOX */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontWeight: '800', fontSize: '13px', marginBottom: '6px' }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} /> Mandatory Store Legal Requirement
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#78350f', lineHeight: '1.5' }}>
                  Your website must include an active <strong>Privacy Policy</strong> and <strong>Terms of Service</strong> before going live to customers.
                </p>
                <button
                  onClick={() => alert("Redirecting to Store Settings -> Legal & Policies section...")}
                  style={{ background: '#92400e', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Configure Legal Policies in Settings →
                </button>
              </div>

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Store Support Email</label>
              <input
                type="email"
                value={siteConfig.footerEmail || ''}
                onChange={(e) => handleTextChange('global', 'footerEmail', e.target.value, 100)}
                placeholder="support@yourstore.com"
                style={{ ...inputStyle, marginTop: 0, marginBottom: '16px' }}
              />

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Instagram URL</label>
              <input
                type="text"
                value={siteConfig.socials?.instagram || ''}
                onChange={(e) => handleTextChange('socials', 'instagram', e.target.value, 150)}
                placeholder="https://instagram.com/yourstore"
                style={{ ...inputStyle, marginTop: 0, marginBottom: '16px' }}
              />

              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Facebook Page URL</label>
              <input
                type="text"
                value={siteConfig.socials?.facebook || ''}
                onChange={(e) => handleTextChange('socials', 'facebook', e.target.value, 150)}
                placeholder="https://facebook.com/yourstore"
                style={{ ...inputStyle, marginTop: 0 }}
              />
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: DELIVERY RULES & ANNOUNCEMENT BAR                 */}
          {/* ========================================================= */}
          {activeTab === 'delivery' && (
            <div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '16px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                  <FontAwesomeIcon icon={faTruck} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Cash on Delivery & Free Shipping
                </h3>
                
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Standard COD Delivery Fee (PKR)</label>
                <input
                  type="number"
                  value={siteConfig.codFee || 250}
                  onChange={(e) => handleTextChange('global', 'codFee', Number(e.target.value), 10)}
                  style={{ ...inputStyle, marginTop: 0, marginBottom: '16px' }}
                />

                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Free Delivery Threshold Amount (PKR)</label>
                <input
                  type="number"
                  value={siteConfig.freeShippingThreshold || 5000}
                  onChange={(e) => handleTextChange('global', 'freeShippingThreshold', Number(e.target.value), 10)}
                  style={{ ...inputStyle, marginTop: 0 }}
                />
              </div>

              {/* ANNOUNCEMENT TOP BAR TOGGLE */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Announcement Bar
                  </h3>
                  <div onClick={() => handleToggle('showAnnouncement')} style={{ cursor: 'pointer', color: siteConfig.showAnnouncement ? '#10b981' : '#cbd5e1' }}>
                    <FontAwesomeIcon icon={siteConfig.showAnnouncement ? faToggleOn : faToggleOff} size="lg" />
                  </div>
                </div>
                {siteConfig.showAnnouncement && (
                  <input type="text" placeholder="e.g. Free shipping on all orders over 5000 PKR!" value={siteConfig.announcementText || ''} onChange={(e) => handleTextChange('global', 'announcementText', e.target.value, 120)} style={{...inputStyle, marginTop: '16px'}} />
                )}
              </div>
            </div>
          )}

        </div>

        {/* === RIGHT COLUMN: STATIC UNBREAKABLE PREVIEW FRAME === */}
        <div style={{ 
          flex: 1, position: 'relative', background: '#0f172a', borderRadius: '16px', border: '1px solid #cbd5e1',
          display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: 'calc(100% - 474px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          {/* LIVE BROWSER TOP BAR */}
          <div style={{ flexShrink: 0, height: '45px', background: '#1e293b', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#eab308' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></div>
            
            <div style={{ margin: '0 auto', background: '#0f172a', padding: '4px 24px', borderRadius: '16px', fontSize: '12px', color: '#2dd4bf', fontWeight: 'bold', fontFamily: 'monospace' }}>
              {liveUrl}
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