import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, faArrowLeft, faTruckFast, faEnvelope, 
  faUser, faPhone, faLocationDot, faCity, faCheckCircle, 
  faTriangleExclamation, faShoppingBag, faMoneyBillWave, faLock
} from '@fortawesome/free-solid-svg-icons';

const ShopCheckout = ({ cart = [], branding = {}, onPlaceOrder, siteConfig = {} }) => {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const themeColor = siteConfig?.themeColor || '#2563eb';
  const brandName = branding?.name && branding.name !== 'Loading...' ? branding.name : 'Store Checkout';

  // Safe mathematical calculations
  const itemsTotal = cart.reduce((sum, item) => {
    const safePrice = Math.max(0, Number(item.price) || 0);
    const safeQty = Math.max(1, Number(item.qty) || 1);
    return sum + (safePrice * safeQty);
  }, 0);

  const freeShippingLimit = Number(siteConfig?.freeShippingThreshold) || 5000;
  const standardCodFee = Number(siteConfig?.codFee) || 250;
  
  const isFreeShipping = itemsTotal >= freeShippingLimit || itemsTotal === 0;
  const shippingFee = isFreeShipping ? 0 : standardCodFee;
  const finalTotal = itemsTotal + shippingFee;

  // Input sanitizer to strip HTML tags
  const cleanText = (val, maxLen = 150) => String(val || '').replace(/[<>]/g, '').slice(0, maxLen);

  const handleChange = (e) => {
    setFormError('');
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: cleanText(value, name === 'address' || name === 'notes' ? 300 : 100) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setFormError("Your shopping bag is empty. Please add items before checking out.");
      return;
    }

    const trimmedName = customer.fullName.trim();
    const trimmedPhone = customer.phone.trim();
    const trimmedAddress = customer.address.trim();
    const trimmedCity = customer.city.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress || !trimmedCity) {
      setFormError("Please fill in your full name, phone number, city, and complete street address.");
      return;
    }

    if (trimmedPhone.length < 7) {
      setFormError("Please enter a valid contact phone number for delivery coordination.");
      return;
    }

    setLoading(true);

    try {
      const orderDetails = {
        customer: {
          fullName: trimmedName,
          email: customer.email.trim(),
          phone: trimmedPhone,
          address: trimmedAddress,
          city: trimmedCity,
          notes: customer.notes.trim()
        },
        items: cart,
        subtotal: itemsTotal,
        shippingFee,
        total: finalTotal,
        paymentMethod: 'COD'
      };

      await onPlaceOrder(orderDetails);
      setOrderSuccess(true);
    } catch (err) {
      setFormError("Could not process your order right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500',
    outline: 'none',
    boxSizing: 'border-box'
  };

  // --- ORDER CONFIRMED SCREEN ---
  if (orderSuccess) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ background: '#ffffff', maxWidth: '460px', width: '100%', borderRadius: '20px', padding: '36px 28px', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.1)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 18px' }}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: '20px' }}>
            Order Confirmed
          </span>
          <h2 style={{ margin: '12px 0 8px', fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>
            Thank you, {customer.fullName || 'Valued Customer'}!
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
            Your order has been received by <strong>{brandName}</strong> and is being prepared for dispatch via Cash on Delivery.
          </p>
          <button
            onClick={() => navigate('/store')}
            style={{ width: '100%', padding: '14px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '36px 20px 60px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={() => navigate('/store')}
            style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: '10px', color: '#334155', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}
          >
            <FontAwesomeIcon icon={faArrowLeft} style={{ color: '#2563eb' }} /> Back to {brandName}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: '#059669', background: '#ecfdf5', padding: '8px 14px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
            <FontAwesomeIcon icon={faLock} /> SSL Encrypted Checkout
          </div>
        </div>

        {/* MAIN BENTO GRID */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
          
          {/* LEFT: SHIPPING & DELIVERY FORM */}
          <form 
            onSubmit={handleSubmit} 
            style={{ flex: '1.3 1 380px', background: '#ffffff', padding: '32px 28px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                <FontAwesomeIcon icon={faTruckFast} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Delivery Information</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Enter your doorstep address for Cash on Delivery</p>
              </div>
            </div>

            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 14px', borderRadius: '10px', marginBottom: '20px', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} /> {formError}
              </div>
            )}

            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faUser} style={{ color: '#2563eb' }} /> Receiver Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Mahnoor Naveed"
                value={customer.fullName}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faEnvelope} style={{ color: '#4f46e5' }} /> Email Address (For Order & Tracking Updates) *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={customer.email}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div style={{ flex: '1 1 180px' }}>
                <label style={labelStyle}><FontAwesomeIcon icon={faPhone} style={{ color: '#059669' }} /> Active Phone / WhatsApp *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="0300-1234567"
                  value={customer.phone}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label style={labelStyle}><FontAwesomeIcon icon={faCity} style={{ color: '#ea580c' }} /> City *</label>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="e.g. Lahore, Islamabad, Karachi"
                  value={customer.city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faLocationDot} style={{ color: '#dc2626' }} /> Complete Street & House Address *</label>
              <input
                type="text"
                name="address"
                required
                placeholder="House #, Street #, Block / Sector, Landmark"
                value={customer.address}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            {/* PAYMENT METHOD BADGE */}
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '14px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#ea580c', fontSize: '18px' }} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#9a3412' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: '11px', color: '#c2410c' }}>Pay in cash when our courier delivers your package</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#ffffff', color: '#ea580c', padding: '4px 10px', borderRadius: '20px', border: '1px solid #fdba74' }}>
                Selected
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || cart.length === 0}
              style={{
                width: '100%', background: '#0f172a', color: '#ffffff', border: 'none', padding: '16px',
                borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: (loading || cart.length === 0) ? 'not-allowed' : 'pointer',
                opacity: (loading || cart.length === 0) ? 0.6 : 1,
                boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
            >
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} />
              {loading ? 'Confirming Your Order...' : `Place Order • PKR ${finalTotal.toLocaleString()}`}
            </button>
          </form>

          {/* RIGHT: ORDER SUMMARY CARD */}
          <div style={{ flex: '1 1 320px', background: '#ffffff', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>Order Summary</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>{cart.length} item{cart.length === 1 ? '' : 's'} in your bag</p>
              </div>
            </div>
            
            <div style={{ maxHeight: '260px', overflowY: 'auto', marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item, idx) => {
                const safePrice = Math.max(0, Number(item.price) || 0);
                const safeQty = Math.max(1, Number(item.qty) || 1);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                        {item.name} <span style={{ color: '#4f46e5' }}>× {safeQty}</span>
                      </div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                        </div>
                      )}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                      PKR {(safePrice * safeQty).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                <span>Items Subtotal</span>
                <span>PKR {itemsTotal.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: isFreeShipping ? '#059669' : '#0f172a' }}>
                <span>Doorstep Delivery</span>
                <span>{isFreeShipping ? 'FREE' : `PKR ${shippingFee.toLocaleString()}`}</span>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '6px', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>Total Payable</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>
                  PKR {finalTotal.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faShieldHalved} style={{ color: themeColor }} />
              <span>Verified quality check before dispatch</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShopCheckout;