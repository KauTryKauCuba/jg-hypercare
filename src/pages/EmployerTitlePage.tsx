import { useNavigate } from 'react-router-dom';

export default function EmployerTitlePage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#009698',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '700',
            marginBottom: '24px'
          }}
        >
          Back to Home
        </button>
        <h1 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Employer Title</h1>
        <p style={{ color: '#475569', fontSize: '14px' }}>Employer Title page placeholder. Content will be added here.</p>
      </div>
    </div>
  );
}
