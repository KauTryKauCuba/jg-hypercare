import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="card-container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', maxWidth: '800px', width: '100%' }}>
        <div className="evaluation-card" onClick={() => navigate('/customize')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>Customize Evaluation Form</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/benefits')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>Benefits</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/resume')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>3 resume</h2>
        </div>
        <div className="evaluation-card" style={{ margin: 0, position: 'relative', cursor: 'default', pointerEvents: 'none' }}>
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: '#F24E1E',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>figma</span>
          <h2>employer title</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/ai-report')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>AI Report</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/chatgiga')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>chatgiga</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/jobbonanza')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>jobbonanza</h2>
        </div>
        <div className="evaluation-card jobbonanza-card" onClick={() => navigate('/jobbonanza-employer')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>jobbonanza employer</h2>
        </div>
        <div className="evaluation-card jobbonanza-jobseeker-card" onClick={() => navigate('/jobbonanza-jobseeker')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>job bonanza jobseeker</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/referral-code')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>referral code superadmin</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/referral-code-employer')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>referral code employer</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/jobseeker-onboarding')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>jobseeker onboarding</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/jobseeker-dashboard')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>jobseeker dashboard</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/ai-resume-parse')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>ai resume parse</h2>
        </div>
        <div className="evaluation-card" onClick={() => navigate('/talent-intelligence')} style={{ cursor: 'pointer', margin: 0 }}>
          <h2>talent intelligence</h2>
        </div>
      </div>
    </div>
  );
}

