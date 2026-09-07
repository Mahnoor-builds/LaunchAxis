import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import './StartBuilding.css';

const StartBuilding = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    businessDesc: '',
    businessType: 'ecommerce', // default
    userType: 'Startup Founder', // default
    needs: {
      wantsBranding: true,
      wantsWebsite: true,
      wantsAccounting: true,
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      needs: { ...prev.needs, [value]: checked }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = { 
      businessName: formData.businessName || "Auto-Generate", 
      businessDesc: formData.formData, 
      businessType: formData.businessType, 
      userType: formData.userType, 
      features: formData.needs, 
      email: formData.email 
    };

    if (!currentUser) {
      // Not logged in! Save to pending and show custom modal.
      localStorage.setItem("pendingLaunchAxisData", JSON.stringify(userData));
      setShowModal(true);
    } else {
      // Logged in! Proceed directly to the Loading screen.
      localStorage.setItem("launchAxisTempData", JSON.stringify(userData));
      navigate('/loading');
    }
  };

  return (
    <div className="start-building-wrapper">
      <div className="space-ambient-glow"></div>
      <div className="space-ambient-glow-2"></div>
      <div className="cosmic-dust-overlay"></div>

      <div className="form-container">
        <div className="header-text">
          <h2>Architect Your Infrastructure</h2>
          <p><i className="fa-solid fa-microchip"></i> System Setup & Parameter Input</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            
            <div className="form-group">
              <label className="field-label" htmlFor="businessName">Business / Brand Name</label>
              <input 
                type="text" 
                id="businessName" 
                name="businessName" 
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="Leave blank for AI generation" 
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="email">Admin Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
                placeholder="ceo@startup.com" 
              />
            </div>

            <div className="form-group full-width">
              <label className="field-label" htmlFor="businessDesc">Product or Service Description</label>
              <textarea 
                id="businessDesc" 
                name="businessDesc" 
                rows="3" 
                value={formData.businessDesc}
                onChange={handleInputChange}
                required 
                placeholder="Describe exactly what you sell or the services you provide. Who is your target customer?"
              ></textarea>
            </div>

            <div className="form-group">
              <label className="field-label">Primary Offering Type</label>
              <div className="selection-group">
                <label className="radio-label">
                  <input type="radio" name="businessType" value="ecommerce" checked={formData.businessType === 'ecommerce'} onChange={handleInputChange} required /> 
                  Physical / Digital Products
                </label>
                <label className="radio-label">
                  <input type="radio" name="businessType" value="service" checked={formData.businessType === 'service'} onChange={handleInputChange} /> 
                  Service / Agency Work
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">Founder Profile</label>
              <div className="selection-group">
                <label className="radio-label">
                  <input type="radio" name="userType" value="Startup Founder" checked={formData.userType === 'Startup Founder'} onChange={handleInputChange} required /> 
                  Startup Founder
                </label>
                <label className="radio-label">
                  <input type="radio" name="userType" value="Freelancer" checked={formData.userType === 'Freelancer'} onChange={handleInputChange} /> 
                  Freelancer
                </label>
                <label className="radio-label">
                  <input type="radio" name="userType" value="Student" checked={formData.userType === 'Student'} onChange={handleInputChange} /> 
                  Student
                </label>
                <label className="radio-label">
                  <input type="radio" name="userType" value="Small Business Owner" checked={formData.userType === 'Small Business Owner'} onChange={handleInputChange} /> 
                  Small Business Owner
                </label>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="field-label">Modules to Activate</label>
              <div className="selection-group row-layout">
                <label className="radio-label">
                  <input type="checkbox" name="needs" value="wantsBranding" checked={formData.needs.wantsBranding} onChange={handleCheckboxChange} /> 
                  Brand Identity Kit
                </label>
                <label className="radio-label">
                  <input type="checkbox" name="needs" value="wantsWebsite" checked={formData.needs.wantsWebsite} onChange={handleCheckboxChange} /> 
                  Website / Storefront
                </label>
                <label className="radio-label">
                  <input type="checkbox" name="needs" value="wantsAccounting" checked={formData.needs.wantsAccounting} onChange={handleCheckboxChange} /> 
                  Finance Ledger Dashboard
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn full-width">
              Initialize Kernel Sequence <i className="fa-solid fa-rocket"></i>
            </button>
          </div>
        </form>
      </div>

      {/* CUSTOM AUTHENTICATION MODAL */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`}>
        <div className="modal-card">
          <div className="modal-icon"><i className="fa-solid fa-lock"></i></div>
          <h3>Authentication Required</h3>
          <p>You need a secure LaunchAxis account to save and deploy your business infrastructure.</p>
          <Link to="/auth" className="modal-btn-primary">Create Free Account</Link>
          <Link to="/login" className="modal-btn-secondary">Log in to existing account</Link>
          <button className="close-modal" onClick={() => setShowModal(false)}>Cancel & Go Back</button>
        </div>
      </div>
    </div>
  );
};

export default StartBuilding;