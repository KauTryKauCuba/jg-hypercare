import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/ReferralCodePage.css';
import '../pages/ReferralEmployerPage.css';
import logo from '../assets/referral/jobgiga-logo.png';
import avatar from '../assets/referral/avatar-ahmad.png';
import sidebarAd from '../assets/referral/sidebar-ad.png';
import { COMPANIES, initials, type Company } from '../data/companies';

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: 'Manage Jobs',
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="3" width="17" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    label: 'Applicants',
    icon: (
      <svg {...iconProps}>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5" />
        <circle cx="12" cy="13" r="2.5" />
        <path d="M8 19a4 4 0 0 1 8 0" />
      </svg>
    ),
  },
  {
    label: 'Interview',
    icon: (
      <svg {...iconProps}>
        <path d="M3 4h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8l-4 3v-3H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
        <path d="M16 8h4a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1v3l-4-3h-5a1 1 0 0 1-1-1v-1" />
      </svg>
    ),
  },
  {
    label: 'ChatGiga',
    icon: (
      <svg {...iconProps}>
        <path d="M3.5 20.5l1.3-3.9A8.5 8.5 0 1 1 8.3 20z" />
      </svg>
    ),
  },
  {
    label: 'Pricing',
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    label: 'Employees',
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="7.5" r="4" />
        <path d="M2 21v-1.5A5.5 5.5 0 0 1 7.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21" />
        <path d="M16 3.6a4 4 0 0 1 0 7.8" />
        <path d="M22 21v-1.5a5.5 5.5 0 0 0-3.5-5.1" />
      </svg>
    ),
  },
  {
    label: 'Forms',
    icon: (
      <svg {...iconProps}>
        <path d="M4 4h16M4 9h11M4 14h16M4 19h11" />
      </svg>
    ),
  },
  {
    label: 'Talent',
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-1a6 6 0 0 1 9-5.2" />
        <circle cx="17" cy="17" r="3" />
        <path d="M21.5 21.5l-2.3-2.3" />
      </svg>
    ),
  },
  {
    label: 'Ads Managment',
    icon: (
      <svg {...iconProps}>
        <path d="M3 10v4a1 1 0 0 0 1 1h3l6 5V4L7 9H4a1 1 0 0 0-1 1z" />
        <path d="M7 15l1.5 6h3L10 15.5" />
        <path d="M17 8.5a5 5 0 0 1 0 7" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="M7 16v-5l3.5 3L14 9l3.5 4V16" />
      </svg>
    ),
  },
  {
    label: 'Billing',
    icon: (
      <svg {...iconProps}>
        <path d="M3 21h18M4 10h16M12 3l9 5H3z" />
        <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
      </svg>
    ),
  },
];

// Employer-side layout: sidebar plus the header with the (prototype) company switcher.
export default function EmployerShell({
  company,
  onCompanyChange,
  children,
  active,
}: {
  company: Company;
  onCompanyChange: (companyId: string) => void;
  children: ReactNode;
  active?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="rc-layout">
      <aside className="rc-sidebar">
        <div className="rc-logo" onClick={() => navigate('/')} role="link" title="Back to landing page">
          <img src={logo} alt="" className="rc-logo-mark" />
          <span className="rc-logo-text">JobGiga</span>
        </div>
        <nav className="rc-nav">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className={`rc-nav-item${item.label === active ? ' active' : ''}`}>
              <span className="rc-nav-icon">{item.icon}</span>
              <span className="rc-nav-label">{item.label}</span>
            </div>
          ))}
          <div className="rc-nav-item re-nav-support">
            <span className="rc-nav-icon">
              <svg {...iconProps}>
                <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
                <rect x="2.5" y="13" width="4" height="6" rx="1.5" />
                <rect x="17.5" y="13" width="4" height="6" rx="1.5" />
                <path d="M19.5 19v.5a2.5 2.5 0 0 1-2.5 2.5h-3" />
              </svg>
            </span>
            <span className="rc-nav-label">Support</span>
          </div>
        </nav>
        <img src={sidebarAd} alt="RM 29.00 Mental Health Screening" className="re-sidebar-ad" />
      </aside>

      <div className="rc-main">
        <header className="rc-header re-header">
          <div className="re-header-company">
            <div className="re-header-logo">
              {company.logo ? <img src={company.logo} alt="" /> : <span>{initials(company.name)}</span>}
            </div>
            <label className="re-company-switch" title="Switch company (prototype)">
              <span>{company.name}</span>
              <select value={company.id} onChange={(e) => onCompanyChange(e.target.value)} aria-label="Switch company">
                {COMPANIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="re-my-company-btn">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="6" width="19" height="15" rx="1.5" />
                <path d="M8 6V3h8v3" />
                <path d="M6 10h2M6 14h2M11 10h2M11 14h2M16 10h2M16 14h2M10 21v-3h4v3" />
              </svg>
              My Company
            </button>
          </div>
          <div className="re-header-spacer" />
          <button className="rc-bell" aria-label="Notifications">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <span className="rc-org-pill">{company.subscription}</span>
          <div className="rc-user">
            <span className="rc-user-name">Ahmad Yusuf</span>
            <span className="rc-user-role">HR Manager</span>
          </div>
          <img src={avatar} alt="" className="rc-avatar" />
        </header>
{children}
      </div>
    </div>
  );
}
