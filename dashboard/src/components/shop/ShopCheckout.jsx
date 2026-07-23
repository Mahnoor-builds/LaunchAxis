import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShieldHalved, faTruck, faMoneyBillWave, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const ShopCheckout = ({ cart = [], branding, onPlaceOrder, siteConfig = {} }) => {
  const navigate = useNavigate();
  const themeColor = siteConfig.themeColor || '#2dd4bf';

  // If cart is empty, redirect back to home
  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, [cart, navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    address: '',
    paymentMethod: 'COD'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- CALCULATIONS ---
  const subtotal = cart.reduce((sum, item) => sum + (parseInt(item.price) * item.qty), 0);
  const shippingFee = subtotal >= 5000 ? 0 : 250; 
  const total = subtotal + shippingFee;

  // --- FORM HANDLER ---
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Package the order details for the database
    const orderDetails = {
      customer: formData,
      items: cart,
      subtotal: subtotal,
      shipping: shippingFee,
      total: total,
      date: new Date().toISOString()
    };

    // Simulate network delay for premium feel, then trigger the App.js function
    setTimeout(() => {
      onPlaceOrder(orderDetails);
      setIsSubmitting(false);
      navigate('/'); // Go back to store after successful order
    }, 1500);
  };

  if (cart.length === 0) return null; // Prevent flash before redirect

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif", color: '#0f172a' }}>
      
      {/* HEADER */}
      <header style={{ background: '#fff', padding: '24px 5%', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/catalog" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}>
            <FontAwesomeIcon icon={faArrowLeft} /> Return to Store
        </Link>
        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>
            {branding?.name || 'Checkout'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: '700' }}>
            <FontAwesomeIcon icon={faShieldHalved} /> Secure SSL
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 5%', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
        
        {/* === LEFT COLUMN: CUSTOMER DETAILS === */}
        <div style={{ flex: '1 1 600px' }}>
            
            <form onSubmit={handleSubmit} id="checkout-form">
                
                {/* 1. Delivery Information */}
                <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '24px' }}>
                    <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FontAwesomeIcon icon={faTruck} style={{ color: themeColor }} /> Delivery Information
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>First Name</label>
                            <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>Last Name</label>
                            <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>Active Mobile Number (WhatsApp preferred)</label>
                        <input required type="tel" placeholder="03XX-XXXXXXX" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>City</label>
                        <input required type="text" placeholder="e.g. Lahore, Karachi, Islamabad" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: '#475569' }}>Complete Street Address</label>
                        <textarea required rows="3" placeholder="House number, street, area..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                    </div>
                </div>

                {/* 2. Payment Method */}
                <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: themeColor }} /> Payment Method
                    </h2>
                    
                    {/* Active COD Box */}
                    <div style={{ border: `2px solid ${themeColor}`, background: '#f8fafc', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px' }}>
                                <FontAwesomeIcon icon={faCheckCircle} />
                            </div>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '15px' }}>Cash on Delivery (COD)</div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Pay with cash when your order arrives.</div>
                            </div>
                        </div>
                    </div>

                    {/* Future Bank Transfer Box (Disabled) */}
                    <div style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px', opacity: 0.5 }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #cbd5e1' }}></div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>Bank Transfer / EasyPaisa</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Coming soon in store editor upgrades.</div>
                        </div>
                    </div>
                </div>

            </form>
        </div>

        {/* === RIGHT COLUMN: ORDER SUMMARY === */}
        <div style={{ flex: '1 1 400px', position: 'sticky', top: '100px' }}>
            <div style={{ background: '#0f172a', color: '#fff', padding: '32px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: '800' }}>Order Summary</h2>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px', paddingRight: '10px' }}>
                    {cart.map(item => (
                        <div key={item.cartId} style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ width: '60px', height: '60px', background: '#1e293b', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                                {item.images && item.images[0] && <img src={item.images[0]} alt="item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: themeColor, color: '#0f172a', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900' }}>
                                    {item.qty}
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</div>
                                {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                                        {Object.entries(item.selectedVariants).map(([k, v]) => `${v}`).join(', ')}
                                    </div>
                                )}
                                <div style={{ fontSize: '14px', fontWeight: '800', color: themeColor }}>PKR {(parseInt(item.price) * item.qty).toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>Subtotal</span>
                    <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px', color: '#cbd5e1' }}>
                    <span>Standard Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : `PKR ${shippingFee}`}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '700' }}>Total to Pay</span>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: themeColor }}>PKR {total.toLocaleString()}</span>
                </div>

                <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={isSubmitting}
                    style={{ 
                        width: '100%', background: themeColor, color: '#0f172a', border: 'none', padding: '18px', 
                        borderRadius: '12px', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', 
                        cursor: isSubmitting ? 'not-allowed' : 'pointer', letterSpacing: '1px', opacity: isSubmitting ? 0.7 : 1 
                    }}
                >
                    {isSubmitting ? 'Processing Order...' : 'Confirm Order via COD'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCheckout;