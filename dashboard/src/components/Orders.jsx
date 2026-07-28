import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen, faEye, faXmark, faCheckCircle, faClock, faTruckFast, faFilter } from '@fortawesome/free-solid-svg-icons';

const Orders = ({ orders = [], updateOrderStatus }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // NEW: Filter state
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Temporary state for the modal's form
  const [tempStatus, setTempStatus] = useState('');
  const [tempTracking, setTempTracking] = useState('');

  // 1. Filter the orders based on the selected tab
  const filteredOrders = orders.filter(order => 
    filterStatus === 'All' ? true : order.status === filterStatus
  );

  // 2. Sort the filtered orders so newest appear at the top
  const sortedOrders = [...filteredOrders].sort((a, b) => b.timestamp - a.timestamp);

  const openDetails = (order) => {
    setSelectedOrder(order);
    setTempStatus(order.status || 'Pending');
    setTempTracking(order.trackingId || '');
  };

  const saveOrderUpdates = () => {
    updateOrderStatus(selectedOrder.id, tempStatus, tempTracking);
    setSelectedOrder(null); // Close modal
  };

  return (
    <div style={{ padding: '20px', animation: 'fadeIn 0.3s ease-out' }}>
      
      {/* HEADER & FILTERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: '0 0 5px 0', color: '#0f172a' }}>Order Fulfillment</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Manage customer orders and track deliveries.</p>
        </div>

        {/* STATUS FILTER PILLS */}
        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '50px' }}>
          {['All', 'Pending', 'Shipped', 'Delivered'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: filterStatus === status ? '#fff' : 'transparent',
                color: filterStatus === status ? '#0f172a' : '#64748b',
                boxShadow: filterStatus === status ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                border: 'none', padding: '8px 16px', borderRadius: '50px', fontSize: '13px', 
                fontWeight: filterStatus === status ? '700' : '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        {sortedOrders.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '40px', marginBottom: '15px' }} />
            <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>No {filterStatus !== 'All' ? filterStatus : ''} Orders Found</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>Check back later or adjust your filters.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Order ID</th>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Customer</th>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Items</th>
                <th style={{ padding: '16px 20px', fontWeight: '700' }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order, idx) => {
                const isDelivered = order.status === 'Delivered';
                const isShipped = order.status === 'Shipped';
                return (
                  <tr key={order.id || idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {order.id}
                    </td>
                    
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>{order.customerName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{order.phone}</div>
                    </td>
                    
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {order.productName} <span style={{ fontWeight: 'bold', color: '#0f172a' }}>(x{order.qty})</span>
                    </td>
                    
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: isDelivered ? '#dcfce7' : (isShipped ? '#dbeafe' : '#fef9c3'), 
                        color: isDelivered ? '#166534' : (isShipped ? '#1e40af' : '#854d0e') 
                      }}>
                        <FontAwesomeIcon icon={isDelivered ? faCheckCircle : (isShipped ? faTruckFast : faClock)} /> 
                        {order.status}
                      </span>
                    </td>
                    
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {/* EYE ICON FOR DETAILS */}
                      <button 
                        onClick={() => openDetails(order)}
                        style={{ background: 'transparent', color: '#64748b', border: 'none', padding: '8px', cursor: 'pointer', transition: 'color 0.2s' }}
                        title="View Details"
                        onMouseOver={(e) => e.currentTarget.style.color = '#0f172a'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                      >
                        <FontAwesomeIcon icon={faEye} style={{ fontSize: '18px' }} />
                      </button>
                    </td>

                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '16px', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', animation: 'scaleIn 0.2s ease-out'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Order Details: {selectedOrder.id}</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              
              {/* Customer Info */}
              <div style={{ marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', textTransform: 'uppercase' }}>Customer Information</h4>
                <p style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>{selectedOrder.customerName}</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#475569' }}>{selectedOrder.phone}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{selectedOrder.address}</p>
              </div>

              {/* Order Info */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#475569', textTransform: 'uppercase' }}>Purchase Summary</h4>
                <p style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}><strong>Items:</strong> {selectedOrder.productName}</p>
                <p style={{ margin: '0 0 5px 0', fontSize: '15px', color: '#0f172a' }}><strong>Total Quantity:</strong> {selectedOrder.qty}</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--brand-color, #2dd4bf)' }}>
                  Total: PKR {Number(selectedOrder.amount).toLocaleString()}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

              {/* Status Controls */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#475569', textTransform: 'uppercase' }}>Update Fulfillment Status</h4>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#0f172a' }}>
                    <input 
                      type="radio" name="status" value="Pending" 
                      checked={tempStatus === 'Pending'} 
                      onChange={(e) => setTempStatus(e.target.value)} 
                    /> Pending
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#0f172a' }}>
                    <input 
                      type="radio" name="status" value="Shipped" 
                      checked={tempStatus === 'Shipped'} 
                      onChange={(e) => setTempStatus(e.target.value)} 
                    /> Shipped
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px', color: '#0f172a' }}>
                    <input 
                      type="radio" name="status" value="Delivered" 
                      checked={tempStatus === 'Delivered'} 
                      onChange={(e) => setTempStatus(e.target.value)} 
                    /> Delivered
                  </label>
                </div>

                {/* Conditional Tracking ID Input */}
                {tempStatus === 'Shipped' && (
                  <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>Tracking ID (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. TCS-123456789" 
                      value={tempTracking}
                      onChange={(e) => setTempTracking(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px' }}>
                <button onClick={() => setSelectedOrder(null)} style={{ padding: '12px 24px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={saveOrderUpdates} style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;