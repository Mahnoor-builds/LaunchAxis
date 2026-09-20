import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, faPlus, faPenToSquare, faTrash, faCloudArrowUp, 
  faImages, faBan, faCheckCircle, faTags, faLink,
  faToggleOn, faToggleOff, faAward, faTriangleExclamation, faTimesCircle
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
    <div style={{width:'100%', height:'200px', overflow:'hidden', borderRadius:'12px 12px 0 0', position:'relative', background:'#f1f5f9'}}>
      {safeImages.length > 0 ? (
        <img 
            src={safeImages[currentIndex]} 
            alt="Project" 
            style={{width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.5s ease-in-out'}} 
        />
      ) : (
        <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>
            <FontAwesomeIcon icon={faImages} size="2x" />
        </div>
      )}
      {safeImages.length > 1 && (
        <div style={{position:'absolute', bottom:'10px', left:'0', right:'0', display:'flex', justifyContent:'center', gap:'6px'}}>
            {safeImages.map((_, idx) => (
                <div key={idx} style={{width:'6px', height:'6px', borderRadius:'50%', background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'}}></div>
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
  
  const [formData, setFormData] = useState({
    id: null, name: '', client: '', description: '', status: 'active', 
    images: [], category: 'Uncategorized', isFeatured: false,
    projectUrl: '', completionDate: ''
  });

  const availableCategories = siteConfig.services || [];

  // --- QUOTA LOGIC (FREE PLAN MVP) ---
  const MAX_PROJECTS = 20;
  const currentProjectCount = localProjects.length;
  const remainingProjects = MAX_PROJECTS - currentProjectCount;
  const isLimitReached = currentProjectCount >= MAX_PROJECTS;
  const isApproachingLimit = remainingProjects <= 2 && remainingProjects > 0;

  useEffect(() => {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'ceo@ecosole.store';

    const projectsRef = collection(db, `users/${userId}/projects`);
    
    const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
      const liveProjects = [];
      snapshot.forEach((doc) => {
        liveProjects.push({ id: doc.id, ...doc.data() });
      });
      setLocalProjects(liveProjects);
    });

    return () => unsubscribe();
  }, []);

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

  const handleFeaturedToggle = (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
          const currentFeaturedCount = localProjects.filter(p => p.isFeatured && p.id !== formData.id).length;
          if (currentFeaturedCount >= 6) {
              alert("Limit Reached: You can only highlight a maximum of 6 Featured Projects.");
              return; 
          }
      }
      setFormData({ ...formData, isFeatured: isChecked });
  };

  const handleAddNewClick = () => {
      if (isLimitReached) {
          setShowUpgradeModal(true);
      } else {
          setView('form');
      }
  };

  const handleSubmit = async () => {
    if(!formData.name) return alert("Project Name is required!");
    
    if (!isEditing && isLimitReached) {
        setShowUpgradeModal(true);
        return;
    }

    setIsSaving(true);

    try {
        const user = auth.currentUser;
        const userId = user ? user.uid : 'ceo@ecosole.store';
        const projectId = isEditing ? formData.id : `proj_${Date.now()}`;
        const projectRef = doc(db, `users/${userId}/projects`, projectId);
        
        const dataToSave = { ...formData };
        delete dataToSave.id;

        await setDoc(projectRef, dataToSave, { merge: true });
        resetForm();
    } catch (error) {
        console.error("Error saving project:", error);
        alert("Failed to save project.");
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
        completionDate: project.completionDate || ''
    });
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this project from your portfolio?")) {
        try {
            const user = auth.currentUser;
            const userId = user ? user.uid : 'ceo@ecosole.store';
            const projectRef = doc(db, `users/${userId}/projects`, id);
            await deleteDoc(projectRef);
        } catch (error) {
            console.error("Error deleting project:", error);
            alert("Failed to delete project.");
        }
    }
  };

  const toggleStatus = async (project) => {
    try {
        const user = auth.currentUser;
        const userId = user ? user.uid : 'ceo@ecosole.store';
        const newStatus = project.status === 'active' ? 'hidden' : 'active';
        
        const projectRef = doc(db, `users/${userId}/projects`, project.id);
        await setDoc(projectRef, { status: newStatus }, { merge: true });
    } catch (error) {
        console.error("Error updating status:", error);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', client: '', description: '', status: 'active', images: [], category: 'Uncategorized', isFeatured: false, projectUrl: '', completionDate: '' });
    setIsEditing(false);
    setView('grid');
  };

  return (
    <div className="section active" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box', position: 'relative' }}>
      
      <div className="header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '26px', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faBriefcase} style={{color:'var(--primary)', marginRight:'10px'}}/>Project Portfolio
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <p style={{color:'#64748b', margin: 0, fontSize: '14px'}}>
                Published Projects: <strong style={{ color: '#0f172a' }}>{currentProjectCount} / {MAX_PROJECTS}</strong>
              </p>
              
              {isApproachingLimit && (
                  <span style={{ background: '#fffbeb', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                      Only {remainingProjects} project{remainingProjects === 1 ? '' : 's'} left on Free Plan
                  </span>
              )}
          </div>
        </div>
        
        {view === 'grid' && (
            <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }} onClick={handleAddNewClick}>
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Add New Project
            </button>
        )}
        {view === 'form' && (
            <button className="btn btn-outline" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }} onClick={resetForm}>
                Cancel & Go Back
            </button>
        )}
      </div>

      {/* === UPGRADE MODAL === */}
      {showUpgradeModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '440px', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden', padding: '30px 24px', textAlign: 'center' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: '#ef4444', marginRight: '8px' }} />
                Free Tier Limit Reached
              </h3>
              <button onClick={() => setShowUpgradeModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#64748b', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#0f172a'} onMouseOut={(e) => e.target.style.color = '#64748b'}>
                <FontAwesomeIcon icon={faTimesCircle} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
                <FontAwesomeIcon icon={faBriefcase} size="3x" style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h2 style={{ margin: '0 0 12px 0', fontSize: '22px', color: '#0f172a' }}>Upgrade to Pilot</h2>
                <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                    You have reached the maximum of <strong>20 projects</strong> allowed on the free Cadet plan. Upgrade your workspace to unlock unlimited portfolio items, custom domains, and premium features.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowUpgradeModal(false)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#e2e8f0'} onMouseOut={(e) => e.target.style.background = '#f1f5f9'}>
                Cancel
              </button>
              <button onClick={() => { setShowUpgradeModal(false); window.location.href = '#pricing'; }} style={{ flex: 1, padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                View Plans
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* === VIEW 1: ADD/EDIT FORM === */}
      {view === 'form' && (
        <div className="card" style={{ maxWidth:'900px', margin:'0 auto', padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#fff' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '20px' }}>
                {isEditing ? 'Edit Project Details' : 'Add New Project'}
            </h3>
            
            <div className="grid-2" style={{ gap: '30px', alignItems: 'start' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Project Title</label>
                    <input className="input-neon" style={{ padding: '14px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' }} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. E-Commerce Redesign" />
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Client / Company</label>
                            <input className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} value={formData.client} onChange={e=>setFormData({...formData, client:e.target.value})} placeholder="e.g. Acme Corp" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Completion Date</label>
                            <input type="month" className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} value={formData.completionDate} onChange={e=>setFormData({...formData, completionDate:e.target.value})} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Service Category</label>
                            <select className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                                <option value="Uncategorized">Uncategorized</option>
                                {availableCategories.map((cat, idx) => (
                                    <option key={idx} value={cat.title}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Visibility</label>
                            <select className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})}>
                                <option value="active">Public (Visible)</option>
                                <option value="hidden">Hidden (Draft)</option>
                            </select>
                        </div>
                    </div>
                    
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Live Project URL (Optional)</label>
                    <input className="input-neon" style={{ padding: '14px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' }} value={formData.projectUrl} onChange={e=>setFormData({...formData, projectUrl:e.target.value})} placeholder="https://..." />

                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FontAwesomeIcon icon={faAward} style={{ color: '#0f172a' }} /> Highlight Project
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Displays this item prominently in your portfolio.</div>
                        </div>
                        <div onClick={(e) => handleFeaturedToggle({ target: { checked: !formData.isFeatured } })} style={{ cursor: 'pointer', color: formData.isFeatured ? 'var(--primary)' : '#cbd5e1' }}>
                            <FontAwesomeIcon icon={formData.isFeatured ? faToggleOn : faToggleOff} size="2x" />
                        </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Case Study / Description</label>
                    <textarea className="input-neon" style={{ height:'120px', resize:'none', padding: '14px', width: '100%', boxSizing: 'border-box' }} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Describe the challenge and the solution..." />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Project Gallery</label>
                    <div style={{ border:'2px dashed #cbd5e1', background: '#f8fafc', padding:'40px 20px', borderRadius:'12px', textAlign:'center', cursor:'pointer', marginBottom:'20px', transition: 'background 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={(e)=>e.currentTarget.style.background='#f8fafc'}>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{display:'none'}} id="prod-img" />
                        <label htmlFor="prod-img" style={{cursor:'pointer', width:'100%', height:'100%', display:'block'}}>
                            <FontAwesomeIcon icon={faCloudArrowUp} size="3x" style={{color:'var(--primary)', marginBottom:'15px'}} />
                            <p style={{ margin:0, fontSize:'14px', fontWeight: 'bold', color: '#334155' }}>Click to upload images</p>
                        </label>
                    </div>
                    
                    {formData.images.length > 0 && (
                        <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap:'10px' }}>
                            {formData.images.map((img, i) => (
                                <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="preview" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button className="btn btn-primary" disabled={isSaving} style={{ width:'100%', marginTop:'30px', padding: '16px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px' }} onClick={handleSubmit}>
                {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish to Portfolio')}
            </button>
        </div>
      )}

      {/* === VIEW 2: PROJECT GRID === */}
      {view === 'grid' && (
        <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {localProjects.length === 0 && (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <FontAwesomeIcon icon={faBriefcase} size="3x" style={{ color:'#cbd5e1', marginBottom:'20px' }} />
                    <p style={{ fontSize: '16px', color: '#475569', fontWeight: 'bold' }}>Your portfolio is empty.</p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Click "Add New Project" to showcase your work.</p>
                </div>
            )}

            {localProjects.map(project => (
                <div key={project.id} className="card" style={{ padding:0, position:'relative', overflow:'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#fff' }}>
                    
                    <div style={{ position:'absolute', top:'12px', right:'12px', zIndex:10, background: project.status === 'active' ? '#10b981' : '#64748b', color: '#fff', padding:'6px 12px', borderRadius:'30px', fontSize:'11px', fontWeight:'900', letterSpacing: '0.5px' }}>
                        {project.status === 'active' ? 'PUBLIC' : 'HIDDEN'}
                    </div>

                    {project.isFeatured && (
                        <div style={{ position:'absolute', top:'12px', left:'12px', zIndex:10, background: '#0f172a', color: '#fff', padding: '5px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '700', letterSpacing: '0.5px' }}>
                            FEATURED
                        </div>
                    )}

                    <ProductImageSlider images={project.images} />

                    <div style={{ padding:'20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FontAwesomeIcon icon={faTags} style={{ color: '#94a3b8', fontSize: '11px' }} />
                                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    {project.category || 'Uncategorized'}
                                </span>
                            </div>
                            {project.completionDate && (
                                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>{project.completionDate}</span>
                            )}
                        </div>

                        <h4 style={{ margin:'0 0 4px 0', fontSize:'18px', color: '#0f172a', fontWeight: '800' }}>{project.name}</h4>
                        {project.client && <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '12px' }}>Client: {project.client}</div>}
                        
                        <p style={{ fontSize:'13px', color:'#64748b', height:'40px', overflow:'hidden', textOverflow:'ellipsis', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                            {project.description || 'No description provided.'}
                        </p>

                        <div style={{ display:'flex', gap:'8px' }}>
                            <button className="btn btn-outline" style={{ flex:1, fontSize:'12px', padding: '8px', borderRadius: '6px' }} onClick={() => handleEdit(project)}>
                                <FontAwesomeIcon icon={faPenToSquare} /> Edit
                            </button>
                            <button className="btn btn-outline" style={{ flex:1, fontSize:'12px', padding: '8px', borderRadius: '6px' }} onClick={() => toggleStatus(project)}>
                                {project.status === 'active' ? <FontAwesomeIcon icon={faBan} /> : <FontAwesomeIcon icon={faCheckCircle} />}
                                {project.status === 'active' ? ' Hide' : ' Show'}
                            </button>
                            <button className="btn" style={{ background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', padding: '8px 12px', borderRadius: '6px' }} onClick={() => handleDelete(project.id)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Projects;