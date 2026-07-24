import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCartShopping, faEye, faTruck, faCheck, faBox, faXmark, faPhone, faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// Removed 'orders' and 'updateOrderStatus' props
const Orders = () => {
  const [filter, setFilter] = useState('All'); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [trackingInput, setTrackingInput] = useState('');
  const [localOrders, setLocalOrders] = useState([]); // State for live Firestore orders

  // --- FIREBASE: LIVE SYNC ---
  useEffect(() => {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'ceo@ecosole.store';

    const ordersRef = collection(db, `users/${userId}/orders`);
    
    // Listen for real-time updates to the orders subcollection
    const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
      const liveOrders = [];
      snapshot.forEach((doc) => {
        liveOrders.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort orders so the newest ones appear at the top
      liveOrders.sort((a, b) => b.timestamp - a.timestamp);
      setLocalOrders(liveOrders);
    });

    return () => unsubscribe();
  }, []);

  // --- FILTER LOGIC ---
  const filteredOrders = localOrders.filter(order => {
    if(filter === 'All') return true;
    if(filter === 'Pending') return order.status === 'Pending' || order.status === 'Shipped';
    if(filter === 'Completed') return order.status === 'Delivered';
    return true;
  });

  // --- FIREBASE: UPDATE STATUS ---
  const handleStatusChange = async (newStatus) => {
    if(selectedOrder) {
      try {
        const user = auth.currentUser;
        const userId = user ? user.uid : 'ceo@ecosole.store';
        
        const orderRef = doc(db, `users/${userId}/orders`, selectedOrder.id);
        
        await setDoc(orderRef, { 
            status: newStatus, 
            trackingId: trackingInput 
        }, { merge: true });

        // Update local view immediately for a snappy UI
        setSelectedOrder({ ...selectedOrder, status: newStatus, trackingId: trackingInput }); 
        
        if(newStatus !== 'Shipped') setTrackingInput('');

      } catch (error) {
        console.error("Error updating order status:", error);
        alert("Failed to update order.");
      }
    }
  };

  return (
    <div className="section active">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1><FontAwesomeIcon icon={faCartShopping} style={{color:'var(--primary)', marginRight:'10px'}}/>Order Manager</h1>
          <p style={{color:'var(--text-muted)'}}>Track, Ship, and Deliver your products.</p>
        </div>
        
        {/* TABS */}
        <div style={{display:'flex', gap:'10px'}}>
            {['All', 'Pending', 'Completed'].map(tab => (
                <button 
                    key={tab}
                    className={`btn ${filter === tab ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFilter(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
            <thead style={{background:'var(--bg-input)', color:'var(--text-muted)', fontSize:'12px', textTransform:'uppercase'}}>
                <tr>
                    <th style={{padding:'15px', textAlign:'left'}}>Order ID</th>
                    <th style={{padding:'15px', textAlign:'left'}}>Customer</th>
                    <th style={{padding:'15px', textAlign:'left'}}>Product</th>
                    <th style={{padding:'15px', textAlign:'left'}}>Total</th>
                    <th style={{padding:'15px', textAlign:'left'}}>Status</th>
                    <th style={{padding:'15px', textAlign:'right'}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {filteredOrders.length === 0 && (
                    <tr>
                        <td colSpan="6" style={{padding:'40px', textAlign:'center', color:'var(--text-muted)'}}>
                            No orders found in this category.
                        </td>
                    </tr>
                )}
                {filteredOrders.map(order => (
                    <tr key={order.id} style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'15px', fontWeight:'bold'}}>#{order.id}</td>
                        <td style={{padding:'15px'}}>{order.customerName}</td>
                        <td style={{padding:'15px'}}>{order.productName} <span style={{opacity:0.6}}>x{order.qty}</span></td>
                        <td style={{padding:'15px', color:'var(--primary)'}}>PKR {order.amount.toLocaleString()}</td>
                        <td style={{padding:'15px'}}>
                            <span style={{
                                padding:'5px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'bold',
                                background: order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.2)' : order.status === 'Shipped' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: order.status === 'Delivered' ? '#10b981' : order.status === 'Shipped' ? '#3b82f6' : '#f59e0b'
                            }}>
                                {order.status === 'Shipped' && <FontAwesomeIcon icon={faTruck} style={{marginRight:'5px'}}/>}
                                {order.status === 'Delivered' && <FontAwesomeIcon icon={faCheck} style={{marginRight:'5px'}}/>}
                                {order.status.toUpperCase()}
                            </span>
                        </td>
                        <td style={{padding:'15px', textAlign:'right'}}>
                            <button className="btn btn-outline" style={{padding:'5px 10px'}} onClick={() => { setSelectedOrder(order); setTrackingInput(order.trackingId || ''); }}>
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* === ORDER DETAIL POPUP (MODAL) === */}
      {selectedOrder && (
        <div style={{
            position:'fixed', top:0, left:0, right:0, bottom:0, 
            background:'rgba(0,0,0,0.8)', zIndex:1000, 
            display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(5px)'
        }}>
            <div className="card" style={{width:'500px', maxWidth:'90%', position:'relative', border:'1px solid var(--primary)'}}>
                <button 
                    onClick={() => setSelectedOrder(null)}
                    style={{position:'absolute', top:'15px', right:'15px', background:'none', border:'none', color:'#fff', fontSize:'20px', cursor:'pointer'}}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h2 style={{marginTop:0}}>Order Details <span style={{opacity:0.5}}>#{selectedOrder.id}</span></h2>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
                    <div>
                        <label style={{color:'var(--text-muted)', fontSize:'12px'}}>Customer Info</label>
                        <div style={{fontWeight:'bold', fontSize:'16px'}}>{selectedOrder.customerName}</div>
                        <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'5px', color:'var(--primary)'}}>
                            <FontAwesomeIcon icon={faPhone} /> {selectedOrder.phone}
                        </div>
                    </div>
                    <div>
                         <label style={{color:'var(--text-muted)', fontSize:'12px'}}>Delivery Address</label>
                         <div style={{display:'flex', gap:'8px', alignItems:'start'}}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{marginTop:'4px', color:'var(--danger)'}} /> 
                            <span style={{fontSize:'14px', lineHeight:'1.4'}}>{selectedOrder.address}</span>
                         </div>
                    </div>
                </div>

                <div style={{background:'var(--bg-input)', padding:'15px', borderRadius:'8px', marginBottom:'20px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                        <span>{selectedOrder.productName} (x{selectedOrder.qty})</span>
                        <span>PKR {selectedOrder.amount.toLocaleString()}</span>
                    </div>
                    <div style={{borderTop:'1px solid var(--border)', marginTop:'10px', paddingTop:'10px', display:'flex', justifyContent:'space-between', fontWeight:'bold'}}>
                        <span>Total Paid</span>
                        <span style={{color:'var(--primary)'}}>PKR {selectedOrder.amount.toLocaleString()}</span>
                    </div>
                </div>

                {/* STATUS WORKFLOW */}
                <h3>Update Status</h3>
                <div style={{display:'flex', gap:'10px'}}>
                    <button 
                        className={`btn ${selectedOrder.status === 'Pending' ? 'btn-primary' : 'btn-outline'}`}
                        style={{flex:1, opacity: selectedOrder.status === 'Pending' ? 1 : 0.5}}
                        onClick={() => handleStatusChange('Pending')}
                    >
                        <FontAwesomeIcon icon={faBox} /> Pending
                    </button>
                    
                    <button 
                        className={`btn ${selectedOrder.status === 'Shipped' ? 'btn-primary' : 'btn-outline'}`}
                        style={{flex:1, background: selectedOrder.status === 'Shipped' ? '#3b82f6' : 'transparent', borderColor:'#3b82f6'}}
                        onClick={() => handleStatusChange('Shipped')}
                    >
                        <FontAwesomeIcon icon={faTruck} /> Shipped
                    </button>
                    
                    <button 
                        className={`btn ${selectedOrder.status === 'Delivered' ? 'btn-primary' : 'btn-outline'}`}
                        style={{flex:1, background: selectedOrder.status === 'Delivered' ? '#10b981' : 'transparent', borderColor:'#10b981'}}
                        onClick={() => handleStatusChange('Delivered')}
                    >
                        <FontAwesomeIcon icon={faCheck} /> Delivered
                    </button>
                </div>

                {/* TRACKING INPUT (Only if Shipped) */}
                {selectedOrder.status === 'Shipped' && (
                    <div style={{marginTop:'20px'}}>
                        <label>Courier Tracking ID</label>
                        <input 
                            className="input-neon" 
                            placeholder="e.g. LEOPARDS-9928371" 
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            onBlur={() => handleStatusChange('Shipped')}
                        />
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Orders;