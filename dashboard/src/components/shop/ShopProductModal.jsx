import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const ShopProductModal = ({ product, isOpen, onClose, addToCart, themeColor }) => {
  if (!isOpen || !product) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      
      {/* Modal Container */}
      <div style={{
        background: '#fff', width: '100%', maxWidth: '900px', borderRadius: '12px',
        display: 'flex', flexWrap: 'wrap', overflow: 'hidden', position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '15px', right: '15px', background: '#f1f5f9',
          border: 'none', width: '35px', height: '35px', borderRadius: '50%',
          cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s'
        }} onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}>
          <FontAwesomeIcon icon={faXmark} size="lg" style={{ color: '#475569' }} />
        </button>

        {/* Left Side: Product Image */}
        <div style={{ flex: '1 1 400px', background: '#f8fafc', minHeight: '400px', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {product.images && product.images[0] ? (
            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '500' }}>{product.name} Image</span>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div style={{ flex: '1 1 400px', padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-block', background: '#0f172a', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', alignSelf: 'flex-start' }}>
            New Arrival
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 10px 0', color: '#0f172a', lineHeight: '1.2' }}>
            {product.name}
          </h2>
          <p style={{ fontSize: '1.8rem', fontWeight: '700', color: themeColor || '#2dd4bf', margin: '0 0 25px 0' }}>
            PKR {product.price.toLocaleString()}
          </p>
          <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '15px', marginBottom: '35px', flex: 1 }}>
            {product.description || 'Elevate your everyday with this premium item. Crafted with precision and designed for the modern lifestyle, it delivers both unmatched functionality and aesthetic brilliance. A true staple for your collection.'}
          </p>
          
          <button 
            onClick={() => { addToCart(product); onClose(); }} 
            style={{
              width: '100%', padding: '18px', background: '#0f172a', color: '#fff', border: 'none',
              borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', 
              cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '1px'
            }}
            onMouseOver={(e) => e.target.style.background = themeColor || '#2dd4bf'}
            onMouseOut={(e) => e.target.style.background = '#0f172a'}
          >
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopProductModal;