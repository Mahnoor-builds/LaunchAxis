import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, faPlus, faPenToSquare, faTrash, faCloudArrowUp, 
  faImages, faBan, faCheckCircle, faCartShopping, faStar, faTags,
  faToggleOn, faToggleOff, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// --- SUB-COMPONENT: INFINITE IMAGE SLIDER (Crash-Proofed) ---
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
    <div style={{width:'100%', height:'180px', overflow:'hidden', borderRadius:'12px 12px 0 0', position:'relative', background:'#f1f5f9'}}>
      {safeImages.length > 0 ? (
        <img 
            src={safeImages[currentIndex]} 
            alt="Product" 
            style={{width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.5s ease-in-out'}} 
        />
      ) : (
        <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>
            <FontAwesomeIcon icon={faImages} size="2x" />
        </div>
      )}
      {/* DOTS INDICATOR */}
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

// --- MAIN COMPONENT ---
// Removed products/setProducts props; state is now handled locally via Firestore
const Products = ({ siteConfig = {} }) => {
  const [view, setView] = useState('grid'); 
  const [isEditing, setIsEditing] = useState(false);
  const [localProducts, setLocalProducts] = useState([]); // State for Firestore data
  const [isSaving, setIsSaving] = useState(false);
  
  // FORM STATE
  const [formData, setFormData] = useState({
    id: null, name: '', price: '', description: '', status: 'active', 
    images: [], ordersCount: 0, category: 'Uncategorized', isFeatured: false,
    variants: [] 
  });

  const [variantInput, setVariantInput] = useState({ name: '', options: '' });
  const availableCategories = siteConfig.categories || [];

  // --- FIREBASE: LIVE SYNC ---
  useEffect(() => {
    const user = auth.currentUser;
    const userId = user ? user.uid : 'ceo@ecosole.store'; // Matching the App.js fallback

    const productsRef = collection(db, `users/${userId}/products`);
    
    // Listen for real-time updates to the subcollection
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const liveProducts = [];
      snapshot.forEach((doc) => {
        liveProducts.push({ id: doc.id, ...doc.data() });
      });
      setLocalProducts(liveProducts);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);


  // --- ACTIONS ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    // Note: For full production, these should upload to Firebase Storage to get a permanent URL.
    // We are currently using temporary blob URLs for testing.
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...(formData.images || []), ...newImageUrls] });
  };

  const handleFeaturedToggle = (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
          const currentFeaturedCount = localProducts.filter(p => p.isFeatured && p.id !== formData.id).length;
          if (currentFeaturedCount >= 6) {
              alert("Limit Reached: You can only have a maximum of 6 Featured Products.");
              return; 
          }
      }
      setFormData({ ...formData, isFeatured: isChecked });
  };

  const addVariant = () => {
      if (!variantInput.name || !variantInput.options) return;
      const optionsArray = variantInput.options.split(',').map(s => s.trim()).filter(s => s !== '');
      const newVariant = { name: variantInput.name, options: optionsArray };
      setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
      setVariantInput({ name: '', options: '' }); 
  };

  const removeVariant = (idx) => {
      const updatedVariants = formData.variants.filter((_, i) => i !== idx);
      setFormData({ ...formData, variants: updatedVariants });
  };

  // --- FIREBASE: SAVE PRODUCT ---
  const handleSubmit = async () => {
    if(!formData.name || !formData.price) return alert("Name and Price are required!");
    setIsSaving(true);

    try {
        const user = auth.currentUser;
        const userId = user ? user.uid : 'ceo@ecosole.store';
        
        // Use existing ID if editing, otherwise generate a new string ID
        const productId = isEditing ? formData.id : `prod_${Date.now()}`;
        
        const productRef = doc(db, `users/${userId}/products`, productId);
        
        // Remove the local ID from the data we save, since the document ID is the source of truth
        const dataToSave = { ...formData };
        delete dataToSave.id;

        await setDoc(productRef, dataToSave, { merge: true });
        
        resetForm();
    } catch (error) {
        console.error("Error saving product:", error);
        alert("Failed to save product.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
        ...product,
        category: product.category || 'Uncategorized',
        isFeatured: product.isFeatured || false,
        variants: product.variants || [],
        images: product.images || []
    });
    setIsEditing(true);
    setView('form');
  };

  // --- FIREBASE: DELETE PRODUCT ---
  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this product?")) {
        try {
            const user = auth.currentUser;
            const userId = user ? user.uid : 'ceo@ecosole.store';
            const productRef = doc(db, `users/${userId}/products`, id);
            await deleteDoc(productRef);
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete product.");
        }
    }
  };

  // --- FIREBASE: TOGGLE STATUS ---
  const toggleStatus = async (product) => {
    try {
        const user = auth.currentUser;
        const userId = user ? user.uid : 'ceo@ecosole.store';
        const newStatus = product.status === 'active' ? 'sold-out' : 'active';
        
        const productRef = doc(db, `users/${userId}/products`, product.id);
        await setDoc(productRef, { status: newStatus }, { merge: true });
    } catch (error) {
        console.error("Error updating status:", error);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', price: '', description: '', status: 'active', images: [], ordersCount: 0, category: 'Uncategorized', isFeatured: false, variants: [] });
    setIsEditing(false);
    setView('grid');
  };

  return (
    <div className="section active" style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* HEADER */}
      <div className="header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '26px', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faBoxOpen} style={{color:'var(--primary)', marginRight:'10px'}}/>Product Catalog
          </h1>
          <p style={{color:'#64748b', margin: 0, fontSize: '14px'}}>
            Active Listings: <strong style={{ color: '#0f172a' }}>{localProducts.length}</strong>
          </p>
        </div>
        
        {view === 'grid' && (
            <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }} onClick={() => setView('form')}>
                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Add New Product
            </button>
        )}
        {view === 'form' && (
            <button className="btn btn-outline" style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold' }} onClick={resetForm}>
                Cancel & Go Back
            </button>
        )}
      </div>

      {/* === VIEW 1: ADD/EDIT FORM === */}
      {view === 'form' && (
        <div className="card" style={{ maxWidth:'900px', margin:'0 auto', padding: '30px', borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#fff' }}>
            <h3 style={{ margin: '0 0 24px 0', color: '#0f172a', fontSize: '20px' }}>
                {isEditing ? 'Edit Product Details' : 'Create New Product'}
            </h3>
            
            <div className="grid-2" style={{ gap: '30px', alignItems: 'start' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Product Name</label>
                    <input className="input-neon" style={{ padding: '14px', marginBottom: '20px', width: '100%', boxSizing: 'border-box' }} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. Premium Cotton Tee" />
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Price (PKR)</label>
                            <input className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} placeholder="0.00" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Stock Status</label>
                            <select className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})}>
                                <option value="active">Active (In Stock)</option>
                                <option value="sold-out">Sold Out</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Storefront Category</label>
                            <select className="input-neon" style={{ padding: '14px', marginBottom: 0, width: '100%', boxSizing: 'border-box' }} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                                <option value="Uncategorized">Uncategorized</option>
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.label}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* FEATURED TOGGLE */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FontAwesomeIcon icon={faStar} style={{ color: '#eab308' }} /> Feature on Homepage
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Display this item in the top 6 featured section.</div>
                        </div>
                        <div onClick={(e) => handleFeaturedToggle({ target: { checked: !formData.isFeatured } })} style={{ cursor: 'pointer', color: formData.isFeatured ? 'var(--primary)' : '#cbd5e1' }}>
                            <FontAwesomeIcon icon={formData.isFeatured ? faToggleOn : faToggleOff} size="2x" />
                        </div>
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Description</label>
                    <textarea className="input-neon" style={{ height:'120px', resize:'none', padding: '14px', width: '100%', boxSizing: 'border-box' }} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Write a compelling product description..." />
                </div>

                <div>
                    {/* IMAGES */}
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>Product Images</label>
                    <div style={{ border:'2px dashed #cbd5e1', background: '#f8fafc', padding:'40px 20px', borderRadius:'12px', textAlign:'center', cursor:'pointer', marginBottom:'20px', transition: 'background 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={(e)=>e.currentTarget.style.background='#f8fafc'}>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{display:'none'}} id="prod-img" />
                        <label htmlFor="prod-img" style={{cursor:'pointer', width:'100%', height:'100%', display:'block'}}>
                            <FontAwesomeIcon icon={faCloudArrowUp} size="3x" style={{color:'var(--primary)', marginBottom:'15px'}} />
                            <p style={{ margin:0, fontSize:'14px', fontWeight: 'bold', color: '#334155' }}>Click to upload images</p>
                        </label>
                    </div>
                    
                    {formData.images.length > 0 && (
                        <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap:'10px', marginBottom: '30px' }}>
                            {formData.images.map((img, i) => (
                                <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="preview" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* NEW: DYNAMIC VARIANT BUILDER */}
                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FontAwesomeIcon icon={faLayerGroup} style={{ color: 'var(--primary)' }}/> Product Options (Variants)
                        </h4>
                        
                        {/* List Existing Variants */}
                        {(formData.variants || []).map((v, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>{v.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>{v.options.join(', ')}</div>
                                </div>
                                <button onClick={() => removeVariant(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><FontAwesomeIcon icon={faTrash}/></button>
                            </div>
                        ))}

                        {/* Add New Variant */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                            <input className="input-neon" style={{ padding: '10px', margin: 0 }} placeholder="Option Name (e.g., Size, Color, Material)" value={variantInput.name} onChange={e => setVariantInput({...variantInput, name: e.target.value})} />
                            <input className="input-neon" style={{ padding: '10px', margin: 0 }} placeholder="Values (e.g., Small, Medium, Large)" value={variantInput.options} onChange={e => setVariantInput({...variantInput, options: e.target.value})} />
                            <button className="btn btn-outline" style={{ padding: '10px', fontSize: '13px' }} onClick={addVariant}>
                                <FontAwesomeIcon icon={faPlus} style={{ marginRight: '5px' }} /> Add Option
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <button className="btn btn-primary" disabled={isSaving} style={{ width:'100%', marginTop:'30px', padding: '16px', fontSize: '16px', fontWeight: 'bold', borderRadius: '8px' }} onClick={handleSubmit}>
                {isSaving ? 'Saving...' : (isEditing ? 'Save Product Changes' : 'Publish Product to Store')}
            </button>
        </div>
      )}

      {/* === VIEW 2: PRODUCT GRID === */}
      {view === 'grid' && (
        <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {localProducts.length === 0 && (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <FontAwesomeIcon icon={faBoxOpen} size="3x" style={{ color:'#cbd5e1', marginBottom:'20px' }} />
                    <p style={{ fontSize: '16px', color: '#475569', fontWeight: 'bold' }}>Your catalog is empty.</p>
                    <p style={{ fontSize: '14px', color: '#64748b' }}>Click "Add New Product" to build your storefront.</p>
                </div>
            )}

            {localProducts.map(product => (
                <div key={product.id} className="card" style={{ padding:0, position:'relative', overflow:'hidden', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', background: '#fff' }}>
                    
                    {/* STATUS BADGE */}
                    <div style={{ position:'absolute', top:'12px', right:'12px', zIndex:10, background: product.status === 'active' ? '#10b981' : '#ef4444', color: '#fff', padding:'6px 12px', borderRadius:'30px', fontSize:'11px', fontWeight:'900', letterSpacing: '0.5px' }}>
                        {product.status === 'active' ? 'IN STOCK' : 'SOLD OUT'}
                    </div>

                    {/* FEATURED STAR */}
                    {product.isFeatured && (
                        <div style={{ position:'absolute', top:'12px', left:'12px', zIndex:10, background: '#fff', padding: '6px 10px', borderRadius: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <FontAwesomeIcon icon={faStar} style={{ color: '#eab308', fontSize: '12px' }} />
                        </div>
                    )}

                    <ProductImageSlider images={product.images} />

                    <div style={{ padding:'20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <FontAwesomeIcon icon={faTags} style={{ color: '#94a3b8', fontSize: '11px' }} />
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {product.category || 'Uncategorized'}
                            </span>
                        </div>

                        <h4 style={{ margin:'0 0 8px 0', fontSize:'16px', color: '#0f172a', fontWeight: '800' }}>{product.name}</h4>
                        <div style={{ fontWeight:'900', color:'var(--primary)', fontSize: '18px', marginBottom: '12px' }}>PKR {parseInt(product.price).toLocaleString()}</div>
                        <p style={{ fontSize:'13px', color:'#64748b', height:'40px', overflow:'hidden', textOverflow:'ellipsis', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                            {product.description || 'No description provided.'}
                        </p>

                        <div style={{ display:'flex', gap:'8px' }}>
                            <button className="btn btn-outline" style={{ flex:1, fontSize:'12px', padding: '8px', borderRadius: '6px' }} onClick={() => handleEdit(product)}>
                                <FontAwesomeIcon icon={faPenToSquare} /> Edit
                            </button>
                            <button className="btn btn-outline" style={{ flex:1, fontSize:'12px', padding: '8px', borderRadius: '6px' }} onClick={() => toggleStatus(product)}>
                                {product.status === 'active' ? <FontAwesomeIcon icon={faBan} /> : <FontAwesomeIcon icon={faCheckCircle} />}
                                {product.status === 'active' ? ' Sold Out' : ' Restock'}
                            </button>
                            <button className="btn" style={{ background:'#fef2f2', color:'#ef4444', border:'1px solid #fecaca', padding: '8px 12px', borderRadius: '6px' }} onClick={() => handleDelete(product.id)}>
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

export default Products;