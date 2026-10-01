import { useNavigate, useParams } from 'react-router-dom';
import './ReferralCompaniesPage.css';
import SuperadminShell from '../components/SuperadminShell';
import { COMPANIES, initials } from '../data/companies';
import { formatRM, getReferredCompanies, spendingBreakdown, spendingOf } from '../data/referrals';
import { useReferrals } from '../store/referralStore';

export default function ReferralCompaniesPage() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const referrals = useReferrals();

  const owner = COMPANIES.find((c) => c.id === companyId);

  const backLink = (
    <button className="rcp-back" onClick={() => navigate('/referral-code')}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      Back to Referrals
    </button>
  );

  if (!owner) {
    return (
      <SuperadminShell>
        <main className="rc-content">
          {backLink}
          <h1 className="rc-page-title">Company not found</h1>
        </main>
      </SuperadminShell>
    );
  }

  const referral = referrals[owner.id];
  const joined = getReferredCompanies(owner.id, referral);

  return (
    <SuperadminShell>
      <main className="rc-content">
        {backLink}

        <div className="rcp-title-row">
          <div className="rc-company-logo rcp-owner-logo">
            {owner.logo ? <img src={owner.logo} alt="" /> : <span className="rc-company-initials">{initials(owner.name)}</span>}
          </div>
          <div>
            <h1 className="rc-page-title rcp-title">Companies referred by {owner.name}</h1>
            <span className="rcp-subtitle">{owner.meta}</span>
          </div>
        </div>

        <div className="rcp-stats">
          <div className="rcp-stat green">
            <span className="rcp-stat-label">Total Referred</span>
            <span className="rcp-stat-value">{joined.length}</span>
            <span className="rcp-stat-sub">{joined.length === 1 ? 'company' : 'companies'} joined with their code</span>
          </div>
          <div className="rcp-stat cyan">
            <span className="rcp-stat-label">Current Referral Code</span>
            <span className="rcp-stat-value">{referral.active && referral.code ? referral.code : 'None'}</span>
            <span className="rcp-stat-sub">{referral.active ? 'Referral is active' : 'Referral is switched off'}</span>
          </div>
          <div className="rcp-stat amber">
            <span className="rcp-stat-label">Commission Rate</span>
            <span className="rcp-stat-value">{referral.active && referral.commission !== null ? `${referral.commission}%` : 'None'}</span>
            <span className="rcp-stat-sub">set by JobGiga</span>
          </div>
        </div>

        <section className="rc-panel rcp-panel">
          <div className="rcp-panel-header">
            <h2 className="rc-panel-title">Referred Companies</h2>
          </div>

          <div className="rc-table-head rcp-grid">
            <span>Company Name</span>
            <span className="rcp-center">Status</span>
            <span>Industry</span>
            <span>Date Join</span>
            <span>Code Used</span>
            <span>Location</span>
            <span className="rcp-center">Subscription</span>
            <span>Total Spending</span>
          </div>

          {joined.length === 0 ? (
            <div className="rcp-empty">No companies have joined using {owner.name}'s referral code yet.</div>
          ) : (
            joined.map((r) => (
              <div key={r.name} className="rc-row rcp-grid rcp-row">
                <div className="rc-company">
                  <div className="rc-company-logo">
                    {r.logo ? (
                      <img src={r.logo} alt="" className="rcp-row-logo" />
                    ) : (
                      <span className="rc-company-initials">{initials(r.name)}</span>
                    )}
                  </div>
                  <div className="rc-company-info">
                    <span className="rc-company-name">{r.name}</span>
                    <span className="rc-company-meta">{r.meta}</span>
                  </div>
                </div>
                <span className="rcp-center">
                  <span className={`rc-pill ${r.verified ? 'rc-pill-teal' : 'rc-pill-muted'}`}>
                    {r.verified ? 'Verified' : 'Unverified'}
                  </span>
                </span>
                <span className="rcp-cell">{r.industry}</span>
                <span className="rcp-cell">{r.dateJoin}</span>
                <span className="rcp-cell">
                  <span className="rc-pill rc-pill-teal">{r.codeUsed}</span>
                </span>
                <span className="rcp-cell">{r.location}</span>
                <span className="rcp-center">
                  <span className="rcp-plan">
                    <span className="rc-pill rc-pill-teal">{r.plan}</span>
                    {r.billing && <span className="rcp-sub-text">{r.billing}</span>}
                  </span>
                </span>
                <span className="rcp-spending">
                  <span className="rcp-spending-total">{formatRM(spendingOf(r, referral))}</span>
                  <span className="rcp-sub-text">{spendingBreakdown(r, referral)}</span>
                </span>
              </div>
            ))
          )}
        </section>
      </main>
    </SuperadminShell>
  );
}
