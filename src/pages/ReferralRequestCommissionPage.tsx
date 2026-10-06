import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ReferralRequestCommissionPage.css';
import EmployerShell from '../components/EmployerShell';
import MonthDropdown from '../components/MonthDropdown';
import { COMPANIES, initials } from '../data/companies';
import {
  commissionSummary,
  formatDate,
  formatRM,
  monthOf,
  monthsOf,
  parseDate,
  requestableCommissions,
} from '../data/referrals';
import { claimAdviceNo, updateReferral, useReferrals } from '../store/referralStore';

export default function ReferralRequestCommissionPage() {
  const navigate = useNavigate();
  const referrals = useReferrals();
  const [searchParams, setSearchParams] = useSearchParams();
  const company = COMPANIES.find((c) => c.id === searchParams.get('company')) ?? COMPANIES[0];
  const referral = referrals[company.id];
  const rate = referral.commission ?? 0;
  const requestable = requestableCommissions(company.id, referral);
  const commission = commissionSummary(company.id, referral);

  const [month, setMonth] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const months = monthsOf(requestable.map((row) => row.line.date));
  const visible = month === 'all' ? requestable : requestable.filter((row) => monthOf(row.line.date) === month);
  const selectedRows = visible.filter((row) => selectedIds.includes(row.line.id));
  const selectedSpending = selectedRows.reduce((sum, row) => sum + row.line.amount, 0);
  const selectedAmount = Math.round(selectedRows.reduce((sum, row) => sum + row.amount, 0) * 100) / 100;
  // Rows can be frozen at different rates (different companies joined at different times), so the
  // "effective" rate is worked out from the real totals rather than assumed from the employer's live rate.
  const effectiveRate = (rows: typeof visible, spending: number, amount: number) => {
    const rates = new Set(rows.map((row) => row.line.rate));
    if (rates.size === 1) return [...rates][0];
    return spending > 0 ? Math.round((amount / spending) * 10000) / 100 : rate;
  };
  // What to actually show for "Commission rate": each distinct rate involved, highest first, rather
  // than one blended number that no single row is really earning.
  const rateLabel = (rows: typeof visible) => {
    const rates = [...new Set(rows.map((row) => row.line.rate))].sort((a, b) => b - a);
    return rates.length > 0 ? rates.map((r) => `${r}%`).join(' / ') : `${rate}%`;
  };
  const visibleRate = effectiveRate(visible, visible.reduce((s, r) => s + r.line.amount, 0), visible.reduce((s, r) => s + r.amount, 0));
  const selectedRate = effectiveRate(selectedRows, selectedSpending, selectedAmount);
  const allSelected = visible.length > 0 && selectedRows.length === visible.length;
  const selectedCompanies = new Set(selectedRows.map((row) => row.company.name)).size;

  // Purchases are grouped by the exact code each company joined with, not just "the main code" vs
  // "an assigned code" - a company's code can have been replaced since, and each code carries its own
  // frozen rate, so lumping VAD-0002 purchases under today's VAD-0004 label would show the wrong rate.
  const assignedCodes = referral.assignedCodes ?? [];
  const byCode = new Map<string, typeof visible>();
  for (const row of visible) {
    const key = row.company.codeUsed;
    byCode.set(key, [...(byCode.get(key) ?? []), row]);
  }
  const groups = [...byCode.entries()]
    .map(([code, rows]) => {
      const assigned = assignedCodes.find((a) => a.id === rows[0].company.assignedId);
      return {
        id: code,
        title: assigned ? `Assigned to ${assigned.name}` : 'Your referral code',
        sub: `${code} · earns ${rows[0].line.rate}%`,
        assigned,
        isCurrent: !assigned && code === referral.code,
        latest: Math.max(...rows.map((row) => parseDate(row.line.date).getTime())),
        rows,
      };
    })
    // The code in use right now first, then other past codes newest first, main codes before assigned ones.
    .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent) || Number(!a.assigned) - Number(!b.assigned) || b.latest - a.latest);
  const sumCommission = (rows: typeof visible) => Math.round(rows.reduce((sum, row) => sum + row.amount, 0) * 100) / 100;
  const selectedViaAssigned = selectedRows.filter((row) => assignedCodes.some((a) => a.id === row.company.assignedId));
  const selectedViaMain = selectedRows.filter((row) => !selectedViaAssigned.includes(row));
  const assigneeOwed = sumCommission(selectedViaAssigned);
  const toggleGroup = (rows: typeof visible) => {
    const ids = rows.map((row) => row.line.id);
    const all = ids.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => (all ? prev.filter((id) => !ids.includes(id)) : [...new Set([...prev, ...ids])]));
  };

  const backToCompany = () => navigate(`/referral-code-employer?company=${company.id}`);

  const changeCompany = (id: string) => {
    setSearchParams({ company: id });
    setMonth('all');
    setSelectedIds([]);
  };

  // Switching month starts a fresh selection, so nothing from another month is claimed by accident.
  const changeMonth = (next: string) => {
    setMonth(next);
    setSelectedIds([]);
  };

  const toggle = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));

  const sendRequest = () => {
    if (selectedRows.length === 0) return;
    const id = `${company.id}-${Date.now()}`;
    updateReferral(company.id, {
      commissionRequests: [
        {
          id,
          adviceNo: claimAdviceNo(),
          amount: selectedAmount,
          rate: selectedRate,
          requestedAt: formatDate(new Date()),
          status: 'Awaiting Invoice',
          items: selectedRows.map((row) => ({
            name: row.company.name,
            lineId: row.line.id,
            label: row.line.item,
            amount: row.amount,
          })),
        },
        ...(referral.commissionRequests ?? []),
      ],
    });
    navigate(`/referral-code-employer?company=${company.id}&invoice=${id}`);
  };

  return (
    <EmployerShell company={company} onCompanyChange={changeCompany}>
      <main className="rc-content">
        <button className="rq-back" onClick={backToCompany}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to My Company
        </button>
        <div className="rq-title-row">
          <div>
            <h1 className="rc-page-title rq-title">Request Commission</h1>
            <p className="rq-desc">
              Select the purchases you want to claim commission for. After sending, you'll upload an invoice for the
              selected amount.
            </p>
          </div>
        </div>

        {requestable.length === 0 ? (
          <div className="rq-empty">
            <b>Nothing to request right now</b>
            <span>
              Commission becomes available when companies that joined with your referral code buy a plan or add-on.
            </span>
            <button className="rc-btn-secondary" onClick={backToCompany}>
              Back to My Company
            </button>
          </div>
        ) : (
          <div className="rq-layout">
            <section className="rq-card">
              <div className="rq-toolbar">
                <div className="re-month-filter rq-filter">
                  <span>Purchase month</span>
                  <MonthDropdown
                    value={month}
                    onChange={changeMonth}
                    options={['all', ...months].map((m) => ({
                      value: m,
                      label: m === 'all' ? 'All months' : m,
                      count: m === 'all' ? requestable.length : requestable.filter((row) => monthOf(row.line.date) === m).length,
                    }))}
                  />
                </div>
                <span className="rq-toolbar-note">
                  {visible.length} {visible.length === 1 ? 'purchase' : 'purchases'} available · {visibleRate}% commission
                </span>
              </div>

              <div className="rq-grid rq-head">
                <input
                  type="checkbox"
                  className="re-check"
                  checked={allSelected}
                  onChange={() => setSelectedIds(allSelected ? [] : visible.map((row) => row.line.id))}
                  aria-label="Select all"
                />
                <span>Company</span>
                <span>Purchased</span>
                <span>Date</span>
                <span>Price × Qty</span>
                <span className="re-num">Spending</span>
                {/* No single % here: groups below can be frozen at different rates (each shows its own). */}
                <span className="re-num">Commission</span>
              </div>

              {groups.map((g) => {
                const groupSelected = g.rows.filter((row) => selectedIds.includes(row.line.id));
                return (
                  <div key={g.id} className="rq-group">
                    <label className="rq-grid rq-group-head">
                      <input
                        type="checkbox"
                        className="re-check"
                        checked={groupSelected.length === g.rows.length}
                        onChange={() => toggleGroup(g.rows)}
                        aria-label={`Select all from ${g.title}`}
                      />
                      <span className="rq-group-title">
                        <b>{g.title}</b>
                        <span className="rc-pill rc-pill-teal">{g.sub}</span>
                      </span>
                      <span className="rq-group-total">
                        {g.rows.length} {g.rows.length === 1 ? 'purchase' : 'purchases'} · {formatRM(sumCommission(g.rows))}
                      </span>
                    </label>
                    {g.rows.map(({ company: r, line, amount }) => {
                const checked = selectedIds.includes(line.id);
                    return (
                      <label key={line.id} className={`rq-grid rq-row${checked ? ' selected' : ''}`}>
                        <input type="checkbox" className="re-check" checked={checked} onChange={() => toggle(line.id)} />
                        <span className="rq-company">
                          <span className="rq-logo">
                            {r.logo ? <img src={r.logo} alt="" /> : initials(r.name)}
                          </span>
                          <span className="rq-company-text">
                            <b>{r.name}</b>
                            <small>
                              {r.industry} · code {r.codeUsed}
                            </small>
                          </span>
                        </span>
                        <span className="rq-item">
                          {line.item}
                          <span className={`rq-kind ${line.kind}`}>{line.kind === 'plan' ? 'Plan' : 'Add-on'}</span>
                        </span>
                        <span className="rq-muted">{line.date}</span>
                        <span className="rq-muted">{line.detail}</span>
                        <span className="re-num">{formatRM(line.amount)}</span>
                        <span className="re-num rq-commission">{formatRM(amount)}</span>
                      </label>
                    );
                    })}
                  </div>
                );
              })}

              <div className="rq-grid rq-foot">
                <span />
                <span>
                  Selected ({selectedRows.length} of {visible.length})
                </span>
                <span />
                <span />
                <span />
                <span className="re-num">{formatRM(selectedSpending)}</span>
                <span className="re-num">{formatRM(selectedAmount)}</span>
              </div>
            </section>

            <aside className="rq-card rq-summary">
              <h2>Summary</h2>
              <div className="rq-summary-line">
                <span>Available to request</span>
                <b>{formatRM(commission.available)}</b>
              </div>
              <div className="rq-summary-line">
                <span>Selected</span>
                <b>
                  {selectedRows.length} {selectedRows.length === 1 ? 'item' : 'items'} · {selectedCompanies}{' '}
                  {selectedCompanies === 1 ? 'company' : 'companies'}
                </b>
              </div>
              <div className="rq-summary-line">
                <span>Via your referral code</span>
                <b>{formatRM(sumCommission(selectedViaMain))}</b>
              </div>
              {assignedCodes.length > 0 && (
                <div className="rq-summary-line">
                  <span>Via assigned codes</span>
                  <b>{formatRM(sumCommission(selectedViaAssigned))}</b>
                </div>
              )}
              <div className="rq-summary-line">
                <span>Referral spending</span>
                <b>{formatRM(selectedSpending)}</b>
              </div>
              <div className="rq-summary-line">
                <span>Commission rate</span>
                <b>{selectedRows.length > 0 ? rateLabel(selectedRows) : `${rate}%`}</b>
              </div>
              <div className="rq-summary-total">
                <span>Amount to request</span>
                <b>{formatRM(selectedAmount)}</b>
              </div>
              {assigneeOwed > 0 && (
                <p className="rq-owed">
                  Of this, <b>{formatRM(assigneeOwed)}</b> is paid on to assignees.
                </p>
              )}
              <button className="rc-btn-primary rq-send" onClick={sendRequest} disabled={selectedRows.length === 0}>
                Send Request
              </button>
              <button className="rc-btn-secondary rq-cancel" onClick={backToCompany}>
                Cancel
              </button>
              <p className="rq-note">
                {selectedRows.length === 0
                  ? 'Tick the purchases you want to claim to continue.'
                  : `Next, you'll upload a PDF invoice for ${formatRM(selectedAmount)}.`}
              </p>
            </aside>
          </div>
        )}
      </main>
    </EmployerShell>
  );
}
