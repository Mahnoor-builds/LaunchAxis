import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faPalette, faUpload, faWandMagicSparkles, 
  faImage, faFont, faBuilding, faFileSignature, faDesktop, faPenNib,
  faGlobe, faSpinner, faCheckCircle, faTimesCircle, faLightbulb, faEye, faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';

const Branding = ({ branding, setBranding }) => {
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
    if (branding.name) {
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

  return (
    <div className="section active">
      {/* HEADER WITH TABS */}
      <div className="header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FontAwesomeIcon icon={faPalette} style={{ color: 'var(--neon-cyan)' }}/>
            Branding Studio
            {/* AI QUOTA BADGE */}
            <span style={{ fontSize: '11px', background: isAiLimitReached ? '#fef2f2' : '#f0fdfa', color: isAiLimitReached ? '#ef4444' : '#0d9488', border: isAiLimitReached ? '1px solid #fecaca' : '1px solid #99f6e4', padding: '4px 10px', borderRadius: '12px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FontAwesomeIcon icon={faRobot} /> {aiUsageCount}/{AI_LIMIT} Prompts Used
            </span>
          </h1>
          <p style={{ color:'var(--text-muted)', margin: 0, fontSize: '14px' }}>
            Configure your brand identity and live styling. Changes auto-sync to your Website and Ledgers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className={`btn ${activeTab === 'studio' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('studio')} style={{ flex: '1 1 auto' }}>Visual Studio</button>
          <button className={`btn ${activeTab === 'content' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('content')} style={{ flex: '1 1 auto' }}>Content Engine</button>
        </div>
      </div>

      {/* ======================================= */}
      {/* TAB 1: VISUAL STUDIO & LIVE BRAND BOARD */}
      {/* ======================================= */}
      {activeTab === 'studio' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
          
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faRobot} style={{ color: 'var(--neon-cyan)' }}/> Core Brand Identity
              </h3>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: '#166534', fontWeight: '800' }}>
                  <FontAwesomeIcon icon={faLightbulb} style={{ marginRight: '6px' }} /> Step 1: Explain Your Business
                </label>
                <input type="text" className="input-neon" style={{ marginBottom: '6px', background: '#fff', borderColor: '#86efac' }} value={nameKeyword} onChange={(e) => setNameKeyword(e.target.value)} placeholder="e.g. organic skincare for men" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Step 2: Business Name</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input className="input-neon" style={{ marginBottom: 0, flex: '1 1 180px' }} value={branding.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter Business Name" />
                  <button className="btn btn-primary" style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: '13px', flex: '1 1 auto', justifyContent: 'center', opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} onClick={generateNameOnly} disabled={isGenerating.name || isAiLimitReached}>
                    {isGenerating.name ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faWandMagicSparkles} /> AI Name</>}
                  </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-dark)', fontWeight: 'bold' }}>Web Domain Availability</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <div style={{ flex: '1 1 200px', position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <FontAwesomeIcon icon={faGlobe} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                    <input 
                     className="input-neon" 
                      style={{ marginBottom: 0, paddingLeft: '35px', width: '100%', background: '#fff', color: '#0f172a' }} 
                      value={domainName} 
                      onChange={(e) => {
                      setDomainName(e.target.value.toLowerCase().replace(/\s+/g, ''));
                      setDomainStatus('idle');
                     }}
                      placeholder="e.g. mycustomidea.store"
                    />
                  </div>
                  <button className="btn btn-outline" style={{ padding: '10px 15px', flex: '1 1 auto', justifyContent: 'center', borderColor: 'var(--text-dark)', color: 'var(--text-dark)', fontSize: '13px' }} onClick={() => checkDomainAvailability()} disabled={domainStatus === 'checking'}>
                    {domainStatus === 'checking' ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Check Domain'}
                  </button>
                </div>
                <div style={{ fontSize: '12px', minHeight: '16px', fontWeight: '600' }}>
                  {domainStatus === 'taken' && <span style={{ color: '#ef4444' }}><FontAwesomeIcon icon={faTimesCircle} /> Taken. Try another name.</span>}
                  {domainStatus === 'available' && <span style={{ color: '#10b981' }}><FontAwesomeIcon icon={faCheckCircle} /> Available! ({domainName})</span>}
                  {domainStatus === 'error' && <span style={{ color: '#f59e0b' }}>Could not connect to domain server.</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Step 3: Brand Tagline</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <input className="input-neon" style={{ marginBottom: 0, flex: '1 1 180px' }} value={branding.slogan || ''} onChange={(e) => handleChange('slogan', e.target.value)} placeholder="Your brand promise..." />
                  <button className="btn btn-outline" style={{ padding: '10px 14px', whiteSpace: 'nowrap', fontSize: '13px', flex: '1 1 auto', justifyContent: 'center', borderColor: 'var(--neon-cyan)', color: 'var(--text-dark)', opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} onClick={generateSloganOnly} disabled={isGenerating.slogan || isAiLimitReached}>
                    {isGenerating.slogan ? <FontAwesomeIcon icon={faSpinner} spin /> : <><FontAwesomeIcon icon={faWandMagicSparkles} /> AI Tagline</>}
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faImage} style={{ color: 'var(--neon-cyan)' }}/> Visual Assets
              </h3>

              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Brand Primary Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <input type="color" value={primaryColor} onChange={(e) => handleChange('color', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                <span style={{ fontFamily: 'monospace', color: 'var(--text-dark)' }}>{primaryColor.toUpperCase()}</span>
              </div>

              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Typography Style</label>
              <select className="input-neon" value={branding.font || 'sans-serif'} onChange={(e) => handleChange('font', e.target.value)}>
                <option value="'Inter', sans-serif">Modern Sans-Serif (Inter)</option>
                <option value="'Playfair Display', serif">Luxury Serif (Playfair)</option>
                <option value="'Space Grotesk', sans-serif">Tech / Geometric (Space Grotesk)</option>
              </select>

              <hr style={{ borderColor: '#e2e8f0', margin: '20px 0' }} />

              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>Brand Logo</label>
              <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} />
              <button className="btn btn-outline" style={{ width: '100%', marginBottom: '15px', justifyContent: 'center' }} onClick={() => logoInputRef.current.click()}>
                <FontAwesomeIcon icon={faUpload} /> Upload Custom Logo (PNG/JPG)
              </button>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dark)', fontWeight: '700' }}>✨ AI Brand Logo Engine</label>
                <input type="text" className="input-neon" style={{ marginBottom: '10px', fontSize: '12px', background: '#fff' }} placeholder="Optional: Describe symbol..." value={logoPrompt} onChange={(e) => setLogoPrompt(e.target.value)} />
                <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '13px', justifyContent: 'center', opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} onClick={generateLogo} disabled={isGenerating.logo || isAiLimitReached}>
                  {isGenerating.logo ? 'Designing Brand Logo...' : <><FontAwesomeIcon icon={faWandMagicSparkles} /> Generate Brand Logo</>}
                </button>
              </div>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faBuilding} style={{ color: 'var(--neon-cyan)' }}/> Official Profile
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>These details appear on official Financial Ledgers and invoices.</p>
              
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}><FontAwesomeIcon icon={faFileSignature} style={{ marginRight: '5px' }}/> Authorized Signatory Name</label>
              <input className="input-neon" value={branding.signatory?.name || ''} onChange={(e) => handleSignatoryChange('name', e.target.value)} placeholder="Full Name" />

              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Signatory Title</label>
              <input className="input-neon" value={branding.signatory?.role || ''} onChange={(e) => handleSignatoryChange('role', e.target.value)} placeholder="e.g. CEO, Founder" />
            </div>
          </div>

          <div style={{ flex: '1.2 1 320px', position: 'sticky', top: '20px' }}>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '15px', paddingLeft: '5px' }}>Live Brand Kit Preview</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: branding.font || 'sans-serif' }}>
              <div style={{ background: primaryColor, borderRadius: '12px', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', color: '#fff', textAlign: 'center' }}>
                {branding.logo ? (
                  <img src={branding.logo} alt="Logo" style={{ maxHeight: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                ) : (
                  <FontAwesomeIcon icon={faImage} style={{ fontSize: '48px', opacity: 0.5, marginBottom: '10px' }} />
                )}
                <h1 style={{ margin: '15px 0 5px 0', fontSize: '32px', letterSpacing: '1px', wordBreak: 'break-word' }}>{branding.name || 'Brand Name'}</h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', fontStyle: 'italic' }}>{branding.slogan || 'Your professional tagline appears here'}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}><FontAwesomeIcon icon={faFont} /> Typography</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', color: 'var(--text-dark)' }}>
                    <span style={{ fontSize: '36px', fontWeight: 'bold' }}>Aa</span><span style={{ fontSize: '20px' }}>Bb</span>
                  </div>
                  <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>{branding.font ? branding.font.split(',')[0].replace(/'/g, '') : 'System Default'}</div>
                </div>

                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Palette</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: primaryColor, border: '2px solid #fff' }}></div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0f172a', border: '2px solid #334155' }}></div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f8fafc' }}></div>
                  </div>
                  <div style={{ marginTop: '15px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>{primaryColor.toUpperCase()}</div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}><FontAwesomeIcon icon={faDesktop} /> Digital Application</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: '#f1f5f9', padding: '8px 12px', display: 'flex', gap: '6px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                  </div>
                  <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {branding.logo && <img src={branding.logo} alt="Logo" style={{ height: '20px' }} />}
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-dark)' }}>{branding.name || 'Brand'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}><div style={{ width: '30px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}></div><div style={{ width: '30px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}></div></div>
                  </div>
                  <div style={{ padding: '30px 15px', textAlign: 'center', background: '#f8fafc' }}>
                    <div style={{ width: '60%', height: '12px', background: '#cbd5e1', margin: '0 auto 10px auto', borderRadius: '6px' }}></div>
                    <div style={{ width: '40%', height: '8px', background: '#e2e8f0', margin: '0 auto 20px auto', borderRadius: '4px' }}></div>
                    <button style={{ background: primaryColor, color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Call to Action</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 2: AI CONTENT ENGINE                */}
      {/* ======================================= */}
      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <div className="card" style={{ flex: '1 1 320px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-dark)' }}><FontAwesomeIcon icon={faPenNib} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}/> AI Content Writer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Generate SEO descriptions, policies, or upload a product photo.</p>
            
            <textarea className="input-neon" style={{ height: '100px', resize: 'none', marginBottom: '15px' }} placeholder="e.g. Write a strict privacy policy..." value={contentPrompt} onChange={(e) => setContentPrompt(e.target.value)} />

            <div style={{ marginBottom: '20px' }}>
              <input type="file" accept="image/*" ref={contentImageRef} onChange={handleContentImageUpload} style={{ display: 'none' }} />
              {!contentImage ? (
                <button className="btn btn-outline" style={{ width: '100%', fontSize: '13px', padding: '10px', justifyContent: 'center' }} onClick={() => contentImageRef.current.click()}><FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} /> Upload Reference Image</button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                  <img src={contentImage} alt="Reference" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-dark)', flex: '1 1 100px', fontWeight: '500' }}>Image ready for AI</span>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => setContentImage(null)}>Remove</button>
                </div>
              )}
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', justifyContent: 'center', opacity: isAiLimitReached ? 0.6 : 1, cursor: isAiLimitReached ? 'not-allowed' : 'pointer' }} onClick={generateText} disabled={isGenerating.text || isAiLimitReached}>
              {isGenerating.text ? 'Drafting Content...' : <><FontAwesomeIcon icon={faWandMagicSparkles} /> Generate Text</>}
            </button>
          </div>

          <div className="card" style={{ flex: '1 1 320px' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>Result Output</h3>
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '250px', whiteSpace: 'pre-wrap', color: generatedContent ? 'var(--text-dark)' : 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
              {isGenerating.text ? <span className="blink">AI is writing...</span> : generatedContent || 'Your AI-generated content will appear here.'}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* THE UNIFIED CUSTOM POPUP MODAL          */}
      {/* ======================================= */}
      {modal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', padding: '30px 24px', textAlign: 'center' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                {modal.type === 'alert' && <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ef4444', marginRight: '8px' }} />}
                {modal.title}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#0f172a'} onMouseOut={(e) => e.target.style.color = '#64748b'}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            {/* Modal Body: Alert */}
            {modal.type === 'alert' && (
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>{modal.message}</p>
            )}

            {/* Modal Body: Confirm Name */}
            {modal.type === 'confirmName' && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '8px' }}>Generated Brand Name</div>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '28px', color: '#0f172a', letterSpacing: '-0.5px' }}>{modal.payload.name}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: modal.payload.status === 'available' ? '#ecfdf5' : '#fef2f2', color: modal.payload.status === 'available' ? '#059669' : '#dc2626', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                  <FontAwesomeIcon icon={faGlobe} /> {modal.payload.domain} ({modal.payload.status})
                </div>
              </div>
            )}

            {/* Modal Body: Confirm Slogan */}
            {modal.type === 'confirmSlogan' && (
              <div style={{ background: '#f0fdfa', border: '1px dashed #5eead4', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#0d9488', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '12px' }}>Generated Tagline</div>
                <p style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '600', fontStyle: 'italic', lineHeight: '1.4' }}>"{modal.payload.slogan}"</p>
              </div>
            )}

            {/* Modal Body: Confirm Logo */}
            {modal.type === 'confirmLogo' && (
              <div style={{ background: primaryColor, borderRadius: '12px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '180px', marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                <img src={modal.payload.logo} alt="Preview" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '12px', flexDirection: modal.type === 'alert' ? 'column' : 'row' }}>
              {modal.type !== 'alert' && (
                <button onClick={closeModal} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#e2e8f0'} onMouseOut={(e) => e.target.style.background = '#f1f5f9'}>
                  Discard
                </button>
              )}
              <button onClick={modal.type === 'alert' ? closeModal : confirmModalAction} style={{ flex: 1, padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                {modal.type === 'alert' ? 'Got it' : <><FontAwesomeIcon icon={faCheckCircle} /> Apply to Dashboard</>}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default Branding;