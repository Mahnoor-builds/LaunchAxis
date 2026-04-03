import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faUser, faSearch, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';

// NEW PROPS ADDED: siteConfig and openCart
const ShopLayout = ({ children, branding, cartCount, siteConfig, openCart }) => {
  
  // Fallback config ensures the site doesn't break if data is still loading
  const config = siteConfig || {
    themeColor: '#2dd4bf',
    menuItems: [
        { id: 1, label: 'Home', link: '/' },
        { id: 2, label: 'Catalog', link: '#catalog' },
        { id: 3, label: 'About', link: '#about' }
    ],
    supportEmail: 'help@launchaxis.com'
  };

  // Smooth scroll handler for anchor links (e.g., #catalog, #about)
  const handleScroll = (e, link) => {
    if (link.startsWith('#')) {
      e.preventDefault();
      const element = document.getElementById(link.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div style={{fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh', display:'flex', flexDirection:'column'}}>
      
      {/* === NAVBAR === */}
      <nav style={{
          borderBottom: '1px solid #eee', padding: '15px 5%', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', zIndex: 100, backdropFilter: 'blur(5px)'
      }}>
        
        {/* BRAND LOGO */}
        <Link to="/" style={{textDecoration:'none', color:'#000', display:'flex', alignItems:'center', gap:'10px'}}>
            {branding.logo ? (
                <img src={branding.logo} alt="Logo" style={{height:'35px', borderRadius:'5px'}} />
            ) : (
                <div style={{fontSize:'24px', fontWeight:'900', letterSpacing:'-1px'}}>{branding.name}</div>
            )}
        </Link>

        {/* DESKTOP LINKS (Dynamically generated from Dashboard) */}
        <div className="desktop-menu" style={{display:'flex', gap:'30px', fontSize:'14px', fontWeight:'500'}}>
            {config.menuItems.map(item => (
                <a 
                  key={item.id} 
                  href={item.link}
                  onClick={(e) => handleScroll(e, item.link)}
                  style={{textDecoration:'none', color:'#333', cursor: 'pointer', transition: 'color 0.2s'}}
                  onMouseOver={(e) => e.target.style.color = config.themeColor}
                  onMouseOut={(e) => e.target.style.color = '#333'}
                >
                  {item.label}
                </a>
            ))}
        </div>

        {/* ICONS */}
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <FontAwesomeIcon icon={faSearch} style={{color:'#777', cursor:'pointer'}} />
            
            {/* CART ICON (Now triggers the slide-out drawer) */}
            <div onClick={openCart} style={{position:'relative', color:'#333', cursor:'pointer'}}>
                <FontAwesomeIcon icon={faShoppingBag} size="lg" />
                {cartCount > 0 && (
                    <span style={{
                        position:'absolute', top:'-8px', right:'-8px', 
                        background:'#000', color:'#fff', fontSize:'10px', 
                        width:'16px', height:'16px', borderRadius:'50%', 
                        display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'
                    }}>
                        {cartCount}
                    </span>
                )}
            </div>
            
            <FontAwesomeIcon icon={faUser} style={{color:'#777', cursor:'pointer'}} />
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <main style={{flex:1}}>
        {children}
      </main>

      {/* === PROFESSIONAL FOOTER === */}
      <footer style={{background:'#0f172a', color:'#f8fafc', padding:'80px 5% 40px 5%'}}>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'40px', maxWidth:'1200px', margin:'0 auto'}}>
            
            {/* 1. Brand Column */}
            <div>
                <h3 style={{fontSize:'24px', margin:'0 0 15px 0', color: config.themeColor}}>{branding.name}</h3>
                <p style={{color:'#94a3b8', fontSize:'14px', lineHeight:'1.6', marginBottom:'20px'}}>
                    {branding.slogan || 'Defining the future of retail.'} <br/>
                    Premium quality, delivered directly to your doorstep.
                </p>
                <div style={{display:'flex', gap:'15px'}}>
                    <FontAwesomeIcon icon={faFacebook} size="lg" style={{color:'#94a3b8', cursor:'pointer', transition:'color 0.2s'}} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#94a3b8'} />
                    <FontAwesomeIcon icon={faInstagram} size="lg" style={{color:'#94a3b8', cursor:'pointer', transition:'color 0.2s'}} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#94a3b8'} />
                    <FontAwesomeIcon icon={faTwitter} size="lg" style={{color:'#94a3b8', cursor:'pointer', transition:'color 0.2s'}} onMouseOver={(e)=>e.target.style.color='#fff'} onMouseOut={(e)=>e.target.style.color='#94a3b8'} />
                </div>
            </div>

            {/* 2. Quick Links Column */}
            <div>
                <h4 style={{marginBottom:'20px', fontSize:'16px', fontWeight:'600'}}>Shop Links</h4>
                <div style={{display:'flex', flexDirection:'column', gap:'12px', fontSize:'14px', color:'#94a3b8'}}>
                    {config.menuItems.map(item => (
                        <a key={item.id} href={item.link} onClick={(e) => handleScroll(e, item.link)} style={{color:'#94a3b8', textDecoration:'none', cursor:'pointer'}}>{item.label}</a>
                    ))}
                </div>
            </div>

            {/* 3. Support Column */}
            <div>
                <h4 style={{marginBottom:'20px', fontSize:'16px', fontWeight:'600'}}>Customer Care</h4>
                <div style={{display:'flex', flexDirection:'column', gap:'12px', fontSize:'14px', color:'#94a3b8'}}>
                    <span style={{cursor:'pointer'}}>Track Order</span>
                    <span style={{cursor:'pointer'}}>Shipping Policy</span>
                    <span style={{cursor:'pointer'}}>Returns & Exchange</span>
                    <span style={{cursor:'pointer'}}>Contact: {config.supportEmail}</span>
                </div>
            </div>

            {/* 4. Newsletter Column */}
            <div>
                <h4 style={{marginBottom:'20px', fontSize:'16px', fontWeight:'600'}}>Stay in the Loop</h4>
                <p style={{color:'#94a3b8', fontSize:'14px', marginBottom:'15px'}}>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                <div style={{display:'flex', border:'1px solid #334155', borderRadius:'4px', overflow:'hidden'}}>
                    <input type="email" placeholder="Enter your email" style={{padding:'12px 15px', background:'transparent', border:'none', color:'#fff', width:'100%', outline:'none', fontSize:'14px'}} />
                    <button style={{background: config.themeColor, border:'none', padding:'0 20px', cursor:'pointer', color:'#000'}}>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            </div>
        </div>
        
        
        <div style={{borderTop:'1px solid #1e293b', marginTop:'60px', paddingTop:'25px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'13px', color:'#64748b', flexWrap:'wrap', gap:'10px'}}>
            <div>&copy; 2026 {branding.name}. All rights reserved.</div>
            <div>Powered by <strong style={{color:'#fff'}}>LaunchAxis</strong></div>
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;