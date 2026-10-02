import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AssignedCodes from '../components/AssignedCodes';
import EmployerShell from '../components/EmployerShell';
import './ReferralCodePage.css';
import './ReferralEmployerPage.css';
import badge1 from '../assets/referral/badge-1.png';
import badge2 from '../assets/referral/badge-2.png';
import badge3 from '../assets/referral/badge-3.png';
import badge4 from '../assets/referral/badge-4.png';
import { COMPANIES, initials } from '../data/companies';
import {
  commissionOf,
  commissionSummary,
  companyCommissionStatus,
  openInvoice,
  formatDate,
  formatRM,
  codeConflict,
  conflictMessage,
  lineCommission,
  lineCommissionStatus,
  purchaseLinesOf,
  purchaseSummary,
  getReferredCompanies,
  nextAddonPurchase,
  nextJoiners,
  randomJoinDates,
  spendingOf,
  statusSlug,
} from '../data/referrals';
import { updateReferral, useReferrals } from '../store/referralStore';
import { statementLinesFor, viewCommissionStatement } from '../data/commissionPdf';

const BADGES = [
  { img: badge1, label: 'Badge 1', desc: 'Verify Phone\nNumber', color: '#e58444', done: true },
  { img: badge2, label: 'Badge 2', desc: 'Complete Company\nDescription', color: '#797b7b', done: true },
  { img: badge3, label: 'Badge 3', desc: 'Complete\nIntroduction', color: '#d3a736', done: false },
  { img: badge4, label: 'Badge 4', desc: 'Complete\nLeadership', color: '#6d92ab', done: false },
];

const TABS = ['Basic Information', 'Introduction', 'Social & Culture', 'Leadship', 'Referral'];

function CopyIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function CheckIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.4 2.6a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
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

function PhoneIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

export default function ReferralEmployerPage() {
  const navigate = useNavigate();
  const referrals = useReferrals();
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = searchParams.get('company') ?? COMPANIES[0].id;
  const changeCompany = (id: string) => setSearchParams({ company: id });
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const company = COMPANIES.find((c) => c.id === companyId) ?? COMPANIES[0];
  const referral = referrals[company.id];
  const isActive = referral.active && referral.code !== null;
  const referralLink = `https://jobgiga.com/vad/${referral.code}`;
  const referred = getReferredCompanies(company.id, referral);
  const assignedName = (id?: string) => (id ? referral.assignedCodes?.find((a) => a.id === id)?.name : undefined);
  const commission = commissionSummary(company.id, referral);
  const commissionRequests = referral.commissionRequests ?? [];

  const copy = async (text: string, which: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  const [editing, setEditing] = useState(false);
  const [draftCode, setDraftCode] = useState('');
  const [joinToast, setJoinToast] = useState<string | null>(null);
  const [openPurchases, setOpenPurchases] = useState<string[]>([]);
  const togglePurchases = (name: string) =>
    setOpenPurchases((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  // The Request Commission page sends us back with ?invoice=<id> so the invoice upload opens straight away.
  const [invoiceRequestId, setInvoiceRequestId] = useState<string | null>(() => searchParams.get('invoice'));
  const [requestStep, setRequestStep] = useState<'invoice' | null>(() => (searchParams.get('invoice') ? 'invoice' : null));
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (searchParams.has('invoice')) setSearchParams({ company: companyId }, { replace: true });
  }, [searchParams, setSearchParams, companyId]);

  const showToast = (message: string) => {
    setJoinToast(message);
    setTimeout(() => setJoinToast(null), 3500);
  };

  const invoiceRequest = commissionRequests.find((q) => q.id === invoiceRequestId);

  const openRequestPage = () => navigate(`/referral-code-employer/request-commission?company=${company.id}`);

  const openInvoiceStep = (requestId: string) => {
    setInvoiceRequestId(requestId);
    setInvoiceFile(null);
    setInvoiceError(null);
    setRequestStep('invoice');
  };

  const closeRequestModal = () => {
    setRequestStep(null);
    setInvoiceRequestId(null);
    setInvoiceFile(null);
    setInvoiceError(null);
    setConfirmCancel(false);
  };

  // Withdrawing a request before the invoice is sent frees its items to be requested again.
  const cancelCommissionRequest = () => {
    if (!invoiceRequest) return;
    updateReferral(company.id, {
      commissionRequests: commissionRequests.filter((q) => q.id !== invoiceRequest.id),
    });
    closeRequestModal();
    showToast(`Request for ${formatRM(invoiceRequest.amount)} cancelled. Those items can be requested again.`);
  };

  const MAX_INVOICE_BYTES = 2 * 1024 * 1024;

  const pickInvoice = (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setInvoiceFile(null);
      setInvoiceError('Please upload a PDF file.');
      return;
    }
    if (file.size > MAX_INVOICE_BYTES) {
      setInvoiceFile(null);
      setInvoiceError('PDF must be 2 MB or smaller.');
      return;
    }
    setInvoiceError(null);
    setInvoiceFile(file);
  };

  const submitInvoice = () => {
    if (!invoiceFile || !invoiceRequest) return;
    const reader = new FileReader();
    reader.onload = () => {
      const saved = updateReferral(company.id, {
        commissionRequests: commissionRequests.map((q) =>
          q.id === invoiceRequest.id
            ? {
                ...q,
                status: 'In Review',
                invoice: {
                  fileName: invoiceFile.name,
                  size: invoiceFile.size,
                  dataUrl: String(reader.result),
                  uploadedAt: formatDate(new Date()),
                },
              }
            : q,
        ),
      });
      if (!saved) {
        setInvoiceError("This PDF couldn't be saved in the prototype's browser storage. Try a smaller file.");
        return;
      }
      closeRequestModal();
      showToast(`Invoice submitted. ${formatRM(invoiceRequest.amount)} request sent to JobGiga for review.`);
    };
    reader.onerror = () => setInvoiceError("Couldn't read this file. Please try again.");
    reader.readAsDataURL(invoiceFile);
  };

  const trimmedDraft = draftCode.trim();
  const conflict = codeConflict(trimmedDraft, referrals, { mainOf: company.id });
  const codeError =
    trimmedDraft.length === 0
      ? 'Referral code is required.'
      : !/^[A-Z0-9-]+$/.test(trimmedDraft)
        ? 'Use letters, numbers and dashes only.'
        : trimmedDraft.length < 4 || trimmedDraft.length > 16
          ? 'Code must be 4 to 16 characters.'
          : conflict
            ? conflictMessage(conflict)
            : null;
  const canSave = codeError === null && trimmedDraft !== referral.code;

  const openEdit = () => {
    setDraftCode(referral.code ?? '');
    setEditing(true);
  };

  const saveCode = () => {
    if (!canSave) return;
    const joiners = nextJoiners(company.id, referral);
    const purchase = nextAddonPurchase(company.id, referral);
    const today = formatDate(new Date());
    const joinDates = randomJoinDates(joiners.length, referral.newReferrals?.[0]?.dateJoin);
    updateReferral(company.id, {
      code: trimmedDraft,
      retiredCodes: referral.code ? [...new Set([...(referral.retiredCodes ?? []), referral.code])] : referral.retiredCodes,
      newReferrals: [
        ...joiners.map((j, i) => ({ name: j.name, dateJoin: joinDates[i], codeUsed: trimmedDraft })),
        ...(referral.newReferrals ?? []),
      ],
      addonPurchases: purchase
        ? [
            ...(referral.addonPurchases ?? []),
            { id: `${Date.now()}`, company: purchase.company, addonId: purchase.addon.id, date: today },
          ]
        : referral.addonPurchases,
    });
    setEditing(false);
    const messages = [
      joiners.length === 1 ? `${joiners[0].name} just joined using ${trimmedDraft}` : '',
      joiners.length > 1 ? `${joiners.length} companies just joined using ${trimmedDraft}` : '',
      purchase ? `${purchase.company} bought ${purchase.addon.name} (${formatRM(purchase.addon.price)})` : '',
    ].filter(Boolean);
    if (messages.length > 0) showToast(messages.join(' · '));
  };

  return (
    <EmployerShell company={company} onCompanyChange={changeCompany}>

        <main className="rc-content">
          <div className="re-title-row">
            <h1 className="rc-page-title">My Company</h1>
            <button className="re-outline-btn">View Company Homepage</button>
          </div>

          <section className="re-overview">
            <div className="re-progress-card">
              <span className="re-progress-title">Your company homepage attractiveness</span>
              <span className="re-progress-sub">Room for enchancement among competitors</span>
              <div className="re-progress-row">
                <span>0%</span>
                <span>Completed</span>
              </div>
              <div className="re-progress-bar">
                <span style={{ width: '51%' }} />
              </div>
              <span className="re-progress-sub">Refine a couple more areas and your might see a 15% increase in views</span>
            </div>
            {BADGES.map((badge) => (
              <div key={badge.label} className="re-badge-card">
                {badge.done && (
                  <span className="re-badge-check">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12.5l2.7 2.7L16 9.8" />
                    </svg>
                  </span>
                )}
                <img src={badge.img} alt="" className="re-badge-img" />
                <span className="re-badge-label" style={{ color: badge.color }}>
                  {badge.label}
                </span>
                <span className="re-badge-desc">{badge.desc}</span>
              </div>
            ))}
          </section>

          <div className="rc-tabs re-tabs">
            {TABS.map((tab) => (
              <button key={tab} className={`rc-tab${tab === 'Referral' ? ' active' : ''}`}>
                {tab}
              </button>
            ))}
          </div>

          <section className="rc-panel re-panel">
            <div className="re-panel-intro">
              <h2 className="rc-panel-title">Referral</h2>
              <span className="re-panel-sub">Share JobGiga with your network</span>
            </div>

            {!isActive ? (
              <div className="re-empty-state">
                <div className="re-empty-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="re-empty-title">Referral program not activated yet</span>
                <span className="re-empty-desc">
                  Your referral code will appear here once JobGiga activates the referral program for your company.
                </span>
              </div>
            ) : (
              <>
                <div className="re-cards">
                  <div className="re-card">
                    <span className="re-card-title">Your Referral Code</span>
                    <div className="re-code-row">
                      <span className="re-code">{referral.code}</span>
                      <div className="re-code-actions">
                        <button className="re-icon-btn" onClick={() => copy(referral.code ?? '', 'code')} aria-label="Copy referral code">
                          {copied === 'code' ? <CheckIcon /> : <CopyIcon />}
                        </button>
                        <button className="re-icon-btn" onClick={openEdit} aria-label="Edit referral code">
                          <EditIcon />
                        </button>
                      </div>
                    </div>
                    <span className="re-link-label">Your Referral Link</span>
                    <div className="re-link-box">
                      <span>{referralLink}</span>
                      <button className="re-icon-btn" onClick={() => copy(referralLink, 'link')} aria-label="Copy referral link">
                        {copied === 'link' ? <CheckIcon size={28} /> : <CopyIcon size={28} />}
                      </button>
                    </div>
                  </div>

                  <div className="re-card">
                    <span className="re-card-title">Referral Tracker</span>
                    <div className="re-tracker-cards">
                      <div className="re-tracker-card green">
                        <span className="re-tracker-label">Total Referred</span>
                        <span className="re-tracker-value">{referred.length}</span>
                        <span className="re-tracker-sub">
                          {referred.length === 1 ? 'company joined' : 'companies joined'} with your code
                        </span>
                      </div>
                      <div className="re-tracker-card amber">
                        <span className="re-tracker-label">Commission Earned</span>
                        <span className="re-tracker-value re-tracker-money">{formatRM(commission.earned)}</span>
                        <span className="re-tracker-sub">{referral.commission ?? 0}% of referral spending</span>
                      </div>
                      <div className="re-tracker-card purple">
                        <span className="re-tracker-label">Latest Referred</span>
                        <span className="re-tracker-name">{referred[0]?.name ?? 'No referrals yet'}</span>
                        <span className="re-tracker-sub">{referred[0]?.dateJoin ?? 'Share your code to get started'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <AssignedCodes company={company} referrals={referrals} onToast={showToast} />

                <div className="re-commission">
                  <div className="re-commission-head">
                    <div>
                      <span className="re-card-title">Commission</span>
                      <span className="re-commission-desc">
                        You earn {referral.commission ?? 0}% of what referred companies spend on JobGiga.
                      </span>
                    </div>
                    <button
                      className="rc-btn-primary"
                      onClick={openRequestPage}
                      disabled={commission.available <= 0}
                    >
                      Request Commission
                    </button>
                  </div>
                  <div className="re-commission-figures">
                    <div className="re-commission-figure">
                      <span>Available to request</span>
                      <b className="re-commission-available">{formatRM(commission.available)}</b>
                    </div>
                    <div className="re-commission-figure">
                      <span>In progress</span>
                      <b>{formatRM(commission.inProgress)}</b>
                    </div>
                    <div className="re-commission-figure">
                      <span>Approved, awaiting payment</span>
                      <b>{formatRM(commission.approved)}</b>
                    </div>
                    <div className="re-commission-figure">
                      <span>Paid out</span>
                      <b>{formatRM(commission.paid)}</b>
                    </div>
                  </div>
                  {commissionRequests.length > 0 && (
                    <div className="re-commission-history">
                      <span className="re-commission-history-title">Request History</span>
                      <div className="re-commission-request re-commission-history-head">
                        <span>Requested On</span>
                        <span>Amount</span>
                        <span>Items · Rate</span>
                        <span>Status</span>
                        <span>Invoice</span>
                        <span>Statement</span>
                        <span className="re-commission-decided">Payment Details</span>
                      </div>
                      {commissionRequests.map((q) => (
                        <div key={q.id} className="re-commission-request-wrap">
                          <div className="re-commission-request">
                            <span>{q.requestedAt}</span>
                            <b>{formatRM(q.amount)}</b>
                            <span className="re-commission-rate">
                              {(q.items ?? []).length} {(q.items ?? []).length === 1 ? 'item' : 'items'} · {q.rate}%
                            </span>
                            <span className={`rc-status-pill rc-status-sm ${statusSlug(q.status)}`}>{q.status}</span>
                            <span className="re-commission-invoice">
                              {q.status === 'Awaiting Invoice' || q.status === 'Needs Revision' ? (
                                <button className="re-upload-btn" onClick={() => openInvoiceStep(q.id)}>
                                  {q.status === 'Needs Revision' ? 'Re-upload Invoice' : 'Upload Invoice'}
                                </button>
                              ) : q.invoice ? (
                                <button
                                  className="re-invoice-link"
                                  title={q.invoice.fileName}
                                  onClick={() => openInvoice(q.invoice!.dataUrl)}
                                >
                                  {q.invoice.fileName}
                                </button>
                              ) : null}
                            </span>
                            <span className="re-commission-invoice">
                              <button
                                className="re-invoice-link"
                                onClick={() =>
                                  viewCommissionStatement({
                                    employerName: company.name,
                                    referralCode: referral.code,
                                    request: q,
                                    lines: statementLinesFor(company.id, referral, q),
                                  })
                                }
                              >
                                Statement.pdf
                              </button>
                            </span>
                            <span className="re-commission-decided">
                              {q.status === 'Paid' && q.payment?.proof && (
                                <button
                                  className="re-invoice-link re-proof-link"
                                  onClick={() => openInvoice(q.payment!.proof!.dataUrl)}
                                >
                                  Proof of payment
                                </button>
                              )}
                              {q.status === 'Paid' && q.payment
                                ? `Paid ${q.payment.paidAt} · Ref ${q.payment.reference}`
                                : q.status === 'Approved'
                                  ? `Approved ${q.decidedAt} · payment processing`
                                  : q.status === 'Rejected'
                                    ? `Rejected ${q.decidedAt}`
                                    : q.status === 'In Review'
                                      ? 'JobGiga is reviewing your invoice'
                                      : ''}
                            </span>
                          </div>
                          {q.status === 'Needs Revision' && q.revisionNote && (
                            <div className="re-revision-note">
                              <b>JobGiga:</b> {q.revisionNote}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rc-table-head re-grid">
                  <span>Company Name</span>
                  <span>Industry</span>
                  <span>Date Join</span>
                  <span>Referral Code</span>
                  <span>Total Spending</span>
                  <span>Commission</span>
                  <span>Commission Status</span>
                  <span className="re-action-head">Action</span>
                </div>

                {referred.length === 0 && (
                  <div className="re-empty-row">No companies have joined with your referral code yet</div>
                )}
                {referred.map((r) => {
                  const purchases = purchaseLinesOf(r, referral);
                  const open = openPurchases.includes(r.name);
                  return (
                  <div key={r.name} className={`re-row-wrap${open ? ' open' : ''}`}>
                  <div className="rc-row re-grid re-row">
                    <div className="rc-company">
                      <div className="rc-company-logo">
                        {r.logo ? (
                          <img src={r.logo} alt="" className="re-row-logo" />
                        ) : (
                          <span className="rc-company-initials">{initials(r.name)}</span>
                        )}
                      </div>
                      <div className="rc-company-info re-company-info">
                        <span className="rc-company-name">{r.name}</span>
                        <span className="rc-company-meta">{r.meta}</span>
                      </div>
                    </div>
                    <span className="re-cell">{r.industry}</span>
                    <span className="re-cell">{r.dateJoin}</span>
                    <span className="re-cell">
                      <span className="re-code-cell">
                        <span className="rc-pill rc-pill-teal">{r.codeUsed}</span>
                        {assignedName(r.assignedId) && <small className="re-via">via {assignedName(r.assignedId)}</small>}
                      </span>
                    </span>
                    <span className="re-cell re-spending-cell">
                      {formatRM(spendingOf(r, referral))}
                      {purchases.length > 0 ? (
                        <button className="re-purchases-toggle" onClick={() => togglePurchases(r.name)}>
                          {purchaseSummary(r, referral)}
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d={open ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                          </svg>
                        </button>
                      ) : (
                        <small>Free plan</small>
                      )}
                    </span>
                    <span className="re-cell re-commission-cell">{formatRM(commissionOf(r, referral))}</span>
                    <span className="re-cell">
                      {(() => {
                        const status = companyCommissionStatus(r, referral);
                        return status === 'No Commission' ? (
                          <span className="re-no-commission">No commission</span>
                        ) : (
                          <span className={`rc-status-pill rc-status-sm ${statusSlug(status)}`}>{status}</span>
                        );
                      })()}
                    </span>
                    <div className="re-actions">
                      <button className="re-icon-btn" aria-label="View">
                        <EyeIcon />
                      </button>
                      <button className="re-icon-btn" aria-label="Call">
                        <PhoneIcon />
                      </button>
                    </div>
                  </div>
                  {open && (
                    <div className="re-purchases">
                      <span className="re-purchases-title">Purchases by {r.name}</span>
                      <div className="re-purchases-grid re-purchases-head">
                        <span>Purchased</span>
                        <span>Type</span>
                        <span>Date</span>
                        <span>Price × Qty</span>
                        <span className="re-num">Amount</span>
                        <span className="re-num">Commission ({referral.commission ?? 0}%)</span>
                        <span>Status</span>
                      </div>
                      {purchases.map((line) => {
                        const status = lineCommissionStatus(line, referral);
                        return (
                          <div key={line.id} className="re-purchases-grid re-purchases-row">
                            <b>{line.item}</b>
                            <span>
                              <span className={`re-kind ${line.kind}`}>{line.kind === 'plan' ? 'Plan' : 'Add-on'}</span>
                            </span>
                            <span>{line.date}</span>
                            <span className="re-muted">{line.detail}</span>
                            <span className="re-num">{formatRM(line.amount)}</span>
                            <span className="re-num re-commission-cell">
                              {formatRM(lineCommission(line.amount, referral.commission ?? 0))}
                            </span>
                            <span>
                              <span className={`rc-status-pill rc-status-sm ${statusSlug(status)}`}>{status}</span>
                            </span>
                          </div>
                        );
                      })}
                      <div className="re-purchases-grid re-purchases-foot">
                        <span>
                          Total ({purchases.length} {purchases.length === 1 ? 'item' : 'items'})
                        </span>
                        <span />
                        <span />
                        <span />
                        <span className="re-num">{formatRM(spendingOf(r, referral))}</span>
                        <span className="re-num">{formatRM(commissionOf(r, referral))}</span>
                        <span />
                      </div>
                    </div>
                  )}
                  </div>
                  );
                })}
              </>
            )}
          </section>
        </main>

      {joinToast && <div className="re-toast">{joinToast}</div>}

      {requestStep === 'invoice' && invoiceRequest && (
        <div className="rc-modal-overlay" onClick={closeRequestModal}>
          <div className="rc-modal re-invoice-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="rc-modal-header">
              <h3 className="rc-modal-title">
                {invoiceRequest.status === 'Needs Revision' ? 'Re-upload Invoice' : 'Upload Invoice'}
              </h3>
              <button className="rc-modal-close" onClick={() => (invoiceRequest.status === 'Awaiting Invoice' ? setConfirmCancel(true) : closeRequestModal())}
                aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="rc-modal-desc">
              Upload your invoice to JobGiga for this request. The invoice amount must match the requested amount.
              JobGiga will review it once it's uploaded.
            </p>
            {invoiceRequest.status === 'Needs Revision' && invoiceRequest.revisionNote && (
              <div className="re-revision-note re-revision-note-modal">
                <b>JobGiga asked for a revision:</b> {invoiceRequest.revisionNote}
              </div>
            )}
            <div className="re-request-summary">
              <div>
                <span>Requested on</span>
                <b>{invoiceRequest.requestedAt}</b>
              </div>
              <div>
                <span>Companies</span>
                <b>{[...new Set((invoiceRequest.items ?? []).map((item) => item.name))].join(', ')}</b>
              </div>
              <div className="re-request-total">
                <span>Invoice amount</span>
                <b>{formatRM(invoiceRequest.amount)}</b>
              </div>
            </div>
            <label
              className={`re-dropzone${invoiceError ? ' error' : ''}${invoiceFile ? ' has-file' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                pickInvoice(e.dataTransfer.files[0]);
              }}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => {
                  pickInvoice(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6M9 15l3-3 3 3" />
              </svg>
              {invoiceFile ? (
                <span className="re-dropzone-file">
                  <b>{invoiceFile.name}</b>
                  <small>{invoiceFile.size < 1024 ? `${invoiceFile.size} bytes` : `${(invoiceFile.size / 1024).toFixed(0)} KB`} · click to choose a different file</small>
                </span>
              ) : (
                <span className="re-dropzone-file">
                  <b>Click to upload or drag your invoice here</b>
                  <small>PDF only, up to 2 MB</small>
                </span>
              )}
            </label>
            {invoiceError && <span className="re-code-hint error">{invoiceError}</span>}
            {confirmCancel ? (
              <div className="re-cancel-confirm">
                <span>
                  <b>Cancel this request?</b> It will be removed and {formatRM(invoiceRequest.amount)} becomes available to
                  request again.
                </span>
                <div className="re-cancel-confirm-actions">
                  <button className="rc-btn-secondary" onClick={() => setConfirmCancel(false)}>
                    Keep Request
                  </button>
                  <button className="re-btn-danger" onClick={cancelCommissionRequest}>
                    Yes, Cancel Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="rc-modal-actions">
                {invoiceRequest.status === 'Awaiting Invoice' && (
                  <button className="re-cancel-request" onClick={() => setConfirmCancel(true)}>
                    Cancel Request
                  </button>
                )}
                <button className="rc-btn-secondary" onClick={closeRequestModal}>
                  Upload Later
                </button>
                <button className="rc-btn-primary" onClick={submitInvoice} disabled={!invoiceFile}>
                  Submit Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div className="rc-modal-overlay" onClick={() => setEditing(false)}>
          <form
            className="rc-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              saveCode();
            }}
          >
            <div className="rc-modal-header">
              <h3 className="rc-modal-title">Edit Referral Code</h3>
              <button type="button" className="rc-modal-close" onClick={() => setEditing(false)} aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="rc-modal-desc">
              Customise the code other companies use to join JobGiga through you. Your referral link will update too.
            </p>
            <label className="rc-modal-label" htmlFor="re-code-input">
              Referral Code
            </label>
            <input
              id="re-code-input"
              className={`re-code-input${codeError && trimmedDraft !== referral.code ? ' invalid' : ''}`}
              value={draftCode}
              onChange={(e) => setDraftCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
              maxLength={16}
              autoFocus
              spellCheck={false}
            />
            <span className={`re-code-hint${codeError && trimmedDraft !== referral.code ? ' error' : ''}`}>
              {codeError && trimmedDraft !== referral.code
                ? codeError
                : `Link preview: https://jobgiga.com/vad/${trimmedDraft || '...'}`}
            </span>
            <div className="rc-modal-actions">
              <button type="button" className="rc-btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
              <button type="submit" className="rc-btn-primary" disabled={!canSave}>
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </EmployerShell>
  );
}
