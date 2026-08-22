import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, faChartPie, faWallet, 
  faGlobe, faBoxOpen, faCartShopping, faWandMagicSparkles,
  faGear, faBriefcase, faAddressBook
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeSection, setActiveSection, branding, features }) => {
  // Check if the account belongs to a Service/Freelancer business
  const isService = branding?.industry === 'service';

  // Base navigation list
  const navItems = [
    { id: 'dashboard', icon: faChartPie, label: 'Dashboard' },
    // Only show finance if feature flag is active or undefined
    ...(features?.wantsAccounting !== false ? [{ id: 'finance', icon: faWallet, label: 'Finance' }] : []),
    ...(features?.wantsBranding !== false ? [{ id: 'branding', icon: faWandMagicSparkles, label: 'Branding (AI)' }] : []),
    ...(features?.wantsWebsite !== false ? [{ id: 'website', icon: faGlobe, label: 'Website' }] : []),
    // Dynamic E-commerce vs. Service switch
    ...(isService ? [
      { id: 'projects', icon: faBriefcase, label: 'Projects' },
      { id: 'leads', icon: faAddressBook, label: 'Client Leads' }
    ] : [
      { id: 'products', icon: faBoxOpen, label: 'Products' },
      { id: 'orders', icon: faCartShopping, label: 'Orders' }
    ])
  ];

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* BRANDING HEADER */}
      <div className="brand" style={{ padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold', color: '#f8fafc' }}>
        {branding?.logo ? (
          <img src={branding.logo} alt="Logo" style={{ width: '32px', borderRadius: '8px' }} />
        ) : (
          <FontAwesomeIcon icon={faRocket} style={{ color: '#2dd4bf' }} />
        )}
        <span>{branding?.name || 'LaunchAxis'}</span>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <div 
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <FontAwesomeIcon icon={item.icon} style={{ width: '20px' }} />
            {item.label}
          </div>
        ))}
      </nav>

      {/* BOTTOM SETTINGS LINK */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}></div>
        <div 
          className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveSection('settings')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', 
            borderRadius: '8px', cursor: 'pointer', 
            color: activeSection === 'settings' ? '#2dd4bf' : '#94a3b8', 
            background: activeSection === 'settings' ? 'rgba(45, 212, 191, 0.1)' : 'transparent' 
          }}
        >
          <FontAwesomeIcon icon={faGear} style={{ width: '20px' }} />
          Settings
        </div>
      </div>

    </aside>
  );
};

export default Sidebar;