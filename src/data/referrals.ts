import afedLogo from '../assets/referral/afed-logo.png';
import type { CommissionStatus, ReferralState } from '../store/referralStore';

export type Plan = 'Freemium' | 'GigaStandard' | 'GigaPremium';
export type Billing = 'Monthly' | 'Yearly';

export const PLAN_PRICES: Record<Exclude<Plan, 'Freemium'>, Record<Billing, number>> = {
  GigaStandard: { Monthly: 459, Yearly: 1759 },
  GigaPremium: { Monthly: 759, Yearly: 4459 },
};

export type ReferredCompany = {
  name: string;
  meta: string;
  logo?: string;
  industry: string;
  dateJoin: string;
  location: string;
  codeUsed: string;
  assignedId?: string;
  verified: boolean;
  plan: Plan;
  billing?: Billing;
  periodsPaid?: number;
};

export type CompanyDetails = Omit<ReferredCompany, 'dateJoin' | 'codeUsed'>;

// Demo companies that join an employer the first time they change their referral code.
export const REFERRED_BY: Record<string, CompanyDetails[]> = {
  'vads-bp': [
    { name: 'AFED Digital Sdn Bhd', meta: 'Selangor | 51-200 employees', logo: afedLogo, industry: 'Industrial technology', location: 'Shah Alam, Malaysia', verified: true, plan: 'GigaPremium', billing: 'Yearly', periodsPaid: 1 },
    { name: 'Lumina Health Clinic', meta: 'Kuala Lumpur | 11-50 employees', industry: 'Healthcare', location: 'Bangsar, Malaysia', verified: true, plan: 'GigaStandard', billing: 'Yearly', periodsPaid: 1 },
    { name: 'Orbit Freight Services', meta: 'Penang | 201-500 employees', industry: 'Logistics & supply chain', location: 'Bayan Lepas, Malaysia', verified: false, plan: 'Freemium' },
    { name: 'Kopi Tiam Co.', meta: 'Johor | 51-200 employees', industry: 'Food & beverage', location: 'Johor Bahru, Malaysia', verified: true, plan: 'GigaStandard', billing: 'Monthly', periodsPaid: 1 },
    { name: 'BrightPath Academy', meta: 'Selangor | 11-50 employees', industry: 'Education', location: 'Petaling Jaya, Malaysia', verified: false, plan: 'GigaStandard', billing: 'Monthly', periodsPaid: 1 },
  ],
};

// Simulated sign-ups that arrive after an employer changes their referral code.
export const NEW_JOINER_POOL: CompanyDetails[] = [
  { name: 'Seri Mutiara Hotel', meta: 'Melaka | 51-200 employees', industry: 'Hospitality', location: 'Bandar Hilir, Malaysia', verified: false, plan: 'Freemium' },
  { name: 'NovaCloud Systems', meta: 'Selangor | 11-50 employees', industry: 'Information technology', location: 'Cyberjaya, Malaysia', verified: true, plan: 'GigaPremium', billing: 'Monthly', periodsPaid: 1 },
  { name: 'GreenLeaf Agritech', meta: 'Pahang | 51-200 employees', industry: 'Agriculture', location: 'Kuantan, Malaysia', verified: false, plan: 'GigaStandard', billing: 'Monthly', periodsPaid: 1 },
  { name: 'Tanjung Marine Works', meta: 'Terengganu | 201-500 employees', industry: 'Marine engineering', location: 'Kemaman, Malaysia', verified: true, plan: 'GigaPremium', billing: 'Monthly', periodsPaid: 1 },
  { name: 'Urban Nest Realty', meta: 'Kuala Lumpur | 11-50 employees', industry: 'Real estate', location: 'Mont Kiara, Malaysia', verified: false, plan: 'Freemium' },
  { name: 'Pixel & Pine Studio', meta: 'Penang | 1-10 employees', industry: 'Creative & design', location: 'George Town, Malaysia', verified: true, plan: 'GigaStandard', billing: 'Monthly', periodsPaid: 1 },
];

// Saved joiners only keep name, date and code; company details come from the demo data.
export const getReferredCompanies = (companyId: string, referral: ReferralState): ReferredCompany[] => {
  const catalogue = [...(REFERRED_BY[companyId] ?? []), ...NEW_JOINER_POOL];
  return (referral.newReferrals ?? []).flatMap((r) => {
    const details = catalogue.find((c) => c.name === r.name);
    return details ? [{ ...details, dateJoin: r.dateJoin, codeUsed: r.codeUsed, assignedId: r.assignedId }] : [];
  });
};

// First code change brings in the employer's demo companies; each later change brings one more.
export const nextJoiners = (companyId: string, referral: ReferralState): CompanyDetails[] => {
  const joined = new Set((referral.newReferrals ?? []).map((r) => r.name));
  const demo = REFERRED_BY[companyId] ?? [];
  if (demo.length > 0 && !demo.some((c) => joined.has(c.name))) return demo;
  const next = NEW_JOINER_POOL.find((c) => !joined.has(c.name));
  return next ? [next] : [];
};

// Assigned codes only ever bring in companies from the pool, never the employer's first-change demo batch.
export const nextPoolJoiner = (referral: ReferralState): CompanyDetails | undefined => {
  const joined = new Set((referral.newReferrals ?? []).map((r) => r.name));
  const left = NEW_JOINER_POOL.filter((c) => !joined.has(c.name));
  // Paying companies first, so an assignee's earnings are visible in the demo.
  return left.find((c) => c.plan !== 'Freemium') ?? left[0];
};

export type Addon = { id: string; name: string; price: number; unit: string };

export const ADDONS: Addon[] = [
  { id: 'boosted-visibility', name: 'Boosted Job Visibility', price: 29, unit: 'per job posting' },
  { id: 'candidate-search', name: 'Candidate Search', price: 39, unit: 'per 20 candidates' },
  { id: 'recruiter-seat', name: 'Recruiter Seats', price: 29, unit: 'per person' },
  { id: 'panel-seat', name: 'Panel Seats', price: 29, unit: 'per person' },
  { id: 'wellbeing-test', name: 'Work Well Being Test', price: 29, unit: 'for all job postings' },
  { id: 'talent-scoreboard', name: 'Talent Scoreboard', price: 39, unit: 'for all job postings' },
];

export type PurchaseLine = {
  id: string;
  company: string;
  kind: 'plan' | 'addon';
  item: string;
  detail: string;
  amount: number;
  date: string;
};

const planSpending = (r: ReferredCompany) =>
  r.plan === 'Freemium' || !r.billing ? 0 : PLAN_PRICES[r.plan][r.billing] * (r.periodsPaid ?? 0);

const planBreakdown = (r: ReferredCompany) => {
  if (r.plan === 'Freemium' || !r.billing) return 'Free plan';
  const periods = r.periodsPaid ?? 0;
  const unit = r.billing === 'Monthly' ? 'month' : 'year';
  return `${formatRM(PLAN_PRICES[r.plan][r.billing])} × ${periods} ${unit}${periods === 1 ? '' : 's'}`;
};

export const purchaseLinesOf = (r: ReferredCompany, referral: ReferralState): PurchaseLine[] => {
  const lines: PurchaseLine[] = [];
  if (planSpending(r) > 0) {
    lines.push({
      id: `${r.name}|plan`,
      company: r.name,
      kind: 'plan',
      item: `${r.plan} · ${r.billing} plan`,
      detail: planBreakdown(r),
      amount: planSpending(r),
      date: r.dateJoin,
    });
  }
  for (const p of referral.addonPurchases ?? []) {
    const addon = ADDONS.find((a) => a.id === p.addonId);
    if (p.company !== r.name || !addon) continue;
    lines.push({
      id: `${r.name}|addon|${p.id}`,
      company: r.name,
      kind: 'addon',
      item: addon.name,
      detail: `${formatRM(addon.price)} × 1 (${addon.unit})`,
      amount: addon.price,
      date: p.date,
    });
  }
  return lines;
};

export const spendingOf = (r: ReferredCompany, referral: ReferralState) =>
  purchaseLinesOf(r, referral).reduce((sum, l) => sum + l.amount, 0);

export const spendingBreakdown = (r: ReferredCompany, referral: ReferralState) => {
  const addons = purchaseLinesOf(r, referral).filter((l) => l.kind === 'addon').length;
  const plan = r.plan === 'Freemium' || !r.billing ? 'Free plan' : planBreakdown(r);
  return addons > 0 ? `${plan} + ${addons} add-on${addons === 1 ? '' : 's'}` : plan;
};

export const formatRM = (amount: number) =>
  `RM ${amount.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;


const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (date: Date) => {
  const d = date.getDate();
  const suffix = d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th';
  return `${d}${suffix} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const parseDate = (value: string) => {
  const [day, month, year] = value.split(' ');
  return new Date(Number(year), MONTHS.indexOf(month), parseInt(day, 10));
};

// "19th Aug 2026" → "Aug 2026"
export const monthOf = (value: string) => value.split(' ').slice(1).join(' ');

export const monthsOf = (dates: string[]) =>
  [...new Set(dates.map(monthOf))].sort((a, b) => parseDate(`1st ${b}`).getTime() - parseDate(`1st ${a}`).getTime());

// Random join dates (newest first) between the latest existing join and today, at most 60 days back.
export const randomJoinDates = (count: number, latestJoin?: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sinceLatest = latestJoin ? Math.round((today.getTime() - parseDate(latestJoin).getTime()) / 86_400_000) : 60;
  const maxDaysAgo = Math.max(0, Math.min(60, sinceLatest));
  return Array.from({ length: count }, () => Math.floor(Math.random() * (maxDaysAgo + 1)))
    .sort((a, b) => a - b)
    .map((daysAgo) => formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysAgo)));
};

// What a code being checked is allowed to collide with: the main code it is replacing, or the assigned code it is editing.
export type CodeExemption = { mainOf?: string; assignedId?: string };

export type CodeConflict = 'taken' | 'retired';

// A code must be unique across every company's main code and every assigned code,
// and a code that was replaced is retired for good.
export const codeConflict = (
  code: string,
  referrals: Record<string, ReferralState>,
  exempt: CodeExemption,
): CodeConflict | null => {
  const states = Object.entries(referrals);
  if (states.some(([, r]) => (r.retiredCodes ?? []).includes(code))) return 'retired';
  const taken = states.some(
    ([id, r]) =>
      (id !== exempt.mainOf && r.code?.toUpperCase() === code) ||
      (r.assignedCodes ?? []).some((a) => a.id !== exempt.assignedId && a.code.toUpperCase() === code),
  );
  return taken ? 'taken' : null;
};

export const isCodeTaken = (code: string, referrals: Record<string, ReferralState>, exempt: CodeExemption) =>
  codeConflict(code, referrals, exempt) !== null;

export const conflictMessage = (conflict: CodeConflict) =>
  conflict === 'retired' ? 'This code was used before and cannot be used again.' : 'This code is already in use.';

export type AssigneeStats = {
  companies: ReferredCompany[];
  spending: number;
  commission: number;
};

// Assignees earn the employer's commission rate; the employer requests it from JobGiga and passes it on.
export const assigneeStats = (
  companyId: string,
  referral: ReferralState,
  assigned: { id: string },
): AssigneeStats => {
  const companies = getReferredCompanies(companyId, referral).filter((c) => c.assignedId === assigned.id);
  const spending = companies.reduce((sum, c) => sum + spendingOf(c, referral), 0);
  const commission = Math.round(companies.reduce((sum, c) => sum + commissionOf(c, referral), 0) * 100) / 100;
  return { companies, spending, commission };
};

export const lineCommission = (amount: number, rate: number) => Math.round(amount * rate) / 100;

export const commissionOf = (r: ReferredCompany, referral: ReferralState) =>
  Math.round(
    purchaseLinesOf(r, referral).reduce((sum, l) => sum + lineCommission(l.amount, referral.commission ?? 0), 0) * 100,
  ) / 100;

const OPEN_STATUSES = ['Awaiting Invoice', 'In Review', 'Needs Revision', 'Approved', 'Paid'];
const IN_PROGRESS_STATUSES = ['Awaiting Invoice', 'In Review', 'Needs Revision'];

// Commission already claimed per purchase line; rejected requests free it up again.
const claimedByLine = (referral: ReferralState) => {
  const claimed = new Map<string, number>();
  for (const q of referral.commissionRequests ?? []) {
    if (!OPEN_STATUSES.includes(q.status)) continue;
    for (const item of q.items ?? []) claimed.set(item.lineId, (claimed.get(item.lineId) ?? 0) + item.amount);
  }
  return claimed;
};

export type RequestableLine = { line: PurchaseLine; company: ReferredCompany; amount: number };

export const requestableCommissions = (companyId: string, referral: ReferralState): RequestableLine[] => {
  const claimed = claimedByLine(referral);
  const rate = referral.commission ?? 0;
  return getReferredCompanies(companyId, referral).flatMap((company) =>
    purchaseLinesOf(company, referral)
      .map((line) => ({
        line,
        company,
        amount: Math.round((lineCommission(line.amount, rate) - (claimed.get(line.id) ?? 0)) * 100) / 100,
      }))
      .filter((row) => row.amount > 0),
  );
};

export const commissionSummary = (companyId: string, referral: ReferralState) => {
  const earned = getReferredCompanies(companyId, referral).reduce((sum, r) => sum + commissionOf(r, referral), 0);
  const requests = referral.commissionRequests ?? [];
  const total = (statuses: string[]) =>
    requests.filter((q) => statuses.includes(q.status)).reduce((sum, q) => sum + q.amount, 0);
  const available = requestableCommissions(companyId, referral).reduce((sum, row) => sum + row.amount, 0);
  return {
    earned,
    inProgress: total(IN_PROGRESS_STATUSES),
    approved: total(['Approved']),
    paid: total(['Paid']),
    available: Math.round(available * 100) / 100,
  };
};

export type CompanyCommissionStatus = 'No Commission' | 'Not Requested' | CommissionStatus;

// A company with several purchases shows the status that most needs attention.
const STATUS_PRIORITY: CompanyCommissionStatus[] = [
  'Not Requested',
  'Rejected',
  'Needs Revision',
  'Awaiting Invoice',
  'In Review',
  'Approved',
  'Paid',
];

export const companyCommissionStatus = (r: ReferredCompany, referral: ReferralState): CompanyCommissionStatus => {
  if (commissionOf(r, referral) <= 0) return 'No Commission';
  const requests = referral.commissionRequests ?? [];
  const lineStatuses = purchaseLinesOf(r, referral).map((line): CompanyCommissionStatus => {
    const latest = requests.find((q) => (q.items ?? []).some((item) => item.lineId === line.id));
    return latest ? latest.status : 'Not Requested';
  });
  return STATUS_PRIORITY.find((status) => lineStatuses.includes(status)) ?? 'Not Requested';
};

export const lineCommissionStatus = (line: PurchaseLine, referral: ReferralState): CompanyCommissionStatus => {
  const latest = (referral.commissionRequests ?? []).find((q) => (q.items ?? []).some((item) => item.lineId === line.id));
  return latest ? latest.status : 'Not Requested';
};

export const purchaseSummary = (r: ReferredCompany, referral: ReferralState) => {
  const lines = purchaseLinesOf(r, referral);
  const addons = lines.filter((l) => l.kind === 'addon').length;
  const base = lines.some((l) => l.kind === 'plan') ? 'Plan' : 'Free plan';
  return addons > 0 ? `${base} + ${addons} add-on${addons === 1 ? '' : 's'}` : lines.length > 0 ? 'Plan only' : 'Free plan';
};

// A random earlier referral buys one add-on, simulating repeat spending on the platform.
export const nextAddonPurchase = (companyId: string, referral: ReferralState) => {
  const existing = getReferredCompanies(companyId, referral);
  if (existing.length === 0) return null;
  const company = existing[Math.floor(Math.random() * existing.length)];
  const addon = ADDONS[Math.floor(Math.random() * ADDONS.length)];
  return { company: company.name, addon };
};

export const statusSlug = (status: string) => status.toLowerCase().replace(/ /g, '-');

export const openInvoice = (dataUrl: string) => {
  const [meta, base64] = dataUrl.split(',');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: meta.match(/data:(.*?);/)?.[1] ?? 'application/pdf' });
  window.open(URL.createObjectURL(blob), '_blank', 'noopener');
};
