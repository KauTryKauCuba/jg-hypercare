import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function JobbonanzaMainPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          cursor: 'pointer',
          borderRadius: '8px',
          border: '1px solid #ccc',
          background: '#fff'
        }}
      >
        &larr; Back to Home
      </button>
      <h1>Jobbonanza</h1>
    </div>
  );
}
