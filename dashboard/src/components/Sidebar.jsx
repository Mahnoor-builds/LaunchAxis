import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faChartPie, faWallet, 
  faGlobe, faBoxOpen, faCartShopping, faWandMagicSparkles,
  faGear, faBriefcase, faAddressBook, faTimes, faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Sidebar = ({ activeSection, setActiveSection, branding, features, isMobileOpen, setIsMobileOpen }) => {
  const isService = true;
  const [userName, setUserName] = useState('Guest Pioneer');
  const [userEmail, setUserEmail] = useState('guest@launchaxis.com');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'LaunchAxis Pioneer');
        setUserEmail(user.email);
      } else {
        setUserName('Guest Pioneer');
        setUserEmail('guest@launchaxis.com');
      }
    });
    return () => unsubscribe();
  }, []);

  const navItems = [
    { id: 'dashboard', icon: faChartPie, label: 'Dashboard' },
    ...(features?.wantsAccounting !== false ? [{ id: 'finance', icon: faWallet, label: 'Finance' }] : []),
    ...(features?.wantsBranding !== false ? [{ id: 'branding', icon: faWandMagicSparkles, label: 'Branding (AI)' }] : []),
    ...(features?.wantsWebsite !== false ? [{ id: 'website', icon: faGlobe, label: 'Website' }] : []),
    ...(isService ? [
      { id: 'projects', icon: faBriefcase, label: 'Projects' },
      { id: 'leads', icon: faAddressBook, label: 'Client Leads' }
    ] : [
      { id: 'products', icon: faBoxOpen, label: 'Products' },
      { id: 'orders', icon: faCartShopping, label: 'Orders' }
    ])
  ];

  const handleNavClick = (id) => {
    setActiveSection(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'open' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        <div className="brand" style={{ padding: '0 24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {branding?.logo ? (
              <img src={branding.logo} alt="Logo" style={{ width: '32px', borderRadius: '8px' }} />
            ) : (
              <FontAwesomeIcon icon={faRocket} style={{ color: '#2dd4bf' }} />
            )}
            <span>{branding?.name || 'LaunchAxis'}</span>
          </div>
          
          {isMobileOpen && (
            <FontAwesomeIcon 
              icon={faTimes} 
              style={{ cursor: 'pointer', color: '#94a3b8', fontSize: '20px' }} 
              onClick={() => setIsMobileOpen(false)} 
            />
          )}
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <div 
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} style={{ width: '20px' }} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '0 16px 24px' }}>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}></div>
          
          <div 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              borderRadius: '8px', cursor: 'pointer', 
              color: activeSection === 'settings' ? '#2dd4bf' : '#94a3b8', 
              background: activeSection === 'settings' ? 'rgba(45, 212, 191, 0.1)' : 'transparent',
              marginBottom: '12px'
            }}
          >
            <FontAwesomeIcon icon={faGear} style={{ width: '20px' }} />
            <span>Settings</span>
          </div>

          <div 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
              borderRadius: '8px', cursor: 'pointer', 
              color: activeSection === 'profile' ? '#fff' : '#94a3b8', 
              background: activeSection === 'profile' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}
          >
            <FontAwesomeIcon icon={faUserCircle} style={{ width: '20px', fontSize: '24px', color: '#8B5CF6' }} />
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userName}</span>
                <span style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;