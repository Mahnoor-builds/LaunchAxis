import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGlobe, faToggleOn, faToggleOff, faTrash, faPlus,
  faEnvelope, faBars, faPalette, faFont, faHeading, faMagic, faTags, faLock, faUpload,
  faSave, faLink, faExternalLinkAlt, faShareAlt, faTruck, faImage, faUsers, faCheckCircle, faBriefcase, faScaleBalanced
} from '@fortawesome/free-solid-svg-icons';

import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const WebsiteEditor = ({ branding, siteConfig, setSiteConfig }) => {
  const isService = true; // Temporary testing flag

  const [activeTab, setActiveTab] = useState('hero_about'); 
  const [activeSubSection, setActiveSubSection] = useState('hero');
  
  const [newCategory, setNewCategory] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '' });
  const [newStrength, setNewStrength] = useState({ title: '', desc: '', icon: 'fa-check' });

  const [isGenerating, setIsGenerating] = useState({ hero: false, about: false });
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // --- CORE LINKS LOGIC ---
  let baseMenu = siteConfig.menuItems || [];
  baseMenu = baseMenu.map(item => {
    if (['#home', '#catalog', '#about', '#services', '#contact'].includes(item.link)) return { ...item, isCore: true };
    return item;
  });

  const hasHome = baseMenu.some(i => i.link === '#home');
  const hasCatalog = baseMenu.some(i => i.link === '#catalog');
  const hasServices = baseMenu.some(i => i.link === '#services');
  const hasAbout = baseMenu.some(i => i.link === '#about');
  const hasContact = baseMenu.some(i => i.link === '#contact');
  
  if (!hasHome) baseMenu.unshift({ id: 'core-home', label: 'Home', link: '#home', isCore: true });
  
  if (isService) {
    if (!hasServices) baseMenu.splice(1, 0, { id: 'core-services', label: 'Services', link: '#services', isCore: true });
    if (!hasContact) baseMenu.push({ id: 'core-contact', label: 'Contact', link: '#contact', isCore: true });
    baseMenu = baseMenu.filter(item => item.link !== '#catalog');
  } else {
    if (!hasCatalog) baseMenu.splice(1, 0, { id: 'core-catalog', label: 'Catalog', link: '#catalog', isCore: true });
    baseMenu = baseMenu.filter(item => item.link !== '#services' && item.link !== '#contact');
  }
  
  if (!hasAbout) baseMenu.push({ id: 'core-about', label: 'About', link: '#about', isCore: true });
  const currentMenu = baseMenu;

  useEffect(() => { setSiteConfig(prev => ({ ...prev, menuItems: currentMenu })); }, []);

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

  const handleUnsplashSearch = async (targetField) => {
    const keyword = prompt("Enter a keyword to search Unsplash for an image:");
    if (!keyword) return;
    setIsSearchingImage(true);
    try {
      const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
      if (!accessKey) { alert("Missing REACT_APP_UNSPLASH_ACCESS_KEY."); setIsSearchingImage(false); return; }
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`, { headers: { 'Authorization': `Client-ID ${accessKey}` } });
      const data = await response.json();
      if (data.results && data.results.length > 0) setSiteConfig(prev => ({ ...prev, [targetField]: data.results[0].urls.regular }));
      else alert("No images found.");
    } catch (error) { alert("Could not fetch image."); } finally { setIsSearchingImage(false); }
  };

  const handleSaveToFirebase = async () => {
    try {
      setIsSaving(true);
      const targetId = auth.currentUser ? auth.currentUser.uid : 'ceo@ecosole.store';
      await setDoc(doc(db, "users", targetId), { siteConfig }, { merge: true });
      alert("✨ Website configuration successfully saved!");
    } catch (error) { alert("Failed to save: " + error.message); } finally { setIsSaving(false); }
  };

  const updateMenuLabel = (id, newLabel) => {
    const updatedMenu = currentMenu.map(item => item.id === id ? { ...item, label: sanitizeInput(newLabel).substring(0, 20) } : item);
    setSiteConfig({ ...siteConfig, menuItems: updatedMenu });
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

  const triggerAIGenerator = async (section) => {
    setIsGenerating({ ...isGenerating, [section]: true });
    setTimeout(() => {
      if (section === 'hero') {
        setSiteConfig(prev => ({ ...prev, heroTitle: isService ? `Premium ${branding?.name || 'Solutions'} & Strategic Consulting` : `Next-Gen ${branding?.name || 'Products'} Engineered for Tomorrow`, heroSubtitle: isService ? "Delivering reliable expertise, seamless project execution, and personalized client solutions." : "Experience premium structural efficiency and elegant styling combinations tailored to your routine." }));
      } else if (section === 'about') {
        setSiteConfig(prev => ({ ...prev, aboutText: `Our mission at ${branding?.name || 'LaunchAxis'} is rooted in radical operational excellence. We deliver high-performance solutions optimized for sustainability and client success.` }));
      }
      setIsGenerating({ ...isGenerating, [section]: false });
    }, 1200);
  };

  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' };
  const inputStyle = { width: '100%', padding: '14px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#1e293b', fontSize: '14px', outline: 'none', marginTop: '8px', boxSizing: 'border-box', transition: 'border 0.2s' };
  const premiumBtnStyle = { padding: '12px 20px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' };
  
  const availableTabs = [
    { id: 'hero_about', label: 'Hero & Bio', icon: faPalette },
    { id: 'navbar', label: 'Navbar', icon: faBars },
    ...(isService ? [
      { id: 'services', label: 'Service Types', icon: faBriefcase },
      { id: 'team', label: 'Leadership', icon: faUsers },
      { id: 'strengths', label: 'Why Choose Us', icon: faCheckCircle }
    ] : [
      { id: 'categories', label: 'Collections', icon: faTags }
    ]),
    { id: 'footer', label: 'Footer Links', icon: faShareAlt }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box', paddingBottom: '60px' }}>
      
      {/* TOP ACTION BAR */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 0 20px 0', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> {isService ? 'Service Portfolio' : 'Storefront'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Configure themes, navigation, and styling.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '350px' }}>
          <button onClick={() => siteConfig.isPublished ? window.open(`https://${siteConfig.subdomain || 'yourstore'}.launchaxis.com`, '_blank') : alert('Website is offline.')}
            style={{ ...premiumBtnStyle, flex: '1 1 auto', justifyContent: 'center', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <FontAwesomeIcon icon={faExternalLinkAlt} /> View Site
          </button>
          <button onClick={handleSaveToFirebase} disabled={isSaving}
            style={{ ...premiumBtnStyle, flex: '1 1 auto', justifyContent: 'center', background: '#0f172a', color: '#fff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)' }}>
            <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', flex: 1 }}>
        
        {/* SLEEK SEGMENTED TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', padding: '6px', borderRadius: '12px', flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
          {availableTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 1 auto', padding: '10px 12px', border: 'none',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '600',
                borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', whiteSpace: 'nowrap'
              }}>
              <FontAwesomeIcon icon={tab.icon} style={{ opacity: activeTab === tab.id ? 1 : 0.6 }} /> {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'hero_about' && (
          <div style={{ animation: 'fadeIn 0.2s' }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <FontAwesomeIcon icon={faLink} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Domain & Colors
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <input type="text" value={siteConfig.subdomain || ''} onChange={(e) => handleSubdomainChange(e.target.value)} placeholder="my-agency" style={{ border: 'none', background: 'transparent', padding: '16px 0', fontSize: '16px', outline: 'none', flex: '1 1 150px', fontWeight: 'bold', color: '#0f172a' }} />
                <span style={{ fontSize: '15px', color: '#94a3b8', fontWeight: 'bold', padding: '16px 0' }}>.launchaxis.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Accent Color:</label>
                <input type="color" value={siteConfig.themeColor || '#D62828'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{ border: 'none', background: 'none', cursor: 'pointer', width: '36px', height: '36px', padding: 0, borderRadius: '50%' }} />
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>{(siteConfig.themeColor || '#D62828').toUpperCase()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '4px' }}>
              <button onClick={() => setActiveSubSection('hero')} style={{ flex: '1 1 120px', padding: '12px', background: activeSubSection === 'hero' ? '#fff' : 'transparent', color: activeSubSection === 'hero' ? '#0f172a' : '#64748b', fontWeight: '700', borderRadius: '8px', border: 'none', boxShadow: activeSubSection === 'hero' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                <FontAwesomeIcon icon={faHeading} style={{ marginRight: '8px' }} /> Landing Hero
              </button>
              <button onClick={() => setActiveSubSection('about')} style={{ flex: '1 1 120px', padding: '12px', background: activeSubSection === 'about' ? '#fff' : 'transparent', color: activeSubSection === 'about' ? '#0f172a' : '#64748b', fontWeight: '700', borderRadius: '8px', border: 'none', boxShadow: activeSubSection === 'about' ? '0 2px 4px rgba(0,0,0,0.04)' : 'none', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                <FontAwesomeIcon icon={faFont} style={{ marginRight: '8px' }} /> Biography
              </button>
            </div>

            {activeSubSection === 'hero' && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Hero Configuration</h3>
                  <div onClick={() => handleToggle('showHero')} style={{ cursor: 'pointer', color: siteConfig.showHero !== false ? '#10b981' : '#cbd5e1' }}>
                    <FontAwesomeIcon icon={siteConfig.showHero !== false ? faToggleOn : faToggleOff} size="2x" />
                  </div>
                </div>

                {siteConfig.showHero !== false && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <button onClick={() => triggerAIGenerator('hero')} disabled={isGenerating.hero} style={{ ...premiumBtnStyle, background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', justifyContent: 'center', padding: '14px' }}>
                      <FontAwesomeIcon icon={faMagic} style={{ color: '#2dd4bf' }} /> {isGenerating.hero ? 'Writing...' : 'Auto-Generate Copy'}
                    </button>
                    <div>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Cover Image</label>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input type="file" accept="image/*" id="hero-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('heroImage', e)} />
                        <label htmlFor="hero-upload" style={{ ...premiumBtnStyle, flex: '1 1 140px', justifyContent: 'center', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer' }}><FontAwesomeIcon icon={faUpload} /> Upload File</label>
                        <button onClick={() => handleUnsplashSearch('heroImage')} disabled={isSearchingImage} style={{ ...premiumBtnStyle, flex: '1 1 140px', justifyContent: 'center', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}><FontAwesomeIcon icon={faImage} style={{ color: '#3b82f6' }} /> Unsplash</button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Primary Headline</label>
                      <input value={siteConfig.heroTitle || ''} onChange={(e) => handleTextChange('global', 'heroTitle', e.target.value, 100)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Supporting Subtext</label>
                      <textarea rows="3" value={siteConfig.heroSubtitle || ''} onChange={(e) => handleTextChange('global', 'heroSubtitle', e.target.value, 300)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSubSection === 'about' && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>About Section</h3>
                  <div onClick={() => handleToggle('showAbout')} style={{ cursor: 'pointer', color: siteConfig.showAbout !== false ? '#10b981' : '#cbd5e1' }}>
                    <FontAwesomeIcon icon={siteConfig.showAbout !== false ? faToggleOn : faToggleOff} size="2x" />
                  </div>
                </div>

                {siteConfig.showAbout !== false && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <button onClick={() => triggerAIGenerator('about')} disabled={isGenerating.about} style={{ ...premiumBtnStyle, background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', justifyContent: 'center', padding: '14px' }}>
                      <FontAwesomeIcon icon={faMagic} style={{ color: '#2dd4bf' }} /> {isGenerating.about ? 'Writing...' : 'Auto-Generate Bio'}
                    </button>
                    <div>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Biography Image</label>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <input type="file" accept="image/*" id="about-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('aboutImage', e)} />
                        <label htmlFor="about-upload" style={{ ...premiumBtnStyle, flex: '1 1 140px', justifyContent: 'center', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', cursor: 'pointer' }}><FontAwesomeIcon icon={faUpload} /> Upload File</label>
                        <button onClick={() => handleUnsplashSearch('aboutImage')} disabled={isSearchingImage} style={{ ...premiumBtnStyle, flex: '1 1 140px', justifyContent: 'center', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0' }}><FontAwesomeIcon icon={faImage} style={{ color: '#3b82f6' }} /> Unsplash</button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>Narrative Copy</label>
                      <textarea rows="5" value={siteConfig.aboutText || ''} onChange={(e) => handleTextChange('global', 'aboutText', e.target.value, 600)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: NAVBAR LINKS */}
        {activeTab === 'navbar' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faBars} style={{ color: 'var(--brand-color)' }} /> Menu Links
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              {currentMenu.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <input value={item.label} onChange={(e) => updateMenuLabel(item.id, e.target.value)} style={{ border: 'none', background: 'transparent', fontSize: '15px', color: '#0f172a', fontWeight: '700', outline: 'none', flex: 1 }} />
                  <FontAwesomeIcon icon={faLock} style={{ color: '#cbd5e1', fontSize: '14px' }} title="System Core Link" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 (SERVICE): SERVICE CATEGORIES */}
        {isService && activeTab === 'services' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', color: '#0f172a' }}>Service Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px', marginTop: '24px' }}>
              {(siteConfig.services || []).map((srv, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>{srv.title}</strong>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{srv.desc}</span>
                  </div>
                  <button onClick={() => removeServiceCategory(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><FontAwesomeIcon icon={faTrash} /></button>
                </div>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a' }}>Create New Service</h4>
              <input placeholder="Service Title (e.g., Visa Consulting)" id="srv-title" style={{...inputStyle, marginTop: 0, marginBottom: '12px'}} />
              <textarea placeholder="Short Description" rows="2" id="srv-desc" style={{...inputStyle, marginTop: 0, marginBottom: '16px', resize: 'none'}} />
              <button onClick={addServiceCategory} style={{ ...premiumBtnStyle, background: '#0f172a', color: '#fff', width: '100%', justifyContent: 'center' }}><FontAwesomeIcon icon={faPlus} /> Add Service</button>
            </div>
          </div>
        )}

        {/* TAB 4 (SERVICE): LEADERSHIP TEAM */}
        {isService && activeTab === 'team' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Leadership Team</h3>
              <div onClick={() => handleToggle('showTeam')} style={{ cursor: 'pointer', color: siteConfig.showTeam ? '#10b981' : '#cbd5e1' }}><FontAwesomeIcon icon={siteConfig.showTeam ? faToggleOn : faToggleOff} size="2x" /></div>
            </div>
            {siteConfig.showTeam && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {(siteConfig.teamMembers || []).map((member, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a', marginBottom: '4px' }}>{member.name}</strong>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{member.role}</span>
                      </div>
                      <button onClick={() => removeTeamMember(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: '14px', color: '#0f172a' }}>Add Team Member</h4>
                  <input placeholder="Member Name" value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} style={{...inputStyle, marginTop: 0, marginBottom: '12px'}} />
                  <input placeholder="Role / Title" value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} style={{...inputStyle, marginTop: 0, marginBottom: '12px'}} />
                  <textarea placeholder="Short Bio" rows="3" value={newTeamMember.bio} onChange={e => setNewTeamMember({...newTeamMember, bio: e.target.value})} style={{...inputStyle, marginTop: 0, marginBottom: '16px', resize: 'none'}} />
                  <button onClick={addTeamMember} style={{ ...premiumBtnStyle, background: '#0f172a', color: '#fff', width: '100%', justifyContent: 'center' }}>Add Member</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 5 (SERVICE): WHY CHOOSE US */}
        {isService && activeTab === 'strengths' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Core Strengths</h3>
              <div onClick={() => handleToggle('showStrengths')} style={{ cursor: 'pointer', color: siteConfig.showStrengths ? '#10b981' : '#cbd5e1' }}><FontAwesomeIcon icon={siteConfig.showStrengths ? faToggleOn : faToggleOff} size="2x" /></div>
            </div>
            {siteConfig.showStrengths && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {(siteConfig.whyChooseUs || []).map((strength, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{strength.title}</span>
                      <button onClick={() => removeStrength(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  ))}
                </div>
                {(siteConfig.whyChooseUs || []).length < 6 && (
                  <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '14px', color: '#0f172a' }}>Add Strength</h4>
                    <input placeholder="Title (e.g. Transparent Process)" value={newStrength.title} onChange={e => setNewStrength({...newStrength, title: e.target.value})} style={{...inputStyle, marginTop: 0, marginBottom: '12px'}} />
                    <input placeholder="FontAwesome Icon (e.g. fa-shield-alt)" value={newStrength.icon} onChange={e => setNewStrength({...newStrength, icon: e.target.value})} style={{...inputStyle, marginTop: 0, marginBottom: '12px'}} />
                    <textarea placeholder="Description..." rows="2" value={newStrength.desc} onChange={e => setNewStrength({...newStrength, desc: e.target.value})} style={{...inputStyle, marginTop: 0, marginBottom: '16px', resize: 'none'}} />
                    <button onClick={addStrength} style={{ ...premiumBtnStyle, background: '#0f172a', color: '#fff', width: '100%', justifyContent: 'center' }}>Add Feature</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 7: FOOTER & SOCIALS */}
        {activeTab === 'footer' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px', color: '#0f172a' }}>Social Media Links</h3>
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px', borderRadius: '10px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#dc2626', marginTop: '4px' }} />
              <div>
                <strong style={{ fontSize: '14px', color: '#991b1b', display: 'block', marginBottom: '4px' }}>Policies Relocated</strong>
                <span style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: '1.5', display: 'block' }}>Privacy Policy and Terms of Service are managed from your main <strong>Settings</strong> panel.</span>
              </div>
            </div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Instagram URL</label>
            <input type="text" value={siteConfig.socials?.instagram || ''} onChange={(e) => handleTextChange('socials', 'instagram', e.target.value, 150)} placeholder="https://instagram.com/..." style={{ ...inputStyle, marginTop: 0, marginBottom: '20px' }} />
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Facebook URL</label>
            <input type="text" value={siteConfig.socials?.facebook || ''} onChange={(e) => handleTextChange('socials', 'facebook', e.target.value, 150)} placeholder="https://facebook.com/..." style={{ ...inputStyle, marginTop: 0, marginBottom: '20px' }} />
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>LinkedIn URL</label>
            <input type="text" value={siteConfig.socials?.linkedin || ''} onChange={(e) => handleTextChange('socials', 'linkedin', e.target.value, 150)} placeholder="https://linkedin.com/..." style={{ ...inputStyle, marginTop: 0 }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteEditor;