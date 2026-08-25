import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope, faMapMarkerAlt, faTimes, faArrowRight, faCheckCircle, faImages, faImage, faBars } from '@fortawesome/free-solid-svg-icons';
import { faFacebookF, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const ServiceTemplate = ({ branding, siteConfig, projects = [], onSubmitLead }) => {
  const contactRef = useRef(null);
  
  // States for Lead Form, Legal Modals, Projects Viewer, and Mobile Nav
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', email: '', details: '', service: '' });
  const [activePolicy, setActivePolicy] = useState(null); 
  const [viewingProjects, setViewingProjects] = useState(null); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Pre-fill Unsplash Images if none provided
  const heroImg = siteConfig?.heroImage || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80';
  const aboutImg = siteConfig?.aboutImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

  const themeColor = siteConfig?.themeColor || '#D62828';
  
  // Safe defaults
  const heroTitle = siteConfig?.heroTitle || `Premium Solutions by ${branding?.name || 'Us'}`;
  const heroSub = siteConfig?.heroSubtitle || "Delivering reliable expertise and seamless project execution.";
  const aboutText = siteConfig?.aboutText || "We deliver high-performance solutions optimized for client success.";
  const team = siteConfig?.teamMembers || [];
  
  // Smart Menu Override: Forces "Catalog" to become "Services" for safety
  const rawMenuItems = siteConfig?.menuItems || [{ label: 'Home', link: '#home' }, { label: 'Services', link: '#services' }, { label: 'About', link: '#about' }, { label: 'Contact', link: '#contact' }];
  const menuItems = rawMenuItems.map(item => {
    if (item.link === '#catalog' || item.label.toLowerCase() === 'catalog') {
      return { ...item, label: 'Services', link: '#services' };
    }
    return item;
  });
  
  // Map to Service Categories (Fallback if empty)
  const services = siteConfig?.services?.length > 0 ? siteConfig.services : [
    { title: 'Consulting Strategy', desc: 'Expert advisory setups tailored to your specific market needs.', icon: 'fa-briefcase' },
    { title: 'Project Execution', desc: 'End-to-end project management and operational deployment.', icon: 'fa-chart-line' }
  ];

  const handleServiceClick = (serviceName) => {
    setLeadForm(prev => ({ ...prev, service: serviceName }));
    setViewingProjects(null); // Close modal if open
    if (contactRef.current) {
      contactRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (onSubmitLead) {
      onSubmitLead(leadForm);
    } else {
      alert(`Lead Captured! \nName: ${leadForm.name}\nService: ${leadForm.service}`);
    }
    setLeadForm({ name: '', phone: '', email: '', details: '', service: '' });
  };

  return (
    <div className="service-template-wrapper" style={{ '--brand-color': themeColor }}>
      
      {/* SCOPED CSS INCLUDING MOBILE RESPONSIVENESS */}
      <style>{`
        .service-template-wrapper { font-family: 'Inter', sans-serif; color: #334155; background: #fff; line-height: 1.6; overflow-x: hidden; }
        .st-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .st-section { padding: 80px 0; }
        .st-bg-light { background-color: #f8fafc; }
        .st-tagline { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: var(--brand-color); display: block; margin-bottom: 12px; }
        .st-title { font-size: 36px; font-weight: 900; color: #0f172a; margin: 0 0 20px; line-height: 1.2; }
        
        /* Centered Navbar */
        .st-navbar { position: sticky; top: 0; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.05); z-index: 100; padding: 16px 0; }
        .st-nav-content { display: flex; align-items: center; justify-content: space-between; position: relative; }
        .st-logo { font-size: 24px; font-weight: 900; color: #0f172a; text-decoration: none; flex: 1; }
        .st-nav-links { display: flex; gap: 30px; flex: 2; justify-content: center; transition: all 0.3s ease; }
        .st-nav-links a { text-decoration: none; color: #475569; font-weight: 600; font-size: 15px; transition: color 0.2s; }
        .st-nav-links a:hover { color: var(--brand-color); }
        .st-nav-spacer { flex: 1; }
        
        /* Mobile Menu Button */
        .st-mobile-btn { display: none; background: none; border: none; font-size: 24px; color: #0f172a; cursor: pointer; padding: 5px; }

        /* Hero */
        .st-hero { min-height: 80vh; display: flex; align-items: center; text-align: center; color: #fff; background-size: cover; background-position: center; position: relative; }
        .st-hero-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.6) 100%); }
        .st-hero-content { position: relative; z-index: 1; max-width: 800px; margin: 0 auto; }
        .st-hero h1 { font-size: 52px; font-weight: 900; margin: 0 0 20px; line-height: 1.2; }
        .st-hero p { font-size: 18px; margin: 0 0 32px; opacity: 0.9; }
        
        /* Buttons */
        .st-btn { padding: 14px 28px; border-radius: 8px; font-weight: 700; border: none; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 15px; transition: transform 0.2s, box-shadow 0.2s; }
        .st-btn-primary { background: var(--brand-color); color: #fff; }
        .st-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.15); }
        .st-btn-outline { background: transparent; color: #fff; border: 2px solid #fff; }
        .st-btn-outline:hover { background: #fff; color: #0f172a; }
        .st-btn-secondary { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
        .st-btn-secondary:hover { background: #e2e8f0; }

        /* Grid Layouts */
        .st-grid { display: grid; gap: 30px; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
        
        /* Services */
        .st-service-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: all 0.3s; display: flex; flex-direction: column; text-align: center; align-items: center; }
        .st-service-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.08); border-color: var(--brand-color); }
        .st-service-icon { width: 64px; height: 64px; background: #f8fafc; color: var(--brand-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 20px; }
        .st-service-actions { display: flex; gap: 12px; margin-top: 24px; width: 100%; justify-content: center; flex-wrap: wrap; }
        
        /* Team */
        .st-team-card { text-align: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px 24px; }
        
        /* Footer */
        .st-footer { background: #0f172a; color: #fff; padding: 60px 0 30px; }
        .st-footer-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 40px; margin-bottom: 40px; }
        .st-social-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; margin-right: 10px; transition: background 0.2s; }
        .st-social-btn:hover { background: var(--brand-color); }
        .st-footer-link { color: #94a3b8; text-decoration: none; display: block; margin-bottom: 12px; transition: color 0.2s; cursor: pointer; background: none; border: none; padding: 0; font-size: 15px; text-align: left; }
        .st-footer-link:hover { color: var(--brand-color); }

        /* --- MOBILE MEDIA QUERIES --- */
        @media (max-width: 768px) {
          .st-mobile-btn { display: block; }
          .st-nav-spacer { display: none; }
          .st-nav-links {
            position: absolute; top: 100%; left: 0; right: 0;
            background: #fff; flex-direction: column; gap: 0;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
            max-height: 0; overflow: hidden; opacity: 0;
          }
          .st-nav-links.open { max-height: 400px; opacity: 1; padding: 10px 0; border-top: 1px solid #e2e8f0; }
          .st-nav-links a { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: block; text-align: center; }
          .st-nav-links a:last-child { border-bottom: none; }
          
          .st-hero h1 { font-size: 38px; }
          .st-hero p { font-size: 16px; }
          .st-section { padding: 60px 0; }
          .st-title { font-size: 30px; }
        }
      `}</style>

      {/* 1. NAVBAR */}
      <nav className="st-navbar">
        <div className="st-container st-nav-content">
          <a href="#home" className="st-logo">{branding?.name || 'BrandName'}</a>
          
          <button className="st-mobile-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
          </button>

          <div className={`st-nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            {menuItems.map((item, idx) => (
              <a key={idx} href={item.link} onClick={() => setIsMobileMenuOpen(false)}>{item.label}</a>
            ))}
          </div>
          <div className="st-nav-spacer"></div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      {siteConfig?.showHero !== false && (
        <header id="home" className="st-hero" style={{ backgroundImage: `url(${heroImg})` }}>
          <div className="st-hero-overlay"></div>
          <div className="st-container st-hero-content">
            <h1>{heroTitle}</h1>
            <p>{heroSub}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#services" className="st-btn st-btn-primary">Explore Services</a>
              <button onClick={() => handleServiceClick('General Inquiry')} className="st-btn st-btn-outline">Contact Us</button>
            </div>
          </div>
        </header>
      )}

      {/* 3. ABOUT SECTION */}
      {siteConfig?.showAbout !== false && (
        <section id="about" className="st-section st-bg-light">
          <div className="st-container" style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 400px' }}>
              <span className="st-tagline">Who We Are</span>
              <h2 className="st-title">About {branding?.name}</h2>
              <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px' }}>{aboutText}</p>
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <img src={aboutImg} alt="About Us" style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', objectFit: 'cover', height: '400px' }} />
            </div>
          </div>
        </section>
      )}

      {/* 4. SERVICE CATEGORIES */}
      <section id="services" className="st-section">
        <div className="st-container">
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="st-tagline">What We Do</span>
            <h2 className="st-title">Our Premium Services</h2>
          </div>
          <div className="st-grid">
            {services.map((srv, idx) => (
              <div key={idx} className="st-service-card">
                <div className="st-service-icon">
                  <FontAwesomeIcon icon={srv.icon ? srv.icon : faCheckCircle} />
                </div>
                <h3 style={{ fontSize: '22px', margin: '0 0 12px', color: '#0f172a' }}>{srv.title}</h3>
                <p style={{ margin: '0', color: '#64748b', fontSize: '15px', flex: 1 }}>{srv.desc}</p>
                
                <div className="st-service-actions">
                  <button onClick={() => setViewingProjects(srv.title)} className="st-btn st-btn-secondary" style={{ padding: '10px 16px', fontSize: '13px' }}>
                    <FontAwesomeIcon icon={faImages} /> View Projects
                  </button>
                  <button onClick={() => handleServiceClick(srv.title)} className="st-btn st-btn-primary" style={{ padding: '10px 16px', fontSize: '13px' }}>
                    Get Service <FontAwesomeIcon icon={faArrowRight} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PROJECTS MODAL */}
      {viewingProjects && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
            <button onClick={() => setViewingProjects(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', cursor: 'pointer', color: '#475569', transition: 'background 0.2s' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 style={{ margin: '0 0 24px', color: '#0f172a', fontSize: '24px', paddingRight: '40px' }}>
              Projects & Case Studies: <span style={{ color: themeColor }}>{viewingProjects}</span>
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {projects.filter(p => p.category === viewingProjects).length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>No projects uploaded for this category yet.</p>
                </div>
              ) : (
                projects.filter(p => p.category === viewingProjects).map((proj, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {proj.image ? (
                      <img src={proj.image} alt={proj.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '200px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FontAwesomeIcon icon={faImage} style={{ fontSize: '48px', color: '#cbd5e1' }} />
                      </div>
                    )}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>{proj.title}</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>{proj.desc}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. LEADERSHIP TEAM */}
      {siteConfig?.showTeam && team.length > 0 && (
        <section className="st-section st-bg-light">
          <div className="st-container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span className="st-tagline">Leadership</span>
              <h2 className="st-title">Meet Our Team</h2>
            </div>
            <div className="st-grid">
              {team.map((member, idx) => (
                <div key={idx} className="st-team-card">
                  <h4 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0f172a' }}>{member.name}</h4>
                  <p style={{ margin: '0 0 16px', color: themeColor, fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>{member.role}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. CONTACT FORM */}
      <section id="contact" ref={contactRef} className="st-section">
        <div className="st-container">
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <span className="st-tagline">Get In Touch</span>
              <h2 className="st-title">Contact Our Hub</h2>
            </div>

            <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Full Name *</label>
                  <input required type="text" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Phone Number *</label>
                  <input required type="tel" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Email (Optional)</label>
                  <input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Service Requested</label>
                  <input type="text" value={leadForm.service} onChange={e => setLeadForm({...leadForm, service: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px', backgroundColor: '#f8fafc' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Project Details *</label>
                <textarea required rows="4" value={leadForm.details} onChange={e => setLeadForm({...leadForm, details: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginTop: '6px', resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="st-btn st-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>Submit Inquiry</button>
            </form>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="st-footer">
        <div className="st-container">
          <div className="st-footer-grid">
            
            {/* Branding */}
            <div>
              <h3 style={{ fontSize: '24px', margin: '0 0 16px', fontWeight: '900' }}>{branding?.name}</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px', maxWidth: '250px' }}>{siteConfig?.heroSubtitle || "Strategic solutions for modern businesses."}</p>
              <div>
                {siteConfig?.socials?.facebook && <a href={siteConfig.socials.facebook} className="st-social-btn"><FontAwesomeIcon icon={faFacebookF} /></a>}
                {siteConfig?.socials?.instagram && <a href={siteConfig.socials.instagram} className="st-social-btn"><FontAwesomeIcon icon={faInstagram} /></a>}
                {siteConfig?.socials?.linkedin && <a href={siteConfig.socials.linkedin} className="st-social-btn"><FontAwesomeIcon icon={faLinkedinIn} /></a>}
              </div>
            </div>

            {/* Legal / Policies */}
            <div>
              <h4 style={{ margin: '0 0 20px', fontSize: '16px' }}>Legal</h4>
              <button className="st-footer-link" onClick={() => setActivePolicy('privacy')}>Privacy Policy</button>
              <button className="st-footer-link" onClick={() => setActivePolicy('terms')}>Terms of Service</button>
              <button className="st-footer-link" onClick={() => setActivePolicy('service')}>Service Agreement</button>
            </div>

            {/* Contact Info */}
            <div>
              <h4 style={{ margin: '0 0 20px', fontSize: '16px' }}>Reach Out</h4>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faEnvelope} style={{ color: themeColor }} /> {siteConfig?.supportEmail || 'contact@company.com'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: themeColor }} /> Headquarters, Global
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
            © {new Date().getFullYear()} {branding?.name}. All Rights Reserved.
          </div>
        </div>
      </footer>

      {/* 9. LEGAL MODAL */}
      {activePolicy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', padding: '30px', position: 'relative' }}>
            <button onClick={() => setActivePolicy(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2 style={{ margin: '0 0 20px', color: '#0f172a' }}>
              {activePolicy === 'privacy' && 'Privacy Policy'}
              {activePolicy === 'terms' && 'Terms of Service'}
              {activePolicy === 'service' && 'Service Agreement'}
            </h2>
            <div style={{ whiteSpace: 'pre-wrap', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
              {activePolicy === 'privacy' && (siteConfig?.policies?.privacyPolicy || 'Privacy policy not configured yet.')}
              {activePolicy === 'terms' && (siteConfig?.policies?.termsOfService || 'Terms of service not configured yet.')}
              {activePolicy === 'service' && (siteConfig?.policies?.serviceAgreement || 'Service agreement not configured yet.')}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ServiceTemplate;