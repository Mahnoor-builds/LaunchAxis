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
  // TEMPORARY FAKE SCENARIO FOR TESTING SERVICE UI
  const isService = true; // Change back to: branding?.industry === 'service' when done testing

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('hero_about'); 
  const [activeSubSection, setActiveSubSection] = useState('hero');
  
  const [newCategory, setNewCategory] = useState('');
  const [newTeamMember, setNewTeamMember] = useState({ name: '', role: '', bio: '' });
  const [newStrength, setNewStrength] = useState({ title: '', desc: '', icon: 'fa-check' });

  const [isGenerating, setIsGenerating] = useState({ hero: false, about: false });
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingImage, setIsSearchingImage] = useState(false);

  // --- CORE LINKS LOGIC (Locked Down for Stability) ---
  let baseMenu = siteConfig.menuItems || [];
  baseMenu = baseMenu.map(item => {
    if (['#home', '#catalog', '#about', '#services', '#contact'].includes(item.link)) {
      return { ...item, isCore: true };
    }
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

  useEffect(() => {
    setSiteConfig(prev => ({ ...prev, menuItems: currentMenu }));
  }, []); // Run once on mount

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

  const handleUnsplashSearch = async (targetField) => {
    const keyword = prompt("Enter a keyword to search Unsplash for an image:");
    if (!keyword) return;

    setIsSearchingImage(true);
    try {
      const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        alert("Please ensure REACT_APP_UNSPLASH_ACCESS_KEY is configured in your .env file.");
        setIsSearchingImage(false);
        return;
      }
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`, {
        headers: { 'Authorization': `Client-ID ${accessKey}` }
      });
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSiteConfig(prev => ({ ...prev, [targetField]: data.results[0].urls.regular }));
      } else {
        alert("No images found for that keyword.");
      }
    } catch (error) {
      alert("Could not fetch image from Unsplash.");
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleSaveToFirebase = async () => {
    try {
      setIsSaving(true);
      const user = auth.currentUser;
      const userId = user ? user.uid : 'ceo@ecosole.store';
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, { siteConfig }, { merge: true });
      alert("✨ Website configuration successfully saved to Cloud Engine!");
    } catch (error) {
      alert("Failed to save website config: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const currentSubdomain = siteConfig.subdomain || 'yourstore';
  const liveUrl = `https://${currentSubdomain}.launchaxis.com`;

  const handleViewLiveSite = () => {
    if (siteConfig.isPublished) {
      window.open(liveUrl, '_blank');
    } else {
      alert("⚠️ Your website is currently offline / in maintenance mode.\n\nPlease go to Settings and enable 'Publish Website' so it can be viewed by clients.");
    }
  };

  const updateMenuLabel = (id, newLabel) => {
    const updatedMenu = currentMenu.map(item => item.id === id ? { ...item, label: sanitizeInput(newLabel).substring(0, 20) } : item);
    setSiteConfig({ ...siteConfig, menuItems: updatedMenu });
  };

  // --- SERVICE CATEGORIES HANDLERS ---
  const addServiceCategory = () => {
    const title = document.getElementById('srv-title').value;
    const desc = document.getElementById('srv-desc').value;
    if (title && desc) {
      setSiteConfig({
        ...siteConfig, 
        services: [...(siteConfig.services || []), { title: sanitizeInput(title), desc: sanitizeInput(desc), icon: 'fa-check-circle' }]
      });
      document.getElementById('srv-title').value = '';
      document.getElementById('srv-desc').value = '';
    } else {
      alert("Please provide both a title and a description.");
    }
  };

  const removeServiceCategory = (index) => {
    setSiteConfig({...siteConfig, services: (siteConfig.services || []).filter((_, i) => i !== index)});
  };

  // --- ARRAY HANDLERS ---
  const addCategory = () => {
    if (!newCategory.trim()) return;
    const currentCategories = siteConfig.categories || [];
    if (currentCategories.length >= 6) return; 
    setSiteConfig({ ...siteConfig, categories: [...currentCategories, { id: Date.now(), label: sanitizeInput(newCategory.trim()).substring(0, 20), image: '' }] });
    setNewCategory('');
  };
  const removeCategory = (id) => setSiteConfig({ ...siteConfig, categories: (siteConfig.categories || []).filter(cat => cat.id !== id) });

  const addTeamMember = () => {
    if (!newTeamMember.name.trim()) return;
    setSiteConfig({ ...siteConfig, teamMembers: [...(siteConfig.teamMembers || []), { name: sanitizeInput(newTeamMember.name), role: sanitizeInput(newTeamMember.role), bio: sanitizeInput(newTeamMember.bio) }] });
    setNewTeamMember({ name: '', role: '', bio: '' });
  };
  const removeTeamMember = (index) => setSiteConfig({ ...siteConfig, teamMembers: (siteConfig.teamMembers || []).filter((_, i) => i !== index) });

  const addStrength = () => {
    if (!newStrength.title.trim()) return;
    if ((siteConfig.whyChooseUs || []).length >= 6) return;
    setSiteConfig({ ...siteConfig, whyChooseUs: [...(siteConfig.whyChooseUs || []), { title: sanitizeInput(newStrength.title), desc: sanitizeInput(newStrength.desc), icon: newStrength.icon }] });
    setNewStrength({ title: '', desc: '', icon: 'fa-check' });
  };
  const removeStrength = (index) => setSiteConfig({ ...siteConfig, whyChooseUs: (siteConfig.whyChooseUs || []).filter((_, i) => i !== index) });

  const triggerAIGenerator = async (section) => {
    setIsGenerating({ ...isGenerating, [section]: true });
    setTimeout(() => {
      if (section === 'hero') {
        setSiteConfig(prev => ({
          ...prev,
          heroTitle: isService ? `Premium ${branding?.name || 'Solutions'} & Strategic Consulting` : `Next-Gen ${branding?.name || 'Products'} Engineered for Tomorrow`,
          heroSubtitle: isService ? "Delivering reliable expertise, seamless project execution, and personalized client solutions." : "Experience premium structural efficiency and elegant styling combinations tailored to your routine."
        }));
      } else if (section === 'about') {
        setSiteConfig(prev => ({
          ...prev,
          aboutText: `Our mission at ${branding?.name || 'LaunchAxis'} is rooted in radical operational excellence. We deliver high-performance solutions optimized for sustainability and client success.`
        }));
      }
      setIsGenerating({ ...isGenerating, [section]: false });
    }, 1200);
  };

  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
  const inputStyle = { width: '100%', padding: '12px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', fontSize: '14px', outline: 'none', marginTop: '8px', boxSizing: 'border-box' };
  
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
    { id: 'footer', label: 'Footer & Socials', icon: faShareAlt },
    ...(!isService ? [{ id: 'delivery', label: 'COD & Bar', icon: faTruck }] : [])
  ];

  return (
    <div style={{ height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column', padding: '0 20px 20px', boxSizing: 'border-box', overflowY: 'auto' }}>
      
      {/* HEADER WITH ACTION BUTTONS */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '20px 0', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faGlobe} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> {isService ? 'Service Portfolio Engine' : 'Website & Storefront Engine'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Configure themes, navigation, content, and live styling centrally.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleViewLiveSite}
            style={{ 
              background: siteConfig.isPublished ? '#f1f5f9' : '#fef2f2', 
              color: siteConfig.isPublished ? '#0f172a' : '#ef4444', 
              border: `1px solid ${siteConfig.isPublished ? '#cbd5e1' : '#fca5a5'}`, 
              borderRadius: '8px', padding: '12px 20px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
            }}
          >
            <FontAwesomeIcon icon={faExternalLinkAlt} /> View Live Site
          </button>

          <button 
            onClick={handleSaveToFirebase} 
            disabled={isSaving}
            style={{ 
              background: '#0f172a', color: '#fff', border: 'none', 
              borderRadius: '8px', padding: '12px 24px', fontWeight: '700', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px'
            }}
          >
            <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* CENTRAL EDITOR CONTAINER */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', flex: 1 }}>
        
        {/* TABS NAVIGATION */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '8px', borderRadius: '12px', flexWrap: 'wrap' }}>
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 1 auto', padding: '12px 16px', border: 'none',
                background: activeTab === tab.id ? '#fff' : 'transparent',
                color: activeTab === tab.id ? '#0f172a' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '600',
                borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
                boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              <FontAwesomeIcon icon={tab.icon} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ======================================= */}
        {/* TAB CONTENTS (No Preview Frame)         */}
        {/* ======================================= */}

        {/* TAB 1: HERO & BIO */}
        {activeTab === 'hero_about' && (
          <div style={{ animation: 'fadeIn 0.2s' }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '18px', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <FontAwesomeIcon icon={faLink} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Subdomain & Theme Color
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 16px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  value={siteConfig.subdomain || ''} 
                  onChange={(e) => handleSubdomainChange(e.target.value)} 
                  placeholder="my-agency"
                  style={{ border: 'none', background: 'transparent', padding: '16px 0', fontSize: '16px', outline: 'none', flex: 1, fontWeight: 'bold', color: '#0f172a' }} 
                />
                <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 'bold' }}>.launchaxis.com</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Brand Accent Color:</label>
                <input type="color" value={siteConfig.themeColor || '#D62828'} onChange={(e) => handleTextChange('global', 'themeColor', e.target.value, 7)} style={{ border: 'none', background: 'none', cursor: 'pointer', width: '40px', height: '40px', padding: 0 }} />
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '15px' }}>{(siteConfig.themeColor || '#D62828').toUpperCase()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveSubSection('hero')}
                style={{
                  flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: activeSubSection === 'hero' ? '#0f172a' : '#f8fafc',
                  color: activeSubSection === 'hero' ? '#fff' : '#475569',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faHeading} style={{ marginRight: '8px' }} /> Header / Hero
              </button>
              <button
                onClick={() => setActiveSubSection('about')}
                style={{
                  flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: activeSubSection === 'about' ? '#0f172a' : '#f8fafc',
                  color: activeSubSection === 'about' ? '#fff' : '#475569',
                  fontWeight: '700', fontSize: '14px', cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon icon={faFont} style={{ marginRight: '8px' }} /> Brand Bio
              </button>
            </div>

            {/* HERO EDITOR */}
            {activeSubSection === 'hero' && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Hero Banner Content</h3>
                  <div onClick={() => handleToggle('showHero')} style={{ cursor: 'pointer', color: siteConfig.showHero !== false ? '#10b981' : '#cbd5e1' }}>
                    <FontAwesomeIcon icon={siteConfig.showHero !== false ? faToggleOn : faToggleOff} size="2x" />
                  </div>
                </div>

                {siteConfig.showHero !== false && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <button onClick={() => triggerAIGenerator('hero')} disabled={isGenerating.hero} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '14px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faMagic} /> {isGenerating.hero ? 'Writing Hero Copy...' : 'Generate Hero Text with AI'}
                    </button>

                    <div>
                      <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Hero Background Image</label>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <input type="file" accept="image/*" id="hero-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('heroImage', e)} />
                        <label htmlFor="hero-upload" style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>
                          <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} /> Upload Locally
                        </label>
                        <button onClick={() => handleUnsplashSearch('heroImage')} disabled={isSearchingImage} style={{ flex: 1.2, padding: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} /> Unsplash Auto-Fill (AI)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Hero Main Title</label>
                      <input value={siteConfig.heroTitle || ''} onChange={(e) => handleTextChange('global', 'heroTitle', e.target.value, 100)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Hero Subtext</label>
                      <textarea rows="3" value={siteConfig.heroSubtitle || ''} onChange={(e) => handleTextChange('global', 'heroSubtitle', e.target.value, 300)} style={{...inputStyle, resize: 'none'}} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABOUT EDITOR */}
            {activeSubSection === 'about' && (
              <div style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Brand Bio / About Section</h3>
                  <div onClick={() => handleToggle('showAbout')} style={{ cursor: 'pointer', color: siteConfig.showAbout !== false ? '#10b981' : '#cbd5e1' }}>
                    <FontAwesomeIcon icon={siteConfig.showAbout !== false ? faToggleOn : faToggleOff} size="2x" />
                  </div>
                </div>

                {siteConfig.showAbout !== false && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <button onClick={() => triggerAIGenerator('about')} disabled={isGenerating.about} style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '14px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faMagic} /> {isGenerating.about ? 'Writing Bio...' : 'Generate Brand Bio with AI'}
                    </button>

                    <div>
                      <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>About Section Image</label>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <input type="file" accept="image/*" id="about-upload" style={{ display: 'none' }} onChange={(e) => handleImageUpload('aboutImage', e)} />
                        <label htmlFor="about-upload" style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>
                          <FontAwesomeIcon icon={faUpload} style={{ marginRight: '6px' }} /> Upload Locally
                        </label>
                        <button onClick={() => handleUnsplashSearch('aboutImage')} disabled={isSearchingImage} style={{ flex: 1.2, padding: '12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                          <FontAwesomeIcon icon={faImage} style={{ marginRight: '5px' }} /> Unsplash Auto-Fill (AI)
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '14px', color: '#475569', fontWeight: 'bold' }}>Narrative Body Copy</label>
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
            <h3 style={{ fontSize: '18px', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <FontAwesomeIcon icon={faBars} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Header Menu Links
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', marginTop: 0 }}>
              Rename labels to match your brand. Layout structure is locked to ensure visual stability.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {currentMenu.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '12px' }}>
                  <input 
                    value={item.label} 
                    onChange={(e) => updateMenuLabel(item.id, e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: '15px', color: '#334155', fontWeight: 'bold', outline: 'none', flex: 1 }}
                  />
                  <FontAwesomeIcon icon={faLock} style={{ color: '#cbd5e1', fontSize: '15px' }} title="System Core Link" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3 (SERVICE): SERVICE CATEGORIES */}
        {isService && activeTab === 'services' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 14px', color: '#0f172a' }}>Service Categories</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Define the core services you offer. You will assign projects to these categories in your dashboard.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {(siteConfig.services || []).map((srv, idx) => (
                <div key={idx} style={{ padding: '16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px' }}>{srv.title}</strong>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>{srv.desc}</span>
                  </div>
                  <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '18px' }} onClick={() => removeServiceCategory(idx)} />
                </div>
              ))}
            </div>

            <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#334155' }}>Add New Service</h4>
              <input placeholder="Service Title (e.g., Visa Consulting)" id="srv-title" style={{...inputStyle, marginTop: 0, marginBottom: '8px'}} />
              <textarea placeholder="Short Description" rows="2" id="srv-desc" style={{...inputStyle, marginTop: 0, resize: 'none'}} />
              <button onClick={addServiceCategory} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '12px', width: '100%' }}>Add Category</button>
            </div>
          </div>
        )}

        {/* TAB 4 (SERVICE): LEADERSHIP TEAM CONFIG */}
        {isService && activeTab === 'team' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Leadership Team</h3>
              <div onClick={() => handleToggle('showTeam')} style={{ cursor: 'pointer', color: siteConfig.showTeam ? '#10b981' : '#cbd5e1' }}>
                <FontAwesomeIcon icon={siteConfig.showTeam ? faToggleOn : faToggleOff} size="2x" />
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Build trust by showcasing your management team.</p>

            {siteConfig.showTeam && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {(siteConfig.teamMembers || []).map((member, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <strong style={{ fontSize: '15px', display: 'block', color: '#0f172a', marginBottom: '4px' }}>{member.name}</strong>
                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{member.role}</span>
                      </div>
                      <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '18px' }} onClick={() => removeTeamMember(idx)} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: '#f1f5f9', borderRadius: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>Add New Member</h4>
                  <input placeholder="Member Name" value={newTeamMember.name} onChange={e => setNewTeamMember({...newTeamMember, name: e.target.value})} style={{...inputStyle, marginTop: 0}} />
                  <input placeholder="Role / Title (e.g. CEO, Head of Operations)" value={newTeamMember.role} onChange={e => setNewTeamMember({...newTeamMember, role: e.target.value})} style={{...inputStyle, marginTop: 0}} />
                  <textarea placeholder="Short Bio" rows="3" value={newTeamMember.bio} onChange={e => setNewTeamMember({...newTeamMember, bio: e.target.value})} style={{...inputStyle, marginTop: 0, resize: 'none'}} />
                  <button onClick={addTeamMember} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>Add Team Member</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 5 (SERVICE): WHY CHOOSE US (MAX 6) */}
        {isService && activeTab === 'strengths' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a' }}>Core Strengths (Why Choose Us)</h3>
              <div onClick={() => handleToggle('showStrengths')} style={{ cursor: 'pointer', color: siteConfig.showStrengths ? '#10b981' : '#cbd5e1' }}>
                <FontAwesomeIcon icon={siteConfig.showStrengths ? faToggleOn : faToggleOff} size="2x" />
              </div>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>Add up to 6 core company strengths or features.</p>

            {siteConfig.showStrengths && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {(siteConfig.whyChooseUs || []).map((strength, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a' }}>{strength.title}</span>
                      <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '18px' }} onClick={() => removeStrength(idx)} />
                    </div>
                  ))}
                </div>

                {(siteConfig.whyChooseUs || []).length < 6 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: '#f1f5f9', borderRadius: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', color: '#334155' }}>Add New Strength</h4>
                    <input placeholder="Strength Title (e.g. Transparent Process)" value={newStrength.title} onChange={e => setNewStrength({...newStrength, title: e.target.value})} style={{...inputStyle, marginTop: 0}} />
                    <input placeholder="FontAwesome Icon (e.g. fa-shield-alt)" value={newStrength.icon} onChange={e => setNewStrength({...newStrength, icon: e.target.value})} style={{...inputStyle, marginTop: 0}} />
                    <textarea placeholder="Short description..." rows="2" value={newStrength.desc} onChange={e => setNewStrength({...newStrength, desc: e.target.value})} style={{...inputStyle, marginTop: 0, resize: 'none'}} />
                    <button onClick={addStrength} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>Add Feature</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 6 (ECOMMERCE): CATEGORIES */}
        {!isService && activeTab === 'categories' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <FontAwesomeIcon icon={faTags} style={{ color: 'var(--brand-color, #2dd4bf)' }} /> Product Collections
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px', marginTop: 0 }}>
              Organize your storefront with circular images. Max 6 categories.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {(siteConfig.categories || []).map((cat, idx) => (
                <div key={cat.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#cbd5e1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cat.image ? <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>Img</span>}
                  </div>
                  <span style={{ fontSize: '16px', color: '#334155', fontWeight: 'bold', flex: 1, wordBreak: 'break-all' }}>{cat.label}</span>
                  <input 
                    type="file" accept="image/*" id={`cat-upload-${cat.id || idx}`} style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updatedCats = siteConfig.categories.map(c => c.id === cat.id ? { ...c, image: reader.result } : c);
                          setSiteConfig({ ...siteConfig, categories: updatedCats });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                  <label htmlFor={`cat-upload-${cat.id || idx}`} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 16px', fontSize: '12px', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}>
                    Upload Photo
                  </label>
                  <FontAwesomeIcon icon={faTrash} style={{ cursor: 'pointer', color: '#ef4444', fontSize: '18px', marginLeft: '12px' }} onClick={() => removeCategory(cat.id)} />
                </div>
              ))}
            </div>
            
            {(siteConfig.categories || []).length >= 6 ? (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', color: '#ef4444', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>
                Maximum of 6 categories reached.
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <input placeholder="e.g. Summer Wear..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{...inputStyle, marginTop: 0}} />
                <button onClick={addCategory} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 24px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <FontAwesomeIcon icon={faPlus} /> Add
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FOOTER & SOCIALS (POLICIES REMOVED) */}
        {activeTab === 'footer' && (
          <div style={cardStyle}>
            <h3 style={{ fontSize: '18px', margin: '0 0 16px', color: '#0f172a' }}>Social Media & Links</h3>
            
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#dc2626', marginTop: '4px' }} />
              <div>
                <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block' }}>Legal Policies Relocated</strong>
                <span style={{ fontSize: '12px', color: '#7f1d1d' }}>Privacy Policy and Terms of Service are now strictly managed from your main <strong>Settings</strong> panel for legal compliance. They will auto-populate in your footer once configured.</span>
              </div>
            </div>
            
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Instagram URL</label>
            <input type="text" value={siteConfig.socials?.instagram || ''} onChange={(e) => handleTextChange('socials', 'instagram', e.target.value, 150)} placeholder="https://instagram.com/..." style={{ ...inputStyle, marginTop: 0, marginBottom: '20px' }} />

            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Facebook URL</label>
            <input type="text" value={siteConfig.socials?.facebook || ''} onChange={(e) => handleTextChange('socials', 'facebook', e.target.value, 150)} placeholder="https://facebook.com/..." style={{ ...inputStyle, marginTop: 0, marginBottom: '20px' }} />

            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>LinkedIn URL</label>
            <input type="text" value={siteConfig.socials?.linkedin || ''} onChange={(e) => handleTextChange('socials', 'linkedin', e.target.value, 150)} placeholder="https://linkedin.com/..." style={{ ...inputStyle, marginTop: 0 }} />
          </div>
        )}

      </div>
    </div>
  );
};

export default WebsiteEditor;