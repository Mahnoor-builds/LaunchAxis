import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruckFast, faHeadset, faShieldHalved, faArrowRightArrowLeft, 
  faArrowRight, faBullhorn, faTags, faAward, faBoxOpen, faEye
} from '@fortawesome/free-solid-svg-icons';
import ShopLayout from './ShopLayout'; 
import ShopProductModal from './ShopProductModal';

const ShopHome = ({ branding = {}, products = [], addToCart, siteConfig = {}, cartCount = 0, openCart }) => {
  const themeColor = siteConfig?.themeColor || branding?.color || '#2563eb';
  const fontFamily = branding?.font || siteConfig?.fontFamily || "'Inter', sans-serif";
  const brandName = branding?.name && branding.name !== 'Loading...' ? branding.name : 'Our Store';
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  const categories = siteConfig?.categories || [];
  const showHero = siteConfig?.showHero !== false; 
  const showAbout = siteConfig?.showAbout !== false;

  // --- ANNOUNCEMENT BAR LOGIC ---
  const announcementText = siteConfig?.announcementText || siteConfig?.announcement || siteConfig?.announcementBar;
  const showAnnouncement = siteConfig?.showAnnouncement !== false && Boolean(announcementText && announcementText.trim() !== '');

  // --- PRODUCT SHOWCASE LOGIC ---
  const bestSellerProducts = products.filter(p => p.isFeatured).slice(0, 6);
  const newArrivalProducts = products.slice(0, 8);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // --- FIXED ROUTING LOGIC (Points to /store/catalog) ---
  const goToCatalog = (categoryName = 'All') => {
    localStorage.setItem('launchAxisStoreCategory', categoryName);
    navigate('/store/catalog'); 
    window.scrollTo(0, 0);
  };

  const defaultHero = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop';
  const defaultAbout = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop';

  const trustBadges = [
    { icon: faTruckFast, title: 'Fast Nationwide Delivery', sub: 'Doorstep COD in 2–4 days', color: '#059669', bg: '#ecfdf5' },
    { icon: faShieldHalved, title: '100% Authentic Quality', sub: 'Inspected before dispatch', color: '#2563eb', bg: '#eff6ff' },
    { icon: faArrowRightArrowLeft, title: 'Easy Return & Exchange', sub: 'Hassle-free replacement', color: '#ea580c', bg: '#fff7ed' },
    { icon: faHeadset, title: 'Dedicated Customer Care', sub: 'Responsive support team', color: '#4f46e5', bg: '#eef2ff' }
  ];

  const categoryColors = [
    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
    { color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' }
  ];

  return (
    <ShopLayout branding={branding} cartCount={cartCount} siteConfig={siteConfig} openCart={openCart}>
      
      <div style={{ background: '#ffffff', color: '#0f172a', fontFamily }}>
        
        {/* === 0. ANNOUNCEMENT BAR === */}
        {showAnnouncement && (
          <div style={{
            background: '#0f172a', color: '#ffffff', padding: '10px 20px',
            textAlign: 'center', fontSize: '12px', fontWeight: '700',
            letterSpacing: '0.8px', borderBottom: `2px solid ${themeColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}>
            <FontAwesomeIcon icon={faBullhorn} style={{ color: '#f97316', fontSize: '13px' }} />
            <span>{announcementText}</span>
          </div>
        )}

        {/* === 1. HERO SECTION === */}
        {showHero && (
          <section id="home" style={{
            position: 'relative', minHeight: '78vh', padding: '80px 20px',
            background: `url("${siteConfig.heroImage || defaultHero}") center/cover no-repeat`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.88))' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, color: '#ffffff', maxWidth: '840px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', borderRadius: '30px', fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.25)' }}>
                <FontAwesomeIcon icon={faAward} style={{ color: '#fb923c' }} />
                <span>{brandName} Official Storefront</span>
              </div>

              <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1.12', letterSpacing: '-1px', color: '#ffffff' }}>
                {siteConfig.heroTitle || branding.slogan || 'Crafted for Everyday Excellence.'}
              </h1>

              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', margin: '0 auto 36px auto', color: '#e2e8f0', maxWidth: '650px', lineHeight: '1.6' }}>
                {siteConfig.heroSubtitle || 'Explore our signature collection designed with premium quality and modern style.'}
              </p>

              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => goToCatalog('All')} 
                  style={{
                    background: themeColor, color: '#ffffff', padding: '16px 36px', border: 'none', cursor: 'pointer',
                    fontSize: '14px', fontWeight: '800', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '10px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.35)'
                  }}
                >
                  <span>Shop Collection</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* === 2. MULTI-ACCENT TRUST BENTO STRIP === */}
        <section style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '28px 5%' }}>
          <div style={{ maxWidth: '1320px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
            {trustBadges.map((item, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>
                  <FontAwesomeIcon icon={item.icon} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{item.title}</h4>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === 3. SHOP BY COLLECTION CARDS === */}
        {categories.length > 0 && (
          <section style={{ padding: '64px 5% 24px 5%', maxWidth: '1320px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#ea580c', display: 'block', marginBottom: '4px' }}>
                  Curated Collections
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Browse by Category
                </h2>
              </div>
              <button 
                onClick={() => goToCatalog('All')}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '9px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '700', color: '#0f172a', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                View All Products <FontAwesomeIcon icon={faArrowRight} style={{ color: '#ea580c', fontSize: '11px' }} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
              <div 
                onClick={() => goToCatalog('All')}
                style={{ cursor: 'pointer', background: '#0f172a', color: '#ffffff', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)' }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Complete Catalog</span>
                  <strong style={{ fontSize: '18px', fontWeight: '800' }}>All Products ({products.length})</strong>
                </div>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faArrowRight} />
                </div>
              </div>

              {categories.map((cat, idx) => {
                const palette = categoryColors[idx % categoryColors.length];
                const itemCount = products.filter(p => p.category === cat.label).length;
                return (
                  <div 
                    key={cat.id || idx} 
                    onClick={() => goToCatalog(cat.label)}
                    style={{ cursor: 'pointer', background: palette.bg, border: `1px solid ${palette.border}`, padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: palette.color, display: 'block', marginBottom: '4px' }}>
                        {itemCount} Product{itemCount === 1 ? '' : 's'}
                      </span>
                      <strong style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{cat.label}</strong>
                    </div>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ffffff', color: palette.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                      <FontAwesomeIcon icon={faTags} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* === 4. BEST SELLERS SECTION === */}
        {bestSellerProducts.length > 0 && (
          <section id="featured" style={{ padding: '56px 5% 24px 5%', maxWidth: '1320px', margin: '0 auto' }}>
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#059669', display: 'block', marginBottom: '4px' }}>
                Customer Favorites
              </span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Best Sellers
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {bestSellerProducts.map(product => (
                <ProductCard key={`feat-${product.id}`} product={product} onClick={() => handleProductClick(product)} themeColor={themeColor} />
              ))}
            </div>
          </section>
        )}

        {/* === 5. LATEST ARRIVALS / ALL PRODUCTS SECTION === */}
        <section style={{ padding: '56px 5% 80px 5%', maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#2563eb', display: 'block', marginBottom: '4px' }}>
                Fresh In Stock
              </span>
              <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>
                Latest Arrivals
              </h2>
            </div>
          </div>

          {newArrivalProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '36px', color: '#94a3b8', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Catalog Coming Soon</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>New products are being added to our store. Check back shortly!</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
                {newArrivalProducts.map(product => (
                  <ProductCard key={`prev-${product.id}`} product={product} onClick={() => handleProductClick(product)} themeColor={themeColor} />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <button 
                  onClick={() => goToCatalog('All')}
                  style={{
                    background: '#0f172a', color: '#ffffff', border: 'none', padding: '15px 36px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', 
                    boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.2)'
                  }}
                >
                  <span>Browse Full Catalog</span>
                  <FontAwesomeIcon icon={faArrowRight} style={{ color: '#f97316' }} />
                </button>
              </div>
            </>
          )}
        </section>

        {/* === 6. ABOUT SECTION === */}
        {showAbout && (
          <section id="about" style={{ background: '#0f172a', color: '#ffffff', padding: '96px 5%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '56px', position: 'relative', zIndex: 1 }}>
              <div style={{ flex: '1 1 460px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#fb923c', background: 'rgba(249, 115, 22, 0.15)', padding: '5px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '16px' }}>
                  Our Brand Story
                </span>
                <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', margin: '0 0 20px 0', letterSpacing: '-0.8px', lineHeight: '1.15', color: '#ffffff' }}>
                  The <span style={{ color: themeColor }}>{brandName}</span> Standard
                </h2>
                <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '28px', whiteSpace: 'pre-wrap' }}>
                  {siteConfig.aboutText || "Every item in our collection is selected and crafted with uncompromising attention to quality, durability, and customer satisfaction."}
                </p>
                <button 
                  onClick={() => goToCatalog('All')}
                  style={{ background: '#ffffff', color: '#0f172a', border: 'none', padding: '13px 26px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  Explore Products <FontAwesomeIcon icon={faArrowRight} style={{ color: themeColor }} />
                </button>
              </div>
              
              <div style={{ flex: '1 1 380px', height: '420px', background: '#1e293b', borderRadius: '18px', overflow: 'hidden', border: '1px solid #334155' }}>
                <img src={siteConfig.aboutImage || defaultAbout} alt="Brand Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          </section>
        )}

      </div>

      {/* PRODUCT QUICK-VIEW & FAQ MODAL */}
      <ShopProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addToCart={addToCart}
        themeColor={themeColor}
        siteConfig={siteConfig}
      />
    </ShopLayout>
  );
};

// --- BENTO RETAIL PRODUCT CARD COMPONENT ---
const ProductCard = ({ product, onClick, themeColor }) => {
  const isSoldOut = product.status === 'sold-out';
  const safePrice = Math.max(0, Number(product.price) || 0);

  return (
    <div 
      onClick={onClick}
      style={{
        background: '#ffffff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
        transition: 'all 0.25s ease', border: '1px solid #e2e8f0', position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}
      onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 32px -10px rgba(15, 23, 42, 0.1)'; }}
      onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
    >
      {/* Status & Promo Badges */}
      {isSoldOut ? (
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', zIndex: 11 }}>
          SOLD OUT
        </div>
      ) : (product.promoBadge || product.isFeatured) ? (
        <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#0f172a', color: '#ffffff', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', zIndex: 11, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
          {product.promoBadge || 'BEST SELLER'}
        </div>
      ) : null}

      <div style={{ aspectRatio: '4/5', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
        {product.images && product.images[0] ? (
          <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isSoldOut ? 'grayscale(80%)' : 'none' }} />
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>No Image</span>
        )}
      </div>

      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', background: '#ffffff' }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>
            {product.category || 'Collection'}
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
            {product.name}
          </h3>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
          <span style={{ color: '#059669', fontWeight: '900', fontSize: '17px' }}>
            PKR {safePrice.toLocaleString()}
          </span>
          <span style={{ fontSize: '11px', fontWeight: '800', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <FontAwesomeIcon icon={faEye} style={{ color: themeColor }} /> View Details
          </span>
        </div>
      </div>
    </div>
  );
};

export default ShopHome;