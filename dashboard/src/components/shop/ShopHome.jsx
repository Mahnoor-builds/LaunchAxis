import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faHeadset, faShieldHalved, faArrowRightArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ShopLayout from './ShopLayout'; 
import ShopProductModal from './ShopProductModal'; // <--- WE IMPORTED YOUR NEW MODAL

const ShopHome = ({ branding, products, addToCart, siteConfig, cartCount, openCart }) => {
  const themeColor = siteConfig?.themeColor || '#2dd4bf';
  
  // State to manage the popup modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to open the modal
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <ShopLayout branding={branding} cartCount={cartCount} siteConfig={siteConfig} openCart={openCart}>
      
      <div style={{ background: '#fafafa', color: '#111' }}>
        
        {/* === PRO HERO SECTION === */}
        <section id="home" style={{
          position: 'relative', height: '80vh', minHeight: '500px',
          background: 'url("https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop") center/cover no-repeat',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)' }}></div>
          <div style={{ position: 'relative', zIndex: 1, color: '#fff', padding: '0 20px', maxWidth: '800px' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>
              {branding.slogan || 'Elevate Your Lifestyle.'}
            </h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '40px', color: '#e2e8f0' }}>
              Discover our latest collection curated for the modern trendsetter. Premium quality, unmatched style, delivered right to your door.
            </p>
            <a href="#catalog" style={{
              background: themeColor, color: '#000', padding: '16px 40px', textDecoration: 'none',
              fontSize: '16px', fontWeight: 'bold', borderRadius: '4px', textTransform: 'uppercase', display: 'inline-block'
            }}>
              Explore Collection
            </a>
          </div>
        </section>

        {/* === THE TRUST STRIP === */}
        <section style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px',
          padding: '40px 20px', background: '#fff', borderBottom: '1px solid #eee'
        }}>
          {[
            { icon: faTruckFast, title: 'Free Shipping', desc: 'On orders over 5000 PKR' },
            { icon: faHeadset, title: '24/7 Support', desc: 'We are here to help' },
            { icon: faShieldHalved, title: 'Secure Payment', desc: '100% safe checkout' },
            { icon: faArrowRightArrowLeft, title: 'Easy Returns', desc: '7-day return policy' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <FontAwesomeIcon icon={item.icon} style={{ fontSize: '28px', color: themeColor }} />
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* === DYNAMIC PRODUCT CATALOG === */}
        <section id="catalog" style={{ padding: '80px 5%', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '15px' }}>New Arrivals</h2>
            <div style={{ width: '60px', height: '4px', background: themeColor, margin: '0 auto' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {products.map(product => (
              <div 
                key={product.id} 
                onClick={() => handleProductClick(product)} // <--- TRIGGERS THE POPUP
                style={{
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden',
                  cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: '320px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {product.images && product.images[0] ? (
                     <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500' }}>Product Image</span>
                  )}
                </div>

                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '600' }}>{product.name}</h3>
                  <p style={{ margin: '0', color: themeColor, fontWeight: '800', fontSize: '18px' }}>
                    PKR {product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* === THE BRAND STORY (ABOUT) === */}
        <section id="about" style={{ background: '#0f172a', color: '#fff', padding: '100px 5%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
            <div style={{ flex: '1 1 400px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '25px' }}>The {branding.name} Standard</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#94a3b8', marginBottom: '20px' }}>
                We didn't just want to create another online store. We wanted to build an experience. Every item in our catalog is carefully selected to represent the pinnacle of modern quality and style. 
              </p>
              <div style={{ display: 'inline-block', borderBottom: `3px solid ${themeColor}`, paddingBottom: '5px', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '10px' }}>
                Est. 2026
              </div>
            </div>
            
            <div style={{ flex: '1 1 400px', height: '450px', background: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop" alt="Brand Story" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.8' }} />
            </div>
          </div>
        </section>

      </div>

      {/* THE HIDDEN MODAL WAITING TO BE TRIGGERED */}
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