import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, faPlus, faMinus, faStar, faShieldHalved, 
  faTruckFast, faCheckCircle, faBan, faShoppingBag, 
  faLayerGroup, faCircleInfo, faRotateLeft
} from '@fortawesome/free-solid-svg-icons';

const ShopProductModal = ({ product, isOpen, onClose, addToCart, themeColor = '#2563eb', siteConfig = {} }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [openAccordion, setOpenAccordion] = useState(0);

  // Reset state every time a new product is opened
  useEffect(() => {
    if (isOpen && product) {
      setCurrentImage(0);
      setQty(1);
      setOpenAccordion(0);
      
      // Auto-select the first option for any available variants
      const initialVariants = {};
      if (Array.isArray(product.variants)) {
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

  const isSoldOut = product.status === 'sold-out';
  const safePrice = Math.max(0, Number(product.price) || 0);

  const handleVariantSelect = (variantName, optionValue) => {
    setSelectedVariants(prev => ({ ...prev, [variantName]: optionValue }));
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    const finalProduct = {
      ...product,
      price: safePrice,
      qty: Math.max(1, qty),
      selectedVariants: selectedVariants,
      cartId: `${product.id}-${JSON.stringify(selectedVariants)}`
    };
    
    addToCart(finalProduct);
    onClose();
  };

  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : [null];

  // Combine founder's custom infoSections with a helpful Shipping & Exchange tab
  const customSections = Array.isArray(product.infoSections) ? product.infoSections : [];
  const shippingPolicyText = siteConfig?.policies?.shippingPolicy || 'Orders are processed within 24 hours and delivered nationwide in 2–4 business days with Cash on Delivery.';
  const refundPolicyText = siteConfig?.policies?.refundPolicy || 'Easy 7-day return and exchange on unused items in original packaging.';

  const allAccordionTabs = [
    ...customSections,
    {
      id: 'default_shipping_tab',
      title: 'Shipping & Easy Returns',
      content: `${shippingPolicyText}\n\n${refundPolicyText}`
    }
  ];

  return (
    <div 
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15, 23, 42, 0.72)', zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)',
        fontFamily: "'Inter', sans-serif"
      }} 
      onClick={onClose}
    >
      
      {/* Modal Container */}
      <div 
        style={{
          background: '#ffffff', width: '100%', maxWidth: '1020px', maxHeight: '90vh', borderRadius: '20px',
          display: 'flex', flexWrap: 'wrap', overflowY: 'auto', position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)', border: '1px solid #e2e8f0'
        }} 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute', top: '18px', right: '18px', background: '#f8fafc',
            border: '1px solid #cbd5e1', width: '38px', height: '38px', borderRadius: '50%',
            cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#0f172a'
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {/* === LEFT SIDE: INTERACTIVE IMAGE GALLERY === */}
        <div style={{ flex: '1 1 400px', background: '#f8fafc', padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid #e2e8f0' }}>
          
          <div style={{ position: 'relative', flex: 1, background: '#ffffff', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', minHeight: '360px' }}>
            {(product.promoBadge || product.isFeatured) && !isSoldOut && (
              <span style={{ position: 'absolute', top: '14px', left: '14px', background: '#0f172a', color: '#ffffff', padding: '5px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                {product.promoBadge || 'BEST SELLER'}
              </span>
            )}

            {images[currentImage] ? (
              <img src={images[currentImage]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '420px' }} />
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '700' }}>No Product Image</span>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentImage(idx)} 
                  style={{ 
                    width: '74px', height: '74px', borderRadius: '10px', cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                    border: currentImage === idx ? `2px solid ${themeColor}` : '1px solid #cbd5e1',
                    opacity: currentImage === idx ? 1 : 0.6, background: '#ffffff'
                  }}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === RIGHT SIDE: PRODUCT OVERVIEW, VARIANTS & FAQ ACCORDIONS === */}
        <div style={{ flex: '1.1 1 440px', padding: '34px 32px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Category & Rating */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', paddingRight: '32px' }}>
            <span style={{ background: '#eef2ff', color: '#4f46e5', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '4px 10px', borderRadius: '6px' }}>
              {product.category || 'Collection'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', fontSize: '12px', gap: '3px' }}>
              <FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} /><FontAwesomeIcon icon={faStar} />
              <span style={{ color: '#64748b', marginLeft: '5px', fontWeight: '700' }}>Verified Quality</span>
            </div>
          </div>

          {/* Product Title */}
          <h2 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 12px 0', color: '#0f172a', lineHeight: '1.25', letterSpacing: '-0.5px' }}>
            {product.name}
          </h2>

          {/* Price & Stock Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <span style={{ fontSize: '26px', fontWeight: '900', color: '#059669' }}>
              PKR {safePrice.toLocaleString()}
            </span>
            {isSoldOut ? (
              <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FontAwesomeIcon icon={faBan} /> OUT OF STOCK
              </span>
            ) : (
              <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <FontAwesomeIcon icon={faCheckCircle} /> IN STOCK
              </span>
            )}
          </div>

          {/* Main Description */}
          <p style={{ color: '#475569', lineHeight: '1.65', fontSize: '14px', margin: '0 0 22px 0', whiteSpace: 'pre-wrap' }}>
            {product.description || 'Crafted with premium materials and attention to detail for everyday reliability and style.'}
          </p>
          
          {/* DYNAMIC VARIANTS SELECTOR (SIZES / COLORS / VOLUME) */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {product.variants.map((variant, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#4f46e5', marginRight: '6px' }} />
                      Select {variant.name}:
                    </span>
                    <span style={{ fontWeight: '800', color: '#4f46e5' }}>{selectedVariants[variant.name]}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(variant.options || []).map((opt, i) => {
                      const isSelected = selectedVariants[variant.name] === opt;
                      return (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => handleVariantSelect(variant.name, opt)}
                          style={{
                            padding: '8px 16px', 
                            background: isSelected ? '#0f172a' : '#ffffff', 
                            color: isSelected ? '#ffffff' : '#334155',
                            border: isSelected ? '1px solid #0f172a' : '1px solid #cbd5e1',
                            borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* QUANTITY & ADD TO BAG ROW */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '4px' }}>
              <button 
                type="button"
                disabled={isSoldOut}
                onClick={() => setQty(Math.max(1, qty - 1))} 
                style={{ width: '38px', height: '38px', border: 'none', background: 'transparent', cursor: isSoldOut ? 'not-allowed' : 'pointer', color: '#475569', fontSize: '14px' }}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <span style={{ width: '36px', textAlign: 'center', fontWeight: '800', fontSize: '15px', color: '#0f172a' }}>{qty}</span>
              <button 
                type="button"
                disabled={isSoldOut}
                onClick={() => setQty(qty + 1)} 
                style={{ width: '38px', height: '38px', border: 'none', background: 'transparent', cursor: isSoldOut ? 'not-allowed' : 'pointer', color: '#475569', fontSize: '14px' }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>

            <button 
              type="button"
              disabled={isSoldOut}
              onClick={handleAddToCart} 
              style={{
                flex: '1 1 200px', padding: '14px 20px', 
                background: isSoldOut ? '#cbd5e1' : '#0f172a', 
                color: isSoldOut ? '#64748b' : '#ffffff', 
                border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', 
                cursor: isSoldOut ? 'not-allowed' : 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: isSoldOut ? 'none' : '0 10px 20px -5px rgba(15, 23, 42, 0.25)'
              }}
            >
              <FontAwesomeIcon icon={isSoldOut ? faBan : faShoppingBag} style={{ color: isSoldOut ? '#64748b' : '#f97316' }} />
              {isSoldOut ? 'Currently Sold Out' : `Add to Bag • PKR ${(safePrice * qty).toLocaleString()}`}
            </button>
          </div>

          {/* TRUST HIGHLIGHTS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '24px' }}>
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#065f46' }}>
              <FontAwesomeIcon icon={faTruckFast} style={{ color: '#059669' }} /> Fast Doorstep COD
            </div>
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#9a3412' }}>
              <FontAwesomeIcon icon={faRotateLeft} style={{ color: '#ea580c' }} /> Easy Exchange
            </div>
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#1e40af' }}>
              <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#2563eb' }} /> Quality Checked
            </div>
          </div>

          {/* EXPANDABLE PRODUCT INFO & FAQ ACCORDION TABS */}
          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
            {allAccordionTabs.map((tab, idx) => {
              const isOpenTab = openAccordion === idx;
              return (
                <div key={tab.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(isOpenTab ? -1 : idx)}
                    style={{
                      width: '100%', padding: '14px 0', background: 'none', border: 'none',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#0f172a'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FontAwesomeIcon icon={faCircleInfo} style={{ color: themeColor, fontSize: '13px' }} />
                      {tab.title}
                    </span>
                    <FontAwesomeIcon icon={isOpenTab ? faMinus : faPlus} style={{ color: '#64748b', fontSize: '11px' }} />
                  </button>
                  {isOpenTab && (
                    <div style={{ paddingBottom: '14px', fontSize: '13px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {tab.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopProductModal;