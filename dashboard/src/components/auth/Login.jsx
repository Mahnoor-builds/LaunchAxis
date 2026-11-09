import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLayerGroup, faEnvelope, faLock, faKey, faArrowRight, 
  faSpinner, faCheckCircle, faChartLine, faShieldHalved, 
  faBolt, faArrowLeft, faRobot
} from '@fortawesome/free-solid-svg-icons';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRedirect = () => {
    if (localStorage.getItem("pendingLaunchAxisData")) {
      localStorage.setItem("launchAxisTempData", localStorage.getItem("pendingLaunchAxisData"));
      localStorage.removeItem("pendingLaunchAxisData");
      navigate('/loading');
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      handleRedirect();
    } catch (error) {
      alert("Access Denied: " + error.message);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleRedirect();
    } catch (error) {
      alert("Google Login failed: " + error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email address in the field above to request a reset link.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Security link dispatched to ${email}. Check your inbox to reset your password.`);
    } catch (error) {
      alert("Recovery Failed: " + error.message);
    }
  };

  return (
    <div className="login-wrapper split-layout">
      
      {/* LEFT PANEL: EXECUTIVE SAAS LOGIN FORM */}
      <div className="form-side">
        <div className="form-container">
          
          <div className="login-top-nav">
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
            <span className="login-eyebrow-badge">FOUNDER PORTAL</span>
            <h1>Welcome back</h1>
            <p>Log in to manage your storefront, client projects, and financial ledgers.</p>
          </div>

          <button type="button" className="google-btn" onClick={handleGoogleLogin}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
            <span>Log in with Google</span>
          </button>

          <div className="divider">Or log in with email</div>

          <form onSubmit={handleLogin} autoComplete="off">
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faEnvelope} className="label-icon icon-blue" /> Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="founder@yourcompany.com" 
                required 
                autoComplete="off"
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '6px' }}>
              <div className="password-label-row">
                <label style={{ marginBottom: 0 }}>
                  <FontAwesomeIcon icon={faLock} className="label-icon icon-indigo" /> Password
                </label>
                <a href="#!" className="forgot-link" onClick={handleForgotPassword}>
                  <FontAwesomeIcon icon={faKey} style={{ marginRight: '4px', fontSize: '11px' }} />
                  Forgot Password?
                </a>
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                required 
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <><FontAwesomeIcon icon={faSpinner} spin /> Authenticating...</>
              ) : (
                <><span>Open Workspace</span> <FontAwesomeIcon icon={faArrowRight} className="btn-arrow-orange" /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account yet? <Link to="/auth">Create a free account</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: LIVE WORKSPACE SNAPSHOT */}
      <div className="visual-side">
        <div className="bento-login-showcase">
          
          <div className="visual-header-block">
            <span className="visual-eyebrow">EXECUTIVE COMMAND CENTER</span>
            <h2>Your entire business operation, synced in real time.</h2>
            <p>Pick up right where you left off. Check today's sales, fulfill customer orders, or consult Axis AI.</p>
          </div>

          {/* Simulated Live Workspace Status Card */}
          <div className="live-status-bento">
            <div className="lsb-top">
              <span className="lsb-title">
                <FontAwesomeIcon icon={faChartLine} style={{ color: '#059669' }} /> Workspace Pulse
              </span>
              <span className="lsb-badge">Cloud Synced</span>
            </div>

            <div className="lsb-metrics-row">
              <div className="lsb-metric-box">
                <span>Storefront Status</span>
                <strong style={{ color: '#059669' }}>Active & Online</strong>
              </div>
              <div className="lsb-metric-box">
                <span>Financial Ledger</span>
                <strong style={{ color: '#2563eb' }}>Balanced & Ready</strong>
              </div>
            </div>

            <div className="lsb-feature-strip">
              <div className="lsb-strip-item">
                <span className="lsb-icon bg-indigo"><FontAwesomeIcon icon={faRobot} /></span>
                <div>
                  <strong>Axis AI Co-Founder</strong>
                  <span>24/7 strategic advisor ready to assist</span>
                </div>
              </div>
              <div className="lsb-strip-item">
                <span className="lsb-icon bg-orange"><FontAwesomeIcon icon={faBolt} /></span>
                <div>
                  <strong>Instant Storefront Updates</strong>
                  <span>Changes publish to your live URL in one click</span>
                </div>
              </div>
            </div>
          </div>

          <div className="visual-trust-bar">
            <span><FontAwesomeIcon icon={faShieldHalved} style={{ color: '#2563eb', marginRight: '6px' }} /> Encrypted Firebase Auth</span>
            <span><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669', marginRight: '6px' }} /> Real-Time Firestore Sync</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;