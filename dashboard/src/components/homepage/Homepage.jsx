import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import './Homepage.css';

// ============================================================================
// OPTIONAL: Paste your own dashboard screenshot paths or URLs here anytime!
// If left empty (''), the homepage automatically renders a live interactive UI preview.
// ============================================================================
const DASHBOARD_SCREENSHOTS = {
  overview: '', // e.g. '/images/dashboard-overview.png'
  website: '',  // e.g. '/images/website-editor.png'
  finance: '',  // e.g. '/images/finance-ledger.png'
  branding: ''  // e.g. '/images/branding-studio.png'
};

const Homepage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Firebase Auth Listener (Untouched)
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

  const handleAxisClick = (e) => {
    e.preventDefault();
    navigate('/chatbot');
  };

  const handleDocsClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    // Navigates to /docs when you build your Documentation page, or scrolls smoothly if #docs exists
    const docsEl = document.getElementById('docs');
    if (docsEl) {
      docsEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/docs');
    }
  };

  const faqItems = [
    {
      q: "What is LaunchAxis, exactly?",
      a: "LaunchAxis is an all-in-one AI business launch platform and operating system. You describe your business idea, and our workspace automatically generates your brand identity, builds a live e-commerce or service website, and sets up your accounting and inventory ledgers in one unified dashboard."
    },
    {
      q: "Do I need any coding, accounting, or design skills?",
      a: "None at all. LaunchAxis is built so first-time founders, freelancers, and retail store owners can launch and manage their operations effortlessly. Everything from landed unit cost calculations to storefront layouts is automated."
    },
    {
      q: "Does LaunchAxis support both Product Stores and Service Agencies?",
      a: "Yes. During setup, you choose whether you sell physical products or client services. LaunchAxis dynamically configures your dashboard and website with either a full shopping cart & checkout system or an agency portfolio & client lead capture system."
    },
    {
      q: "Can I customize my website, policies, and colors after launch?",
      a: "Absolutely. Through your Visual Branding Studio and Website Editor, you can update your colors, fonts, logos, hero banners, product FAQs, and legal/shipping policies in real time."
    }
  ];

  const previewTabs = [
    { id: 'overview', label: 'Command Center', icon: 'fa-solid fa-chart-pie', color: '#2563eb', url: 'app.launchaxis.com/admin/dashboard' },
    { id: 'website', label: 'Website Builder', icon: 'fa-solid fa-globe', color: '#059669', url: 'app.launchaxis.com/admin/website' },
    { id: 'finance', label: 'Financial Center', icon: 'fa-solid fa-wallet', color: '#ea580c', url: 'app.launchaxis.com/admin/finance' },
    { id: 'branding', label: 'Branding Studio', icon: 'fa-solid fa-palette', color: '#4f46e5', url: 'app.launchaxis.com/admin/branding' }
  ];

  const currentTabObj = previewTabs.find(t => t.id === activePreviewTab) || previewTabs[0];

  return (
    <div className="homepage-wrapper">
      
      {/* =================================================================
          1. CLEAN SAAS STICKY NAVBAR (WITH DROPDOWNS & DOCUMENTATION LINK)
         ================================================================= */}
      <header className="saas-navbar-header">
        <nav className="saas-navbar">
          
          {/* Brand Logo (Replace icon with your <img> logo anytime) */}
          <div className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-logo-badge">
              <i className="fa-solid fa-layer-group"></i>
            </div>
            <span className="brand-name-text">LaunchAxis</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-menu">
            <a href="#platform" className="nav-link">Home</a>

            <div className="dropdown-wrapper">
              <button type="button" className="dropdown-trigger">
                Platform <i className="fa-solid fa-chevron-down"></i>
              </button>
              <div className="dropdown-menu">
                <a href="#bento-features">
                  <span className="dd-icon dd-blue"><i className="fa-solid fa-chart-pie"></i></span>
                  <div>
                    <strong>Command Center</strong>
                    <span>Daily business overview & tasks</span>
                  </div>
                </a>
                <a href="#website-showcase">
                  <span className="dd-icon dd-emerald"><i className="fa-solid fa-globe"></i></span>
                  <div>
                    <strong>Website & Store Builder</strong>
                    <span>E-commerce & agency templates</span>
                  </div>
                </a>
                <a href="#bento-features">
                  <span className="dd-icon dd-orange"><i className="fa-solid fa-wallet"></i></span>
                  <div>
                    <strong>Financial Center</strong>
                    <span>Bookkeeping, stock & PDF statements</span>
                  </div>
                </a>
                <a href="#bento-features">
                  <span className="dd-icon dd-indigo"><i className="fa-solid fa-wand-magic-sparkles"></i></span>
                  <div>
                    <strong>AI Branding Studio</strong>
                    <span>Names, domains, logos & copywriter</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="dropdown-wrapper">
              <button type="button" className="dropdown-trigger">
                Solutions <i className="fa-solid fa-chevron-down"></i>
              </button>
              <div className="dropdown-menu">
                <a href="#website-showcase">
                  <span className="dd-icon dd-emerald"><i className="fa-solid fa-bag-shopping"></i></span>
                  <div>
                    <strong>For E-Commerce Brands</strong>
                    <span>Catalog, variants & COD checkout</span>
                  </div>
                </a>
                <a href="#website-showcase">
                  <span className="dd-icon dd-indigo"><i className="fa-solid fa-briefcase"></i></span>
                  <div>
                    <strong>For Service Agencies</strong>
                    <span>Case study portfolios & client leads</span>
                  </div>
                </a>
                <a href="#how-it-works">
                  <span className="dd-icon dd-orange"><i className="fa-solid fa-rocket"></i></span>
                  <div>
                    <strong>For New Founders</strong>
                    <span>Go from raw idea to live business</span>
                  </div>
                </a>
              </div>
            </div>

            {/* Direct Documentation Link in Navbar */}
            <a href="/docs" onClick={handleDocsClick} className="nav-link nav-doc-link">
              <i className="fa-solid fa-book-open"></i> Documentation
            </a>

            <a href="#pricing" className="nav-link">Pricing</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>

          {/* Right Auth Actions (Preserves exact routes) */}
          <div className="nav-actions">
            {userProfile ? (
              <button onClick={() => navigate('/profile')} className="founder-hub-pill">
                <span className="founder-avatar">{userProfile}</span>
                <span className="founder-hub-text">Founder Hub</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="nav-login-btn">
                  Log in
                </button>
                <button onClick={() => navigate('/auth')} className="nav-signup-btn">
                  Sign up
                </button>
                <button onClick={() => navigate('/start-building')} className="btn-primary-nav">
                  <span>Start building</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              type="button" 
              className="mobile-menu-toggle" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </nav>

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <a href="#platform" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#bento-features" onClick={() => setMobileMenuOpen(false)}>Platform Features</a>
            <a href="#website-showcase" onClick={() => setMobileMenuOpen(false)}>Store & Agency Websites</a>
            <a href="/docs" onClick={handleDocsClick}>
              <i className="fa-solid fa-book-open" style={{ color: '#2563eb', marginRight: '8px' }}></i> Documentation
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing Plans</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            
            {!userProfile && (
              <div className="mobile-drawer-auth">
                <button onClick={() => navigate('/login')} className="mobile-auth-outline">Log in</button>
                <button onClick={() => navigate('/auth')} className="mobile-auth-outline">Sign up</button>
                <button onClick={() => navigate('/start-building')} className="mobile-auth-primary">
                  Start building <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =================================================================
          2. CLEAN EXECUTIVE HERO SECTION (NO GLITCHY AUTO-TYPER OR V2 TAG)
         ================================================================= */}
      <section id="platform" className="hero-section">
        <div className="hero-container">
          
          <div className="hero-category-tags">
            <span className="cat-pill pill-blue"><i className="fa-solid fa-wand-magic-sparkles"></i> AI Brand Studio</span>
            <span className="cat-pill pill-emerald"><i className="fa-solid fa-store"></i> Live Web Storefront</span>
            <span className="cat-pill pill-orange"><i className="fa-solid fa-file-invoice-dollar"></i> Accounting & Stock</span>
          </div>

          <h1 className="hero-main-title">
            The all-in-one operating system to <span className="hero-accent-highlight">build and run</span> your business.
          </h1>

          <p className="hero-description">
            Describe your business idea in one sentence. LaunchAxis generates your brand identity, launches a responsive e-commerce or service website, and sets up your financial & inventory ledgers — ready in seconds.
          </p>

          <div className="hero-cta-group">
            <button onClick={() => navigate('/start-building')} className="btn-hero-primary">
              <span>Start building for free</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <button onClick={handleDocsClick} className="btn-hero-secondary">
              <i className="fa-solid fa-book-open" style={{ color: '#2563eb' }}></i>
              <span>Read Documentation</span>
            </button>
          </div>

          <div className="hero-trust-row">
            <span><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> No credit card required</span>
            <span><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> Free Forever Cadet Plan</span>
            <span><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> Product & Service templates included</span>
          </div>

          {/* =============================================================
              INTERACTIVE DASHBOARD PREVIEW FRAME (OR YOUR SCREENSHOTS)
             ============================================================= */}
          <div className="hero-showcase-wrapper">
            
            {/* Segmented Tab Switcher */}
            <div className="showcase-tab-bar">
              {previewTabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePreviewTab(tab.id)}
                  className={`showcase-tab-btn ${activePreviewTab === tab.id ? 'active' : ''}`}
                >
                  <i className={tab.icon} style={{ color: activePreviewTab === tab.id ? tab.color : '#64748b' }}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Browser Window Frame */}
            <div className="browser-mockup-window">
              <div className="browser-top-chrome">
                <div className="browser-dots">
                  <span className="b-dot red"></span>
                  <span className="b-dot amber"></span>
                  <span className="b-dot green"></span>
                </div>
                <div className="browser-address-bar">
                  <i className="fa-solid fa-lock" style={{ color: '#059669', marginRight: '6px' }}></i>
                  {currentTabObj.url}
                </div>
                <div className="browser-status-badge">Live Workspace</div>
              </div>

              <div className="browser-viewport-body">
                {DASHBOARD_SCREENSHOTS[activePreviewTab] ? (
                  <img 
                    src={DASHBOARD_SCREENSHOTS[activePreviewTab]} 
                    alt={currentTabObj.label} 
                    className="custom-dashboard-screenshot" 
                  />
                ) : (
                  <div className="simulated-workspace-ui">
                    {/* Simulated Sidebar */}
                    <div className="sim-sidebar">
                      <div className="sim-brand-row">
                        <span className="sim-brand-dot"></span>
                        <strong>Obsidian Digital</strong>
                      </div>
                      <div className={`sim-nav-item ${activePreviewTab === 'overview' ? 'active' : ''}`} onClick={() => setActivePreviewTab('overview')}>
                        <i className="fa-solid fa-chart-pie"></i> Dashboard
                      </div>
                      <div className={`sim-nav-item ${activePreviewTab === 'finance' ? 'active' : ''}`} onClick={() => setActivePreviewTab('finance')}>
                        <i className="fa-solid fa-wallet"></i> Finance
                      </div>
                      <div className={`sim-nav-item ${activePreviewTab === 'branding' ? 'active' : ''}`} onClick={() => setActivePreviewTab('branding')}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Branding (AI)
                      </div>
                      <div className={`sim-nav-item ${activePreviewTab === 'website' ? 'active' : ''}`} onClick={() => setActivePreviewTab('website')}>
                        <i className="fa-solid fa-globe"></i> Website
                      </div>
                      <div className="sim-nav-item"><i className="fa-solid fa-box-open"></i> Catalog & Work</div>
                    </div>

                    {/* Simulated Main Content Area */}
                    <div className="sim-main-canvas">
                      {activePreviewTab === 'overview' && (
                        <>
                          <div className="sim-canvas-header">
                            <div>
                              <span className="sim-eyebrow" style={{ color: '#ea580c' }}>DAILY OVERVIEW</span>
                              <h4>Business Summary</h4>
                            </div>
                            <span className="sim-action-pill">+ Add Item</span>
                          </div>
                          <div className="sim-metrics-grid">
                            <div className="sim-metric-card">
                              <div className="sim-m-top"><span>Total Sales</span><i className="fa-solid fa-arrow-trend-up sim-ic-emerald"></i></div>
                              <strong>Rs 148,500</strong>
                              <small style={{ color: '#059669' }}>+18% this week</small>
                            </div>
                            <div className="sim-metric-card">
                              <div className="sim-m-top"><span>Available Cash</span><i className="fa-solid fa-wallet sim-ic-blue"></i></div>
                              <strong>Rs 92,000</strong>
                              <small>Reconciled in ledger</small>
                            </div>
                            <div className="sim-metric-card">
                              <div className="sim-m-top"><span>Orders to Pack</span><i className="fa-solid fa-clock sim-ic-orange"></i></div>
                              <strong>6 Pending</strong>
                              <small style={{ color: '#ea580c' }}>Ready for dispatch</small>
                            </div>
                            <div className="sim-metric-card">
                              <div className="sim-m-top"><span>Active Listings</span><i className="fa-solid fa-box-open sim-ic-indigo"></i></div>
                              <strong>24 Live</strong>
                              <small>Synced to storefront</small>
                            </div>
                          </div>
                          <div className="sim-bottom-split">
                            <div className="sim-panel">
                              <h5><i className="fa-solid fa-clipboard-check" style={{ color: '#ea580c' }}></i> Next Steps & Launch Checklist</h5>
                              <div className="sim-check-row done"><i className="fa-solid fa-circle-check"></i> Brand identity & domain verified</div>
                              <div className="sim-check-row done"><i className="fa-solid fa-circle-check"></i> Storefront catalog & FAQ tabs published</div>
                              <div className="sim-check-row"><i className="fa-regular fa-circle"></i> Dispatch 6 pending COD customer orders</div>
                            </div>
                            <div className="sim-panel">
                              <h5><i className="fa-solid fa-store" style={{ color: '#4f46e5' }}></i> Brand & Ideal Customer</h5>
                              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#475569' }}>Modern digital products & accessories tailored for everyday professionals.</p>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span className="sim-color-chip"><i style={{ background: '#2563eb' }}></i> #2563EB</span>
                                <span className="sim-color-chip"><i style={{ background: '#0f172a' }}></i> #0F172A</span>
                                <span className="sim-color-chip"><i style={{ background: '#10b981' }}></i> #10B981</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {activePreviewTab === 'website' && (
                        <>
                          <div className="sim-canvas-header">
                            <div>
                              <span className="sim-eyebrow" style={{ color: '#059669' }}>ONLINE PRESENCE</span>
                              <h4>Storefront & Portfolio Builder</h4>
                            </div>
                            <span className="sim-action-pill" style={{ background: '#059669' }}>Published & Live</span>
                          </div>
                          <div className="sim-bottom-split">
                            <div className="sim-panel">
                              <h5><i className="fa-solid fa-sliders" style={{ color: '#2563eb' }}></i> Live Theme & Hero Controls</h5>
                              <div className="sim-input-mock">Subdomain: <strong>obsidian.launchaxis.com</strong></div>
                              <div className="sim-input-mock">Headline: <strong>Crafted for Everyday Excellence</strong></div>
                              <div className="sim-input-mock">Sections: <strong>Hero, Catalog, Best Sellers, FAQs, Policies</strong></div>
                            </div>
                            <div className="sim-panel" style={{ background: '#0f172a', color: '#fff' }}>
                              <span style={{ fontSize: '10px', color: '#fb923c', fontWeight: '800' }}>LIVE STOREFRONT PREVIEW</span>
                              <h5 style={{ color: '#fff', marginTop: '6px' }}>Welcome to Obsidian Digital</h5>
                              <p style={{ fontSize: '12px', color: '#cbd5e1' }}>Responsive layout with instant product modal, size variants, and COD checkout.</p>
                              <span style={{ display: 'inline-block', background: '#2563eb', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>Shop Collection</span>
                            </div>
                          </div>
                        </>
                      )}

                      {activePreviewTab === 'finance' && (
                        <>
                          <div className="sim-canvas-header">
                            <div>
                              <span className="sim-eyebrow" style={{ color: '#2563eb' }}>ACCOUNTING & STOCK</span>
                              <h4>Financial Center & Landed Cost</h4>
                            </div>
                            <span className="sim-action-pill">Export PDF Statement</span>
                          </div>
                          <div className="sim-metrics-grid">
                            <div className="sim-metric-card"><span>Cash Inflow</span><strong style={{ color: '#059669' }}>+Rs 185,000</strong></div>
                            <div className="sim-metric-card"><span>Expenses Paid</span><strong style={{ color: '#dc2626' }}>-Rs 42,500</strong></div>
                            <div className="sim-metric-card"><span>Receivables</span><strong style={{ color: '#ea580c' }}>Rs 18,000</strong></div>
                            <div className="sim-metric-card"><span>Payables</span><strong style={{ color: '#4f46e5' }}>Rs 0</strong></div>
                          </div>
                          <div className="sim-panel">
                            <h5><i className="fa-solid fa-receipt" style={{ color: '#059669' }}></i> Recent Ledger Entries</h5>
                            <div className="sim-check-row done"><span>Cash Receipt • Website Order #1042</span><strong style={{ color: '#059669', marginLeft: 'auto' }}>+Rs 12,500</strong></div>
                            <div className="sim-check-row done"><span>Cash Payment • Packaging & Courier Batch</span><strong style={{ color: '#dc2626', marginLeft: 'auto' }}>-Rs 3,200</strong></div>
                          </div>
                        </>
                      )}

                      {activePreviewTab === 'branding' && (
                        <>
                          <div className="sim-canvas-header">
                            <div>
                              <span className="sim-eyebrow" style={{ color: '#4f46e5' }}>IDENTITY & COPYWRITING</span>
                              <h4>Visual Branding Studio</h4>
                            </div>
                            <span className="sim-action-pill">Auto-Synced</span>
                          </div>
                          <div className="sim-bottom-split">
                            <div className="sim-panel">
                              <h5><i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#4f46e5' }}></i> AI Name, Domain & SVG Logo</h5>
                              <div className="sim-input-mock">Domain Status: <strong style={{ color: '#059669' }}>obsidianstore.com (Available)</strong></div>
                              <div className="sim-input-mock">Typography: <strong>Inter / Playfair Display</strong></div>
                            </div>
                            <div className="sim-panel" style={{ background: '#4f46e5', color: '#fff', textAlign: 'center' }}>
                              <h4 style={{ margin: '8px 0 4px', color: '#fff' }}>Obsidian Digital</h4>
                              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>"Disruptive interfaces & curated essentials"</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =================================================================
          3. CORE PLATFORM BENTO MATRIX
         ================================================================= */}
      <section id="bento-features" className="section-block">
        <div className="section-header-center">
          <span className="eyebrow-badge badge-blue">UNIFIED ARCHITECTURE</span>
          <h2>One workspace for every pillar of your business.</h2>
          <p>Stop stitching together separate website builders, accounting spreadsheets, and design tools. Everything talks to each other automatically.</p>
        </div>

        <div className="bento-feature-grid">
          
          {/* Bento Card 1 */}
          <div className="bento-feature-card span-two">
            <div className="bf-icon-box bg-blue"><i className="fa-solid fa-chart-pie"></i></div>
            <span className="bf-tag" style={{ color: '#2563eb' }}>DAILY COMMAND CENTER</span>
            <h3>Crystal-clear visibility from day one.</h3>
            <p>Track your product sales, available cash in hand, pending orders, and step-by-step launch tasks in a clean interface anyone can understand at a single glance.</p>
            <div className="bf-mini-tags">
              <span><i className="fa-solid fa-check"></i> Guided Founder Checklist</span>
              <span><i className="fa-solid fa-check"></i> Low-Stock Warnings</span>
              <span><i className="fa-solid fa-check"></i> Live Order Counters</span>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bento-feature-card">
            <div className="bf-icon-box bg-orange"><i className="fa-solid fa-calculator"></i></div>
            <span className="bf-tag" style={{ color: '#ea580c' }}>CHARTERED-GRADE LEDGER</span>
            <h3>Bookkeeping & Landed Cost Calculator.</h3>
            <p>Separate cash receipts from credit invoices cleanly. Calculate true unit landed cost (base cost + batch shipping) so you know your exact profit margin before selling.</p>
            <div className="bf-stat-callout">
              <span> Print-ready PDF Account Statements</span>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bento-feature-card">
            <div className="bf-icon-box bg-indigo"><i className="fa-solid fa-palette"></i></div>
            <span className="bf-tag" style={{ color: '#4f46e5' }}>AI BRANDING STUDIO</span>
            <h3>Name, domain check, logo & copywriter.</h3>
            <p>Generate punchy brand names, verify live `.com` and `.store` domain availability via WHOIS, design scalable vector logos, and draft SEO copy in seconds.</p>
          </div>

          {/* Bento Card 4 */}
          <div className="bento-feature-card span-two">
            <div className="bf-icon-box bg-emerald"><i className="fa-solid fa-globe"></i></div>
            <span className="bf-tag" style={{ color: '#059669' }}>DUAL WEBSITE ENGINE</span>
            <h3>Built for both Product Stores and Service Agencies.</h3>
            <p>Whether you sell physical items with size/color variants and Cash on Delivery, or run an agency showcasing case study portfolios and capturing client leads, LaunchAxis adapts your website automatically.</p>
            <div className="bf-mini-tags">
              <span><i className="fa-solid fa-check"></i> Product Info & FAQ Accordions</span>
              <span><i className="fa-solid fa-check"></i> Agency Case Study Modals</span>
              <span><i className="fa-solid fa-check"></i> Auto-Synced Legal & Shipping Policies</span>
            </div>
          </div>

        </div>
      </section>

      {/* =================================================================
          4. DUAL WEBSITE SHOWCASE (PRODUCT STORE VS SERVICE PORTFOLIO)
         ================================================================= */}
      <section id="website-showcase" className="section-block bg-slate-soft">
        <div className="section-header-center">
          <span className="eyebrow-badge badge-emerald">PRODUCTION STOREFRONTS</span>
          <h2>Websites that look and convert like major brands.</h2>
          <p>Every LaunchAxis account includes a complete, mobile-responsive customer website connected directly to your admin catalog and settings.</p>
        </div>

        <div className="dual-template-grid">
          
          {/* E-Commerce Card */}
          <div className="template-showcase-card">
            <div className="ts-header">
              <span className="ts-badge badge-emerald"><i className="fa-solid fa-bag-shopping"></i> E-Commerce Mode</span>
              <h3>Complete Retail Storefront</h3>
              <p>Designed for clothing, perfume, skincare, electronics, and retail brands.</p>
            </div>
            <ul className="ts-checklist">
              <li><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> Interactive Product Quick-View Modal with multi-photo gallery</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> Custom Size, Color & Volume variant selectors</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> Expandable Ingredients, Benefits, Size Guide & FAQ tabs</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: '#059669' }}></i> Slide-out Shopping Bag with Free Shipping progress bar & COD Checkout</li>
            </ul>
          </div>

          {/* Service Agency Card */}
          <div className="template-showcase-card">
            <div className="ts-header">
              <span className="ts-badge badge-indigo"><i className="fa-solid fa-briefcase"></i> Service & Agency Mode</span>
              <h3>Client Portfolio & Lead Hub</h3>
              <p>Designed for software houses, design studios, consultants, and real estate firms.</p>
            </div>
            <ul className="ts-checklist">
              <li><i className="fa-solid fa-circle-check" style={{ color: '#4f46e5' }}></i> Service Category cards linked directly to portfolio case studies</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: '#4f46e5' }}></i> Full Case Study Modal with client name, deliverables tags & results</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: '#4f46e5' }}></i> Leadership Team showcase & "Why Choose Us" strength highlights</li>
              <li><i className="fa-solid fa-circle-check" style={{ color: '#4f46e5' }}></i> Direct Consultation & Lead Capture form synced to your CRM tab</li>
            </ul>
          </div>

        </div>
      </section>

      {/* =================================================================
          5. MEET AXIS AI CO-FOUNDER BANNER
         ================================================================= */}
      <section className="section-block">
        <div className="axis-cofounder-banner">
          <div className="axis-banner-content">
            <span className="eyebrow-badge badge-indigo">24/7 EXECUTIVE AI PARTNER</span>
            <h2>Meet Axis — your always-on AI business advisor.</h2>
            <p>
              Stuck choosing a pricing strategy, writing your return policy, or planning your first marketing campaign? Axis understands your business model and gives you practical, step-by-step guidance whenever you need it.
            </p>
            <div className="axis-banner-buttons">
              <button onClick={handleAxisClick} className="btn-axis-primary">
                <i className="fa-solid fa-robot"></i> Launch Axis AI Assistant
              </button>
              <button onClick={() => navigate('/start-building')} className="btn-axis-secondary">
                Build My Workspace &rarr;
              </button>
            </div>
          </div>

          <div className="axis-chat-preview-card">
            <div className="acp-header">
              <div className="acp-avatar"><i className="fa-solid fa-robot"></i></div>
              <div>
                <strong>Axis AI Co-Founder</strong>
                <span><i className="fa-solid fa-circle" style={{ color: '#10b981', fontSize: '7px' }}></i> Online & Ready</span>
              </div>
            </div>
            <div className="acp-bubble user">
              How should I price my 50ml perfume if unit cost is Rs 1,200 and batch shipping is Rs 2,500 for 50 bottles?
            </div>
            <div className="acp-bubble ai">
              Your true landed cost is <strong>Rs 1,250/unit</strong>. At a retail price of <strong>Rs 2,800</strong>, you earn <strong>Rs 1,550 net profit</strong> per bottle (55% margin). Want me to log this in your Warehouse tab?
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================
          6. FOUR STEPS TO LAUNCH
         ================================================================= */}
      <section id="how-it-works" className="section-block bg-slate-soft">
        <div className="section-header-center">
          <span className="eyebrow-badge badge-orange">HOW IT WORKS</span>
          <h2>From idea to live business in four simple steps.</h2>
          <p>No complex plugins or technical setup required.</p>
        </div>

        <div className="four-steps-grid">
          <div className="step-bento-card">
            <div className="step-top-row">
              <span className="step-icon-badge bg-blue"><i className="fa-solid fa-lightbulb"></i></span>
              <span className="step-num">STEP 01</span>
            </div>
            <h4>Describe your idea</h4>
            <p>Tell LaunchAxis what you want to sell or offer, and pick whether you are a product store or service agency.</p>
          </div>

          <div className="step-bento-card">
            <div className="step-top-row">
              <span className="step-icon-badge bg-indigo"><i className="fa-solid fa-wand-magic-sparkles"></i></span>
              <span className="step-num">STEP 02</span>
            </div>
            <h4>Generate your brand</h4>
            <p>Get an AI-crafted brand name, tagline, target customer profile, color palette, and available domain check.</p>
          </div>

          <div className="step-bento-card">
            <div className="step-top-row">
              <span className="step-icon-badge bg-emerald"><i className="fa-solid fa-globe"></i></span>
              <span className="step-num">STEP 03</span>
            </div>
            <h4>Publish your website</h4>
            <p>Add your products or portfolio case studies, customize your hero banner, and flip your site status to Live.</p>
          </div>

          <div className="step-bento-card">
            <div className="step-top-row">
              <span className="step-icon-badge bg-orange"><i className="fa-solid fa-chart-line"></i></span>
              <span className="step-num">STEP 04</span>
            </div>
            <h4>Manage orders & cash</h4>
            <p>Track incoming orders or client leads, record cash receipts and bills, and print official account statements.</p>
          </div>
        </div>
      </section>

      {/* =================================================================
          7. TRANSPARENT PRICING PLANS
         ================================================================= */}
      <section id="pricing" className="section-block">
        <div className="section-header-center">
          <span className="eyebrow-badge badge-blue">PRICING PLANS</span>
          <h2>Start free. Upgrade as you grow.</h2>
          <p>Every plan includes our complete dashboard, website builder, and financial ledger.</p>
        </div>

        <div className="pricing-bento-grid">
          
          {/* Cadet */}
          <div className="pricing-bento-card">
            <div className="p-tier-badge">CADET TIER</div>
            <div className="p-price">PKR 0 <span>/ forever</span></div>
            <p className="p-desc">Ideal for new founders validating their first store or service portfolio.</p>
            <button onClick={() => navigate('/start-building')} className="btn-price-outline">
              Start Free Forever &rarr;
            </button>
            <ul className="p-feature-list">
              <li><i className="fa-solid fa-check" style={{ color: '#059669' }}></i> AI Business & Brand Architecture</li>
              <li><i className="fa-solid fa-check" style={{ color: '#059669' }}></i> 1 Live Storefront or Agency Site</li>
              <li><i className="fa-solid fa-check" style={{ color: '#059669' }}></i> 50 Monthly Financial Ledger Entries</li>
              <li><i className="fa-solid fa-check" style={{ color: '#059669' }}></i> 10 Free AI Studio Generations</li>
            </ul>
          </div>

          {/* Pilot (Highlighted) */}
          <div className="pricing-bento-card featured-plan">
            <div className="popular-pill-tag">MOST POPULAR</div>
            <div className="p-tier-badge" style={{ color: '#2563eb' }}>PILOT TIER</div>
            <div className="p-price">PKR 5,000 <span>/ month</span></div>
            <p className="p-desc">For growing brands fulfilling daily customer orders and scaling inventory.</p>
            <button onClick={() => navigate('/start-building')} className="btn-price-primary">
              Start Free Trial &rarr;
            </button>
            <ul className="p-feature-list">
              <li><i className="fa-solid fa-check" style={{ color: '#2563eb' }}></i> Everything in Cadet Tier</li>
              <li><i className="fa-solid fa-check" style={{ color: '#2563eb' }}></i> Unlimited Collections & Portfolio Items</li>
              <li><i className="fa-solid fa-check" style={{ color: '#2563eb' }}></i> Unlimited Bookkeeping & PDF Statements</li>
              <li><i className="fa-solid fa-check" style={{ color: '#2563eb' }}></i> Unlimited AI Copywriting & Logo Tools</li>
            </ul>
          </div>

          {/* Commander */}
          <div className="pricing-bento-card">
            <div className="p-tier-badge" style={{ color: '#ea580c' }}>COMMANDER TIER</div>
            <div className="p-price">PKR 15,000 <span>/ month</span></div>
            <p className="p-desc">For established businesses needing multi-user access and priority support.</p>
            <button onClick={() => navigate('/start-building')} className="btn-price-outline">
              Get Started &rarr;
            </button>
            <ul className="p-feature-list">
              <li><i className="fa-solid fa-check" style={{ color: '#ea580c' }}></i> Everything in Pilot Tier</li>
              <li><i className="fa-solid fa-check" style={{ color: '#ea580c' }}></i> Multi-Brand Workspace Support</li>
              <li><i className="fa-solid fa-check" style={{ color: '#ea580c' }}></i> Priority Courier & Domain Onboarding</li>
              <li><i className="fa-solid fa-check" style={{ color: '#ea580c' }}></i> Dedicated Account Support</li>
            </ul>
          </div>

        </div>
      </section>

      {/* =================================================================
          8. INTERACTIVE FAQ ACCORDION
         ================================================================= */}
      <section id="faq" className="section-block bg-slate-soft">
        <div className="section-header-center">
          <span className="eyebrow-badge badge-indigo">FREQUENTLY ASKED QUESTIONS</span>
          <h2>Everything you need to know.</h2>
        </div>

        <div className="faq-bento-container">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className={`faq-bento-item ${isOpen ? 'open' : ''}`}>
                <button 
                  type="button" 
                  className="faq-bento-question" 
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                >
                  <span>{item.q}</span>
                  <i className={`fa-solid ${isOpen ? 'fa-minus' : 'fa-plus'}`}></i>
                </button>
                {isOpen && (
                  <div className="faq-bento-answer">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =================================================================
          9. FINAL CTA & FOUNDER FEEDBACK CARD
         ================================================================= */}
      <section className="section-block">
        <div className="final-cta-bento">
          <div className="final-cta-left">
            <span className="eyebrow-badge badge-orange">READY FOR LIFTOFF</span>
            <h2>Launch your business today.</h2>
            <p>Join ambitious founders building their brand, website, and financial operations in one unified workspace.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/start-building')} className="btn-hero-primary">
                <span>Start building — it's free</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              <button onClick={() => navigate('/auth')} className="btn-hero-secondary">
                Create Account
              </button>
            </div>
          </div>

          <div className="final-cta-feedback">
            <h4><i className="fa-solid fa-comment-dots" style={{ color: '#2563eb' }}></i> Have a feature request or feedback?</h4>
            <p>Tell us what would make your launch experience even better.</p>
            {reviewSubmitted ? (
              <div className="feedback-success-box">
                <i className="fa-solid fa-circle-check"></i> Thank you! Your feedback has been recorded.
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setReviewSubmitted(true); e.target.reset(); }} 
                className="feedback-form"
              >
                <input type="email" placeholder="Your email address (optional)" className="saas-light-input" />
                <textarea placeholder="Share your feedback or question..." rows="3" className="saas-light-input" required></textarea>
                <button type="submit" className="btn-feedback-submit">
                  Send Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =================================================================
          10. CLEAN ENTERPRISE FOOTER
         ================================================================= */}
      <footer className="saas-footer">
        <div className="saas-footer-grid">
          <div className="footer-brand-col">
            <div className="nav-brand" style={{ marginBottom: '12px' }}>
              <div className="brand-logo-badge"><i className="fa-solid fa-layer-group"></i></div>
              <span className="brand-name-text" style={{ color: '#0f172a' }}>LaunchAxis</span>
            </div>
            <p>The unified AI business operating system for launching and scaling modern e-commerce stores and service agencies.</p>
          </div>

          <div className="footer-link-col">
            <h6>Platform</h6>
            <a href="#bento-features">Command Center</a>
            <a href="#website-showcase">Website Builder</a>
            <a href="#bento-features">Financial Center</a>
            <a href="#bento-features">Branding Studio</a>
          </div>

          <div className="footer-link-col">
            <h6>Resources</h6>
            <a href="/docs" onClick={handleDocsClick}>Documentation</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing Plans</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-link-col">
            <h6>Get Started</h6>
            <a href="/start-building" onClick={(e) => { e.preventDefault(); navigate('/start-building'); }}>Start Building</a>
            <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>Founder Login</a>
            <a href="/auth" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>Create Account</a>
            <a href="/chatbot" onClick={handleAxisClick}>Axis AI Co-Founder</a>
          </div>
        </div>

        <div className="saas-footer-bottom">
          <span>&copy; {new Date().getFullYear()} LaunchAxis. All rights reserved.</span>
          <span>Engineered for modern founders.</span>
        </div>
      </footer>

      {/* =================================================================
          11. UPGRADED FLOATING AXIS AI CHATBOT LAUNCHER
         ================================================================= */}
      <button 
        type="button"
        className="axis-chatbot-launcher" 
        onClick={handleAxisClick}
        title="Ask Axis AI Co-Founder"
      >
        <div className="axis-bot-avatar">
          <i className="fa-solid fa-robot"></i>
          <span className="axis-online-dot"></span>
        </div>
        <div className="axis-bot-text">
          <span className="axis-bot-title">Ask Axis AI</span>
          <span className="axis-bot-sub">24/7 Business Co-Founder</span>
        </div>
        <div className="axis-bot-sparkle">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </div>
      </button>

    </div>
  );
};

export default Homepage;