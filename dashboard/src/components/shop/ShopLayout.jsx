import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faUser, faSearch, faArrowRight, faBars, faXmark, faBoxOpen, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

const ShopLayout = ({ children, branding, cartCount, siteConfig, openCart }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const config = siteConfig || {
    themeColor: '#2dd4bf',
    menuItems: [
        { id: 'core-home', label: 'Home', link: '#home' },
        { id: 'core-catalog', label: 'Catalog', link: '#catalog' },
        { id: 'core-about', label: 'About', link: '#about' }
    ],
    supportEmail: 'help@launchaxis.com'
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- SMART NAVIGATION LOGIC ---
  const handleNavigation = (e, link) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (link === '#catalog' || link === '/catalog') {
      navigate('/catalog');
    } else if (link === '#home' || link === '/') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (link.startsWith('#')) {
      // If clicking "About" but we are on the Catalog page, go Home first
      if (location.pathname !== '/') {
        navigate('/');
        // Note: Realistically, you'd want to wait for render then scroll, 
        // but navigating home is the safest fallback.
      } else {
        const element = document.getElementById(link.substring(1));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(link);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching Firebase for:", searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <div style={{ fontFamily: config.fontFamily || "'Inter', sans-serif", background: '#fff', minHeight: '100vh', display:'flex', flexDirection:'column' }}>
      
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
            <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#0f172a', cursor: 'pointer', padding: 0 }}>
                <FontAwesomeIcon icon={faBars} />
            </button>
            <Link to="/" style={{ textDecoration:'none', color:'#0f172a', display:'flex', alignItems:'center', gap:'10px' }}>
                {branding.logo ? (
                    <img src={branding.logo} alt="Logo" style={{ height:'35px', borderRadius:'6px' }} />
                ) : (
                    <div style={{ fontSize:'22px', fontWeight:'900', letterSpacing:'-1px' }}>{branding.name}</div>
                )}
            </Link>
        </div>

        <div className="desktop-nav" style={{ gap:'30px', fontSize:'14px', fontWeight:'600' }}>
            {config.menuItems.map(item => (
                <a 
                  key={item.id} href={item.link} onClick={(e) => handleNavigation(e, item.link)}
                  style={{ textDecoration:'none', color:'#475569', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseOver={(e) => e.target.style.color = config.themeColor}
                  onMouseOut={(e) => e.target.style.color = '#475569'}
                >
                  {item.label}
                </a>
            ))}
        </div>

        <div style={{ display:'flex', gap:'20px', alignItems:'center', position: 'relative' }}>
            
            {/* SEARCH ICON & DROPDOWN */}
            <div>
                <FontAwesomeIcon 
                    icon={isSearchOpen ? faXmark : faSearch} 
                    onClick={() => { setIsSearchOpen(!isSearchOpen); setIsUserMenuOpen(false); }} 
                    style={{ color:'#0f172a', cursor:'pointer', fontSize: '20px' }} 
                />
                {isSearchOpen && (
                    <div style={{ position: 'absolute', top: '40px', right: '40px', width: '300px', background: '#fff', borderRadius: '12px', padding: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', animation: 'fadeIn 0.2s ease-out' }}>
                        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
                            <input 
                                type="text" placeholder="Search products..." autoFocus
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px' }}
                            />
                            <button type="submit" style={{ background: config.themeColor, color: '#fff', border: 'none', borderRadius: '8px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}>
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </form>
                    </div>
                )}
            </div>
            
            {/* CART ICON */}
            <div onClick={openCart} style={{ position:'relative', color:'#0f172a', cursor:'pointer' }}>
                <FontAwesomeIcon icon={faShoppingBag} style={{ fontSize: '22px' }} />
                {cartCount > 0 && (
                    <span style={{ position:'absolute', top:'-6px', right:'-8px', background: config.themeColor, color:'#fff', fontSize:'10px', width:'18px', height:'18px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', border: '2px solid #fff' }}>
                        {cartCount}
                    </span>
                )}
            </div>
            
            {/* USER LOGIN ICON & DROPDOWN */}
            <div className="desktop-nav" style={{ position: 'relative' }}>
                <FontAwesomeIcon 
                    icon={faUser} 
                    onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsSearchOpen(false); }} 
                    style={{ color:'#0f172a', cursor:'pointer', fontSize: '20px' }} 
                />
                {isUserMenuOpen && (
                    <div style={{ position: 'absolute', top: '40px', right: '0', width: '220px', background: '#fff', borderRadius: '12px', padding: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '5px', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', marginBottom: '5px' }}>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Welcome to {branding.name}</p>
                            <h4 style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#0f172a' }}>Sign In / Register</h4>
                        </div>
                        <button style={{ width: '100%', padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '5px' }}>Sign In</button>
                        <button style={{ width: '100%', padding: '10px', background: 'transparent', color: '#475569', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                            <FontAwesomeIcon icon={faBoxOpen} /> Track My Orders
                        </button>
                        <button style={{ width: '100%', padding: '10px', background: 'transparent', color: '#475569', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }} onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                            <FontAwesomeIcon icon={faRightFromBracket} /> Create Account
                        </button>
                    </div>
                )}
            </div>

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
                        key={item.id} href={item.link} onClick={(e) => handleNavigation(e, item.link)}
                        style={{ textDecoration:'none', color:'#0f172a' }}
                      >
                        {item.label}
                      </a>
                  ))}
                  <div style={{ borderTop: '1px solid #e2e8f0', margin: '10px 0' }}></div>
                  <a href="#" style={{ textDecoration:'none', color:'#475569', fontSize: '16px' }}><FontAwesomeIcon icon={faUser} style={{ width: '25px' }} /> Account Details</a>
                  <a href="#" style={{ textDecoration:'none', color:'#475569', fontSize: '16px' }}><FontAwesomeIcon icon={faBoxOpen} style={{ width: '25px' }} /> Track Orders</a>
              </div>
          </div>
      </div>

      <main style={{ flex:1 }}>
        {children}
      </main>

      <footer className="footer-padding" style={{ background:'#0f172a', color:'#f8fafc', padding:'80px 5% 40px 5%' }}>
        <div className="footer-grid" style={{ display:'grid', gap:'40px', maxWidth:'1400px', margin:'0 auto' }}>
            
            <div>
                <h3 style={{ fontSize:'24px', margin:'0 0 15px 0', color: config.themeColor, fontWeight: '900', letterSpacing: '-1px' }}>{branding.name}</h3>
                <p style={{ color:'#94a3b8', fontSize:'14px', lineHeight:'1.6', marginBottom:'24px' }}>
                    {branding.slogan || 'Defining the future of retail.'} <br/>
                    Premium quality, delivered directly to your doorstep.
                </p>
            </div>

            <div>
                <h4 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:'700', color: '#fff' }}>Shop Links</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', fontSize:'14px' }}>
                    {config.menuItems.map(item => (
                        <a key={item.id} href={item.link} onClick={(e) => handleNavigation(e, item.link)} style={{ color:'#cbd5e1', textDecoration:'none', cursor:'pointer' }}>{item.label}</a>
                    ))}
                </div>
            </div>

            <div>
                <h4 style={{ marginBottom:'20px', fontSize:'16px', fontWeight:'700', color: '#fff' }}>Customer Care</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', fontSize:'14px', color:'#cbd5e1' }}>
                    <span style={{ cursor:'pointer' }}>Track Order</span>
                    <span style={{ cursor:'pointer' }}>Shipping Policy</span>
                    <span style={{ cursor:'pointer' }}>Returns & Exchange</span>
                    <span style={{ cursor:'pointer' }}>Contact: {config.supportEmail}</span>
                </div>
            </div>

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