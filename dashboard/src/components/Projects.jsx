import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBriefcase, faPlus, faTrash, faTimes, faImage, faSpinner 
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    desc: '',
    icon: 'fa-briefcase',
    image: '' // Base64 for custom images
  });

  // --- 1. REAL-TIME FIREBASE SYNC ---
  useEffect(() => {
    let unsubscribe = null;

    const fetchProjects = async () => {
      const user = auth.currentUser;
      const targetId = user ? user.uid : 'ceo@ecosole.store'; // Fallback for local testing

      const projectsRef = collection(db, `users/${targetId}/projects`);
      
      // Listen for real-time updates
      unsubscribe = onSnapshot(projectsRef, (snapshot) => {
        const liveProjects = [];
        snapshot.forEach((docSnap) => {
          liveProjects.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Sort by newest first
        liveProjects.sort((a, b) => b.timestamp - a.timestamp);
        setProjects(liveProjects);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching projects:", error);
        setIsLoading(false);
      });
    };

    fetchProjects();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // --- 2. ADD PROJECT TO FIREBASE ---
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title || !newProject.desc) return;

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      const targetId = user ? user.uid : 'ceo@ecosole.store';
      const projectsRef = collection(db, `users/${targetId}/projects`);

      await addDoc(projectsRef, {
        ...newProject,
        timestamp: Date.now()
      });

      // Reset form and close modal
      setNewProject({ title: '', desc: '', icon: 'fa-briefcase', image: '' });
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
    if (window.confirm("Are you sure you want to delete this project? It will be removed from your live website immediately.")) {
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

  // --- 4. IMAGE UPLOAD HANDLER (BASE64) ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { // 1MB Limit
        alert("Image is too large. Please upload an image smaller than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProject({ ...newProject, image: reader.result, icon: '' });
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
            Service Portfolio
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0' }}>Manage the services and projects displayed on your live website.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px 24px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Service
        </button>
      </div>

      {/* DYNAMIC RESPONSIVE GRID */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px', color: '#475569' }}>No Services Added Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>Add your first service or project to display it on your live portfolio.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {projects.map(project => (
            <div key={project.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}>
              
              {/* IMAGE / ICON HEADER */}
              <div style={{ height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {project.image ? (
                  <img src={project.image} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <i className={`fas ${project.icon}`} style={{ fontSize: '48px', color: '#94a3b8' }}></i>
                )}
                
                {/* DELETE BUTTON */}
                <button 
                  onClick={() => handleDeleteProject(project.id)}
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  title="Delete Service"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>

              {/* CARD CONTENT */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>{project.title}</h3>
                <p style={{ margin: '0', color: '#64748b', fontSize: '14px', lineHeight: '1.6', flex: 1 }}>{project.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD PROJECT MODAL --- */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Add New Service / Project</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleAddProject} style={{ padding: '24px' }}>
              
              <label style={{...labelStyle, marginTop: 0}}>Service Title *</label>
              <input required type="text" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} placeholder="e.g. Real Estate Consulting" style={inputStyle} />

              <label style={labelStyle}>Description *</label>
              <textarea required rows="4" value={newProject.desc} onChange={(e) => setNewProject({...newProject, desc: e.target.value})} placeholder="Briefly describe what this service includes..." style={{...inputStyle, resize: 'none'}} />

              <label style={labelStyle}>Service Visual (Choose Icon or Image)</label>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <div style={{ flex: 1 }}>
                  <input type="text" value={newProject.icon} onChange={(e) => setNewProject({...newProject, icon: e.target.value, image: ''})} placeholder="fa-briefcase" style={inputStyle} />
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>FontAwesome class (e.g. fa-home)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 'bold' }}>OR</div>
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/*" id="project-img-upload" style={{ display: 'none' }} onChange={handleImageUpload} />
                  <label htmlFor="project-img-upload" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569', fontWeight: 'bold', marginTop: '6px' }}>
                    <FontAwesomeIcon icon={faImage} style={{ marginRight: '6px' }} /> Upload Photo
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSaving} style={{ flex: 2, padding: '12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {isSaving ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Publish Service'}
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