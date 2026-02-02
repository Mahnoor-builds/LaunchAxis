import React from 'react';
import { Link } from 'react-router-dom';
import ShopLayout from './ShopLayout';

const ShopHome = ({ branding, products, addToCart, cartCount }) => {
  
  // FIREBASE TODO: 'products' will eventually load from Firestore here using useEffect.
  
  // Filter only ACTIVE products (Don't show hidden/draft items)
  const activeProducts = products.filter(p => p.status !== 'archived');

  return (
    <ShopLayout branding={branding} cartCount={cartCount}>
      
      {/* === HERO SECTION === */}
      <div style={{
          background: '#f3f4f6', 
          height: '500px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px'
      }}>
        <div style={{maxWidth:'700px'}}>
            <span style={{color:'#666', textTransform:'uppercase', letterSpacing:'3px', fontSize:'12px', fontWeight:'bold'}}>
                New Collection 2026
            </span>
            <h1 style={{fontSize:'50px', margin:'15px 0', lineHeight:'1.1'}}>
                {branding.slogan || 'Style That Speaks.'}
            </h1>
            <p style={{fontSize:'18px', color:'#555', marginBottom:'30px'}}>
                Explore our latest arrivals tailored just for you.
            </p>
            <button 
    onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
    style={{
        background:'#000', color:'#fff', border:'none', 
        padding:'15px 40px', fontSize:'16px', cursor:'pointer',
        transition: 'transform 0.2s'
    }}
>
    Shop Now
</button>
        </div>
      </div>

      {/* === PRODUCT GRID === */}
      <div style={{padding:'80px 5%', maxWidth:'1400px', margin:'0 auto'}}>
        <h2 style={{marginBottom:'40px', textAlign:'center', fontSize:'28px'}}>Featured Products</h2>
        
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'40px'}}>
            {activeProducts.map(product => (
                <div key={product.id} className="shop-card" style={{cursor:'pointer', group: 'hover'}}>
                    {/* IMAGE AREA */}
                    <div style={{
                        background:'#f9f9f9', height:'320px', marginBottom:'15px', 
                        position:'relative', overflow:'hidden'
                    }}>
                        {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        ) : (
                            <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ddd'}}>
                                No Image
                            </div>
                        )}
                        
                        {/* Sold Out Badge */}
                        {product.status === 'sold-out' && (
                            <div style={{
                                position:'absolute', top:'10px', left:'10px', 
                                background:'rgba(0,0,0,0.7)', color:'#fff', 
                                padding:'5px 10px', fontSize:'10px', fontWeight:'bold'
                            }}>
                                SOLD OUT
                            </div>
                        )}
                    </div>

                    {/* INFO AREA */}
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                        <div>
                            <h3 style={{fontSize:'16px', margin:'0 0 5px 0', fontWeight:'600'}}>{product.name}</h3>
                            <div style={{color:'#777', fontSize:'14px'}}>
                                PKR {parseInt(product.price).toLocaleString()}
                            </div>
                        </div>
                        <button 
                            onClick={() => addToCart(product)}
                            disabled={product.status === 'sold-out'}
                            style={{
                                background: product.status === 'sold-out' ? '#ccc' : '#000', 
                                color:'#fff', border:'none', width:'35px', height:'35px', borderRadius:'50%', cursor:'pointer'
                            }}
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

    </ShopLayout>
  );
};

export default ShopHome;