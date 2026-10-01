import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AIReportPage() {
  const navigate = useNavigate();

  // Modal and state variables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('Job Post Report');
  const [selectedPeriod, setSelectedPeriod] = useState<'this_month' | 'last_month' | 'last_6_months' | 'last_year'>('this_month');
  const [selectedJob, setSelectedJob] = useState<'all' | 'graphic_designer' | 'hr_manager'>('all');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Sample data for the table
  const generatedReports: Array<{
    id: number;
    type: string;
    period: string;
    generated: string;
    status: string;
  }> = [];

  const handleOpenModal = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsModalOpen(true);
  };

  return (
    <div className="jobgiga-dashboard">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="logo-container">
          <div className="logo-icon-svg">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="#009698" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">JobGiga</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group">
            <span className="group-label">Main</span>
            <div className="nav-item">
              <span className="nav-icon-svg">📊</span>
              <span>Dashboard</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Recruitment</span>
            <div className="nav-item">
              <span className="nav-icon-svg">💼</span>
              <span>Manage Jobs</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">👥</span>
              <span>Applicants</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">🗓️</span>
              <span>Interview</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">🔍</span>
              <span>Search Talent</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Communication</span>
            <div className="nav-item">
              <span className="nav-icon-svg">💬</span>
              <span>ChatGiga</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Management</span>
            <div className="nav-item">
              <span className="nav-icon-svg">👤</span>
              <span>Employees</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">📄</span>
              <span>Forms</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Growth</span>
            <div className="nav-item active">
              <span className="nav-icon-svg">📈</span>
              <span>Analytics</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">📢</span>
              <span>Ads Management</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">🏷️</span>
              <span>Pricing</span>
            </div>
            <div className="nav-item">
              <span className="nav-icon-svg">💳</span>
              <span>Billing</span>
            </div>
          </div>

          <div className="nav-group">
            <span className="group-label">Support</span>
            <div className="nav-item">
              <span className="nav-icon-svg">🎧</span>
              <span>Support</span>
            </div>
          </div>
        </nav>

        {/* Sidebar Ad Card */}
        <div className="sidebar-ad-card">
          <div className="ad-illustration">
            <span className="ad-badge-text">Jobs/Company Ads</span>
          </div>
          <button className="ad-btn-action">Try Now for Free!</button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-panel">
        {/* Top Navbar */}
        <header className="navbar">
          <div className="nav-left">
            <button className="sidebar-toggle-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="company-select-badge">
              <div className="company-avatar-img">
                <img src="https://api.iconify.design/lucide:building-2.svg" alt="" width="16" />
              </div>
              <span className="company-name-text">companytestC1</span>
              <span className="caret-icon">ˆ</span>
            </div>

            <button className="my-company-outline-btn">
              <span className="icon-building">🏢</span> My Company
            </button>
          </div>

          <div className="nav-right">
            <button className="icon-circle-btn">
              🔔
              <span className="dot-notification"></span>
            </button>
            
            <button className="gigapremium-btn">GigaPremium</button>
            
            <div className="lang-dropdown">
              <span className="flag-icon">🇺🇸</span>
              <span>EN</span>
              <span className="caret-icon">ˆ</span>
            </div>
            
            <div className="user-profile-block">
              <div className="user-text">
                <span className="user-handle">emp-mudd-01</span>
                <span className="user-title">HR Manager</span>
              </div>
              <div className="user-avatar-circle">
                <span>m</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="content-container">
          {/* Header Title with Back Arrow */}
          <div className="content-header-title">
            <button className="back-arrow-circle" onClick={() => navigate('/')}>
              ←
            </button>
            <h1>Analytics</h1>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <div style={{ padding: '12px 4px', cursor: 'pointer', color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Overview</div>
            <div style={{ padding: '12px 4px', cursor: 'pointer', color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Jobs</div>
            <div style={{ padding: '12px 4px', cursor: 'pointer', color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>Interviews</div>
            <div style={{ padding: '12px 4px', cursor: 'pointer', color: '#009698', fontSize: '15px', fontWeight: 600, borderBottom: '2.5px solid #009698', marginBottom: '-1px' }}>Reports</div>
          </div>

          {/* 4 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            {/* 1. Job Post Report */}
            <div style={{
              background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
              border: '1px solid #c8e6c9',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '230px',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Job Post Report</h3>
                  <div style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '6px', borderRadius: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                  View, applications, sourcing reach, and funnel performance for this organization's jobs.
                </p>
              </div>
              <button 
                onClick={() => handleOpenModal('Job Post Report')}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #009698',
                  color: '#009698',
                  borderRadius: '8px',
                  padding: '10px 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Generate
              </button>
            </div>

            {/* 2. Talent Report */}
            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
              border: '1px solid #bae6fd',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '230px',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Talent Report</h3>
                  <div style={{ color: '#0284c7', backgroundColor: '#e0f2fe', padding: '6px', borderRadius: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                  Match-score quality distribution for applicants to this organization's jobs only.
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#009698', fontWeight: 600 }}>
                  Scoped to applicants of your own job posts only
                </p>
              </div>
              <button 
                onClick={() => handleOpenModal('Talent Report')}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #009698',
                  color: '#009698',
                  borderRadius: '8px',
                  padding: '10px 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Generate
              </button>
            </div>

            {/* 3. Interview Report */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)',
              border: '1px solid #fde68a',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '230px',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Interview Report</h3>
                  <div style={{ color: '#d97706', backgroundColor: '#fef3c7', padding: '6px', borderRadius: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                  Interview scheduling, outcomes, peak hours, and candidate response time for this organization.
                </p>
              </div>
              <button 
                onClick={() => handleOpenModal('Interview Report')}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #009698',
                  color: '#009698',
                  borderRadius: '8px',
                  padding: '10px 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Generate
              </button>
            </div>

            {/* 4. Subscription / Usage Report */}
            <div style={{
              background: 'linear-gradient(135deg, #f3e8ff 0%, #ffffff 100%)',
              border: '1px solid #e9d5ff',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '230px',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Subscription / Usage Report</h3>
                  <div style={{ color: '#7c3aed', backgroundColor: '#f3e8ff', padding: '6px', borderRadius: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: '1.5' }}>
                  Plan utilization and spend for this organization. Not yet available in Analytics.
                </p>
              </div>
              <button 
                onClick={() => handleOpenModal('Subscription / Usage Report')}
                style={{
                  marginTop: '20px',
                  width: '100%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #009698',
                  color: '#009698',
                  borderRadius: '8px',
                  padding: '10px 0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Generate
              </button>
            </div>
          </div>

          {/* Generated Reports Section */}
          <div className="card-box" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: '0 0 20px 0' }}>Generated Reports</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Type</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Period</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Generated</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4b5563', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ color: '#9ca3af', marginBottom: '12px' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                          </div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#4b5563' }}>No reports generated yet</h3>
                          <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Click "Generate" on any report type above to create a new report.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    generatedReports.map((report, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                          {report.type}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                          {report.period}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', color: '#4b5563' }}>
                          {report.generated}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            backgroundColor: '#ccfbf1',
                            color: '#0d9488',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {report.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '16px', alignItems: 'center', color: '#009698' }}>
                            <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#009698' }} title="View">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#009698' }} title="Download">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '90%',
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                fontSize: '20px',
                padding: 0
              }}
            >
              ✕
            </button>

            {/* Title block */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ backgroundColor: '#e6f4f4', color: '#009698', padding: '12px', borderRadius: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                  Generate {selectedReportType}
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Choose a reporting period, then generate.
                </p>
              </div>
            </div>

            {/* Reporting Period Option */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '10px' }}>
                Reporting period
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedPeriod('this_month')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedPeriod === 'this_month' ? '#e6f4f4' : '#ffffff',
                    border: selectedPeriod === 'this_month' ? '1px solid #009698' : '1px solid #d1d5db',
                    color: selectedPeriod === 'this_month' ? '#009698' : '#4b5563'
                  }}
                >
                  This month
                </button>
                <button
                  onClick={() => setSelectedPeriod('last_month')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedPeriod === 'last_month' ? '#e6f4f4' : '#ffffff',
                    border: selectedPeriod === 'last_month' ? '1px solid #009698' : '1px solid #d1d5db',
                    color: selectedPeriod === 'last_month' ? '#009698' : '#4b5563'
                  }}
                >
                  Last month
                </button>
                <button
                  onClick={() => setSelectedPeriod('last_6_months')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedPeriod === 'last_6_months' ? '#e6f4f4' : '#ffffff',
                    border: selectedPeriod === 'last_6_months' ? '1px solid #009698' : '1px solid #d1d5db',
                    color: selectedPeriod === 'last_6_months' ? '#009698' : '#4b5563'
                  }}
                >
                  Last 6 months
                </button>
                <button
                  onClick={() => setSelectedPeriod('last_year')}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedPeriod === 'last_year' ? '#e6f4f4' : '#ffffff',
                    border: selectedPeriod === 'last_year' ? '1px solid #009698' : '1px solid #d1d5db',
                    color: selectedPeriod === 'last_year' ? '#009698' : '#4b5563'
                  }}
                >
                  Last year
                </button>
              </div>
            </div>

            {/* Filter by Job Posting Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#4b5563', marginBottom: '8px' }}>
                Filter by job posting
              </label>
              <div className="select-wrapper">
                <select
                  value={selectedJob}
                  onChange={(e: any) => setSelectedJob(e.target.value)}
                  className="select-field"
                  style={{ width: '100%' }}
                >
                  <option value="all">All</option>
                  <option value="graphic_designer">Graphic Designer</option>
                  <option value="hr_manager">HR Manager</option>
                </select>
              </div>
            </div>

            {/* Checkbox box */}
            <div style={{
              border: '1px dashed #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginBottom: '24px'
            }}>
              <input
                type="checkbox"
                id="simulate-failure"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                style={{
                  accentColor: '#009698',
                  width: '16px',
                  height: '16px',
                  marginTop: '2px',
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="simulate-failure"
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  lineHeight: '1.5',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Mockup only: simulate an AI enrichment failure (UC-JG-187 — deterministic sections still render)
              </label>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  color: '#111827',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#009698',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Generate Report
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
