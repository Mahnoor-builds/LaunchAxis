import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faStar, faFilter, faBoxOpen, faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import ShopLayout from './ShopLayout'; 
import ShopProductModal from './ShopProductModal';

const ShopCatalog = ({ branding, products = [], addToCart, siteConfig = {}, cartCount, openCart }) => {
  const themeColor = siteConfig.themeColor || '#2dd4bf';
  const fontFamily = siteConfig.fontFamily || "'Inter', sans-serif";
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Category & Search States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = siteConfig.categories || [];

  const loadSearchAndCategory = () => {
    // 1. Check for Category
    const savedCategory = localStorage.getItem('launchAxisStoreCategory');
    if (savedCategory) {
        setActiveCategory(savedCategory);
        localStorage.removeItem('launchAxisStoreCategory'); 
    }

    // 2. Check for Search Query
    const savedSearch = localStorage.getItem('launchAxisSearchQuery');
    if (savedSearch) {
        setSearchQuery(savedSearch);
        localStorage.removeItem('launchAxisSearchQuery');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSearchAndCategory();

    // Listener in case search is triggered while user is ALREADY on the Catalog page
    const handleSearchEvent = () => loadSearchAndCategory();
    window.addEventListener('launchAxisSearchTriggered', handleSearchEvent);
    return () => window.removeEventListener('launchAxisSearchTriggered', handleSearchEvent);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
  };

  // --- FILTERING LOGIC (CATEGORY + SEARCH QUERY) ---
  const displayedProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' ? true : p.category === activeCategory;
    
    const matchesSearch = !searchQuery || 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <ShopLayout branding={branding} cartCount={cartCount} siteConfig={siteConfig} openCart={openCart}>
      
      <div style={{ background: '#f8fafc', color: '#0f172a', fontFamily: fontFamily, minHeight: '80vh', paddingBottom: '80px' }}>
        
        {/* === PAGE HEADER === */}
        <div style={{ background: '#0f172a', color: '#fff', padding: '60px 20px', textAlign: 'center', borderBottom: `4px solid ${themeColor}` }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: '900', margin: '0 0 15px 0', letterSpacing: '-1px' }}>
                The Complete Collection
            </h1>
            <p style={{ color: '#cbd5e1', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                Browse our entire range of premium products, engineered for tomorrow.
            </p>
        </div>

        {/* === CATEGORY FILTERS & ACTIVE SEARCH BADGE === */}
        <section style={{ padding: '40px 5% 20px 5%', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <div style={{ fontWeight: '700', color: '#64748b', marginRight: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FontAwesomeIcon icon={faFilter} /> Filter:
                    </div>
                    
                    <button 
                        onClick={() => setActiveCategory('All')}
                        style={{ 
                            padding: '10px 24px', borderRadius: '30px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                            background: activeCategory === 'All' ? '#0f172a' : '#f1f5f9', 
                            color: activeCategory === 'All' ? '#fff' : '#475569', border: 'none'
                        }}>
                        <FontAwesomeIcon icon={faGrip} style={{ marginRight: '8px' }}/> All
                    </button>
                    
                    {categories.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setActiveCategory(cat.label)}
                            style={{ 
                                padding: '10px 24px', borderRadius: '30px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s',
                                background: activeCategory === cat.label ? '#0f172a' : '#f1f5f9', 
                                color: activeCategory === cat.label ? '#fff' : '#475569', border: 'none'
                            }}>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* ACTIVE SEARCH TAG */}
                {searchQuery && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: '#f1f5f9', padding: '8px 16px', borderRadius: '30px', width: 'fit-content', margin: '0 auto', fontSize: '13px', color: '#0f172a' }}>
                        <FontAwesomeIcon icon={faSearch} style={{ color: themeColor }} />
                        <span>Showing results for: <strong>"{searchQuery}"</strong></span>
                        <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', marginLeft: '5px' }}>
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                )}
            </div>
        </section>

        {/* === PRODUCT GRID === */}
        <section style={{ padding: '20px 5%', maxWidth: '1400px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', color: '#64748b', fontSize: '14px', fontWeight: '600' }}>
              <span>Showing {displayedProducts.length} result{displayedProducts.length !== 1 ? 's' : ''}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
            {displayedProducts.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                    <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '40px', color: '#cbd5e1', marginBottom: '15px' }} />
                    <p style={{ color: '#0f172a', fontSize: '18px', fontWeight: '700', margin: '0 0 5px 0' }}>No products found.</p>
                    <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
                      {searchQuery ? `No matches found for "${searchQuery}". Try clearing your search.` : 'Try selecting a different category.'}
                    </p>
                    {searchQuery && (
                        <button onClick={clearSearch} style={{ marginTop: '15px', background: '#0f172a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Clear Search Filter
                        </button>
                    )}
                </div>
            ) : (
                displayedProducts.map(product => {
                    const isSoldOut = product.status === 'sold-out';
                    return (
                        <div 
                            key={product.id} 
                            onClick={() => handleProductClick(product)}
                            style={{
                                background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '1px solid #f1f5f9', position: 'relative',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)'; }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
                        >
                            {/* OVERLAYS */}
                            {isSoldOut && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.5)', zIndex: 10, backdropFilter: 'grayscale(100%)' }}></div>
                            )}
                            {isSoldOut && (
                                <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#0f172a', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', zIndex: 11, letterSpacing: '1px' }}>
                                    SOLD OUT
                                </div>
                            )}
                            {product.promoBadge && !isSoldOut && (
                                <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#0f172a', color: '#fff', padding: '5px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: '700', zIndex: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {product.promoBadge}
                                </div>
                            )}
                            {!product.promoBadge && product.isFeatured && !isSoldOut && (
                                <div style={{ position: 'absolute', top: '20px', left: '20px', background: '#0f172a', color: '#fff', padding: '5px 12px', borderRadius: '2px', fontSize: '10px', fontWeight: '700', zIndex: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    BEST SELLER
                                </div>
                            )}

                            {/* IMAGE */}
                            <div style={{ aspectRatio: '4/5', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                            {product.images && product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ) : (
                                <span style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>No Image</span>
                            )}
                            </div>

                            {/* DETAILS */}
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, background: '#fff' }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                    {product.category || 'Uncategorized'}
                                </div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{product.name}</h3>
                                <p style={{ margin: '0', color: themeColor, fontWeight: '800', fontSize: '18px' }}>
                                    PKR {Number(product.price || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )
                })
            )}
          </div>
        </section>

      </div>

      <ShopProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addToCart={addToCart}
        themeColor={themeColor}
      />
    </ShopLayout>
  );
};

export default ShopCatalog;