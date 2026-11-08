import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, faToggleOn, faToggleOff, faTrash, faPlus,
  faBars, faPalette, faFont, faHeading, faMagic, faTags, faLock, faUpload,
  faSave, faExternalLinkAlt, faShareAlt, faImage, faUsers, faCheckCircle, 
  faBriefcase, faScaleBalanced, faTriangleExclamation, faTimesCircle, faLink,
  faDesktop, faEye, faLayerGroup, faBullhorn, faIdBadge, faShieldHalved, faSpinner
} from '@fortawesome/free-solid-svg-icons';

import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const WebsiteEditor = ({ branding = {}, siteConfig = {}, setSiteConfig, isService = true }) => {
  const [activeTab, setActiveTab] = useState('hero_about'); 
  const [activeSubSection, setActiveSubSection] = useState('hero');
  
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '' });
  const [newStrength, setNewStrength] = useState({ title: '', desc: '', icon: 'fa-check' });
  const [newCategoryName, setNewCategoryName] = useState('');

  const [isGenerating, setIsGenerating] = useState({ hero: false, about: false });
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // --- CUSTOM POPUP MODALS STATE ---
  const [alertModal, setAlertModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [unsplashModal, setUnsplashModal] = useState({ isOpen: false, targetField: '', keyword: '' });

  // Safe Fallback for menuItems
  const currentMenu = siteConfig.menuItems || [];

  const sanitizeInput = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  const handleSubdomainChange = (val) => setSiteConfig({ ...siteConfig, subdomain: val.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 30) });
  const handleToggle = (field) => setSiteConfig({ ...siteConfig, [field]: !siteConfig[field] });

  const handleTextChange = (section, field, value, maxChars = 250) => {
    if (value.length > maxChars) return;
    const cleanValue = sanitizeInput(value);
    if (section === 'global') setSiteConfig({ ...siteConfig, [field]: cleanValue });
    else setSiteConfig({ ...siteConfig, [section]: { ...siteConfig[section], [field]: cleanValue } });
  };

  const handleImageUpload = (field, e) => {
    const file = e.target.files[0];
    if (file) setSiteConfig({ ...siteConfig, [field]: URL.createObjectURL(file) });
  };

  // ==============================
  // SECURE UNSPLASH API LOGIC
  // ==============================
  const openUnsplashSearch = (targetField) => {
    setUnsplashModal({ isOpen: true, targetField, keyword: '' });
  };

  const executeUnsplashSearch = async () => {
    if (!unsplashModal.keyword.trim()) return;
    setIsSearchingImage(true);
    setUnsplashModal(prev => ({ ...prev, isOpen: false })); 

    try {
      const response = await fetch('/api/unsplash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: unsplashModal.keyword })
      });
      const data = await response.json();
      
      if (data.url) {
        setSiteConfig(prev => ({ ...prev, [unsplashModal.targetField]: data.url }));
        setAlertModal({ isOpen: true, type: 'success', title: 'Image Applied', message: 'Unsplash image successfully added to your storefront.' });
      } else {
        setAlertModal({ isOpen: true, type: 'error', title: 'No Results', message: 'Could not find a high-quality image for that keyword.' });
      }
    } catch (error) {
      setAlertModal({ isOpen: true, type: 'error', title: 'Connection Error', message: 'Failed to contact the image server.' });
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleSaveToFirebase = async () => {
    try {
      setIsSaving(true);
      const targetId = auth.currentUser ? auth.currentUser.email : 'ceo@ecosole.store';
      await setDoc(doc(db, "users", targetId), { siteConfig }, { merge: true });
      setAlertModal({ isOpen: true, type: 'success', title: 'System Saved', message: 'Website configuration successfully synchronized with the cloud.' });
    } catch (error) { 
      setAlertModal({ isOpen: true, type: 'error', title: 'Save Failed', message: error.message });
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleViewSite = () => {
    if (siteConfig.isPublished) {
      window.open('/store', '_blank');
    } else {
      setAlertModal({ isOpen: true, type: 'error', title: 'Store Offline', message: 'Your website is currently set to Draft mode. Switch "Site Status" to Live in the first card above or click Preview Draft.' });
    }
  };

  const updateMenuLabel = (id, newLabel) => {
    const updatedMenu = currentMenu.map(item => item.id === id ? { ...item, label: sanitizeInput(newLabel).substring(0, 20) } : item);
    setSiteConfig({ ...siteConfig, menuItems: updatedMenu });
  };

  // --- QUOTA CONTROLLED CATEGORY MANAGER ---
  const addCategory = () => {
    const currentCats = siteConfig.categories || [];
    if (currentCats.length >= 3) {
      setAlertModal({ isOpen: true, type: 'error', title: 'Free Tier Limit', message: 'You have reached the maximum of 3 product categories on the Cadet plan. Upgrade to Pilot to add unlimited collections.' });
      return;
    }
    if (!newCategoryName.trim()) return;
    setSiteConfig({ ...siteConfig, categories: [...currentCats, { id: `cat_${Date.now()}`, label: sanitizeInput(newCategoryName) }] });
    setNewCategoryName('');
  };

  const removeCategory = (index) => {
    setSiteConfig({ ...siteConfig, categories: (siteConfig.categories || []).filter((_, i) => i !== index) });
  };

  const addServiceCategory = () => {
    const title = document.getElementById('srv-title').value;
    const desc = document.getElementById('srv-desc').value;
    if (title && desc) {
      setSiteConfig({...siteConfig, services: [...(siteConfig.services || []), { title: sanitizeInput(title), desc: sanitizeInput(desc), icon: 'fa-check-circle' }]});
      document.getElementById('srv-title').value = ''; document.getElementById('srv-desc').value = '';
    }
  };
  const removeServiceCategory = (index) => setSiteConfig({...siteConfig, services: (siteConfig.services || []).filter((_, i) => i !== index)});
  
  const addTeamMember = () => {
    if (!newTeamMember.name.trim()) return;
    setSiteConfig({ ...siteConfig, teamMembers: [...(siteConfig.teamMembers || []), { name: sanitizeInput(newTeamMember.name), role: sanitizeInput(newTeamMember.role), bio: sanitizeInput(newTeamMember.bio) }] });
    setNewTeamMember({ name: '', role: '', bio: '' });
  };
  const removeTeamMember = (index) => setSiteConfig({ ...siteConfig, teamMembers: (siteConfig.teamMembers || []).filter((_, i) => i !== index) });

  const addStrength = () => {
    if (!newStrength.title.trim() || (siteConfig.whyChooseUs || []).length >= 6) return;
    setSiteConfig({ ...siteConfig, whyChooseUs: [...(siteConfig.whyChooseUs || []), { title: sanitizeInput(newStrength.title), desc: sanitizeInput(newStrength.desc), icon: newStrength.icon }] });
    setNewStrength({ title: '', desc: '', icon: 'fa-check' });
  };
  const removeStrength = (index) => setSiteConfig({ ...siteConfig, whyChooseUs: (siteConfig.whyChooseUs || []).filter((_, i) => i !== index) });

  // ==============================
  // REAL AI GENERATOR VIA VERCEL
  // ==============================
  const triggerAIGenerator = async (section) => {
    setIsGenerating({ ...isGenerating, [section]: true });
    try {
      let prompt = "";
      if (section === 'hero') {
        prompt = `You are a professional copywriter. Write a highly converting, modern Hero Section for a business named "${branding?.name || 'our company'}" (Industry: ${isService ? 'Service/Consulting' : 'E-commerce/Retail'}). Return ONLY a raw JSON object exactly like this, no markdown wrappers: {"heroTitle": "Short punchy headline", "heroSubtitle": "A persuasive, slightly longer subtext (1-2 sentences)"}`;
      } else if (section === 'about') {
        prompt = `You are a professional brand storyteller. Write a compelling 'About Us' biography (around 3-4 sentences) for a business named "${branding?.name || 'our company'}". Emphasize operational excellence, customer success, and high-quality deliverables. Return ONLY the raw text, no quotes or markdown.`;
      }

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (section === 'hero') {
        const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        setSiteConfig(prev => ({ 
          ...prev, 
          heroTitle: parsed.heroTitle || prev.heroTitle, 
          heroSubtitle: parsed.heroSubtitle || prev.heroSubtitle 
        }));
      } else if (section === 'about') {
        setSiteConfig(prev => ({ ...prev, aboutText: data.text.trim() }));
      }
    } catch (error) {
      setAlertModal({ isOpen: true, type: 'error', title: 'Generation Failed', message: error.message });
    } finally {
      setIsGenerating({ ...isGenerating, [section]: false });
    }
  };

  // --- REFINED BENTO SAAS STYLES ---
  const bentoCardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
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
    marginBottom: 0,
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const primaryBtnStyle = {
    padding: '11px 18px',
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  };

  const secondaryBtnStyle = {
    padding: '11px 18px',
    background: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  };

  const availableTabs = [
    { id: 'hero_about', label: 'Hero & Bio', icon: faPalette, color: '#2563eb' },
    { id: 'navbar', label: 'Navigation', icon: faBars, color: '#ea580c' },
    ...(isService ? [
      { id: 'services', label: 'Services', icon: faBriefcase, color: '#059669' },
      { id: 'team', label: 'Leadership', icon: faUsers, color: '#4f46e5' },
      { id: 'strengths', label: 'Strengths', icon: faCheckCircle, color: '#ea580c' }
    ] : [
      { id: 'categories', label: 'Collections', icon: faTags, color: '#059669' }
    ]),
    { id: 'footer', label: 'Social Links', icon: faShareAlt, color: '#4f46e5' }
  ];

  const activeColor = siteConfig.themeColor || branding?.color || '#2563eb';
  const displayBrandName = branding?.name && branding.name !== 'Loading...' ? branding.name : 'Your Website';

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- 1. TOP HEADER & ACTION BUTTONS --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#059669', display: 'block', marginBottom: '4px' }}>
            Online Presence
          </span>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            {isService ? 'Service Website Builder' : 'Online Storefront Builder'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => window.open('/store', '_blank')} style={secondaryBtnStyle}>
            <FontAwesomeIcon icon={faEye} style={{ color: '#2563eb' }} /> Preview Site
          </button>
          <button onClick={handleViewSite} style={secondaryBtnStyle}>
            <FontAwesomeIcon icon={faExternalLinkAlt} style={{ color: '#059669' }} /> Visit Live URL
          </button>
          <button onClick={handleSaveToFirebase} disabled={isSaving} style={primaryBtnStyle}>
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} style={{ color: '#f97316' }} />}
            {isSaving ? 'Saving Changes...' : 'Save Website'}
          </button>
        </div>
      </div>

      {/* --- 2. FOUR KEY WEBSITE STATUS CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CARD 1: PUBLISH STATUS */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Site Status</span>
            <div 
              onClick={() => handleToggle('isPublished')}
              style={{ cursor: 'pointer', color: siteConfig.isPublished ? '#059669' : '#94a3b8', fontSize: '22px' }}
              title="Toggle Publish Status"
            >
              <FontAwesomeIcon icon={siteConfig.isPublished ? faToggleOn : faToggleOff} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {siteConfig.isPublished ? 'Published & Live' : 'Draft Mode'}
          </div>
          <div style={{ fontSize: '12px', color: siteConfig.isPublished ? '#059669' : '#ea580c', fontWeight: '600' }}>
            {siteConfig.isPublished ? 'Visible to customers' : 'Click switch to publish'}
          </div>
        </div>

        {/* CARD 2: SUBDOMAIN */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Web Address</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faGlobe} />
            </div>
          </div>
          <div style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {siteConfig.subdomain || 'yourbrand'}.launchaxis.com
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Free SSL subdomain</div>
        </div>

        {/* CARD 3: TEMPLATE MODE */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Active Layout</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {isService ? 'Service Agency' : 'Retail Store'}
          </div>
          <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
            {currentMenu.length} navigation links active
          </div>
        </div>

        {/* CARD 4: THEME COLOR */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Button & Accent Color</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faPalette} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '5px', background: activeColor, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }}></span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>{activeColor.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>Applied to storefront</div>
        </div>

      </div>

      {/* --- 3. SEGMENTED PILL NAVIGATION BAR --- */}
      <div style={{ background: '#e2e8f0', padding: '5px', borderRadius: '14px', display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {availableTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 1 auto', padding: '10px 16px', border: 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0f172a' : '#475569',
                fontWeight: isActive ? '800' : '600',
                borderRadius: '10px', fontSize: '13px', cursor: 'pointer',
                boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}
            >
              <FontAwesomeIcon icon={tab.icon} style={{ color: isActive ? tab.color : '#64748b' }} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: HERO, BIO & LIVE PREVIEW                           */}
      {/* ========================================================= */}
      {activeTab === 'hero_about' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN: EDITOR CONTROLS */}
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* DOMAIN & ACCENT CARD */}
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faLink} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Subdomain & Theme Accent</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Customize your web address and primary button color</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faGlobe} style={{ color: '#2563eb' }} /> Storefront Subdomain</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0 14px', height: '45px', boxSizing: 'border-box' }}>
                    <input 
                      type="text" 
                      value={siteConfig.subdomain || ''} 
                      onChange={(e) => handleSubdomainChange(e.target.value)} 
                      placeholder="my-business" 
                      style={{ border: 'none', background: 'transparent', padding: 0, margin: 0, fontSize: '14px', outline: 'none', flex: 1, fontWeight: '800', color: '#0f172a' }} 
                    />
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>.launchaxis.com</span>
                  </div>
                </div>

                <div style={{ flex: '1 1 130px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faPalette} style={{ color: '#ea580c' }} /> Accent Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '0 12px', borderRadius: '10px', border: '1px solid #cbd5e1', height: '45px', boxSizing: 'border-box' }}>
                    <input 
                      type="color" 
                      value={siteConfig.themeColor || '#2563eb'} 
                      onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} 
                      style={{ border: 'none', background: 'none', cursor: 'pointer', width: '28px', height: '28px', padding: 0 }} 
                    />
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '13px', color: '#0f172a' }}>
                      {(siteConfig.themeColor || '#2563eb').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO vs BIOGRAPHY SWITCHER CARD */}
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', marginBottom: '22px' }}>
                <button 
                  onClick={() => setActiveSubSection('hero')} 
                  style={{ flex: 1, padding: '10px', background: activeSubSection === 'hero' ? '#ffffff' : 'transparent', color: activeSubSection === 'hero' ? '#0f172a' : '#64748b', fontWeight: '800', borderRadius: '8px', border: 'none', boxShadow: activeSubSection === 'hero' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  <FontAwesomeIcon icon={faHeading} style={{ marginRight: '8px', color: '#2563eb' }} /> Top Banner (Hero)
                </button>
                <button 
                  onClick={() => setActiveSubSection('about')} 
                  style={{ flex: 1, padding: '10px', background: activeSubSection === 'about' ? '#ffffff' : 'transparent', color: activeSubSection === 'about' ? '#0f172a' : '#64748b', fontWeight: '800', borderRadius: '8px', border: 'none', boxShadow: activeSubSection === 'about' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', fontSize: '13px' }}
                >
                  <FontAwesomeIcon icon={faFont} style={{ marginRight: '8px', color: '#ea580c' }} /> About Us Story
                </button>
              </div>

              {/* SUB-TAB A: HERO EDITOR */}
              {activeSubSection === 'hero' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Main Welcome Banner</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>The first headline visitors see when opening your site</p>
                    </div>
                    <div onClick={() => handleToggle('showHero')} style={{ cursor: 'pointer', color: siteConfig.showHero !== false ? '#059669' : '#cbd5e1', fontSize: '24px' }}>
                      <FontAwesomeIcon icon={siteConfig.showHero !== false ? faToggleOn : faToggleOff} />
                    </div>
                  </div>

                  {siteConfig.showHero !== false && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <button onClick={() => triggerAIGenerator('hero')} disabled={isGenerating.hero} style={{ ...secondaryBtnStyle, width: '100%', padding: '12px', background: '#f8fafc' }}>
                        {isGenerating.hero ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faMagic} style={{ color: '#4f46e5' }} />}
                        {isGenerating.hero ? 'Writing Headline & Subtext...' : 'Write Headline with AI'}
                      </button>

                      <div>
                        <label style={labelStyle}><FontAwesomeIcon icon={faImage} style={{ color: '#059669' }} /> Banner Background Image</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <input type="file" accept="image/*" id="hero-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('heroImage', e)} />
                          <label htmlFor="hero-upload" style={{ ...secondaryBtnStyle, flex: 1, cursor: 'pointer', margin: 0 }}>
                            <FontAwesomeIcon icon={faUpload} style={{ color: '#2563eb' }} /> Upload Photo
                          </label>
                          <button onClick={() => openUnsplashSearch('heroImage')} disabled={isSearchingImage} style={{ ...secondaryBtnStyle, flex: 1 }}>
                            <FontAwesomeIcon icon={faImage} style={{ color: '#ea580c' }} /> Search Stock Photos
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}><FontAwesomeIcon icon={faHeading} style={{ color: '#2563eb' }} /> Main Headline</label>
                        <input value={siteConfig.heroTitle || ''} onChange={(e) => handleTextChange('global', 'heroTitle', e.target.value, 100)} placeholder="e.g. Modern solutions built for your lifestyle" style={saasInputStyle} />
                      </div>

                      <div>
                        <label style={labelStyle}><FontAwesomeIcon icon={faBullhorn} style={{ color: '#ea580c' }} /> Supporting Subtext</label>
                        <textarea rows="3" value={siteConfig.heroSubtitle || ''} onChange={(e) => handleTextChange('global', 'heroSubtitle', e.target.value, 300)} placeholder="Explain what makes your products or services special in 1-2 sentences..." style={{ ...saasInputStyle, resize: 'vertical' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB B: ABOUT US EDITOR */}
              {activeSubSection === 'about' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>Company Biography</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Share your story and build trust with visitors</p>
                    </div>
                    <div onClick={() => handleToggle('showAbout')} style={{ cursor: 'pointer', color: siteConfig.showAbout !== false ? '#059669' : '#cbd5e1', fontSize: '24px' }}>
                      <FontAwesomeIcon icon={siteConfig.showAbout !== false ? faToggleOn : faToggleOff} />
                    </div>
                  </div>

                  {siteConfig.showAbout !== false && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      <button onClick={() => triggerAIGenerator('about')} disabled={isGenerating.about} style={{ ...secondaryBtnStyle, width: '100%', padding: '12px', background: '#f8fafc' }}>
                        {isGenerating.about ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faMagic} style={{ color: '#4f46e5' }} />}
                        {isGenerating.about ? 'Drafting Biography...' : 'Write Biography with AI'}
                      </button>

                      <div>
                        <label style={labelStyle}><FontAwesomeIcon icon={faImage} style={{ color: '#059669' }} /> About Section Photo</label>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <input type="file" accept="image/*" id="about-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('aboutImage', e)} />
                          <label htmlFor="about-upload" style={{ ...secondaryBtnStyle, flex: 1, cursor: 'pointer', margin: 0 }}>
                            <FontAwesomeIcon icon={faUpload} style={{ color: '#2563eb' }} /> Upload Photo
                          </label>
                          <button onClick={() => openUnsplashSearch('aboutImage')} disabled={isSearchingImage} style={{ ...secondaryBtnStyle, flex: 1 }}>
                            <FontAwesomeIcon icon={faImage} style={{ color: '#ea580c' }} /> Search Stock Photos
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={labelStyle}><FontAwesomeIcon icon={faFont} style={{ color: '#4f46e5' }} /> Story & Mission Text</label>
                        <textarea rows="5" value={siteConfig.aboutText || ''} onChange={(e) => handleTextChange('global', 'aboutText', e.target.value, 600)} placeholder="Tell customers how your business started and what you stand for..." style={{ ...saasInputStyle, resize: 'vertical', lineHeight: '1.6' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE MINI STOREFRONT PREVIEW */}
          <div style={{ flex: '1.1 1 380px', position: 'sticky', top: '20px' }}>
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faDesktop} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Live Storefront Preview</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Instant visual preview of your homepage</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '20px' }}>
                  Interactive
                </span>
              </div>

              {/* BROWSER WINDOW FRAME */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.08)' }}>
                
                {/* Browser Top Bar */}
                <div style={{ background: '#f1f5f9', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ef4444' }}></div>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }}></div>
                  <div style={{ marginLeft: '10px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '3px 12px', fontSize: '11px', color: '#475569', fontWeight: '600', fontFamily: 'monospace', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    https://{siteConfig.subdomain || 'yourbrand'}.launchaxis.com
                  </div>
                </div>

                {/* Mock Navbar */}
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {branding?.logo && <img src={branding.logo} alt="Logo" style={{ height: '22px', borderRadius: '4px' }} />}
                    <span style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a' }}>{displayBrandName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {currentMenu.slice(0, 3).map((m, i) => (
                      <span key={i} style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{m.label}</span>
                    ))}
                  </div>
                </div>

                {/* Mock Hero Banner */}
                {siteConfig.showHero !== false && (
                  <div style={{ 
                    padding: '44px 24px', 
                    textAlign: 'center', 
                    background: siteConfig.heroImage ? `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${siteConfig.heroImage}) center/cover` : '#0f172a',
                    color: '#ffffff'
                  }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '900', lineHeight: '1.25', color: '#ffffff' }}>
                      {siteConfig.heroTitle || `Welcome to ${displayBrandName}`}
                    </h4>
                    <p style={{ margin: '0 auto 20px auto', fontSize: '13px', color: '#cbd5e1', maxWidth: '380px', lineHeight: '1.5' }}>
                      {siteConfig.heroSubtitle || branding?.slogan || 'Your custom hero subtext will appear here.'}
                    </p>
                    <span style={{ background: activeColor, color: '#ffffff', padding: '9px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', display: 'inline-block' }}>
                      {isService ? 'Book a Consultation' : 'Shop Collection'}
                    </span>
                  </div>
                )}

                {/* Mock About Us Section */}
                {siteConfig.showAbout !== false && (
                  <div style={{ padding: '24px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {siteConfig.aboutImage && (
                      <img src={siteConfig.aboutImage} alt="About" style={{ width: '90px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: activeColor, marginBottom: '4px' }}>About Our Brand</div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                        {siteConfig.aboutText || 'Your company story and mission statement will be displayed in this section.'}
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: NAVIGATION BAR LINKS                               */}
      {/* ========================================================= */}
      {activeTab === 'navbar' && (
        <div style={{ ...bentoCardStyle, maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faBars} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Header Navigation Menu</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Click any menu title below to rename how it appears on your website</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentMenu.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', gap: '12px' }}>
                <input 
                  value={item.label} 
                  onChange={(e) => updateMenuLabel(item.id, e.target.value)} 
                  style={{ border: 'none', background: 'transparent', fontSize: '15px', color: '#0f172a', fontWeight: '700', outline: 'none', flex: 1, padding: 0, margin: 0 }} 
                />
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', background: '#ffffff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.link} <FontAwesomeIcon icon={faLock} style={{ color: '#94a3b8' }} title="Core Section Link" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3 (ECOMMERCE): COLLECTIONS / CATEGORIES               */}
      {/* ========================================================= */}
      {!isService && activeTab === 'categories' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faPlus} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Add Product Collection</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Group your products for easy browsing</p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>
                {(siteConfig.categories || []).length} / 3 Used
              </span>
            </div>

            <label style={labelStyle}><FontAwesomeIcon icon={faTags} style={{ color: '#059669' }} /> Collection Name</label>
            <input 
              placeholder="e.g. Summer Arrivals or Luxury Scents" 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              style={{ ...saasInputStyle, marginBottom: '18px' }} 
            />
            <button onClick={addCategory} style={{ ...primaryBtnStyle, width: '100%', padding: '14px' }}>
              <FontAwesomeIcon icon={faPlus} style={{ color: '#10b981' }} /> Create Collection
            </button>
          </div>

          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Active Collections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(siteConfig.categories || []).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No collections created yet.</p>
              ) : (siteConfig.categories || []).map((cat, idx) => (
                <div key={cat.id} style={{ padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#0f172a', fontSize: '14px' }}>{cat.label}</strong>
                  <button onClick={() => removeCategory(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4 (SERVICE): SERVICE OFFERINGS                        */}
      {/* ========================================================= */}
      {isService && activeTab === 'services' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Add Service Offering</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>List the core services your clients can book</p>
              </div>
            </div>

            <label style={labelStyle}><FontAwesomeIcon icon={faBriefcase} style={{ color: '#059669' }} /> Service Title</label>
            <input placeholder="e.g. Web Application Development" id="srv-title" style={{ ...saasInputStyle, marginBottom: '16px' }} />
            
            <label style={labelStyle}><FontAwesomeIcon icon={faFont} style={{ color: '#2563eb' }} /> Short Description</label>
            <textarea placeholder="Describe what is included in this service..." rows="3" id="srv-desc" style={{ ...saasInputStyle, marginBottom: '18px', resize: 'vertical' }} />
            
            <button onClick={addServiceCategory} style={{ ...primaryBtnStyle, width: '100%', padding: '14px' }}>
              <FontAwesomeIcon icon={faPlus} style={{ color: '#10b981' }} /> Add Service to Website
            </button>
          </div>

          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Listed Services ({(siteConfig.services || []).length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(siteConfig.services || []).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No services added yet. Use the form on the left to add your first service.</p>
              ) : (siteConfig.services || []).map((srv, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>{srv.title}</strong>
                    <span style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>{srv.desc}</span>
                  </div>
                  <button onClick={() => removeServiceCategory(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', flexShrink: 0 }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5 (SERVICE): LEADERSHIP TEAM                          */}
      {/* ========================================================= */}
      {isService && activeTab === 'team' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Leadership & Team</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Show the experts behind your agency</p>
                </div>
              </div>
              <div onClick={() => handleToggle('showTeam')} style={{ cursor: 'pointer', color: siteConfig.showTeam ? '#059669' : '#cbd5e1', fontSize: '24px' }}>
                <FontAwesomeIcon icon={siteConfig.showTeam ? faToggleOn : faToggleOff} />
              </div>
            </div>

            {siteConfig.showTeam ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}><FontAwesomeIcon icon={faIdBadge} style={{ color: '#4f46e5' }} /> Full Name</label>
                  <input placeholder="e.g. Mahnoor Naveed" value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} style={saasInputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><FontAwesomeIcon icon={faBriefcase} style={{ color: '#ea580c' }} /> Role / Title</label>
                  <input placeholder="e.g. Founder & Lead Architect" value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} style={saasInputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><FontAwesomeIcon icon={faFont} style={{ color: '#2563eb' }} /> Short Bio</label>
                  <textarea placeholder="Brief background or expertise..." rows="3" value={newTeamMember.bio} onChange={e => setNewTeamMember({...newTeamMember, bio: e.target.value})} style={{ ...saasInputStyle, resize: 'vertical' }} />
                </div>
                <button onClick={addTeamMember} style={{ ...primaryBtnStyle, width: '100%', padding: '14px' }}>
                  <FontAwesomeIcon icon={faPlus} style={{ color: '#10b981' }} /> Add Team Member
                </button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Enable the toggle switch above to display the Leadership Team section on your website.</p>
            )}
          </div>

          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Team Directory ({(siteConfig.teamMembers || []).length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(siteConfig.teamMembers || []).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No team members added yet.</p>
              ) : (siteConfig.teamMembers || []).map((member, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a', marginBottom: '2px' }}>{member.name}</strong>
                    <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '700' }}>{member.role}</span>
                  </div>
                  <button onClick={() => removeTeamMember(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6 (SERVICE): WHY CHOOSE US / STRENGTHS                */}
      {/* ========================================================= */}
      {isService && activeTab === 'strengths' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Why Choose Us</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Highlight up to 6 key company strengths</p>
                </div>
              </div>
              <div onClick={() => handleToggle('showStrengths')} style={{ cursor: 'pointer', color: siteConfig.showStrengths ? '#059669' : '#cbd5e1', fontSize: '24px' }}>
                <FontAwesomeIcon icon={siteConfig.showStrengths ? faToggleOn : faToggleOff} />
              </div>
            </div>

            {siteConfig.showStrengths ? (
              (siteConfig.whyChooseUs || []).length < 6 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669' }} /> Highlight Title</label>
                    <input placeholder="e.g. Fast 48-Hour Delivery" value={newStrength.title} onChange={e => setNewStrength({...newStrength, title: e.target.value})} style={saasInputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}><FontAwesomeIcon icon={faPalette} style={{ color: '#2563eb' }} /> Icon Name</label>
                    <input placeholder="e.g. fa-bolt or fa-shield-alt" value={newStrength.icon} onChange={e => setNewStrength({...newStrength, icon: e.target.value})} style={saasInputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}><FontAwesomeIcon icon={faFont} style={{ color: '#ea580c' }} /> Short Explanation</label>
                    <textarea placeholder="Explain how this benefits the client..." rows="2" value={newStrength.desc} onChange={e => setNewStrength({...newStrength, desc: e.target.value})} style={{ ...saasInputStyle, resize: 'vertical' }} />
                  </div>
                  <button onClick={addStrength} style={{ ...primaryBtnStyle, width: '100%', padding: '14px' }}>
                    <FontAwesomeIcon icon={faPlus} style={{ color: '#f97316' }} /> Add Strength
                  </button>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#059669', fontWeight: '700' }}>Maximum of 6 core strengths added.</p>
              )
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Enable the toggle switch above to display the Why Choose Us section on your website.</p>
            )}
          </div>

          <div style={{ ...bentoCardStyle, flex: '1 1 340px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Active Highlights ({(siteConfig.whyChooseUs || []).length}/6)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(siteConfig.whyChooseUs || []).length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>No highlights added yet.</p>
              ) : (siteConfig.whyChooseUs || []).map((strength, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'block' }}>{strength.title}</span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{strength.desc}</span>
                  </div>
                  <button onClick={() => removeStrength(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: FOOTER & SOCIAL LINKS                              */}
      {/* ========================================================= */}
      {activeTab === 'footer' && (
        <div style={{ ...bentoCardStyle, maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faShareAlt} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Social Media Profiles</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Connect your social pages to your website footer</p>
            </div>
          </div>

          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '14px 16px', borderRadius: '12px', marginBottom: '22px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#ea580c', fontSize: '18px' }} />
            <div style={{ fontSize: '12px', color: '#9a3412', lineHeight: '1.5' }}>
              <strong>Legal Pages Note:</strong> Privacy Policy and Terms of Service are managed centrally in your <strong>Settings</strong> tab.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}><FontAwesomeIcon icon={faLink} style={{ color: '#ea580c' }} /> Instagram Profile URL</label>
              <input type="text" value={siteConfig.socials?.instagram || ''} onChange={(e) => handleTextChange('socials', 'instagram', e.target.value, 150)} placeholder="https://instagram.com/yourbrand" style={saasInputStyle} />
            </div>
            <div>
              <label style={labelStyle}><FontAwesomeIcon icon={faLink} style={{ color: '#2563eb' }} /> Facebook Page URL</label>
              <input type="text" value={siteConfig.socials?.facebook || ''} onChange={(e) => handleTextChange('socials', 'facebook', e.target.value, 150)} placeholder="https://facebook.com/yourbrand" style={saasInputStyle} />
            </div>
            <div>
              <label style={labelStyle}><FontAwesomeIcon icon={faLink} style={{ color: '#4f46e5' }} /> LinkedIn Company URL</label>
              <input type="text" value={siteConfig.socials?.linkedin || ''} onChange={(e) => handleTextChange('socials', 'linkedin', e.target.value, 150)} placeholder="https://linkedin.com/company/yourbrand" style={saasInputStyle} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. STANDARD ALERT MODAL                                   */}
      {/* ========================================================= */}
      {alertModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {alertModal.type === 'error' ? <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ea580c' }} /> : <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669' }} />}
                {alertModal.title}
              </h3>
              <button onClick={() => setAlertModal({ ...alertModal, isOpen: false })} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px', textAlign: 'left' }}>{alertModal.message}</p>
            <button onClick={() => setAlertModal({ ...alertModal, isOpen: false })} style={{ ...primaryBtnStyle, width: '100%', padding: '14px' }}>
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. UNSPLASH SEARCH MODAL                                  */}
      {/* ========================================================= */}
      {unsplashModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '420px', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faImage} style={{ color: '#2563eb' }} /> Search Stock Photos
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px', lineHeight: '1.5' }}>
              Enter a keyword to automatically find and apply a high-resolution image from Unsplash.
            </p>
            
            <input 
              autoFocus
              placeholder="e.g. modern office, skincare, luxury watch..." 
              value={unsplashModal.keyword} 
              onChange={(e) => setUnsplashModal({ ...unsplashModal, keyword: e.target.value })} 
              style={{ ...saasInputStyle, marginBottom: '20px', background: '#ffffff' }} 
              onKeyDown={(e) => e.key === 'Enter' && executeUnsplashSearch()}
            />
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setUnsplashModal({ ...unsplashModal, isOpen: false })} style={{ ...secondaryBtnStyle, flex: 1 }}>
                Cancel
              </button>
              <button onClick={executeUnsplashSearch} disabled={isSearchingImage} style={{ ...primaryBtnStyle, flex: 1 }}>
                {isSearchingImage ? 'Searching...' : 'Apply Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default WebsiteEditor;