import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faHeadset, faShieldHalved, faArrowRightArrowLeft, faArrowRight, faGrip } from '@fortawesome/free-solid-svg-icons';
import ShopLayout from './ShopLayout'; 
import ShopProductModal from './ShopProductModal';

const ShopHome = ({ branding, products = [], addToCart, siteConfig = {}, cartCount, openCart }) => {
  const themeColor = siteConfig.themeColor || '#2dd4bf';
  const fontFamily = siteConfig.fontFamily || "'Inter', sans-serif";
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Category & Display State
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAllProducts, setShowAllProducts] = useState(false);

  const categories = siteConfig.categories || [];
  const showHero = siteConfig.showHero !== false; 
  const showAbout = siteConfig.showAbout !== false;

  // --- FILTERING LOGIC ---
  // 1. Filter by selected category
  const categoryFiltered = products.filter(p => 
      activeCategory === 'All' ? true : p.category === activeCategory
  );

  // 2. Prioritize Featured Products (Max 6) if we aren't showing the full list yet
  let displayedProducts = [];
  if (showAllProducts) {
      displayedProducts = categoryFiltered;
  } else {
      const featured = categoryFiltered.filter(p => p.isFeatured);
      // If there are featured items, show up to 6. If not, just show the first 6 of the category.
      displayedProducts = featured.length > 0 ? featured.slice(0, 6) : categoryFiltered.slice(0, 6);
  }

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Default fallback images
  const defaultHero = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop';
  const defaultAbout = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop';

  return (
    <ShopLayout branding={branding} cartCount={cartCount} siteConfig={siteConfig} openCart={openCart}>
      
      <div style={{ background: '#f8fafc', color: '#0f172a', fontFamily: fontFamily }}>
        
        {/* === 1. HERO SECTION (Connected to Image Uploader) === */}
        {showHero && (
          <section id="home" style={{
            position: 'relative', height: '85vh', minHeight: '600px',
            background: `url("${siteConfig.heroImage || defaultHero}") center/cover no-repeat`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(15, 23, 42, 0.9))' }}></div>
            
            <div style={{ position: 'relative', zIndex: 1, color: '#fff', padding: '0 20px', maxWidth: '900px' }}>
              <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '30px', fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                {branding.industry || 'Premium Collection'}
              </div>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: '900', margin: '0 0 24px 0', lineHeight: '1.1', letterSpacing: '-1.5px' }}>
                {siteConfig.heroTitle || branding.slogan || 'Elevate Your Standard.'}
              </h1>
              <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', margin: '0 auto 40px auto', color: '#cbd5e1', maxWidth: '700px', lineHeight: '1.6', fontWeight: '400' }}>
                {siteConfig.heroSubtitle || 'Discover our latest collection curated for the modern trendsetter. Premium quality, unmatched style, delivered directly to your door.'}
              </p>
              <a href="#featured" style={{
                background: themeColor, color: '#fff', padding: '18px 48px', textDecoration: 'none',
                fontSize: '15px', fontWeight: '700', borderRadius: '50px', textTransform: 'uppercase', display: 'inline-block'
              }}>
                Shop Now
              </a>
            </div>
          </section>
        )}

        {/* === TRUST STRIP === */}
        <section style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px',
          padding: '40px 20px', background: '#fff', borderBottom: '1px solid #f1f5f9'
        }}>
          {[
            { icon: faTruckFast, title: 'Express Delivery' },
            { icon: faHeadset, title: '24/7 Concierge' },
            { icon: faShieldHalved, title: 'Secure Checkout' },
            { icon: faArrowRightArrowLeft, title: 'Free Returns' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: '24px', color: themeColor }} />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{item.title}</h4>
            </div>
          ))}
        </section>

        {/* === 2. DYNAMIC CATEGORY PILLS === */}
        <section id="catalog" style={{ paddingTop: '80px', paddingBottom: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', margin: '0 0 20px 0', color: '#0f172a', letterSpacing: '-1px' }}>
                    Shop by Category
                </h2>
                {categories.length > 0 ? (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                        <button 
                            onClick={() => { setActiveCategory('All'); setShowAllProducts(false); }}
                            style={{ 
                                padding: '10px 24px', borderRadius: '30px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeCategory === 'All' ? '#0f172a' : '#fff', 
                                color: activeCategory === 'All' ? '#fff' : '#475569', border: '1px solid #cbd5e1'
                            }}>
                            <FontAwesomeIcon icon={faGrip} style={{ marginRight: '8px' }}/> All
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.id} 
                                onClick={() => { setActiveCategory(cat.label); setShowAllProducts(false); }}
                                style={{ 
                                    padding: '10px 24px', borderRadius: '30px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                                    background: activeCategory === cat.label ? '#0f172a' : '#fff', 
                                    color: activeCategory === cat.label ? '#fff' : '#475569', border: '1px solid #cbd5e1'
                                }}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#64748b' }}>Categories will appear here once added in the editor.</p>
                )}
            </div>
        </section>

        {/* === 3. FEATURED PRODUCTS GRID === */}
        <section id="featured" style={{ padding: '40px 5% 80px 5%', maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
            {displayedProducts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                    <p style={{ color: '#64748b', fontSize: '16px', fontWeight: '600' }}>No products found in this category.</p>
                </div>
            ) : (
                displayedProducts.map(product => {
                    const isSoldOut = product.status === 'sold-out';
                    return (
                        <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product)}
                            style={{
                                background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid #f1f5f9', position: 'relative'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            {isSoldOut && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.5)', zIndex: 10, backdropFilter: 'grayscale(100%)' }}></div>
                            )}
                            {isSoldOut && (
                                <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', zIndex: 11, letterSpacing: '1px' }}>
                                    SOLD OUT
                                </div>
                            )}

                            <div style={{ aspectRatio: '4/5', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                            {product.images && product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>No Image</span>
                            )}
                            </div>

                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, background: '#fff' }}>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{product.name}</h3>
                                <p style={{ margin: '0', color: themeColor, fontWeight: '800', fontSize: '18px' }}>
                                    PKR {product.price.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )
                })
            )}
          </div>

          {/* === 4. VIEW ALL BUTTON === */}
          {!showAllProducts && categoryFiltered.length > 6 && (
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                  <button 
                    onClick={() => setShowAllProducts(true)}
                    style={{
                        background: '#0f172a', color: '#fff', border: 'none', padding: '18px 40px', borderRadius: '50px',
                        fontSize: '15px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
                        transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = themeColor}
                    onMouseOut={(e) => e.currentTarget.style.background = '#0f172a'}
                  >
                      View Full Collection <FontAwesomeIcon icon={faArrowRight} />
                  </button>
              </div>
          )}
        </section>

        {/* === 5. ABOUT SECTION (Connected to Image Uploader) === */}
        {showAbout && (
            <section id="about" style={{ background: '#0f172a', color: '#fff', padding: '120px 5%', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '200%', background: `radial-gradient(circle, ${themeColor}15 0%, transparent 70%)` }}></div>
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '80px', position: 'relative', zIndex: 1 }}>
                <div style={{ flex: '1 1 500px' }}>
                <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '30px', letterSpacing: '-1px', lineHeight: '1.1' }}>
                    The <span style={{ color: themeColor }}>{branding.name}</span> Standard.
                </h2>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '40px', fontWeight: '400' }}>
                    {siteConfig.aboutText || "We didn't just want to create another online store. We wanted to build an experience. Every item in our catalog is carefully selected to represent the pinnacle of modern quality and style."}
                </p>
                <div style={{ display: 'inline-block', borderBottom: `2px solid ${themeColor}`, paddingBottom: '8px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#fff' }}>
                    Established 2026
                </div>
                </div>
                
                <div style={{ flex: '1 1 400px', height: '500px', background: '#1e293b', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
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

export default ShopHome;