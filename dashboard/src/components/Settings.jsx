import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserShield, faBuilding, faEnvelopeOpenText, faScaleBalanced, 
  faCreditCard, faGears, faSave, faDownload, faToggleOn, 
  faToggleOff, faKey, faWandMagicSparkles, faGlobe, faShieldAlt,
  faCheckCircle, faTriangleExclamation, faTimesCircle, faSpinner,
  faTruckFast, faPhone, faLocationDot, faIdCard, faCoins
} from '@fortawesome/free-solid-svg-icons';

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

const Settings = ({ branding = {}, siteConfig = {}, setSiteConfig }) => {
  // Dynamically detect service vs ecommerce from branding, with optional prop override
  const isService = branding?.industry === 'service';

  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authEmail, setAuthEmail] = useState('');

  // Custom UI Modal (Replaces browser alert & confirm)
  const [uiModal, setUiModal] = useState({ isOpen: false, type: 'alert', title: '', message: '' });
  const showModal = (type, title, message) => setUiModal({ isOpen: true, type, title, message });
  const closeModal = () => setUiModal({ isOpen: false, type: 'alert', title: '', message: '' });

  const [settings, setSettings] = useState({
    profile: { fullName: '' },
    businessProfile: { registeredName: '', ntnNumber: '', billingPhone: '', billingEmail: '', physicalAddress: '', statementFooterNote: '' },
    notifications: { sendOrderConfirmation: true, sendDispatchTracking: true, defaultCourier: 'Trax Logistics', forwardLeadsToEmail: true, leadNotificationEmail: '' },
    policies: { privacyPolicy: '', termsOfService: '', refundPolicy: '', shippingPolicy: '', serviceAgreement: '' },
    operations: { maintenanceMode: false, currency: 'PKR' }
  });

  const [isGeneratingPolicies, setIsGeneratingPolicies] = useState(false);

  // Consistent user key (Matches App.js email key)
  const getUserKey = () => {
    if (auth.currentUser?.email) return auth.currentUser.email;
    const rawMemory = localStorage.getItem("launchAxisTempData");
    if (rawMemory) {
      try { return JSON.parse(rawMemory).email; } catch (e) {}
    }
    return 'ceo@ecosole.store';
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const userKey = getUserKey();
        if (auth.currentUser?.email) {
          setAuthEmail(auth.currentUser.email);
        } else {
          setAuthEmail(userKey);
        }

        const snap = await getDoc(doc(db, "users", userKey));
        if (snap.exists()) {
          const data = snap.data();
          const savedSettings = data.settings || {};
          const savedSitePolicies = data.siteConfig?.policies || siteConfig?.policies || {};

          setSettings(prev => ({
            ...prev,
            ...savedSettings,
            profile: { ...prev.profile, ...(savedSettings.profile || {}) },
            businessProfile: { ...prev.businessProfile, ...(savedSettings.businessProfile || {}) },
            notifications: { ...prev.notifications, ...(savedSettings.notifications || {}) },
            policies: { 
              ...prev.policies, 
              ...savedSitePolicies,
              ...(savedSettings.policies || {}) 
            },
            operations: { ...prev.operations, ...(savedSettings.operations || {}) }
          }));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleNestedChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));

    // Auto-sync policies and support details into siteConfig so live websites update immediately
    if (category === 'policies' && setSiteConfig) {
      setSiteConfig(prev => ({
        ...prev,
        policies: { ...(prev?.policies || {}), [field]: value }
      }));
    }
    if (category === 'businessProfile' && field === 'billingEmail' && setSiteConfig) {
      setSiteConfig(prev => ({ ...prev, supportEmail: value }));
    }
    if (category === 'businessProfile' && field === 'billingPhone' && setSiteConfig) {
      setSiteConfig(prev => ({ ...prev, supportPhone: value }));
    }
    if (category === 'businessProfile' && field === 'physicalAddress' && setSiteConfig) {
      setSiteConfig(prev => ({ ...prev, physicalAddress: value }));
    }
  };

  const handleToggle = (category, field) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: !prev[category][field] }
    }));
  };

  const handleSiteConfigToggle = (field) => {
    if (setSiteConfig) {
      setSiteConfig(prev => ({ ...prev, [field]: !prev[field] }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const userKey = getUserKey();
      const updatedSiteConfig = {
        ...siteConfig,
        policies: {
          ...(siteConfig?.policies || {}),
          ...settings.policies
        },
        supportEmail: settings.businessProfile.billingEmail || siteConfig?.supportEmail || 'help@launchaxis.com',
        supportPhone: settings.businessProfile.billingPhone || siteConfig?.supportPhone || '',
        physicalAddress: settings.businessProfile.physicalAddress || siteConfig?.physicalAddress || ''
      };

      if (setSiteConfig) {
        setSiteConfig(updatedSiteConfig);
      }

      await setDoc(doc(db, "users", userKey), { 
        settings, 
        siteConfig: updatedSiteConfig 
      }, { merge: true });

      showModal('success', 'Configuration Saved', 'Your business settings, automation rules, and website legal policies have been synced to the cloud.');
    } catch (error) {
      showModal('error', 'Save Failed', error.message || 'Could not save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmPasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, authEmail);
      showModal('success', 'Reset Link Sent', `A password reset link has been dispatched to ${authEmail}.`);
    } catch (error) {
      showModal('error', 'Reset Failed', error.message);
    }
  };

  const exportSystemData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, siteConfig }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "LaunchAxis_Workspace_Backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleGeneratePolicies = async () => {
    setIsGeneratingPolicies(true);
    try {
      const companyName = branding?.name && branding.name !== 'Loading...' ? branding.name : (settings.businessProfile.registeredName || 'Our Company');
      const prompt = `You are a corporate legal assistant. Write a clear, professional Privacy Policy, Terms of Service, Shipping & Delivery Policy, Refund & Exchange Policy, and Service Agreement for a company named "${companyName}". Return ONLY a valid raw JSON object without markdown wrappers with exact keys: {"privacyPolicy": "...", "termsOfService": "...", "shippingPolicy": "...", "refundPolicy": "...", "serviceAgreement": "..."}`;

      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const cleanJson = data.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generated = JSON.parse(cleanJson);

      const updatedPolicies = {
        privacyPolicy: generated.privacyPolicy || settings.policies.privacyPolicy,
        termsOfService: generated.termsOfService || settings.policies.termsOfService,
        shippingPolicy: generated.shippingPolicy || settings.policies.shippingPolicy,
        refundPolicy: generated.refundPolicy || settings.policies.refundPolicy,
        serviceAgreement: generated.serviceAgreement || settings.policies.serviceAgreement
      };

      setSettings(prev => ({ ...prev, policies: updatedPolicies }));
      if (setSiteConfig) {
        setSiteConfig(prev => ({ ...prev, policies: updatedPolicies }));
      }

      showModal('success', 'Policies Generated', 'AI has drafted your Privacy, Terms, Shipping, Refund, and Service policies. Review them below and click Save Configuration.');
    } catch (error) {
      showModal('error', 'Generation Failed', 'Could not auto-generate policies right now. You can type or paste your policies manually below.');
    } finally {
      setIsGeneratingPolicies(false);
    }
  };

  // --- REFINED BENTO SAAS STYLES ---
  const bentoCardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    marginBottom: '24px'
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
    marginBottom: '18px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const primaryBtnStyle = {
    padding: '12px 20px',
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
    transition: 'all 0.2s ease'
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
    transition: 'all 0.2s ease'
  };

  const navTabs = [
    { id: 'profile', icon: faUserShield, label: 'Account Profile', color: '#2563eb' },
    { id: 'business', icon: faBuilding, label: 'Business Info', color: '#ea580c' },
    { id: 'policies', icon: faScaleBalanced, label: 'Legal & Shipping Policies', color: '#059669' },
    { id: 'notifications', icon: faEnvelopeOpenText, label: 'Email Alerts', color: '#4f46e5' },
    { id: 'operations', icon: faGlobe, label: 'Site Operations', color: '#2563eb' },
    { id: 'billing', icon: faCreditCard, label: 'Plan & Backup', color: '#ea580c' }
  ];

  const configuredPoliciesCount = Object.values(settings.policies || {}).filter(v => Boolean(v && v.trim())).length;

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>
        <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px', color: '#2563eb' }} /> Loading Workspace Settings...
      </div>
    );
  }

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- 1. TOP HEADER BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#2563eb', display: 'block', marginBottom: '4px' }}>
            System Preferences
          </span>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Workspace Settings
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={exportSystemData} style={secondaryBtnStyle}>
            <FontAwesomeIcon icon={faDownload} style={{ color: '#2563eb' }} /> Export Backup
          </button>
          <button onClick={handleSave} disabled={isSaving} style={primaryBtnStyle}>
            {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} style={{ color: '#10b981' }} />}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>

      {/* --- 2. FOUR KEY SYSTEM STATUS CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Website Status</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: siteConfig?.isPublished ? '#ecfdf5' : '#fff7ed', color: siteConfig?.isPublished ? '#059669' : '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faGlobe} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {siteConfig?.isPublished ? 'Live & Public' : 'Offline Draft'}
          </div>
          <div style={{ fontSize: '12px', color: siteConfig?.isPublished ? '#059669' : '#ea580c', fontWeight: '600' }}>
            {settings.operations.maintenanceMode ? 'Maintenance mode active' : 'Normal operation'}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Legal & Shipping Policies</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faScaleBalanced} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {configuredPoliciesCount} Configured
          </div>
          <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>
            Synced to website footer
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Default Currency</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faCoins} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            {settings.operations.currency || 'PKR'}
          </div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
            Primary ledger currency
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Active Tier</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
            Cadet Plan
          </div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>
            Verified Account
          </div>
        </div>

      </div>

      {/* --- 3. SEGMENTED PILL NAVIGATION BAR --- */}
      <div style={{ background: '#e2e8f0', padding: '5px', borderRadius: '14px', display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '28px' }}>
        {navTabs.map(tab => {
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
      {/* TAB 1: ACCOUNT PROFILE & SECURITY                         */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <div style={{ ...bentoCardStyle, maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Founder Profile & Security</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Manage your login identity and password credentials</p>
            </div>
          </div>

          <label style={labelStyle}><FontAwesomeIcon icon={faIdCard} style={{ color: '#2563eb' }} /> Owner Full Name</label>
          <input 
            type="text" 
            value={settings.profile.fullName} 
            onChange={(e) => handleNestedChange('profile', 'fullName', e.target.value)} 
            style={saasInputStyle} 
            placeholder="e.g. Mahnoor Naveed" 
          />
          
          <label style={labelStyle}><FontAwesomeIcon icon={faEnvelopeOpenText} style={{ color: '#059669' }} /> Registered Account Email (Read-Only)</label>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input 
              type="email" 
              value={authEmail} 
              disabled 
              style={{ ...saasInputStyle, marginBottom: 0, background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed', flex: '1 1 220px' }} 
            />
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '0 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', border: '1px solid #a7f3d0' }}>
              <FontAwesomeIcon icon={faCheckCircle} /> Verified Login
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '15px', fontWeight: '800' }}>Password Reset</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Send a secure password reset link directly to your registered email inbox.</p>
            </div>
            <button onClick={() => showModal('confirmReset', 'Reset Password?', `Send a password reset link to ${authEmail}?`)} style={secondaryBtnStyle}>
              <FontAwesomeIcon icon={faKey} style={{ color: '#ea580c' }} /> Send Reset Email
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: BUSINESS ENTITY & CONTACT DETAILS                  */}
      {/* ========================================================= */}
      {activeTab === 'business' && (
        <div style={{ ...bentoCardStyle, maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Official Business Entity</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Displayed on your website footer, customer support links, and PDF statements</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 240px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faBuilding} style={{ color: '#2563eb' }} /> Registered Business Name</label>
              <input type="text" value={settings.businessProfile.registeredName} onChange={(e) => handleNestedChange('businessProfile', 'registeredName', e.target.value)} style={saasInputStyle} placeholder={branding?.name || 'Company Name'} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faIdCard} style={{ color: '#4f46e5' }} /> Tax / NTN Number (Optional)</label>
              <input type="text" value={settings.businessProfile.ntnNumber} onChange={(e) => handleNestedChange('businessProfile', 'ntnNumber', e.target.value)} style={saasInputStyle} placeholder="e.g. 1234567-8" />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faPhone} style={{ color: '#059669' }} /> Customer Support Phone</label>
              <input type="text" value={settings.businessProfile.billingPhone} onChange={(e) => handleNestedChange('businessProfile', 'billingPhone', e.target.value)} style={saasInputStyle} placeholder="+92 300 1234567" />
            </div>
            <div style={{ flex: '1 1 220px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faEnvelopeOpenText} style={{ color: '#ea580c' }} /> Customer Support Email</label>
              <input type="email" value={settings.businessProfile.billingEmail} onChange={(e) => handleNestedChange('businessProfile', 'billingEmail', e.target.value)} style={saasInputStyle} placeholder="support@yourbrand.com" />
            </div>
          </div>

          <label style={labelStyle}><FontAwesomeIcon icon={faLocationDot} style={{ color: '#dc2626' }} /> Official Office / Warehouse Address</label>
          <textarea rows="2" value={settings.businessProfile.physicalAddress} onChange={(e) => handleNestedChange('businessProfile', 'physicalAddress', e.target.value)} style={{ ...saasInputStyle, resize: 'vertical', marginBottom: 0 }} placeholder="Street address, City, Country" />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: LEGAL, SHIPPING & REFUND POLICIES                  */}
      {/* ========================================================= */}
      {activeTab === 'policies' && (
        <div style={{ ...bentoCardStyle, maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Website Legal & Shipping Policies</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Automatically linked in your website footer and product modals</p>
              </div>
            </div>

            <button onClick={handleGeneratePolicies} disabled={isGeneratingPolicies} style={{ ...secondaryBtnStyle, background: '#f8fafc' }}>
              <FontAwesomeIcon icon={isGeneratingPolicies ? faSpinner : faWandMagicSparkles} spin={isGeneratingPolicies} style={{ color: '#4f46e5' }} />
              {isGeneratingPolicies ? 'Drafting Policies...' : 'Auto-Draft All Policies with AI'}
            </button>
          </div>

          <label style={labelStyle}><FontAwesomeIcon icon={faTruckFast} style={{ color: '#ea580c' }} /> Shipping & Delivery Policy</label>
          <textarea 
            rows="4" 
            value={settings.policies.shippingPolicy || ''} 
            onChange={(e) => handleNestedChange('policies', 'shippingPolicy', e.target.value)} 
            style={{ ...saasInputStyle, resize: 'vertical', lineHeight: '1.5' }} 
            placeholder="Explain your delivery timelines (e.g. 2-4 business days), courier partners, Cash on Delivery rules, and free shipping thresholds..." 
          />

          <label style={labelStyle}><FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#059669' }} /> Refund, Return & Exchange Policy</label>
          <textarea 
            rows="4" 
            value={settings.policies.refundPolicy || ''} 
            onChange={(e) => handleNestedChange('policies', 'refundPolicy', e.target.value)} 
            style={{ ...saasInputStyle, resize: 'vertical', lineHeight: '1.5' }} 
            placeholder="Detail your return window (e.g. 7-day easy exchange), condition requirements, and refund process..." 
          />

          <label style={labelStyle}><FontAwesomeIcon icon={faBuilding} style={{ color: '#4f46e5' }} /> Service & Cancellation Agreement (For Service / Agency Clients)</label>
          <textarea 
            rows="4" 
            value={settings.policies.serviceAgreement || ''} 
            onChange={(e) => handleNestedChange('policies', 'serviceAgreement', e.target.value)} 
            style={{ ...saasInputStyle, resize: 'vertical', lineHeight: '1.5' }} 
            placeholder="Outline project milestones, revision limits, and consultation terms..." 
          />

          <label style={labelStyle}><FontAwesomeIcon icon={faShieldAlt} style={{ color: '#2563eb' }} /> Privacy Policy</label>
          <textarea 
            rows="4" 
            value={settings.policies.privacyPolicy || ''} 
            onChange={(e) => handleNestedChange('policies', 'privacyPolicy', e.target.value)} 
            style={{ ...saasInputStyle, resize: 'vertical', lineHeight: '1.5' }} 
            placeholder="Explain how customer names, phone numbers, and addresses are protected..." 
          />

          <label style={labelStyle}><FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#334155' }} /> Terms of Service</label>
          <textarea 
            rows="4" 
            value={settings.policies.termsOfService || ''} 
            onChange={(e) => handleNestedChange('policies', 'termsOfService', e.target.value)} 
            style={{ ...saasInputStyle, resize: 'vertical', lineHeight: '1.5', marginBottom: 0 }} 
            placeholder="Standard terms governing the use of your website and offerings..." 
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: EMAIL AUTOMATION                                   */}
      {/* ========================================================= */}
      {activeTab === 'notifications' && (
        <div style={{ ...bentoCardStyle, maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faEnvelopeOpenText} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Customer & Lead Notifications</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Configure automated alerts for orders and client inquiries</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>Forward Client Leads to Email</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Send an instant alert when a visitor submits your website contact form.</div>
              </div>
              <FontAwesomeIcon icon={settings.notifications.forwardLeadsToEmail ? faToggleOn : faToggleOff} style={{ fontSize: '26px', cursor: 'pointer', color: settings.notifications.forwardLeadsToEmail ? '#059669' : '#cbd5e1' }} onClick={() => handleToggle('notifications', 'forwardLeadsToEmail')} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>Order Confirmation Receipts</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Send customers an automated order summary upon checkout.</div>
              </div>
              <FontAwesomeIcon icon={settings.notifications.sendOrderConfirmation ? faToggleOn : faToggleOff} style={{ fontSize: '26px', cursor: 'pointer', color: settings.notifications.sendOrderConfirmation ? '#059669' : '#cbd5e1' }} onClick={() => handleToggle('notifications', 'sendOrderConfirmation')} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '12px' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>Courier Dispatch Alerts</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Notify buyers when their order is marked shipped with a tracking ID.</div>
              </div>
              <FontAwesomeIcon icon={settings.notifications.sendDispatchTracking ? faToggleOn : faToggleOff} style={{ fontSize: '26px', cursor: 'pointer', color: settings.notifications.sendDispatchTracking ? '#059669' : '#cbd5e1' }} onClick={() => handleToggle('notifications', 'sendDispatchTracking')} />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 220px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faEnvelopeOpenText} style={{ color: '#2563eb' }} /> Alert Destination Email</label>
              <input type="email" value={settings.notifications.leadNotificationEmail} onChange={(e) => handleNestedChange('notifications', 'leadNotificationEmail', e.target.value)} style={{ ...saasInputStyle, marginBottom: 0 }} placeholder={authEmail || 'alerts@yourbrand.com'} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faTruckFast} style={{ color: '#ea580c' }} /> Default Courier Partner</label>
              <select value={settings.notifications.defaultCourier} onChange={(e) => handleNestedChange('notifications', 'defaultCourier', e.target.value)} style={{ ...saasInputStyle, marginBottom: 0 }}>
                <option value="Trax Logistics">Trax Logistics</option>
                <option value="TCS">TCS Express</option>
                <option value="Leopards Courier">Leopards Courier</option>
                <option value="Call Courier">Call Courier</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: WEB OPERATIONS & PUBLISHING                        */}
      {/* ========================================================= */}
      {activeTab === 'operations' && (
        <div style={{ ...bentoCardStyle, maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={faGlobe} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Website Publishing & Currency</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Control your website visibility and store currency</p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: siteConfig?.isPublished ? '#ecfdf5' : '#f8fafc', borderRadius: '12px', border: siteConfig?.isPublished ? '1px solid #a7f3d0' : '1px solid #e2e8f0', marginBottom: '16px', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
                {siteConfig?.isPublished ? 'Website is LIVE & Public' : 'Website is in Draft Mode'}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                Toggle to publish or unpublish your storefront immediately.
              </div>
            </div>
            <FontAwesomeIcon icon={siteConfig?.isPublished ? faToggleOn : faToggleOff} style={{ fontSize: '30px', cursor: 'pointer', color: siteConfig?.isPublished ? '#059669' : '#cbd5e1' }} onClick={() => handleSiteConfigToggle('isPublished')} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>Temporary Maintenance Mode</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Display an updating notice to visitors while making major edits.</div>
            </div>
            <FontAwesomeIcon icon={settings.operations.maintenanceMode ? faToggleOn : faToggleOff} style={{ fontSize: '26px', cursor: 'pointer', color: settings.operations.maintenanceMode ? '#ea580c' : '#cbd5e1' }} onClick={() => handleToggle('operations', 'maintenanceMode')} />
          </div>

          <label style={labelStyle}><FontAwesomeIcon icon={faCoins} style={{ color: '#2563eb' }} /> Primary Store & Ledger Currency</label>
          <select value={settings.operations.currency} onChange={(e) => handleNestedChange('operations', 'currency', e.target.value)} style={{ ...saasInputStyle, marginBottom: 0 }}>
            <option value="PKR">PKR - Pakistani Rupee (Rs)</option>
            <option value="USD">USD - US Dollar ($)</option>
            <option value="EUR">EUR - Euro (€)</option>
          </select>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: PLANS & WORKSPACE BACKUP                           */}
      {/* ========================================================= */}
      {activeTab === 'billing' && (
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ background: '#0f172a', borderRadius: '16px', padding: '32px', color: '#ffffff', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Current Plan
              </span>
              <h2 style={{ fontSize: '28px', margin: '12px 0 6px', fontWeight: '900', color: '#ffffff' }}>Cadet Founder Tier</h2>
              <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                Includes Website Builder, Financial Center (50 monthly entries), and 10 AI Studio generations.
              </p>
            </div>
            <button onClick={exportSystemData} style={{ ...secondaryBtnStyle, background: '#1e293b', color: '#ffffff', borderColor: '#334155' }}>
              <FontAwesomeIcon icon={faDownload} style={{ color: '#38bdf8' }} /> Download JSON Backup
            </button>
          </div>
        </div>
      )}

      {/* --- UNIFIED CUSTOM MODAL --- */}
      {uiModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon 
                  icon={uiModal.type === 'success' ? faCheckCircle : faTriangleExclamation} 
                  style={{ color: uiModal.type === 'success' ? '#059669' : '#ea580c' }} 
                />
                {uiModal.title}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>{uiModal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {uiModal.type === 'confirmReset' ? (
                <>
                  <button onClick={closeModal} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
                  <button onClick={confirmPasswordReset} style={{ ...primaryBtnStyle, flex: 1 }}>Send Email</button>
                </>
              ) : (
                <button onClick={closeModal} style={{ ...primaryBtnStyle, width: '100%' }}>Got It</button>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Settings;