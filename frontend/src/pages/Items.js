import React, { useEffect, useState, useMemo } from 'react';
import { useData } from '../state/DataContext';
import { Link, useSearchParams } from 'react-router-dom';
import { FixedSizeList } from 'react-window';

const COLORS = {
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  textMain: '#0f172a',
  textMuted: '#64748b',
  primary: '#2563eb',
  accent: '#f1f5f9'
};


const cardStyle = {
  background: COLORS.white,
  padding: '24px',
  borderRadius: '16px',
  border: `1px solid ${COLORS.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  height: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between'
};

const listRowStyle = {
  borderBottom: `1px solid ${COLORS.border}`,
  display: 'flex',
  alignItems: 'center',
  padding: '0 24px',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%'
};


// List vieew row
const ListRow = ({ data, index, style }) => {
  const item = data[index];
  if (!item) return null;

  return (
    <div style={style}>
      <div style={listRowStyle}>
        <div style={{ flex: 1 }}>
          <Link to={`/items/${item.id}`} style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            {item.name}
          </Link>
        </div>
        <div style={{ fontWeight: '700', color: COLORS.textMain, fontSize: '14px', textAlign: 'right' }}>
          ${item.price.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

// Grid view row
const GridRow = ({ data, index, style }) => {
  const { items, columns } = data;
  
  // Calculate which items belong in this row
  const startIndex = index * columns;
  const rowItems = items.slice(startIndex, startIndex + columns);

  // no items render nothing
  if (rowItems.length === 0) return null;

  return (
    <div style={style}>
      <div style={{ display: 'flex', gap: '20px', padding: '0 0 20px 0', height: '100%', boxSizing: 'border-box' }}>
        {rowItems.map((item) => (
          <div key={item.id} style={{ flex: 1, minWidth: 0 }}> {/* stretch evenly */}
            <div style={cardStyle}>
              <Link to={`/items/${item.id}`} style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: '700', fontSize: '16px', display: 'block', marginBottom: '12px' }}>
                {item.name}
              </Link>
              <div>
                <div style={{ fontSize: '12px', color: COLORS.textMuted, marginBottom: '4px' }}>PRICE</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.textMain }}>
                  ${item.price.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* divs to maintain width if the last row is not full */}
        {Array.from({ length: columns - rowItems.length }).map((_, i) => (
          <div key={`spacer-${i}`} style={{ flex: 1 }}></div>
        ))}
      </div>
    </div>
  );
};

function Items() {
  const { items, meta, fetchItems, loading, error } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params to preserve navigation history
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSearch = searchParams.get('q') || '';
  const initialView = searchParams.get('view') || 'list';

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [viewMode, setViewMode] = useState(initialView);
  
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (search !== initialSearch) {
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [search, initialSearch]);

  useEffect(() => {
    const controller = new AbortController();
    
    fetchItems({ page, q: debouncedSearch, limit: 12, signal: controller.signal });

    // Update URL without refreshing
    const params = { page, view: viewMode };
    if (debouncedSearch) params.q = debouncedSearch;
    setSearchParams(params, { replace: true }); // prevents flooding history

    return () => controller.abort();
  }, [fetchItems, page, debouncedSearch, viewMode, setSearchParams]);

  // Dynamic column calculation for responsive grid
  const containerWidth = Math.min(1600, dimensions.width) - 48; 
  const minCardWidth = 280;
  const gap = 20;
  const columns = viewMode === 'grid' ? Math.floor((containerWidth + gap) / (minCardWidth + gap)) : 1;
  const safeColumns = Math.max(1, columns);

  return (
    <div style={{ minHeight: '100vh', width: '100%', backgroundColor: COLORS.bg, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: COLORS.textMain, margin: '0 0 4px 0' }}>Inventory</h1>
            </Link>
            <p style={{ color: COLORS.textMuted, fontSize: '14px', margin: 0 }}>Manage your product stock levels</p>
          </div>
          
          <div style={{ display: 'flex', background: COLORS.white, padding: '4px', borderRadius: '8px', border: `1px solid ${COLORS.border}` }}>
            <button onClick={() => setViewMode('list')} style={toggleButtonStyle(viewMode === 'list')}>List</button>
            <button onClick={() => setViewMode('grid')} style={toggleButtonStyle(viewMode === 'grid')}>Grid</button>
          </div>
        </header>

        {/* Search */}
        <div style={{ marginBottom: '24px', position: 'relative', maxWidth: '600px', margin: '0 auto 24px auto' }}>
            <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: COLORS.textMuted, fontSize: '18px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={searchInputStyle}
            />
        </div>

        <div style={{ 
          backgroundColor: viewMode === 'list' ? COLORS.white : 'transparent', 
          borderRadius: '16px', 
          border: viewMode === 'list' ? `1px solid ${COLORS.border}` : 'none', 
          height: dimensions.height - 280, 
          overflow: 'hidden' 
        }}>
          {loading && !items.length ? (
             <div style={{ padding: '60px', textAlign: 'center', color: COLORS.textMuted }}>Loading inventory...</div>
          ) : (
            <>
              {viewMode === 'list' ? (
                // List view
                <>
                  <div style={listHeaderStyle}>
                    <div style={{ flex: 1 }}>Product Name</div>
                    <div style={{ textAlign: 'right' }}>Unit Price</div>
                  </div>
                  <FixedSizeList 
                    height={dimensions.height - 320} 
                    itemCount={items.length} 
                    itemSize={56} 
                    width="100%"
                    itemData={items}
                  >
                    {ListRow}
                  </FixedSizeList>
                </>
              ) : (

                // FixedSizeList but calculate rowCount by dividing items by columns
                <FixedSizeList 
                  height={dimensions.height - 280} 
                  itemCount={Math.ceil(items.length / safeColumns)} 
                  itemSize={220} // H of card + gap
                  width="100%"
                  itemData={{ items, columns: safeColumns }}
                >
                  {GridRow}
                </FixedSizeList>
              )}
            </>
          )}
          {!loading && items.length === 0 && <EmptyState />}
        </div>

        {/* Pagination */}
        <footer style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: COLORS.white, borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: '14px', color: COLORS.textMuted }}>Page {meta?.page || 1} of {meta?.totalPages || 1}</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} style={{...pageButtonStyle, opacity: page === 1 ? 0.5 : 1}}>Previous</button>
            <button onClick={() => setPage(p => p + 1)} disabled={!meta || page >= meta.totalPages || loading} style={{...pageButtonStyle, opacity: (!meta || page >= meta.totalPages) ? 0.5 : 1}}>Next</button>
          </div>
        </footer>
      </div>
    </div>
  );
}



const EmptyState = () => (
  <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>No items found.</div>
);

const searchInputStyle = {
  width: '100%', 
  padding: '14px 20px 14px 48px', 
  borderRadius: '12px', 
  border: `1px solid ${COLORS.border}`, 
  fontSize: '16px', 
  outline: 'none', 
  backgroundColor: COLORS.white,
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  boxSizing: 'border-box'
};

const listHeaderStyle = {
  display: 'flex', 
  padding: '12px 24px', 
  backgroundColor: COLORS.accent, 
  fontSize: '12px', 
  fontWeight: '700', 
  color: COLORS.textMuted, 
  textTransform: 'uppercase'
};

const toggleButtonStyle = (active) => ({
  padding: '6px 16px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600',
  backgroundColor: active ? COLORS.primary : 'transparent',
  color: active ? 'white' : COLORS.textMuted,
  transition: 'all 0.2s'
});

const pageButtonStyle = {
  padding: '8px 20px',
  borderRadius: '8px',
  border: `1px solid ${COLORS.border}`,
  background: 'white',
  fontWeight: '600',
  cursor: 'pointer'
};

export default Items;