import React, { useState, useRef, useEffect } from 'react';

const ServiceTemplate = ({ branding, siteConfig, projects = [], onSubmitLead }) => {
  const contactRef = useRef(null);
  
  // Lead Form State
  const [leadForm, setLeadForm] = useState({
    name: '', phone: '', email: '', details: '', service: ''
  });

  // Smooth scroll and pre-fill service name
  const handleServiceClick = (serviceName) => {
    setLeadForm(prev => ({ ...prev, service: serviceName }));
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

  // Safe defaults if editor is empty
  const heroTitle = siteConfig?.heroTitle || `Premium Solutions by ${branding?.name || 'Us'}`;
  const heroSub = siteConfig?.heroSubtitle || "Delivering reliable expertise and seamless project execution.";
  const aboutText = siteConfig?.aboutText || "We deliver high-performance solutions optimized for client success.";
  const themeColor = siteConfig?.themeColor || '#D62828';
  
  const team = siteConfig?.teamMembers || [];
  const strengths = siteConfig?.whyChooseUs || [];
  const activeProjects = projects.length > 0 ? projects : [
    { id: 1, title: 'Consulting', desc: 'Expert advisory setups.' },
    { id: 2, title: 'Execution', desc: 'End-to-end project management.' }
  ];

  return (
    <div style={{ '--primary-color': themeColor, width: '100%', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION */}
      {siteConfig?.showHero !== false && (
        <header id="home" className="hero-section" style={{ 
          backgroundImage: siteConfig?.heroImage ? `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, ${themeColor}40 100%), url(${siteConfig.heroImage})` : 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(214,40,40,0.2) 100%)'
        }}>
          <div className="hero-container">
            <h1 className="hero-title">{heroTitle}</h1>
            <p className="hero-description">{heroSub}</p>
            <div className="hero-buttons">
              <a href="#services" className="btn btn-primary" style={{ backgroundColor: themeColor, borderColor: themeColor }}>Explore Services</a>
              <button onClick={() => handleServiceClick('General Inquiry')} className="btn btn-secondary">Contact Us</button>
            </div>
          </div>
        </header>
      )}

      {/* 2. ABOUT & TEAM SECTION */}
      {siteConfig?.showAbout !== false && (
        <section id="about" className="about-section section-padding bg-light">
          <div className="container">
            <div className="text-center">
              <span className="section-tagline" style={{ color: themeColor }}>Who We Are</span>
              <h2 className="section-title">About {branding?.name}</h2>
              <p className="section-desc">{aboutText}</p>
            </div>
            
            {/* Dynamic Leadership Team */}
            {siteConfig?.showTeam && team.length > 0 && (
              <div className="team-subsection">
                <div className="team-grid">
                  {team.map((member, idx) => (
                    <div key={idx} className="team-card">
                      <h4 className="member-name">{member.name}</h4>
                      <p className="member-role" style={{ color: themeColor }}>{member.role}</p>
                      <p className="member-bio">{member.bio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. DYNAMIC PROJECTS / SERVICES SECTION */}
      <section id="services" className="services-section section-padding">
        <div className="container">
          <div className="text-center">
            <span className="section-tagline" style={{ color: themeColor }}>What We Do</span>
            <h2 className="section-title">Our Premium Services</h2>
          </div>
          <div className="services-grid">
            {activeProjects.map((proj) => (
              <div key={proj.id} className="service-card">
                <div className="service-icon" style={{ color: themeColor }}>
                  <i className={`fas ${proj.icon || 'fa-briefcase'}`}></i>
                </div>
                <h3 className="service-card-title">{proj.title}</h3>
                <p className="service-card-desc">{proj.desc}</p>
                <button 
                  onClick={() => handleServiceClick(proj.title)} 
                  className="btn btn-card" 
                  style={{ color: themeColor, cursor: 'pointer', border: 'none', background: 'none', fontWeight: 'bold' }}
                >
                  Get Service <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (Strengths) */}
      {siteConfig?.showStrengths && strengths.length > 0 && (
        <section className="why-section section-padding bg-light">
          <div className="container">
            <div className="text-center">
              <span className="section-tagline" style={{ color: themeColor }}>Our Strengths</span>
              <h2 className="section-title">Why Choose Us</h2>
            </div>
            <div className="features-grid">
              {strengths.map((strength, idx) => (
                <div key={idx} className="feature-card">
                  <div className="feature-icon" style={{ color: themeColor, backgroundColor: `${themeColor}15` }}>
                    <i className={`fas ${strength.icon || 'fa-check'}`}></i>
                  </div>
                  <div>
                    <h4>{strength.title}</h4>
                    <p>{strength.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. CONTACT & LEAD CAPTURE FORM */}
      <section id="contact" ref={contactRef} className="contact-section section-padding">
        <div className="container">
          <div className="text-center">
            <span className="section-tagline" style={{ color: themeColor }}>Get In Touch</span>
            <h2 className="section-title">Contact Our Hub</h2>
          </div>

          <div className="contact-grid" style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <form onSubmit={handleLeadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Full Name *</label>
                  <input required type="text" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Phone Number *</label>
                  <input required type="tel" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Email (Optional)</label>
                  <input type="email" value={leadForm.email} onChange={e => setLeadForm({...leadForm, email: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Service Requested</label>
                  <input type="text" value={leadForm.service} onChange={e => setLeadForm({...leadForm, service: e.target.value})} placeholder="What do you need help with?" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px', backgroundColor: '#f8fafc' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>Project Details *</label>
                <textarea required rows="4" value={leadForm.details} onChange={e => setLeadForm({...leadForm, details: e.target.value})} style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginTop: '6px', resize: 'none' }}></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ backgroundColor: themeColor, borderColor: themeColor, width: '100%', padding: '16px', fontSize: '16px' }}>
                Submit Inquiry
              </button>
            </form>
            
            {/* Social Links */}
            <div className="social-links-row" style={{ justifyContent: 'center', marginTop: '30px' }}>
              {siteConfig?.socials?.facebook && <a href={siteConfig.socials.facebook} target="_blank" rel="noreferrer"><i className="fab fa-facebook-f"></i></a>}
              {siteConfig?.socials?.instagram && <a href={siteConfig.socials.instagram} target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></a>}
              {siteConfig?.socials?.linkedin && <a href={siteConfig.socials.linkedin} target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></a>}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ServiceTemplate;