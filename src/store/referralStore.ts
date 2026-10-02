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
    cachedValue = { ...defaults(), ...stored };
  }
  return cachedValue;
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
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useReferrals(): ReferralMap {
  return useSyncExternalStore(subscribe, getSnapshot);
}
