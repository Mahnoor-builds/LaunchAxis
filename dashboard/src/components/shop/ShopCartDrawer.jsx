import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faPlus, faMinus, faTruckFast } from '@fortawesome/free-solid-svg-icons';

const ShopCartDrawer = ({ isOpen, onClose, cart, updateQty, removeFromCart }) => {
  const navigate = useNavigate();

  // 1. Calculate Totals
  const subtotal = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.qty), 0);
  const freeShippingThreshold = 5000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  // 2. Handle "Checkout" Click
  const handleCheckout = () => {
    onClose(); // Close drawer
    navigate('/checkout'); // Go to checkout page
  };

  // If drawer is closed, don't render anything (or render hidden)
  if (!isOpen) return null;

  return (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        zIndex: 9999, display: 'flex', justifyContent: 'flex-end'
    }}>
      
      {/* A. DIMMED BACKGROUND (Click to close) */}
      <div 
        onClick={onClose}
        style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)'
        }}
      />

      {/* B. THE DRAWER PANEL */}
      <div style={{
          position: 'relative', width: '400px', maxWidth: '85%', height: '100%',
          background: '#fff', display: 'flex', flexDirection: 'column',
          boxShadow: '-5px 0 15px rgba(0,0,0,0.1)', animation: 'slideIn 0.3s ease-out'
      }}>
        
        {/* HEADER */}
        <div style={{padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={{margin: 0, fontSize: '18px', fontWeight: '700'}}>Shopping Bag ({cart.length})</h2>
            <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '5px'}}>
                <FontAwesomeIcon icon={faTimes} />
            </button>
        </div>

        {/* FREE SHIPPING PROGRESS */}
        <div style={{padding: '15px 20px', background: '#f9fafb', borderBottom: '1px solid #eee'}}>
            <div style={{fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FontAwesomeIcon icon={faTruckFast} style={{color: '#10b981'}} />
                {subtotal >= freeShippingThreshold 
                    ? <span style={{color: '#10b981', fontWeight: 'bold'}}>You have unlocked Free Shipping!</span>
                    : <span>Spend <b>PKR {(freeShippingThreshold - subtotal).toLocaleString()}</b> more for Free Shipping</span>
                }
            </div>
            <div style={{height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${progress}%`, background: '#10b981', transition: 'width 0.3s'}} />
            </div>
        </div>

        {/* CART ITEMS LIST */}
        <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
            {cart.length === 0 ? (
                <div style={{textAlign: 'center', marginTop: '50px', color: '#666'}}>
                    <p>Your cart is empty.</p>
                    <button onClick={onClose} style={{marginTop: '10px', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer'}}>Start Shopping</button>
                </div>
            ) : (
                cart.map((item, index) => (
                    <div key={index} style={{display: 'flex', gap: '15px', marginBottom: '20px'}}>
                        {/* Image */}
                        <div style={{width: '70px', height: '70px', background: '#f3f4f6', borderRadius: '8px', overflow: 'hidden', flexShrink: 0}}>
                            {item.images && item.images[0] ? (
                                <img src={item.images[0]} alt={item.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            ) : (
                                <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999'}}>No Img</div>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{flex: 1}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                                <h4 style={{margin: 0, fontSize: '14px', fontWeight: '600'}}>{item.name}</h4>
                                <span style={{fontSize: '14px', fontWeight: '600'}}>PKR {(parseInt(item.price) * item.qty).toLocaleString()}</span>
                            </div>
                            <div style={{fontSize: '12px', color: '#666', marginBottom: '10px'}}>Variant: Default</div>
                            
                            {/* Controls */}
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px'}}>
                                    <button onClick={() => updateQty(item.id, -1)} style={{padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px'}}><FontAwesomeIcon icon={faMinus} /></button>
                                    <span style={{fontSize: '13px', padding: '0 5px'}}>{item.qty}</span>
                                    <button onClick={() => updateQty(item.id, 1)} style={{padding: '5px 10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px'}}><FontAwesomeIcon icon={faPlus} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} style={{background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline'}}>
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
            <div style={{padding: '20px', borderTop: '1px solid #eee', background: '#fff'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontWeight: '600'}}>
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{fontSize: '12px', color: '#666', marginBottom: '15px', textAlign: 'center'}}>
                    Shipping & taxes calculated at checkout.
                </div>
                <button 
                    onClick={handleCheckout}
                    style={{width: '100%', background: '#000', color: '#fff', padding: '15px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}
                >
                    Checkout • PKR {subtotal.toLocaleString()}
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