import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, faPlus, faPenToSquare, faTrash, faCloudArrowUp, 
  faImages, faBan, faCheckCircle, faTags, faLink,
  faToggleOn, faToggleOff, faAward, faTriangleExclamation, faTimesCircle,
  faBuilding, faCalendarDays, faEye, faAlignLeft, faArrowLeft, faSpinner, 
  faLayerGroup, faCircleQuestion, faListCheck
} from '@fortawesome/free-solid-svg-icons';

import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const ProductImageSlider = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeImages = Array.isArray(images) ? images : [];

  useEffect(() => {
    if (safeImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeImages.length);
    }, 2500); 
    return () => clearInterval(interval);
  }, [safeImages.length]);

  return (
    <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '14px 14px 0 0', position: 'relative', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
      {safeImages.length > 0 ? (
        <img 
          src={safeImages[currentIndex]} 
          alt="Project" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease-in-out' }} 
        />
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '8px' }}>
          <FontAwesomeIcon icon={faImages} size="2x" />
          <span style={{ fontSize: '11px', fontWeight: '700' }}>No Preview Image</span>
        </div>
      )}
      {safeImages.length > 1 && (
        <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {safeImages.map((_, idx) => (
            <div key={idx} style={{ width: '6px', height: '6px', borderRadius: '50%', background: idx === currentIndex ? '#ffffff' : 'rgba(255,255,255,0.45)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}></div>
          ))}
        </div>
      )}
    </div>
  );
};

const Projects = ({ siteConfig = {} }) => {
  const [view, setView] = useState('grid'); 
  const [isEditing, setIsEditing] = useState(false);
  const [localProjects, setLocalProjects] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Custom UI Modals
  const [uiModal, setUiModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', targetId: null });

  // FORM STATE (+ Added deliverables tags & infoSections for full Case Study view)
  const [formData, setFormData] = useState({
    id: null, name: '', client: '', description: '', status: 'active', 
    images: [], category: 'Uncategorized', isFeatured: false,
    projectUrl: '', completionDate: '', deliverables: [], infoSections: []
  });

  const [deliverableInput, setDeliverableInput] = useState('');
  const [infoInput, setInfoInput] = useState({ title: '', content: '' });

  const availableCategories = siteConfig.services || [];

  // --- QUOTA LOGIC (FREE PLAN MVP) ---
  const MAX_PROJECTS = 20;
  const currentProjectCount = localProjects.length;
  const remainingProjects = MAX_PROJECTS - currentProjectCount;
  const isLimitReached = currentProjectCount >= MAX_PROJECTS;
  const isApproachingLimit = remainingProjects <= 2 && remainingProjects > 0;

  // Consistent user key (Matches App.js email key)
  const getUserKey = () => {
    if (auth.currentUser?.email) return auth.currentUser.email;
    const rawMemory = localStorage.getItem("launchAxisTempData");
    if (rawMemory) {
      try { return JSON.parse(rawMemory).email; } catch (e) {}
    }
    return 'ceo@ecosole.store';
  };

  useEffect(() => {
    const userKey = getUserKey();
    const projectsRef = collection(db, `users/${userKey}/projects`);
    
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const liveProjects = [];
      snapshot.forEach((docSnap) => {
        liveProjects.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLocalProjects(liveProjects);
    });

    return () => unsubscribe();
  }, []);

  const showAlert = (title, message) => {
    setUiModal({ isOpen: true, type: 'alert', title, message, targetId: null });
  };

  const closeModal = () => {
    setUiModal({ isOpen: false, type: 'alert', title: '', message: '', targetId: null });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), base64String] 
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (idxToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== idxToRemove)
    }));
  };

  const handleFeaturedToggle = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const currentFeaturedCount = localProjects.filter(p => p.isFeatured && p.id !== formData.id).length;
      if (currentFeaturedCount >= 6) {
        showAlert("Limit Reached", "You can only highlight a maximum of 6 Featured Projects on your agency website.");
        return; 
      }
    }
    setFormData({ ...formData, isFeatured: isChecked });
  };

  // --- DELIVERABLES / SKILLS TAGS BUILDER ---
  const addDeliverables = () => {
    if (!deliverableInput.trim()) return;
    const tags = deliverableInput.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      deliverables: [...new Set([...(prev.deliverables || []), ...tags])]
    }));
    setDeliverableInput('');
  };

  const removeDeliverable = (idx) => {
    setFormData(prev => ({
      ...prev,
      deliverables: (prev.deliverables || []).filter((_, i) => i !== idx)
    }));
  };

  // --- CASE STUDY SECTIONS BUILDER ---
  const addInfoSection = () => {
    if (!infoInput.title.trim() || !infoInput.content.trim()) return;
    const newSec = {
      id: `csec_${Date.now()}`,
      title: infoInput.title.trim(),
      content: infoInput.content.trim()
    };
    setFormData(prev => ({
      ...prev,
      infoSections: [...(prev.infoSections || []), newSec]
    }));
    setInfoInput({ title: '', content: '' });
  };

  const removeInfoSection = (idx) => {
    setFormData(prev => ({
      ...prev,
      infoSections: (prev.infoSections || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddNewClick = () => {
    if (isLimitReached) {
      setShowUpgradeModal(true);
    } else {
      setView('form');
    }
  };

  const handleSubmit = async () => {
    if(!formData.name) return showAlert("Missing Title", "Project Title is required before publishing.");
    
    if (!isEditing && isLimitReached) {
      setShowUpgradeModal(true);
      return;
    }

    setIsSaving(true);

    try {
      const userKey = getUserKey();
      const projectId = isEditing ? formData.id : `proj_${Date.now()}`;
      const projectRef = doc(db, `users/${userKey}/projects`, projectId);
      
      const dataToSave = { ...formData };
      delete dataToSave.id;

      await setDoc(projectRef, dataToSave, { merge: true });
      resetForm();
    } catch (error) {
      console.error("Error saving project:", error);
      showAlert("Save Failed", "Could not save project to your portfolio.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      ...project,
      category: project.category || 'Uncategorized',
      isFeatured: project.isFeatured || false,
      images: project.images || [],
      client: project.client || '',
      projectUrl: project.projectUrl || '',
      completionDate: project.completionDate || '',
      deliverables: project.deliverables || [],
      infoSections: project.infoSections || []
    });
    setIsEditing(true);
    setView('form');
  };

  const requestDelete = (id) => {
    setUiModal({
      isOpen: true,
      type: 'confirmDelete',
      title: 'Delete Portfolio Project?',
      message: 'Are you sure you want to permanently remove this case study from your portfolio?',
      targetId: id
    });
  };

  const confirmDelete = async () => {
    if (!uiModal.targetId) return;
    try {
      const userKey = getUserKey();
      const projectRef = doc(db, `users/${userKey}/projects`, uiModal.targetId);
      await deleteDoc(projectRef);
      closeModal();
    } catch (error) {
      console.error("Error deleting project:", error);
      showAlert("Delete Failed", "Could not delete project.");
    }
  };

  const toggleStatus = async (project) => {
    try {
      const userKey = getUserKey();
      const newStatus = project.status === 'active' ? 'hidden' : 'active';
      
      const projectRef = doc(db, `users/${userKey}/projects`, project.id);
      await setDoc(projectRef, { status: newStatus }, { merge: true });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', client: '', description: '', status: 'active', images: [], category: 'Uncategorized', isFeatured: false, projectUrl: '', completionDate: '', deliverables: [], infoSections: [] });
    setDeliverableInput('');
    setInfoInput({ title: '', content: '' });
    setIsEditing(false);
    setView('grid');
  };

  // --- SUMMARY METRICS ---
  const publicCount = localProjects.filter(p => p.status === 'active').length;
  const featuredCount = localProjects.filter(p => p.isFeatured).length;

  // --- REFINED BENTO SAAS STYLES ---
  const bentoCardStyle = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155'
  };

  const saasInputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    marginBottom: '18px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  };

  const primaryBtnStyle = {
    padding: '12px 20px',
    background: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
    transition: 'all 0.2s ease'
  };

  const secondaryBtnStyle = {
    padding: '11px 18px',
    background: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease'
  };

  const caseStudyPresets = [
    'The Challenge',
    'Our Solution',
    'Key Results & Impact',
    'Client Testimonial'
  ];

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      
      {/* --- 1. TOP HEADER BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#4f46e5', display: 'block', marginBottom: '4px' }}>
            Agency Showcase
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Project Portfolio
            </h2>
            {isApproachingLimit && (
              <span style={{ background: '#fff7ed', color: '#ea580c', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} />
                {remainingProjects} free slot{remainingProjects === 1 ? '' : 's'} remaining
              </span>
            )}
          </div>
        </div>
        
        {view === 'grid' ? (
          <button style={primaryBtnStyle} onClick={handleAddNewClick}>
            <FontAwesomeIcon icon={faPlus} style={{ color: '#f97316' }} /> Add New Project
          </button>
        ) : (
          <button style={secondaryBtnStyle} onClick={resetForm}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ color: '#64748b' }} /> Back to Portfolio
          </button>
        )}
      </div>

      {/* --- 2. FOUR KEY PORTFOLIO PULSE CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Total Case Studies</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faBriefcase} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{currentProjectCount}</div>
          <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>Saved in your portfolio</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Public & Visible</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faEye} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{publicCount}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Live on your website</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Featured Work</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faAward} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{featuredCount} / 6</div>
          <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>Highlighted on homepage</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Plan Capacity</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: isLimitReached ? '#dc2626' : '#0f172a', marginBottom: '4px' }}>
            {currentProjectCount} / {MAX_PROJECTS}
          </div>
          <div style={{ fontSize: '12px', color: isLimitReached ? '#dc2626' : '#2563eb', fontWeight: '600' }}>
            {isLimitReached ? 'Free limit reached' : `${remainingProjects} slots available`}
          </div>
        </div>

      </div>

      {/* === UPGRADE MODAL === */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', padding: '28px 24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ea580c' }} />
                Free Tier Limit Reached
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto 14px' }}>
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>Upgrade to Pilot</h2>
              <p style={{ color: '#475569', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                You have reached the maximum of <strong>20 portfolio projects</strong> on the free Cadet plan. Upgrade your workspace to unlock unlimited case studies and custom domains.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ ...secondaryBtnStyle, flex: 1 }}>
                Cancel
              </button>
              <button onClick={() => { setShowUpgradeModal(false); window.location.href = '#pricing'; }} style={{ ...primaryBtnStyle, flex: 1 }}>
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: ADD / EDIT PROJECT FORM                           */}
      {/* ========================================================= */}
      {view === 'form' && (
        <div style={bentoCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={isEditing ? faPenToSquare : faPlus} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {isEditing ? 'Update Portfolio Case Study' : 'Add New Portfolio Project'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Link your completed work to a service category and add rich case study details</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
            
            {/* LEFT COLUMN: PROJECT DETAILS */}
            <div style={{ flex: '1.2 1 360px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faBriefcase} style={{ color: '#4f46e5' }} /> Project Title</label>
              <input style={saasInputStyle} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. FinTech SaaS Platform Redesign" />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faBuilding} style={{ color: '#2563eb' }} /> Client / Brand Name</label>
                  <input style={saasInputStyle} value={formData.client} onChange={e=>setFormData({...formData, client:e.target.value})} placeholder="e.g. Acme Corp" />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faCalendarDays} style={{ color: '#ea580c' }} /> Completion Date</label>
                  <input type="month" style={saasInputStyle} value={formData.completionDate} onChange={e=>setFormData({...formData, completionDate:e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faTags} style={{ color: '#059669' }} /> Service Category</label>
                  <select style={saasInputStyle} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                    <option value="Uncategorized">General / Uncategorized</option>
                    {availableCategories.map((cat, idx) => (
                      <option key={idx} value={cat.title}>{cat.title}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faEye} style={{ color: '#2563eb' }} /> Portfolio Visibility</label>
                  <select style={saasInputStyle} value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})}>
                    <option value="active">Public (Visible on Site)</option>
                    <option value="hidden">Hidden (Draft Mode)</option>
                  </select>
                </div>
              </div>
              
              <label style={labelStyle}><FontAwesomeIcon icon={faLink} style={{ color: '#2563eb' }} /> Live Project URL (Optional)</label>
              <input style={saasInputStyle} value={formData.projectUrl} onChange={e=>setFormData({...formData, projectUrl:e.target.value})} placeholder="https://clientwebsite.com" />

              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faAward} style={{ color: '#ea580c' }} /> Highlight as Featured Case Study
                  </div>
                  <div style={{ fontSize: '12px', color: '#c2410c', marginTop: '2px' }}>Pins this project to the top of your agency portfolio (Max 6).</div>
                </div>
                <div onClick={() => handleFeaturedToggle({ target: { checked: !formData.isFeatured } })} style={{ cursor: 'pointer', color: formData.isFeatured ? '#ea580c' : '#cbd5e1', fontSize: '24px' }}>
                  <FontAwesomeIcon icon={formData.isFeatured ? faToggleOn : faToggleOff} />
                </div>
              </div>

              <label style={labelStyle}><FontAwesomeIcon icon={faAlignLeft} style={{ color: '#4f46e5' }} /> Executive Summary</label>
              <textarea style={{ ...saasInputStyle, height: '100px', resize: 'vertical', lineHeight: '1.5', marginBottom: '22px' }} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Write a 2-3 sentence summary of what you delivered for this client..." />

              {/* NEW: CASE STUDY BREAKDOWN SECTIONS */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <label style={{ ...labelStyle, marginBottom: '6px' }}>
                  <FontAwesomeIcon icon={faCircleQuestion} style={{ color: '#059669' }} /> Case Study Breakdown Tabs (Optional)
                </label>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                  Add expandable sections like The Challenge, Our Solution, or Key Results so prospective clients can read the full case study.
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {caseStudyPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInfoInput(prev => ({ ...prev, title: preset }))}
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', color: '#334155', cursor: 'pointer' }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {(formData.infoSections || []).map((sec, idx) => (
                  <div key={sec.id || idx} style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>{sec.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{sec.content}</div>
                    </div>
                    <button type="button" onClick={() => removeInfoSection(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer', flexShrink: 0 }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}

                <input 
                  style={{ ...saasInputStyle, background: '#ffffff', marginBottom: '10px' }} 
                  placeholder="Section Heading (e.g. The Challenge or Key Results)" 
                  value={infoInput.title} 
                  onChange={e => setInfoInput({...infoInput, title: e.target.value})} 
                />
                <textarea 
                  rows="3"
                  style={{ ...saasInputStyle, background: '#ffffff', marginBottom: '12px', resize: 'vertical' }} 
                  placeholder="Details (e.g. Increased client conversion rate by 42% within 60 days...)" 
                  value={infoInput.content} 
                  onChange={e => setInfoInput({...infoInput, content: e.target.value})} 
                />
                <button type="button" style={{ ...secondaryBtnStyle, width: '100%' }} onClick={addInfoSection}>
                  <FontAwesomeIcon icon={faPlus} style={{ color: '#059669' }} /> Add Case Study Section
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: PROJECT GALLERY & DELIVERABLES TAGS */}
            <div style={{ flex: '1 1 320px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faImages} style={{ color: '#059669' }} /> Project Screenshots & Gallery</label>
              <div style={{ border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '36px 20px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="proj-img" />
                <label htmlFor="proj-img" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'block', margin: 0 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 12px' }}>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Click to upload project visuals</p>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Upload mockups, UI screenshots, or deliverables</span>
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                  {formData.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                      <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="preview" />
                      <button 
                        type="button"
                        onClick={() => removeUploadedImage(i)}
                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Remove Photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* NEW: DELIVERABLES / TECH STACK BUILDER */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <label style={{ ...labelStyle, marginBottom: '6px' }}>
                  <FontAwesomeIcon icon={faListCheck} style={{ color: '#4f46e5' }} /> Deliverables / Scope Tags
                </label>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                  List what you delivered or tools used (e.g. Brand Strategy, UI/UX, React, SEO).
                </p>

                {(formData.deliverables || []).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                    {formData.deliverables.map((tag, idx) => (
                      <span key={idx} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {tag}
                        <button type="button" onClick={() => removeDeliverable(idx)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 0, fontWeight: '900' }}>×</button>
                      </span>
                    ))}
                  </div>
                )}

                <input 
                  style={{ ...saasInputStyle, background: '#ffffff', marginBottom: '12px' }} 
                  placeholder="e.g. Web Design, Branding, Copywriting" 
                  value={deliverableInput} 
                  onChange={e => setDeliverableInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDeliverables())}
                />
                <button type="button" style={{ ...secondaryBtnStyle, width: '100%' }} onClick={addDeliverables}>
                  <FontAwesomeIcon icon={faPlus} style={{ color: '#4f46e5' }} /> Add Deliverable Tags
                </button>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button style={secondaryBtnStyle} onClick={resetForm}>Cancel</button>
            <button style={{ ...primaryBtnStyle, padding: '14px 28px' }} disabled={isSaving} onClick={handleSubmit}>
              {isSaving ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</> : <><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} /> {isEditing ? 'Save Changes' : 'Publish to Portfolio'}</>}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PROJECT PORTFOLIO GRID                            */}
      {/* ========================================================= */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {localProjects.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
                <FontAwesomeIcon icon={faBriefcase} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Your agency portfolio is empty</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>Add your past client projects and case studies to build credibility with visitors.</p>
              <button style={primaryBtnStyle} onClick={handleAddNewClick}>
                <FontAwesomeIcon icon={faPlus} style={{ color: '#f97316' }} /> Add First Project
              </button>
            </div>
          )}

          {localProjects.map(project => (
            <div key={project.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              
              <div>
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: project.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: project.status === 'active' ? '#059669' : '#475569', border: project.status === 'active' ? '1px solid #a7f3d0' : '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                  {project.status === 'active' ? 'Public' : 'Hidden'}
                </div>

                {project.isFeatured && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, background: '#0f172a', color: '#ffffff', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    FEATURED
                  </div>
                )}

                <ProductImageSlider images={project.images} />

                <div style={{ padding: '20px 20px 14px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faTags} style={{ color: '#4f46e5', fontSize: '11px' }} />
                      <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {project.category || 'Uncategorized'}
                      </span>
                    </div>
                    {project.completionDate && (
                      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{project.completionDate}</span>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>{project.name}</h4>
                  {project.client && (
                    <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '700', marginBottom: '8px' }}>
                      Client: {project.client}
                    </div>
                  )}

                  {project.deliverables?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                      {project.deliverables.slice(0, 3).map((d, i) => (
                        <span key={i} style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 7px', borderRadius: '4px', fontWeight: '700' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p style={{ fontSize: '13px', color: '#64748b', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5', margin: 0 }}>
                    {project.description || 'No project overview provided.'}
                  </p>
                </div>
              </div>

              <div style={{ padding: '14px 20px 20px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                <button style={{ ...secondaryBtnStyle, flex: 1, padding: '8px 12px', fontSize: '12px' }} onClick={() => handleEdit(project)}>
                  <FontAwesomeIcon icon={faPenToSquare} style={{ color: '#2563eb' }} /> Edit
                </button>
                <button style={{ ...secondaryBtnStyle, flex: 1, padding: '8px 12px', fontSize: '12px' }} onClick={() => toggleStatus(project)}>
                  {project.status === 'active' ? <FontAwesomeIcon icon={faBan} style={{ color: '#ea580c' }} /> : <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669' }} />}
                  {project.status === 'active' ? 'Hide' : 'Show'}
                </button>
                <button style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => requestDelete(project.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- CUSTOM MODAL FOR ALERTS & DELETE CONFIRMATION --- */}
      {uiModal.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.72)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '28px 24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: uiModal.type === 'confirmDelete' ? '#dc2626' : '#ea580c' }} />
                {uiModal.title}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>{uiModal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              {uiModal.type === 'confirmDelete' ? (
                <>
                  <button onClick={closeModal} style={{ ...secondaryBtnStyle, flex: 1 }}>Cancel</button>
                  <button onClick={confirmDelete} style={{ ...primaryBtnStyle, flex: 1, background: '#dc2626' }}>Delete Project</button>
                </>
              ) : (
                <button onClick={closeModal} style={{ ...primaryBtnStyle, width: '100%' }}>Got It</button>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default Projects;