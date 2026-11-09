import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLayerGroup, faUser, faEnvelope, faLock, faShieldHalved, 
  faArrowRight, faSpinner, faCheckCircle, faCircle, 
  faWandMagicSparkles, faStore, faWallet, faChartPie, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
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

  // Live visual check helpers (purely visual, does not alter validation logic)
  const hasMinLen = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasNumAndSym = /\d/.test(formData.password) && /[@$!%*?&]/.test(formData.password);

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
      
      {/* LEFT PANEL: EXECUTIVE SAAS SIGNUP FORM */}
      <div className="form-side">
        <div className="form-container">
          
          <div className="auth-top-nav">
            <Link to="/" className="brand-logo">
              <span className="brand-logo-badge">
                <FontAwesomeIcon icon={faLayerGroup} />
              </span>
              <span>LaunchAxis</span>
            </Link>
            <Link to="/" className="back-home-pill">
              <FontAwesomeIcon icon={faArrowLeft} /> Home
            </Link>
          </div>

          <div className="form-header">
            <span className="auth-eyebrow-badge">FOUNDER ONBOARDING</span>
            <h1>Create your account</h1>
            <p>Set up your founder profile to launch your brand, website, and financial workspace.</p>
          </div>

          <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <div className="divider">Or register with work email</div>

          <form onSubmit={handleSignup} autoComplete="off">
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faUser} className="label-icon icon-blue" /> Full Name
              </label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleInputChange} 
                placeholder="e.g. Mahnoor Naveed" 
                required 
                autoComplete="off"
              />
            </div>
            
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faEnvelope} className="label-icon icon-emerald" /> Email Address
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="founder@yourcompany.com" 
                required 
                autoComplete="off"
              />
            </div>
            
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faLock} className="label-icon icon-indigo" /> Secure Password
              </label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder="Create a strong password" 
                required 
                autoComplete="new-password"
              />
              <ul className="password-rules">
                <li className={hasMinLen ? 'rule-met' : ''}>
                  <FontAwesomeIcon icon={hasMinLen ? faCheckCircle : faCircle} /> Minimum 8 characters
                </li>
                <li className={hasUpper ? 'rule-met' : ''}>
                  <FontAwesomeIcon icon={hasUpper ? faCheckCircle : faCircle} /> At least 1 uppercase letter
                </li>
                <li className={hasNumAndSym ? 'rule-met' : ''}>
                  <FontAwesomeIcon icon={hasNumAndSym ? faCheckCircle : faCircle} /> At least 1 number & 1 symbol (@$!%*?&)
                </li>
              </ul>
            </div>
            
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faShieldHalved} className="label-icon icon-orange" /> Confirm Password
              </label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleInputChange} 
                placeholder="Repeat your password" 
                required 
                autoComplete="new-password"
              />
              {errorMsg && <div className="error-msg">{errorMsg}</div>}
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
                <><FontAwesomeIcon icon={faSpinner} spin /> Initializing Workspace...</>
              ) : (
                <><span>Initialize Workspace</span> <FontAwesomeIcon icon={faArrowRight} className="btn-arrow-orange" /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/login">Log in to your workspace</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: BENTO SAAS WORKSPACE SHOWCASE */}
      <div className="visual-side">
        <div className="bento-showcase-container">
          
          <div className="visual-header-block">
            <span className="visual-eyebrow">ALL-IN-ONE BUSINESS OS</span>
            <h2>Everything you need to launch and scale, ready on day one.</h2>
            <p>Join ambitious founders building their brand identity, live storefront, and financial ledgers in one unified workspace.</p>
          </div>

          <div className="visual-bento-grid">
            <div className="visual-bento-card">
              <div className="vb-icon badge-indigo">
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </div>
              <div>
                <h4>AI Branding Studio</h4>
                <p>Generate names, check live domain availability, and design vector logos.</p>
              </div>
            </div>

            <div className="visual-bento-card">
              <div className="vb-icon badge-emerald">
                <FontAwesomeIcon icon={faStore} />
              </div>
              <div>
                <h4>Store & Agency Websites</h4>
                <p>Launch a retail store with COD checkout or a client service portfolio.</p>
              </div>
            </div>

            <div className="visual-bento-card">
              <div className="vb-icon badge-blue">
                <FontAwesomeIcon icon={faWallet} />
              </div>
              <div>
                <h4>Financial & Stock Ledger</h4>
                <p>Track cash flow, invoices, landed unit costs, and print PDF statements.</p>
              </div>
            </div>

            <div className="visual-bento-card">
              <div className="vb-icon badge-orange">
                <FontAwesomeIcon icon={faChartPie} />
              </div>
              <div>
                <h4>Daily Command Center</h4>
                <p>Follow a step-by-step launch checklist and monitor live orders.</p>
              </div>
            </div>
          </div>

          <div className="visual-trust-bar">
            <span><FontAwesomeIcon icon={faCheckCircle} className="trust-check" /> Free Forever Cadet Tier</span>
            <span><FontAwesomeIcon icon={faCheckCircle} className="trust-check" /> Instant Cloud Sync</span>
            <span><FontAwesomeIcon icon={faCheckCircle} className="trust-check" /> No Coding Required</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Auth;