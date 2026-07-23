import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faPlus, faMinus, faTruckFast } from '@fortawesome/free-solid-svg-icons';

const ShopCartDrawer = ({ isOpen, onClose, cart = [], updateQty, removeFromCart }) => {
  const navigate = useNavigate();

  const subtotal = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.qty), 0);
  const freeShippingThreshold = 5000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const handleCheckout = () => {
    onClose(); 
    navigate('/checkout'); 
  };

  if (!isOpen) return null;

  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 9999, display: 'flex', justifyContent: 'flex-end'
    }}>
      
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} />

      <div style={{
          position: 'relative', width: '420px', maxWidth: '85%', height: '100%',
          background: '#fff', display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 25px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        
        {/* HEADER */}
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>Shopping Bag ({cart.length})</h2>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}>
                <FontAwesomeIcon icon={faTimes} style={{ color: '#0f172a' }} />
            </button>
        </div>

        {/* FREE SHIPPING PROGRESS */}
        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '13px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                <FontAwesomeIcon icon={faTruckFast} style={{ color: subtotal >= freeShippingThreshold ? '#10b981' : '#475569' }} />
                {subtotal >= freeShippingThreshold 
                    ? <span style={{ color: '#10b981', fontWeight: '800' }}>Free Express Shipping Unlocked!</span>
                    : <span>Spend <b style={{ fontWeight: '800' }}>PKR {(freeShippingThreshold - subtotal).toLocaleString()}</b> more for Free Shipping</span>
                }
            </div>
            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#10b981', transition: 'width 0.4s ease-out' }} />
            </div>
        </div>

        {/* CART ITEMS LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px', color: '#64748b' }}>
                    <FontAwesomeIcon icon={faTimes} style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '16px' }} />
                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Your bag is empty.</p>
                    <p style={{ fontSize: '14px', marginBottom: '24px' }}>Looks like you haven't added anything yet.</p>
                    <button onClick={onClose} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: '700', cursor: 'pointer' }}>Start Shopping</button>
                </div>
            ) : (
                cart.map((item, index) => (
                    <div key={item.cartId || index} style={{ display: 'flex', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' }}>
                        {/* Image */}
                        <div style={{ width: '85px', height: '100px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.images && item.images[0] ? (
                                <img src={item.images[0]} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>No Img</span>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>{item.name}</h4>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
                                PKR {(parseInt(item.price) * item.qty).toLocaleString()}
                            </div>
                            
                            {/* DYNAMIC VARIANTS DISPLAY */}
                            {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                    {Object.entries(item.selectedVariants).map(([key, value]) => (
                                        <span key={key} style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                            {key}: {value}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {/* Controls */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#f8fafc' }}>
                                    <button onClick={() => updateQty(item.cartId, -1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '12px' }}><FontAwesomeIcon icon={faMinus} /></button>
                                    <span style={{ fontSize: '13px', padding: '0 8px', fontWeight: '800', color: '#0f172a' }}>{item.qty}</span>
                                    <button onClick={() => updateQty(item.cartId, 1)} style={{ padding: '6px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '12px' }}><FontAwesomeIcon icon={faPlus} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.cartId)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>

        {/* FOOTER (Checkout) */}
        {cart.length > 0 && (
            <div style={{ padding: '24px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: '800', color: '#0f172a', fontSize: '16px' }}>
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>
                    Shipping & taxes calculated at checkout.
                </div>
                <button 
                    onClick={handleCheckout}
                    style={{
                        width: '100%', background: '#0f172a', color: '#fff', padding: '18px', 
                        borderRadius: '12px', border: 'none', fontSize: '16px', fontWeight: '800', 
                        cursor: 'pointer', letterSpacing: '0.5px', transition: 'transform 0.2s',
                        boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                    Secure Checkout
                </button>
            </div>
        )}

      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default ShopCartDrawer;