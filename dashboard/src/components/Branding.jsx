import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faPalette, faUpload, faWandMagicSparkles, 
  faImage, faFont, faBuilding, faFileSignature, faDesktop, faPenNib
} from '@fortawesome/free-solid-svg-icons';

const Branding = ({ branding, setBranding }) => {
  const [activeTab, setActiveTab] = useState('studio'); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Refs for file uploads
  const logoInputRef = useRef(null);
  const contentImageRef = useRef(null);

  // AI Prompt States for the generators
  const [aiPrompts, setAiPrompts] = useState({ name: '', logo: '' });
  
  // Content Engine States
  const [contentPrompt, setContentPrompt] = useState('');
  const [contentImage, setContentImage] = useState(null); // NEW: Vision AI Image State
  const [generatedContent, setGeneratedContent] = useState('');

  // Default color if none selected
  const primaryColor = branding.color || '#2dd4bf';

  // ==============================
  // 1. INPUT HANDLERS
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
      const imageUrl = URL.createObjectURL(file);
      setBranding(prev => ({ ...prev, logo: imageUrl }));
    }
  };

  const handleContentImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContentImage(URL.createObjectURL(file));
    }
  };

  const removeContentImage = () => setContentImage(null);

  // ==============================
  // 2. AI GENERATORS (Simulated)
  // ==============================
  const generateIdentity = () => {
    if (!aiPrompts.name) return alert("Enter a keyword first!");
    setIsGenerating(true);
    setTimeout(() => {
      setBranding(prev => ({ 
        ...prev, 
        name: `${aiPrompts.name} Nexus`, 
        slogan: `Redefining the future of ${aiPrompts.name}.` 
      }));
      setIsGenerating(false);
    }, 1500);
  };

  const generateLogo = () => {
    if (!aiPrompts.logo) return alert("Describe your logo!");
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("AI Logo Generation triggered! (Connect your AI Image API here to set branding.logo)");
    }, 1500);
  };

  const generateText = () => {
    if(!contentPrompt && !contentImage) return alert("Please enter instructions or upload an image!");
    setIsGenerating(true);
    setTimeout(() => {
      const imageNotice = contentImage ? "[Vision AI analyzed the uploaded product image.]\n\n" : "";
      setGeneratedContent(`[AI GENERATED DRAFT]\n\n${imageNotice}Here is a highly optimized, professional text block regarding your request for ${branding.name || 'your business'}. We utilize cutting-edge methodology to ensure privacy, efficiency, and maximum conversion rates.\n\n(This text is a placeholder for your future AI API connection)`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="section active">
      {/* HEADER WITH TABS */}
      <div className="header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: '0 0 4px 0', color: 'var(--text-dark)', fontSize: '24px' }}>
            <FontAwesomeIcon icon={faPalette} style={{ color: 'var(--neon-cyan)', marginRight: '10px' }}/>
            Branding Studio
          </h1>
          <p style={{ color:'var(--text-muted)', margin: 0 }}>
            Configure your brand identity and live styling. Changes auto-sync to your Website and Ledgers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
            <button 
                className={`btn ${activeTab === 'studio' ? 'btn-primary' : 'btn-outline'}`} 
                onClick={() => setActiveTab('studio')}
            >
                Visual Studio
            </button>
            <button 
                className={`btn ${activeTab === 'content' ? 'btn-primary' : 'btn-outline'}`} 
                onClick={() => setActiveTab('content')}
            >
                Content Engine
            </button>
        </div>
      </div>

      {/* ======================================= */}
      {/* TAB 1: VISUAL STUDIO & LIVE BRAND BOARD */}
      {/* ======================================= */}
      {activeTab === 'studio' && (
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.2fr', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: THE CONTROL ENGINE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. CORE IDENTITY CARD */}
                <div className="card">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faRobot} style={{ color: 'var(--neon-cyan)' }}/> Core Identity
                    </h3>
                    
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Business Name</label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input className="input-neon" style={{ marginBottom: 0, flex: 1 }} value={branding.name || ''} onChange={(e) => handleChange('name', e.target.value)} placeholder="Enter Name" />
                    </div>

                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Tagline / Slogan</label>
                    <input className="input-neon" style={{ marginBottom: '15px' }} value={branding.slogan || ''} onChange={(e) => handleChange('slogan', e.target.value)} placeholder="Your brand promise..." />

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dark)', fontWeight: 'bold' }}>✨ Or Auto-Generate with AI</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input className="input-neon" style={{ marginBottom: 0, flex: 1, padding: '8px' }} placeholder="E.g. Eco Friendly Shoes" value={aiPrompts.name} onChange={(e) => setAiPrompts({...aiPrompts, name: e.target.value})} />
                            <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={generateIdentity} disabled={isGenerating}>
                                {isGenerating ? '...' : <FontAwesomeIcon icon={faWandMagicSparkles} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. VISUAL ASSETS CARD */}
                <div className="card">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faImage} style={{ color: 'var(--neon-cyan)' }}/> Visual Assets
                    </h3>

                    {/* THEME COLOR */}
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Brand Primary Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <input type="color" value={primaryColor} onChange={(e) => handleChange('color', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                        <span style={{ fontFamily: 'monospace', color: 'var(--text-dark)' }}>{primaryColor.toUpperCase()}</span>
                    </div>

                    {/* FONT SELECTION */}
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Typography Style</label>
                    <select className="input-neon" value={branding.font || 'sans-serif'} onChange={(e) => handleChange('font', e.target.value)}>
                        <option value="'Inter', sans-serif">Modern Sans-Serif (Inter)</option>
                        <option value="'Playfair Display', serif">Luxury Serif (Playfair)</option>
                        <option value="'Space Grotesk', sans-serif">Tech / Geometric (Space Grotesk)</option>
                    </select>

                    <hr style={{ borderColor: '#e2e8f0', margin: '20px 0' }} />

                    {/* LOGO ENGINE */}
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>Brand Logo</label>
                    <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} style={{ display: 'none' }} />
                    <button className="btn btn-outline" style={{ width: '100%', marginBottom: '15px' }} onClick={() => logoInputRef.current.click()}>
                        <FontAwesomeIcon icon={faUpload} /> Upload Custom Logo (PNG/JPG)
                    </button>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px dashed #cbd5e1' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dark)', fontWeight: 'bold' }}>✨ Or Auto-Generate with AI</label>
                        <textarea className="input-neon" style={{ height: '60px', resize: 'none', marginBottom: '10px', padding: '8px' }} placeholder="Describe your perfect logo..." value={aiPrompts.logo} onChange={(e) => setAiPrompts({...aiPrompts, logo: e.target.value})} />
                        <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }} onClick={generateLogo}>Generate Concept</button>
                    </div>
                </div>

                {/* 3. OFFICIAL COMPANY PROFILE (For Finance) */}
                <div className="card">
                    <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faBuilding} style={{ color: 'var(--neon-cyan)' }}/> Official Profile
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>These details appear on official Financial Ledgers and invoices.</p>
                    
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <FontAwesomeIcon icon={faFileSignature} style={{ marginRight: '5px' }}/> Authorized Signatory Name
                    </label>
                    <input className="input-neon" value={branding.signatory?.name || ''} onChange={(e) => handleSignatoryChange('name', e.target.value)} placeholder="Full Name" />

                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Signatory Title</label>
                    <input className="input-neon" value={branding.signatory?.role || ''} onChange={(e) => handleSignatoryChange('role', e.target.value)} placeholder="e.g. CEO, Founder, Accounts Manager" />
                </div>

            </div>

            {/* RIGHT COLUMN: LIVE BRAND BOARD */}
            <div style={{ position: 'sticky', top: '20px' }}>
                <h3 style={{ color: 'var(--text-dark)', marginBottom: '15px', paddingLeft: '5px' }}>Live Brand Kit Preview</h3>
                
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gridTemplateRows: 'auto auto auto',
                    gap: '15px', 
                    fontFamily: branding.font || 'sans-serif' 
                }}>
                    
                    {/* BOX 1: HERO LOGO BLOCK */}
                    <div style={{ 
                        gridColumn: 'span 2', 
                        background: primaryColor, 
                        borderRadius: '12px', 
                        padding: '40px 20px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                        {branding.logo ? (
                            <img src={branding.logo} alt="Logo" style={{ maxHeight: '80px', objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
                        ) : (
                            <FontAwesomeIcon icon={faImage} style={{ fontSize: '48px', opacity: 0.5, marginBottom: '10px' }} />
                        )}
                        <h1 style={{ margin: '15px 0 5px 0', fontSize: '32px', letterSpacing: '1px' }}>{branding.name || 'Brand Name'}</h1>
                        <p style={{ margin: 0, opacity: 0.9, fontSize: '14px', fontStyle: 'italic' }}>{branding.slogan || 'Your professional tagline appears here'}</p>
                    </div>

                    {/* BOX 2: TYPOGRAPHY */}
                    <div style={{ 
                        background: '#fff', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            <FontAwesomeIcon icon={faFont} /> Typography
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', color: 'var(--text-dark)' }}>
                            <span style={{ fontSize: '42px', fontWeight: 'bold' }}>Aa</span>
                            <span style={{ fontSize: '24px' }}>Bb</span>
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            {branding.font ? branding.font.split(',')[0].replace(/'/g, '') : 'System Default'}
                        </div>
                    </div>

                    {/* BOX 3: COLOR PALETTE */}
                    <div style={{ 
                        background: '#1e293b', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            Palette
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: primaryColor, border: '2px solid #fff' }}></div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0f172a', border: '2px solid #334155' }}></div>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc' }}></div>
                        </div>
                        <div style={{ marginTop: '15px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>
                            HEX: {primaryColor.toUpperCase()}
                        </div>
                    </div>

                    {/* BOX 4: DIGITAL MOCKUP (UNIVERSAL WIREFRAME) */}
                    <div style={{ 
                        gridColumn: 'span 2', 
                        background: '#fff', 
                        borderRadius: '12px', 
                        padding: '20px', 
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
                            <FontAwesomeIcon icon={faDesktop} /> Digital Application
                        </div>
                        
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ background: '#f1f5f9', padding: '8px 12px', display: 'flex', gap: '6px', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                            </div>
                            <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {branding.logo && <img src={branding.logo} alt="Logo" style={{ height: '20px' }} />}
                                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-dark)' }}>{branding.name || 'Brand'}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <div style={{ width: '30px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                                    <div style={{ width: '30px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}></div>
                                </div>
                            </div>
                            <div style={{ padding: '30px 15px', textAlign: 'center', background: '#f8fafc' }}>
                                <div style={{ width: '60%', height: '12px', background: '#cbd5e1', margin: '0 auto 10px auto', borderRadius: '6px' }}></div>
                                <div style={{ width: '40%', height: '8px', background: '#e2e8f0', margin: '0 auto 20px auto', borderRadius: '4px' }}></div>
                                <button style={{ background: primaryColor, color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                    Call to Action
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          </div>
      )}

      {/* ======================================= */}
      {/* TAB 2: AI CONTENT & VISION ENGINE       */}
      {/* ======================================= */}
      {activeTab === 'content' && (
        <div className="grid-2">
            <div className="card">
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-dark)' }}>
                    <FontAwesomeIcon icon={faPenNib} style={{ color: 'var(--neon-cyan)', marginRight: '8px' }}/> 
                    AI Content & Vision Writer
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                    Generate SEO descriptions, Privacy Policies, or upload a product photo for the AI to analyze and describe.
                </p>
                
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>Instructions</label>
                <textarea 
                    className="input-neon" 
                    style={{ height: '100px', resize: 'none', marginBottom: '15px' }}
                    placeholder="e.g. Write a strict privacy policy... OR upload a photo below and type 'Describe this jacket'"
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                />

                {/* NEW VISION AI IMAGE UPLOAD */}
                <div style={{ marginBottom: '20px' }}>
                    <input type="file" accept="image/*" ref={contentImageRef} onChange={handleContentImageUpload} style={{ display: 'none' }} />
                    
                    {!contentImage ? (
                        <button className="btn btn-outline" style={{ width: '100%', fontSize: '13px', padding: '10px' }} onClick={() => contentImageRef.current.click()}>
                            <FontAwesomeIcon icon={faImage} style={{ marginRight: '8px' }} /> Optional: Upload Reference Image
                        </button>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                            <img src={contentImage} alt="Reference" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-dark)', flex: 1, fontWeight: '500' }}>Image ready for AI Vision</span>
                            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '12px', borderColor: '#ef4444', color: '#ef4444' }} onClick={removeContentImage}>
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '12px' }} 
                    onClick={generateText}
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Drafting Content...' : <><FontAwesomeIcon icon={faWandMagicSparkles} /> Generate Text</>}
                </button>
            </div>

            <div className="card">
                <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)' }}>Result Output</h3>
                <div style={{
                    padding: '20px', 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px', 
                    minHeight: '250px',
                    whiteSpace: 'pre-wrap',
                    color: generatedContent ? 'var(--text-dark)' : 'var(--text-muted)',
                    fontSize: '14px',
                    lineHeight: '1.6'
                }}>
                    {isGenerating ? <span className="blink">AI is writing...</span> : generatedContent || 'Your professional AI-generated content will appear here.'}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Branding;