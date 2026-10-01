import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JobbonanzaJobseekerPage() {
  const navigate = useNavigate();

  // Active section inside the profile dashboard
  const [activeTab, setActiveTab] = useState('basic');
  const [showJobbonanzaPosting, setShowJobbonanzaPosting] = useState(false);

  // List of uploaded resumes (max 3)
  const [resumes, setResumes] = useState<string[]>(['']);
  
  // Index of default resume
  const [defaultResumeIdx, setDefaultResumeIdx] = useState(0);

  // Helper to get default resume name
  const defaultResume = resumes[defaultResumeIdx] || resumes.find(r => r !== '') || '';

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Navbar */}
      <header className="navbar" style={{ backgroundColor: '#ffffff', padding: '0 40px', height: '70px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
        <div className="nav-left" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '30px' }}>
          <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', height: '100%', margin: '0', padding: '0' }}>
            <span className="logo-text" style={{ color: '#009698', fontWeight: '800', fontSize: '22px', lineHeight: '1', margin: '0', display: 'inline-flex', alignItems: 'center' }}>JobGiga</span>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '24px', fontSize: '12px', fontWeight: '700', color: '#4b5563', letterSpacing: '0.5px' }}>
            <span style={{ cursor: 'pointer' }}>HOME</span>
            <span style={{ cursor: 'pointer' }}>FIND JOB</span>
            <span style={{ cursor: 'pointer' }}>COMPANIES</span>
            <span style={{ cursor: 'pointer' }}>ABOUT</span>
          </nav>
        </div>

        <div className="nav-right" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '20px' }}>
          <div className="lang-dropdown" style={{ fontWeight: '600', fontSize: '12px', color: '#009698', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🌐 EN <span className="caret-icon" style={{ fontSize: '8px', color: '#94a3b8' }}>▼</span>
          </div>
          <button
            type="button"
            className="my-company-outline-btn"
            style={{ borderRadius: '20px', height: '36px', padding: '0 20px', border: '1px solid #009698', color: '#009698', fontWeight: '700', fontSize: '12px', backgroundColor: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            My Application
          </button>
          <div style={{ fontSize: '18px', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>💬</div>
          <div style={{ fontSize: '18px', cursor: 'pointer', color: '#94a3b8', position: 'relative', display: 'flex', alignItems: 'center' }}>
            🔔
            <span className="dot-notification" style={{ top: '0px', right: '0px', backgroundColor: '#ef4444', width: '6px', height: '6px', borderRadius: '50%', position: 'absolute' }}></span>
          </div>
          <div className="user-profile-block" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '10px' }}>
            <div className="user-text" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="user-handle" style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>jobseekertest01</span>
              <span className="user-title" style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600', lineHeight: '1.2' }}>Jobseeker</span>
            </div>
            <div className="user-avatar-circle" style={{ backgroundColor: '#ffedd5', color: '#ea580c', fontWeight: '800', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
              JS
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', padding: '40px', maxWidth: '1400px', width: '100%', margin: '0 auto', flexGrow: 1 }}>
        
        {/* Left Profile Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Navigation Links Card */}
          <div className="card-box" style={{ padding: '16px 12px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div
              className={`nav-item ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'basic' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'basic' ? '#009698' : 'transparent' }}
            >
              <span>👤</span> Basic Info
            </div>
            <div
              className={`nav-item ${activeTab === 'pref' ? 'active' : ''}`}
              onClick={() => setActiveTab('pref')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'pref' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'pref' ? '#009698' : 'transparent' }}
            >
              <span>💼</span> Job Preferences
            </div>
            <div
              className={`nav-item ${activeTab === 'exp' ? 'active' : ''}`}
              onClick={() => setActiveTab('exp')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'exp' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'exp' ? '#009698' : 'transparent' }}
            >
              <span>📈</span> Working Experience
            </div>
            <div
              className={`nav-item ${activeTab === 'edu' ? 'active' : ''}`}
              onClick={() => setActiveTab('edu')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'edu' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'edu' ? '#009698' : 'transparent' }}
            >
              <span>🎓</span> Education
            </div>
            <div
              className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'skills' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'skills' ? '#009698' : 'transparent' }}
            >
              <span>🛠️</span> Skills
            </div>
            <div
              className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'summary' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'summary' ? '#009698' : 'transparent' }}
            >
              <span>📝</span> Summary
            </div>
            <div
              className={`nav-item ${activeTab === 'resume' ? 'active' : ''}`}
              onClick={() => setActiveTab('resume')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'resume' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'resume' ? '#009698' : 'transparent' }}
            >
              <span>📄</span> Resume
            </div>
            <div
              className={`nav-item ${activeTab === 'links' ? 'active' : ''}`}
              onClick={() => setActiveTab('links')}
              style={{ padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: activeTab === 'links' ? '#ffffff' : '#4b5563', backgroundColor: activeTab === 'links' ? '#009698' : 'transparent' }}
            >
              <span>🔗</span> Links
            </div>
          </div>

          {/* Uploaded Resume Sidebar Panel */}
          {defaultResume ? (
            <div style={{ padding: '24px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #009698', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#009698', display: 'block', marginBottom: '12px' }}>Uploaded Resume</span>
              
              <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', marginBottom: '16px' }}></div>
              
              {/* Filename Box with Default Badge */}
              <div style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '12px', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>{defaultResume}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#16a34a', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', padding: '1px 8px', borderRadius: '10px', lineHeight: '1.2' }}>Default</span>
              </div>

              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '16px', fontWeight: '500' }}>Uploaded 24/06/2026</span>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'center' }}>
                <button
                  type="button"
                  style={{ flex: 'none', width: '220px', height: '40px', fontSize: '13px', fontWeight: '700', borderRadius: '20px', border: '1px solid #009698', color: '#009698', backgroundColor: '#ffffff', cursor: 'pointer' }}
                >
                  View
                </button>
                <button
                  type="button"
                  className="action-btn-continue"
                  onClick={() => {
                    const next = [...resumes];
                    next[defaultResumeIdx] = 'amirkhanresume.pdf';
                    setResumes(next);
                  }}
                  style={{ flex: 'none', width: '220px', height: '40px', fontSize: '13px', fontWeight: '700', borderRadius: '20px', border: 'none', color: '#ffffff', backgroundColor: '#009698', cursor: 'pointer' }}
                >
                  Re-upload
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '24px 20px', backgroundColor: '#ffffff', borderRadius: '20px', border: '2px dashed #009698', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#009698', display: 'block', marginBottom: '12px' }}>Attached Resume</span>
              
              <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', marginBottom: '16px' }}></div>
              
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#009698', display: 'block', marginBottom: '16px' }}>
                Drag & Drop your resume <span style={{ color: '#94a3b8', fontWeight: '500' }}>or</span>
              </span>

              {/* Upload Cloud SVG Icon */}
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" style={{ color: '#009698' }}>
                  <path d="M12 16V9M12 9L9 12M12 9L15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 15C3 17.8 5.2 20 8 20H16C18.8 20 21 17.8 21 15C21 12.6 19.3 10.6 17 10.1C16.8 6.6 13.9 4 10.5 4C7.4 4 4.8 5.8 4.2 8.5C3.5 9.1 3 10 3 11C3 11.5 3.1 12 3.3 12.5C3.1 13.3 3 14.1 3 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <button
                type="button"
                className="action-btn-continue"
                onClick={() => {
                  const next = [...resumes];
                  if (next.length === 0) {
                    next.push('amirkhanresume.pdf');
                  } else {
                    next[0] = 'amirkhanresume.pdf';
                  }
                  setResumes(next);
                }}
                style={{ flex: 'none', width: '220px', height: '40px', fontSize: '13px', fontWeight: '700', borderRadius: '20px', border: 'none', color: '#ffffff', backgroundColor: '#009698', cursor: 'pointer', marginBottom: '16px' }}
              >
                Upload Resume
              </button>

              <p style={{ fontSize: '10px', color: '#94a3b8', margin: 0, lineHeight: '1.5', fontWeight: '600' }}>
                Support file type:<br />
                .pdf, .doc, .docx (10MB max)
              </p>
            </div>
          )}
        </aside>

        {/* Right Dashboard Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate('/')}
              style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: '800' }}
            >
              ←
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Basic Information</h1>
          </div>

          {/* Card 1: Progress Story */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Complete your professional story</span>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '24px' }}>The more details you share, the better matched jobs you will receive.</span>
            
            {/* Progress Bar */}
            <div style={{ position: 'relative', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginBottom: '32px' }}>
              <div style={{ width: '75%', height: '100%', backgroundColor: '#009698', borderRadius: '4px' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span style={{ color: '#009698' }}>75%</span>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Card 2: Collect Badges */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'block', marginBottom: '20px' }}>Collect Badges</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              
              {/* Badge 1 */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', position: 'relative', backgroundColor: '#f8fafc' }}>
                <span style={{ position: 'absolute', top: '12px', right: '12px', color: '#009698', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Badge 1</span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>Complete Job Preferences</span>
              </div>

              {/* Badge 2 */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', position: 'relative', opacity: 0.6 }}>
                <span style={{ position: 'absolute', top: '12px', right: '12px', color: '#94a3b8', fontSize: '14px' }}>○</span>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>💼</div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>Badge 2</span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>Complete Working Experience</span>
              </div>

              {/* Badge 3 */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', position: 'relative', backgroundColor: '#f8fafc' }}>
                <span style={{ position: 'absolute', top: '12px', right: '12px', color: '#009698', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📷</div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Badge 3</span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>Upload Profile Photo</span>
              </div>

              {/* Badge 4 */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', position: 'relative', backgroundColor: '#f8fafc' }}>
                <span style={{ position: 'absolute', top: '12px', right: '12px', color: '#009698', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📞</div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Badge 4</span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>Update Phone Number</span>
              </div>

            </div>
          </div>

          {/* Join Job Bonanza Card */}
          <div className="card-box" style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            borderRadius: '16px',
            border: 'none',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            gap: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1, flex: 1 }}>
              <span style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(4px)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}>🚀 EXCLUSIVE EVENT</span>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                Join Job Bonanza Event
              </h2>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.95 }}>
                Get instant profile highlights, priority recruitment matching, and win exclusive prizes!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowJobbonanzaPosting(true)}
              style={{
                zIndex: 1,
                backgroundColor: '#ffffff',
                color: '#6366f1',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s ease',
                whiteSpace: 'nowrap',
                marginLeft: 'auto'
              }}
            >
              Join Now 🔥
            </button>
          </div>

          {/* Card 3: Basic Info Panel */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>Basic Info</span>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>jobseekertest01</span>
                <div className="user-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '12px', backgroundColor: '#ffedd5', color: '#ea580c', fontWeight: '800', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>JS</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>👤 Full Name</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>jobseekertest01</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>📞 Phone Number</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>0127776262 / 0127776263</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>💼 Work Experience</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>-</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>📅 Date of Birth</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>04/12/2026</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>⌛ Earliest Availability</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Within 1 Month</span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>📍 Location</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Batu Caves, Selangor, Malaysia</span>
              </div>

            </div>
          </div>

          {/* Card 4: Job Preferences */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Job Preferences</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>+</button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>
            <div style={{ position: 'relative', paddingRight: '40px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#009698', display: 'block', marginBottom: '4px' }}>graphic designer, 0.005</span>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500' }}>Part-time | Kedah, Sabah, Melaka | RM300 - 450 (Monthly)</span>
              <button type="button" style={{ position: 'absolute', right: '0', bottom: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
            </div>
          </div>

          {/* Card 5: Working Experience */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Working Experience</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>-</button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>
            <div style={{ position: 'relative', paddingRight: '40px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>No experience added.</span>
              <button type="button" style={{ position: 'absolute', right: '0', bottom: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
            </div>
          </div>

          {/* Card 6: Education */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Education</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>+</button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>
            <div style={{ position: 'relative', paddingRight: '40px' }}>
              <span style={{ fontSize: '12px', color: '#334155', fontWeight: '700', display: 'block' }}>Diploma | exxode | graduated 01/11/2016 - 02/04/2021</span>
              <button type="button" style={{ position: 'absolute', right: '0', bottom: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
            </div>
          </div>

          {/* Card 7: Skills */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Skills</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>+</button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>
            <div style={{ position: 'relative', paddingRight: '40px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <span className="benefit-selected-tag">Sales Pipeline - Intermediate <span style={{ cursor: 'pointer', marginLeft: '6px' }}>✕</span></span>
                <span className="benefit-selected-tag">English Language - Intermediate <span style={{ cursor: 'pointer', marginLeft: '6px' }}>✕</span></span>
                <span className="benefit-selected-tag">Budgeting - Intermediate <span style={{ cursor: 'pointer', marginLeft: '6px' }}>✕</span></span>
              </div>
              <button type="button" style={{ position: 'absolute', right: '0', bottom: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
            </div>
          </div>

          {/* Card 8: Summary */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Summary</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>+</button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>
            <div style={{ position: 'relative', paddingRight: '40px' }}>
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '6px', fontWeight: '500' }}>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
                <span>summary of jobseekertest01</span>
              </div>
              <button type="button" style={{ position: 'absolute', right: '0', bottom: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>✏️</button>
            </div>
          </div>

          {/* Card 9: Resume */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Resume</span>
                <span style={{ color: '#009698', fontSize: '11px', fontWeight: '500' }}>(Upload your document in PDF, DOC, or DOCX format - Max 3)</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    if (resumes.length < 3) {
                      setResumes([...resumes, '']);
                    }
                  }}
                  disabled={resumes.length >= 3}
                  style={{ background: 'none', border: 'none', cursor: resumes.length < 3 ? 'pointer' : 'not-allowed', color: resumes.length < 3 ? '#009698' : '#94a3b8', fontSize: '18px', fontWeight: 'bold' }}
                  title="Add Resume (Max 3)"
                >
                  +
                </button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {resumes.map((resume, idx) => {
                const isDefault = defaultResumeIdx === idx;
                
                return (
                  <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
                    {resume ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1, minWidth: 0, height: '40px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 16px', boxSizing: 'border-box' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{resume}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                          <span style={{ fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap' }}>Uploaded 24/06/2026</span>
                          {isDefault ? (
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', padding: '2px 12px', borderRadius: '12px', lineHeight: '1.2', whiteSpace: 'nowrap' }}>Default</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const itemToMove = resumes[idx];
                                const rest = resumes.filter((_, i) => i !== idx);
                                setResumes([itemToMove, ...rest]);
                                setDefaultResumeIdx(0);
                              }}
                              style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 10px', borderRadius: '12px', lineHeight: '1.2', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              Make Default
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Upload Resume"
                        disabled
                        className="input-field"
                        style={{ flex: 1, minWidth: 0, height: '40px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 16px', color: '#94a3b8', fontSize: '13px' }}
                      />
                    )}
                    
                    {resume && (
                      <button
                        type="button"
                        className="my-company-outline-btn"
                        style={{ flex: 'none', height: '40px', padding: '0 24px', border: '1px solid #009698', color: '#009698', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '700', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        View
                      </button>
                    )}

                    <button
                      type="button"
                      className="action-btn-continue"
                      onClick={() => {
                        const next = [...resumes];
                        next[idx] = `amirkhanresume_${idx + 1}.pdf`;
                        setResumes(next);
                      }}
                      style={{ flex: 'none', height: '40px', padding: '0 24px', border: 'none', color: '#ffffff', backgroundColor: '#009698', fontSize: '13px', fontWeight: '700', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {resume ? 'Change Resume' : 'Upload Resume'}
                    </button>

                    {(resume || resumes.length > 1) && (
                      <button
                        type="button"
                        style={{ flex: 'none', background: 'none', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                        onClick={() => {
                          const next = resumes.filter((_, i) => i !== idx);
                          // If we deleted the default, reset default to the first available slot
                          if (defaultResumeIdx === idx) {
                            setDefaultResumeIdx(0);
                          } else if (defaultResumeIdx > idx) {
                            setDefaultResumeIdx(defaultResumeIdx - 1);
                          }
                          // Always keep at least 1 slot
                          setResumes(next.length === 0 ? [''] : next);
                        }}
                        title="Delete Slot"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 10: Links */}
          <div className="card-box" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Links</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>+</button>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '16px' }}>^</button>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px' }}>
                <a href="https://test.com" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#009698', fontWeight: '700', textDecoration: 'none' }}>test.com</a>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 16px', borderRadius: '8px' }}>
                <a href="https://daudaud.com" target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#009698', fontWeight: '700', textDecoration: 'none' }}>daudaud.com</a>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>✏️</button>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '60px 40px 30px', fontSize: '12px', borderTop: '1px solid #1e293b', marginTop: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1.2fr 1.2fr', gap: '48px', maxWidth: '1400px', margin: '0 auto 40px' }}>
          <div>
            <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '20px', display: 'block', marginBottom: '14px' }}>JobGiga</span>
            <span style={{ fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '6px', fontSize: '12px' }}>JOBGIGA SDN BHD - (202501055580 (1656986-T))</span>
            <span style={{ color: '#009698', fontWeight: '700', display: 'block', marginBottom: '20px', fontSize: '12px' }}>Smart Hiring, Starts Here</span>
            <p style={{ lineHeight: '1.8', margin: 0, color: '#94a3b8', fontSize: '12px', fontWeight: '500' }}>
              11, Jalan HP 1/1,<br />
              Taman Industri Harami Perdana,<br />
              47120 Puchong, Selangor
            </p>
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: '700', display: 'block', marginBottom: '16px', fontSize: '12px', letterSpacing: '0.5px' }}>EMPLOYER</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Become a Recruiter</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Become a Partner</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Find Talent</span>
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: '700', display: 'block', marginBottom: '16px', fontSize: '12px', letterSpacing: '0.5px' }}>JOB SEEKER</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Become a Job Seeker</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Find a Job</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Companies</span>
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: '700', display: 'block', marginBottom: '16px', fontSize: '12px', letterSpacing: '0.5px' }}>ABOUT</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>About JobGiga</span>
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: '700', display: 'block', marginBottom: '16px', fontSize: '12px', letterSpacing: '0.5px' }}>LEGAL</span>
            <span style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontWeight: '500' }}>Privacy Policy</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #334155', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto', color: '#64748b', fontWeight: '500' }}>
          <span>© 2026 JobGiga Sdn Bhd. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '20px', fontSize: '16px' }}>
            <span style={{ cursor: 'pointer' }}>📘</span>
            <span style={{ cursor: 'pointer' }}>📸</span>
            <span style={{ cursor: 'pointer' }}>🐦</span>
            <span style={{ cursor: 'pointer' }}>🎥</span>
          </div>
        </div>
      </footer>

      {/* Jobbonanza Job Posting Modal */}
      {showJobbonanzaPosting && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            padding: '32px'
          }}>
            <button
              onClick={() => setShowJobbonanzaPosting(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                color: '#64748b'
              }}
            >
              ✕
            </button>

            {/* Header Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 50%, #ff8c00 100%)',
              borderRadius: '16px',
              padding: '24px',
              color: '#ffffff',
              marginBottom: '24px',
              boxShadow: '0 10px 20px rgba(255, 75, 43, 0.25)'
            }}>
              <span style={{
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                display: 'inline-block',
                marginBottom: '8px'
              }}>🎉 JOBBONANZA JOB POSTING</span>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: 800 }}>
                Senior UI/UX Designer & Frontend Lead
              </h2>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.95 }}>
                JobGiga Tech Ltd • Full-Time • Remote / Hybrid (Kuala Lumpur)
              </p>
            </div>

            {/* Job Details Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>💰 Salary</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#009698' }}>RM6,500 - RM9,500</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>⏳ Experience</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>3+ Years</span>
                </div>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'block' }}>🔥 Applicants</span>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#ea580c' }}>48 Applicants</span>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Job Description</h4>
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                  We are looking for a passionate Senior UI/UX Designer & Frontend Lead to craft stunning user experiences for our next-gen recruitment platform. You will work directly with our product team to design and build responsive web applications.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Key Responsibilities</h4>
                <ul style={{ fontSize: '13px', color: '#475569', paddingLeft: '20px', margin: 0, lineHeight: '1.6' }}>
                  <li>Design intuitive user workflows and high-fidelity interactive wireframes.</li>
                  <li>Build dynamic React components using standard CSS and modern TypeScript.</li>
                  <li>Collaborate with HR managers to optimize job posting conversions.</li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>Exclusive Jobbonanza Perks</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>⚡ Fast-Track Interview</span>
                  <span style={{ backgroundColor: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>🎁 RM500 Sign-on Bonus</span>
                  <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>💼 100% Remote Option</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  onClick={() => setShowJobbonanzaPosting(false)}
                  style={{
                    flex: 1,
                    height: '44px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Application Submitted Successfully!');
                    setShowJobbonanzaPosting(false);
                  }}
                  style={{
                    flex: 2,
                    height: '44px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 75, 43, 0.4)'
                  }}
                >
                  Apply Now ⚡
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
