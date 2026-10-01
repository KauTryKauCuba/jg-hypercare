import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/ReferralCodePage.css';
import logo from '../assets/referral/jobgiga-logo.png';
import avatar from '../assets/referral/avatar.png';

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
    label: 'Internal CRM',
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="M7 16v-5l3.5 3L14 9l3.5 4V16" />
      </svg>
    ),
  },
  {
    label: 'Employer',
    active: true,
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
    label: 'Jobseeker',
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
    label: 'Pending',
    badge: '01',
    icon: (
      <svg {...iconProps}>
        <path d="M3.5 20.5l1.3-3.9A8.5 8.5 0 1 1 8.3 20z" />
      </svg>
    ),
  },
  {
    label: 'Email Blasting',
    icon: (
      <svg {...iconProps}>
        <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
        <path d="M3 6l9 7 9-7" />
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
    label: 'Pre Register',
    icon: (
      <svg {...iconProps}>
        <path d="M21 11.1V12a9 9 0 1 1-5.3-8.2" />
        <path d="M21 4.5L12 13.5l-3-3" />
      </svg>
    ),
  },
];

export function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141b2e" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7.5" />
      <path d="M20.5 20.5l-4-4" />
    </svg>
  );
}

export default function SuperadminShell({ children }: { children: ReactNode }) {
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
            <div key={item.label} className={`rc-nav-item${item.active ? ' active' : ''}`}>
              <span className="rc-nav-icon">{item.icon}</span>
              <span className="rc-nav-label">{item.label}</span>
              {item.badge && <span className="rc-nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>
      </aside>

      <div className="rc-main">
        <header className="rc-header">
          <div className="rc-header-search">
            <SearchIcon />
            <input type="text" placeholder="Search" />
          </div>
          <button className="rc-bell" aria-label="Notifications">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="rc-bell-dot" />
          </button>
          <span className="rc-org-pill">JobGiga</span>
          <div className="rc-user">
            <span className="rc-user-name">Siti Amirah</span>
            <span className="rc-user-role">Superadmin</span>
          </div>
          <img src={avatar} alt="" className="rc-avatar" />
        </header>
        {children}
      </div>
    </div>
  );
}
