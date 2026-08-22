import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserShield, faBuilding, faEnvelopeOpenText, faScaleBalanced, 
  faCreditCard, faGears, faLock, faSave, faDownload, faToggleOn, 
  faToggleOff, faKey, faCircleExclamation, faWandMagicSparkles,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE SECURITY IMPORTS ---
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebaseConfig';

const Settings = ({ branding, siteConfig, setSiteConfig }) => {
  const isService = true;
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [authEmail, setAuthEmail] = useState('');

  // --- MASTER STATE SCHEMA ---
  const [settings, setSettings] = useState({
    profile: { fullName: '' },
    businessProfile: { registeredName: '', ntnNumber: '', billingPhone: '', billingEmail: '', physicalAddress: '', statementFooterNote: '' },
    notifications: { 
      sendOrderConfirmation: true, sendDispatchTracking: true, defaultCourier: 'Trax Logistics',
      forwardLeadsToEmail: true, leadNotificationEmail: '' // For Services
    },
    policies: { privacyPolicy: '', termsOfService: '', refundPolicy: '', shippingPolicy: '', serviceAgreement: '' },
    operations: { maintenanceMode: false, currency: 'PKR' }
  });

  // --- LOAD SECURE DATA ON MOUNT ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setAuthEmail(user.email);
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          
          if (snap.exists() && snap.data().settings) {
            setSettings(prev => ({
              ...prev,
              ...snap.data().settings,
              profile: { ...prev.profile, ...(snap.data().settings.profile || {}) },
              businessProfile: { ...prev.businessProfile, ...(snap.data().settings.businessProfile || {}) },
              notifications: { ...prev.notifications, ...(snap.data().settings.notifications || {}) },
              policies: { ...prev.policies, ...(snap.data().settings.policies || {}) },
              operations: { ...prev.operations, ...(snap.data().settings.operations || {}) }
            }));
          }
        }
      } catch (error) {
        console.error("Secure fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // --- INPUT HANDLERS ---
  const handleNestedChange = (category, field, value) => {
    setSettings(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const handleToggle = (category, field) => {
    setSettings(prev => ({ ...prev, [category]: { ...prev[category], [field]: !prev[category][field] } }));
  };

  const handleSiteConfigToggle = (field) => {
    setSiteConfig(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // --- SECURE FIREBASE SAVE ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Unauthorized: No active session.");
      
      const userRef = doc(db, "users", user.uid);
      // Save both Settings AND SiteConfig (for the publish toggle)
      await setDoc(userRef, { settings, siteConfig }, { merge: true });
      
      alert("✨ System configuration secured and updated successfully.");
    } catch (error) {
      alert("System Error: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- AUTHENTICATION ACTIONS ---
  const handlePasswordReset = async () => {
    if (window.confirm("Send a secure password reset link to your email?")) {
      try {
        await sendPasswordResetEmail(auth, authEmail);
        alert(`Security link dispatched to ${authEmail}`);
      } catch (error) {
        alert("Failed to send reset link: " + error.message);
      }
    }
  };

  const exportSystemData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "LaunchAxis_Store_Backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
  const inputStyle = { width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '16px' };

  if (isLoading) return <div style={{ padding: '40px', color: '#64748b', fontWeight: 'bold' }}>Authenticating Secure Kernel...</div>;

  return (
    <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faGears} style={{ color: '#2dd4bf', marginRight: '10px' }} /> 
            System Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Manage operations, legal compliance, and subscription billing.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
        >
          <FontAwesomeIcon icon={faSave} /> {isSaving ? 'Securing Data...' : 'Save Configuration'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '32px', flex: 1, alignItems: 'flex-start' }}>
        
        {/* LEFT SIDEBAR NAVIGATION */}
        <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { id: 'profile', icon: faUserShield, label: 'Account Profile' },
            { id: 'business', icon: faBuilding, label: 'Business Entity' },
            { id: 'notifications', icon: faEnvelopeOpenText, label: 'Email Automation' },
            { id: 'policies', icon: faScaleBalanced, label: 'Legal & Policies' },
            { id: 'operations', icon: faGlobe, label: 'Web Operations' },
            { id: 'billing', icon: faCreditCard, label: 'Plans & Billing' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', borderRadius: '8px',
                background: activeTab === tab.id ? '#0f172a' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '600',
                fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}
            >
              <FontAwesomeIcon icon={tab.icon} style={{ width: '16px', color: activeTab === tab.id ? '#2dd4bf' : '#94a3b8' }} /> {tab.label}
            </button>
          ))}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div style={{ flex: 1, maxWidth: '800px', paddingBottom: '40px' }}>
          
          {/* 1. PROFILE SECUIRTY */}
          {activeTab === 'profile' && (
            <div style={cardStyle} className="fade-in">
              <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '18px' }}>Executive Profile</h3>
              
              <label style={{...labelStyle, marginTop: 0}}>Owner Full Name</label>
              <input type="text" value={settings.profile.fullName} onChange={(e) => handleNestedChange('profile', 'fullName', e.target.value)} style={inputStyle} placeholder="Mahnoor Naveed" />
              
              <label style={labelStyle}>Primary Identity (Read-Only)</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <input type="email" value={authEmail} disabled style={{ ...inputStyle, marginTop: 0, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
                <div style={{ background: '#ecfdf5', color: '#059669', padding: '0 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>Verified</div>
              </div>

              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 12px', color: '#0f172a', fontSize: '15px' }}>Security Protocol</h4>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>Dispatch a secure token to your registered email to update your access credentials.</p>
                <button onClick={handlePasswordReset} style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: '8px' }} /> Request Password Reset
                </button>
              </div>
            </div>
          )}

          {/* 2. BUSINESS ENTITY */}
          {activeTab === 'business' && (
            <div style={cardStyle} className="fade-in">
              <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px' }}>Official Ledger Identity</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>This information is legally binding and will be printed on all invoices and statements.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{...labelStyle, marginTop: 0}}>Registered Business Name</label>
                  <input type="text" value={settings.businessProfile.registeredName} onChange={(e) => handleNestedChange('businessProfile', 'registeredName', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{...labelStyle, marginTop: 0}}>Tax / NTN Number (Optional)</label>
                  <input type="text" value={settings.businessProfile.ntnNumber} onChange={(e) => handleNestedChange('businessProfile', 'ntnNumber', e.target.value)} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Billing Support Phone</label>
                  <input type="text" value={settings.businessProfile.billingPhone} onChange={(e) => handleNestedChange('businessProfile', 'billingPhone', e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Billing Support Email</label>
                  <input type="email" value={settings.businessProfile.billingEmail} onChange={(e) => handleNestedChange('businessProfile', 'billingEmail', e.target.value)} style={inputStyle} />
                </div>
              </div>

              <label style={labelStyle}>Official Headquarters Address</label>
              <textarea rows="2" value={settings.businessProfile.physicalAddress} onChange={(e) => handleNestedChange('businessProfile', 'physicalAddress', e.target.value)} style={{ ...inputStyle, resize: 'none' }} />
            </div>
          )}

          {/* 3. EMAIL AUTOMATION (DYNAMIC SPLIT) */}
          {activeTab === 'notifications' && (
            <div style={cardStyle} className="fade-in">
              <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px' }}>Email Automation</h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Manage how the system communicates with you and your clients.</p>

              {isService ? (
                // SERVICE EMAIL SETTINGS
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Forward Client Leads to Email</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Send an instant email alert when someone submits a contact form.</div>
                    </div>
                    <FontAwesomeIcon icon={settings.notifications.forwardLeadsToEmail ? faToggleOn : faToggleOff} size="2x" style={{ cursor: 'pointer', color: settings.notifications.forwardLeadsToEmail ? '#10b981' : '#cbd5e1' }} onClick={() => handleToggle('notifications', 'forwardLeadsToEmail')} />
                  </div>
                  
                  {settings.notifications.forwardLeadsToEmail && (
                    <div>
                      <label style={{...labelStyle, marginTop: 0}}>Notification Email Address</label>
                      <input type="email" value={settings.notifications.leadNotificationEmail} onChange={(e) => handleNestedChange('notifications', 'leadNotificationEmail', e.target.value)} style={inputStyle} placeholder="Enter email to receive leads..." />
                    </div>
                  )}
                </>
              ) : (
                // E-COMMERCE EMAIL SETTINGS
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Order Confirmation Receipts</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Send buyers an immediate breakdown when they checkout.</div>
                    </div>
                    <FontAwesomeIcon icon={settings.notifications.sendOrderConfirmation ? faToggleOn : faToggleOff} size="2x" style={{ cursor: 'pointer', color: settings.notifications.sendOrderConfirmation ? '#10b981' : '#cbd5e1' }} onClick={() => handleToggle('notifications', 'sendOrderConfirmation')} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Dispatch & Courier Tracking</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Notify buyers when their package is handed to logistics.</div>
                    </div>
                    <FontAwesomeIcon icon={settings.notifications.sendDispatchTracking ? faToggleOn : faToggleOff} size="2x" style={{ cursor: 'pointer', color: settings.notifications.sendDispatchTracking ? '#10b981' : '#cbd5e1' }} onClick={() => handleToggle('notifications', 'sendDispatchTracking')} />
                  </div>

                  <label style={{...labelStyle, marginTop: 0}}>Default Courier Partner</label>
                  <select value={settings.notifications.defaultCourier} onChange={(e) => handleNestedChange('notifications', 'defaultCourier', e.target.value)} style={inputStyle}>
                    <option value="Trax Logistics">Trax Logistics</option>
                    <option value="TCS">TCS</option>
                    <option value="Leopards Courier">Leopards Courier</option>
                    <option value="Call Courier">Call Courier</option>
                    <option value="M&P">M&P</option>
                  </select>
                </>
              )}
            </div>
          )}

          {/* 4. LEGAL & POLICIES (DYNAMIC SPLIT) */}
          {activeTab === 'policies' && (
            <div style={cardStyle} className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Storefront Policies</h3>
                <button style={{ background: '#f0fdfa', color: '#0d9488', border: '1px solid #99f6e4', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FontAwesomeIcon icon={faWandMagicSparkles} /> AI Draft Policies
                </button>
              </div>

              <label style={{...labelStyle, marginTop: 0}}>Privacy Policy</label>
              <textarea rows="4" value={settings.policies.privacyPolicy} onChange={(e) => handleNestedChange('policies', 'privacyPolicy', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />

              <label style={labelStyle}>Terms of Service</label>
              <textarea rows="4" value={settings.policies.termsOfService} onChange={(e) => handleNestedChange('policies', 'termsOfService', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />

              {isService ? (
                <>
                  <label style={labelStyle}>Service & Cancellation Policy</label>
                  <textarea rows="4" value={settings.policies.serviceAgreement} onChange={(e) => handleNestedChange('policies', 'serviceAgreement', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Detail your cancellation parameters or client agreements..." />
                </>
              ) : (
                <>
                  <label style={labelStyle}>Refund & COD Exchange Policy</label>
                  <textarea rows="4" value={settings.policies.refundPolicy} onChange={(e) => handleNestedChange('policies', 'refundPolicy', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} />
                </>
              )}
            </div>
          )}

          {/* 5. OPERATIONS & PUBLISHING */}
          {activeTab === 'operations' && (
            <div className="fade-in">
              
              <div style={{ border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: '18px' }}>Web Publishing Status</h3>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px' }}>When enabled, your website is live on the internet and accessible to clients.</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: siteConfig.isPublished ? '#059669' : '#0f172a', fontSize: '15px' }}>
                      {siteConfig.isPublished ? 'Website is LIVE' : 'Website is OFFLINE'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Toggle to instantly publish or unpublish your site.</div>
                  </div>
                  <FontAwesomeIcon 
                    icon={siteConfig.isPublished ? faToggleOn : faToggleOff} 
                    size="3x" 
                    style={{ cursor: 'pointer', color: siteConfig.isPublished ? '#10b981' : '#cbd5e1' }} 
                    onClick={() => handleSiteConfigToggle('isPublished')} 
                  />
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '18px' }}>Financial & Maintenance</h3>
                
                <label style={{...labelStyle, marginTop: 0}}>Primary Trading Currency</label>
                <select value={settings.operations.currency} onChange={(e) => handleNestedChange('operations', 'currency', e.target.value)} style={inputStyle}>
                  <option value="PKR">PKR - Pakistani Rupee</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>Developer Maintenance Mode</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Show a "Coming Soon" screen to visitors while you edit.</div>
                  </div>
                  <FontAwesomeIcon icon={settings.operations.maintenanceMode ? faToggleOn : faToggleOff} size="2x" style={{ cursor: 'pointer', color: settings.operations.maintenanceMode ? '#f59e0b' : '#cbd5e1' }} onClick={() => handleToggle('operations', 'maintenanceMode')} />
                </div>
              </div>

              <div style={{ border: '1px solid #fca5a5', background: '#fef2f2', borderRadius: '12px', padding: '24px' }}>
                <h3 style={{ margin: '0 0 8px', color: '#991b1b', fontSize: '16px', fontWeight: '800' }}>Data Compliance Backup</h3>
                <p style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '16px' }}>Download a complete JSON backup of your configurations to satisfy local data portability laws.</p>
                <button onClick={exportSystemData} style={{ background: '#b91c1c', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: '8px' }} /> Export System Backup (.json)
                </button>
              </div>
            </div>
          )}

          {/* 6. BILLING & SUBSCRIPTION */}
          {activeTab === 'billing' && (
            <div className="fade-in">
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <FontAwesomeIcon icon={faCircleExclamation} style={{ color: '#d97706', marginTop: '3px' }} />
                <div>
                  <div style={{ fontWeight: '800', color: '#92400e', fontSize: '14px' }}>Stripe Gateway Sandboxed</div>
                  <div style={{ fontSize: '13px', color: '#78350f', marginTop: '4px' }}>SaaS billing operations are currently locked during the MVP launch phase.</div>
                </div>
              </div>

              <div style={{ background: '#0f172a', borderRadius: '16px', padding: '32px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1 }}>
                  <FontAwesomeIcon icon={faBuilding} size="10x" />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <span style={{ background: 'rgba(45, 212, 191, 0.2)', color: '#2dd4bf', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>Active Plan</span>
                  <h2 style={{ fontSize: '32px', margin: '12px 0 4px', fontWeight: '900' }}>Cadet Tier</h2>
                  <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 24px' }}>Free Forever — Standard Limits Applied</p>
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button disabled style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faLock} /> Upgrade to Pilot (PKR 5,000/mo)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;