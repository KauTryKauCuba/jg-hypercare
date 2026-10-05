import { useSyncExternalStore } from 'react';
import { COMPANIES } from '../data/companies';

export type AddonPurchase = {
  id: string;
  company: string;
  addonId: string;
  date: string;
};

export type JoinedCompany = {
  name: string;
  dateJoin: string;
  codeUsed: string;
  // Set when the company joined through a code VADS assigned to someone, not the main code.
  assignedId?: string;
};

// A code the employer hands to a specific person, who earns the employer's commission rate on every company it brings in.
export type AssignedCode = {
  id: string;
  name: string;
  email: string;
  code: string;
  active: boolean;
  createdAt: string;
};

export type CommissionStatus =
  | 'Awaiting Invoice'
  | 'In Review'
  | 'Needs Revision'
  | 'Approved'
  | 'Paid'
  | 'Rejected';

export type CommissionInvoice = {
  fileName: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
};

export type CommissionRequest = {
  id: string;
  // Running number shown as CA-000001 on the commission advice. Never reused, even after a cancel.
  adviceNo?: number;
  amount: number;
  rate: number;
  requestedAt: string;
  status: CommissionStatus;
  decidedAt?: string;
  // One entry per purchase line (a plan or an add-on) the commission is claimed for.
  items: { name: string; lineId: string; label: string; amount: number }[];
  invoice?: CommissionInvoice;
  revisionNote?: string;
  payment?: { paidAt: string; reference: string; proof?: CommissionInvoice };
};

export type ReferralState = {
  active: boolean;
  commission: number | null;
  code: string | null;
  newReferrals?: JoinedCompany[];
  assignedCodes?: AssignedCode[];
  // Codes this company used before and replaced. They can never be used again, by anyone.
  retiredCodes?: string[];
  addonPurchases?: AddonPurchase[];
  commissionRequests?: CommissionRequest[];
};

export type ReferralMap = Record<string, ReferralState>;

const STORAGE_KEY = 'jg-hypercare:referrals';
const ADVICE_COUNTER_KEY = 'jg-hypercare:referrals-advice-counter';
const SALES_INVOICE_KEY = 'jg-hypercare:referrals-sales-invoices';
const CHANGE_EVENT = 'jg-hypercare:referrals-change';

const defaults = (): ReferralMap =>
  Object.fromEntries(COMPANIES.map((c) => [c.id, { active: false, commission: null, code: c.referralCode }]));

let cachedRaw: string | null | undefined;
let cachedValue: ReferralMap = defaults();

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

// useSyncExternalStore needs a stable reference until the stored value actually changes.
function getSnapshot(): ReferralMap {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    let stored: ReferralMap = {};
    try {
      stored = raw ? JSON.parse(raw) : {};
    } catch {
      stored = {};
    }
    cachedValue = numberOldRequests({ ...defaults(), ...stored });
  }
  return cachedValue;
}

const requestTime = (request: CommissionRequest) => Number(request.id.split('-').pop()) || 0;

const highestAdviceNo = (map: ReferralMap) =>
  Math.max(0, ...Object.values(map).flatMap((r) => (r.commissionRequests ?? []).map((q) => q.adviceNo ?? 0)));

function readAdviceCounter(): number {
  try {
    return Number(localStorage.getItem(ADVICE_COUNTER_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveAdviceCounter(value: number) {
  try {
    localStorage.setItem(ADVICE_COUNTER_KEY, String(value));
  } catch {
    // the requests still carry their numbers, so the counter can be rebuilt from them
  }
}

// Requests made before advice numbers existed get one once, oldest first, and are saved straight away.
function numberOldRequests(map: ReferralMap): ReferralMap {
  const missing = Object.values(map)
    .flatMap((r) => r.commissionRequests ?? [])
    .filter((q) => q.adviceNo === undefined)
    .sort((a, b) => requestTime(a) - requestTime(b));
  if (missing.length === 0) return map;
  let next = Math.max(readAdviceCounter(), highestAdviceNo(map));
  const assigned = new Map(missing.map((q) => [q.id, (next += 1)]));
  const numbered: ReferralMap = Object.fromEntries(
    Object.entries(map).map(([id, r]) => [
      id,
      r.commissionRequests
        ? { ...r, commissionRequests: r.commissionRequests.map((q) => (assigned.has(q.id) ? { ...q, adviceNo: assigned.get(q.id) } : q)) }
        : r,
    ]),
  );
  try {
    const raw = JSON.stringify(numbered);
    localStorage.setItem(STORAGE_KEY, raw);
    cachedRaw = raw;
  } catch {
    // keep the numbers in memory for this session
  }
  saveAdviceCounter(next);
  return numbered;
}

export const getReferralsSnapshot = () => getSnapshot();

// Sales invoice numbers per purchase line, e.g. IV-JBG2608-0001 (year + month of payment, running per month).
// A number is fixed once given; new purchases continue that month's count.
export function assignSalesInvoiceNos(lines: { id: string; period: string; order: number }[]): Record<string, string> {
  let numbers: Record<string, string> = {};
  try {
    numbers = JSON.parse(localStorage.getItem(SALES_INVOICE_KEY) ?? '{}');
  } catch {
    numbers = {};
  }
  const missing = lines.filter((l) => !numbers[l.id]).sort((a, b) => a.order - b.order);
  if (missing.length === 0) return numbers;
  const next = { ...numbers };
  const lastInPeriod = (period: string) =>
    Math.max(
      0,
      ...Object.values(next)
        .filter((n) => n.startsWith(`IV-JBG${period}-`))
        .map((n) => Number(n.split('-').pop()) || 0),
    );
  for (const line of missing) {
    next[line.id] = `IV-JBG${line.period}-${String(lastInPeriod(line.period) + 1).padStart(4, '0')}`;
  }
  try {
    localStorage.setItem(SALES_INVOICE_KEY, JSON.stringify(next));
  } catch {
    // numbers still work for this view
  }
  return next;
}

// Hands out the next advice number for a new commission request.
export function claimAdviceNo(): number {
  const next = Math.max(readAdviceCounter(), highestAdviceNo(getSnapshot())) + 1;
  saveAdviceCounter(next);
  return next;
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) onChange();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(next: ReferralMap): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function updateReferral(companyId: string, patch: Partial<ReferralState>): boolean {
  const current = getSnapshot();
  return write({ ...current, [companyId]: { ...current[companyId], ...patch } });
}

export function resetReferrals() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ADVICE_COUNTER_KEY);
    localStorage.removeItem(SALES_INVOICE_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useReferrals(): ReferralMap {
  return useSyncExternalStore(subscribe, getSnapshot);
}
