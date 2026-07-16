import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRocket, 
  faChartPie, 
  faWallet, 
  faGlobe, 
  faBoxOpen, 
  faCartShopping, 
  faWandMagicSparkles 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeSection, setActiveSection, theme, toggleTheme, branding }) => {
  
  const navItems = [
    { id: 'dashboard', icon: faChartPie, label: 'Dashboard' },
    { id: 'finance', icon: faWallet, label: 'Finance' },
    { id: 'branding', icon: faWandMagicSparkles, label: 'Branding (AI)' },
    { id: 'website', icon: faGlobe, label: 'Website' },
    { id: 'products', icon: faBoxOpen, label: 'Products' },
    { id: 'orders', icon: faCartShopping, label: 'Orders' },
  ];

  return (
    <aside className="sidebar">
      {/* BRANDING HEADER */}
      <div className="brand" style={{ padding: '0 24px 32px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '20px', fontWeight: 'bold' }}>
        {branding.logo ? (
          <img src={branding.logo} alt="Logo" style={{ width: '32px', borderRadius: '8px' }} />
        ) : (
          <FontAwesomeIcon icon={faRocket} style={{ color: '#2dd4bf' }} />
        )}
        <span>{branding.name}</span>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav>
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

      {/* THEME TOGGLE (CUSTOM UI) */}
      <div className="theme-toggle">
        <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={theme === 'light'} 
            onChange={toggleTheme} 
          />
          <span className="slider"></span>
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;