import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxOpen, faPlus, faPenToSquare, faTrash, faCloudArrowUp, 
  faImages, faBan, faCheckCircle, faCartShopping
} from '@fortawesome/free-solid-svg-icons';

// --- SUB-COMPONENT: INFINITE IMAGE SLIDER ---
const ProductImageSlider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 2500); // Change image every 2.5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={{width:'100%', height:'180px', overflow:'hidden', borderRadius:'8px 8px 0 0', position:'relative', background:'#000'}}>
      {images.length > 0 ? (
        <img 
            src={images[currentIndex]} 
            alt="Product" 
            style={{width:'100%', height:'100%', objectFit:'cover', transition:'opacity 0.5s ease-in-out'}} 
        />
      ) : (
        <div style={{height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#555'}}>
            <FontAwesomeIcon icon={faImages} size="2x" />
        </div>
      )}
      {/* DOTS INDICATOR */}
      {images.length > 1 && (
        <div style={{position:'absolute', bottom:'10px', left:'0', right:'0', display:'flex', justifyContent:'center', gap:'5px'}}>
            {images.map((_, idx) => (
                <div key={idx} style={{width:'6px', height:'6px', borderRadius:'50%', background: idx === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)'}}></div>
            ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
const Products = ({ products, setProducts }) => {
  const [view, setView] = useState('grid'); // 'grid' or 'form'
  const [isEditing, setIsEditing] = useState(false);
  
  // FORM STATE
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    description: '',
    status: 'active', // active, sold-out
    images: [], // Stores URLs
    ordersCount: 0
  });

  // --- ACTIONS ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setFormData({ ...formData, images: [...formData.images, ...newImageUrls] });
  };

  const handleSubmit = () => {
    if(!formData.name || !formData.price) return alert("Name and Price are required!");

    if (isEditing) {
      // Update Existing
      const updatedProducts = products.map(p => p.id === formData.id ? formData : p);
      setProducts(updatedProducts);
    } else {
      // Create New
      const newProduct = { ...formData, id: Date.now(), ordersCount: 0 };
      setProducts([newProduct, ...products]);
    }
    resetForm();
  };

  const handleEdit = (product) => {
    setFormData(product);
    setIsEditing(true);
    setView('form');
  };

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this product?")) {
        setProducts(products.filter(p => p.id !== id));
    }
  };

  const toggleStatus = (product) => {
    const newStatus = product.status === 'active' ? 'sold-out' : 'active';
    const updatedProducts = products.map(p => p.id === product.id ? { ...p, status: newStatus } : p);
    setProducts(updatedProducts);
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', price: '', description: '', status: 'active', images: [], ordersCount: 0 });
    setIsEditing(false);
    setView('grid');
  };

  return (
    <div className="section active">
      {/* HEADER */}
      <div className="header">
        <div>
          <h1><FontAwesomeIcon icon={faBoxOpen} style={{color:'var(--primary)', marginRight:'10px'}}/>Inventory Manager</h1>
          <p style={{color:'var(--text-muted)'}}>Total Products: <strong>{products.length}</strong></p>
        </div>
        
        {view === 'grid' && (
            <button className="btn btn-primary" onClick={() => setView('form')}>
                <FontAwesomeIcon icon={faPlus} /> Add New Product
            </button>
        )}
        {view === 'form' && (
            <button className="btn btn-outline" onClick={resetForm}>
                Cancel & Go Back
            </button>
        )}
      </div>

      {/* === VIEW 1: ADD/EDIT FORM === */}
      {view === 'form' && (
        <div className="card" style={{maxWidth:'800px', margin:'0 auto'}}>
            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            
            <div className="grid-2">
                <div>
                    <label>Product Name</label>
                    <input className="input-neon" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. Neon Sneakers" />
                    
                    <label>Price (PKR)</label>
                    <input className="input-neon" type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} placeholder="0.00" />
                    
                    <label>Stock Status</label>
                    <select className="select-neon" value={formData.status} onChange={e=>setFormData({...formData, status:e.target.value})}>
                        <option value="active">Active (In Stock)</option>
                        <option value="sold-out">Sold Out</option>
                    </select>
                </div>
                <div>
                    <label>Upload Images (Select Multiple)</label>
                    <div style={{border:'2px dashed var(--border)', padding:'20px', borderRadius:'8px', textAlign:'center', cursor:'pointer', marginBottom:'15px'}}>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{display:'none'}} id="prod-img" />
                        <label htmlFor="prod-img" style={{cursor:'pointer', width:'100%', height:'100%', display:'block'}}>
                            <FontAwesomeIcon icon={faCloudArrowUp} size="2x" style={{color:'var(--primary)', marginBottom:'10px'}} />
                            <p style={{margin:0, fontSize:'12px'}}>Click to upload files</p>
                        </label>
                    </div>
                    {/* Image Previews */}
                    <div style={{display:'flex', gap:'5px', overflowX:'auto'}}>
                        {formData.images.map((img, i) => (
                            <img key={i} src={img} style={{width:'50px', height:'50px', borderRadius:'4px', objectFit:'cover', border:'1px solid var(--primary)'}} alt="preview" />
                        ))}
                    </div>
                </div>
            </div>

            <label>Description</label>
            <textarea className="input-neon" style={{height:'100px', resize:'none'}} value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Product details..." />

            <button className="btn btn-primary" style={{width:'100%', marginTop:'10px'}} onClick={handleSubmit}>
                {isEditing ? 'Save Changes' : 'Publish Product'}
            </button>
        </div>
      )}

      {/* === VIEW 2: PRODUCT GRID === */}
      {view === 'grid' && (
        <div className="grid-4" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))'}}>
            {products.length === 0 && (
                <div style={{gridColumn:'1/-1', textAlign:'center', padding:'50px', color:'var(--text-muted)'}}>
                    <FontAwesomeIcon icon={faBoxOpen} size="3x" style={{opacity:0.3, marginBottom:'15px'}} />
                    <p>No products yet. Click "Add New Product" to start selling.</p>
                </div>
            )}

            {products.map(product => (
                <div key={product.id} className="card" style={{padding:0, position:'relative', overflow:'hidden'}}>
                    
                    {/* STATUS BADGE */}
                    <div style={{
                        position:'absolute', top:'10px', right:'10px', zIndex:10, 
                        background: product.status === 'active' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                        color: '#fff', padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'bold'
                    }}>
                        {product.status === 'active' ? 'IN STOCK' : 'SOLD OUT'}
                    </div>

                    {/* IMAGE SLIDER */}
                    <ProductImageSlider images={product.images} />

                    {/* DETAILS */}
                    <div style={{padding:'15px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                            <h4 style={{margin:'0 0 5px 0', fontSize:'16px'}}>{product.name}</h4>
                            <div style={{fontWeight:'bold', color:'var(--primary)'}}>${parseInt(product.price).toLocaleString()}</div>
                        </div>
                        
                        <p style={{fontSize:'12px', color:'var(--text-muted)', height:'35px', overflow:'hidden', textOverflow:'ellipsis'}}>
                            {product.description || 'No description provided.'}
                        </p>

                        <div style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'var(--text-muted)', marginBottom:'15px'}}>
                            <FontAwesomeIcon icon={faCartShopping} /> {product.ordersCount} Total Orders
                        </div>

                        {/* ACTIONS */}
                        <div style={{display:'flex', gap:'5px', borderTop:'1px solid var(--border)', paddingTop:'10px'}}>
                            <button className="btn btn-outline" style={{flex:1, fontSize:'12px'}} onClick={() => handleEdit(product)}>
                                <FontAwesomeIcon icon={faPenToSquare} /> Edit
                            </button>
                            <button className="btn btn-outline" style={{flex:1, fontSize:'12px'}} onClick={() => toggleStatus(product)}>
                                {product.status === 'active' ? <FontAwesomeIcon icon={faBan} /> : <FontAwesomeIcon icon={faCheckCircle} />}
                                {product.status === 'active' ? ' Sold Out' : ' Restock'}
                            </button>
                            <button 
                                className="btn" 
                                style={{background:'rgba(239, 68, 68, 0.1)', color:'#ef4444', border:'1px solid rgba(239, 68, 68, 0.3)'}}
                                onClick={() => handleDelete(product.id)}
                            >
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