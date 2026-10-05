import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import './JobseekerOnboardingPage.css';
import { resetOnboarding, updateOnboarding, useOnboarding } from '../store/jobseekerOnboardingStore';

const EXPERIENCE_OPTIONS = ['Experienced', 'Fresh Graduate/Student'] as const;
const AVAILABILITY_OPTIONS = ['Immediate', 'Within 1 Month', 'More Than 1 Month'] as const;
const ELIGIBILITY_OPTIONS = ['Malaysian', 'Passholder - EP/TEP/PV/DP/RP-T/Others', 'Foreigner'] as const;
const NATIONALITIES = ['Malaysian', 'Singaporean', 'Indonesian', 'Thai', 'Filipino', 'Indian', 'Chinese', 'Bangladeshi', 'Other'];

export function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M16 3v4M8 3v4M3.5 10h17M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
    </svg>
  );
}

export function ChevronDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5v5.5M12 16.5v.01" />
    </svg>
  );
}

export function AvatarIllustration() {
  return (
    <svg viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="40" fill="#F7A934" />
      {/* suit */}
      <path d="M12 80c1-14 9-20 20-23l8 5 8-5c11 3 19 9 20 23z" fill="#2D2F3A" />
      {/* shirt + tie */}
      <path d="M32 57l8 6 8-6-2 23H34z" fill="#ffffff" />
      <path d="M38 62h4l1 3-1.5 2 2 11-3.5 2-3.5-2 2-11-1.5-2z" fill="#D7263D" />
      {/* lapels */}
      <path d="M32 57l-3 4 7 12 4-10z" fill="#1F2029" />
      <path d="M48 57l3 4-7 12-4-10z" fill="#1F2029" />
      {/* neck */}
      <path d="M35 49h10v9l-5 4-5-4z" fill="#EBB291" />
      {/* ears */}
      <ellipse cx="27.5" cy="37" rx="2.5" ry="4" fill="#F2C2A2" />
      <ellipse cx="52.5" cy="37" rx="2.5" ry="4" fill="#F2C2A2" />
      {/* face */}
      <path d="M28 33c0-9 5-14 12-14s12 5 12 14c0 10-5 17-12 17s-12-7-12-17z" fill="#F7CDB0" />
      {/* hair */}
      <path d="M27 34c-1-11 5-18 14-18 7 0 13 5 12 15-1-4-4-7-9-8-5 3-11 3-15 2-1 3-2 6-2 9z" fill="#2B1D16" />
    </svg>
  );
}

const formatDisplayDate = (isoValue: string) => {
  if (!isoValue) return '';
  const [y, m, d] = isoValue.split('-');
  if (!y || !m || !d) return '';
  return `${d}/${m}/${y}`;
};

export function DateField({
  id,
  value,
  onChange,
  min,
  max,
  disabled,
  disabledText,
  ariaLabel,
}: {
  id: string;
  value: string;
  onChange: (isoValue: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  disabledText?: string;
  ariaLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (disabled) {
    return (
      <div className="jo-input-icon jo-date-field is-disabled" aria-disabled="true">
        <span className="jo-date-display">{disabledText ?? 'dd/mm/yyyy'}</span>
        <CalendarIcon />
      </div>
    );
  }

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === 'function') {
      try {
        el.showPicker();
        return;
      } catch {
        // falls through to focus below
      }
    }
    el.focus();
  };

  return (
    <div className="jo-input-icon jo-date-field" onClick={openPicker}>
      <span className={`jo-date-display${value ? '' : ' is-placeholder'}`}>
        {value ? formatDisplayDate(value) : 'dd/mm/yyyy'}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="date"
        className="jo-input jo-date-native"
        value={value}
        min={min}
        max={max}
        aria-label={ariaLabel}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      <CalendarIcon />
    </div>
  );
}

const todayISO = new Date().toISOString().slice(0, 10);

const WORK_ARRANGEMENTS = ['On-Site', 'Hybrid', 'Remote'] as const;
const LOCATIONS = [
  'Kuala Lumpur', 'Selangor', 'Putrajaya', 'Penang', 'Johor', 'Perak', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Kedah', 'Kelantan', 'Terengganu', 'Perlis', 'Sabah', 'Sarawak', 'Labuan',
];
const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
const CURRENCIES = ['MYR', 'SGD', 'USD'];
const SALARY_TYPES = ['Monthly', 'Daily', 'Hourly', 'Yearly'];

type Param = { name: string; key: string; value: string; skipped?: boolean; invalid?: boolean };

function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function SelectField({
  id,
  value,
  placeholder,
  options,
  onChange,
}: {
  id?: string;
  value: string;
  placeholder?: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="jo-input-icon">
      <select id={id} className={`jo-select${value ? '' : ' is-empty'}`} value={value} onChange={(e) => onChange(e.target.value)}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown />
    </div>
  );
}

const digitsOnly = (v: string) => v.replace(/[^\d]/g, '');

const JOB_TITLES = [
  'Graphic Designer', 'UI/UX Designer', 'Software Engineer', 'Web Developer', 'Data Analyst', 'Project Manager',
  'Marketing Executive', 'Sales Executive', 'Account Executive', 'Accountant', 'HR Executive', 'Admin Assistant',
  'Customer Service Executive', 'Operations Executive', 'Other',
];

const htmlToText = (html: string) =>
  html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

const toolIcon = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

type Tool = { cmd: string; label: string; icon: ReactNode; arg?: string; stateful?: boolean };
const TOOL_GROUPS: Tool[][] = [
  [
    { cmd: 'bold', label: 'Bold', stateful: true, icon: toolIcon('M7 5h6a3.5 3.5 0 0 1 0 7H7zM7 12h7a3.5 3.5 0 0 1 0 7H7z') },
    { cmd: 'italic', label: 'Italic', stateful: true, icon: toolIcon('M19 4h-9M14 20H5M15 4 9 20') },
    { cmd: 'underline', label: 'Underline', stateful: true, icon: toolIcon('M6 4v6a6 6 0 0 0 12 0V4M4 20h16') },
    { cmd: 'strikeThrough', label: 'Strikethrough', stateful: true, icon: toolIcon('M16 6c-.6-1.5-2-2.5-4-2.5-2.5 0-4 1.3-4 3.2 0 1.4.8 2.3 2.5 2.8M4 12h16M8 17.5c.6 1.6 2.1 2.7 4.3 2.7 2.6 0 4.2-1.4 4.2-3.3 0-1.2-.5-2-1.5-2.6') },
  ],
  [
    { cmd: 'justifyLeft', label: 'Align left', stateful: true, icon: toolIcon('M4 6h16M4 10h10M4 14h16M4 18h10') },
    { cmd: 'justifyCenter', label: 'Align center', stateful: true, icon: toolIcon('M4 6h16M7 10h10M4 14h16M7 18h10') },
    { cmd: 'justifyRight', label: 'Align right', stateful: true, icon: toolIcon('M4 6h16M10 10h10M4 14h16M10 18h10') },
    { cmd: 'justifyFull', label: 'Justify', stateful: true, icon: toolIcon('M4 6h16M4 10h16M4 14h16M4 18h16') },
  ],
  [
    { cmd: 'removeFormat', label: 'Clear formatting', icon: toolIcon('M7 21h10M5.5 13.5l6-6a2 2 0 0 1 2.8 0l3.2 3.2a2 2 0 0 1 0 2.8L12 19H8.5l-3-3a1.8 1.8 0 0 1 0-2.5zM9 10l5 5') },
    { cmd: 'hiliteColor', arg: '#fef08a', label: 'Highlight', icon: toolIcon('M18.4 2.6a2 2 0 0 1 3 3L12 15l-4-4zM7 13l4 4-1.5 1.5a3 3 0 0 1-4.2 0L3 21l1.5-3.7a3 3 0 0 1 0-4.2z') },
  ],
  [{ cmd: 'createLink', label: 'Insert link', icon: toolIcon('M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1') }],
  [
    { cmd: 'insertUnorderedList', label: 'Bulleted list', stateful: true, icon: toolIcon('M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01') },
    { cmd: 'insertOrderedList', label: 'Numbered list', stateful: true, icon: toolIcon('M10 6h10M10 12h10M10 18h10M4 4h1v4M3.5 8h2M3.5 12.5a1 1 0 0 1 2 .5L3.5 16h2.5') },
  ],
];

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  labelledBy,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  labelledBy: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML !== value) el.innerHTML = value;
  }, [value]);

  const refreshActive = () => {
    const stateful = TOOL_GROUPS.flat().filter((t) => t.stateful);
    setActive(stateful.filter((t) => document.queryCommandState(t.cmd)).map((t) => t.cmd));
  };

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    if (!el.textContent?.trim() && !el.querySelector('li')) el.innerHTML = '';
    onChange(el.innerHTML);
  };

  const run = (tool: Tool) => {
    ref.current?.focus();
    if (tool.cmd === 'createLink') {
      const input = window.prompt('Link URL', 'https://');
      if (!input) return;
      const url = /^https?:\/\//i.test(input.trim()) ? input.trim() : `https://${input.trim()}`;
      if (window.getSelection()?.isCollapsed) {
        document.execCommand('insertHTML', false, `<a href="${encodeURI(url)}">${url.replace(/[<>&"]/g, '')}</a>`);
      } else {
        document.execCommand('createLink', false, url);
      }
    } else {
      document.execCommand(tool.cmd, false, tool.arg);
    }
    emit();
    refreshActive();
  };

  return (
    <div className="jo-rte">
      <div
        ref={ref}
        className={`jo-rte-content${value ? '' : ' is-empty'}`}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-labelledby={labelledBy}
        data-placeholder={placeholder}
        onInput={emit}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        onPaste={(e) => {
          e.preventDefault();
          document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
        }}
      />
      <div className="jo-rte-toolbar">
        {TOOL_GROUPS.map((group, i) => (
          <div key={i} className="jo-rte-group">
            {group.map((tool) => (
              <button
                key={tool.cmd}
                type="button"
                className={`jo-rte-btn${active.includes(tool.cmd) ? ' is-active' : ''}`}
                title={tool.label}
                aria-label={tool.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => run(tool)}
              >
                {tool.icon}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const t = window.setTimeout(() => onDoneRef.current(), 3000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="jo-toast" role="status">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#16a34a" />
        <path d="M7.5 12.5l3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  );
}

export default function JobseekerOnboardingPage() {
  const s = useOnboarding();
  const [cardOpen, setCardOpen] = useState(true);
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const toggleGroup = (title: string) =>
    setClosedGroups((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));

  const [toast, setToast] = useState<{ message: string; id: number } | null>(null);
  const showToast = (message: string) => setToast({ message, id: Date.now() });

  const goToStep = (step: 1 | 2 | 3) => {
    updateOnboarding({ step });
    window.scrollTo(0, 0);
  };

  const salaryInvalid = Boolean(s.salaryFrom && s.salaryTo && Number(s.salaryTo) < Number(s.salaryFrom));

  const personalParams: Param[] = [
    { name: 'First Name', key: 'first_name', value: s.firstName.trim() },
    { name: 'Last Name', key: 'last_name', value: s.lastName.trim() },
    { name: 'Date of Birth', key: 'date_of_birth', value: formatDisplayDate(s.dob) },
    { name: 'Work Experience', key: 'work_experience', value: s.experience },
    { name: 'Start Working Since', key: 'start_working_since', value: formatDisplayDate(s.startWorking), skipped: s.experience !== 'Experienced' },
    { name: 'Availability', key: 'availability', value: s.availability },
    { name: 'Work Eligibility', key: 'work_eligibility', value: s.eligibility ?? '' },
    { name: 'Nationality', key: 'nationality', value: s.nationality },
  ];
  const preferenceParams: Param[] = [
    { name: 'Job Title', key: 'job_title', value: s.jobTitle.trim() },
    { name: 'Work Arrangement', key: 'work_arrangement', value: s.workArrangement },
    { name: 'Work Location', key: 'desired_work_location', value: s.location },
    { name: 'Job Type', key: 'desired_job_type', value: s.jobType },
    { name: 'Currency', key: 'salary_currency', value: s.currency },
    { name: 'Salary From', key: 'salary_from', value: s.salaryFrom },
    { name: 'Salary To', key: 'salary_to', value: s.salaryTo, invalid: salaryInvalid },
    { name: 'Salary Type', key: 'salary_type', value: s.salaryType },
  ];
  const periodInvalid = Boolean(!s.currentlyWorking && s.workFrom && s.workTo && s.workTo < s.workFrom);
  const descriptionText = htmlToText(s.jobDescription);
  const experienceParams: Param[] = [
    { name: 'Company', key: 'recent_company', value: s.company.trim() },
    { name: 'Job Title', key: 'recent_job_title', value: s.recentJobTitle },
    { name: 'Working From', key: 'working_period_from', value: formatDisplayDate(s.workFrom) },
    { name: 'Working To', key: 'working_period_to', value: s.currentlyWorking ? 'Present' : formatDisplayDate(s.workTo), invalid: periodInvalid },
    { name: 'Job Description', key: 'job_description', value: descriptionText },
  ];
  const allGroups = [
    { title: 'Personal Information', params: personalParams },
    { title: 'Job Preferences', params: preferenceParams },
    { title: 'Work Experience', params: experienceParams },
  ];
  const groups = s.step === 1 ? [{ title: '', params: personalParams }] : allGroups.slice(0, s.step);
  const isFilled = (p: Param) => Boolean(p.value) && !p.invalid;
  const countOf = (list: Param[]) => {
    const applicable = list.filter((p) => !p.skipped);
    return { filled: applicable.filter(isFilled).length, total: applicable.length };
  };
  const { filled: filledCount, total: totalCount } = countOf(groups.flatMap((g) => g.params));

  const resetButton = (
    <button
      type="button"
      className="jo-reset-btn"
      onClick={() => {
        if (window.confirm('Reset this form? This clears everything you entered.')) {
          resetOnboarding();
          window.scrollTo(0, 0);
        }
      }}
    >
      <ResetIcon />
      Reset
    </button>
  );

  return (
    <div className="jo-page">
      <div className="jo-layout">
        <div className="jo-card">
          {s.step === 1 && (
            <>
              <div className="jo-card-head">
                <div>
                  <h1 className="jo-title">Fill in personal information, so good jobs can find you</h1>
                  <p className="jo-subtitle">Your information will be kept confidential with us</p>
                </div>
                {resetButton}
              </div>

              <div className="jo-avatar-banner">
                <div className="jo-avatar-pic">
                  <AvatarIllustration />
                </div>
                <button type="button" className="jo-change-btn">Change</button>
                <div className="jo-avatar-divider" />
                <div className="jo-avatar-note">
                  <AlertIcon />
                  <span>Data shows that Employers have a better impression of real person avatars.</span>
                </div>
              </div>

              <div className="jo-field-row">
                <div className="jo-field">
                  <label className="jo-label" htmlFor="jo-first-name">First Name<span className="jo-required">*</span></label>
                  <input id="jo-first-name" className="jo-input" placeholder="Enter First Name" value={s.firstName} onChange={(e) => updateOnboarding({ firstName: e.target.value })} />
                </div>
                <div className="jo-field">
                  <label className="jo-label" htmlFor="jo-last-name">Last Name<span className="jo-required">*</span></label>
                  <input id="jo-last-name" className="jo-input" placeholder="Enter Last Name" value={s.lastName} onChange={(e) => updateOnboarding({ lastName: e.target.value })} />
                </div>
              </div>

              <div className="jo-field">
                <label className="jo-label" htmlFor="jo-dob">Date of Birth<span className="jo-required">*</span></label>
                <DateField id="jo-dob" value={s.dob} onChange={(v) => updateOnboarding({ dob: v })} max={todayISO} />
              </div>

              <div className="jo-field">
                <span className="jo-label">Work Experience<span className="jo-required">*</span></span>
                <div className="jo-toggle-group">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button key={opt} type="button" className={`jo-toggle-btn${s.experience === opt ? ' active' : ''}`} onClick={() => updateOnboarding({ experience: opt })}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {s.experience === 'Experienced' && (
                <div className="jo-field">
                  <label className="jo-label" htmlFor="jo-start">Start Working Since<span className="jo-required">*</span></label>
                  <DateField id="jo-start" value={s.startWorking} onChange={(v) => updateOnboarding({ startWorking: v })} max={todayISO} />
                </div>
              )}

              <div className="jo-field">
                <span className="jo-label">Availability<span className="jo-required">*</span></span>
                <div className="jo-toggle-group">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button key={opt} type="button" className={`jo-toggle-btn${s.availability === opt ? ' active' : ''}`} onClick={() => updateOnboarding({ availability: opt })}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="jo-field">
                <span className="jo-label">Work Eligibility<span className="jo-required">*</span></span>
                <div className="jo-radio-group">
                  {ELIGIBILITY_OPTIONS.map((opt) => (
                    <label key={opt} className="jo-radio">
                      <input type="radio" name="jo-eligibility" checked={s.eligibility === opt} onChange={() => updateOnboarding({ eligibility: opt })} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="jo-field">
                <label className="jo-label" htmlFor="jo-nationality">Nationality<span className="jo-required">*</span></label>
                <SelectField id="jo-nationality" value={s.nationality} placeholder="Select Nationality" options={NATIONALITIES} onChange={(v) => updateOnboarding({ nationality: v })} />
              </div>

              <div className="jo-next-row">
                <button type="button" className="jo-next-btn" onClick={() => goToStep(2)}>Next</button>
              </div>
            </>
          )}

          {s.step === 2 && (
            <>
              <div className="jo-card-head">
                <div>
                  <h1 className="jo-title">Clarify job preferences to improve matching efficiency</h1>
                  <p className="jo-subtitle jo-subtitle-dark">Set clear goals so you won't miss any good opportunities</p>
                </div>
                {resetButton}
              </div>

              <div className="jo-field jo-field-first">
                <label className="jo-label" htmlFor="jo-job-title">Job Title<span className="jo-required">*</span></label>
                <input id="jo-job-title" className="jo-input" placeholder="Graphic Designer" value={s.jobTitle} onChange={(e) => updateOnboarding({ jobTitle: e.target.value })} />
              </div>

              <div className="jo-field">
                <span className="jo-label">Work Arrangement<span className="jo-required">*</span></span>
                <div className="jo-toggle-group">
                  {WORK_ARRANGEMENTS.map((opt) => (
                    <button key={opt} type="button" className={`jo-toggle-btn${s.workArrangement === opt ? ' active' : ''}`} onClick={() => updateOnboarding({ workArrangement: opt })}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="jo-field">
                <label className="jo-label" htmlFor="jo-location">Desired Work Location<span className="jo-required">*</span></label>
                <SelectField id="jo-location" value={s.location} placeholder="Select location" options={LOCATIONS} onChange={(v) => updateOnboarding({ location: v })} />
              </div>

              <div className="jo-field">
                <label className="jo-label" htmlFor="jo-job-type">Desired Job Type<span className="jo-required">*</span></label>
                <SelectField id="jo-job-type" value={s.jobType} placeholder="Select job type" options={JOB_TYPES} onChange={(v) => updateOnboarding({ jobType: v })} />
              </div>

              <div className="jo-field">
                <span className="jo-label">Expected Salary Range<span className="jo-required">*</span></span>
                <div className="jo-salary-grid">
                  <div>
                    <label className="jo-sublabel" htmlFor="jo-currency">Currency</label>
                    <SelectField id="jo-currency" value={s.currency} options={CURRENCIES} onChange={(v) => updateOnboarding({ currency: v })} />
                  </div>
                  <div>
                    <label className="jo-sublabel" htmlFor="jo-salary-from">From</label>
                    <input
                      id="jo-salary-from"
                      className="jo-input"
                      inputMode="numeric"
                      placeholder="-"
                      value={s.salaryFrom}
                      onChange={(e) => updateOnboarding({ salaryFrom: digitsOnly(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="jo-sublabel" htmlFor="jo-salary-to">To</label>
                    <input
                      id="jo-salary-to"
                      className={`jo-input${salaryInvalid ? ' is-invalid' : ''}`}
                      inputMode="numeric"
                      placeholder="-"
                      value={s.salaryTo}
                      onChange={(e) => updateOnboarding({ salaryTo: digitsOnly(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="jo-sublabel" htmlFor="jo-salary-type">Type</label>
                    <SelectField id="jo-salary-type" value={s.salaryType} options={SALARY_TYPES} onChange={(v) => updateOnboarding({ salaryType: v })} />
                  </div>
                </div>
                {salaryInvalid && <p className="jo-error">"To" must be equal to or higher than "From".</p>}
              </div>

              <div className="jo-step-actions">
                <button type="button" className="jo-back-btn" onClick={() => goToStep(1)}>Back</button>
                <button
                  type="button"
                  className="jo-continue-btn"
                  onClick={() => {
                    goToStep(3);
                    showToast('Job preferences saved successfully!');
                  }}
                >
                  Continue
                </button>
              </div>
              <button type="button" className="jo-skip-btn" onClick={() => goToStep(3)}>Skip</button>
            </>
          )}

          {s.step === 3 && (
            <>
              <div className="jo-card-head">
                <div>
                  <h1 className="jo-title">Provide work experience to showcase your potential</h1>
                  <p className="jo-subtitle jo-subtitle-dark">Set clear goals so you won't miss any good opportunities</p>
                </div>
                {resetButton}
              </div>

              <div className="jo-field jo-field-first">
                <label className="jo-label" htmlFor="jo-company">Most Recent Company<span className="jo-required">*</span></label>
                <input id="jo-company" className="jo-input" placeholder="Old Company Sdn Bhd" value={s.company} onChange={(e) => updateOnboarding({ company: e.target.value })} />
              </div>

              <div className="jo-field">
                <label className="jo-label" htmlFor="jo-recent-title">Most Recent Job Title<span className="jo-required">*</span></label>
                <SelectField id="jo-recent-title" value={s.recentJobTitle} placeholder="Select job title" options={JOB_TITLES} onChange={(v) => updateOnboarding({ recentJobTitle: v })} />
              </div>

              <div className="jo-field">
                <span className="jo-label">Working Period<span className="jo-required">*</span></span>
                <div className="jo-period-grid">
                  <DateField
                    id="jo-work-from"
                    ariaLabel="Working period start"
                    value={s.workFrom}
                    max={!s.currentlyWorking && s.workTo ? s.workTo : todayISO}
                    onChange={(v) => updateOnboarding({ workFrom: v })}
                  />
                  <DateField
                    id="jo-work-to"
                    ariaLabel="Working period end"
                    value={s.workTo}
                    min={s.workFrom || undefined}
                    max={todayISO}
                    disabled={s.currentlyWorking}
                    disabledText="Present"
                    onChange={(v) => updateOnboarding({ workTo: v })}
                  />
                </div>
                {periodInvalid && <p className="jo-error">End date must be on or after the start date.</p>}
                <label className="jo-checkbox">
                  <input type="checkbox" checked={s.currentlyWorking} onChange={(e) => updateOnboarding({ currentlyWorking: e.target.checked })} />
                  I am currently working here
                </label>
              </div>

              <div className="jo-field">
                <span className="jo-label" id="jo-desc-label">Job Description<span className="jo-required">*</span></span>
                <RichTextEditor
                  value={s.jobDescription}
                  onChange={(html) => updateOnboarding({ jobDescription: html })}
                  placeholder="Write a clear job description with key responsibilities, requirements, and any details."
                  labelledBy="jo-desc-label"
                />
              </div>

              <div className="jo-step-actions">
                <button type="button" className="jo-back-btn" onClick={() => goToStep(2)}>Back</button>
                <button type="button" className="jo-continue-btn" onClick={() => showToast('Work experience saved successfully!')}>Continue</button>
              </div>
              <button type="button" className="jo-skip-btn" onClick={() => showToast('Draft saved successfully!')}>Save as Draft</button>
            </>
          )}
        </div>

        <aside className="jo-params">
          <button type="button" className="jo-params-head" aria-expanded={cardOpen} onClick={() => setCardOpen((o) => !o)}>
            <h2 className="jo-params-title">Compulsory Parameters</h2>
            <span className={`jo-params-count${filledCount === totalCount ? ' done' : ''}`}>
              {filledCount}/{totalCount} filled
            </span>
            <span className={`jo-collapse-icon${cardOpen ? ' is-open' : ''}`}><ChevronDown /></span>
          </button>
          <div className="jo-params-bar">
            <span style={{ width: `${(filledCount / totalCount) * 100}%` }} />
          </div>

          {cardOpen && (
          <div className="jo-params-scroll">
          {groups.map((g) => {
            const c = countOf(g.params);
            const groupOpen = !closedGroups.includes(g.title);
            return (
              <div key={g.title || 'single'} className="jo-params-group">
                {g.title && (
                  <button type="button" className="jo-params-group-head" aria-expanded={groupOpen} onClick={() => toggleGroup(g.title)}>
                    <span>{g.title}</span>
                    <span className="jo-params-group-count">{c.filled}/{c.total}</span>
                    <span className={`jo-collapse-icon${groupOpen ? ' is-open' : ''}`}><ChevronDown /></span>
                  </button>
                )}
                {groupOpen && (
                <ul className="jo-params-list">
                  {g.params.map((p) => {
                    const filled = isFilled(p);
                    return (
                      <li key={p.key} className={`jo-param${p.skipped ? ' is-skipped' : filled ? ' is-filled' : ''}`}>
                        <span className="jo-param-status">
                          {filled && !p.skipped && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          )}
                        </span>
                        <div className="jo-param-body">
                          <span className="jo-param-name">{p.name}</span>
                          <code className="jo-param-key">{p.key}</code>
                          {p.skipped ? (
                            <span className="jo-param-value">optional</span>
                          ) : (
                            <span className={`jo-param-value${filled ? '' : ' is-empty'}`}>
                              {p.invalid ? 'invalid' : p.value || 'missing'}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                )}
              </div>
            );
          })}
          </div>
          )}
        </aside>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} onDone={() => setToast(null)} />}
    </div>
  );
}
