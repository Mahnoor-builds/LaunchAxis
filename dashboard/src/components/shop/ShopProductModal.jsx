import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faMinus, faStar, faShieldHalved, faTruckFast } from '@fortawesome/free-solid-svg-icons';

const ShopProductModal = ({ product, isOpen, onClose, addToCart, themeColor }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Reset state every time a new product is opened
  useEffect(() => {
    if (isOpen && product) {
      setCurrentImage(0);
      setQty(1);
      
      // Auto-select the first option for any available variants
      const initialVariants = {};
      if (product.variants) {
        product.variants.forEach(v => {
          if (v.options && v.options.length > 0) {
            initialVariants[v.name] = v.options[0];
          }
        });
      }
      setSelectedVariants(initialVariants);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleVariantSelect = (variantName, optionValue) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: optionValue }));
  };

  const handleAddToCart = () => {
    const finalProduct = {
      ...product,
      qty: qty,
      selectedVariants: selectedVariants,
      cartId: `${product.id}-${JSON.stringify(selectedVariants)}`
    };
    
    addToCart(finalProduct);
    onClose();
  };

  const images = product.images && product.images.length > 0 ? product.images : [null];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)',
      opacity: isOpen ? 1 : 0, transition: 'opacity 0.3s ease-in-out'
    }} onClick={onClose}>
      
      {/* Modal Container */}
      <div style={{
        background: '#fff', width: '100%', maxWidth: '1000px', maxHeight: '90vh', borderRadius: '20px',
        display: 'flex', flexWrap: 'wrap', overflowY: 'auto', position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9',
          border: 'none', width: '40px', height: '40px', borderRadius: '50%',
          cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s, transform 0.2s'
        }} 
        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.transform = 'scale(1.1)'; }} 
        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'scale(1)'; }}>
          <FontAwesomeIcon icon={faXmark} size="lg" style={{ color: '#0f172a' }} />
        </button>

        {/* === LEFT SIDE: IMAGE GALLERY === */}
        <div style={{ flex: '1 1 400px', background: '#f8fafc', padding: '30px', display:'flex', flexDirection:'column', gap: '15px' }}>
          
          <div style={{ flex: 1, background: '#fff', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', minHeight: '350px' }}>
            {images[currentImage] ? (
              <img src={images[currentImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '16px', fontWeight: '600' }}>No Image Provided</span>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {images.map((img, idx) => (
                <div key={idx} onClick={() => setCurrentImage(idx)} style={{ 
                  width: '80px', height: '80px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden',
                  border: currentImage === idx ? `2px solid ${themeColor}` : '1px solid #cbd5e1',
                  opacity: currentImage === idx ? 1 : 0.6, transition: 'all 0.2s'
                }}>
                  <img src={img} alt={`Thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === RIGHT SIDE: PRODUCT DETAILS === */}
        <div style={{ flex: '1 1 450px', padding: '40px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ color: themeColor, fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {product.category || 'Premium Collection'}
              </div>
              <div style={{ display: 'flex', color: '#eab308', fontSize: '12px', gap: '2px' }}>
                  <FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} />
                  <span style={{ color: '#64748b', marginLeft: '5px' }}>(4.9)</span>
              </div>
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', margin: '0 0 15px 0', color: '#0f172a', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
            {product.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '15px', margin: '0 0 25px 0' }}>
              <p style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                PKR {product.price.toLocaleString()}
              </p>
              <span style={{ color: '#10b981', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>
                  IN STOCK
              </span>
          </div>

          <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '15px', marginBottom: '30px' }}>
            {product.description || 'Elevate your everyday with this premium item. Crafted with precision and designed for the modern lifestyle, it delivers both unmatched functionality and aesthetic brilliance.'}
          </p>
          
          {/* DYNAMIC VARIANTS ENGINE */}
          {product.variants && product.variants.length > 0 && (
            <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {product.variants.map((variant, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{variant.name}</span>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>{selectedVariants[variant.name]}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {variant.options.map((opt, i) => {
                      const isSelected = selectedVariants[variant.name] === opt;
                      return (
                        <button 
                          key={i} onClick={() => handleVariantSelect(variant.name, opt)}
                          style={{
                            padding: '10px 20px', background: isSelected ? '#0f172a' : '#fff', 
                            color: isSelected ? '#fff' : '#0f172a',
                            border: isSelected ? '1px solid #0f172a' : '1px solid #cbd5e1',
                            borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart Row */}
          <div style={{ display: 'flex', gap: '15px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '5px' }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569', fontSize: '16px' }}>
                      <FontAwesomeIcon icon={faMinus} />
                  </button>
                  <span style={{ width: '40px', textAlign: 'center', fontWeight: '800', fontSize: '16px', color: '#0f172a' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#475569', fontSize: '16px' }}>
                      <FontAwesomeIcon icon={faPlus} />
                  </button>
              </div>

              <button 
                onClick={handleAddToCart} 
                style={{
                  flex: 1, padding: '0 20px', background: themeColor, color: '#fff', border: 'none',
                  borderRadius: '12px', fontSize: '16px', fontWeight: '800', textTransform: 'uppercase', 
                  cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '1px',
                  boxShadow: `0 10px 20px -5px ${themeColor}66`
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                Add to Bag • PKR {(product.price * qty).toLocaleString()}
              </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px', padding: '15px', background: '#f8fafc', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: '600' }}>
                  <FontAwesomeIcon icon={faShieldHalved} style={{ color: themeColor, fontSize: '16px' }} /> Secure Transaction
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '12px', fontWeight: '600' }}>
                  <FontAwesomeIcon icon={faTruckFast} style={{ color: themeColor, fontSize: '16px' }} /> Ships within 24hrs
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopProductModal;