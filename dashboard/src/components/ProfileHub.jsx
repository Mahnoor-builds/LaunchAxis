import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserAstronaut, faRocket, faArrowRight, faUsers, faMagnet,
  faRightFromBracket, faTriangleExclamation, faCheckCircle, faLock
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { auth, db } from '../firebaseConfig';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

const ProfileHub = ({ branding, setActiveSection }) => {
  const [userEmail, setUserEmail] = useState('Loading...');
  const [userName, setUserName] = useState('Loading...');

  // --- FETCH USER IDENTITY ---
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
      // In the future, this can pull the exact 'fullName' from the Settings we built earlier
      setUserName(user.displayName || 'LaunchAxis Pioneer'); 
    } else {
      // Fallback for guest mode testing
      setUserEmail('guest@launchaxis.com');
      setUserName('Platform Guest');
    }
  }, []);

  // --- SECURE SIGN OUT ---
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clears session and routes back to the marketing homepage
      window.location.href = 'index.html';
    } catch (error) {
      alert("System Error: Could not sign out. " + error.message);
    }
  };

  // --- PERMANENT ACCOUNT DELETION ---
  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("No active session found.");
      return;
    }

    const confirmText = prompt("CRITICAL WARNING: This will permanently erase your LaunchAxis account, storefront, and all operational data. Type 'DELETE' to confirm.");
    
    if (confirmText === 'DELETE') {
      try {
        // 1. Erase the user's data from Firestore
        await deleteDoc(doc(db, "users", user.uid));
        
        // 2. Erase the authentication credential
        await deleteUser(user);
        
        alert("Account permanently deleted. We are sorry to see you go.");
        window.location.href = 'index.html';
      } catch (error) {
        // Note: Firebase requires a "recent login" to delete an account for security reasons.
        alert("Security Error: To delete your account, you must log out and log back in to verify your identity, then try again. (" + error.message + ")");
      }
    } else if (confirmText !== null) {
      alert("Deletion cancelled. Text did not match 'DELETE'.");
    }
  };

  // --- STYLES ---
  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      
      {/* HEADER SECTION */}
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0, color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Founder Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '8px 0 0' }}>Manage your identity, workspaces, and platform access.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* === LEFT COLUMN: IDENTITY & WORKSPACES === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 1. IDENTITY CARD */}
          <div style={{ ...cardStyle, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '80px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
              <div style={{ width: '80px', height: '80px', background: '#2dd4bf', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <FontAwesomeIcon icon={faUserAstronaut} style={{ fontSize: '32px', color: '#0f172a' }} />
              </div>
              
              <h2 style={{ margin: '0 0 4px', fontSize: '22px', color: '#0f172a', fontWeight: '800' }}>{userName}</h2>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>{userEmail}</p>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdfa', color: '#0d9488', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', border: '1px solid #99f6e4' }}>
                <FontAwesomeIcon icon={faCheckCircle} /> Verified Pioneer
              </div>
            </div>
          </div>

          {/* 2. ACTIVE WORKSPACES */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faRocket} style={{ color: '#2dd4bf' }} /> Active Startups
            </h3>
            
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                 onMouseOver={(e) => e.currentTarget.style.borderColor = '#2dd4bf'}
                 onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                 onClick={() => setActiveSection('dashboard')}
            >
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>{branding?.name || 'Untitled Startup'}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                  <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                  System Online
                </div>
              </div>
              
              <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Dashboard <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: VISIONARY WIDGETS & SECURITY === */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* 3. ROADMAP & VISION */}
          <div style={{ ...cardStyle, background: '#0f172a', color: '#fff', borderColor: '#1e293b' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', color: '#fff' }}>Platform Roadmap</h3>
            
            {/* Community Widget */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf' }}>
                  <FontAwesomeIcon icon={faUsers} /> Founder Network
                </h4>
                <FontAwesomeIcon icon={faLock} style={{ color: '#64748b', fontSize: '12px' }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>A global timeline to share wins, ask questions, and connect with other top-tier SaaS and e-commerce founders. Rolling out in v3.0.</p>
            </div>

            {/* Lead Gen Widget */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
                  <FontAwesomeIcon icon={faMagnet} /> B2B Lead Engine
                </h4>
                <FontAwesomeIcon icon={faLock} style={{ color: '#64748b', fontSize: '12px' }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>Our AI auto-prospecting tool. Add your service, and LaunchAxis will source high-converting client leads directly to your dashboard.</p>
            </div>
          </div>

          {/* 4. SECURITY & DANGER ZONE */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '18px' }}>Session Management</h3>
            
            <button 
              onClick={handleSignOut}
              style={{ width: '100%', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '14px', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px', transition: 'background 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Sign Out of LaunchAxis
            </button>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '24px' }}>
              <h4 style={{ margin: '0 0 8px', color: '#ef4444', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} /> Danger Zone
              </h4>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Permanently erase your account, active startups, and all operational data from the LaunchAxis database. This action cannot be reversed.
              </p>
              <button 
                onClick={handleDeleteAccount}
                style={{ background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#fca5a5'; }}
              >
                Delete Account
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileHub;