import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const COLORS = {
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  textMain: '#0f172a',
  textMuted: '#64748b',
  primary: '#2563eb',
  accent: '#f1f5f9'
};

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setItem)
      .catch(() => navigate('/'));
  }, [id, navigate]);

  if (!item) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: COLORS.textMuted }}>
      <p>Loading item details...</p>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: COLORS.bg, 
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation / Header Area */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: COLORS.primary, 
            cursor: 'pointer', 
            fontWeight: '600', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '24px',
            padding: 0
          }}
        >
          ← Back to Inventory
        </button>

        {/* Detail Card */}
        <div style={{ 
          backgroundColor: COLORS.white, 
          borderRadius: '16px', 
          border: `1px solid ${COLORS.border}`, 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          {/* Card Header */}
          <div style={{ padding: '32px', borderBottom: `1px solid ${COLORS.border}` }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: COLORS.textMain, margin: 0 }}>
              {item.name}
            </h2>
            <p style={{ color: COLORS.textMuted, marginTop: '8px', fontSize: '14px' }}>
              Product ID: {id}
            </p>
          </div>

          {/* Card Body */}
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Category
                </label>
                <div style={{ fontSize: '16px', color: COLORS.textMain, fontWeight: '500', padding: '12px', backgroundColor: COLORS.accent, borderRadius: '8px' }}>
                  {item.category}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Price
                </label>
                <div style={{ fontSize: '24px', color: COLORS.textMain, fontWeight: '800' }}>
                  ${item.price.toLocaleString()}
                </div>
              </div>

            </div>
          </div>

          {/* Action Footer (Optional for implementation later) */}
          <div style={{ padding: '24px 32px', backgroundColor: COLORS.accent, display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => window.print()}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: COLORS.white, 
                border: `1px solid ${COLORS.border}`, 
                borderRadius: '8px', 
                fontSize: '14px', 
                fontWeight: '600', 
                cursor: 'pointer' 
              }}
            >
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;