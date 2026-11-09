import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, faPlus, faPenToSquare, faTrash, faCloudArrowUp, 
  faImages, faBan, faCheckCircle, faTags,
  faToggleOn, faToggleOff, faLayerGroup, faAward,
  faMoneyBillWave, faAlignLeft, faArrowLeft, faTriangleExclamation, 
  faTimesCircle, faSpinner, faCircleQuestion
} from '@fortawesome/free-solid-svg-icons';

// --- FIREBASE IMPORTS ---
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

// --- SUB-COMPONENT: INFINITE IMAGE SLIDER ---
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
    <div style={{ width: '100%', height: '190px', overflow: 'hidden', borderRadius: '14px 14px 0 0', position: 'relative', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
      {safeImages.length > 0 ? (
        <img 
          src={safeImages[currentIndex]} 
          alt="Product" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease-in-out' }} 
        />
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '8px' }}>
          <FontAwesomeIcon icon={faImages} size="2x" />
          <span style={{ fontSize: '11px', fontWeight: '700' }}>No Image Uploaded</span>
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

// --- MAIN COMPONENT ---
const Products = ({ siteConfig = {} }) => {
  const [view, setView] = useState('grid'); 
  const [isEditing, setIsEditing] = useState(false);
  const [localProducts, setLocalProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom UI Modals
  const [uiModal, setUiModal] = useState({ isOpen: false, type: 'alert', title: '', message: '', targetId: null });

  // FORM STATE (+ Added infoSections array for expandable product tabs/FAQs)
  const [formData, setFormData] = useState({
    id: null, name: '', price: '', description: '', status: 'active', 
    images: [], ordersCount: 0, category: 'Uncategorized', isFeatured: false,
    promoBadge: '', variants: [], infoSections: []
  });

  const [variantInput, setVariantInput] = useState({ name: '', options: '' });
  const [infoInput, setInfoInput] = useState({ title: '', content: '' });

  const availableCategories = siteConfig.categories || [];

  // Consistent user key (Matches App.js email key)
  const getUserKey = () => {
    if (auth.currentUser?.email) return auth.currentUser.email;
    const rawMemory = localStorage.getItem("launchAxisTempData");
    if (rawMemory) {
      try { return JSON.parse(rawMemory).email; } catch (e) {}
    }
    return 'ceo@ecosole.store';
  };

  // --- FIREBASE: LIVE SYNC ---
  useEffect(() => {
    const userKey = getUserKey();
    const productsRef = collection(db, `users/${userKey}/products`);
    
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const liveProducts = [];
      snapshot.forEach((docSnap) => {
        liveProducts.push({ id: docSnap.id, ...docSnap.data() });
      });
      setLocalProducts(liveProducts);
    });

    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---
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
      const currentFeaturedCount = localProducts.filter(p => p.isFeatured && p.id !== formData.id).length;
      if (currentFeaturedCount >= 6) {
        showAlert("Limit Reached", "You can only highlight a maximum of 6 Best Seller items on your storefront.");
        return; 
      }
    }
    setFormData({ ...formData, isFeatured: isChecked });
  };

  const addVariant = () => {
    if (!variantInput.name.trim() || !variantInput.options.trim()) return;
    const optionsArray = variantInput.options.split(',').map(s => s.trim()).filter(s => s !== '');
    if (optionsArray.length === 0) return;
    const newVariant = { name: variantInput.name.trim(), options: optionsArray };
    setFormData({ ...formData, variants: [...(formData.variants || []), newVariant] });
    setVariantInput({ name: '', options: '' }); 
  };

  const removeVariant = (idx) => {
    const updatedVariants = (formData.variants || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, variants: updatedVariants });
  };

  // --- PRODUCT INFO & FAQ ACCORDION BUILDER ---
  const addInfoSection = () => {
    if (!infoInput.title.trim() || !infoInput.content.trim()) return;
    const newSection = {
      id: `sec_${Date.now()}`,
      title: infoInput.title.trim(),
      content: infoInput.content.trim()
    };
    setFormData({ ...formData, infoSections: [...(formData.infoSections || []), newSection] });
    setInfoInput({ title: '', content: '' });
  };

  const removeInfoSection = (idx) => {
    const updated = (formData.infoSections || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, infoSections: updated });
  };

  const handleSubmit = async () => {
    if(!formData.name || !formData.price) {
      return showAlert("Missing Information", "Please enter both a Product Name and Price before saving.");
    }
    setIsSaving(true);

    try {
      const userKey = getUserKey();
      const productId = isEditing ? formData.id : `prod_${Date.now()}`;
      const productRef = doc(db, `users/${userKey}/products`, productId);
      
      const dataToSave = { 
        ...formData,
        price: Math.max(0, Number(formData.price) || 0)
      };
      delete dataToSave.id;

      await setDoc(productRef, dataToSave, { merge: true });
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      showAlert("Save Failed", "Could not save product to your catalog. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      ...product,
      category: product.category || 'Uncategorized',
      isFeatured: product.isFeatured || false,
      promoBadge: product.promoBadge || '',
      variants: product.variants || [],
      infoSections: product.infoSections || [],
      images: product.images || []
    });
    setIsEditing(true);
    setView('form');
  };

  const requestDelete = (id) => {
    setUiModal({
      isOpen: true,
      type: 'confirmDelete',
      title: 'Delete Product?',
      message: 'Are you sure you want to permanently remove this product from your storefront catalog?',
      targetId: id
    });
  };

  const confirmDelete = async () => {
    if (!uiModal.targetId) return;
    try {
      const userKey = getUserKey();
      const productRef = doc(db, `users/${userKey}/products`, uiModal.targetId);
      await deleteDoc(productRef);
      closeModal();
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("Delete Failed", "Could not delete this product.");
    }
  };

  const toggleStatus = async (product) => {
    try {
      const userKey = getUserKey();
      const newStatus = product.status === 'active' ? 'sold-out' : 'active';
      
      const productRef = doc(db, `users/${userKey}/products`, product.id);
      await setDoc(productRef, { status: newStatus }, { merge: true });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', price: '', description: '', status: 'active', images: [], ordersCount: 0, category: 'Uncategorized', isFeatured: false, promoBadge: '', variants: [], infoSections: [] });
    setVariantInput({ name: '', options: '' });
    setInfoInput({ title: '', content: '' });
    setIsEditing(false);
    setView('grid');
  };

  // --- SUMMARY METRICS ---
  const activeCount = localProducts.filter(p => p.status === 'active').length;
  const soldOutCount = localProducts.filter(p => p.status === 'sold-out').length;
  const featuredCount = localProducts.filter(p => p.isFeatured).length;

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

  const quickInfoPresets = [
    'Ingredients & Materials',
    'Key Benefits',
    'How to Use / Care',
    'Size & Fit Guide',
    'Product FAQs'
  ];

  return (
    <section className="section active" style={{ paddingBottom: '48px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- 1. TOP HEADER BAR --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#059669', display: 'block', marginBottom: '4px' }}>
            Storefront Inventory
          </span>
          <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            Product Catalog
          </h2>
        </div>
        
        {view === 'grid' ? (
          <button style={primaryBtnStyle} onClick={() => setView('form')}>
            <FontAwesomeIcon icon={faPlus} style={{ color: '#10b981' }} /> Add New Product
          </button>
        ) : (
          <button style={secondaryBtnStyle} onClick={resetForm}>
            <FontAwesomeIcon icon={faArrowLeft} style={{ color: '#64748b' }} /> Back to Catalog
          </button>
        )}
      </div>

      {/* --- 2. FOUR KEY CATALOG PULSE CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Total Products</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{localProducts.length}</div>
          <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Listed in your store</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>In Stock & Active</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faCheckCircle} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{activeCount}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600' }}>Ready for checkout</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Best Sellers</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faAward} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{featuredCount} / 6</div>
          <div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>Featured on homepage</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>Sold Out</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
              <FontAwesomeIcon icon={faBan} />
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>{soldOutCount}</div>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Marked out of stock</div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* VIEW 1: ADD / EDIT PRODUCT FORM                           */}
      {/* ========================================================= */}
      {view === 'form' && (
        <div style={bentoCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FontAwesomeIcon icon={isEditing ? faPenToSquare : faPlus} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {isEditing ? 'Update Product Listing' : 'Add New Product to Store'}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Fill in product pricing, photos, variants, and expandable customer info sections</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '28px', alignItems: 'flex-start' }}>
            
            {/* LEFT FORM COLUMN */}
            <div style={{ flex: '1.2 1 360px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faBoxOpen} style={{ color: '#2563eb' }} /> Product Title</label>
              <input style={saasInputStyle} value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. Signature Oud Eau De Parfum" />
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#059669' }} /> Price (PKR)</label>
                  <input style={saasInputStyle} type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} placeholder="0.00" />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#ea580c' }} /> Availability</label>
                  <select style={saasInputStyle} value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})}>
                    <option value="active">In Stock (Active)</option>
                    <option value="sold-out">Sold Out</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faTags} style={{ color: '#4f46e5' }} /> Collection Category</label>
                  <select style={saasInputStyle} value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                    <option value="Uncategorized">Uncategorized</option>
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.label}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label style={labelStyle}><FontAwesomeIcon icon={faAward} style={{ color: '#ea580c' }} /> Promo Ribbon</label>
                  <select style={saasInputStyle} value={formData.promoBadge} onChange={e=>setFormData({...formData, promoBadge:e.target.value})}>
                    <option value="">No Badge</option>
                    <option value="BEST SELLER">BEST SELLER</option>
                    <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                    <option value="SALE">SALE</option>
                    <option value="LIMITED EDITION">LIMITED EDITION</option>
                  </select>
                </div>
              </div>

              {/* BEST SELLER HIGHLIGHT TOGGLE */}
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px', color: '#9a3412', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FontAwesomeIcon icon={faAward} style={{ color: '#ea580c' }} /> Feature in Homepage "Best Sellers"
                  </div>
                  <div style={{ fontSize: '12px', color: '#c2410c', marginTop: '2px' }}>Highlights this product in the top curated showcase (Max 6).</div>
                </div>
                <div onClick={() => handleFeaturedToggle({ target: { checked: !formData.isFeatured } })} style={{ cursor: 'pointer', color: formData.isFeatured ? '#ea580c' : '#cbd5e1', fontSize: '24px' }}>
                  <FontAwesomeIcon icon={formData.isFeatured ? faToggleOn : faToggleOff} />
                </div>
              </div>

              <label style={labelStyle}><FontAwesomeIcon icon={faAlignLeft} style={{ color: '#2563eb' }} /> Main Product Summary</label>
              <textarea style={{ ...saasInputStyle, height: '100px', resize: 'vertical', lineHeight: '1.5', marginBottom: '22px' }} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Write a clear overview that appears right below the product title..." />

              {/* NEW: EXPANDABLE PRODUCT INFO & FAQ BUILDER */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>
                    <FontAwesomeIcon icon={faCircleQuestion} style={{ color: '#059669' }} /> Product Details & FAQ Tabs (Optional)
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Expandable sections on product page</span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                  Add extra dropdown sections like Ingredients, Benefits, Size Guide, or FAQs so customers get complete details when clicking this product.
                </p>

                {/* Quick Preset Chips */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {quickInfoPresets.map((preset, idx) => (
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

                {/* Existing Info Sections */}
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
                  placeholder="Section Heading (e.g. Ingredients, Benefits, or FAQ)" 
                  value={infoInput.title} 
                  onChange={e => setInfoInput({...infoInput, title: e.target.value})} 
                />
                <textarea 
                  rows="3"
                  style={{ ...saasInputStyle, background: '#ffffff', marginBottom: '12px', resize: 'vertical' }} 
                  placeholder="Details (e.g. Top notes: Bergamot & Saffron. Lasts 12+ hours...)" 
                  value={infoInput.content} 
                  onChange={e => setInfoInput({...infoInput, content: e.target.value})} 
                />
                <button type="button" style={{ ...secondaryBtnStyle, width: '100%' }} onClick={addInfoSection}>
                  <FontAwesomeIcon icon={faPlus} style={{ color: '#059669' }} /> Add Info Tab to Product
                </button>
              </div>
            </div>

            {/* RIGHT FORM COLUMN: GALLERY & VARIANTS */}
            <div style={{ flex: '1 1 320px' }}>
              <label style={labelStyle}><FontAwesomeIcon icon={faImages} style={{ color: '#059669' }} /> Product Photos</label>
              <div style={{ border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '32px 20px', borderRadius: '14px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }}>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="prod-img" />
                <label htmlFor="prod-img" style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'block', margin: 0 }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 12px' }}>
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Click to upload product photos</p>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Supports JPG, PNG, WebP (Multiple allowed)</span>
                </label>
              </div>
              
              {formData.images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '10px', marginBottom: '24px' }}>
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

              {/* DYNAMIC VARIANT BUILDER */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>
                  <FontAwesomeIcon icon={faLayerGroup} style={{ color: '#4f46e5' }} /> Product Options (Sizes / Colors / Scents)
                </label>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                  Let buyers pick their size, color, or bottle volume before adding to bag.
                </p>
                
                {(formData.variants || []).map((v, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{v.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{v.options.join(', ')}</div>
                    </div>
                    <button type="button" onClick={() => removeVariant(idx)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}

                <input style={{ ...saasInputStyle, background: '#ffffff', marginBottom: '10px' }} placeholder="Option Name (e.g. Size, Color, Volume)" value={variantInput.name} onChange={e => setVariantInput({...variantInput, name: e.target.value})} />
                <input style={{ ...saasInputStyle, background: '#ffffff', marginBottom: '12px' }} placeholder="Choices separated by comma (e.g. Small, Medium, Large)" value={variantInput.options} onChange={e => setVariantInput({...variantInput, options: e.target.value})} />
                <button type="button" style={{ ...secondaryBtnStyle, width: '100%' }} onClick={addVariant}>
                  <FontAwesomeIcon icon={faPlus} style={{ color: '#4f46e5' }} /> Add Option Group
                </button>
              </div>
            </div>

          </div>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button style={secondaryBtnStyle} onClick={resetForm}>Cancel</button>
            <button style={{ ...primaryBtnStyle, padding: '14px 28px' }} disabled={isSaving} onClick={handleSubmit}>
              {isSaving ? <><FontAwesomeIcon icon={faSpinner} spin /> Saving...</> : <><FontAwesomeIcon icon={faCheckCircle} style={{ color: '#10b981' }} /> {isEditing ? 'Save Product Changes' : 'Publish Product'}</>}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PRODUCT CATALOG GRID                              */}
      {/* ========================================================= */}
      {view === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {localProducts.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px' }}>
                <FontAwesomeIcon icon={faBoxOpen} />
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Your product catalog is empty</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#64748b' }}>Add your first product with photos, variants, and details to start taking orders.</p>
              <button style={primaryBtnStyle} onClick={() => setView('form')}>
                <FontAwesomeIcon icon={faPlus} style={{ color: '#10b981' }} /> Add First Product
              </button>
            </div>
          )}

          {localProducts.map(product => (
            <div key={product.id} style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              
              <div>
                {/* STATUS PILL */}
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, background: product.status === 'active' ? '#ecfdf5' : '#fef2f2', color: product.status === 'active' ? '#059669' : '#dc2626', border: product.status === 'active' ? '1px solid #a7f3d0' : '1px solid #fecaca', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>
                  {product.status === 'active' ? 'In Stock' : 'Sold Out'}
                </div>

                {/* BEST SELLER OR PROMO BADGE */}
                {(product.isFeatured || product.promoBadge) && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, background: '#0f172a', color: '#ffffff', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    {product.promoBadge || 'BEST SELLER'}
                  </div>
                )}

                <ProductImageSlider images={product.images} />

                <div style={{ padding: '20px 20px 14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FontAwesomeIcon icon={faTags} style={{ color: '#4f46e5', fontSize: '11px' }} />
                      <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {product.category || 'Uncategorized'}
                      </span>
                    </div>
                    {(product.infoSections?.length > 0 || product.variants?.length > 0) && (
                      <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>
                        {product.variants?.length || 0} Options • {product.infoSections?.length || 0} Tabs
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>{product.name}</h4>
                  <div style={{ fontWeight: '900', color: '#059669', fontSize: '19px', marginBottom: '10px' }}>
                    PKR {parseInt(product.price || 0).toLocaleString()}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', height: '40px', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: '1.5', margin: 0 }}>
                    {product.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div style={{ padding: '14px 20px 20px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '8px' }}>
                <button style={{ ...secondaryBtnStyle, flex: 1, padding: '8px 12px', fontSize: '12px' }} onClick={() => handleEdit(product)}>
                  <FontAwesomeIcon icon={faPenToSquare} style={{ color: '#2563eb' }} /> Edit
                </button>
                <button style={{ ...secondaryBtnStyle, flex: 1, padding: '8px 12px', fontSize: '12px' }} onClick={() => toggleStatus(product)}>
                  {product.status === 'active' ? <FontAwesomeIcon icon={faBan} style={{ color: '#ea580c' }} /> : <FontAwesomeIcon icon={faCheckCircle} style={{ color: '#059669' }} />}
                  {product.status === 'active' ? 'Sold Out' : 'Restock'}
                </button>
                <button style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => requestDelete(product.id)}>
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
                  <button onClick={confirmDelete} style={{ ...primaryBtnStyle, flex: 1, background: '#dc2626' }}>Delete Product</button>
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

export default Products;