import { useState } from 'react';
import './AssignedCodes.css';
import type { Company } from '../data/companies';
import {
  assigneeStats,
  formatDate,
  formatRM,
  codeConflict,
  conflictMessage,
  isCodeTaken,
  nextPoolJoiner,
  randomJoinDates,
} from '../data/referrals';
import { updateReferral, type AssignedCode, type ReferralMap } from '../store/referralStore';

type Draft = { name: string; email: string; code: string };

const emptyDraft = (): Draft => ({ name: '', email: '', code: '' });

const generateCode = (name: string, taken: (code: string) => boolean) => {
  const prefix = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'X');
  for (let i = 0; i < 50; i++) {
    const code = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    if (!taken(code)) return code;
  }
  return `${prefix}-${Date.now().toString().slice(-6)}`;
};

export default function AssignedCodes({
  company,
  referrals,
  onToast,
}: {
  company: Company;
  referrals: ReferralMap;
  onToast: (message: string) => void;
}) {
  const referral = referrals[company.id];
  const assigned = referral.assignedCodes ?? [];
  const rate = referral.commission ?? 0;

  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [touched, setTouched] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rows = assigned.map((a) => ({ a, stats: assigneeStats(company.id, referral, a) }));
  const totals = rows.reduce(
    (sum, { stats }) => ({
      companies: sum.companies + stats.companies.length,
      commission: sum.commission + stats.commission,
    }),
    { companies: 0, commission: 0 },
  );

  const current = assigned.find((a) => a.id === editingId);
  const exemptId = editingId === 'new' || editingId === null ? undefined : editingId;
  const code = draft.code.trim();
  const errors = {
    name: draft.name.trim() ? null : 'Name is required.',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim()) ? null : 'Enter a valid email address.',
    code:
      code.length === 0
        ? 'Referral code is required.'
        : !/^[A-Z0-9-]+$/.test(code)
          ? 'Use letters, numbers and dashes only.'
          : code.length < 4 || code.length > 16
            ? 'Code must be 4 to 16 characters.'
            : codeConflict(code, referrals, { assignedId: exemptId })
              ? conflictMessage(codeConflict(code, referrals, { assignedId: exemptId })!)
              : null,
  };
  const valid = !errors.name && !errors.email && !errors.code;
  const show = (field: keyof typeof errors) => (touched ? errors[field] : null);

  const openNew = () => {
    setDraft(emptyDraft());
    setTouched(false);
    setEditingId('new');
  };

  const openEdit = (a: AssignedCode) => {
    setDraft({ name: a.name, email: a.email, code: a.code });
    setTouched(false);
    setEditingId(a.id);
  };

  const close = () => setEditingId(null);

  const copyCode = async (a: AssignedCode) => {
    try {
      await navigator.clipboard.writeText(a.code);
      setCopiedId(a.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };

  // Each new code, and each later change to a code, brings in one more company (prototype simulation).
  const withJoiner = (assignedId: string, codeUsed: string) => {
    const joiner = nextPoolJoiner(referral);
    if (!joiner) return { newReferrals: referral.newReferrals, joiner: undefined };
    const [dateJoin] = randomJoinDates(1, referral.newReferrals?.[0]?.dateJoin);
    return {
      newReferrals: [{ name: joiner.name, dateJoin, codeUsed, assignedId }, ...(referral.newReferrals ?? [])],
      joiner,
    };
  };

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const fields = { name: draft.name.trim(), email: draft.email.trim(), code };
    if (editingId === 'new') {
      const id = `${company.id}-assign-${Date.now()}`;
      const { newReferrals, joiner } = withJoiner(id, code);
      updateReferral(company.id, {
        assignedCodes: [...assigned, { id, ...fields, active: true, createdAt: formatDate(new Date()) }],
        newReferrals,
      });
      onToast(
        joiner
          ? `${code} assigned to ${fields.name} · ${joiner.name} just joined using it`
          : `${code} assigned to ${fields.name}`,
      );
    } else if (current) {
      const codeChanged = fields.code !== current.code;
      const extra = codeChanged && current.active ? withJoiner(current.id, fields.code) : null;
      updateReferral(company.id, {
        assignedCodes: assigned.map((a) => (a.id === current.id ? { ...a, ...fields } : a)),
        ...(codeChanged ? { retiredCodes: [...new Set([...(referral.retiredCodes ?? []), current.code])] } : {}),
        ...(extra ? { newReferrals: extra.newReferrals } : {}),
      });
      onToast(
        extra?.joiner
          ? `${fields.name}'s code updated · ${extra.joiner.name} just joined using ${fields.code}`
          : `${fields.name}'s code updated`,
      );
    }
    close();
  };

  const toggleActive = (a: AssignedCode) => {
    updateReferral(company.id, {
      assignedCodes: assigned.map((x) => (x.id === a.id ? { ...x, active: !x.active } : x)),
    });
    onToast(a.active ? `${a.code} paused. It won't bring in new companies.` : `${a.code} is active again.`);
  };

  const remove = (a: AssignedCode) => {
    // Companies that already joined stay referred; they just lose the assignee tag.
    updateReferral(company.id, {
      assignedCodes: assigned.filter((x) => x.id !== a.id),
      newReferrals: (referral.newReferrals ?? []).map((r) => (r.assignedId === a.id ? { ...r, assignedId: undefined } : r)),
    });
    onToast(`${a.code} removed. Its companies stay under your account.`);
  };

  return (
    <div className="ac-section">
      <div className="ac-head">
        <div>
          <span className="re-card-title">Assigned Referral Codes</span>
          <span className="ac-desc">
            Give a person their own code. They earn the same {rate}% commission as you on every company that joins with it.
          </span>
        </div>
        <button className="rc-btn-primary" onClick={openNew}>
          + Assign Code
        </button>
      </div>

      {assigned.length === 0 ? (
        <div className="ac-empty">
          <b>No assigned codes yet</b>
          <span>Assign a code to a partner or team member to track the companies they bring in separately.</span>
        </div>
      ) : (
        <>
          <div className="ac-grid ac-table-head">
            <span>Assigned To</span>
            <span>Code</span>
            <span>Joined</span>
            <span>Spending</span>
            <span>Commission</span>
            <span>Assignee Earns</span>
            <span>Status</span>
            <span className="ac-right">Action</span>
          </div>
          {rows.map(({ a, stats }) => (
            <div key={a.id} className={`ac-grid ac-row${a.active ? '' : ' paused'}`}>
              <span className="ac-person">
                <b>{a.name}</b>
                <small>{a.email}</small>
              </span>
              <span className="ac-code">
                <span className="rc-pill rc-pill-teal">{a.code}</span>
                <button className="ac-icon" onClick={() => copyCode(a)} aria-label={`Copy ${a.code}`} title="Copy code">
                  {copiedId === a.id ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12.5l5 5L20 6.5" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="12" height="12" rx="2" />
                      <path d="M5 15V5a2 2 0 0 1 2-2h8" />
                    </svg>
                  )}
                </button>
              </span>
              <span>
                {stats.companies.length} {stats.companies.length === 1 ? 'company' : 'companies'}
              </span>
              <span>{formatRM(stats.spending)}</span>
              <span>{formatRM(stats.commission)}</span>
              <span className="ac-share">
                <b>{formatRM(stats.commission)}</b>
                <small>{rate}% of spending</small>
              </span>
              <span>
                <button
                  className={`rc-switch${a.active ? ' on' : ''}`}
                  onClick={() => toggleActive(a)}
                  role="switch"
                  aria-checked={a.active}
                  aria-label={`${a.active ? 'Pause' : 'Activate'} ${a.code}`}
                >
                  <span className="rc-switch-knob" />
                </button>
              </span>
              <span className="ac-actions">
                <button className="ac-icon" onClick={() => openEdit(a)} aria-label={`Edit ${a.code}`} title="Edit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </button>
                <button className="ac-icon danger" onClick={() => remove(a)} aria-label={`Remove ${a.code}`} title="Remove">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
                  </svg>
                </button>
              </span>
            </div>
          ))}
          <div className="ac-foot">
            <span>
              {totals.companies} {totals.companies === 1 ? 'company' : 'companies'} via assigned codes
            </span>
            <span>
              Owed to assignees <b className="teal">{formatRM(Math.round(totals.commission * 100) / 100)}</b>
            </span>
          </div>
          <p className="ac-note">
            You request the commission from JobGiga as usual, then pay assignees what they earned.
          </p>
        </>
      )}

      {editingId !== null && (
        <div className="rc-modal-overlay" onClick={close}>
          <form
            className="rc-modal ac-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
            noValidate
          >
            <div className="rc-modal-header">
              <h3 className="rc-modal-title">{editingId === 'new' ? 'Assign Referral Code' : 'Edit Assigned Code'}</h3>
              <button type="button" className="rc-modal-close" onClick={close} aria-label="Close">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <p className="rc-modal-desc">
              Companies that join with this code are tracked under this person. They earn the same {rate}% commission as you.
            </p>

            <div className="ac-field">
              <label className="rc-modal-label" htmlFor="ac-name">
                Full name
              </label>
              <input
                id="ac-name"
                className={`ac-input${show('name') ? ' invalid' : ''}`}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Aisha Rahman"
                autoFocus
              />
              {show('name') && <span className="re-code-hint error">{show('name')}</span>}
            </div>

            <div className="ac-field">
              <label className="rc-modal-label" htmlFor="ac-email">
                Email
              </label>
              <input
                id="ac-email"
                type="email"
                className={`ac-input${show('email') ? ' invalid' : ''}`}
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                placeholder="name@example.com"
              />
              {show('email') && <span className="re-code-hint error">{show('email')}</span>}
            </div>

            <div className="ac-field">
              <label className="rc-modal-label" htmlFor="ac-code">
                Referral code
              </label>
              <div className="ac-code-row">
                <input
                  id="ac-code"
                  className={`ac-input ac-code-input${show('code') ? ' invalid' : ''}`}
                  value={draft.code}
                  onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                  maxLength={16}
                  spellCheck={false}
                  placeholder="AIS-4821"
                />
                <button
                  type="button"
                  className="rc-btn-secondary"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      code: generateCode(draft.name, (c) =>
                        isCodeTaken(c, referrals, { assignedId: exemptId }),
                      ),
                    })
                  }
                >
                  Generate
                </button>
              </div>
              <span className={`re-code-hint${show('code') ? ' error' : ''}`}>
                {show('code') ?? `Link preview: https://jobgiga.com/vad/${code || '...'}`}
              </span>
            </div>

            <div className="rc-modal-actions">
              <button type="button" className="rc-btn-secondary" onClick={close}>
                Cancel
              </button>
              <button type="submit" className="rc-btn-primary">
                {editingId === 'new' ? 'Assign Code' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
