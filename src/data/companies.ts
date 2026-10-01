import vadsLogo from '../assets/referral/vads-logo.png';

export type Company = {
  id: string;
  name: string;
  meta: string;
  logo?: string;
  jobPostings: number;
  admins: number;
  panels: number;
  verified: boolean;
  subscription: string;
  referralCode: string | null;
};

export const COMPANIES: Company[] = [
  { id: 'vads-bp', name: 'VADS BP', meta: 'Selangor | No Exp Required', logo: vadsLogo, jobPostings: 1, admins: 1, panels: 1, verified: false, subscription: 'Freemium', referralCode: null },
  { id: 'nexora-tech', name: 'Nexora Tech Sdn Bhd', meta: 'Kuala Lumpur | 2 Years Exp', jobPostings: 4, admins: 2, panels: 3, verified: true, subscription: 'GigaPremium', referralCode: 'NEX-4821' },
  { id: 'harbor-logistics', name: 'Harbor Logistics', meta: 'Penang | 1 Year Exp', jobPostings: 2, admins: 1, panels: 2, verified: true, subscription: 'Freemium', referralCode: null },
  { id: 'greenfield-foods', name: 'Greenfield Foods', meta: 'Johor | No Exp Required', jobPostings: 6, admins: 3, panels: 4, verified: false, subscription: 'GigaStandard', referralCode: 'GRF-1937' },
  { id: 'pinnacle-retail', name: 'Pinnacle Retail Group', meta: 'Selangor | 3 Years Exp', jobPostings: 3, admins: 2, panels: 1, verified: true, subscription: 'GigaPremium', referralCode: 'PRG-7704' },
  { id: 'skyline-builders', name: 'Skyline Builders', meta: 'Sabah | 5 Years Exp', jobPostings: 1, admins: 1, panels: 1, verified: false, subscription: 'Freemium', referralCode: null },
];

export const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
