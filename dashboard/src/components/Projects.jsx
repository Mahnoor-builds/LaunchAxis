import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, faPlus, faTrash, faTimes, faImage, faSpinner, faTags 
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { collection, addDoc, deleteDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pro-Level Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    desc: '',
    image: '' 
  });

  // --- 1. REAL-TIME FIREBASE SYNC & CATEGORY FETCH ---
  useEffect(() => {
    let unsubscribe = null;

    const fetchData = async () => {
      const user = auth.currentUser;
      const targetId = user ? user.uid : 'ceo@ecosole.store'; // Fallback for local testing

      try {
        // A. Fetch Service Categories from SiteConfig
        const userDocRef = doc(db, "users", targetId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists() && docSnap.data().siteConfig?.services) {
          setServiceCategories(docSnap.data().siteConfig.services);
        }

        // B. Listen for real-time Project updates
        const projectsRef = collection(db, `users/${targetId}/projects`);
        unsubscribe = onSnapshot(projectsRef, (snapshot) => {
          const liveProjects = [];
          snapshot.forEach((docSnap) => {
            liveProjects.push({ id: docSnap.id, ...docSnap.data() });
          });
          
          liveProjects.sort((a, b) => b.timestamp - a.timestamp);
          setProjects(liveProjects);
          setIsLoading(false);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // --- 2. ADD PROJECT TO FIREBASE ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.desc || !newProject.category) {
      alert("Please fill out the Title, Category, and Description.");
      return;
    }

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      const targetId = user ? user.uid : 'ceo@ecosole.store';
      const projectsRef = collection(db, `users/${targetId}/projects`);

      await addDoc(projectsRef, {
        ...newProject,
        timestamp: Date.now()
      });

      setNewProject({ title: '', category: '', desc: '', image: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. DELETE PROJECT FROM FIREBASE ---
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to permanently delete this case study?")) {
      try {
        const user = auth.currentUser;
        const targetId = user ? user.uid : 'ceo@ecosole.store';
        const projectDocRef = doc(db, `users/${targetId}/projects`, projectId);
        
        await deleteDoc(projectDocRef);
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project.");
      }
    }
  };

  // --- 4. IMAGE UPLOAD HANDLER ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2097152) { // 2MB Limit for higher quality portfolio shots
        alert("Image is too large. Please upload an image smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject({ ...newProject, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- STYLES ---
  const inputStyle = { width: '100%', padding: '12px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#1e293b', fontSize: '14px', outline: 'none', marginTop: '6px', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginTop: '16px' };

  if (isLoading) {
    return <div style={{ padding: '40px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px' }}><FontAwesomeIcon icon={faSpinner} spin /> Loading Portfolio Data...</div>;
  }

  return (
    <div style={{ padding: '0 20px 40px', height: '100%', overflowY: 'auto' }}>
      
      {/* HEADER */}
      <div style={{ padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '26px', margin: 0, color: '#0f172a', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faBriefcase} style={{ color: '#2dd4bf', marginRight: '10px' }} /> 
            Case Studies & Portfolio
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Upload your past work and map them to your service categories.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
        >
          <FontAwesomeIcon icon={faPlus} /> Upload Case Study
        </button>
      </div>

      {/* WARNING IF NO CATEGORIES EXIST */}
      {serviceCategories.length === 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', marginBottom: '24px', color: '#92400e', fontSize: '14px' }}>
          <strong>Attention:</strong> You haven't created any Service Categories yet. Go to the <strong>Website Editor &gt; Service Types</strong> tab to define your services before uploading projects here.
        </div>
      )}

      {/* DYNAMIC RESPONSIVE GRID */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', color: '#475569' }}>No Projects Uploaded</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Build credibility by uploading examples of your past work.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {projects.map(project => (
            <div key={project.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
              
              {/* IMAGE HEADER */}
              <div style={{ height: '200px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {project.image ? (
                  <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <FontAwesomeIcon icon={faImage} style={{ fontSize: '48px', color: '#cbd5e1' }} />
                )}
                
                {/* CATEGORY BADGE */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FontAwesomeIcon icon={faTags} /> {project.category}
                </div>

                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  title="Delete Project"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              {/* CARD CONTENT */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>{project.title}</h3>
                <p style={{ margin: '0', color: '#64748b', fontSize: '13px', lineHeight: '1.6', flex: 1, whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {project.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD PROJECT MODAL --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', animation: 'fadeIn 0.2s ease-out' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Draft Case Study</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleAddProject} style={{ padding: '24px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{...labelStyle, marginTop: 0}}>Project Title *</label>
                  <input required type="text" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. Skyline App Redesign" style={inputStyle} />
                </div>
                <div>
                  <label style={{...labelStyle, marginTop: 0}}>Target Service Category *</label>
                  <select required value={newProject.category} onChange={(e) => setNewProject({...newProject, category: e.target.value})} style={inputStyle}>
                    <option value="" disabled>Select a Category...</option>
                    {serviceCategories.map((srv, idx) => (
                      <option key={idx} value={srv.title}>{srv.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label style={labelStyle}>Case Study Description *</label>
              <textarea 
                required 
                rows="6" 
                value={newProject.desc} 
                onChange={(e) => setNewProject({...newProject, desc: e.target.value})} 
                placeholder="Write a professional summary. Consider including:&#10;1. The Client's Challenge&#10;2. Your Strategy / Execution&#10;3. The Final Result" 
                style={{...inputStyle, resize: 'vertical', lineHeight: '1.5'}} 
              />

              <label style={labelStyle}>Project Visual (Screenshot / Cover)</label>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/*" id="project-img-upload" style={{ display: 'none' }} onChange={handleImageUpload} />
                  <label htmlFor="project-img-upload" style={{ display: 'block', textAlign: 'center', padding: '16px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: 'bold' }}>
                    <FontAwesomeIcon icon={faImage} style={{ marginRight: '6px', fontSize: '18px', display: 'block', margin: '0 auto 8px' }} /> 
                    {newProject.image ? 'Change Photo' : 'Upload Cover Photo'}
                  </label>
                </div>
                
                {/* Live Image Preview */}
                {newProject.image && (
                  <div style={{ width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img src={newProject.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex: 2, padding: '14px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Publish to Portfolio'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;