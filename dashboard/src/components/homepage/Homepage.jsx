import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Adjust this path if your firebaseConfig is elsewhere
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const typewriterRef = useRef(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = user.email || "Founder";
        const initial = email.charAt(0).toUpperCase();
        setUserProfile(initial);
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Typewriter Effect Logic
  useEffect(() => {
    const textElement = typewriterRef.current;
    if (!textElement) return;

    const phrases = [
      "Awaiting founder input...",
      "Ready to deploy web storefronts...",
      "Ledger algorithms standing by...",
      "Brand identity matrix loaded..."
    ];
    
    let phraseIndex = 0;
    let letterIndex = 0;
    let isDeleting = false;
    let timeoutId;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];
      
      if (isDeleting) {
        textElement.innerText = currentPhrase.substring(0, letterIndex - 1);
        letterIndex--;
      } else {
        textElement.innerText = currentPhrase.substring(0, letterIndex + 1);
        letterIndex++;
      }

      let typeSpeed = isDeleting ? 50 : 100;

      if (!isDeleting && letterIndex === currentPhrase.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typeSpeed = 500;
      }

      timeoutId = setTimeout(typeLoop, typeSpeed);
    }

    timeoutId = setTimeout(typeLoop, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleAxisClick = (e) => {
    e.preventDefault();
    navigate('/chatbot'); // Adjust based on where you route the chatbot later
  };

  return (
    <div className="homepage-wrapper">
      {/* SPACE ENVIRONMENT ACCENT CORES */}
      <div className="space-ambient-glow"></div>
      <div className="cosmic-dust-overlay"></div>

      {/* 1. FLOATING GLASS NAVBAR */}
      <nav className="glass-navbar">
        <div className="nav-brand">
          <span className="logo-rocket">▲</span> LaunchAxis
        </div>
        
        <div className="nav-menu">
          <a href="#platform" className="nav-link">Home</a>
          
          <div className="dropdown-wrapper">
            <div className="dropdown-trigger">Platform <i className="fa-solid fa-chevron-down"></i></div>
            <div className="dropdown-menu">
              <a href="#ai-builder"><i className="fa-solid fa-wand-magic-sparkles"></i> AI Builder</a>
              <a href="#website-builder"><i className="fa-solid fa-globe"></i> Website Generator</a>
              <a href="#dashboards"><i className="fa-solid fa-chart-line"></i> Live Analytics</a>
              <a href="#finance"><i className="fa-solid fa-wallet"></i> Finance Ledger</a>
            </div>
          </div>

          <div className="dropdown-wrapper">
            <div className="dropdown-trigger">Solutions <i className="fa-solid fa-chevron-down"></i></div>
            <div className="dropdown-menu">
              <a href="#startups"><i className="fa-solid fa-rocket"></i> For Startups</a>
              <a href="#freelancers"><i className="fa-solid fa-laptop-code"></i> For Freelancers</a>
              <a href="#agencies"><i className="fa-solid fa-building"></i> For Agencies</a>
            </div>
          </div>

          <div className="dropdown-wrapper">
            <div className="dropdown-trigger">Resources <i className="fa-solid fa-chevron-down"></i></div>
            <div className="dropdown-menu">
              <a href="#docs"><i className="fa-solid fa-book"></i> Documentation</a>
              <a href="#community"><i className="fa-solid fa-users"></i> Founder Community</a>
            </div>
          </div>

          <a href="#pricing" className="nav-link">Pricing</a>
        </div>
        
        {/* SECURE AUTHENTICATION CONTAINER */}
        <div className="nav-actions">
          {userProfile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a href="/profile" style={{
                  display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(45, 212, 191, 0.1)', 
                  border: '1px solid rgba(45, 212, 191, 0.3)', padding: '6px 16px 6px 8px', 
                  borderRadius: '100px', textDecoration: 'none', color: '#f8fafc',
                  fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', background: '#2dd4bf', 
                    color: '#030712', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: '800', fontSize: '12px'
                  }}
                >
                  {userProfile}
                </div>
                <span>Founder Hub &rarr;</span>
              </a>
            </div>
          ) : (
            <>
              <a href="/auth" className="login-link">Signup</a>
              <a href="/start-building" className="btn-pill-cta" style={{ textDecoration: 'none' }}>Start building &rarr;</a>
            </>
          )}
        </div>
      </nav>

      {/* 2. HIGH-ALTITUDE HERO BLOCK */}
      <header id="platform" className="hero-section">
        <div className="hero-container">
          <div className="announcement-pill">
            <span className="pulse-dot"></span> LaunchAxis v2 — AI Business OS is live &nbsp;&nearr;
          </div>
          
          <h1 className="hero-main-title">
            Launch your business <br />into <span className="gradient-text-glow">orbit.</span>
          </h1>
          
          <p className="hero-description">
            Describe your idea in a sentence. LaunchAxis extracts your market, auto-generates your brand identity, spins up a live responsive web store, and sets up your financial ledger — a complete operational business, instantly.
          </p>

          <div className="terminal-capsule">
            <div className="terminal-indicator">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <div className="terminal-text-wrapper">
              <span className="terminal-prefix">Engine_Status:</span>
              <span className="typewriter-text" ref={typewriterRef}>Awaiting founder input...</span><span className="cursor">&nbsp;</span>
            </div>
            <a href="/start-building" className="btn-launch-rocket" style={{ textDecoration: 'none' }}>
              Start building <i className="fa-solid fa-arrow-right"></i>
            </a>
          </div>

          <div className="suggestion-tray">
            <span className="tray-label">Systems Online:</span>
            <span className="suggestion-pill">Brand Generation</span>
            <span className="suggestion-pill">Live Web Storefronts</span>
            <span className="suggestion-pill">Financial Ledgers</span>
          </div>

          <div className="hero-visual" style={{ position: 'absolute', right: '12%', top: '22%', animation: 'floatY 6s ease-in-out infinite', zIndex: 5 }}>
            <svg width="140" height="200" viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 15px 25px rgba(45, 212, 191, 0.4))' }}>
              <path d="M50 150 Q60 185 70 150 Z" fill="#2dd4bf" />
              <path d="M40 100 L10 140 L40 140 Z" fill="#94a3b8" />
              <path d="M80 100 L110 140 L80 140 Z" fill="#94a3b8" />
              <path d="M60 10 C30 50 40 150 40 150 L80 150 C80 150 90 50 60 10 Z" fill="#f8fafc" />
              <circle cx="60" cy="70" r="14" fill="#050b14" stroke="#2dd4bf" strokeWidth="4" />
            </svg>
          </div>
          
          <div className="cosmic-floater-saturn"></div>
        </div>
      </header>

      {/* 3. VALUE PROPOSITION SUB-STRIP */}
      <section className="trust-value-strip">
        <div className="trust-item"><i className="fa-solid fa-circle-check"></i> No credit card</div>
        <div className="trust-item"><i className="fa-solid fa-circle-check"></i> Free forever plan</div>
        <div className="trust-item"><i className="fa-solid fa-circle-check"></i> Cancel anytime</div>
      </section>

      {/* 4. CORE PLATFORM BANNER HYPERHEADLINE */}
      <section className="section-divider-title">
        <span className="section-sub-badge">THE PLATFORM</span>
        <h2>One AI cockpit for <span className="cyan-accent">every part</span> of your business.</h2>
        <p>Replace Shopify, QuickBooks, Canva, and a dozen open browser tabs with a single, intelligent interface.</p>
      </section>

      {/* 5. THREE-MODULE BENTO MATRIX (DASHBOARD HIGHLIGHTS) */}
      <section className="bento-grid-container">
        <div className="bento-card large-preview-window">
          <div className="window-header-bar">
            <span className="header-badge">BUSINESS COMMAND CENTER</span>
            <h3>A live view of everything — revenue, customers, inventory, and ledger settings on one canvas.</h3>
          </div>
          <div className="mockup-frame-box">
            <div className="mockup-inner-dashboard">
              <div className="mockup-sidebar"></div>
              <div className="mockup-main-content">
                <div className="mockup-metrics-row"></div>
                <div className="mockup-chart-box"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bento-card side-stack-card">
          <div className="card-text-header">
            <i className="fa-solid fa-robot card-icon-cyan"></i>
            <h4>Your always-on co-founder. Ask anything, configure everything.</h4>
          </div>
          <div className="interactive-prompt-list">
            <div className="prompt-pill-item">&rsaquo; Draft my shipping & return policy layouts.</div>
            <div className="prompt-pill-item">&rsaquo; Analyze my margin threshold configurations.</div>
            <div className="prompt-pill-item">&rsaquo; Generate this month's product copy updates.</div>
          </div>
        </div>

        <div className="bento-card side-stack-card">
          <div className="card-text-header">
            <i className="fa-solid fa-wallet card-icon-cyan"></i>
            <h4>Finance on Autopilot</h4>
            <p>Invoices, cash runways, and expense structures — reconciled continuously.</p>
          </div>
          <div className="mockup-mini-chart">
            <div className="mini-chart-text">MRR <br /><span className="mini-chart-val">PKR 128,430</span></div>
            <div className="mini-chart-wave"></div>
          </div>
        </div>
      </section>

      {/* 6. ENGINE GRID DETAIL EXPANSION SECTIONS */}
      <section className="engine-split-showcase">
        <div className="showcase-card">
          <div className="showcase-mockup-pane">
            <div className="website-builder-interface-simulation"></div>
          </div>
          <div className="showcase-content-pane">
            <span className="module-label-cyan">WEBSITE BUILDER</span>
            <h3>Type it. See it live.</h3>
            <p>A production-ready e-commerce website with an integrated store, product grids, custom domains, and fast global CDN hosting — generated instantly from your prompt.</p>
            <ul className="feature-bullets">
              <li><i className="fa-solid fa-circle-check"></i> Instant preview with toggle & text modifications</li>
              <li><i className="fa-solid fa-circle-check"></i> Clean responsive templates optimized for checkout conversions</li>
              <li><i className="fa-solid fa-circle-check"></i> Fully secure isolated configuration data pipelines</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6.5 NEW: AXIS AI CO-FOUNDER DEDICATED SECTION */}
      <section className="axis-feature-section" style={{ padding: '60px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="axis-bento-card" style={{ background: 'rgba(10, 10, 14, 0.7)', border: '1px solid rgba(139, 92, 246, 0.35)', borderRadius: '20px', padding: '40px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ flex: '1 1 400px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#00f0ff', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Built-In Executive Brain</span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '800', color: '#fff', margin: '10px 0 16px 0', lineHeight: '1.2' }}>
              Meet Axis, Your 24/7 AI Co-Founder.
            </h2>
            <p style={{ color: '#8E96A4', fontSize: '1rem', lineHeight: '1.7', marginBottom: '24px' }}>
              Never build alone. Whether you are stuck naming your brand, setting up your product catalog, or mapping out local delivery workflows, Axis holds your entire business context in memory.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
              <button className="axis-trigger-btn" onClick={handleAxisClick} style={{ background: 'linear-gradient(135deg, #00f0ff, #8B5CF6)', color: '#000', fontWeight: '800', border: 'none', padding: '14px 24px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)' }}>
                <i className="fa-solid fa-atom"></i> Consult Your AI Partner, Axis
              </button>
              <button className="axis-trigger-btn" onClick={handleAxisClick} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: '600', border: '1px solid rgba(255,255,255,0.15)', padding: '14px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.95rem' }}>
                Stuck on Setup? Ask Axis
              </button>
            </div>
          </div>

          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3), rgba(0, 240, 255, 0.1))', border: '2px dashed rgba(0, 240, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#00f0ff', boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}>
            <i className="fa-solid fa-atom"></i>
          </div>
        </div>
      </section>

      {/* 7. THE 4-STEP SEQUENTIAL TIMELINE PIPELINE */}
      <section className="four-steps-section">
        <div className="section-divider-title">
          <span className="section-sub-badge">FROM IDEA TO ORBIT</span>
          <h2>Four steps. One launch.</h2>
          <p>No tedious configurations, no bloated plugins, no technical learning curve. Just a direct launch countdown.</p>
        </div>

        <div className="steps-horizontal-matrix">
          <div className="step-card">
            <div className="step-card-num">01</div>
            <div className="step-icon-box"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
            <h5>Describe your idea</h5>
            <p>One sentence. Any concept. LaunchAxis extracts your core market values, market orientation, and brand persona attributes instantly.</p>
          </div>
          
          <div className="step-card">
            <div className="step-card-num">02</div>
            <div className="step-icon-box"><i className="fa-solid fa-palette"></i></div>
            <h5>Meet your brand</h5>
            <p>A customized name identity, tailored corporate logos, typography kits, and matching hex theme swatches assembled in seconds.</p>
          </div>

          <div className="step-card">
            <div className="step-card-num">03</div>
            <div className="step-icon-box"><i className="fa-solid fa-globe"></i></div>
            <h5>Your site goes live</h5>
            <p>A production e-commerce store with an online checkout system and a beautiful catalog goes live under your dashboard management.</p>
          </div>

          <div className="step-card">
            <div className="step-card-num">04</div>
            <div className="step-icon-box"><i className="fa-solid fa-circle-nodes"></i></div>
            <h5>Full Ignition</h5>
            <p>Your administration engine completes setup. Your real-time product trackers, order processors, and financial ledger cards deploy immediately.</p>
          </div>
        </div>
      </section>

      {/* 8. TIED SUBSCRIPTION PRICING PACKAGES */}
      <section id="pricing" className="pricing-matrix-section">
        <div className="section-divider-title">
          <span className="section-sub-badge">PRICING</span>
          <h2>Simple plans. Infinite altitude.</h2>
          <p>Start completely free. Upgrade seamlessly as your operational volume shifts into scale velocity.</p>
        </div>

        <div className="pricing-cards-wrapper">
          <div className="price-tier-card">
            <div className="tier-name">Cadet</div>
            <div className="tier-cost">PKR 0 <span className="cost-period">/ forever</span></div>
            <p className="tier-desc">Everything needed to test, configure, and validate your business ideas.</p>
            <button className="btn-tier-action">Start free &rarr;</button>
            <ul className="tier-perks">
              <li><i className="fa-solid fa-check"></i> AI Business Constructor</li>
              <li><i className="fa-solid fa-check"></i> 1 Active Storefront Site</li>
              <li><i className="fa-solid fa-check"></i> Core Administration Dashboard</li>
              <li><i className="fa-solid fa-check"></i> Standard Data Infrastructure Security</li>
            </ul>
          </div>

          <div className="price-tier-card popular-tier-highlight">
            <div className="popular-ribbon">MOST POPULAR</div>
            <div className="tier-name">Pilot</div>
            <div className="tier-cost">PKR 5,000 <span className="cost-period">/ month</span></div>
            <p className="tier-desc">For active founders running live customer order operations and scaling logistics.</p>
            <button className="btn-tier-action action-popular-btn">Start free trial &rarr;</button>
            <ul className="tier-perks">
              <li><i className="fa-solid fa-check"></i> Everything included in Cadet</li>
              <li><i className="fa-solid fa-check"></i> Custom Domain Connections</li>
              <li><i className="fa-solid fa-check"></i> Ledger Automation & Live Finance Cards</li>
              <li><i className="fa-solid fa-check"></i> Priority Dynamic Theme Controls</li>
            </ul>
          </div>

          <div className="price-tier-card">
            <div className="tier-name">Commander</div>
            <div className="tier-cost">PKR 15,000 <span className="cost-period">/ month</span></div>
            <p className="tier-desc">For collaborative team frameworks requiring advanced operational metrics analytics.</p>
            <button className="btn-tier-action">Talk to sales &rarr;</button>
            <ul className="tier-perks">
              <li><i className="fa-solid fa-check"></i> Everything included in Pilot</li>
              <li><i className="fa-solid fa-check"></i> Advanced Financial Forecasting</li>
              <li><i className="fa-solid fa-check"></i> Multi-User Operations Integration</li>
              <li><i className="fa-solid fa-check"></i> Enterprise Storage Redundancy Guardrails</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 9. FAQ CONTAINER */}
      <section className="faq-accordion-section">
        <div className="section-divider-title">
          <span className="section-sub-badge">FAQ</span>
          <h2>Every question, answered.</h2>
        </div>

        <div className="accordion-box-wrapper">
          <div className="faq-row active">
            <div className="faq-question">What is LaunchAxis, exactly? <span className="faq-toggle-icon">&minus;</span></div>
            <div className="faq-answer" style={{ display: 'block' }}>LaunchAxis is an AI-driven full-stack business launch platform and operational operating system. You describe an idea, and our workspace automatically constructs your visual identity, builds a working responsive web store, and sets up your accounting ledgers so you can run a real business out of one unified command center.</div>
          </div>
          <div className="faq-row">
            <div className="faq-question">Do I need any technical or web design skills? <span className="faq-toggle-icon">&plus;</span></div>
            <div className="faq-answer">None at all. The entire pipeline is designed for total convenience. LaunchAxis structures the backend, validates user inputs securely, and outputs high-conversion templates so non-technical everyday entrepreneurs can launch instantly without touching code.</div>
          </div>
          <div className="faq-row">
            <div className="faq-question">Can I use my own custom domain and theme styles? <span className="faq-toggle-icon">&plus;</span></div>
            <div className="faq-answer">Yes. Through your dedicated administration dashboard, you can quickly mount custom domains, change navigation parameters, switch accent theme colors, and toggle web sections with real-time UI previews.</div>
          </div>
        </div>
      </section>

      {/* 10. FINAL COUNTDOWN CTA SECTION WITH NEW REVIEW FORM */}
      <section id="start-countdown" className="countdown-conversion-banner" style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div className="countdown-box-card">
          <span className="badge-tag">IGNITION READY</span>
          <h3>Start your countdown.</h3>
          <p>Your business idea deserves an unfair operational advantage. Launch it with a software architecture engineered for speed.</p>
          <div className="cta-button-cluster" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
            <a href="/start-building" style={{ textDecoration: 'none', background: '#00f0ff', color: '#000', fontWeight: '800', padding: '16px 36px', borderRadius: '50px', fontSize: '1rem', boxShadow: '0 0 25px rgba(0, 240, 255, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              <i className="fa-solid fa-rocket"></i> Start building — it's free
            </a>
          </div>

          {/* NEW: WRITE A REVIEW FORM */}
          <div style={{ marginTop: '48px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '32px', textAlign: 'left', maxWidth: '500px', margin: '48px auto 0', backdropFilter: 'blur(10px)' }}>
            <h4 style={{ color: '#fff', marginBottom: '8px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-comment-dots" style={{ color: '#2dd4bf' }}></i> Stuck anywhere? Leave a review.
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Feel free to tell us what is missing or how we can improve your launch experience.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for your feedback!"); e.target.reset(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="email" placeholder="Your email address (optional)" className="review-input" />
              <textarea placeholder="Write your feedback here..." rows="4" className="review-input" style={{ resize: 'none' }} required></textarea>
              <button type="submit" style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid #2dd4bf', color: '#2dd4bf', fontWeight: 'bold', padding: '12px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', marginTop: '8px' }}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 11. ENTERPRISE SYSTEM FOOTER */}
      <footer className="enterprise-footer">
        <div className="footer-matrix-grid">
          <div className="footer-brand-column">
            <div className="footer-logo">▲ LaunchAxis</div>
            <p className="brand-subtext-clause">The AI-driven workspace for engineering, launching, and managing online storefront models from absolute zero.</p>
            <div className="footer-social-tray">
              <a href="#!"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#!"><i className="fa-brands fa-instagram"></i></a>
              <a href="#!"><i className="fa-brands fa-linkedin-in"></i></a>
              <a href="#!"><i className="fa-brands fa-github"></i></a>
              <a href="#!"><i className="fa-brands fa-youtube"></i></a>
            </div>
          </div>
          
          <div className="footer-links-column">
            <h6>Platform</h6>
            <a href="#!">AI Builder</a>
            <a href="#!">Dashboards</a>
            <a href="#!">Website Builder</a>
            <a href="#!">Finance Ledger</a>
          </div>

          <div className="footer-links-column">
            <h6>Solutions</h6>
            <a href="#!">Students</a>
            <a href="#!">Freelancers</a>
            <a href="#!">Small Business</a>
            <a href="#!">Startups</a>
          </div>

          <div className="footer-links-column">
            <h6>Resources</h6>
            <a href="#!">Docs</a>
            <a href="#!">Tutorials</a>
            <a href="#!">System Security</a>
            <a href="#!">Changelog</a>
          </div>

          <div className="footer-links-column">
            <h6>Company</h6>
            <a href="#!">About</a>
            <a href="#!">Careers</a>
            <a href="#!">Contact</a>
            <a href="#!">Privacy Engine</a>
          </div>
        </div>
        
        <div className="footer-bottom-legal-strip">
          <p>&copy; 2026 LaunchAxis Inc. All rights reserved. Powered by high-efficiency cloud data tokens.</p>
        </div>
      </footer>

      {/* FLOATING AXIS TRIGGER BUTTON */}
      <div className="axis-floating-widget" role="button" tabIndex="0" title="Consult your AI Co-Founder" onClick={handleAxisClick}>
        <div className="axis-pulse-ring"></div>
        <div className="axis-widget-icon">
          <i className="fa-solid fa-atom"></i>
        </div>
        <span className="axis-widget-label">Axis AI Partner</span>
      </div>
    </div>
  );
};

export default Homepage;