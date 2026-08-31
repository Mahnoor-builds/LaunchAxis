import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faChartPie, faWallet, 
  faGlobe, faBoxOpen, faCartShopping, faWandMagicSparkles,
  faGear, faBriefcase, faAddressBook, faTimes
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeSection, setActiveSection, branding, features, isMobileOpen, setIsMobileOpen }) => {
  const isService = true;

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

  // Auto-close drawer on mobile when clicking a link
  const handleNavClick = (id) => {
    setActiveSection(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Dark Overlay */}
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
          
          {/* Mobile Close Button */}
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
              background: activeSection === 'settings' ? 'rgba(45, 212, 191, 0.1)' : 'transparent' 
            }}
          >
            <FontAwesomeIcon icon={faGear} style={{ width: '20px' }} />
            <span>Settings</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;