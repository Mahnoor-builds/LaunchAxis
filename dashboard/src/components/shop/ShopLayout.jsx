import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faUser, faSearch, faArrowRight, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

const ShopLayout = ({ children, branding, cartCount, siteConfig, openCart }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Fallback config
  const config = siteConfig || {
    themeColor: '#2dd4bf',
    menuItems: [
        { id: 'core-home', label: 'Home', link: '#home' },
        { id: 'core-catalog', label: 'Catalog', link: '#catalog' },
        { id: 'core-about', label: 'About', link: '#about' }
    ],
    supportEmail: 'help@launchaxis.com'
  };

  // Add subtle shadow to navbar on scroll for a premium feel
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToSection = (e, link) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false); // Close mobile menu after clicking
      }
    }
  };

  return (
    <div style={{ fontFamily: config.fontFamily || "'Inter', sans-serif", background: '#fff', minHeight: '100vh', display:'flex', flexDirection:'column' }}>
      
      {/* INJECTED RESPONSIVE CSS */}
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-toggle { display: none; }
        .footer-grid { grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
        
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
          .nav-container { padding: 15px 20px !important; }
          .footer-padding { padding: 50px 20px 30px 20px !important; }
        }
      `}</style>

      {/* === NAVBAR === */}
      <nav className="nav-container" style={{
          padding: '15px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'rgba(255,255,255,0.98)', zIndex: 100, 
          transition: 'box-shadow 0.3s',
          boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
          borderBottom: scrolled ? 'none' : '1px solid #f1f5f9'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* MOBILE HAMBURGER ICON */}
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#0f172a', cursor: 'pointer', padding: 0 }}>
                <FontAwesomeIcon icon={faBars} />
            </button>

            {/* BRAND LOGO */}
            <Link to="/" style={{ textDecoration:'none', color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
                {branding.logo ? (
                    <img src={branding.logo} alt="Logo" style={{ height:'35px', borderRadius:'6px' }} />
                ) : (
                    <div style={{ fontSize:'22px', fontWeight:'900', letterSpacing:'-1px' }}>{branding.name}</div>
                )}
            </Link>
        </div>

        {/* DESKTOP LINKS */}
        <div className="desktop-nav" style={{ gap:'30px', fontSize:'14px', fontWeight:'600' }}>
            {config.menuItems.map(item => (
                <a 
                  key={item.id} href={item.link} onClick={(e) => handleScrollToSection(e, item.link)}
                  style={{ textDecoration:'none', color:'#475569', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = config.themeColor}
                  onMouseOut={(e) => e.target.style.color = '#475569'}
                >
                  {item.label}
                </a>
            ))}
        </div>

        {/* ICONS */}
        <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
            <FontAwesomeIcon icon={faSearch} style={{ color:'#475569', cursor:'pointer', fontSize: '18px' }} />
            
            <div onClick={openCart} style={{ position:'relative', color:'#0f172a', cursor:'pointer' }}>
                <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: '20px' }} />
                {cartCount > 0 && (
                    <span style={{
                        position:'absolute', top:'-6px', right:'-8px', 
                        background: config.themeColor, color:'#fff', fontSize:'10px', 
                        width:'18px', height:'18px', borderRadius:'50%', 
                        display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold',
                        border: '2px solid #fff'
                    }}>
                        {cartCount}
                    </span>
                )}
            </div>
            
            <FontAwesomeIcon className="desktop-nav" icon={faUser} style={{ color:'#475569', cursor:'pointer', fontSize: '18px' }} />
        </div>
      </nav>

      {/* === MOBILE SLIDE-OUT MENU === */}
      <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
          zIndex: 999, opacity: isMobileMenuOpen ? 1 : 0, pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s'
      }} onClick={() => setIsMobileMenuOpen(false)}>
          
          <div style={{
              width: '80%', maxWidth: '300px', height: '100%', background: '#fff',
              padding: '30px 20px', display: 'flex', flexDirection: 'column',
              transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '10px 0 25px rgba(0,0,0,0.1)'
          }} onClick={e => e.stopPropagation()}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                  <div style={{ fontSize:'20px', fontWeight:'900', letterSpacing:'-1px', color: '#0f172a' }}>{branding.name}</div>
                  <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#64748b', cursor: 'pointer' }}>
                      <FontAwesomeIcon icon={faXmark} />
                  </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', fontSize: '18px', fontWeight: '700' }}>
                  {config.menuItems.map(item => (
                      <a 
                        key={item.id} href={item.link} onClick={(e) => handleScrollToSection(e, item.link)}
                        style={{ textDecoration:'none', color:'#0f172a' }}
                      >
                        {item.label}
                      </a>
                  ))}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '30px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '20px' }}>
                  <FontAwesomeIcon icon={faFacebook} size="lg" style={{ color: '#94a3b8' }} />
                  <FontAwesomeIcon icon={faInstagram} size="lg" style={{ color: '#94a3b8' }} />
                  <FontAwesomeIcon icon={faTwitter} size="lg" style={{ color: '#94a3b8' }} />
              </div>
          </div>
      </div>

      {/* === MAIN CONTENT === */}
      <main style={{ flex:1 }}>
        {children}
      </main>

      {/* === PROFESSIONAL RESPONSIVE FOOTER === */}
      <footer className="footer-padding" style={{ background:'#0f172a', color:'#f8fafc', padding:'80px 5% 40px 5%' }}>
        <div className="footer-grid" style={{ display:'grid', gap:'40px', maxWidth:'1400px', margin:'0 auto' }}>
            
            {/* 1. Brand Column */}
            <div>
                <h3 style={{ fontSize:'24px', margin:'0 0 15px 0', color: config.themeColor, fontWeight: '900', letterSpacing: '-1px' }}>{branding.name}</h3>
                <p style={{ color:'#94a3b8', fontSize:'14px', lineHeight:'1.6', marginBottom:'24px' }}>
                    {branding.slogan || 'Defining the future of retail.'} <br/>
                    Premium quality, delivered directly to your doorstep.
                </p>
                <div style={{ display:'flex', gap:'16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FontAwesomeIcon icon={faFacebook} style={{ color:'#fff' }} />
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FontAwesomeIcon icon={faInstagram} style={{ color:'#fff' }} />
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FontAwesomeIcon icon={faTwitter} style={{ color:'#fff' }} />
                    </div>
                </div>
            </div>

            {/* 2. Quick Links Column */}
            <div>
                <h4 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:'700', color: '#fff' }}>Shop Links</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', fontSize:'14px' }}>
                    {config.menuItems.map(item => (
                        <a key={item.id} href={item.link} onClick={(e) => handleScrollToSection(e, item.link)} style={{ color:'#cbd5e1', textDecoration:'none', cursor:'pointer' }}>{item.label}</a>
                    ))}
                </div>
            </div>

            {/* 3. Support Column */}
            <div>
                <h4 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:'700', color: '#fff' }}>Customer Care</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', fontSize:'14px', color:'#cbd5e1' }}>
                    <span style={{ cursor:'pointer' }}>Track Order</span>
                    <span style={{ cursor:'pointer' }}>Shipping Policy</span>
                    <span style={{ cursor:'pointer' }}>Returns & Exchange</span>
                    <span style={{ cursor:'pointer' }}>Contact: {config.supportEmail}</span>
                </div>
            </div>

            {/* 4. Newsletter Column */}
            <div>
                <h4 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:'700', color: '#fff' }}>Stay in the Loop</h4>
                <p style={{ color:'#cbd5e1', fontSize:'14px', marginBottom:'15px', lineHeight: '1.6' }}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                <div style={{ display:'flex', background: 'rgba(255,255,255,0.05)', borderRadius:'8px', overflow:'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <input type="email" placeholder="Enter your email" style={{ padding:'14px 16px', background:'transparent', border:'none', color:'#fff', width:'100%', outline:'none', fontSize:'14px' }} />
                    <button style={{ background: config.themeColor, border:'none', padding:'0 24px', cursor:'pointer', color:'#0f172a', fontWeight: 'bold' }}>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            </div>
        </div>
        
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:'60px', paddingTop:'25px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px', color:'#64748b', flexWrap:'wrap', gap:'15px' }}>
            <div>&copy; 2026 {branding.name}. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
                <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;