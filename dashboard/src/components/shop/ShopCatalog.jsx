import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGrip, faFilter, faBoxOpen, faXmark, faSearch, faEye, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import ShopLayout from './ShopLayout'; 
import ShopProductModal from './ShopProductModal';

const ShopCatalog = ({ branding = {}, products = [], addToCart, siteConfig = {}, cartCount = 0, openCart }) => {
  const themeColor = siteConfig?.themeColor || branding?.color || '#2563eb';
  const fontFamily = branding?.font || siteConfig?.fontFamily || "'Inter', sans-serif";
  
  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Category, Search & Sort States
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = siteConfig?.categories || [];

  const loadSearchAndCategory = () => {
    const savedCategory = localStorage.getItem('launchAxisStoreCategory');
    if (savedCategory) {
      setActiveCategory(savedCategory);
      localStorage.removeItem('launchAxisStoreCategory'); 
    }

    const savedSearch = localStorage.getItem('launchAxisSearchQuery');
    if (savedSearch) {
      setSearchQuery(savedSearch);
      localStorage.removeItem('launchAxisSearchQuery');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadSearchAndCategory();

    const handleSearchEvent = () => loadSearchAndCategory();
    window.addEventListener('launchAxisSearchTriggered', handleSearchEvent);
    return () => window.removeEventListener('launchAxisSearchTriggered', handleSearchEvent);
  }, []);

  const clearSearch = () => setSearchQuery('');

  // --- FILTERING & SORTING LOGIC ---
  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' ? true : p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = Number(a.price) || 0;
    const priceB = Number(b.price) || 0;
    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    return 0;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <ShopLayout branding={branding} cartCount={cartCount} siteConfig={siteConfig} openCart={openCart}>
      
      <div style={{ background: '#f8fafc', color: '#0f172a', fontFamily, minHeight: '80vh', paddingBottom: '80px' }}>
        
        {/* === PAGE HEADER === */}
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '56px 20px', textAlign: 'center', borderBottom: `4px solid ${themeColor}` }}>
          <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#fb923c', background: 'rgba(249, 115, 22, 0.15)', padding: '5px 12px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px' }}>
            Complete Store Catalog
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: '900', margin: '0 0 12px 0', letterSpacing: '-0.8px', color: '#ffffff' }}>
            Explore Our Collection
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', maxWidth: '560px', margin: '0 auto' }}>
            Click on any item below to view full photos, available sizes/options, and product FAQs.
          </p>
        </div>

        {/* === FILTER & SORT BENTO BAR === */}
        <section style={{ padding: '32px 5% 16px 5%', maxWidth: '1320px', margin: '0 auto' }}>
          <div style={{ background: '#ffffff', padding: '18px 22px', borderRadius: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            
            {/* Category Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', fontSize: '12px', color: '#64748b', marginRight: '6px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                <FontAwesomeIcon icon={faFilter} style={{ color: '#ea580c' }} /> Category:
              </span>
              
              <button 
                onClick={() => setActiveCategory('All')}
                style={{ 
                  padding: '8px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                  background: activeCategory === 'All' ? '#0f172a' : '#f8fafc', 
                  color: activeCategory === 'All' ? '#ffffff' : '#475569', 
                  border: activeCategory === 'All' ? '1px solid #0f172a' : '1px solid #cbd5e1'
                }}
              >
                <FontAwesomeIcon icon={faGrip} style={{ marginRight: '6px', color: activeCategory === 'All' ? '#f97316' : '#64748b' }}/> All ({products.length})
              </button>
              
              {categories.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.label)}
                  style={{ 
                    padding: '8px 18px', borderRadius: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer',
                    background: activeCategory === cat.label ? '#0f172a' : '#f8fafc', 
                    color: activeCategory === cat.label ? '#ffffff' : '#475569', 
                    border: activeCategory === cat.label ? '1px solid #0f172a' : '1px solid #cbd5e1'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faSortAmountDown} style={{ color: '#2563eb', fontSize: '13px' }} />
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '13px', fontWeight: '700', color: '#0f172a', outline: 'none', cursor: 'pointer', margin: 0 }}
              >
                <option value="newest">Sort: Featured & Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Active Search Chip */}
          {searchQuery && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '8px 16px', borderRadius: '30px', width: 'fit-content', marginTop: '14px', fontSize: '13px', color: '#1e40af', fontWeight: '700' }}>
              <FontAwesomeIcon icon={faSearch} style={{ color: '#2563eb' }} />
              <span>Search filter: <strong>"{searchQuery}"</strong></span>
              <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', marginLeft: '4px' }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          )}
        </section>

        {/* === PRODUCT GRID === */}
        <section style={{ padding: '16px 5%', maxWidth: '1320px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '20px', color: '#64748b', fontSize: '13px', fontWeight: '700' }}>
            Showing {displayedProducts.length} product{displayedProducts.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {displayedProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '64px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                <FontAwesomeIcon icon={faBoxOpen} style={{ fontSize: '36px', color: '#cbd5e1', marginBottom: '12px' }} />
                <p style={{ color: '#0f172a', fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0' }}>No matching products found</p>
                <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 18px 0' }}>
                  {searchQuery ? `We couldn't find any items matching "${searchQuery}".` : 'Try selecting "All" categories above.'}
                </p>
                {(searchQuery || activeCategory !== 'All') && (
                  <button 
                    onClick={() => { clearSearch(); setActiveCategory('All'); }} 
                    style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              displayedProducts.map(product => {
                const isSoldOut = product.status === 'sold-out';
                const safePrice = Math.max(0, Number(product.price) || 0);

                return (
                  <div 
                    key={product.id} 
                    onClick={() => handleProductClick(product)}
                    style={{
                      background: '#ffffff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', 
                      transition: 'all 0.25s ease', border: '1px solid #e2e8f0', position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 32px -10px rgba(15, 23, 42, 0.1)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
                  >
                    {isSoldOut ? (
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', zIndex: 11 }}>
                        SOLD OUT
                      </div>
                    ) : (product.promoBadge || product.isFeatured) ? (
                      <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#0f172a', color: '#ffffff', padding: '5px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', zIndex: 11, letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                        {product.promoBadge || 'BEST SELLER'}
                      </div>
                    ) : null}

                    <div style={{ aspectRatio: '4/5', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderBottom: '1px solid #f1f5f9' }}>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isSoldOut ? 'grayscale(80%)' : 'none' }} />
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>No Image</span>
                      )}
                    </div>

                    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', background: '#ffffff' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.4px' }}>
                          {product.category || 'Uncategorized'}
                        </div>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                          {product.name}
                        </h3>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
                        <span style={{ color: '#059669', fontWeight: '900', fontSize: '17px' }}>
                          PKR {safePrice.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '5px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <FontAwesomeIcon icon={faEye} style={{ color: themeColor }} /> Details
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

      </div>

      {/* PRODUCT QUICK-VIEW & FAQ MODAL */}
      <ShopProductModal 
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addToCart={addToCart}
        themeColor={themeColor}
        siteConfig={siteConfig}
      />
    </ShopLayout>
  );
};

export default ShopCatalog;