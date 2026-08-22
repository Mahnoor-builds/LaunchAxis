import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faAddressBook, faEnvelope, faPhone, faCheckCircle, faTrash, faSpinner, faClock, faEye, faTimes
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null); // For the Popup Modal

  // --- 1. REAL-TIME FIREBASE SYNC ---
  useEffect(() => {
    let unsubscribe = null;

    const fetchLeads = async () => {
      const user = auth.currentUser;
      const targetId = user ? user.uid : 'ceo@ecosole.store'; // Fallback for local testing

      const leadsRef = collection(db, `users/${targetId}/leads`);
      
      unsubscribe = onSnapshot(leadsRef, (snapshot) => {
        const liveLeads = [];
        snapshot.forEach((docSnap) => {
          liveLeads.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Sort by newest first
        liveLeads.sort((a, b) => b.timestamp - a.timestamp);
        setLeads(liveLeads);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching leads:", error);
        setIsLoading(false);
      });
    };

    fetchLeads();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // --- 2. MARK LEAD AS CONTACTED ---
  const handleMarkContacted = async (leadId, currentStatus) => {
    try {
      const user = auth.currentUser;
      const targetId = user ? user.uid : 'ceo@ecosole.store';
      const leadRef = doc(db, `users/${targetId}/leads`, leadId);
      
      const newStatus = currentStatus === 'Contacted' ? 'New' : 'Contacted';
      await updateDoc(leadRef, { status: newStatus });
      
      // Update modal state if it's currently open
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      alert("Failed to update lead status.");
    }
  };

  // --- 3. DELETE LEAD ---
  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to permanently delete this lead?")) {
      try {
        const user = auth.currentUser;
        const targetId = user ? user.uid : 'ceo@ecosole.store';
        const leadRef = doc(db, `users/${targetId}/leads`, leadId);
        
        await deleteDoc(leadRef);
        if (selectedLead && selectedLead.id === leadId) setSelectedLead(null);
      } catch (error) {
        console.error("Error deleting lead:", error);
        alert("Failed to delete lead.");
      }
    }
  };

  if (isLoading) {
    return <div style={{ padding: '40px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faSpinner} spin /> Loading Client Leads...</div>;
  }

  return (
    <div style={{ padding: '0 20px 40px', height: '100%', overflowY: 'auto', position: 'relative' }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faAddressBook} style={{ color: '#2dd4bf', marginRight: '10px' }} /> 
            Client Leads & Inquiries
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Manage service requests and contact form submissions from your live website.</p>
        </div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', color: '#0f172a' }}>
          Total Leads: <span style={{ color: '#2dd4bf' }}>{leads.length}</span>
        </div>
      </div>

      {/* LEADS TABLE */}
      {leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', color: '#475569' }}>No Leads Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>When a client fills out the contact form on your website, it will appear here.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Client Name</th>
                <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Service Requested</th>
                <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}>
                  
                  {/* CLIENT INFO (Summary) */}
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{lead.name}</div>
                  </td>

                  {/* SERVICE */}
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                      {lead.service || 'General Inquiry'}
                    </span>
                  </td>

                  {/* DATE */}
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faClock} /> 
                      {new Date(lead.timestamp).toLocaleDateString()}
                    </div>
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                    {lead.status === 'Contacted' ? (
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FontAwesomeIcon icon={faCheckCircle} /> Contacted
                      </span>
                    ) : (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        New Lead
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedLead(lead)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', cursor: 'pointer', fontSize: '14px', padding: '8px 12px', borderRadius: '6px', marginRight: '10px', fontWeight: 'bold' }}
                      title="View Full Details"
                    >
                      <FontAwesomeIcon icon={faEye} style={{ marginRight: '6px' }} /> View
                    </button>
                    <button 
                      onClick={() => handleMarkContacted(lead.id, lead.status)}
                      style={{ background: 'none', border: 'none', color: lead.status === 'Contacted' ? '#94a3b8' : '#10b981', cursor: 'pointer', fontSize: '20px', marginRight: '12px' }}
                      title={lead.status === 'Contacted' ? "Mark as New" : "Mark as Contacted"}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                    <button 
                      onClick={() => handleDeleteLead(lead.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px' }}
                      title="Delete Lead"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- LEAD DETAILS MODAL POPUP --- */}
      {selectedLead && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faAddressBook} style={{ color: '#2dd4bf' }} /> Lead Details
              </h2>
              <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '24px', color: '#0f172a', fontWeight: '900' }}>{selectedLead.name}</h3>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>Submitted: {new Date(selectedLead.timestamp).toLocaleString()}</div>
                </div>
                <div>
                  {selectedLead.status === 'Contacted' ? (
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Contacted</span>
                  ) : (
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>New Lead</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Phone Number</div>
                  <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600' }}><FontAwesomeIcon icon={faPhone} style={{ color: '#2dd4bf', marginRight: '6px' }} /> {selectedLead.phone}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>Email Address</div>
                  <div style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: '#2dd4bf', marginRight: '6px' }} /> {selectedLead.email || 'Not provided'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Service Requested</div>
                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                  {selectedLead.service || 'General Inquiry'}
                </span>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>Client Message / Project Details</div>
                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', color: '#334155', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedLead.details}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => handleMarkContacted(selectedLead.id, selectedLead.status)}
                style={{ padding: '10px 20px', background: selectedLead.status === 'Contacted' ? '#fff' : '#10b981', color: selectedLead.status === 'Contacted' ? '#0f172a' : '#fff', border: selectedLead.status === 'Contacted' ? '1px solid #cbd5e1' : 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {selectedLead.status === 'Contacted' ? 'Mark as Uncontacted (New)' : 'Mark as Contacted'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Leads;