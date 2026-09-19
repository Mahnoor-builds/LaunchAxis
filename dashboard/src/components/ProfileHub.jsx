import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserAstronaut, faRocket, faArrowRight, faUsers, faMagnet,
  faRightFromBracket, faTriangleExclamation, faCheckCircle, faLock, faPlus
} from '@fortawesome/free-solid-svg-icons';

import { auth, db } from '../firebaseConfig';
import { signOut, deleteUser, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

const ProfileHub = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('Loading...');
  const [userName, setUserName] = useState('Loading...');
  const [startupData, setStartupData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserName(user.displayName || 'LaunchAxis Pioneer');
        
        try {
          // Check if user has an active dashboard in Firestore
          let userDocRef = doc(db, "users", user.uid);
          let snap = await getDoc(userDocRef);
          
          if (!snap.exists() && user.email) {
            userDocRef = doc(db, "users", user.email);
            snap = await getDoc(userDocRef);
          }
          
          if (snap.exists()) {
            setStartupData(snap.data());
          }
        } catch (error) {
          console.error("Firestore sync error:", error);
        }
      } else {
        // If not logged in, boot them to the homepage
        navigate('/'); 
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      alert("System Error: Could not sign out. " + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const confirmText = prompt("CRITICAL WARNING: This will permanently erase your LaunchAxis account, storefront, and all operational data. Type 'DELETE' to confirm.");
    
    if (confirmText === 'DELETE') {
      try {
        await deleteDoc(doc(db, "users", user.uid));
        if (user.email) await deleteDoc(doc(db, "users", user.email)); // Clean up fallback email doc
        
        await deleteUser(user);
        alert("Account permanently deleted. We are sorry to see you go.");
        navigate('/');
      } catch (error) {
        alert("Security Error: To delete your account, you must log out and log back in to verify your identity, then try again.");
      }
    }
  };

  const cardStyle = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };

  if (isLoading) {
    return <div style={{ padding: '100px', textAlign: 'center', color: '#64748b', fontWeight: 'bold' }}>Syncing Identity Matrix...</div>;
  }

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.3s ease', fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ padding: '20px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', margin: 0, color: '#0f172a', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Founder Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '8px 0 0' }}>Manage your identity, workspaces, and platform access.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* IDENTITY CARD */}
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

          {/* DYNAMIC WORKSPACE CARD */}
          <div style={cardStyle}>
            <h3 style={{ margin: '0 0 20px', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faRocket} style={{ color: '#2dd4bf' }} /> Active Workspaces
            </h3>
            
            {startupData ? (
              // IF THEY HAVE A DASHBOARD
              <div 
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#2dd4bf'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                onClick={() => navigate('/admin')}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                    {startupData.aiArchitecture?.businessName || startupData.businessName || 'Your Startup'}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
                    <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
                    System Online
                  </div>
                </div>
                
                <button style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Dashboard <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            ) : (
              // IF THEY HAVE NO DASHBOARD YET
              <div 
                style={{ background: '#fffbeb', border: '1px dashed #f59e0b', borderRadius: '12px', padding: '24px', textAlign: 'center', transition: 'all 0.2s', cursor: 'pointer' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#fef3c7'}
                onMouseOut={(e) => e.currentTarget.style.background = '#fffbeb'}
                onClick={() => navigate('/start-building')}
              >
                <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: '20px' }} />
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '16px', color: '#92400e', fontWeight: '800' }}>No Infrastructure Found</h4>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#b45309' }}>You haven't initialized your business architecture yet.</p>
                <button style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                  Start Building Now
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ ...cardStyle, background: '#0f172a', color: '#fff', borderColor: '#1e293b' }}>
            <h3 style={{ margin: '0 0 24px', fontSize: '18px', color: '#fff' }}>Platform Roadmap</h3>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf' }}>
                  <FontAwesomeIcon icon={faUsers} /> Founder Network
                </h4>
                <FontAwesomeIcon icon={faLock} style={{ color: '#64748b', fontSize: '12px' }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>A global timeline to share wins, ask questions, and connect with other founders. Rolling out in v3.0.</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#c084fc' }}>
                  <FontAwesomeIcon icon={faMagnet} /> B2B Lead Engine
                </h4>
                <FontAwesomeIcon icon={faLock} style={{ color: '#64748b', fontSize: '12px' }} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>Our AI auto-prospecting tool. Source high-converting client leads directly to your dashboard.</p>
            </div>
          </div>

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
                Permanently erase your account, active startups, and all operational data. This action cannot be reversed.
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