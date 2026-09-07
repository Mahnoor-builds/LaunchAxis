import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
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
      {/* LEFT PANEL: FORM */}
      <div className="form-side">
        <div className="form-container">
          <div className="brand-logo">
            <i className="fa-solid fa-rocket"></i> LaunchAxis
          </div>
          
          <div className="form-header">
            <h1>Welcome Back</h1>
            <p>Access your central command kernel.</p>
          </div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
            Log in with Google
          </button>

          <div className="divider">Or log in with email</div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="ceo@startup.com" 
                required 
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                required 
              />
            </div>
            
            <a href="#!" className="forgot-link" onClick={handleForgotPassword}>
              Forgot Password?
            </a>

            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <><i className="fa-solid fa-circle-notch fa-spin"></i> Authenticating...</>
              ) : (
                <>Access Kernel <i className="fa-solid fa-arrow-right"></i></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? <Link to="/auth">Sign up here</Link>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: VISUALS */}
      <div className="visual-side">
        <div className="cosmic-overlay"></div>
        <div className="planet"><div className="planet-ring"></div></div>
        <div className="visual-content">
          <h2>Command your empire.</h2>
          <p>Monitor your active storefronts, financial metrics, and customer insights instantly through the LaunchAxis dashboard.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;