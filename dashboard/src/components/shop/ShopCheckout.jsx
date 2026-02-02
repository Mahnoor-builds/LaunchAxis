import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLock, faTruck } from '@fortawesome/free-solid-svg-icons';

const ShopCheckout = ({ cart, branding, onPlaceOrder }) => {
  const navigate = useNavigate();
  
  // FORM STATE
  const [formData, setFormData] = useState({
    email: '', firstName: '', lastName: '',
    address: '', city: '', phone: '',
    paymentMethod: 'cod' // Default to Cash on Delivery
  });

  // CALCULATE TOTALS
  const subtotal = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
  const shipping = 200; // Standard shipping (you can make this dynamic later)
  const total = subtotal + shipping;

  const handleSubmit = (e) => {
    e.preventDefault();
    if(cart.length === 0) return alert("Your cart is empty!");
    
    // Send data back to App.js to create the order
    onPlaceOrder({
        customer: formData,
        items: cart,
        total: total
    });

    // Navigate to Home or Success page
    navigate('/'); 
  };

  if (cart.length === 0) {
    return (
        <div style={{textAlign:'center', padding:'100px 20px', fontFamily:"'Inter', sans-serif"}}>
            <h2>Your cart is empty</h2>
            <button onClick={() => navigate('/')} style={{background:'#000', color:'#fff', padding:'10px 20px', border:'none', marginTop:'20px', cursor:'pointer'}}>Continue Shopping</button>
        </div>
    );
  }

  return (
    <div style={{display:'flex', minHeight:'100vh', fontFamily:"'Inter', sans-serif", flexDirection: 'row-reverse'}}>
      
      {/* === RIGHT COLUMN: ORDER SUMMARY (Gray Background) === */}
      <div style={{width:'45%', background:'#f9fafb', borderLeft:'1px solid #e5e7eb', padding:'50px 8%'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            {cart.map((item, index) => (
                <div key={index} style={{display:'flex', alignItems:'center', gap:'15px'}}>
                    <div style={{width:'64px', height:'64px', background:'#fff', borderRadius:'8px', border:'1px solid #e5e7eb', position:'relative', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
                        {item.images && item.images[0] ? (
                            <img src={item.images[0]} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                        ) : (
                            <span style={{fontSize:'10px', color:'#999'}}>Img</span>
                        )}
                        <span style={{position:'absolute', top:'-8px', right:'-8px', background:'#666', color:'#fff', borderRadius:'50%', width:'20px', height:'20px', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>1</span>
                    </div>
                    <div style={{flex:1}}>
                        <div style={{fontSize:'14px', fontWeight:'500', color:'#374151'}}>{item.name}</div>
                    </div>
                    <div style={{fontSize:'14px', fontWeight:'500', color:'#374151'}}>PKR {parseInt(item.price).toLocaleString()}</div>
                </div>
            ))}
        </div>

        <div style={{borderTop:'1px solid #e5e7eb', borderBottom:'1px solid #e5e7eb', margin:'30px 0', padding:'20px 0', display:'flex', flexDirection:'column', gap:'10px', fontSize:'14px', color:'#374151'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Shipping</span><span>PKR {shipping}</span></div>
        </div>

        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{fontSize:'16px', fontWeight:'500'}}>Total</span>
            <span style={{fontSize:'24px', fontWeight:'700'}}>PKR {total.toLocaleString()}</span>
        </div>
      </div>

      {/* === LEFT COLUMN: FORM DETAILS (White Background) === */}
      <div style={{width:'55%', padding:'50px 8%'}}>
        {/* Header */}
        <div style={{marginBottom:'40px', borderBottom:'1px solid #eee', paddingBottom:'20px'}}>
            <h2 style={{margin:'0 0 10px 0'}}>{branding.name}</h2>
            <div style={{fontSize:'13px', color:'#666'}}>
                <span style={{cursor:'pointer'}} onClick={()=>navigate('/')}>Cart</span> &gt; Information &gt; Shipping &gt; Payment
            </div>
        </div>

        <form onSubmit={handleSubmit} style={{maxWidth:'500px'}}>
            {/* Contact */}
            <div style={{marginBottom:'30px'}}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <h3 style={{fontSize:'18px', margin:0}}>Contact information</h3>
                    <span style={{fontSize:'13px', color:'#000'}}>Already have an account? Log in</span>
                </div>
                <input 
                    required type="email" placeholder="Email"
                    value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})}
                    style={{width:'100%', padding:'12px', borderRadius:'5px', border:'1px solid #d1d5db', fontSize:'14px'}}
                />
            </div>

            {/* Shipping Address */}
            <div style={{marginBottom:'30px'}}>
                <h3 style={{fontSize:'18px', marginBottom:'15px'}}>Shipping address</h3>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px'}}>
                    <input required placeholder="First name" value={formData.firstName} onChange={e=>setFormData({...formData, firstName:e.target.value})} style={{padding:'12px', borderRadius:'5px', border:'1px solid #d1d5db'}} />
                    <input required placeholder="Last name" value={formData.lastName} onChange={e=>setFormData({...formData, lastName:e.target.value})} style={{padding:'12px', borderRadius:'5px', border:'1px solid #d1d5db'}} />
                </div>
                <input required placeholder="Address" value={formData.address} onChange={e=>setFormData({...formData, address:e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'5px', border:'1px solid #d1d5db', marginBottom:'12px'}} />
                <input required placeholder="City" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'5px', border:'1px solid #d1d5db', marginBottom:'12px'}} />
                <input required placeholder="Phone (For delivery updates)" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} style={{width:'100%', padding:'12px', borderRadius:'5px', border:'1px solid #d1d5db'}} />
            </div>

            {/* Payment Method */}
            <div style={{marginBottom:'30px'}}>
                <h3 style={{fontSize:'18px', marginBottom:'15px'}}>Payment</h3>
                <div style={{border:'1px solid #d1d5db', borderRadius:'5px', overflow:'hidden'}}>
                    {/* OPTION 1: COD */}
                    <div style={{padding:'15px', display:'flex', alignItems:'center', gap:'10px', background:'#f3f4f6', borderBottom:'1px solid #d1d5db'}}>
                        <input type="radio" checked readOnly />
                        <label style={{fontWeight:'500', fontSize:'14px'}}>Cash on Delivery (COD)</label>
                    </div>
                    <div style={{padding:'30px', textAlign:'center', background:'#f9fafb', fontSize:'14px', color:'#555'}}>
                        <FontAwesomeIcon icon={faTruck} size="2x" style={{marginBottom:'10px', color:'#666'}} /><br/>
                        Pay in cash upon delivery.
                    </div>
                    
                    {/* OPTION 2: ONLINE (Disabled) */}
                    <div style={{padding:'15px', display:'flex', alignItems:'center', gap:'10px', opacity:0.5, background:'#fff'}}>
                        <input type="radio" disabled />
                        <label style={{fontWeight:'500', fontSize:'14px', color:'#999'}}>Credit Card (Unavailable)</label>
                        <FontAwesomeIcon icon={faLock} style={{marginLeft:'auto', color:'#999'}} />
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <button type="submit" style={{width:'100%', background:'#000', color:'#fff', padding:'18px', borderRadius:'5px', fontSize:'16px', fontWeight:'600', cursor:'pointer', border:'none'}}>
                Complete Order
            </button>
            <div style={{textAlign:'center', marginTop:'15px', fontSize:'14px'}}>
                <span onClick={()=>navigate('/')} style={{color:'#000', cursor:'pointer', textDecoration:'underline'}}>Return to cart</span>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ShopCheckout;