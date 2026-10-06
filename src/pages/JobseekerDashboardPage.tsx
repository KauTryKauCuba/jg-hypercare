import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import './JobseekerDashboardPage.css';
import { useOnboarding } from '../store/jobseekerOnboardingStore';
import type { OnboardingState } from '../store/jobseekerOnboardingStore';
import {
  AvatarIllustration,
  ChevronDown,
  DateField,
  RichTextEditor,
  SelectField,
  Toast,
} from './JobseekerOnboardingPage';

/* ---------- options ---------- */

const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
const COUNTRIES = ['Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Philippines'];
const STATES = [
  'Kuala Lumpur', 'Selangor', 'Putrajaya', 'Penang', 'Johor', 'Perak', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Kedah', 'Kelantan', 'Terengganu', 'Perlis', 'Sabah', 'Sarawak', 'Labuan',
];
const CURRENCIES = ['RM', 'SGD', 'USD'];
const SALARY_TYPES = ['Monthly', 'Daily', 'Hourly', 'Yearly'];
const EDUCATION_LEVELS = ['SPM', 'STPM / Foundation', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD'];
const SKILLS = ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Communication', 'Microsoft Excel', 'Project Management', 'JavaScript', 'React'];
const PROFICIENCIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

/* ---------- helpers ---------- */

const formatDate = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};

const yearsSince = (iso: string) => {
  if (!iso) return '';
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return '';
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  if (now < new Date(now.getFullYear(), start.getMonth(), start.getDate())) years -= 1;
  if (years < 1) return 'Less than 1 year';
  return `${years} year${years === 1 ? '' : 's'}`;
};

const workExperienceText = (s: OnboardingState) =>
  s.experience === 'Experienced' ? yearsSince(s.startWorking) : s.experience;

const htmlHasText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() !== '';

const toCurrency = (c: string) => (c === 'MYR' ? 'RM' : c);

/* ---------- data mapping (dashboard field -> onboarding key) ---------- */

// source = onboarding key (with live filled state); ai = key on /ai-resume-parse/profile (that flow saves nothing yet).
type Mapping = { section: string; label: string; source?: string; filled: boolean; note?: string; ai?: string; aiNote?: string };

function buildMapping(s: OnboardingState): Mapping[] {
  return [
    { section: 'Basic Info', label: 'First Name', source: 'first_name', filled: !!s.firstName.trim(), ai: 'first_name' },
    { section: 'Basic Info', label: 'Last Name', source: 'last_name', filled: !!s.lastName.trim(), ai: 'last_name' },
    { section: 'Basic Info', label: 'Phone Number', filled: false },
    { section: 'Basic Info', label: 'Work Experience', source: 'start_working_since', filled: !!workExperienceText(s), note: 'Derived from work_experience + start_working_since', ai: 'working_period_from', aiNote: 'Would be worked out from work_experience + the earliest working_period_from (the AI profile has no start_working_since)' },
    { section: 'Basic Info', label: 'Date of Birth', source: 'date_of_birth', filled: !!s.dob, ai: 'date_of_birth' },
    { section: 'Basic Info', label: 'Earliest Availability', source: 'availability', filled: !!s.availability, ai: 'availability' },
    { section: 'Basic Info', label: 'Location', filled: false, note: 'Onboarding only asks for desired work location, not where the jobseeker lives' },
    { section: 'Basic Info', label: 'Profile Photo', filled: false, ai: 'profile_photo', aiNote: 'From the Change button on the AI resume profile page' },
    { section: 'Professional Summary', label: 'Description', filled: false },
    { section: 'Job Preferences', label: 'Desired Job Title', source: 'job_title', filled: !!s.jobTitle.trim(), ai: 'job_title' },
    { section: 'Job Preferences', label: 'Desired Job Types', source: 'desired_job_type', filled: !!s.jobType, ai: 'desired_job_type' },
    { section: 'Job Preferences', label: 'Country', filled: false },
    { section: 'Job Preferences', label: 'State', source: 'desired_work_location', filled: !!s.location, ai: 'desired_work_location' },
    { section: 'Job Preferences', label: 'Currency', source: 'salary_currency', filled: !!s.currency, ai: 'salary_currency' },
    { section: 'Job Preferences', label: 'Salary From', source: 'salary_from', filled: !!s.salaryFrom, ai: 'salary_from' },
    { section: 'Job Preferences', label: 'Salary To', source: 'salary_to', filled: !!s.salaryTo, ai: 'salary_to' },
    { section: 'Job Preferences', label: 'Salary Type', source: 'salary_type', filled: !!s.salaryType, ai: 'salary_type' },
    { section: 'Working Experience', label: 'Job Title', source: 'recent_job_title', filled: !!s.recentJobTitle, ai: 'recent_job_title' },
    { section: 'Working Experience', label: 'Company Name', source: 'recent_company', filled: !!s.company.trim(), ai: 'recent_company' },
    { section: 'Working Experience', label: 'Working From', source: 'working_period_from', filled: !!s.workFrom, ai: 'working_period_from' },
    { section: 'Working Experience', label: 'Working To', source: 'working_period_to', filled: s.currentlyWorking || !!s.workTo, ai: 'working_period_to' },
    { section: 'Working Experience', label: 'Description', source: 'job_description', filled: htmlHasText(s.jobDescription), ai: 'job_description' },
    { section: 'Education', label: 'Institution Name', filled: false },
    { section: 'Education', label: 'Education Level', filled: false },
    { section: 'Education', label: 'Study Period', filled: false },
    { section: 'Education', label: 'Field of Study', filled: false },
    { section: 'Education', label: 'Description', filled: false },
    { section: 'Skills', label: 'Skill Name', filled: false },
    { section: 'Skills', label: 'Proficiency', filled: false },
    { section: 'Resume', label: 'Resume File', filled: false, ai: 'resume_file', aiNote: 'Uploaded on the first AI resume page' },
    { section: 'Links', label: 'Portfolio', filled: false },
  ];
}

/* Collected in onboarding but there is no place for it on the dashboard. */
function unusedOnboarding(s: OnboardingState) {
  return [
    { label: 'Work Eligibility', key: 'work_eligibility', value: s.eligibility ?? '' },
    { label: 'Nationality', key: 'nationality', value: s.nationality },
    { label: 'Work Arrangement', key: 'work_arrangement', value: s.workArrangement },
  ];
}

/* Collected in the AI resume flow but there is no place for it on the dashboard. */
const UNUSED_AI = [
  { label: 'Work Eligibility', key: 'work_eligibility' },
  { label: 'Nationality', key: 'nationality' },
  { label: 'Work Arrangement', key: 'work_arrangement' },
  { label: 'Email', key: 'email', note: 'upload page' },
  { label: 'Job Categories', key: 'job_categories', note: 'up to 3' },
];

/* ---------- icons ---------- */

const icon = (d: string, size = 16) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  idDoc: icon('M7 3h7l5 5v13H7zM14 3v5h5M11 13.5a1.6 1.6 0 1 0 0-.01M8.8 18c.4-1.4 1.2-2 2.2-2s1.8.6 2.2 2'),
  phone: icon('M4 6h16v12H4zM4 7l8 6 8-6'),
  briefcase: icon('M4 8h16v11H4zM9 8V5h6v3M4 13h16'),
  cake: icon('M4 21h16M5 21v-7h14v7M8 14V9M12 14V9M16 14V9M8 6v.01M12 6v.01M16 6v.01'),
  clock: icon('M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3.5 20c0-3.4 2.9-5.5 6.5-5.5 1.2 0 2.3.2 3.2.7M16 15l4 4M20 15l-4 4'),
  pin: icon('M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'),
  bag: icon('M4 8h16v11H4zM9 8V5h6v3'),
  book: icon('M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5c-3-.5-6 0-8 1.5zM12 6v14.5'),
  skills: icon('M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 3v18M3.5 9h17M3.5 15h17'),
  clipboard: icon('M8 4h8v3H8zM6 5.5H5V21h14V5.5h-1M9 12l2 2 4-4'),
  link: icon('M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1'),
  edit: icon('M5 19h3l9.5-9.5-3-3L5 16zM13 7l3 3M12 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7', 15),
  plus: icon('M12 5v14M5 12h14', 15),
  x: icon('M6 6l12 12M18 6L6 18', 14),
  warn: icon('M12 4l9 16H3zM12 10v4M12 17v.01', 15),
  bell: icon('M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0'),
  chat: icon('M12 20a8 8 0 1 0-7-4.1L4 20l4.1-1A8 8 0 0 0 12 20z'),
  navDoc: icon('M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6'),
  navChat: icon('M4 5h16v11H9l-5 4z'),
  arrowUp: icon('M12 19V5M6 11l6-6 6 6', 12),
};

function CloudUpload() {
  return (
    <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden="true">
      <path d="M9 24h17a6 6 0 0 0 .8-11.9A8.5 8.5 0 0 0 10.5 10 7 7 0 0 0 9 24z" fill="#e6f7f9" stroke="#0b8a92" strokeWidth="1.4" />
      <rect x="12" y="13" width="10" height="10" rx="2" fill="#12b5c6" />
      <path d="M17 21v-5.5M14.8 17.6 17 15.4l2.2 2.2" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Medal({ color }: { color: string }) {
  return (
    <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
      <path d="M6 1h4l2 6H8zM16 1h-4l-2 6h4z" fill={color} opacity="0.55" />
      <circle cx="11" cy="15" r="7" fill="none" stroke={color} strokeWidth="1.6" />
      <circle cx="11" cy="15" r="4" fill={color} opacity="0.85" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12.5l2.7 2.7L16 9.8" />
    </svg>
  );
}

const SOCIAL = {
  facebook: 'M12 2a10 10 0 0 0-1.6 19.9V14.9H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 12 2z',
  linkedin: 'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm3 7v8h2.5v-8zm1.3-4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM11 10v8h2.5v-4.2c0-1.1.6-1.8 1.5-1.8s1.3.6 1.3 1.8V18H19v-4.8c0-2.4-1.3-3.4-3-3.4-1.2 0-2 .6-2.5 1.3V10z',
};

/* ---------- small building blocks ---------- */

function MapTag({ source, filled, note, show }: { source?: string; filled: boolean; note?: string; show: boolean }) {
  if (!show) return null;
  if (!source) {
    return <span className="jd-tag is-none" title={note ?? 'Not collected during onboarding'}>OB · not in onboarding</span>;
  }
  return (
    <span className={`jd-tag ${filled ? 'is-mapped' : 'is-empty'}`} title={note ?? `Mapped from onboarding: ${source}`}>
      OB · {filled ? source : `${source} · empty`}
    </span>
  );
}

function AiTag({ source, note, show }: { source?: string; note?: string; show: boolean }) {
  if (!show) return null;
  return source ? (
    <span className="jd-tag is-ai" title={note ?? `Collected on the AI resume profile: ${source}`}>AI · {source}</span>
  ) : (
    <span className="jd-tag is-ai-none" title={note ?? 'Not collected in the AI resume flow'}>AI · not in AI resume</span>
  );
}

function Field({ label, hint, tag, small, required, children }: { label: string; hint?: string; tag?: ReactNode; small?: boolean; required?: boolean; children: ReactNode }) {
  return (
    <div className="jd-field">
      <div className={`jd-field-label${small ? ' is-small' : ''}`}>
        <label>{label}</label>
        {required && <span className="jd-required">*</span>}
        {hint && <span className="jd-hint">{hint}</span>}
        {tag}
      </div>
      {children}
    </div>
  );
}

function Section({
  id,
  title,
  open,
  onToggle,
  missing,
  children,
}: {
  id: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  missing?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="jd-section">
      <button type="button" className="jd-section-head" aria-expanded={open} onClick={onToggle}>
        <span className="jd-section-title">{title}</span>
        {missing && <span className="jd-section-missing">{missing}</span>}
        <span className={`jd-section-chevron${open ? ' is-open' : ''}`}><ChevronDown /></span>
      </button>
      {open && <div className="jd-section-body">{children}</div>}
    </section>
  );
}

function Actions({ onCancel, onSave, saveLabel = 'Save' }: { onCancel: () => void; onSave: () => void; saveLabel?: string }) {
  return (
    <div className="jd-actions">
      <button type="button" className="jd-btn-outline" onClick={onCancel}>Cancel</button>
      <button type="button" className="jd-btn-solid" onClick={onSave}>{saveLabel}</button>
    </div>
  );
}

function AddAnother({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="jd-add-another" onClick={onClick}>
      {ICONS.plus} {label}
    </button>
  );
}

function EntryBox({ title, onRemove, children }: { title: string; onRemove?: () => void; children: ReactNode }) {
  return (
    <div className="jd-entry">
      <div className="jd-entry-head">
        <span>{title}</span>
        {onRemove && (
          <button type="button" className="jd-entry-remove" aria-label={`Remove ${title}`} onClick={onRemove}>{ICONS.x}</button>
        )}
      </div>
      {children}
    </div>
  );
}

/* ---------- form drafts ---------- */

type JobPref = { title: string; jobType: string; country: string; state: string; currency: string; from: string; to: string; type: string };
type Experience = { title: string; company: string; from: string; to: string; description: string };
type Education = { institution: string; level: string; from: string; to: string; field: string; description: string };
type Skill = { name: string; proficiency: string };

const blankPref = (): JobPref => ({ title: '', jobType: '', country: '', state: '', currency: 'RM', from: '', to: '', type: 'Monthly' });
const blankExp = (): Experience => ({ title: '', company: '', from: '', to: '', description: '' });
const blankEdu = (): Education => ({ institution: '', level: '', from: '', to: '', field: '', description: '' });
const blankSkill = (): Skill => ({ name: '', proficiency: '' });

const prefFromOnboarding = (s: OnboardingState): JobPref => ({
  title: s.jobTitle,
  jobType: s.jobType,
  country: '',
  state: s.location,
  currency: toCurrency(s.currency),
  from: s.salaryFrom,
  to: s.salaryTo,
  type: s.salaryType,
});

const expFromOnboarding = (s: OnboardingState): Experience => ({
  title: s.recentJobTitle,
  company: s.company,
  from: s.workFrom,
  to: s.currentlyWorking ? '' : s.workTo,
  description: s.jobDescription,
});

const replaceAt = <T,>(list: T[], i: number, patch: Partial<T>) => list.map((item, j) => (j === i ? { ...item, ...patch } : item));

const NAV = [
  { id: 'basic-info', label: 'Basic Info', icon: ICONS.idDoc },
  { id: 'job-preferences', label: 'Job Preferences', icon: ICONS.bag },
  { id: 'working-experience', label: 'Working Experience', icon: ICONS.idDoc },
  { id: 'education', label: 'Education', icon: ICONS.book },
  { id: 'skills', label: 'Skills', icon: ICONS.skills },
  { id: 'professional-summary', label: 'Summary', icon: ICONS.clipboard },
  { id: 'resume', label: 'Resume', icon: ICONS.idDoc },
  { id: 'links', label: 'Links', icon: ICONS.link },
];

const BADGES = [
  { label: 'Complete Job Preferences', color: '#e58648' },
  { label: 'Complete Working Experience', color: '#7c8591' },
  { label: 'Upload Profile Photo', color: '#e2a72e' },
  { label: 'Update Phone Number', color: '#8aa8bd' },
];

/* ---------- page ---------- */

export default function JobseekerDashboardPage() {
  const navigate = useNavigate();
  const s = useOnboarding();

  const [showMapping, setShowMapping] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('basic-info');
  const [closed, setClosed] = useState<string[]>([]);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  const [summary, setSummary] = useState('');
  const [prefs, setPrefs] = useState<JobPref[]>(() => [prefFromOnboarding(s)]);
  const [exps, setExps] = useState<Experience[]>(() => [expFromOnboarding(s)]);
  const [edus, setEdus] = useState<Education[]>(() => [blankEdu()]);
  const [skills, setSkills] = useState<Skill[]>(() => [blankSkill()]);
  const [links, setLinks] = useState<string[]>(['']);
  const [resumeName, setResumeName] = useState('');

  const mapping = buildMapping(s);
  const tagFor = (section: string, label: string) => {
    const m = mapping.find((x) => x.section === section && x.label === label);
    return m ? (
      <>
        <MapTag source={m.source} filled={m.filled} note={m.note} show={showMapping} />
        <AiTag source={m.ai} note={m.aiNote} show={showMapping} />
      </>
    ) : null;
  };
  const missingIn = (section: string) => {
    if (!showMapping) return undefined;
    const inSection = mapping.filter((m) => m.section === section);
    const ob = inSection.filter((m) => !m.source).length;
    const ai = inSection.filter((m) => !m.ai).length;
    const parts = [ob > 0 && `${ob} not in onboarding`, ai > 0 && `${ai} not in AI resume`].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : undefined;
  };

  const mappedFilled = mapping.filter((m) => m.source && m.filled).length;
  const mappedEmpty = mapping.filter((m) => m.source && !m.filled);
  const noSource = mapping.filter((m) => !m.source);
  const missingBySection = noSource.reduce<Record<string, string[]>>((acc, m) => {
    (acc[m.section] ??= []).push(m.label);
    return acc;
  }, {});
  const unused = unusedOnboarding(s);
  const noAi = mapping.filter((m) => !m.ai);
  // Fields one entry point fills and the other does not.
  const onlyOnboarding = mapping.filter((m) => m.source && !m.ai);
  const onlyAi = mapping.filter((m) => m.ai && !m.source);

  const fullName = `${s.firstName} ${s.lastName}`.trim();

  const prefsDone = mapping.filter((m) => m.section === 'Job Preferences').every((m) => !m.source || m.filled);
  const expDone = mapping.filter((m) => m.section === 'Working Experience').every((m) => m.filled);
  const badgeDone = [prefsDone, expDone, false, false];
  const progress = (badgeDone.filter(Boolean).length / badgeDone.length) * 100;

  const isOpen = (id: string) => !closed.includes(id);
  const toggle = (id: string) => setClosed((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const showToast = (message: string) => setToast({ id: Date.now(), message });
  const saved = (what: string) => () => showToast(`${what} saved successfully!`);

  const goTo = (id: string) => {
    setActiveNav(id);
    setClosed((c) => c.filter((x) => x !== id));
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const basicItems = [
    { label: 'First Name', value: s.firstName, icon: ICONS.idDoc },
    { label: 'Last Name', value: s.lastName, icon: ICONS.idDoc },
    { label: 'Phone Number', value: '', icon: ICONS.phone },
    { label: 'Work Experience', value: workExperienceText(s), icon: ICONS.briefcase },
    { label: 'Date of Birth', value: formatDate(s.dob), icon: ICONS.cake },
    { label: 'Earliest Availability', value: s.availability, icon: ICONS.clock },
    { label: 'Location', value: '', icon: ICONS.pin },
  ];

  const uploadInput = (
    <input type="file" accept=".pdf,.doc,.docx" hidden onChange={(e) => setResumeName(e.target.files?.[0]?.name ?? '')} />
  );

  return (
    <div className="jd-page">
      <header className="jd-topbar">
        <div className="jd-topbar-inner">
          <button type="button" className="jd-logo" onClick={() => navigate('/')}>
            <span className="jd-logo-mark">JG</span>
            JobGiga
          </button>
          <nav className="jd-topnav">
            <a>Home</a>
            <a>Find Job</a>
            <a>Companies</a>
            <a>About</a>
            <span className="jd-bonanza">JOBBONANZA</span>
          </nav>
          <div className="jd-topbar-right">
            <span className="jd-lang">🇺🇸 EN</span>
            <button type="button" className="jd-my-app">{ICONS.navDoc} My Application</button>
            <span className="jd-round-btn">{ICONS.navChat}</span>
            <span className="jd-round-btn">{ICONS.bell}</span>
            <div className="jd-user">
              <div>
                <strong>{s.firstName || 'Jobseeker'}</strong>
                <span>{s.jobTitle || '—'}</span>
              </div>
              <span className="jd-avatar"><AvatarIllustration /></span>
            </div>
          </div>
        </div>
      </header>

      <div className="jd-shell">
        <aside className="jd-sidebar">
          <nav className="jd-sidenav">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`jd-sidenav-item${activeNav === n.id ? ' is-active' : ''}`}
                onClick={() => goTo(n.id)}
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          </nav>
          <label className="jd-dropzone">
            <span className="jd-dropzone-title">Attached Resume</span>
            <span className="jd-dropzone-text"><b>Drag &amp; Drop your resume</b> or</span>
            <CloudUpload />
            <span className="jd-dropzone-btn">Upload Resume</span>
            <span className="jd-dropzone-note">Support file type:<br />.pdf, .doc, .docx (10MB max)</span>
            {uploadInput}
          </label>
        </aside>

        <main className="jd-main">
          <h1 className="jd-page-title">Basic Information</h1>

          <div className="jd-card">
            <div id="basic-info" className="jd-anchor">
              <h2 className="jd-story-title">Complete your professional story</h2>
              <p className="jd-story-sub">The more details you share, the better tailored matches you will receive</p>
              <div className="jd-progress-labels">
                <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>Completed</span>
              </div>
              <div className="jd-progress"><span style={{ width: `${progress}%` }} /></div>

              <h2 className="jd-badges-title">Collect Badges</h2>
              <div className="jd-badges">
                {BADGES.map((b, i) => (
                  <div key={b.label} className="jd-badge">
                    {badgeDone[i] && <span className="jd-badge-check"><CheckCircle /></span>}
                    <Medal color={b.color} />
                    <span className="jd-badge-name" style={{ color: b.color }}>Badge {i + 1}</span>
                    <span className="jd-badge-label">{b.label}</span>
                  </div>
                ))}
              </div>

              <div className="jd-basic">
                <div className="jd-alert">
                  {ICONS.warn}
                  Complete your basic information to increase your chances of being discovered by employers.
                </div>
                <div className="jd-basic-head">
                  <div>
                    <h2>Basic Info <span className="jd-edit">{ICONS.edit}</span></h2>
                    <p>Set clear goals so you won't miss any good opportunities</p>
                  </div>
                  <div className="jd-basic-user">
                    <div>
                      <strong>{fullName || '—'}</strong>
                      <span>{s.jobTitle || '—'}</span>
                      {tagFor('Basic Info', 'Profile Photo')}
                    </div>
                    <span className="jd-avatar"><AvatarIllustration /></span>
                  </div>
                </div>
                <div className="jd-basic-grid">
                  {basicItems.map((item) => (
                    <div key={item.label} className="jd-basic-item">
                      <span className="jd-basic-icon">{item.icon}</span>
                      <div>
                        <span className="jd-basic-label">{item.label}</span>
                        <span className="jd-basic-value">{item.value || '-'}</span>
                        {tagFor('Basic Info', item.label)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <Section id="professional-summary" title="Professional Summary" open={isOpen('professional-summary')} onToggle={() => toggle('professional-summary')} missing={missingIn('Professional Summary')}>
              <h3 className="jd-sub">Add Summary</h3>
              <Field label="Description" tag={tagFor('Professional Summary', 'Description')}>
                <RichTextEditor value={summary} onChange={setSummary} placeholder="Enter Description" labelledBy="jd-summary" />
              </Field>
              <Actions onCancel={() => setSummary('')} onSave={saved('Professional summary')} />
            </Section>

            <Section id="job-preferences" title="Job Preferences" open={isOpen('job-preferences')} onToggle={() => toggle('job-preferences')} missing={missingIn('Job Preferences')}>
              <h3 className="jd-sub">Add Job Preference</h3>
              {prefs.map((p, i) => {
                const t = (label: string) => (i === 0 ? tagFor('Job Preferences', label) : null);
                const set = (patch: Partial<JobPref>) => setPrefs((list) => replaceAt(list, i, patch));
                return (
                  <EntryBox key={i} title="Job Preference" onRemove={i > 0 ? () => setPrefs((l) => l.filter((_, j) => j !== i)) : undefined}>
                    <Field label="Desired Job Title" tag={t('Desired Job Title')}>
                      <input className="jo-input" placeholder="e.g. Graphic Designer" value={p.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Desired Job Types" tag={t('Desired Job Types')}>
                      <SelectField value={p.jobType} placeholder="Select job type" options={JOB_TYPES} onChange={(v) => set({ jobType: v })} />
                    </Field>
                    <div className="jd-group-label">Desired work location</div>
                    <div className="jd-group-label">Desired work location</div>
                    <div className="jd-grid-2">
                      <Field label="Country" small tag={t('Country')}>
                        <SelectField value={p.country} placeholder="Select country" options={COUNTRIES} onChange={(v) => set({ country: v })} />
                      </Field>
                      <Field label="State" small required tag={t('State')}>
                        <SelectField value={p.state} placeholder={p.country ? 'Select state' : 'Select country first'} options={STATES} onChange={(v) => set({ state: v })} />
                      </Field>
                    </div>
                    <div className="jd-group-label">Expected Salary Range</div>
                    <div className="jd-grid-4">
                      <Field label="Currency" tag={t('Currency')}>
                        <SelectField value={p.currency} options={CURRENCIES} onChange={(v) => set({ currency: v })} />
                      </Field>
                      <Field label="From" tag={t('Salary From')}>
                        <input className="jo-input" inputMode="numeric" placeholder="-" value={p.from} onChange={(e) => set({ from: e.target.value.replace(/[^\d]/g, '') })} />
                      </Field>
                      <Field label="To" tag={t('Salary To')}>
                        <input className="jo-input" inputMode="numeric" placeholder="-" value={p.to} onChange={(e) => set({ to: e.target.value.replace(/[^\d]/g, '') })} />
                      </Field>
                      <Field label="Type" tag={t('Salary Type')}>
                        <SelectField value={p.type} options={SALARY_TYPES} onChange={(v) => set({ type: v })} />
                      </Field>
                    </div>
                  </EntryBox>
                );
              })}
              <AddAnother label="Add Another Job Preference" onClick={() => setPrefs((l) => [...l, blankPref()])} />
              <Actions onCancel={() => setPrefs([prefFromOnboarding(s)])} onSave={saved('Job preferences')} />
            </Section>

            <Section id="working-experience" title="Working Experience" open={isOpen('working-experience')} onToggle={() => toggle('working-experience')} missing={missingIn('Working Experience')}>
              <h3 className="jd-sub">Add Working Experience</h3>
              {exps.map((x, i) => {
                const t = (label: string) => (i === 0 ? tagFor('Working Experience', label) : null);
                const set = (patch: Partial<Experience>) => setExps((list) => replaceAt(list, i, patch));
                return (
                  <EntryBox key={i} title="Working Experience" onRemove={i > 0 ? () => setExps((l) => l.filter((_, j) => j !== i)) : undefined}>
                    <Field label="Job Title" tag={t('Job Title')}>
                      <input className="jo-input" placeholder="Enter Job Title" value={x.title} onChange={(e) => set({ title: e.target.value })} />
                    </Field>
                    <Field label="Company Name" tag={t('Company Name')}>
                      <input className="jo-input" placeholder="Enter Company Name" value={x.company} onChange={(e) => set({ company: e.target.value })} />
                    </Field>
                    <Field label="Working Period" tag={<>{t('Working From')}{t('Working To')}</>}>
                      <div className="jd-grid-2">
                        <DateField id={`jd-exp-from-${i}`} value={x.from} max={x.to || undefined} ariaLabel="Working from" onChange={(v) => set({ from: v })} />
                        <DateField id={`jd-exp-to-${i}`} value={x.to} min={x.from || undefined} ariaLabel="Working to" onChange={(v) => set({ to: v })} />
                      </div>
                      <p className="jd-note">Leave end date empty for "Present"</p>
                    </Field>
                    <Field label="Description" tag={t('Description')}>
                      <RichTextEditor value={x.description} onChange={(v) => set({ description: v })} placeholder="Enter Description" labelledBy={`jd-exp-desc-${i}`} />
                    </Field>
                  </EntryBox>
                );
              })}
              <AddAnother label="Add Another Working Experience" onClick={() => setExps((l) => [...l, blankExp()])} />
              <Actions onCancel={() => setExps([expFromOnboarding(s)])} onSave={saved('Working experience')} />
            </Section>

            <Section id="education" title="Education" open={isOpen('education')} onToggle={() => toggle('education')} missing={missingIn('Education')}>
              <h3 className="jd-sub">Add Education</h3>
              {edus.map((x, i) => {
                const t = (label: string) => (i === 0 ? tagFor('Education', label) : null);
                const set = (patch: Partial<Education>) => setEdus((list) => replaceAt(list, i, patch));
                return (
                  <EntryBox key={i} title="Education" onRemove={i > 0 ? () => setEdus((l) => l.filter((_, j) => j !== i)) : undefined}>
                    <Field label="Institution Name" tag={t('Institution Name')}>
                      <input className="jo-input" placeholder="Enter institution name" value={x.institution} onChange={(e) => set({ institution: e.target.value })} />
                    </Field>
                    <Field label="Education level" tag={t('Education Level')}>
                      <SelectField value={x.level} placeholder="Select education level" options={EDUCATION_LEVELS} onChange={(v) => set({ level: v })} />
                    </Field>
                    <Field label="Study period" hint="(Start Date - End Date)" tag={t('Study Period')}>
                      <div className="jd-grid-2">
                        <DateField id={`jd-edu-from-${i}`} value={x.from} max={x.to || undefined} ariaLabel="Study from" onChange={(v) => set({ from: v })} />
                        <DateField id={`jd-edu-to-${i}`} value={x.to} min={x.from || undefined} ariaLabel="Study to" onChange={(v) => set({ to: v })} />
                      </div>
                    </Field>
                    <Field label="Field of Study" tag={t('Field of Study')}>
                      <input className="jo-input" placeholder="e.g. Computer Science" value={x.field} onChange={(e) => set({ field: e.target.value })} />
                    </Field>
                    <Field label="Description" tag={t('Description')}>
                      <RichTextEditor value={x.description} onChange={(v) => set({ description: v })} placeholder="Enter Description" labelledBy={`jd-edu-desc-${i}`} />
                    </Field>
                  </EntryBox>
                );
              })}
              <AddAnother label="Add Another Education" onClick={() => setEdus((l) => [...l, blankEdu()])} />
              <Actions onCancel={() => setEdus([blankEdu()])} onSave={saved('Education')} />
            </Section>

            <Section id="skills" title="Skills" open={isOpen('skills')} onToggle={() => toggle('skills')} missing={missingIn('Skills')}>
              <h3 className="jd-sub">Add Skills</h3>
              {skills.map((x, i) => {
                const t = (label: string) => (i === 0 ? tagFor('Skills', label) : null);
                const set = (patch: Partial<Skill>) => setSkills((list) => replaceAt(list, i, patch));
                return (
                  <EntryBox key={i} title="Skill" onRemove={i > 0 ? () => setSkills((l) => l.filter((_, j) => j !== i)) : undefined}>
                    <div className="jd-grid-2">
                      <Field label="Skill Name" tag={t('Skill Name')}>
                        <SelectField value={x.name} placeholder="Select Skills" options={SKILLS} onChange={(v) => set({ name: v })} />
                      </Field>
                      <Field label="Proficiency" tag={t('Proficiency')}>
                        <SelectField value={x.proficiency} placeholder="Select Proficiency" options={PROFICIENCIES} onChange={(v) => set({ proficiency: v })} />
                      </Field>
                    </div>
                  </EntryBox>
                );
              })}
              <AddAnother label="Add Another Skill" onClick={() => setSkills((l) => [...l, blankSkill()])} />
              <Actions onCancel={() => setSkills([blankSkill()])} onSave={saved('Skills')} />
            </Section>

            <section id="resume" className="jd-section jd-resume">
              <div className="jd-resume-head">
                <div>
                  <span className="jd-section-title">Resume</span>
                  {missingIn('Resume') ? <span className="jd-section-missing">{missingIn('Resume')}</span> : null}
                  <p className="jd-resume-sub">Upload up to 3 resumes (PDF, DOC, DOCX · max 30MB each)</p>
                </div>
                <label className="jd-icon-btn" aria-label="Add resume">
                  {ICONS.plus}
                  {uploadInput}
                </label>
              </div>
              <div className="jd-resume-row">
                <input className="jo-input" readOnly placeholder="Upload Resume" value={resumeName} />
                <label className="jd-btn-solid">
                  Upload Resume
                  {uploadInput}
                </label>
              </div>
            </section>

            <Section id="links" title="Links" open={isOpen('links')} onToggle={() => toggle('links')} missing={missingIn('Links')}>
              <h3 className="jd-sub">Add Links</h3>
              {links.map((url, i) => (
                <EntryBox key={i} title="Link" onRemove={i > 0 ? () => setLinks((l) => l.filter((_, j) => j !== i)) : undefined}>
                  <Field label="Portfolio" hint="(e.g. https://behance.net/yourname)" tag={i === 0 ? tagFor('Links', 'Portfolio') : null}>
                    <input className="jo-input" placeholder="Enter Portfolio Links" value={url} onChange={(e) => setLinks((l) => l.map((v, j) => (j === i ? e.target.value : v)))} />
                  </Field>
                </EntryBox>
              ))}
              <AddAnother label="Add Another Link" onClick={() => setLinks((l) => [...l, ''])} />
              <Actions onCancel={() => setLinks([''])} onSave={saved('Links')} saveLabel="Confirm" />
            </Section>
          </div>
        </main>
      </div>

      <footer className="jd-footer">
        <div className="jd-footer-inner">
          <div className="jd-footer-top">
            <div className="jd-footer-brand">
              <span className="jd-footer-logo">JG</span>
              <strong>JOBGIGA SDN BHD. (202501055580 (1656986-T))</strong>
              <span className="jd-footer-tag">Smart Hiring, <b>Starts Here</b></span>
              <address>
                11, Jalan IMP 1/1,<br />
                Taman Industri Meranti Perdana,<br />
                47120 Puchong Selangor.
              </address>
            </div>
            <div className="jd-footer-cols">
              <div><h4>Employer</h4><a>Become a Recruiter</a><a>Become a Partner</a><a>Find Talent</a></div>
              <div><h4>Job Seeker</h4><a>Become a Job Seeker</a><a>Find a Job</a><a>Companies</a></div>
              <div><h4>About</h4><a>About JobGiga</a><a>Release Notes</a><a>Log in to HRGiga</a></div>
              <div><h4>Legal</h4><a>Privacy Policy</a><a>Job Bonanza T&amp;C</a></div>
            </div>
          </div>
          <div className="jd-footer-email">
            <h4>Email</h4>
            <span>sales@jobgiga.com</span>
            <small>(For Sales Inquiry)</small>
            <span>support@jobgiga.com</span>
            <small>(For Support)</small>
          </div>
          <div className="jd-footer-bottom">
            <span>© 2026 JobGiga Sdn Bhd. All rights reserved.</span>
            <div className="jd-footer-social">
              {Object.entries(SOCIAL).map(([name, d]) => (
                <svg key={name} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-label={name}><path d={d} /></svg>
              ))}
              <button type="button" className="jd-back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Back to the top {ICONS.arrowUp}
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* onboarding → dashboard mapping, kept out of the layout */}
      <div className="jd-mapping">
        {reportOpen && (
          <div className="jd-report" role="dialog" aria-label="Onboarding data mapping">
            <div className="jd-report-head">
              <span className="jd-report-title">Onboarding → Dashboard mapping</span>
              <button type="button" className="jd-entry-remove" aria-label="Close" onClick={() => setReportOpen(false)}>{ICONS.x}</button>
            </div>
            <div className="jd-report-stats">
              <span className="jd-stat is-mapped">{mappedFilled} mapped</span>
              {mappedEmpty.length > 0 && <span className="jd-stat is-empty">{mappedEmpty.length} empty</span>}
              <span className="jd-stat is-none">{noSource.length} not in onboarding</span>
            </div>
            <label className="jd-switch">
              <input type="checkbox" checked={showMapping} onChange={(e) => setShowMapping(e.target.checked)} />
              <span className="jd-switch-track" aria-hidden="true" />
              Show tags on fields
            </label>
            <h3>Missing: not collected in onboarding</h3>
            <ul>
              {Object.entries(missingBySection).map(([section, labels]) => (
                <li key={section}><strong>{section}:</strong> {labels.join(', ')}</li>
              ))}
            </ul>
            {mappedEmpty.length > 0 && (
              <>
                <h3>Mapped, but left empty in onboarding</h3>
                <ul>
                  {mappedEmpty.map((m) => (
                    <li key={m.section + m.label}><strong>{m.section}:</strong> {m.label} <code>{m.source}</code></li>
                  ))}
                </ul>
              </>
            )}
            <h3>Collected in onboarding, no place on dashboard</h3>
            <ul>
              {unused.map((u) => (
                <li key={u.key}>{u.label} <code>{u.key}</code> <span className="jd-muted">{u.value || '(empty)'}</span></li>
              ))}
            </ul>

            <div className="jd-report-divider" />
            <span className="jd-report-title">Onboarding vs AI resume</span>
            <div className="jd-report-stats">
              <span className="jd-stat is-mapped">OB covers {mapping.length - noSource.length}/{mapping.length}</span>
              <span className="jd-stat is-ai">AI covers {mapping.length - noAi.length}/{mapping.length}</span>
            </div>
            <h3>Only the AI resume flow fills</h3>
            <ul>
              {onlyAi.length > 0
                ? onlyAi.map((m) => <li key={m.section + m.label}><strong>{m.section}:</strong> {m.label} <code>{m.ai}</code></li>)
                : <li className="jd-muted">Nothing</li>}
            </ul>
            <h3>Only onboarding fills</h3>
            <ul>
              {onlyOnboarding.length > 0
                ? onlyOnboarding.map((m) => <li key={m.section + m.label}><strong>{m.section}:</strong> {m.label} <code>{m.source}</code></li>)
                : <li className="jd-muted">Nothing</li>}
            </ul>
            <h3>Filled differently</h3>
            <ul>
              <li><strong>Basic Info:</strong> Work Experience: onboarding asks <code>start_working_since</code>; AI resume would use the earliest <code>working_period_from</code></li>
              <li><strong>Working Experience:</strong> onboarding gives 1 entry; AI resume gives up to 3</li>
            </ul>
            <h3>Missing in both</h3>
            <ul>
              {noSource.filter((m) => !m.ai).map((m) => (
                <li key={m.section + m.label}><strong>{m.section}:</strong> {m.label}</li>
              ))}
            </ul>
            <h3>Collected in AI resume, no place on dashboard</h3>
            <ul>
              {UNUSED_AI.map((u) => (
                <li key={u.key}>{u.label} <code>{u.key}</code>{u.note && <span className="jd-muted"> ({u.note})</span>}</li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="jd-mapping-fab" aria-expanded={reportOpen} onClick={() => setReportOpen((o) => !o)}>
          Mapping
          <span>OB {noSource.length} · AI {noAi.length} missing</span>
        </button>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} onDone={() => setToast(null)} />}
    </div>
  );
}
