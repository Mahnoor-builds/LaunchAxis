import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingBag, faUser, faSearch, faBars } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';

const ShopLayout = ({ children, branding, cartCount }) => {
  // FIREBASE TODO: Fetch 'siteConfig' (colors, social links) from Database here later.
  // For now, we use defaults or props passed down.
  
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

        {/* DESKTOP LINKS (Hidden on mobile) */}
        <div className="desktop-menu" style={{display:'flex', gap:'30px', fontSize:'14px', fontWeight:'500'}}>
            <Link to="/" style={{textDecoration:'none', color:'#333'}}>Home</Link>
            <Link to="/" style={{textDecoration:'none', color:'#333'}}>Catalog</Link>
            <Link to="/" style={{textDecoration:'none', color:'#333'}}>About</Link>
        </div>

        {/* ICONS */}
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <FontAwesomeIcon icon={faSearch} style={{color:'#777', cursor:'pointer'}} />
            <Link to="/checkout" style={{position:'relative', color:'#333'}}>
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
            </Link>
            <FontAwesomeIcon icon={faUser} style={{color:'#777', cursor:'pointer'}} />
        </div>
      </nav>

      {/* === MAIN CONTENT (Where Home/Product/Checkout goes) === */}
      <main style={{flex:1}}>
        {children}
      </main>

      {/* === FOOTER === */}
      <footer style={{background:'#111', color:'#fff', padding:'60px 5%'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'40px', maxWidth:'1200px', margin:'0 auto'}}>
            <div>
                <h3 style={{fontSize:'24px', margin:'0 0 15px 0'}}>{branding.name}</h3>
                <p style={{color:'#888', fontSize:'14px', lineHeight:'1.6', maxWidth:'300px'}}>
                    {branding.slogan || 'Defining the future of retail.'} <br/>
                    We provide the best quality products directly to your doorstep.
                </p>
                <div style={{marginTop:'20px', display:'flex', gap:'15px'}}>
                    <FontAwesomeIcon icon={faFacebook} size="lg" style={{color:'#888', cursor:'pointer'}} />
                    <FontAwesomeIcon icon={faInstagram} size="lg" style={{color:'#888', cursor:'pointer'}} />
                </div>
            </div>
            <div style={{textAlign:'right'}}>
                <h4 style={{marginBottom:'20px'}}>Customer Care</h4>
                <div style={{display:'flex', flexDirection:'column', gap:'10px', fontSize:'14px', color:'#888'}}>
                    <span>Track Order</span>
                    <span>Shipping Policy</span>
                    <span>Returns & Exchange</span>
                    <span>Contact Support</span>
                </div>
            </div>
        </div>
        <div style={{borderTop:'1px solid #333', marginTop:'40px', paddingTop:'20px', textAlign:'center', fontSize:'12px', color:'#555'}}>
            &copy; 2026 {branding.name}. Powered by LaunchAxis.
        </div>
      </footer>
    </div>
  );
};

export default ShopLayout;