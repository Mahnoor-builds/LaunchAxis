import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, faPalette, faPenNib, faFingerprint, faWandMagicSparkles, 
  faUpload, faCheckCircle, faRotateRight, faUserTie, faImage 
} from '@fortawesome/free-solid-svg-icons';

const Branding = ({ branding, setBranding }) => {
  const [activeTab, setActiveTab] = useState('identity'); 
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- TAB 1: IDENTITY AI STATES ---
  const [useAiIdentity, setUseAiIdentity] = useState(false);
  const [identityPrompt, setIdentityPrompt] = useState('');
  const [tempIdentity, setTempIdentity] = useState(null); // Stores AI suggestions before confirming

  // --- TAB 2: LOGO STATES ---
  const [logoPrompt, setLogoPrompt] = useState('');
  const [logoStyle, setLogoStyle] = useState('Modern');
  const fileInputRef = useRef(null);

  // --- TAB 3: CONTENT STATES ---
  const [contentPrompt, setContentPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');

  // ==============================
  // 1. IDENTITY LOGIC
  // ==============================
  const generateIdentity = () => {
    if(!identityPrompt) return alert("Please enter a business niche!");
    setIsGenerating(true);
    
    // SIMULATING AI API CALL
    setTimeout(() => {
      const keywords = identityPrompt.split(' ');
      const mainKey = keywords[0] || 'Tech';
      
      setTempIdentity({
        name: `${mainKey} Nexus`,
        slogan: `Redefining ${mainKey} for the Future`,
        industry: identityPrompt
      });
      setIsGenerating(false);
    }, 1500);
  };

  const confirmIdentity = () => {
    if(tempIdentity) {
      setBranding({ ...branding, ...tempIdentity });
      setUseAiIdentity(false); // Switch back to manual view
      setTempIdentity(null);
    }
  };

  const updateOwner = (index, field, value) => {
    const newOwners = [...branding.owners];
    // Ensure the array has enough slots
    if(!newOwners[index]) newOwners[index] = { name: '', role: '' };
    newOwners[index][field] = value;
    setBranding({ ...branding, owners: newOwners });
  };

  // ==============================
  // 2. LOGO LOGIC
  // ==============================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if(file) {
      const imageUrl = URL.createObjectURL(file);
      setBranding({ ...branding, logo: imageUrl }); // Set Global Logo
    }
  };

  const generateLogo = () => {
    if(!logoPrompt) return alert("Describe your logo first!");
    setIsGenerating(true);
    setTimeout(() => {
      // In real app, this brings an image from API. Here we just alert.
      setIsGenerating(false);
      alert(`AI has generated a ${logoStyle} logo for: "${logoPrompt}"\n(Connect API to see image)`);
    }, 2000);
  };

  // ==============================
  // 3. CONTENT LOGIC
  // ==============================
  const generateText = () => {
    if(!contentPrompt) return alert("What should I write?");
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedContent(`[AI GENERATED DRAFT]\n\nSubject: ${contentPrompt}\n\nHere is a professional draft regarding "${contentPrompt}" for ${branding.name}. We utilize cutting-edge methodology to ensure privacy and efficiency...\n\n(This text is a placeholder for your future API connection)`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="section active">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1><FontAwesomeIcon icon={faRobot} style={{color:'var(--primary)', marginRight:'10px'}}/>Branding Studio</h1>
          <p style={{color:'var(--text-muted)'}}>AI-Powered Identity, Logo & Content Engine</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
            {['identity', 'logo', 'content'].map(tab => (
                <button 
                    key={tab}
                    className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`} 
                    onClick={()=>setActiveTab(tab)}
                    style={{textTransform:'capitalize'}}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* ======================================= */}
      {/* TAB 1: IDENTITY (MANUAL OR AI MODE) */}
      {/* ======================================= */}
      {activeTab === 'identity' && (
        <div className="grid-2">
            {/* LEFT: BUSINESS IDENTITY */}
            <div className="card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                    <h3><FontAwesomeIcon icon={faFingerprint} /> Core Identity</h3>
                    
                    {/* AI TOGGLE */}
                    <label className="switch" style={{display:'flex', alignItems:'center', gap:'10px', fontSize:'12px'}}>
                        <span>Generate with AI</span>
                        <input type="checkbox" checked={useAiIdentity} onChange={()=>setUseAiIdentity(!useAiIdentity)} />
                        <span className="slider"></span>
                    </label>
                </div>

                {/* MODE A: AI GENERATOR */}
                {useAiIdentity ? (
                    <div style={{background:'var(--bg-input)', padding:'20px', borderRadius:'10px', border:'1px dashed var(--primary)'}}>
                        <label>Business Niche / Keyword</label>
                        <div style={{display:'flex', gap:'10px'}}>
                            <input 
                                className="input-neon" 
                                placeholder="e.g. Solar Energy, Coffee Shop, Crypto..."
                                value={identityPrompt} 
                                onChange={(e)=>setIdentityPrompt(e.target.value)} 
                                style={{marginBottom:0}}
                            />
                            <button className="btn btn-primary" onClick={generateIdentity} disabled={isGenerating}>
                                {isGenerating ? '...' : <FontAwesomeIcon icon={faWandMagicSparkles} />}
                            </button>
                        </div>

                        {/* PREVIEW BOX */}
                        {tempIdentity && (
                            <div style={{marginTop:'20px', borderTop:'1px solid var(--border)', paddingTop:'15px'}}>
                                <p style={{fontSize:'12px', color:'var(--text-muted)'}}>AI SUGGESTION:</p>
                                <div style={{fontWeight:'bold', fontSize:'18px', color:'var(--primary)'}}>{tempIdentity.name}</div>
                                <div style={{fontStyle:'italic', color:'var(--text-main)'}}>{tempIdentity.slogan}</div>
                                <div style={{marginTop:'15px', display:'flex', gap:'10px'}}>
                                    <button className="btn btn-outline" style={{flex:1}} onClick={generateIdentity}>
                                        <FontAwesomeIcon icon={faRotateRight} /> Regenerate
                                    </button>
                                    <button className="btn btn-primary" style={{flex:1}} onClick={confirmIdentity}>
                                        <FontAwesomeIcon icon={faCheckCircle} /> Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* MODE B: MANUAL INPUTS */
                    <>
                        <label>Business Name</label>
                        <input className="input-neon" value={branding.name} onChange={(e) => setBranding({...branding, name:e.target.value})} />

                        <label>Tagline / Slogan</label>
                        <input className="input-neon" value={branding.slogan || ''} onChange={(e) => setBranding({...branding, slogan:e.target.value})} />

                        <label>Industry Category</label>
                        <input className="input-neon" value={branding.industry || ''} onChange={(e) => setBranding({...branding, industry:e.target.value})} />
                    </>
                )}
            </div>

            {/* RIGHT: OWNER DETAILS */}
            <div className="card">
                <h3><FontAwesomeIcon icon={faUserTie} /> Leadership Team</h3>
                <p style={{fontSize:'13px', color:'var(--text-muted)'}}>These details appear on official Financial Ledgers.</p>
                
                {/* FOUNDER (Required) */}
                <label style={{color:'var(--primary)'}}>Founder (Required)</label>
                <input 
                    className="input-neon" 
                    placeholder="Full Name"
                    value={branding.owners[0]?.name || ''} 
                    onChange={(e) => updateOwner(0, 'name', e.target.value)} 
                />

                {/* CEO (Optional) */}
                <label>CEO <span style={{fontSize:'10px', color:'var(--text-muted)'}}>(Optional)</span></label>
                <input 
                    className="input-neon" 
                    placeholder="Full Name"
                    value={branding.owners[1]?.name || ''} 
                    onChange={(e) => {
                        updateOwner(1, 'name', e.target.value);
                        updateOwner(1, 'role', 'CEO');
                    }} 
                />

                {/* MANAGER (Optional) */}
                <label>Accounts Manager <span style={{fontSize:'10px', color:'var(--text-muted)'}}>(Optional)</span></label>
                <input 
                    className="input-neon" 
                    placeholder="Full Name"
                    value={branding.owners[2]?.name || ''} 
                    onChange={(e) => {
                        updateOwner(2, 'name', e.target.value);
                        updateOwner(2, 'role', 'Manager');
                    }} 
                />
            </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 2: LOGO STUDIO (PROMPT OR UPLOAD) */}
      {/* ======================================= */}
      {activeTab === 'logo' && (
        <div className="grid-2">
            <div className="card">
                <h3><FontAwesomeIcon icon={faPalette} /> Design Studio</h3>
                
                {/* UPLOAD OPTION */}
                <div style={{background:'var(--bg-input)', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
                    <label style={{marginTop:0}}>Upload Custom Logo</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        style={{display:'none'}} 
                    />
                    <button className="btn btn-outline" style={{width:'100%'}} onClick={()=>fileInputRef.current.click()}>
                        <FontAwesomeIcon icon={faUpload} /> Choose File from PC
                    </button>
                </div>

                <hr style={{borderColor:'var(--border)', margin:'20px 0'}} />

                {/* AI PROMPT OPTION */}
                <label>Or Generate with AI Prompt</label>
                <textarea 
                    className="input-neon" 
                    placeholder="e.g. A blue eagle holding a lightning bolt, minimalist style..."
                    style={{height:'80px', resize:'none'}}
                    value={logoPrompt}
                    onChange={(e)=>setLogoPrompt(e.target.value)}
                />

                <label>Theme Template</label>
                <select className="select-neon" value={logoStyle} onChange={(e)=>setLogoStyle(e.target.value)}>
                    <option value="Minimalist">Minimalist (Clean)</option>
                    <option value="Luxury">Luxury (Serif/Gold)</option>
                    <option value="Tech">Tech / Cyber (Neon)</option>
                    <option value="Vintage">Vintage / Retro</option>
                </select>

                <button className="btn btn-primary" style={{width:'100%'}} onClick={generateLogo} disabled={isGenerating}>
                    {isGenerating ? 'Designing...' : 'Generate AI Logo'} <FontAwesomeIcon icon={faWandMagicSparkles} />
                </button>
            </div>

            {/* PREVIEW AREA */}
            <div className="card" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'300px', background:'#0f172a'}}>
                <div style={{textAlign:'center'}}>
                    {branding.logo ? (
                        /* SHOW UPLOADED IMAGE */
                        <img 
                            src={branding.logo} 
                            alt="Brand Logo" 
                            style={{maxWidth:'150px', maxHeight:'150px', borderRadius:'10px', boxShadow:'0 0 20px rgba(45,212,191,0.3)'}} 
                        />
                    ) : (
                        /* SHOW PLACEHOLDER */
                        <div style={{fontSize:'80px', color:'var(--text-muted)', opacity:0.3}}>
                            <FontAwesomeIcon icon={faImage} />
                            <p style={{fontSize:'14px'}}>No Logo Selected</p>
                        </div>
                    )}
                    
                    <h2 style={{marginTop:'20px', textTransform:'uppercase', letterSpacing:'2px'}}>
                        {branding.name}
                    </h2>
                </div>
            </div>
        </div>
      )}

      {/* ======================================= */}
      {/* TAB 3: CONTENT ENGINE (UNIVERSAL) */}
      {/* ======================================= */}
      {activeTab === 'content' && (
        <div className="grid-2">
            <div className="card">
                <h3><FontAwesomeIcon icon={faPenNib} /> AI Content Writer</h3>
                <p style={{color:'var(--text-muted)', fontSize:'13px'}}>Generate Descriptions, Privacy Policies, About Us text, etc.</p>
                
                <label>What do you need written?</label>
                <textarea 
                    className="input-neon" 
                    style={{height:'120px', resize:'none'}}
                    placeholder="e.g. Write a privacy policy for my real estate website..."
                    value={contentPrompt}
                    onChange={(e) => setContentPrompt(e.target.value)}
                />
                <button 
                    className="btn btn-primary" 
                    style={{width:'100%'}} 
                    onClick={generateText}
                    disabled={isGenerating}
                >
                    <FontAwesomeIcon icon={faWandMagicSparkles} /> Generate Text
                </button>
            </div>

            <div className="card">
                <h3>Result Output</h3>
                <div style={{
                    padding:'20px', 
                    background:'var(--bg-input)', 
                    borderRadius:'8px', 
                    minHeight:'200px',
                    whiteSpace: 'pre-wrap',
                    color: generatedContent ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '14px',
                    lineHeight: '1.6'
                }}>
                    {isGenerating ? <span className="blink">AI is writing...</span> : generatedContent || 'Your professional content will appear here.'}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Branding;