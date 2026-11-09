import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhone, faEnvelope, faMapMarkerAlt, faTimes, faArrowRight, 
  faCheckCircle, faImages, faImage, faBars, faBriefcase, 
  faExternalLinkAlt, faCalendarDays, faBuilding, faPlus, faMinus, 
  faShieldHalved, faAward, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const ServiceTemplate = ({ branding = {}, siteConfig = {}, projects = [], onSubmitLead }) => {
  const contactRef = useRef(null);
  const portfolioRef = useRef(null);
  
  // Lead Form, Policy Modal, Category Filter, and Case Study Detail Modal States
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', details: '', service: '' });
  const [leadSubmittedModal, setLeadSubmittedModal] = useState(false);
  const [activePolicy, setActivePolicy] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState(0);
  const [openAccordionIdx, setOpenAccordionIdx] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pre-fill Unsplash Images if none provided
  const heroImg = siteConfig?.heroImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80';
  const aboutImg = siteConfig?.aboutImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

  const themeColor = siteConfig?.themeColor || branding?.color || '#2563eb';
  const fontFamily = branding?.font || "'Inter', sans-serif";
  const brandName = branding?.name && branding.name !== 'Loading...' ? branding.name : 'Our Agency';

  // Safe defaults
  const heroTitle = siteConfig?.heroTitle || `Modern Solutions by ${brandName}`;
  const heroSub = siteConfig?.heroSubtitle || branding?.slogan || "Delivering reliable expertise and seamless project execution.";
  const aboutText = siteConfig?.aboutText || "We partner with ambitious brands to deliver high-impact strategy, design, and execution tailored for measurable growth.";
  const team = siteConfig?.teamMembers || [];
  const strengths = siteConfig?.whyChooseUs || [];
  
  // Smart Menu Override
  const rawMenuItems = siteConfig?.menuItems?.length > 0 
    ? siteConfig.menuItems 
    : [{ label: 'Home', link: '#home' }, { label: 'Services', link: '#services' }, { label: 'Portfolio', link: '#portfolio' }, { label: 'About', link: '#about' }, { label: 'Contact', link: '#contact' }];
    
  const menuItems = rawMenuItems.map(item => {
    if (item.link === '#catalog' || item.label.toLowerCase() === 'catalog') {
      return { ...item, label: 'Services', link: '#services' };
    }
    return item;
  });

  // Ensure Portfolio link is accessible
  const hasPortfolioLink = menuItems.some(i => i.link === '#portfolio');
  const finalMenuItems = hasPortfolioLink 
    ? menuItems 
    : [...menuItems.slice(0, 2), { id: 'core-portfolio', label: 'Portfolio', link: '#portfolio' }, ...menuItems.slice(2)];
  
  // Service Categories
  const services = siteConfig?.services?.length > 0 ? siteConfig.services : [
    { title: 'Strategy & Consulting', desc: 'Tailored roadmaps and advisory designed around your core business goals.' },
    { title: 'Custom Execution', desc: 'End-to-end project delivery, design, and technical implementation.' }
  ];

  // Filter only public/active projects
  const publicProjects = (projects || []).filter(p => p.status !== 'hidden');
  const displayedProjects = selectedCategory === 'All' 
    ? publicProjects 
    : publicProjects.filter(p => p.category === selectedCategory);

  // Safe external URL helper
  const getSafeExternalUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleServiceClick = (serviceName) => {
    setLeadForm(prev => ({ ...prev, service: serviceName }));
    setSelectedProject(null);
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewCategoryProjects = (categoryTitle) => {
    setSelectedCategory(categoryTitle);
    if (portfolioRef.current) {
      portfolioRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openProjectModal = (proj) => {
    setSelectedProject(proj);
    setActiveGalleryIdx(0);
    setOpenAccordionIdx(0);
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    const sanitizedLead = {
      name: leadForm.name.trim().slice(0, 100),
      phone: leadForm.phone.trim().slice(0, 40),
      email: leadForm.email.trim().slice(0, 100),
      service: leadForm.service.trim().slice(0, 100) || 'General Inquiry',
      details: leadForm.details.trim().slice(0, 1500)
    };

    if (onSubmitLead) {
      await onSubmitLead(sanitizedLead);
    }
    setLeadForm({ name: '', phone: '', email: '', details: '', service: '' });
    setLeadSubmittedModal(true);
  };

  return (
    <div className="service-template-wrapper" style={{ '--brand-color': themeColor, fontFamily }}>
      
      <style>{`
        .service-template-wrapper { color: #334155; background: #ffffff; line-height: 1.6; overflow-x: hidden; }
        .st-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .st-section { padding: 88px 0; }
        .st-bg-light { background-color: #f8fafc; }
        .st-tagline { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: var(--brand-color); display: block; margin-bottom: 10px; }
        .st-title { font-size: clamp(28px, 4vw, 38px); font-weight: 900; color: #0f172a; margin: 0 0 16px; line-height: 1.2; letter-spacing: -0.5px; }
        
        /* Navbar */
        .st-navbar { position: sticky; top: 0; background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border-bottom: 1px solid #f1f5f9; z-index: 100; padding: 16px 0; }
        .st-nav-content { display: flex; align-items: center; justify-content: space-between; position: relative; }
        .st-logo { font-size: 22px; font-weight: 900; color: #0f172a; text-decoration: none; display: flex; align-items: center; gap: 10px; letter-spacing: -0.5px; }
        .st-nav-links { display: flex; gap: 28px; align-items: center; }
        .st-nav-links a { text-decoration: none; color: #475569; font-weight: 600; font-size: 14px; transition: color 0.2s; }
        .st-nav-links a:hover { color: var(--brand-color); }
        .st-mobile-btn { display: none; background: none; border: none; font-size: 22px; color: #0f172a; cursor: pointer; padding: 5px; }

        /* Hero */
        .st-hero { min-height: 82vh; display: flex; align-items: center; text-align: center; color: #fff; background-size: cover; background-position: center; position: relative; }
        .st-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.65) 100%); }
        .st-hero-content { position: relative; z-index: 1; max-width: 820px; margin: 0 auto; padding: 40px 0; }
        .st-hero h1 { font-size: clamp(34px, 5vw, 56px); font-weight: 900; margin: 0 0 20px; line-height: 1.15; letter-spacing: -1px; color: #ffffff; }
        .st-hero p { font-size: clamp(16px, 2vw, 19px); margin: 0 auto 36px; color: #e2e8f0; max-width: 660px; }
        
        /* Buttons */
        .st-btn { padding: 13px 26px; border-radius: 10px; font-weight: 700; border: none; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; transition: all 0.2s ease; }
        .st-btn-primary { background: var(--brand-color); color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.12); }
        .st-btn-primary:hover { transform: translateY(-2px); filter: brightness(1.05); }
        .st-btn-outline { background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.35); backdrop-filter: blur(6px); }
        .st-btn-outline:hover { background: #fff; color: #0f172a; }
        .st-btn-secondary { background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; }
        .st-btn-secondary:hover { background: #f1f5f9; }

        /* Grids */
        .st-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        
        /* Cards */
        .st-service-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 26px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.25s ease; display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
        .st-service-card:hover { transform: translateY(-4px); box-shadow: 0 14px 28px -8px rgba(15,23,42,0.08); border-color: var(--brand-color); }
        .st-service-icon { width: 52px; height: 52px; background: #f8fafc; color: var(--brand-color); border: 1px solid #e2e8f0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        
        /* Footer */
        .st-footer { background: #0f172a; color: #fff; padding: 72px 0 32px; }
        .st-footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 40px; margin-bottom: 48px; }
        .st-social-btn { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.08); color: #fff; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; margin-right: 10px; transition: background 0.2s; }
        .st-social-btn:hover { background: var(--brand-color); }
        .st-footer-link { color: #cbd5e1; text-decoration: none; display: block; margin-bottom: 10px; transition: color 0.2s; cursor: pointer; background: none; border: none; padding: 0; font-size: 14px; text-align: left; }
        .st-footer-link:hover { color: #ffffff; }

        @media (max-width: 768px) {
          .st-mobile-btn { display: block; }
          .st-nav-cta { display: none; }
          .st-nav-links {
            position: absolute; top: 100%; left: 0; right: 0;
            background: #fff; flex-direction: column; gap: 0;
            box-shadow: 0 10px 20px rgba(0,0,0,0.08);
            max-height: 0; overflow: hidden; opacity: 0;
          }
          .st-nav-links.open { max-height: 420px; opacity: 1; padding: 10px 0; border-top: 1px solid #e2e8f0; }
          .st-nav-links a { padding: 14px 20px; width: 100%; text-align: center; border-bottom: 1px solid #f8fafc; }
          .st-section { padding: 60px 0; }
        }
      `}</style>

      {/* --- 1. NAVBAR --- */}
      <nav className="st-navbar">
        <div className="st-container st-nav-content">
          <a href="#home" className="st-logo">
            {branding?.logo && <img src={branding.logo} alt={brandName} style={{ height: '34px', borderRadius: '6px' }} />}
            <span>{brandName}</span>
          </a>
          
          <button className="st-mobile-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>

          <div className={`st-nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            {finalMenuItems.map((item, idx) => (
              <a key={idx} href={item.link} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</a>
            ))}
          </div>

          <div className="st-nav-cta">
            <button onClick={() => handleServiceClick('General Consultation')} className="st-btn st-btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
              Book Consultation
            </button>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      {siteConfig?.showHero !== false && (
        <header id="home" className="st-hero" style={{ backgroundImage: `url(${heroImg})` }}>
          <div className="st-hero-overlay"></div>
          <div className="st-container st-hero-content">
            <span style={{ display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '30px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>
              {brandName}
            </span>
            <h1>{heroTitle}</h1>
            <p>{heroSub}</p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#services" className="st-btn st-btn-primary">Explore Services</a>
              <a href="#portfolio" className="st-btn st-btn-outline">View Our Work</a>
            </div>
          </div>
        </header>
      )}

      {/* --- 3. SERVICE CATEGORIES --- */}
      <section id="services" className="st-section">
        <div className="st-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 52px' }}>
            <span className="st-tagline">What We Offer</span>
            <h2 className="st-title">Specialized Services</h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
              Select a service below to view related case studies or request a custom quote.
            </p>
          </div>

          <div className="st-grid">
            {services.map((srv, idx) => {
              const matchingCount = publicProjects.filter(p => p.category === srv.title).length;
              return (
                <div key={idx} className="st-service-card">
                  <div className="st-service-icon">
                    <FontAwesomeIcon icon={faBriefcase} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 10px', color: '#0f172a' }}>{srv.title}</h3>
                  <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '14px', flex: 1, lineHeight: '1.6' }}>{srv.desc}</p>
                  
                  <div style={{ display: 'flex', gap: '10px', width: '100%', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button 
                      onClick={() => handleViewCategoryProjects(srv.title)} 
                      className="st-btn st-btn-secondary" 
                      style={{ flex: 1, padding: '10px 14px', fontSize: '12px' }}
                    >
                      <FontAwesomeIcon icon={faImages} /> Projects ({matchingCount})
                    </button>
                    <button 
                      onClick={() => handleServiceClick(srv.title)} 
                      className="st-btn st-btn-primary" 
                      style={{ flex: 1, padding: '10px 14px', fontSize: '12px' }}
                    >
                      Inquire <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- 4. INTERACTIVE PORTFOLIO & CASE STUDIES SECTION --- */}
      <section id="portfolio" ref={portfolioRef} className="st-section st-bg-light">
        <div className="st-container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px' }}>
            <span className="st-tagline">Proven Track Record</span>
            <h2 className="st-title">Featured Projects & Case Studies</h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>
              Click on any project below to inspect deliverables, visuals, and full case study outcomes.
            </p>
          </div>

          {/* CATEGORY FILTER PILLS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button
              onClick={() => setSelectedCategory('All')}
              style={{
                padding: '9px 20px', borderRadius: '30px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                background: selectedCategory === 'All' ? '#0f172a' : '#ffffff',
                color: selectedCategory === 'All' ? '#ffffff' : '#475569',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              All Work ({publicProjects.length})
            </button>
            {services.map((srv, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(srv.title)}
                style={{
                  padding: '9px 20px', borderRadius: '30px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                  background: selectedCategory === srv.title ? '#0f172a' : '#ffffff',
                  color: selectedCategory === srv.title ? '#ffffff' : '#475569',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {srv.title}
              </button>
            ))}
          </div>

          {/* PORTFOLIO GRID */}
          {displayedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <FontAwesomeIcon icon={faImages} style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>No projects in "{selectedCategory}" yet</h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Select "All Work" above or contact us to request custom samples.</p>
            </div>
          ) : (
            <div className="st-grid">
              {displayedProjects.map((proj, idx) => {
                // Support both Projects.jsx schema (name, description, images[]) and legacy schema (title, desc, image)
                const projectTitle = proj.name || proj.title || 'Untitled Project';
                const projectDesc = proj.description || proj.desc || 'Click to view full case study details.';
                const coverImg = (Array.isArray(proj.images) && proj.images[0]) || proj.image || null;

                return (
                  <div 
                    key={proj.id || idx} 
                    onClick={() => openProjectModal(proj)}
                    style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'all 0.25s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', position: 'relative' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 16px 32px -10px rgba(15,23,42,0.1)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                  >
                    {proj.isFeatured && (
                      <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 5, background: '#0f172a', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.6px' }}>
                        FEATURED
                      </div>
                    )}

                    <div style={{ height: '210px', background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {coverImg ? (
                        <img src={coverImg} alt={projectTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <FontAwesomeIcon icon={faImage} style={{ fontSize: '36px', color: '#cbd5e1' }} />
                      )}
                    </div>

                    <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: themeColor }}>
                            {proj.category || 'Case Study'}
                          </span>
                          {proj.completionDate && (
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{proj.completionDate}</span>
                          )}
                        </div>

                        <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{projectTitle}</h4>
                        {proj.client && (
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                            Client: {proj.client}
                          </div>
                        )}

                        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {projectDesc}
                        </p>
                      </div>

                      <div style={{ paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                        <span>Read Case Study</span>
                        <FontAwesomeIcon icon={faArrowRight} style={{ color: themeColor }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* --- 5. WHY CHOOSE US (CORE STRENGTHS) --- */}
      {siteConfig?.showStrengths && strengths.length > 0 && (
        <section className="st-section">
          <div className="st-container">
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px' }}>
              <span className="st-tagline">Our Advantage</span>
              <h2 className="st-title">Why Clients Choose {brandName}</h2>
            </div>
            <div className="st-grid">
              {strengths.map((str, idx) => (
                <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ffffff', color: themeColor, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>
                    <FontAwesomeIcon icon={faShieldHalved} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{str.title}</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>{str.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- 6. ABOUT SECTION --- */}
      {siteConfig?.showAbout !== false && (
        <section id="about" className="st-section st-bg-light">
          <div className="st-container" style={{ display: 'flex', gap: '48px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 420px' }}>
              <span className="st-tagline">Who We Are</span>
              <h2 className="st-title">About {brandName}</h2>
              <p style={{ fontSize: '15px', color: '#475569', marginBottom: '28px', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>{aboutText}</p>
              <button onClick={() => handleServiceClick('Partnership Inquiry')} className="st-btn st-btn-primary">
                Work With Us <FontAwesomeIcon icon={faArrowRight} />
              </button>
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <img src={aboutImg} alt="About Us" style={{ width: '100%', borderRadius: '16px', boxShadow: '0 15px 35px -10px rgba(0,0,0,0.12)', objectFit: 'cover', height: '380px' }} />
            </div>
          </div>
        </section>
      )}

      {/* --- 7. LEADERSHIP TEAM --- */}
      {siteConfig?.showTeam && team.length > 0 && (
        <section className="st-section">
          <div className="st-container">
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <span className="st-tagline">Leadership</span>
              <h2 className="st-title">Meet Our Team</h2>
            </div>
            <div className="st-grid">
              {team.map((member, idx) => (
                <div key={idx} style={{ textAlign: 'center', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f8fafc', color: themeColor, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '900', margin: '0 auto 14px' }}>
                    {member.name ? member.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{member.name}</h4>
                  <p style={{ margin: '0 0 12px', color: themeColor, fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{member.role}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- 8. CONTACT / LEAD CAPTURE FORM --- */}
      <section id="contact" ref={contactRef} className="st-section st-bg-light">
        <div className="st-container">
          <div style={{ maxWidth: '680px', margin: '0 auto', background: '#fff', padding: '40px 32px', borderRadius: '18px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span className="st-tagline">Start a Conversation</span>
              <h2 className="st-title" style={{ marginBottom: '8px' }}>Request a Consultation</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Tell us about your project and our team will get back to you promptly.</p>
            </div>

            <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Full Name *</label>
                  <input required maxLength={100} type="text" placeholder="Your Name" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Phone / WhatsApp *</label>
                  <input required maxLength={40} type="tel" placeholder="0300-1234567" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Email Address</label>
                  <input maxLength={100} type="email" placeholder="you@company.com" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Service of Interest</label>
                  <select value={leadForm.service} onChange={e => setLeadForm({...leadForm, service: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="">General Inquiry</option>
                    {services.map((s, i) => <option key={i} value={s.title}>{s.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>Project Scope & Requirements *</label>
                <textarea required maxLength={1500} rows="4" placeholder="Share your goals, timeline, or questions..." value={leadForm.details} onChange={e => setLeadForm({...leadForm, details: e.target.value})} style={{ width: '100%', padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
              </div>

              <button type="submit" className="st-btn st-btn-primary" style={{ width: '100%', padding: '15px' }}>
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* --- 9. FOOTER --- */}
      <footer className="st-footer">
        <div className="st-container">
          <div className="st-footer-grid">
            
            <div>
              <h3 style={{ fontSize: '22px', margin: '0 0 12px', fontWeight: '900', color: '#ffffff' }}>{brandName}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px', maxWidth: '280px', lineHeight: '1.6' }}>
                {branding?.slogan || heroSub}
              </p>
              <div>
                {getSafeExternalUrl(siteConfig?.socials?.facebook) && (
                  <a href={getSafeExternalUrl(siteConfig.socials.facebook)} target="_blank" rel="noopener noreferrer" className="st-social-btn"><FontAwesomeIcon icon={faFacebookF} /></a>
                )}
                {getSafeExternalUrl(siteConfig?.socials?.instagram) && (
                  <a href={getSafeExternalUrl(siteConfig.socials.instagram)} target="_blank" rel="noopener noreferrer" className="st-social-btn"><FontAwesomeIcon icon={faInstagram} /></a>
                )}
                {getSafeExternalUrl(siteConfig?.socials?.linkedin) && (
                  <a href={getSafeExternalUrl(siteConfig.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="st-social-btn"><FontAwesomeIcon icon={faLinkedinIn} /></a>
                )}
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Quick Navigation</h4>
              {finalMenuItems.map((item, idx) => (
                <a key={idx} href={item.link} className="st-footer-link">{item.label}</a>
              ))}
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Policies & Terms</h4>
              <button className="st-footer-link" onClick={() => setActivePolicy('service')}>Service Agreement</button>
              <button className="st-footer-link" onClick={() => setActivePolicy('shipping')}>Delivery & Turnaround Policy</button>
              <button className="st-footer-link" onClick={() => setActivePolicy('privacy')}>Privacy Policy</button>
              <button className="st-footer-link" onClick={() => setActivePolicy('terms')}>Terms of Service</button>
            </div>

            <div>
              <h4 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: '800', color: '#ffffff' }}>Contact Details</h4>
              <div style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ color: themeColor }} /> {siteConfig?.supportEmail || 'contact@company.com'}
              </div>
              {siteConfig?.supportPhone && (
                <div style={{ color: '#cbd5e1', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FontAwesomeIcon icon={faPhone} style={{ color: themeColor }} /> {siteConfig.supportPhone}
                </div>
              )}
              <div style={{ color: '#cbd5e1', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: themeColor }} /> {siteConfig?.physicalAddress || 'Headquarters'}
              </div>
            </div>

          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            © {new Date().getFullYear()} {brandName}. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 10. INTERACTIVE CASE STUDY OVERVIEW MODAL                 */}
      {/* ========================================================= */}
      {selectedProject && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setSelectedProject(null)}
        >
          <div 
            style={{ background: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '960px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProject(null)} 
              style={{ position: 'absolute', top: '18px', right: '18px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: '#0f172a', zIndex: 10 }}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            {/* LEFT: PROJECT GALLERY */}
            <div style={{ flex: '1 1 400px', background: '#f8fafc', padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', borderRight: '1px solid #e2e8f0' }}>
              {(() => {
                const imgs = Array.isArray(selectedProject.images) && selectedProject.images.length > 0 
                  ? selectedProject.images 
                  : (selectedProject.image ? [selectedProject.image] : []);

                return (
                  <>
                    <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', height: '320px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {imgs[activeGalleryIdx] ? (
                        <img src={imgs[activeGalleryIdx]} alt={selectedProject.name || selectedProject.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <FontAwesomeIcon icon={faImage} style={{ fontSize: '42px', color: '#cbd5e1' }} />
                      )}
                    </div>

                    {imgs.length > 1 && (
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {imgs.map((imgUrl, i) => (
                          <img 
                            key={i} 
                            src={imgUrl} 
                            alt="thumb" 
                            onClick={() => setActiveGalleryIdx(i)}
                            style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: activeGalleryIdx === i ? `2px solid ${themeColor}` : '1px solid #cbd5e1', opacity: activeGalleryIdx === i ? 1 : 0.6 }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* RIGHT: CASE STUDY DETAILS & ACCORDIONS */}
            <div style={{ flex: '1.1 1 420px', padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: themeColor, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                {selectedProject.category || 'Portfolio Case Study'}
              </div>

              <h2 style={{ margin: '0 0 12px 0', fontSize: '26px', fontWeight: '900', color: '#0f172a', lineHeight: '1.2' }}>
                {selectedProject.name || selectedProject.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginBottom: '18px', fontSize: '12px', color: '#475569', fontWeight: '700' }}>
                {selectedProject.client && (
                  <span style={{ background: '#f1f5f9', padding: '5px 12px', borderRadius: '6px' }}>
                    <FontAwesomeIcon icon={faBuilding} style={{ marginRight: '6px', color: themeColor }} />
                    Client: {selectedProject.client}
                  </span>
                )}
                {selectedProject.completionDate && (
                  <span style={{ background: '#f1f5f9', padding: '5px 12px', borderRadius: '6px' }}>
                    <FontAwesomeIcon icon={faCalendarDays} style={{ marginRight: '6px', color: themeColor }} />
                    Completed: {selectedProject.completionDate}
                  </span>
                )}
              </div>

              {/* DELIVERABLES TAGS */}
              {selectedProject.deliverables?.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' }}>Scope & Deliverables</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedProject.deliverables.map((tag, i) => (
                      <span key={i} style={{ fontSize: '12px', fontWeight: '700', background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px' }}>
                        <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669', marginRight: '6px', fontSize: '11px' }} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.7', margin: '0 0 22px 0', whiteSpace: 'pre-wrap' }}>
                {selectedProject.description || selectedProject.desc}
              </p>

              {/* EXPANDABLE CASE STUDY TABS (CHALLENGE / SOLUTION / RESULTS) */}
              {selectedProject.infoSections?.length > 0 && (
                <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '24px' }}>
                  {selectedProject.infoSections.map((sec, idx) => {
                    const isOpen = openAccordionIdx === idx;
                    return (
                      <div key={sec.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <button
                          onClick={() => setOpenAccordionIdx(isOpen ? -1 : idx)}
                          style={{ width: '100%', padding: '14px 0', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}
                        >
                          <span>{sec.title}</span>
                          <FontAwesomeIcon icon={isOpen ? faMinus : faPlus} style={{ color: themeColor, fontSize: '12px' }} />
                        </button>
                        {isOpen && (
                          <div style={{ paddingBottom: '14px', fontSize: '13px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                            {sec.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => handleServiceClick(selectedProject.category || selectedProject.name)} 
                  className="st-btn st-btn-primary" 
                  style={{ flex: 1 }}
                >
                  Request Similar Project <FontAwesomeIcon icon={faArrowRight} />
                </button>
                {getSafeExternalUrl(selectedProject.projectUrl) && (
                  <a 
                    href={getSafeExternalUrl(selectedProject.projectUrl)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="st-btn st-btn-secondary"
                  >
                    Live Preview <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- 11. LEGAL & SHIPPING POLICY MODAL --- */}
      {activePolicy && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
          onClick={() => setActivePolicy(null)}
        >
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '82vh', overflowY: 'auto', padding: '32px', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setActivePolicy(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f1f5f9', border: 'none', width: '34px', height: '34px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', color: '#475569' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 style={{ margin: '0 0 16px', color: '#0f172a', fontSize: '22px', fontWeight: '800' }}>
              {activePolicy === 'privacy' && 'Privacy Policy'}
              {activePolicy === 'terms' && 'Terms of Service'}
              {activePolicy === 'service' && 'Service & Cancellation Agreement'}
              {activePolicy === 'shipping' && 'Delivery & Turnaround Policy'}
            </h2>
            <div style={{ whiteSpace: 'pre-wrap', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
              {activePolicy === 'privacy' && (siteConfig?.policies?.privacyPolicy || 'We respect your privacy and protect all client information shared during inquiries and project execution.')}
              {activePolicy === 'terms' && (siteConfig?.policies?.termsOfService || 'All services and deliverables are governed by mutually agreed project scopes and timelines.')}
              {activePolicy === 'service' && (siteConfig?.policies?.serviceAgreement || 'Project milestones, revisions, and cancellation terms are finalized prior to project kickoff.')}
              {activePolicy === 'shipping' && (siteConfig?.policies?.shippingPolicy || 'Project deliverables and digital assets are delivered according to the agreed milestone schedule.')}
            </div>
          </div>
        </div>
      )}

      {/* --- 12. LEAD SUBMITTED CONFIRMATION MODAL --- */}
      {leadSubmittedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 14px' }}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Inquiry Received</h3>
            <p style={{ margin: '0 0 22px', fontSize: '14px', color: '#475569', lineHeight: '1.6' }}>
              Thank you for reaching out to {brandName}. Our team has received your project details and will contact you shortly.
            </p>
            <button onClick={() => setLeadSubmittedModal(false)} className="st-btn st-btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceTemplate;