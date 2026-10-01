import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReferralCodePage.css';
import SuperadminShell, { SearchIcon } from '../components/SuperadminShell';
import { COMPANIES, initials } from '../data/companies';
import {
  formatDate,
  formatRM,
  getReferredCompanies,
  openInvoice,
  statusSlug,
} from '../data/referrals';
import { downloadCommissionStatement, statementLinesFor, viewCommissionStatement } from '../data/commissionPdf';
import { resetReferrals, updateReferral, useReferrals, type CommissionRequest } from '../store/referralStore';

const STAT_CARDS = [
  { title: 'Total Employer', value: 25, sub: 'New Employer Today', subValue: '0', variant: 'green' },
  { title: 'Total Subscribe Employer', value: 15, sub: 'New Jobseeker Today', subValue: '0', variant: 'cyan' },
  { title: 'Total Verified Employer', value: 25, sub: 'View to Chat Conversion', subValue: '0 %', variant: 'amber' },
  { title: 'Total Job Posting', value: 65, sub: 'Chat to Resume Conversion', subValue: '0 %', variant: 'purple' },
];

const TABS = [
  { label: 'All', count: 11, enabled: false },
  { label: 'Delete Request', count: 1, enabled: false },
  { label: 'Referrals', count: 6, enabled: true },
  { label: 'Commission', count: 0, enabled: true },
];

const FILTERS = ['Job Title', 'Work Arrangement', 'Location'];

const COMMISSION_RATES = [15, 20, 25];

const generateCode = (name: string) => {
  const prefix = name.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${digits}`;
};

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#141b2e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 9l7 7 7-7" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="38" height="34" viewBox="0 0 38 34" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
      <path d="M2 17.5c5 3 11 4.3 17 4.3s12-1.3 17-4.3V31a1.5 1.5 0 0 1-1.5 1.5h-31A1.5 1.5 0 0 1 2 31z" fill="currentColor" fillOpacity="0.25" stroke="none" />
      <rect x="2" y="8" width="34" height="24.5" rx="1.5" />
      <path d="M13 8V3.5A1.5 1.5 0 0 1 14.5 2h9A1.5 1.5 0 0 1 25 3.5V8" />
      <path d="M2 16.5c5 3.2 11 4.8 17 4.8s12-1.6 17-4.8" />
      <path d="M17 17.5h4" strokeLinecap="round" />
    </svg>
  );
}

function CardPattern() {
  const lines = (x: number, y: number, len: number, angle: number, count: number) =>
    Array.from({ length: count }, (_, i) => (
      <line
        key={`${x}-${y}-${i}`}
        x1={x + i * 4}
        y1={y}
        x2={x + i * 4 + len * Math.cos((angle * Math.PI) / 180)}
        y2={y + len * Math.sin((angle * Math.PI) / 180)}
      />
    ));
  return (
    <svg className="rc-card-pattern" viewBox="0 0 260 190" preserveAspectRatio="none">
      <g stroke="#ffffff" strokeWidth="0.8" opacity="0.55">
        {lines(-10, 40, 110, 80, 14)}
        {lines(60, 190, 120, -45, 14)}
        {lines(40, 70, 110, 45, 14)}
        {lines(80, 0, 90, 135, 14)}
      </g>
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M6.2 18.7a7 7 0 0 1 11.6 0" />
    </svg>
  );
}

function UserStarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="6.5" r="4" />
      <path d="M2 21v-1a6 6 0 0 1 8.5-5.4" />
      <path d="M17 12.5l1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function ReferralCodePage() {
  const [activeTab, setActiveTab] = useState('Referrals');
  const navigate = useNavigate();
  const referrals = useReferrals();

  const [expandedRequests, setExpandedRequests] = useState<string[]>([]);
  const toggleExpanded = (id: string) =>
    setExpandedRequests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const needsAction = (status: string) => status === 'In Review' || status === 'Approved';
  const commissionRows = COMPANIES.flatMap((company) =>
    (referrals[company.id].commissionRequests ?? []).map((request) => ({ company, request })),
  ).sort((a, b) => Number(needsAction(b.request.status)) - Number(needsAction(a.request.status)));
  const actionableCommission = commissionRows.filter((row) => needsAction(row.request.status)).length;

  const updateRequest = (companyId: string, requestId: string, patch: Partial<CommissionRequest>) => {
    const requests = referrals[companyId].commissionRequests ?? [];
    return updateReferral(companyId, {
      commissionRequests: requests.map((q) => (q.id === requestId ? { ...q, ...patch } : q)),
    });
  };

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [adminAction, setAdminAction] = useState<{
    companyId: string;
    requestId: string;
    mode: 'revision' | 'paid';
  } | null>(null);
  const [revisionNote, setRevisionNote] = useState('');
  const [paidDate, setPaidDate] = useState(todayISO());
  const [paymentRef, setPaymentRef] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);

  const pickProof = (file: File | undefined) => {
    if (!file) return;
    const okType = /\.(pdf|png|jpe?g)$/i.test(file.name) || ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type);
    if (!okType) {
      setProofFile(null);
      setProofError('Please upload a PDF, JPG or PNG file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProofFile(null);
      setProofError('File must be 2 MB or smaller.');
      return;
    }
    setProofError(null);
    setProofFile(file);
  };

  const openAdminAction = (companyId: string, requestId: string, mode: 'revision' | 'paid') => {
    setRevisionNote('');
    setPaidDate(todayISO());
    setPaymentRef('');
    setProofFile(null);
    setProofError(null);
    setAdminAction({ companyId, requestId, mode });
  };

  const submitAdminAction = () => {
    if (!adminAction) return;
    const { companyId, requestId, mode } = adminAction;
    if (mode === 'revision') {
      if (!revisionNote.trim()) return;
      updateRequest(companyId, requestId, {
        status: 'Needs Revision',
        revisionNote: revisionNote.trim(),
        decidedAt: formatDate(new Date()),
      });
    } else {
      if (!paymentRef.trim() || !paidDate || !proofFile) return;
      const [y, m, d] = paidDate.split('-').map(Number);
      const file = proofFile;
      const reader = new FileReader();
      reader.onload = () => {
        const saved = updateRequest(companyId, requestId, {
          status: 'Paid',
          payment: {
            paidAt: formatDate(new Date(y, m - 1, d)),
            reference: paymentRef.trim(),
            proof: { fileName: file.name, size: file.size, dataUrl: String(reader.result), uploadedAt: formatDate(new Date()) },
          },
        });
        if (!saved) {
          setProofError("This file couldn't be saved in the prototype's browser storage. Try a smaller file.");
          return;
        }
        setAdminAction(null);
      };
      reader.onerror = () => setProofError("Couldn't read this file. Please try again.");
      reader.readAsDataURL(file);
      return;
    }
    setAdminAction(null);
  };
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    const { id } = COMPANIES[index];
    if (referrals[id].active) {
      updateReferral(id, { active: false });
      return;
    }
    setSelectedRate(referrals[id].commission);
    setModalIndex(index);
  };

  const closeModal = () => {
    setModalIndex(null);
    setSelectedRate(null);
  };

  const submitCommission = () => {
    if (modalIndex === null || selectedRate === null) return;
    const company = COMPANIES[modalIndex];
    updateReferral(company.id, {
      active: true,
      commission: selectedRate,
      code: referrals[company.id].code ?? generateCode(company.name),
    });
    closeModal();
  };

  return (
    <SuperadminShell>

        <main className="rc-content">
          <h1 className="rc-page-title">Employer</h1>

          <div className="rc-stats">
            {STAT_CARDS.map((card) => (
              <div key={card.title} className={`rc-stat-card ${card.variant}`}>
                <CardPattern />
                <span className="rc-stat-title">{card.title}</span>
                <span className="rc-stat-value">{card.value}</span>
                <span className="rc-stat-sub">
                  {card.sub} <b>{card.subValue}</b>
                </span>
                <span className="rc-stat-icon">
                  <BriefcaseIcon />
                </span>
              </div>
            ))}
          </div>

          <div className="rc-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                className={`rc-tab${activeTab === tab.label ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.label)}
                disabled={!tab.enabled}
              >
                {tab.label}{' '}
                <span className="rc-tab-count">({tab.label === 'Commission' ? actionableCommission : tab.count})</span>
              </button>
            ))}
          </div>

          {activeTab === 'Commission' && (
            <section className="rc-panel">
              <div className="rc-panel-header">
                <h2 className="rc-panel-title">Commission Requests</h2>
              </div>
              <div className="rc-table-head rc-commission-grid">
                <span>Company Name</span>
                <span>Amount</span>
                <span>Rate</span>
                <span>Requested On</span>
                <span>Invoice</span>
                <span>Statement</span>
                <span className="center">Status</span>
                <span className="center">Action</span>
              </div>
              {commissionRows.length === 0 ? (
                <div className="rc-commission-empty">No commission requests yet.</div>
              ) : (
                commissionRows.map(({ company, request }) => {
                  const expanded = expandedRequests.includes(request.id);
                  const lines = statementLinesFor(company.id, referrals[company.id], request);
                  const companyCount = new Set(lines.map((l) => l.company)).size;
                  const totalSpending = lines.reduce((sum, l) => sum + l.spending, 0);
                  const totalCommission = Math.round(lines.reduce((sum, l) => sum + l.commission, 0) * 100) / 100;
                  const matches = Math.abs(totalCommission - request.amount) < 0.005;
                  const statementInput = {
                    employerName: company.name,
                    referralCode: referrals[company.id].code,
                    request,
                    lines,
                  };
                  return (
                  <div key={request.id} className={`rc-commission-item${expanded ? ' expanded' : ''}`}>
                  <div className="rc-row rc-commission-grid rc-commission-row">
                    <div className="rc-company">
                      <div className="rc-company-logo">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} />
                        ) : (
                          <span className="rc-company-initials">{initials(company.name)}</span>
                        )}
                      </div>
                      <div className="rc-company-info">
                        <span className="rc-company-name">{company.name}</span>
                        <span className="rc-company-meta">Code {referrals[company.id].code ?? '-'}</span>
                      </div>
                    </div>
                    <span className="rc-commission-amount-cell">
                      <span className="rc-commission-amount">{formatRM(request.amount)}</span>
                      <button className="rc-breakdown-toggle" onClick={() => toggleExpanded(request.id)}>
                        {lines.length} {lines.length === 1 ? 'item' : 'items'} · {companyCount}{' '}
                        {companyCount === 1 ? 'company' : 'companies'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d={expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                        </svg>
                      </button>
                    </span>
                    <span className="rc-commission-text">{request.rate}%</span>
                    <span className="rc-commission-text">{request.requestedAt}</span>
                    <span className="rc-commission-docs">
                      {request.invoice ? (
                        <button className="rc-invoice-link" onClick={() => openInvoice(request.invoice!.dataUrl)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <path d="M14 2v6h6" />
                          </svg>
                          <span>{request.invoice.fileName}</span>
                        </button>
                      ) : (
                        <span className="rc-code-none rc-doc-missing">Not uploaded</span>
                      )}
                    </span>
                    <span className="rc-commission-docs">
                      <button className="rc-invoice-link" onClick={() => viewCommissionStatement(statementInput)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <path d="M14 2v6h6" />
                          <path d="M8 13h8M8 17h5" />
                        </svg>
                        <span>Statement.pdf</span>
                      </button>
                    </span>
                    <div className="center">
                      <span className={`rc-status-pill rc-status-sm ${statusSlug(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="center rc-commission-actions">
                      {request.status === 'In Review' ? (
                        <>
                          <button
                            className="rc-approve-btn"
                            onClick={() =>
                              updateRequest(company.id, request.id, { status: 'Approved', decidedAt: formatDate(new Date()) })
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="rc-reject-btn rc-revision-btn"
                            onClick={() => openAdminAction(company.id, request.id, 'revision')}
                          >
                            Revision
                          </button>
                          <button
                            className="rc-reject-btn"
                            onClick={() =>
                              updateRequest(company.id, request.id, { status: 'Rejected', decidedAt: formatDate(new Date()) })
                            }
                          >
                            Reject
                          </button>
                        </>
                      ) : request.status === 'Approved' ? (
                        <button className="rc-approve-btn" onClick={() => openAdminAction(company.id, request.id, 'paid')}>
                          Mark as Paid
                        </button>
                      ) : request.status === 'Awaiting Invoice' ? (
                        <span className="rc-code-none">Waiting for invoice</span>
                      ) : request.status === 'Needs Revision' ? (
                        <span className="rc-code-none">Waiting for revised invoice</span>
                      ) : request.status === 'Paid' && request.payment ? (
                        <span className="rc-commission-note">
                          {request.payment.paidAt}
                          <small>Ref {request.payment.reference}</small>
                          {request.payment.proof && (
                            <button className="rc-invoice-link rc-proof-link" onClick={() => openInvoice(request.payment!.proof!.dataUrl)}>
                              <span>View proof of payment</span>
                            </button>
                          )}
                        </span>
                      ) : (
                        <span className="rc-commission-text">on {request.decidedAt}</span>
                      )}
                    </div>
                  </div>
                  {expanded && (
                    <div className="rc-breakdown">
                      <div className="rc-breakdown-top">
                        <div className="rc-breakdown-title">
                          Purchase &amp; commission breakdown
                          <span>Use this to check the invoice from {company.name}.</span>
                        </div>
                        <button
                          className="rc-pdf-btn"
                          onClick={() =>
                            downloadCommissionStatement(statementInput)
                          }
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3v12M7 10l5 5 5-5" />
                            <path d="M4 19h16" />
                          </svg>
                          Download PDF
                        </button>
                      </div>
                      <div className="rc-breakdown-grid rc-breakdown-head">
                        <span>Referred Company</span>
                        <span>Purchased</span>
                        <span>Price × Qty</span>
                        <span className="rc-num">Spending</span>
                        <span className="rc-num">Rate</span>
                        <span className="rc-num">Commission</span>
                      </div>
                      {lines.map((l) => (
                        <div key={l.lineId} className="rc-breakdown-grid rc-breakdown-row">
                          <span className="rc-breakdown-company">
                            <b>{l.company}</b>
                            {l.companyNote && <small>{l.companyNote}</small>}
                          </span>
                          <span>{l.purchased}</span>
                          <span className="rc-muted">{l.priceDetail}</span>
                          <span className="rc-num">{formatRM(l.spending)}</span>
                          <span className="rc-num">{request.rate}%</span>
                          <span className="rc-num rc-breakdown-commission">{formatRM(l.commission)}</span>
                        </div>
                      ))}
                      <div className="rc-breakdown-grid rc-breakdown-foot">
                        <span>
                          Total ({lines.length} {lines.length === 1 ? 'item' : 'items'})
                        </span>
                        <span />
                        <span />
                        <span className="rc-num">{formatRM(totalSpending)}</span>
                        <span />
                        <span className="rc-num">{formatRM(totalCommission)}</span>
                      </div>
                      <div className={`rc-breakdown-check${matches ? '' : ' mismatch'}`}>
                        {matches
                          ? `Total commission matches the requested amount of ${formatRM(request.amount)}. The invoice should show this amount.`
                          : `Total commission ${formatRM(totalCommission)} does not match the requested amount ${formatRM(request.amount)}.`}
                        {request.invoice && (
                          <button className="rc-invoice-link" onClick={() => openInvoice(request.invoice!.dataUrl)}>
                            <span>Open {request.invoice.fileName}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  </div>
                  );
                })
              )}
            </section>
          )}

          {activeTab === 'Referrals' && (
          <section className="rc-panel">
            <div className="rc-panel-header">
              <div className="rc-panel-title-group">
                <h2 className="rc-panel-title">Referrals</h2>
                <button
                  className="rc-reset-btn"
                  onClick={() => {
                    if (window.confirm('Reset all referral data? This clears activations, commission rates and codes.')) {
                      resetReferrals();
                    }
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  Reset
                </button>
              </div>
              <div className="rc-filters">
                {FILTERS.map((f) => (
                  <div key={f} className="rc-select">
                    <span>{f}</span>
                    <ChevronDown />
                  </div>
                ))}
                <div className="rc-panel-search">
                  <SearchIcon />
                  <input type="text" placeholder="Search" />
                </div>
              </div>
            </div>

            <div className="rc-table-head rc-grid">
              <span>Company Name</span>
              <span />
              <span className="center">Status</span>
              <span className="center">Subscriptions</span>
              <span className="center">Referral Activation</span>
              <span className="center">Commission Rate</span>
              <span className="center">Referral code</span>
              <span className="center">Referrals Joined</span>
              <span className="center">Action</span>
            </div>

            {COMPANIES.map((company, index) => (
              <div key={company.name} className="rc-row rc-grid">
                <div className="rc-company">
                  <div className="rc-company-logo">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} />
                    ) : (
                      <span className="rc-company-initials">{initials(company.name)}</span>
                    )}
                  </div>
                  <div className="rc-company-info">
                    <span className="rc-company-name">{company.name}</span>
                    <span className="rc-company-meta">{company.meta}</span>
                  </div>
                </div>
                <div className="rc-company-stats">
                  <div className="rc-company-stat">
                    <UserCircleIcon />
                    <span><b>{company.jobPostings}</b> Job Posting</span>
                  </div>
                  <div className="rc-company-stat">
                    <UserCircleIcon />
                    <span><b>{company.admins}</b> Admin</span>
                  </div>
                  <div className="rc-company-stat">
                    <UserStarIcon />
                    <span><b>{company.panels}</b> Panel</span>
                  </div>
                </div>
                <div className="center">
                  <span className={`rc-pill ${company.verified ? 'rc-pill-teal' : 'rc-pill-muted'}`}>
                    {company.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className="center">
                  <span className="rc-pill rc-pill-teal">{company.subscription}</span>
                </div>
                <div className="center">
                  <button
                    className={`rc-switch${referrals[company.id].active ? ' on' : ''}`}
                    onClick={() => handleToggle(index)}
                    aria-label="Toggle referral activation"
                  >
                    <span className="rc-switch-knob" />
                  </button>
                </div>
                <div className="center">
                  {referrals[company.id].active && referrals[company.id].commission !== null ? (
                    <span className="rc-pill rc-pill-teal">{referrals[company.id].commission}%</span>
                  ) : (
                    <span className="rc-code-none">None</span>
                  )}
                </div>
                <div className={`center ${referrals[company.id].active && referrals[company.id].code ? 'rc-code' : 'rc-code-none'}`}>
                  {referrals[company.id].active && referrals[company.id].code ? referrals[company.id].code : 'None'}
                </div>
                <div className="center">
                  {(() => {
                    const joined = getReferredCompanies(company.id, referrals[company.id]).length;
                    return joined > 0 ? (
                      <button className="rc-joined" onClick={() => navigate(`/referral-code/${company.id}`)}>
                        <b>{joined}</b> {joined === 1 ? 'company' : 'companies'}
                      </button>
                    ) : (
                      <span className="rc-code-none">None</span>
                    );
                  })()}
                </div>
                <div className="center">
                  <button className="rc-eye" aria-label="View">
                    <EyeIcon />
                  </button>
                </div>
              </div>
            ))}
          </section>
          )}
        </main>

      {adminAction && (
        <div className="rc-modal-overlay" onClick={() => setAdminAction(null)}>
          <form
            className="rc-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              submitAdminAction();
            }}
          >
            <div className="rc-modal-header">
              <h3 className="rc-modal-title">{adminAction.mode === 'revision' ? 'Request Invoice Revision' : 'Mark as Paid'}</h3>
              <button type="button" className="rc-modal-close" onClick={() => setAdminAction(null)} aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            {adminAction.mode === 'revision' ? (
              <>
                <p className="rc-modal-desc">
                  Tell the employer what needs to change. They'll see this note and can upload a corrected invoice.
                </p>
                <label className="rc-modal-label" htmlFor="rc-revision-note">
                  Revision note
                </label>
                <textarea
                  id="rc-revision-note"
                  className="rc-field rc-textarea"
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="e.g. Invoice amount doesn't match RM 1,243.60, please correct it."
                  autoFocus
                />
              </>
            ) : (
              <>
                <p className="rc-modal-desc">Record the payment made to the employer for this commission request.</p>
                <label className="rc-modal-label" htmlFor="rc-paid-date">
                  Payment date
                </label>
                <input
                  id="rc-paid-date"
                  type="date"
                  className="rc-field"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                />
                <label className="rc-modal-label rc-field-gap" htmlFor="rc-payment-ref">
                  Payment reference
                </label>
                <input
                  id="rc-payment-ref"
                  className="rc-field"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. Bank transfer ref TRX-20261001-88"
                  autoFocus
                />
                <span className="rc-modal-label rc-field-gap">Proof of payment</span>
                <label
                  className={`rc-dropzone${proofError ? ' error' : ''}${proofFile ? ' has-file' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    pickProof(e.dataTransfer.files[0]);
                  }}
                >
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,.pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      pickProof(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M12 18v-6M9 15l3-3 3 3" />
                  </svg>
                  <span className="rc-dropzone-file">
                    <b>{proofFile ? proofFile.name : 'Click to upload or drag the payment receipt here'}</b>
                    <small>
                      {proofFile
                        ? `${proofFile.size < 1024 ? `${proofFile.size} bytes` : `${(proofFile.size / 1024).toFixed(0)} KB`} · click to choose a different file`
                        : 'PDF, JPG or PNG, up to 2 MB'}
                    </small>
                  </span>
                </label>
                {proofError && <span className="rc-field-error">{proofError}</span>}
              </>
            )}
            <div className="rc-modal-actions">
              <button type="button" className="rc-btn-secondary" onClick={() => setAdminAction(null)}>
                Cancel
              </button>
              <button
                type="submit"
                className="rc-btn-primary"
                disabled={adminAction.mode === 'revision' ? !revisionNote.trim() : !paymentRef.trim() || !paidDate || !proofFile}
              >
                {adminAction.mode === 'revision' ? 'Send to Employer' : 'Mark as Paid'}
              </button>
            </div>
          </form>
        </div>
      )}

      {modalIndex !== null && (
        <div className="rc-modal-overlay" onClick={closeModal}>
          <div className="rc-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal-header">
              <h3 className="rc-modal-title">Activate Referral</h3>
              <button className="rc-modal-close" onClick={closeModal} aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="rc-modal-desc">
              Select the commission rate for <b>{COMPANIES[modalIndex].name}</b>. A referral code will be
              generated once submitted.
            </p>
            <span className="rc-modal-label">Commission Rate</span>
            <div className="rc-rate-options">
              {COMMISSION_RATES.map((rate) => (
                <button
                  key={rate}
                  className={`rc-rate-option${selectedRate === rate ? ' selected' : ''}`}
                  onClick={() => setSelectedRate(rate)}
                >
                  <span className="rc-rate-radio" />
                  {rate}%
                </button>
              ))}
            </div>
            <div className="rc-modal-actions">
              <button className="rc-btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button className="rc-btn-primary" onClick={submitCommission} disabled={selectedRate === null}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperadminShell>
  );
}
