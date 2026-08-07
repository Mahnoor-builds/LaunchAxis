import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faHeadset, faShieldHalved, faArrowRightArrowLeft, faArrowRight, faBullhorn } from '@fortawesome/free-solid-svg-icons';
import ShopLayout from './ShopLayout'; 
import ShopProductModal from './ShopProductModal';

const ShopHome = ({ branding, products = [], addToCart, siteConfig = {}, cartCount, openCart }) => {
  const themeColor = siteConfig.themeColor || '#2dd4bf';
  const fontFamily = siteConfig.fontFamily || "'Inter', sans-serif";
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize the navigation hook
  const navigate = useNavigate();

  const categories = siteConfig.categories || [];
  const showHero = siteConfig.showHero !== false; 
  const showAbout = siteConfig.showAbout !== false;

  // --- ANNOUNCEMENT BAR LOGIC ---
  // Safely checks all common property names used by WebsiteEditor
  const announcementText = siteConfig.announcementText || siteConfig.announcement || siteConfig.announcementBar;
  const showAnnouncement = siteConfig.showAnnouncement !== false && Boolean(announcementText && announcementText.trim() !== '');

  // --- EDITORIAL FILTERING LOGIC ---
  // 1. Best Sellers: Explicitly checked as featured (Max 6)
  const bestSellerProducts = products.filter(p => p.isFeatured).slice(0, 6);
  
  // 2. New Arrivals: 4 most recent catalog items
  const newArrivalProducts = products.slice(0, 4);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // --- ROUTING LOGIC ---
  const goToCatalog = (categoryName = 'All') => {
      localStorage.setItem('launchAxisStoreCategory', categoryName);
      navigate('/catalog'); 
      window.scrollTo(0, 0);
  };

  const defaultHero = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop';
  const defaultAbout = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop';

  return (
    <ShopLayout branding={branding} cartCount={cartCount} siteConfig={siteConfig} openCart={openCart}>
      
      <div style={{ background: '#ffffff', color: '#0f172a', fontFamily: fontFamily }}>
        
        {/* === 0. EDITORIAL ANNOUNCEMENT BAR === */}
        {showAnnouncement && (
          <div style={{
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 20px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            borderBottom: `2px solid ${themeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <FontAwesomeIcon icon={faBullhorn} style={{ color: themeColor, fontSize: '13px' }} />
            <span>{announcementText}</span>
          </div>
        )}

        {/* === 1. HERO SECTION === */}
        {showHero && (
          <section id="home" style={{
            position: 'relative', height: '85vh', minHeight: '600px',
            background: `url("${siteConfig.heroImage || defaultHero}") center/cover no-repeat`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15, 23, 42, 0.9))' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, color: '#fff', padding: '0 20px', maxWidth: '900px' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '30px', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {branding.industry || 'Premium Collection'}
              </div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '900', margin: '0 0 24px 0', lineHeight: '1.1', letterSpacing: '-1.5px' }}>
                {siteConfig.heroTitle || branding.slogan || 'Elevate Your Standard.'}
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', margin: '0 auto 40px auto', color: '#cbd5e1', maxWidth: '700px', lineHeight: '1.6', fontWeight: '400' }}>
                {siteConfig.heroSubtitle || 'Discover our latest collection curated for the modern trendsetter.'}
              </p>
              <button onClick={() => goToCatalog('All')} style={{
                background: themeColor, color: '#fff', padding: '18px 48px', border: 'none', cursor: 'pointer',
                fontSize: '14px', fontWeight: '700', borderRadius: '50px', textTransform: 'uppercase', letterSpacing: '1px', display: 'inline-block'
              }}>
                Shop Now
              </button>
            </div>
          </section>
        )}

        {/* === TRUST STRIP === */}
        <section style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px',
          padding: '40px 20px', background: '#ffffff', borderBottom: '1px solid #f1f5f9'
        }}>
          {[
            { icon: faTruckFast, title: 'Express Delivery' },
            { icon: faHeadset, title: '24/7 Concierge' },
            { icon: faShieldHalved, title: 'Secure Checkout' },
            { icon: faArrowRightArrowLeft, title: 'Free Returns' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: '20px', color: themeColor }} />
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.title}</h4>
            </div>
          ))}
        </section>

        {/* === 2. EDITORIAL CATEGORY CARDS === */}
        {categories.length > 0 && (
            <section id="category-circles" style={{ paddingTop: '90px', paddingBottom: '40px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Shop by Category
              </h2>
              <div style={{ width: '40px', height: '2px', background: themeColor, margin: '0 auto 40px auto' }}></div>
              
              <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 20px' }}>
                  <div 
                      onClick={() => goToCatalog('All')}
                      style={{ cursor: 'pointer', textAlign: 'center', width: '110px' }}
                  >
                      <div style={{ 
                          width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 12px auto', overflow: 'hidden', 
                          border: `2px solid #e2e8f0`, transition: 'all 0.3s',
                          background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold'
                      }} onMouseOver={e => e.currentTarget.style.borderColor = themeColor} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                          All
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>All Products</span>
                  </div>

                  {categories.map(cat => (
                      <div 
                          key={cat.id} 
                          onClick={() => goToCatalog(cat.label)}
                          style={{ cursor: 'pointer', textAlign: 'center', width: '110px' }}
                      >
                          <div style={{ 
                              width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 12px auto', overflow: 'hidden', 
                              border: `2px solid #e2e8f0`, transition: 'all 0.3s',
                              background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }} onMouseOver={e => e.currentTarget.style.borderColor = themeColor} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                              {cat.image ? (
                                  <img src={cat.image} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                  <span style={{ fontSize: '12px', color: '#94a3b8', padding: '5px', textAlign: 'center' }}>{cat.label}</span>
                              )}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{cat.label}</span>
                      </div>
                  ))}
              </div>
          </section>
        )}

        {/* === 3. BEST SELLERS SECTION === */}
        {bestSellerProducts.length > 0 && (
          <section id="featured" style={{ padding: '60px 5% 60px 5%', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Best Sellers
              </h2>
              <div style={{ width: '40px', height: '2px', background: themeColor, margin: '0 auto' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {bestSellerProducts.map(product => (
                  <ProductCard key={`feat-${product.id}`} product={product} onClick={() => handleProductClick(product)} themeColor={themeColor} />
              ))}
            </div>
          </section>
        )}

        {/* === 4. NEW ARRIVALS SECTION === */}
        {newArrivalProducts.length > 0 && (
          <section style={{ padding: '40px 5% 90px 5%', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  New Arrivals
              </h2>
              <div style={{ width: '40px', height: '2px', background: themeColor, margin: '0 auto' }}></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {newArrivalProducts.map(product => (
                  <ProductCard key={`prev-${product.id}`} product={product} onClick={() => handleProductClick(product)} themeColor={themeColor} />
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '60px' }}>
                <button 
                  onClick={() => goToCatalog('All')}
                  style={{
                      background: '#0f172a', color: '#fff', border: 'none', padding: '16px 44px', borderRadius: '4px',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', 
                      letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = themeColor}
                  onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
                >
                    View Full Collection <FontAwesomeIcon icon={faArrowRight} />
                </button>
            </div>
          </section>
        )}

        {/* === 5. ABOUT SECTION === */}
        {showAbout && (
            <section id="about" style={{ background: '#0f172a', color: '#fff', padding: '120px 5%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '80px', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: '1 1 500px' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '30px', letterSpacing: '-1px', lineHeight: '1.1' }}>
                    The <span style={{ color: themeColor }}>{branding.name}</span> Standard.
                </h2>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '40px', fontWeight: '400' }}>
                    {siteConfig.aboutText || "We didn't just want to create another online store. We wanted to build an experience. Every item in our catalog is carefully selected to represent the pinnacle of modern quality and style."}
                </p>
                </div>
                
                <div style={{ flex: '1 1 400px', height: '500px', background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
                <img src={siteConfig.aboutImage || defaultAbout} alt="Brand Story" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.9' }} />
                </div>
            </div>
            </section>
        )}

      </div>

      <ShopProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addToCart={addToCart}
        themeColor={themeColor}
      />
    </ShopLayout>
  );
};

// --- EDITORIAL PRODUCT CARD COMPONENT ---
const ProductCard = ({ product, onClick, themeColor }) => {
    const isSoldOut = product.status === 'sold-out';
    return (
        <div 
            onClick={onClick}
            style={{
                background: '#fff', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid #f1f5f9', position: 'relative'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 15px 30px -10px rgba(0,0,0,0.08)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {isSoldOut && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.6)', zIndex: 10, backdropFilter: 'grayscale(100%)' }}></div>
            )}
            {isSoldOut && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: '800', zIndex: 11, letterSpacing: '1.5px' }}>
                    SOLD OUT
                </div>
            )}

            {product.promoBadge && !isSoldOut && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#0f172a', color: '#fff', padding: '5px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: '700', zIndex: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {product.promoBadge}
                </div>
            )}
            {!product.promoBadge && product.isFeatured && !isSoldOut && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', background: '#0f172a', color: '#fff', padding: '5px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: '700', zIndex: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    BEST SELLER
                </div>
            )}

            <div style={{ aspectRatio: '4/5', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>No Image</span>
            )}
            </div>

            <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', flex: 1, background: '#fff', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a', letterSpacing: '0.3px' }}>{product.name}</h3>
                <p style={{ margin: '0', color: themeColor, fontWeight: '700', fontSize: '15px' }}>
                    PKR {Number(product.price || 0).toLocaleString()}
                </p>
            </div>
        </div>
    )
};

export default ShopHome;