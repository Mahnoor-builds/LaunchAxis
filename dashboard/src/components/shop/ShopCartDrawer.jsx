import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, faTrash, faPlus, faMinus, faTruckFast, 
  faShoppingBag, faShieldHalved, faArrowRight, faCheckCircle, faSparkles
} from '@fortawesome/free-solid-svg-icons';

const ShopCartDrawer = ({ isOpen, onClose, cart = [], updateQty, removeFromCart, siteConfig = {} }) => {
  const navigate = useNavigate();

  const themeColor = siteConfig?.themeColor || '#2563eb';
  const freeShippingThreshold = Number(siteConfig?.freeShippingThreshold) || 5000;

  // Safe math against NaN or negative quantities
  const subtotal = cart.reduce((sum, item) => {
    const safePrice = Math.max(0, Number(item.price) || 0);
    const safeQty = Math.max(1, Number(item.qty) || 1);
    return sum + (safePrice * safeQty);
  }, 0);

  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const amountRemaining = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckout = () => {
    onClose(); 
    navigate('/store/checkout'); 
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      zIndex: 9999, display: 'flex', justifyContent: 'flex-end',
      fontFamily: "'Inter', sans-serif"
    }}>
      
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(4px)' }} 
      />

      {/* Drawer Panel */}
      <div style={{
        position: 'relative', width: '430px', maxWidth: '90vw', height: '100%',
        background: '#ffffff', display: 'flex', flexDirection: 'column',
        boxShadow: '-15px 0 35px rgba(15, 23, 42, 0.18)', animation: 'slideInCart 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* 1. HEADER */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
              <FontAwesomeIcon icon={faShoppingBag} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px' }}>
                Your Shopping Bag
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                {cart.reduce((sum, i) => sum + (Number(i.qty) || 1), 0)} item{cart.length === 1 ? '' : 's'} selected
              </span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* 2. MULTI-COLOR FREE SHIPPING PROGRESS BANNER */}
        <div style={{ 
          padding: '14px 24px', 
          background: progress >= 100 ? '#ecfdf5' : '#fff7ed', 
          borderBottom: progress >= 100 ? '1px solid #a7f3d0' : '1px solid #fed7aa' 
        }}>
          <div style={{ fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: progress >= 100 ? '#065f46' : '#9a3412', fontWeight: '700' }}>
            <FontAwesomeIcon icon={progress >= 100 ? faCheckCircle : faTruckFast} style={{ color: progress >= 100 ? '#059669' : '#ea580c', fontSize: '14px' }} />
            {progress >= 100 ? (
              <span>Unlocked! You qualify for <strong>FREE Express Delivery</strong></span>
            ) : (
              <span>Add <strong style={{ color: '#ea580c' }}>PKR {amountRemaining.toLocaleString()}</strong> more to unlock <strong>FREE Shipping</strong></span>
            )}
          </div>
          <div style={{ height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${progress}%`, 
              background: progress >= 100 ? '#059669' : 'linear-gradient(90deg, #f97316, #ea580c)', 
              borderRadius: '10px',
              transition: 'width 0.4s ease-out' 
            }} />
          </div>
        </div>

        {/* 3. CART ITEMS LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto 0', padding: '40px 20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Your bag is currently empty</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                Explore our catalog and add your favorite items to get started.
              </p>
              <button 
                onClick={onClose} 
                style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 26px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item, index) => {
              const itemPrice = Math.max(0, Number(item.price) || 0);
              const itemQty = Math.max(1, Number(item.qty) || 1);

              return (
                <div 
                  key={item.cartId || index} 
                  style={{ display: 'flex', gap: '14px', padding: '14px', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0' }}
                >
                  {/* Thumbnail */}
                  <div style={{ width: '80px', height: '92px', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700' }}>No Photo</span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                          {item.name}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.cartId)} 
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px 4px', fontSize: '12px' }}
                          title="Remove item"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#059669', marginBottom: '8px' }}>
                        PKR {(itemPrice * itemQty).toLocaleString()}
                      </div>
                      
                      {/* Selected Variants */}
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                          {Object.entries(item.selectedVariants).map(([key, value]) => (
                            <span key={key} style={{ fontSize: '10px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Quantity Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}>
                        <button onClick={() => updateQty(item.cartId, -1)} style={{ padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '11px' }}>
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                        <span style={{ fontSize: '12px', padding: '0 8px', fontWeight: '800', color: '#0f172a' }}>{itemQty}</span>
                        <button onClick={() => updateQty(item.cartId, 1)} style={{ padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '11px' }}>
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                        PKR {itemPrice.toLocaleString()} each
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. FOOTER & CHECKOUT CTA */}
        {cart.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Estimated Subtotal</span>
              <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>PKR {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '16px' }}>
              <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#059669' }} />
              <span>Cash on Delivery available • Taxes & shipping finalized at checkout</span>
            </div>
            <button 
              onClick={handleCheckout}
              style={{
                width: '100%', background: '#0f172a', color: '#ffffff', padding: '16px', 
                borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '800', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.25)', transition: 'all 0.2s'
              }}
            >
              <span>Proceed to Checkout</span>
              <FontAwesomeIcon icon={faArrowRight} style={{ color: '#f97316' }} />
            </button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes slideInCart { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default ShopCartDrawer;