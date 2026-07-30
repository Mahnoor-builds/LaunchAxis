import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt, faArrowLeft, faTruck, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const ShopCheckout = ({ cart = [], branding, onPlaceOrder, siteConfig = {} }) => {
  const navigate = useNavigate();

  // CLEAN FORM STATE: Single Full Name + Email
  const [customer, setCustomer] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  // Dynamic calculations from siteConfig settings
  const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const freeShippingLimit = siteConfig.freeShippingThreshold || 5000;
  const standardCodFee = siteConfig.codFee || 250;
  
  const isFreeShipping = itemsTotal >= freeShippingLimit;
  const shippingFee = isFreeShipping ? 0 : standardCodFee;
  const finalTotal = itemsTotal + shippingFee;

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.fullName || !customer.phone || !customer.address || !customer.city) {
      alert("Please fill in all required delivery details.");
      return;
    }

    setLoading(true);

    const orderDetails = {
      customer,
      items: cart,
      subtotal: itemsTotal,
      shippingFee,
      total: finalTotal,
      paymentMethod: 'COD'
    };

    await onPlaceOrder(orderDetails);
    setLoading(false);
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
      >
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Store
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
        
        {/* LEFT: DELIVERY FORM */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#0f172a' }}>Delivery Details</h2>

          {/* SINGLE FULL NAME INPUT */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Mahnoor Naveed"
              value={customer.fullName}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          {/* EMAIL ADDRESS FOR FUTURE AUTOMATION */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: '5px' }} /> Email Address (For Order Updates) *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="customer@example.com"
              value={customer.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          {/* PHONE & CITY IN ONE ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="0300-1234567"
                value={customer.phone}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>City *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="Lahore / Karachi"
                value={customer.city}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              />
            </div>
          </div>

          {/* FULL STREET ADDRESS */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>Complete Street Address *</label>
            <input
              type="text"
              name="address"
              required
              placeholder="House #, Street #, Sector/Area"
              value={customer.address}
              onChange={handleChange}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '14px',
              borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : `Confirm Order (PKR ${finalTotal.toLocaleString()})`}
          </button>
        </form>

        {/* RIGHT: SUMMARY CARD */}
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>Order Summary</h3>
          
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                <span>{item.name} <strong>(x{item.qty})</strong></span>
                <span>PKR {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
            <span>Subtotal</span>
            <span>PKR {itemsTotal.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '16px', color: isFreeShipping ? '#10b981' : '#0f172a' }}>
            <span>COD Delivery</span>
            <span>{isFreeShipping ? 'FREE' : `PKR ${shippingFee}`}</span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: 'var(--brand-color, #2dd4bf)' }}>
            <span>Total Payable</span>
            <span>PKR {finalTotal.toLocaleString()}</span>
          </div>
          
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FontAwesomeIcon icon={faShieldAlt} /> Cash on Delivery • Pay upon doorstep arrival
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopCheckout;