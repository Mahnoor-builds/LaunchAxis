import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faPalette, faUpload, faWandMagicSparkles, 
  faImage, faFont, faBuilding, faFileSignature, faDesktop, faPenNib,
  faGlobe, faSpinner, faCheckCircle, faTimesCircle, faLightbulb, 
  faTriangleExclamation, faTag, faBullhorn, faIdCard, faSwatchbook
} from '@fortawesome/free-solid-svg-icons';

const Branding = ({ branding = {}, setBranding }) => {
  const [activeTab, setActiveTab] = useState('studio'); 
  const [isGenerating, setIsGenerating] = useState({ name: false, slogan: false, logo: false, text: false });
  
  // Refs for file uploads
  const logoInputRef = useRef(null);
  const contentImageRef = useRef(null);

  // UX & Domain States
  const [nameKeyword, setNameKeyword] = useState(''); 
  const [logoPrompt, setLogoPrompt] = useState('');   
  const [domainStatus, setDomainStatus] = useState('idle'); 
  const [domainName, setDomainName] = useState('');
  
  // Content Engine States
  const [contentPrompt, setContentPrompt] = useState('');
  const [contentImage, setContentImage] = useState(null); 
  const [generatedContent, setGeneratedContent] = useState('');

  // --- QUOTA LOGIC (FREE PLAN MVP) ---
  const AI_LIMIT = 10;
  const [aiUsageCount, setAiUsageCount] = useState(() => parseInt(localStorage.getItem('launchAxisAiUsage') || '0'));
  const isAiLimitReached = aiUsageCount >= AI_LIMIT;

  // --- UNIFIED CUSTOM MODAL (REPLACES WINDOW CHROME ALERTS) ---
  const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', payload: null });

  const primaryColor = branding.color || '#2dd4bf';

  // ==============================
  // 1. INPUT & DOMAIN HANDLERS
  // ==============================
  const handleChange = (field, value) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatoryChange = (field, value) => {
    const updatedSignatory = { ...(branding.signatory || { name: '', role: 'CEO' }), [field]: value };
    setBranding(prev => ({ ...prev, signatory: updatedSignatory }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBranding(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
    }
  };

  const handleContentImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setContentImage(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (branding.name && branding.name !== 'Loading...') {
      const formatted = branding.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
      setDomainName(formatted);
      setDomainStatus('idle');
    }
  }, [branding.name]);

  const checkDomainAvailability = async (domainToCheck = domainName) => {
    if (!domainToCheck) return false;
    setDomainStatus('checking');
    try {
      const res = await fetch('/api/whois', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainToCheck })
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      const isTaken = Boolean(data.registrar || data.creation_date);
      setDomainStatus(isTaken ? 'taken' : 'available');
      return !isTaken;
    } catch (error) {
      console.error('Domain check error:', error);
      setDomainStatus('error');
      return false;
    }
  };

  // ==============================
  // 2. MODAL & QUOTA CONTROLLERS
  // ==============================
  const showModal = (type, title, message, payload = null) => {
    setModal({ isOpen: true, type, title, message, payload });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: '', title: '', message: '', payload: null });
  };

  const incrementAiUsage = () => {
    const newCount = aiUsageCount + 1;
    setAiUsageCount(newCount);
    localStorage.setItem('launchAxisAiUsage', newCount.toString());
  };

  const checkAiQuota = () => {
    if (isAiLimitReached) {
      showModal('alert', 'Free Tier Limit Reached', 'You have used all 10 free AI generations. Upgrade to Pilot to unlock unlimited AI tools.');
      return false;
    }
    return true;
  };

  const confirmModalAction = () => {
    if (modal.type === 'confirmName') {
      handleChange('name', modal.payload.name);
      setDomainName(modal.payload.domain);
      setDomainStatus(modal.payload.status);
    } else if (modal.type === 'confirmSlogan') {
      handleChange('slogan', modal.payload.slogan);
    } else if (modal.type === 'confirmLogo') {
      handleChange('logo', modal.payload.logo);
    }
    closeModal();
  };

  // ==============================
  // 3. SECURE API CALLER
  // ==============================
  const callGemini = async (promptText) => {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.text;
  };

  // ==============================
  // 4. AI GENERATORS 
  // ==============================
  const generateNameOnly = async () => {
    if (!checkAiQuota()) return;
    const keyword = nameKeyword.trim();
    if (!keyword && !branding.name) {
      return showModal('alert', 'Input Required', 'Please describe your business in Step 1 before generating a name.');
    }
    const topic = keyword || branding.name;

    setIsGenerating(prev => ({ ...prev, name: true }));
    setDomainStatus('checking');

    try {
      const prompt = `Generate 10 modern, punchy, 1-word or 2-word brand names for an e-commerce store specializing in: "${topic}". Return ONLY a valid JSON array of strings: ["Name1", "Name2", "Name3", "Name4", "Name5", "Name6", "Name7", "Name8", "Name9", "Name10"]`;
      const rawText = await callGemini(prompt);
      const cleanedJson = rawText.replace(/```json|```/g, '').trim();
      const names = JSON.parse(cleanedJson);
      incrementAiUsage();

      let foundAvailable = false;
      const extensions = ['.com', '.store', '.co'];

      for (const testName of names) {
        const cleanSlug = testName.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const ext of extensions) {
          const testDomain = `${cleanSlug}${ext}`;
          const isFree = await checkDomainAvailability(testDomain);
          if (isFree) {
            showModal('confirmName', 'AI Name Generated', 'We found an available name and domain!', { name: testName, domain: testDomain, status: 'available' });
            foundAvailable = true;
            break;
          }
        }
        if (foundAvailable) break;
      }

      if (!foundAvailable && names.length > 0) {
        showModal('confirmName', 'AI Name Generated', 'Here is the best name, but the exact .com might be taken.', { name: names[0], domain: `${names[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`, status: 'taken' });
      }
    } catch (error) {
      showModal('alert', 'System Error', 'Name generation failed: ' + error.message);
      setDomainStatus('idle');
    } finally {
      setIsGenerating(prev => ({ ...prev, name: false }));
    }
  };

  const generateSloganOnly = async () => {
    if (!checkAiQuota()) return;
    const keyword = nameKeyword.trim();
    const brandName = branding.name || "Our Brand";
    if (!keyword && !branding.name) {
      return showModal('alert', 'Input Required', 'Please enter a business explanation or brand name first.');
    }

    setIsGenerating(prev => ({ ...prev, slogan: true }));
    try {
      const prompt = `Write 1 catchy, professional, modern tagline/slogan (under 10 words) for a brand named "${brandName}" that sells/does: "${keyword || brandName}". Return ONLY the slogan text without quotes.`;
      const slogan = await callGemini(prompt);
      incrementAiUsage();
      showModal('confirmSlogan', 'AI Tagline Generated', 'Review your new brand tagline.', { slogan: slogan.replace(/"/g, '').trim() });
    } catch (error) {
      showModal('alert', 'System Error', 'Tagline generation failed: ' + error.message);
    } finally {
      setIsGenerating(prev => ({ ...prev, slogan: false }));
    }
  };

  const generateLogo = async () => {
    if (!checkAiQuota()) return;
    const desc = logoPrompt.trim() || nameKeyword || branding.name || "modern minimalist symbol";

    setIsGenerating(prev => ({ ...prev, logo: true }));
    try {
      const prompt = `Generate a clean, scalable SVG vector logo icon for a brand named "${branding.name || 'Brand'}" (${desc}). Use primary accent color ${primaryColor}. Return ONLY valid <svg>...</svg> XML code without markdown wrappers.`;
      const rawSvg = await callGemini(prompt);
      incrementAiUsage();
      
      const svgCode = rawSvg.replace(/```xml|```svg|```/g, '').trim();
      const encodedSvg = `data:image/svg+xml;utf8,${encodeURIComponent(svgCode)}`;
      showModal('confirmLogo', 'AI Logo Generated', 'Review your new scalable vector symbol.', { logo: encodedSvg });
    } catch (error) {
      showModal('alert', 'System Error', 'Logo generation failed: ' + error.message);
    } finally {
      setIsGenerating(prev => ({ ...prev, logo: false }));
    }
  };

  const generateText = async () => {
    if (!contentPrompt && !contentImage) return showModal('alert', 'Input Required', 'Please enter instructions or upload an image.');
    if (!checkAiQuota()) return;
    
    setIsGenerating(prev => ({ ...prev, text: true }));
    try {
      const systemPrompt = `You are a professional business writer for a company named "${branding?.name || 'our business'}". Generate exactly what the user requests in clean, plain text. Do not use markdown backticks unless asked. Make it professional and ready for publication.`;
      const finalPrompt = `${systemPrompt}\n\nUser Request: ${contentPrompt}`;

      const text = await callGemini(finalPrompt);
      incrementAiUsage();
      setGeneratedContent(text.trim());
    } catch (error) {
      showModal('alert', 'System Error', 'Content generation failed: ' + error.message);
    } finally {
      setIsGenerating(prev => ({ ...prev, text: false }));
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
    padding: '12px 18px',
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
    padding: '12px 18px',
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

  const displayBrandName = branding.name && branding.name !== 'Loading...' ? branding.name : 'Unconfigured Brand';
  const currentFontName = branding.font ? branding.font.split(',')[0].replace(/'/g, '') : 'Inter';

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- 1. TOP HEADER & SEGMENTED NAVIGATION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>
            Identity & Copywriting
          </span>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Branding Studio
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Segmented Pill Switcher */}
          <div style={{ background: '#e2e8f0', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setActiveTab('studio')} 
              style={{ 
                padding: '9px 18px', borderRadius: '9px', border: 'none', 
                background: activeTab === 'studio' ? '#ffffff' : 'transparent', 
                color: activeTab === 'studio' ? '#0f172a' : '#475569',
                fontWeight: activeTab === 'studio' ? '800' : '600', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: activeTab === 'studio' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <FontAwesomeIcon icon={faPalette} style={{ color: activeTab === 'studio' ? '#4f46e5' : '#64748b' }} />
              Visual Studio
            </button>
            <button 
              onClick={() => setActiveTab('content')} 
              style={{ 
                padding: '9px 18px', borderRadius: '9px', border: 'none', 
                background: activeTab === 'content' ? '#ffffff' : 'transparent', 
                color: activeTab === 'content' ? '#0f172a' : '#475569',
                fontWeight: activeTab === 'content' ? '800' : '600', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: activeTab === 'content' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              <FontAwesomeIcon icon={faPenNib} style={{ color: activeTab === 'content' ? '#ea580c' : '#64748b' }} />
              Content Engine
            </button>
          </div>
        </div>
      </div>

      {/* --- 2. FOUR KEY BRAND SNAPSHOT CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* CARD 1: ACTIVE BRAND */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Active Identity</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faTag} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayBrandName}
          </div>
          <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
            {branding.logo ? 'Custom logo active' : 'Default icon active'}
          </div>
        </div>

        {/* CARD 2: DOMAIN STATUS */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Web Domain</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faGlobe} />
            </div>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {domainName || 'Not checked yet'}
          </div>
          <div style={{ fontSize: '12px', color: domainStatus === 'available' ? '#059669' : domainStatus === 'taken' ? '#dc2626' : '#64748b', fontWeight: '600' }}>
            {domainStatus === 'available' ? 'Domain is available' : domainStatus === 'taken' ? 'Domain already taken' : 'Click Check Domain below'}
          </div>
        </div>

        {/* CARD 3: STYLE & FONT */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Theme & Font</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faSwatchbook} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '5px', background: primaryColor, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }}></span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>{primaryColor.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>
            Font: {currentFontName}
          </div>
        </div>

        {/* CARD 4: AI CREDITS */}
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>AI Studio Quota</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faRobot} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: isAiLimitReached ? '#dc2626' : '#0f172a', marginBottom: '4px' }}>
            {aiUsageCount} / {AI_LIMIT} Used
          </div>
          <div style={{ fontSize: '12px', color: isAiLimitReached ? '#dc2626' : '#2563eb', fontWeight: '600' }}>
            {isAiLimitReached ? 'Free limit reached' : `${AI_LIMIT - aiUsageCount} AI prompts remaining`}
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* TAB 1: VISUAL STUDIO & LIVE BRAND BOARD                   */}
      {/* ========================================================= */}
      {activeTab === 'studio' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN: CONFIGURATION CARDS */}
          <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
            {/* CARD A: CORE BRAND IDENTITY */}
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faWandMagicSparkles} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Name, Domain & Tagline</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Define how customers recognize your business</p>
                </div>
              </div>

              {/* STEP 1: NICHE DESCRIPTION */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                <label style={{ ...labelStyle, color: '#9a3412', marginBottom: '6px' }}>
                  <FontAwesomeIcon icon={faLightbulb} style={{ color: '#ea580c' }} /> Step 1: What does your business sell or do?
                </label>
                <input 
                  type="text" 
                  style={{ ...saasInputStyle, background: '#ffffff', borderColor: '#fdba74' }} 
                  value={nameKeyword} 
                  onChange={(e) => setNameKeyword(e.target.value)} 
                  placeholder="e.g. modern web design agency or luxury oud perfumes" 
                />
              </div>

              {/* STEP 2: BUSINESS NAME */}
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                  <FontAwesomeIcon icon={faTag} style={{ color: '#2563eb' }} /> Step 2: Business Name
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    style={{ ...saasInputStyle, flex: '1 1 180px' }} 
                    value={branding.name || ''} 
                    onChange={(e) => handleChange('name', e.target.value)} 
                    placeholder="Enter Business Name" 
                  />
                  <button 
                    style={{ ...primaryBtnStyle, opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} 
                    onClick={generateNameOnly} 
                    disabled={isGenerating.name || isAiLimitReached}
                  >
                    {isGenerating.name ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#f97316' }} /> Generate Name</>}
                  </button>
                </div>
              </div>

              {/* DOMAIN CHECKER */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                <label style={labelStyle}>
                  <FontAwesomeIcon icon={faGlobe} style={{ color: '#059669' }} /> Domain Availability Check
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 180px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faGlobe} style={{ position: 'absolute', left: '14px', color: '#94a3b8', fontSize: '13px' }} />
                    <input 
                      style={{ ...saasInputStyle, paddingLeft: '36px', background: '#ffffff' }} 
                      value={domainName} 
                      onChange={(e) => {
                        setDomainName(e.target.value.toLowerCase().replace(/\s+/g, ''));
                        setDomainStatus('idle');
                      }}
                      placeholder="e.g. mybrand.com"
                    />
                  </div>
                  <button 
                    style={secondaryBtnStyle} 
                    onClick={() => checkDomainAvailability()} 
                    disabled={domainStatus === 'checking'}
                  >
                    {domainStatus === 'checking' ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Check Domain'}
                  </button>
                </div>

                {domainStatus !== 'idle' && (
                  <div style={{ fontSize: '12px', marginTop: '10px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {domainStatus === 'taken' && <span style={{ color: '#dc2626' }}><FontAwesomeIcon icon={faTimesCircle} /> This domain is already registered. Try another variation.</span>}
                    {domainStatus === 'available' && <span style={{ color: '#059669' }}><FontAwesomeIcon icon={faCheckCircle} /> Good news! {domainName} is available.</span>}
                    {domainStatus === 'error' && <span style={{ color: '#ea580c' }}><FontAwesomeIcon icon={faTriangleExclamation} /> Could not reach domain lookup server.</span>}
                  </div>
                )}
              </div>

              {/* STEP 3: SLOGAN */}
              <div>
                <label style={labelStyle}>
                  <FontAwesomeIcon icon={faBullhorn} style={{ color: '#4f46e5' }} /> Step 3: Brand Slogan
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    style={{ ...saasInputStyle, flex: '1 1 180px' }} 
                    value={branding.slogan || ''} 
                    onChange={(e) => handleChange('slogan', e.target.value)} 
                    placeholder="Short, memorable brand promise" 
                  />
                  <button 
                    style={{ ...secondaryBtnStyle, opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} 
                    onClick={generateSloganOnly} 
                    disabled={isGenerating.slogan || isAiLimitReached}
                  >
                    {isGenerating.slogan ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#4f46e5' }} /> Write Slogan</>}
                  </button>
                </div>
              </div>
            </div>

            {/* CARD B: VISUAL STYLING & LOGO */}
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faImage} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Colors, Font & Logo</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Set your visual theme across website and invoices</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                {/* PRIMARY COLOR PICKER */}
                <div style={{ flex: '1 1 140px' }}>
                  <label style={labelStyle}>
                    <FontAwesomeIcon icon={faPalette} style={{ color: '#ea580c' }} /> Primary Accent Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', height: '45px', boxSizing: 'border-box' }}>
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => handleChange('color', e.target.value)} 
                      style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }} 
                    />
                    <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                      {primaryColor.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* FONT SELECTOR */}
                <div style={{ flex: '1 1 180px' }}>
                  <label style={labelStyle}>
                    <FontAwesomeIcon icon={faFont} style={{ color: '#2563eb' }} /> Brand Font Style
                  </label>
                  <select 
                    style={saasInputStyle} 
                    value={branding.font || "'Inter', sans-serif"} 
                    onChange={(e) => handleChange('font', e.target.value)}
                  >
                    <option value="'Inter', sans-serif">Modern Clean (Inter)</option>
                    <option value="'Playfair Display', serif">Editorial Luxury (Playfair)</option>
                    <option value="'Space Grotesk', sans-serif">Bold Tech (Space Grotesk)</option>
                  </select>
                </div>
              </div>

              {/* LOGO UPLOAD & AI VECTOR ENGINE */}
              <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    <FontAwesomeIcon icon={faImage} style={{ color: '#059669' }} /> Brand Logo
                  </label>
                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} />
                  <button 
                    style={{ ...secondaryBtnStyle, padding: '7px 12px', fontSize: '12px' }} 
                    onClick={() => logoInputRef.current.click()}
                  >
                    <FontAwesomeIcon icon={faUpload} style={{ color: '#2563eb' }} /> Upload Image
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    style={{ ...saasInputStyle, background: '#ffffff', flex: '1 1 180px' }} 
                    placeholder="Describe icon symbol (e.g. minimal geometric shield)" 
                    value={logoPrompt} 
                    onChange={(e) => setLogoPrompt(e.target.value)} 
                  />
                  <button 
                    style={{ ...primaryBtnStyle, opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} 
                    onClick={generateLogo} 
                    disabled={isGenerating.logo || isAiLimitReached}
                  >
                    {isGenerating.logo ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#10b981' }} /> AI Vector Logo</>}
                  </button>
                </div>
              </div>
            </div>

            {/* CARD C: OFFICIAL LEDGER SIGNATORY */}
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faBuilding} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Official Invoice Signatory</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Printed on your official financial statements</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ flex: '1 1 160px' }}>
                  <label style={labelStyle}>
                    <FontAwesomeIcon icon={faFileSignature} style={{ color: '#2563eb' }} /> Full Name
                  </label>
                  <input 
                    style={saasInputStyle} 
                    value={branding.signatory?.name || ''} 
                    onChange={(e) => handleSignatoryChange('name', e.target.value)} 
                    placeholder="Authorized Name" 
                  />
                </div>
                <div style={{ flex: '1 1 140px' }}>
                  <label style={labelStyle}>
                    <FontAwesomeIcon icon={faIdCard} style={{ color: '#ea580c' }} /> Role / Title
                  </label>
                  <input 
                    style={saasInputStyle} 
                    value={branding.signatory?.role || ''} 
                    onChange={(e) => handleSignatoryChange('role', e.target.value)} 
                    placeholder="e.g. CEO & Founder" 
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: STICKY LIVE BRAND BOARD */}
          <div style={{ flex: '1.1 1 360px', position: 'sticky', top: '20px' }}>
            <div style={bentoCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faDesktop} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Live Brand Kit Preview</h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Real-time preview of your visual identity</p>
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>
                  Auto-Synced
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: branding.font || "'Inter', sans-serif" }}>
                
                {/* HERO BRAND CARD */}
                <div style={{ background: primaryColor, borderRadius: '14px', padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.25), 0 8px 20px -4px rgba(15, 23, 42, 0.12)', color: '#ffffff', textAlign: 'center' }}>
                  {branding.logo ? (
                    <img src={branding.logo} alt="Logo" style={{ maxHeight: '76px', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                      <FontAwesomeIcon icon={faImage} style={{ fontSize: '28px', color: '#ffffff' }} />
                    </div>
                  )}
                  <h1 style={{ margin: '14px 0 6px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', wordBreak: 'break-word', color: '#ffffff' }}>
                    {displayBrandName}
                  </h1>
                  <p style={{ margin: 0, opacity: 0.92, fontSize: '14px', fontWeight: '500', maxWidth: '360px', lineHeight: '1.5' }}>
                    {branding.slogan || 'Your brand slogan will appear right here'}
                  </p>
                </div>

                {/* TYPOGRAPHY & PALETTE MINI BENTO */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faFont} style={{ color: '#2563eb' }} /> Font Specimen
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', color: '#0f172a' }}>
                      <span style={{ fontSize: '34px', fontWeight: '900' }}>Aa</span>
                      <span style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>Bb Cc</span>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {currentFontName}
                    </div>
                  </div>

                  <div style={{ background: '#0f172a', borderRadius: '12px', padding: '18px', color: '#ffffff' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faPalette} style={{ color: '#f97316' }} /> Color System
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: primaryColor, border: '2px solid #ffffff' }}></div>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#1e293b', border: '1px solid #475569' }}></div>
                      <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f8fafc' }}></div>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace', fontWeight: '700' }}>
                      Primary: {primaryColor.toUpperCase()}
                    </div>
                  </div>

                </div>

                {/* MINI WEBSITE MOCKUP */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FontAwesomeIcon icon={faDesktop} style={{ color: '#059669' }} /> Storefront Header Preview
                  </div>
                  
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', background: '#ffffff' }}>
                    <div style={{ background: '#f1f5f9', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                      <span style={{ marginLeft: '8px', fontSize: '10px', color: '#64748b', fontWeight: '600', fontFamily: 'monospace' }}>
                        {domainName || 'yourbrand.com'}
                      </span>
                    </div>
                    
                    <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {branding.logo && <img src={branding.logo} alt="Logo" style={{ height: '20px' }} />}
                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>{displayBrandName}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ width: '28px', height: '5px', background: '#cbd5e1', borderRadius: '3px' }}></div>
                        <div style={{ width: '28px', height: '5px', background: '#cbd5e1', borderRadius: '3px' }}></div>
                      </div>
                    </div>

                    <div style={{ padding: '28px 16px', textAlign: 'center', background: '#ffffff' }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                        {branding.slogan || 'Welcome to our official online platform'}
                      </div>
                      <div style={{ width: '55%', height: '6px', background: '#e2e8f0', margin: '0 auto 16px auto', borderRadius: '4px' }}></div>
                      <span style={{ background: primaryColor, color: '#ffffff', padding: '7px 18px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', display: 'inline-block' }}>
                        Explore Now
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AI CONTENT ENGINE                                  */}
      {/* ========================================================= */}
      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* LEFT: PROMPT BUILDER */}
          <div style={{ ...bentoCardStyle, flex: '1 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faPenNib} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>AI Business Copywriter</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Draft product descriptions, social captions, or store policies</p>
              </div>
            </div>
            
            <label style={labelStyle}>
              <FontAwesomeIcon icon={faLightbulb} style={{ color: '#ea580c' }} /> Writing Instructions
            </label>
            <textarea 
              style={{ ...saasInputStyle, height: '120px', resize: 'vertical', marginBottom: '18px', lineHeight: '1.5' }} 
              placeholder="e.g. Write a welcoming 'About Us' story or a return policy for our customers..." 
              value={contentPrompt} 
              onChange={(e) => setContentPrompt(e.target.value)} 
            />

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}>
                <FontAwesomeIcon icon={faImage} style={{ color: '#2563eb' }} /> Optional Product / Reference Photo
              </label>
              <input type="file" accept="image/*" ref={contentImageRef} onChange={handleContentImageUpload} style={{ display: 'none' }} />
              {!contentImage ? (
                <button 
                  style={{ ...secondaryBtnStyle, width: '100%' }} 
                  onClick={() => contentImageRef.current.click()}
                >
                  <FontAwesomeIcon icon={faUpload} style={{ color: '#2563eb' }} /> Attach Reference Image
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
                  <img src={contentImage} alt="Reference" style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }} />
                  <span style={{ fontSize: '13px', color: '#0f172a', flex: '1 1 100px', fontWeight: '700' }}>Image attached for context</span>
                  <button 
                    style={{ ...secondaryBtnStyle, padding: '6px 12px', fontSize: '12px', borderColor: '#fecaca', color: '#dc2626' }} 
                    onClick={() => setContentImage(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button 
              style={{ ...primaryBtnStyle, width: '100%', padding: '14px', opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} 
              onClick={generateText} 
              disabled={isGenerating.text || isAiLimitReached}
            >
              {isGenerating.text ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Writing Copy...</>
              ) : (
                <><FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#f97316' }} /> Generate Copy</>
              )}
            </button>
          </div>

          {/* RIGHT: GENERATED RESULT */}
          <div style={{ ...bentoCardStyle, flex: '1.2 1 360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Generated Output</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Ready to copy and paste into your website</p>
              </div>
            </div>

            <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', minHeight: '260px', whiteSpace: 'pre-wrap', color: generatedContent ? '#0f172a' : '#64748b', fontSize: '14px', lineHeight: '1.7', fontWeight: generatedContent ? '500' : '400' }}>
              {isGenerating.text ? 'AI is drafting your content...' : generatedContent || 'Your AI-written text will appear here once generated.'}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* THE UNIFIED CUSTOM POPUP MODAL                            */}
      {/* ========================================================= */}
      {modal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', padding: '28px 24px', textAlign: 'center' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {modal.type === 'alert' ? (
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ea580c' }} />
                ) : (
                  <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#4f46e5' }} />
                )}
                {modal.title}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            {/* Modal Body: Alert */}
            {modal.type === 'alert' && (
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px', textAlign: 'left' }}>{modal.message}</p>
            )}

            {/* Modal Body: Confirm Name */}
            {modal.type === 'confirmName' && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.6px', marginBottom: '8px' }}>Suggested Brand Name</div>
                <h2 style={{ margin: '0 0 14px 0', fontSize: '28px', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>{modal.payload.name}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: modal.payload.status === 'available' ? '#ecfdf5' : '#fef2f2', color: modal.payload.status === 'available' ? '#059669' : '#dc2626', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  <FontAwesomeIcon icon={faGlobe} /> {modal.payload.domain} ({modal.payload.status})
                </div>
              </div>
            )}

            {/* Modal Body: Confirm Slogan */}
            {modal.type === 'confirmSlogan' && (
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#4f46e5', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.6px', marginBottom: '10px' }}>Suggested Tagline</div>
                <p style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '700', lineHeight: '1.4' }}>"{modal.payload.slogan}"</p>
              </div>
            )}

            {/* Modal Body: Confirm Logo */}
            {modal.type === 'confirmLogo' && (
              <div style={{ background: primaryColor, borderRadius: '12px', padding: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '160px', marginBottom: '24px' }}>
                <img src={modal.payload.logo} alt="Preview" style={{ maxHeight: '130px', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {modal.type !== 'alert' && (
                <button onClick={closeModal} style={{ ...secondaryBtnStyle, flex: 1, padding: '14px' }}>
                  Discard
                </button>
              )}
              <button onClick={modal.type === 'alert' ? closeModal : confirmModalAction} style={{ ...primaryBtnStyle, flex: 1, padding: '14px' }}>
                {modal.type === 'alert' ? 'Got It' : <><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} /> Apply to Brand</>}
              </button>
            </div>
            
          </div>
        </div>
      )}

    </section>
  );
};

export default Branding;