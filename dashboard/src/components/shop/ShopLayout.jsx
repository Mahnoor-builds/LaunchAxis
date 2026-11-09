import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingBag, faSearch, faArrowRight, faBars, faXmark, 
  faEnvelope, faPhone, faLocationDot, faScaleBalanced, 
  faTruckFast, faRotateLeft, faShieldHalved, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const ShopLayout = ({ children, branding = {}, cartCount = 0, siteConfig = {}, openCart }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Policy Modal & Newsletter States
  const [activePolicy, setActivePolicy] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const themeColor = siteConfig?.themeColor || branding?.color || '#2563eb';
  const fontFamily = branding?.font || siteConfig?.fontFamily || "'Inter', sans-serif";
  const brandName = branding?.name && branding.name !== 'Loading...' ? branding.name : 'Official Store';

  const rawMenu = siteConfig?.menuItems?.length > 0 ? siteConfig.menuItems : [
    { id: 'core-home', label: 'Home', link: '#home' },
    { id: 'core-catalog', label: 'Catalog', link: '#catalog' },
    { id: 'core-about', label: 'About', link: '#about' }
  ];

  // Filter out service-only links if switching from service to store mode
  const menuItems = rawMenu.filter(item => item.link !== '#services' && item.link !== '#contact');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Safe external URL helper
  const getSafeExternalUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  // --- SMART STORE NAVIGATION LOGIC (Synced with /store routes in App.js) ---
  const handleNavigation = (e, link) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (link === '#catalog' || link === '/catalog' || link === '/store/catalog') {
      navigate('/store/catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === '#home' || link === '/' || link === '/store') {
      if (location.pathname !== '/store') {
        navigate('/store');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (link.startsWith('#')) {
      const targetId = link.substring(1);
      if (location.pathname !== '/store') {
        navigate('/store');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(link);
    }
  };

  // --- LIVE SEARCH SUBMIT HANDLER ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const cleanQuery = searchQuery.replace(/[<>]/g, '').trim().slice(0, 80);
    if (!cleanQuery) return;

    localStorage.setItem('launchAxisSearchQuery', cleanQuery);
    localStorage.setItem('launchAxisStoreCategory', 'All');
    setIsSearchOpen(false);
    
    if (location.pathname === '/store/catalog') {
      window.dispatchEvent(new Event('launchAxisSearchTriggered'));
    } else {
      navigate('/store/catalog');
    }
    window.scrollTo(0, 0);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <div style={{ fontFamily, background: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#0f172a' }}>
      
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-toggle { display: none; }
        .footer-grid { grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
          .nav-container { padding: 14px 20px !important; }
          .footer-padding { padding: 56px 20px 30px 20px !important; }
        }
      `}</style>

      {/* === NAVBAR === */}
      <nav 
        className="nav-container" 
        style={{
          padding: '16px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.96)', backdropFilter: 'blur(10px)', zIndex: 100, 
          transition: 'box-shadow 0.3s ease',
          boxShadow: scrolled ? '0 4px 20px rgba(15, 23, 42, 0.06)' : 'none',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        
        {/* Left: Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            className="mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(true)} 
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '38px', height: '38px', borderRadius: '10px', fontSize: '16px', color: '#0f172a', cursor: 'pointer', alignItems: 'center', justifyContent: 'center' }}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>

          <Link to="/store" style={{ textDecoration: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {branding?.logo && (
              <img src={branding.logo} alt={brandName} style={{ height: '36px', borderRadius: '8px', objectFit: 'contain' }} />
            )}
            <span style={{ fontSize: '21px', fontWeight: '900', letterSpacing: '-0.6px', color: '#0f172a' }}>
              {brandName}
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links */}
        <div className="desktop-nav" style={{ gap: '32px', fontSize: '14px', fontWeight: '700' }}>
          {menuItems.map(item => (
            <a 
              key={item.id || item.label} 
              href={item.link} 
              onClick={(e) => handleNavigation(e, item.link)}
              style={{ textDecoration: 'none', color: '#475569', cursor: 'pointer', transition: 'color 0.2s' }}
              onMouseOver={(e) => e.target.style.color = themeColor}
              onMouseOut={(e) => e.target.style.color = '#475569'}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right: Search & Shopping Bag */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
          
          {/* Search Button & Popover */}
          <div>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)} 
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '10px', color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}
              title="Search Catalog"
            >
              <FontAwesomeIcon icon={isSearchOpen ? faXmark : faSearch} />
            </button>

            {isSearchOpen && (
              <div style={{ position: 'absolute', top: '52px', right: '0', width: '310px', background: '#ffffff', borderRadius: '14px', padding: '14px', boxShadow: '0 15px 35px -5px rgba(15, 23, 42, 0.15)', border: '1px solid #e2e8f0', zIndex: 120 }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    autoFocus
                    maxLength={80}
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', outline: 'none', fontSize: '13px', color: '#0f172a', fontWeight: '500', margin: 0 }}
                  />
                  <button type="submit" style={{ background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0 16px', cursor: 'pointer', fontWeight: '700' }}>
                    <FontAwesomeIcon icon={faSearch} style={{ color: '#f97316' }} />
                  </button>
                </form>
              </div>
            )}
          </div>
          
          {/* Shopping Bag Pill Button */}
          <button 
            onClick={openCart} 
            style={{ background: '#0f172a', color: '#ffffff', border: 'none', height: '40px', padding: '0 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '13px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)' }}
          >
            <FontAwesomeIcon icon={faShoppingBag} style={{ color: '#10b981', fontSize: '14px' }} />
            <span>Bag</span>
            <span style={{ background: themeColor, color: '#ffffff', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '800' }}>
              {cartCount}
            </span>
          </button>

        </div>
      </nav>

      {/* === MOBILE SLIDE-OUT DRAWER === */}
      {isMobileMenuOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)', zIndex: 999 }} 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            style={{ width: '82%', maxWidth: '300px', height: '100%', background: '#ffffff', padding: '28px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '10px 0 30px rgba(0,0,0,0.15)' }} 
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '19px', fontWeight: '900', color: '#0f172a' }}>{brandName}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '34px', height: '34px', borderRadius: '8px', fontSize: '16px', color: '#64748b', cursor: 'pointer' }}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '16px', fontWeight: '700' }}>
                {menuItems.map(item => (
                  <a 
                    key={item.id || item.label} 
                    href={item.link} 
                    onClick={(e) => handleNavigation(e, item.link)}
                    style={{ textDecoration: 'none', color: '#0f172a', padding: '6px 0' }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', fontWeight: '700', color: '#475569' }}>
              <span onClick={() => { setIsMobileMenuOpen(false); setActivePolicy('shipping'); }} style={{ cursor: 'pointer' }}>Shipping & Delivery Info</span>
              <span onClick={() => { setIsMobileMenuOpen(false); setActivePolicy('refund'); }} style={{ cursor: 'pointer' }}>Returns & Exchange Policy</span>
              <span onClick={() => { setIsMobileMenuOpen(false); setActivePolicy('privacy'); }} style={{ cursor: 'pointer' }}>Privacy Policy</span>
            </div>
          </div>
        </div>
      )}

      {/* === MAIN PAGE CONTENT === */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* === FOOTER === */}
      <footer className="footer-padding" style={{ background: '#0f172a', color: '#f8fafc', padding: '72px 5% 36px 5%', borderTop: '1px solid #1e293b' }}>
        <div className="footer-grid" style={{ display: 'grid', gap: '40px', maxWidth: '1360px', margin: '0 auto' }}>
          
          {/* Col 1: Brand & Socials */}
          <div>
            <h3 style={{ fontSize: '22px', margin: '0 0 12px 0', color: '#ffffff', fontWeight: '900', letterSpacing: '-0.5px' }}>
              {brandName}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', maxWidth: '280px' }}>
              {branding?.slogan || siteConfig?.heroSubtitle || 'Curated quality products delivered directly to your doorstep.'}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {getSafeExternalUrl(siteConfig?.socials?.instagram) && (
                <a href={getSafeExternalUrl(siteConfig.socials.instagram)} target="_blank" rel="noopener noreferrer" style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  <FontAwesomeIcon icon={faInstagram} />
                </a>
              )}
              {getSafeExternalUrl(siteConfig?.socials?.facebook) && (
                <a href={getSafeExternalUrl(siteConfig.socials.facebook)} target="_blank" rel="noopener noreferrer" style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  <FontAwesomeIcon icon={faFacebookF} />
                </a>
              )}
              {getSafeExternalUrl(siteConfig?.socials?.linkedin) && (
                <a href={getSafeExternalUrl(siteConfig.socials.linkedin)} target="_blank" rel="noopener noreferrer" style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Store Navigation */}
          <div>
            <h4 style={{ margin: '0 0 18px 0', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Store Navigation</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              {menuItems.map(item => (
                <a 
                  key={item.id || item.label} 
                  href={item.link} 
                  onClick={(e) => handleNavigation(e, item.link)} 
                  style={{ color: '#cbd5e1', textDecoration: 'none', cursor: 'pointer' }}
                >
                  {item.label}
                </a>
              ))}
              <span onClick={openCart} style={{ color: '#cbd5e1', cursor: 'pointer' }}>View Shopping Bag ({cartCount})</span>
            </div>
          </div>

          {/* Col 3: Shipping, Returns & Legal Policies */}
          <div>
            <h4 style={{ margin: '0 0 18px 0', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Shipping & Policies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#cbd5e1' }}>
              <span onClick={() => setActivePolicy('shipping')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTruckFast} style={{ color: '#f97316', fontSize: '12px' }} /> Shipping & Delivery Policy
              </span>
              <span onClick={() => setActivePolicy('refund')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faRotateLeft} style={{ color: '#10b981', fontSize: '12px' }} /> Returns & Exchange Policy
              </span>
              <span onClick={() => setActivePolicy('privacy')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#38bdf8', fontSize: '12px' }} /> Privacy Policy
              </span>
              <span onClick={() => setActivePolicy('terms')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faScaleBalanced} style={{ color: '#a855f7', fontSize: '12px' }} /> Terms of Service
              </span>
            </div>
          </div>

          {/* Col 4: Contact & Newsletter */}
          <div>
            <h4 style={{ margin: '0 0 18px 0', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Customer Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ color: themeColor }} />
                <span>{siteConfig?.supportEmail || 'help@launchaxis.com'}</span>
              </div>
              {siteConfig?.supportPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faPhone} style={{ color: '#10b981' }} />
                  <span>{siteConfig.supportPhone}</span>
                </div>
              )}
              {siteConfig?.physicalAddress && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FontAwesomeIcon icon={faLocationDot} style={{ color: '#f97316' }} />
                  <span>{siteConfig.physicalAddress}</span>
                </div>
              )}
            </div>

            {newsletterSubscribed ? (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '10px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faCheckCircle} /> Subscribed for store updates!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
                <input 
                  type="email" 
                  required
                  placeholder="Enter email for offers..." 
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  style={{ padding: '12px 14px', background: 'transparent', border: 'none', color: '#ffffff', width: '100%', outline: 'none', fontSize: '13px', margin: 0 }} 
                />
                <button type="submit" style={{ background: themeColor, border: 'none', padding: '0 18px', cursor: 'pointer', color: '#ffffff', fontWeight: '800' }}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </form>
            )}
          </div>

        </div>
        
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '48px', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b', flexWrap: 'wrap', gap: '15px', maxWidth: '1360px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '18px' }}>
            <span onClick={() => setActivePolicy('shipping')} style={{ cursor: 'pointer' }}>Shipping</span>
            <span onClick={() => setActivePolicy('refund')} style={{ cursor: 'pointer' }}>Returns</span>
            <span onClick={() => setActivePolicy('privacy')} style={{ cursor: 'pointer' }}>Privacy</span>
            <span onClick={() => setActivePolicy('terms')} style={{ cursor: 'pointer' }}>Terms</span>
          </div>
        </div>
      </footer>

      {/* === STOREFRONT POLICY POPUP MODAL === */}
      {activePolicy && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}
          onClick={() => setActivePolicy(null)}
        >
          <div 
            style={{ background: '#ffffff', borderRadius: '18px', width: '100%', maxWidth: '620px', maxHeight: '82vh', overflowY: 'auto', padding: '32px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setActivePolicy(null)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: '#f8fafc', border: '1px solid #cbd5e1', width: '36px', height: '36px', borderRadius: '50%', fontSize: '15px', cursor: 'pointer', color: '#0f172a' }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>

            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: '20px', display: 'inline-block', marginBottom: '10px' }}>
              Official Store Policy
            </span>

            <h2 style={{ margin: '0 0 16px 0', color: '#0f172a', fontSize: '22px', fontWeight: '900' }}>
              {activePolicy === 'shipping' && 'Shipping & Delivery Policy'}
              {activePolicy === 'refund' && 'Returns, Refund & Exchange Policy'}
              {activePolicy === 'privacy' && 'Privacy Policy'}
              {activePolicy === 'terms' && 'Terms of Service'}
            </h2>

            <div style={{ whiteSpace: 'pre-wrap', color: '#475569', fontSize: '14px', lineHeight: '1.7', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              {activePolicy === 'shipping' && (siteConfig?.policies?.shippingPolicy || 'Orders are processed within 24 hours and dispatched via our registered courier partners. Standard delivery takes 2–4 business days across Pakistan with Cash on Delivery available.')}
              {activePolicy === 'refund' && (siteConfig?.policies?.refundPolicy || 'We offer a hassle-free 7-day return and exchange policy for unused items in their original packaging. Contact our support email with your order details to initiate an exchange.')}
              {activePolicy === 'privacy' && (siteConfig?.policies?.privacyPolicy || 'Your personal details (name, phone number, and delivery address) are strictly used to fulfill and deliver your orders safely and are never shared with third-party marketers.')}
              {activePolicy === 'terms' && (siteConfig?.policies?.termsOfService || `By placing an order with ${brandName}, you agree to provide accurate delivery information and honor Cash on Delivery payments upon doorstep arrival.`)}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ShopLayout;