import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAgreed: false,
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRedirect = () => {
    if (localStorage.getItem("pendingLaunchAxisData")) {
      localStorage.setItem("launchAxisTempData", localStorage.getItem("pendingLaunchAxisData"));
      localStorage.removeItem("pendingLaunchAxisData");
      navigate('/loading');
    } else {
      navigate('/');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!formData.termsAgreed) {
      setErrorMsg("You must agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!strongPasswordRegex.test(formData.password)) {
      setErrorMsg("Password does not meet the secure requirements above.");
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.fullName });
      handleRedirect();
    } catch (error) {
      alert("Startup Sequence Failed: " + error.message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleRedirect();
    } catch (error) {
      alert("Google Sign-In failed: " + error.message);
    }
  };

  return (
    <div className="auth-wrapper split-layout">
      {/* LEFT PANEL: FORM */}
      <div className="form-side">
        <div className="form-container">
          <div className="brand-logo">
            <i className="fa-solid fa-rocket"></i> LaunchAxis
          </div>

          <div className="form-header">
            <h1>Sign up for LaunchAxis</h1>
            <p>Create your founder profile to access the AI builder.</p>
          </div>

          <button className="google-btn" onClick={handleGoogleSignIn}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
            Continue with Google
          </button>

          <div className="divider">Or register with email</div>

          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange} 
                placeholder="e.g. Mahnoor Naveed" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="ceo@startup.com" 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Secure Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder="Create a password" 
                required 
              />
              <ul className="password-rules">
                <li><i className="fa-solid fa-circle"></i> Minimum 8 characters</li>
                <li><i className="fa-solid fa-circle"></i> At least 1 uppercase letter</li>
                <li><i className="fa-solid fa-circle"></i> At least 1 number and 1 symbol</li>
              </ul>
            </div>
            
            <div className="input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleInputChange} 
                placeholder="Repeat your password" 
                required 
              />
              {errorMsg && <div className="error-msg" style={{ display: 'block' }}>{errorMsg}</div>}
            </div>

            <div className="legal-check">
              <input 
                type="checkbox" 
                name="termsAgreed" 
                id="termsAgreement"
                checked={formData.termsAgreed} 
                onChange={handleInputChange} 
              />
              <label htmlFor="termsAgreement">
                I agree to the LaunchAxis <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a> and acknowledge the <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
              </label>
            </div>
            
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> Initializing...</>
              ) : (
                <>Initialize Workspace <i className="fa-solid fa-arrow-right"></i></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in here</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: VISUALS */}
      <div className="visual-side">
        <div className="cosmic-overlay"></div>
        <div className="planet">
          <div className="planet-ring"></div>
        </div>
        <div className="visual-content">
          <h2>From idea to orbit.</h2>
          <p>Join a global network of founders. LaunchAxis automatically architects your brand, web storefront, and financial ledger in minutes.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;