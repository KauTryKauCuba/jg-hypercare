import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



const BENEFITS_LIST = [
  "Childcare",
  "Dependent Care",
  "Flexible Hours",
  "Travel Concierge",
  "Work From Home",
  "Bereavement Leave",
  "Birthday Leave",
  "Compassionate Leave",
  "Maternity & Paternity Leave",
  "Military Leave",
  "Parental Leave",
  "Sabbatical",
  "Sick Leave",
  "Solo Parent Leave",
  "Special Leave For Women",
  "Unpaid Extended Leave",
  "Vacation Leave",
  "Wedding Leave"
];



export default function BenefitsPage() {
  const navigate = useNavigate();

  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [workArrangement, setWorkArrangement] = useState<'onsite' | 'hybrid' | 'remote'>('onsite');
  const [jobType, setJobType] = useState<'fulltime' | 'parttime' | 'contract' | 'temporary' | 'internship' | 'freelance'>('fulltime');
  const [workLocation, setWorkLocation] = useState<'company' | 'custom'>('company');

  const [country, setCountry] = useState('Malaysia');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('Rohrendorf bei Krems');
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('147 Catalyst Aveaaaa');

  const [eligibility, setEligibility] = useState<'malaysian' | 'passholder' | 'foreigner'>('malaysian');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');

  const [urgent, setUrgent] = useState(false);

  // Right column states
  const [showSalary, setShowSalary] = useState(false);
  const [currency, setCurrency] = useState('');
  const [salaryFrom, setSalaryFrom] = useState('0');
  const [salaryTo, setSalaryTo] = useState('0');
  const [salaryType, setSalaryType] = useState('');

  const [jobDescription, setJobDescription] = useState('');

  // Benefits states
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>([]);
  const [tempSelectedBenefits, setTempSelectedBenefits] = useState<string[]>([]);
  const [benefitSearchQuery, setBenefitSearchQuery] = useState('');
  const [newCustomBenefit, setNewCustomBenefit] = useState('');

  useEffect(() => {
    if (isBenefitsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isBenefitsModalOpen]);


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
            <div className="nav-item active">
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
            <div className="nav-item">
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
          <div className="content-header-title">
            <button className="back-arrow-circle" onClick={() => navigate('/')}>
              ←
            </button>
            <h1>Post A Job</h1>
          </div>

          <div className="post-job-grid">
            {/* Left Column */}
            <div className="form-column-left">
              <div className="card-box">
                <h2 className="main-form-title">Post a job</h2>
                <p className="form-notice-desc">
                  The Job Title should match the selected Job Function. Otherwise, your job posting may not be approved.
                </p>

                <h3 className="section-header-title">Job Basic Information</h3>

                {/* Job Title */}
                <div className="form-group-item">
                  <label className="label-req">Job Title</label>
                  <input
                    type="text"
                    placeholder="Enter Job Title"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Work Arrangement */}
                <div className="form-group-item">
                  <label className="label-req">Work Arrangement</label>
                  <div className="btn-options-row">
                    <button
                      type="button"
                      className={`pill-btn ${workArrangement === 'onsite' ? 'active' : ''}`}
                      onClick={() => setWorkArrangement('onsite')}
                    >
                      On-Site
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${workArrangement === 'hybrid' ? 'active' : ''}`}
                      onClick={() => setWorkArrangement('hybrid')}
                    >
                      Hybrid
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${workArrangement === 'remote' ? 'active' : ''}`}
                      onClick={() => setWorkArrangement('remote')}
                    >
                      Remote
                    </button>
                  </div>
                </div>

                {/* Job Type */}
                <div className="form-group-item">
                  <label className="label-req">Job Type</label>
                  <div className="btn-options-grid-3x2">
                    <button
                      type="button"
                      className={`pill-btn ${jobType === 'fulltime' ? 'active' : ''}`}
                      onClick={() => setJobType('fulltime')}
                    >
                      Full Time
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${jobType === 'parttime' ? 'active' : ''}`}
                      onClick={() => setJobType('parttime')}
                    >
                      Part-Time
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${jobType === 'contract' ? 'active' : ''}`}
                      onClick={() => setJobType('contract')}
                    >
                      Contract
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${jobType === 'temporary' ? 'active' : ''}`}
                      onClick={() => setJobType('temporary')}
                    >
                      Temporary
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${jobType === 'internship' ? 'active' : ''}`}
                      onClick={() => setJobType('internship')}
                    >
                      Internship
                    </button>
                    <button
                      type="button"
                      className={`pill-btn ${jobType === 'freelance' ? 'active' : ''}`}
                      onClick={() => setJobType('freelance')}
                    >
                      Freelance
                    </button>
                  </div>
                </div>

                {/* Work Location */}
                <div className="form-group-item">
                  <label>Work Location</label>
                  <div className="btn-options-row-2">
                    <button
                      type="button"
                      className={`pill-btn full-flex ${workLocation === 'company' ? 'active' : ''}`}
                      onClick={() => setWorkLocation('company')}
                    >
                      Company's Address
                    </button>
                    <button
                      type="button"
                      className={`pill-btn full-flex ${workLocation === 'custom' ? 'active' : ''}`}
                      onClick={() => setWorkLocation('custom')}
                    >
                      Custom Address
                    </button>
                  </div>
                </div>

                {/* Country and State */}
                <div className="form-row-2col">
                  <div className="form-group-item flex-1">
                    <label className="label-req">Country</label>
                    <div className="select-wrapper">
                      <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="select-field"
                      >
                        <option value="Malaysia">Malaysia</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group-item flex-1">
                    <label className="label-req">State</label>
                    <div className="select-wrapper">
                      <select
                        value={stateVal}
                        onChange={(e) => setStateVal(e.target.value)}
                        className="select-field"
                      >
                        <option value=""></option>
                        <option value="Kuala Lumpur">Kuala Lumpur</option>
                        <option value="Selangor">Selangor</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* City and Postcode */}
                <div className="form-row-2col">
                  <div className="form-group-item flex-1">
                    <label className="label-req">City</label>
                    <div className="select-wrapper">
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="select-field"
                      >
                        <option value="Rohrendorf bei Krems">Rohrendorf bei Krems</option>
                        <option value="Kuala Lumpur">Kuala Lumpur</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group-item flex-1">
                    <label>Postcode</label>
                    <div className="select-wrapper">
                      <select
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="select-field placeholder-select"
                      >
                        <option value="">Select Postcode</option>
                        <option value="50000">50000</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="form-group-item">
                  <label className="label-req">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field"
                  />
                </div>

                {/* Language Requirements */}
                <div className="form-group-item">
                  <label>Language Requirements <span className="opt-span">(optional)</span></label>
                  <button type="button" className="add-teal-btn">
                    <span className="circle-plus">+</span> Add
                  </button>
                </div>

                {/* Benefits */}
                <div className="form-group-item">
                  <label>Benefits <span className="opt-span">(optional)</span></label>
                  {selectedBenefits.length > 0 && (
                    <div className="selected-questions-list" style={{ marginTop: '8px' }}>
                      {selectedBenefits.map((b, idx) => (
                        <span key={idx} className="selected-question-tag">{b}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-12">
                    <button
                      type="button"
                      className="add-teal-btn"
                      onClick={() => {
                        setTempSelectedBenefits(selectedBenefits);
                        setIsBenefitsModalOpen(true);
                      }}
                    >
                      <span className="circle-plus">+</span> Add
                    </button>
                  </div>
                </div>

                {/* Work Eligibility */}
                <div className="form-group-item">
                  <label className="label-req">Work Eligibility</label>
                  <div className="radio-options-row">
                    <label className="custom-radio-label">
                      <input
                        type="radio"
                        name="eligibility"
                        checked={eligibility === 'malaysian'}
                        onChange={() => setEligibility('malaysian')}
                      />
                      <span className="radio-text">Malaysian</span>
                    </label>
                    <label className="custom-radio-label">
                      <input
                        type="radio"
                        name="eligibility"
                        checked={eligibility === 'passholder'}
                        onChange={() => setEligibility('passholder')}
                      />
                      <span className="radio-text">Passholder - EP/TEP/PV/DP/RP-T/Others</span>
                    </label>
                    <label className="custom-radio-label">
                      <input
                        type="radio"
                        name="eligibility"
                        checked={eligibility === 'foreigner'}
                        onChange={() => setEligibility('foreigner')}
                      />
                      <span className="radio-text">Foreigner</span>
                    </label>
                  </div>
                </div>

                {/* Qualification / Experience */}
                <div className="form-row-2col">
                  <div className="form-group-item flex-1">
                    <label className="label-req">Qualification / Years of Experience</label>
                    <div className="select-wrapper">
                      <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="select-field placeholder-select"
                      >
                        <option value="">Select Education</option>
                        <option value="bachelor">Bachelor's Degree</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group-item flex-1">
                    <label>&nbsp;</label>
                    <div className="select-wrapper">
                      <select
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="select-field placeholder-select"
                      >
                        <option value="">Select Experience</option>
                        <option value="1">1 Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Urgent Recruitment */}
                <div className="urgent-row-container">
                  <span className="urgent-label-text">
                    Does this job require urgent recruitment? <span className="lock-icon">🔒</span>
                  </span>
                  <div className="toggle-switch-group">
                    <span className="toggle-text-label">{urgent ? 'Yes' : 'No'}</span>
                    <button
                      type="button"
                      className={`custom-switch-btn ${urgent ? 'active' : ''}`}
                      onClick={() => setUrgent(!urgent)}
                    >
                      <span className="switch-knob"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="form-column-right">
              {/* Salary Range Card */}
              <div className="card-box">
                <div className="salary-card-header">
                  <span className="card-sub-heading">Salary Range</span>
                  <div className="salary-toggle-right">
                    <span>Show Salary</span>
                    <span className="toggle-text-label small">{showSalary ? 'Show' : 'Hide'}</span>
                    <button
                      type="button"
                      className={`custom-switch-btn small ${showSalary ? 'active' : ''}`}
                      onClick={() => setShowSalary(!showSalary)}
                    >
                      <span className="switch-knob small"></span>
                    </button>
                  </div>
                </div>

                <div className="salary-fields-row">
                  <div className="field-col flex-1">
                    <label>Currency</label>
                    <div className="select-wrapper">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="select-field placeholder-select"
                      >
                        <option value="">Select Currency</option>
                        <option value="MYR">MYR</option>
                      </select>
                    </div>
                  </div>
                  <div className="field-col flex-1">
                    <label>From</label>
                    <div className="prefix-input-box">
                      <span className="prefix-tag">RM</span>
                      <input
                        type="text"
                        value={salaryFrom}
                        onChange={(e) => setSalaryFrom(e.target.value)}
                        className="input-field with-prefix"
                      />
                    </div>
                  </div>
                  <div className="field-col flex-1">
                    <label>To</label>
                    <div className="prefix-input-box">
                      <span className="prefix-tag">RM</span>
                      <input
                        type="text"
                        value={salaryTo}
                        onChange={(e) => setSalaryTo(e.target.value)}
                        className="input-field with-prefix"
                      />
                    </div>
                  </div>
                  <div className="field-col flex-1">
                    <label>Type</label>
                    <div className="select-wrapper">
                      <select
                        value={salaryType}
                        onChange={(e) => setSalaryType(e.target.value)}
                        className="select-field placeholder-select"
                      >
                        <option value="">Select Type</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI Salary Banner */}
                <div className="ai-banner-teal">
                  <div className="ai-banner-left">
                    <span className="sparkle-icon">✨</span>
                    <span className="ai-banner-title">AI Recommended Salary Range</span>
                  </div>
                  <button type="button" className="ai-btn-teal-outline">
                    <span className="wand-icon">%</span> Use AI Suggestion (1/9)
                  </button>
                </div>
              </div>

              {/* Skills Required Card */}
              <div className="card-box mt-16">
                <span className="card-sub-heading">Skills Required <span className="opt-span">(optional)</span></span>
                <div className="mt-12">
                  <button type="button" className="add-teal-btn">
                    <span className="circle-plus">+</span> Add
                  </button>
                </div>
              </div>

              {/* Customized pre-screening Card */}
              <div className="card-box mt-16">
                <span className="card-sub-heading">Customized pre-screening <span className="opt-span">(optional)</span></span>
                <div className="mt-12">
                  <button type="button" className="add-teal-btn">
                    <span className="circle-plus">+</span> Add
                  </button>
                </div>
              </div>

              {/* Job Description Card */}
              <div className="card-box mt-16">
                <label className="label-req font-semibold">Job Description</label>
                <div className="rich-editor-box">
                  <textarea
                    placeholder="Write a clear job description with key responsibilities, requirements, and any details that help candidates understand the role and decide if they are good fit."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="editor-textarea-area"
                  />
                  <div className="editor-bottom-bar">
                    <button type="button" className="bar-btn">B</button>
                    <button type="button" className="bar-btn"><i>I</i></button>
                    <button type="button" className="bar-btn"><u>U</u></button>
                    <button type="button" className="bar-btn"><s>S</s></button>
                    <button type="button" className="bar-btn">🔗</button>
                    <button type="button" className="bar-btn">☰</button>
                    <button type="button" className="bar-btn">𝌺</button>
                  </div>
                </div>

                {/* AI Description Generator Banner */}
                <div className="ai-banner-cyan mt-16">
                  <div className="ai-banner-left">
                    <span className="sparkle-icon">✨</span>
                    <div className="ai-text-column">
                      <span className="ai-heading">AI Job Description Generator</span>
                      <span className="ai-subtext">Generate detailed job responsibilities, qualifications, and experience requirements</span>
                    </div>
                  </div>
                  <button type="button" className="ai-btn-cyan-outline">
                    <span className="wand-icon">%</span> Generate with AI (0/9)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="page-actions-bottom">
                <button type="button" className="action-btn-back" onClick={() => navigate('/')}>
                  Back
                </button>
                <button type="button" className="action-btn-continue">
                  Continue
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating help widget */}
      <button className="floating-lightbulb-btn">
        💡
      </button>



      {/* Benefits Modal */}
      {isBenefitsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="modal-close-btn" onClick={() => setIsBenefitsModalOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <h2 className="modal-title">Benefits ({tempSelectedBenefits.length}/20)</h2>

            <div className="modal-search-box mt-12">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search"
                value={benefitSearchQuery}
                onChange={(e) => setBenefitSearchQuery(e.target.value)}
                className="modal-search-input"
              />
            </div>

            <div className="modal-content-body mt-12">
              <p className="select-questions-label">Select Benefits</p>
              
              <div className="questions-badges-container">
                {BENEFITS_LIST.filter(b => b.toLowerCase().includes(benefitSearchQuery.toLowerCase())).map((benefit) => {
                  const isSelected = tempSelectedBenefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      className={`question-badge-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setTempSelectedBenefits(tempSelectedBenefits.filter(x => x !== benefit));
                        } else {
                          if (tempSelectedBenefits.length < 20) {
                            setTempSelectedBenefits([...tempSelectedBenefits, benefit]);
                          }
                        }
                      }}
                    >
                      {benefit}
                    </button>
                  );
                })}
              </div>

              <p className="select-questions-label" style={{ marginTop: '16px', marginBottom: '8px' }}>Other Benefits</p>
              <div className="custom-options-builder-row">
                <input
                  type="text"
                  placeholder="Enter custom benefit name"
                  value={newCustomBenefit}
                  onChange={(e) => setNewCustomBenefit(e.target.value)}
                  className="input-field option-build-input"
                />
                <button
                  type="button"
                  className="add-opt-btn"
                  onClick={() => {
                    const val = newCustomBenefit.trim();
                    if (val) {
                      if (!tempSelectedBenefits.includes(val) && tempSelectedBenefits.length < 20) {
                        setTempSelectedBenefits([...tempSelectedBenefits, val]);
                        setNewCustomBenefit('');
                      }
                    }
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Selected Benefits Preview */}
            {tempSelectedBenefits.length > 0 && (
              <div className="modal-selected-benefits-preview-section mt-12" style={{ width: '100%' }}>
                <p className="select-questions-label" style={{ marginBottom: '8px' }}>Selected</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tempSelectedBenefits.map((benefit) => (
                    <span key={benefit} className="benefit-selected-tag">
                      {benefit}
                      <button
                        type="button"
                        className="benefit-selected-tag-remove"
                        onClick={() => {
                          setTempSelectedBenefits(tempSelectedBenefits.filter(x => x !== benefit));
                        }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}


            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', marginTop: '20px' }}>
              <button
                type="button"
                className="action-btn-continue"
                style={{ width: 'auto', padding: '0 24px', height: '40px', borderRadius: '20px' }}
                onClick={() => {
                  setSelectedBenefits(tempSelectedBenefits);
                  setIsBenefitsModalOpen(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



