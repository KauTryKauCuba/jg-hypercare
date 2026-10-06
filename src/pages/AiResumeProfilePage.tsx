import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiResumeProfilePage.css';
import logo from '../assets/referral/jobgiga-logo.png';
import { AvatarIllustration, DateField, RichTextEditor, SelectField } from './JobseekerOnboardingPage';

const WORK_EXPERIENCE = ['Experienced', 'Fresh Graduate/Student'];
const AVAILABILITY = ['Immediate', 'Within 1 Month', 'More Than 1 Month'];
const ELIGIBILITY = ['Malaysian', 'Passholder - EP/TEP/PV/DP/RP-T/Others', 'Foreigner'];
const NATIONALITIES = ['Malaysian', 'Singaporean', 'Indonesian', 'Thai', 'Filipino', 'Indian', 'Chinese', 'Bangladeshi', 'Other'];
const JOB_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
const WORK_ARRANGEMENTS = ['On-Site', 'Hybrid', 'Remote'];
const LOCATIONS = [
  'Kuala Lumpur', 'Selangor', 'Putrajaya', 'Penang', 'Johor', 'Perak', 'Melaka', 'Negeri Sembilan',
  'Pahang', 'Kedah', 'Kelantan', 'Terengganu', 'Perlis', 'Sabah', 'Sarawak', 'Labuan',
];
const CURRENCIES = ['MYR', 'SGD', 'USD'];
const SALARY_TYPES = ['Monthly', 'Daily', 'Hourly', 'Yearly'];
const JOB_TITLES = [
  'Graphic Designer', 'UI/UX Designer', 'Software Engineer', 'Web Developer', 'Data Analyst', 'Project Manager',
  'Marketing Executive', 'Sales Executive', 'Account Executive', 'Accountant', 'HR Executive', 'Admin Assistant',
  'Customer Service Executive', 'Operations Executive', 'Other',
];

type Experience = { company: string; title: string; from: string; to: string; current: boolean; description: string };
const blankExperience = (): Experience => ({ company: '', title: '', from: '', to: '', current: false, description: '' });

const todayISO = new Date().toISOString().slice(0, 10);
const digitsOnly = (v: string) => v.replace(/[^\d]/g, '');
const hasText = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() !== '';

function Label({ htmlFor, children, required }: { htmlFor?: string; children: string; required?: boolean }) {
  return (
    <label className="arf-label" htmlFor={htmlFor}>
      {children}
      {required && <span className="arf-required">*</span>}
    </label>
  );
}

export default function AiResumeProfilePage() {
  const navigate = useNavigate();
  const photoRef = useRef<HTMLInputElement>(null);

  // Name comes pre-filled, as if the AI read it from the uploaded resume.
  const [photo, setPhoto] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('NUR IZZAH KHAYRIN');
  const [lastName, setLastName] = useState('AZIZ');
  const [dob, setDob] = useState('');
  const [experience, setExperience] = useState('Experienced');
  const [availability, setAvailability] = useState('Immediate');
  const [eligibility, setEligibility] = useState('Malaysian');
  const [nationality, setNationality] = useState('Malaysian');

  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [arrangement, setArrangement] = useState('On-Site');
  const [location, setLocation] = useState('');
  const [currency, setCurrency] = useState('MYR');
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo] = useState('');
  const [salaryType, setSalaryType] = useState('Monthly');

  const [experiences, setExperiences] = useState<Experience[]>(() => [blankExperience(), blankExperience(), blankExperience()]);
  const updateExperience = (i: number, patch: Partial<Experience>) =>
    setExperiences((list) => list.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const salaryInvalid = !!salaryFrom && !!salaryTo && Number(salaryTo) < Number(salaryFrom);
  const first = experiences[0];
  const canContinue =
    !!firstName.trim() && !!lastName.trim() && !!dob && !!experience && !!availability && !!eligibility && !!nationality &&
    !!jobTitle.trim() && !!jobType && !!arrangement && !!location && !!currency && !!salaryFrom && !!salaryTo && !salaryInvalid && !!salaryType &&
    !!first.company.trim() && !!first.title && !!first.from && (first.current || !!first.to) && hasText(first.description);

  return (
    <div className="arf-page">
      <button type="button" className="arf-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="" />
        JobGiga
      </button>

      <div className="arf-card">
        <div className="arf-top">
          {/* ---------- personal information ---------- */}
          <section>
            <h1 className="arf-title">Fill in personal information, so good jobs can find you</h1>
            <p className="arf-sub">Your information will be kept confidential with us</p>

            <div className="arf-personal">
              <div className="arf-avatar-box">
                <div className="arf-avatar-row">
                  <span className="arf-avatar">{photo ? <img src={photo} alt="Profile" /> : <AvatarIllustration />}</span>
                  <button type="button" className="arf-change" onClick={() => photoRef.current?.click()}>Change</button>
                  <input
                    ref={photoRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setPhoto(URL.createObjectURL(file));
                      e.target.value = '';
                    }}
                  />
                </div>
                <p className="arf-avatar-note">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e15151" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9.5" />
                    <path d="M12 7.5v5.5M12 16.5v.01" />
                  </svg>
                  Data shows that Employers have a better impression of real person avatars.
                </p>
              </div>

              <div className="arf-names">
                <div className="arf-grid-2">
                  <div>
                    <Label htmlFor="arf-first" required>First Name</Label>
                    <input id="arf-first" className="jo-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="arf-last" required>Last Name</Label>
                    <input id="arf-last" className="jo-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div className="arf-field-tight">
                  <Label htmlFor="arf-dob" required>Date of Birth</Label>
                  <DateField id="arf-dob" value={dob} max={todayISO} ariaLabel="Date of birth" onChange={setDob} />
                </div>
              </div>
            </div>

            <div className="arf-grid-2 arf-row">
              <div>
                <Label htmlFor="arf-exp" required>Work Experience</Label>
                <SelectField id="arf-exp" value={experience} options={WORK_EXPERIENCE} onChange={setExperience} />
              </div>
              <div>
                <Label htmlFor="arf-avail" required>Availability</Label>
                <SelectField id="arf-avail" value={availability} options={AVAILABILITY} onChange={setAvailability} />
              </div>
            </div>
            <div className="arf-grid-2 arf-row">
              <div>
                <Label htmlFor="arf-elig" required>Work Eligibility</Label>
                <SelectField id="arf-elig" value={eligibility} options={ELIGIBILITY} onChange={setEligibility} />
              </div>
              <div>
                <Label htmlFor="arf-nat" required>Nationality</Label>
                <SelectField id="arf-nat" value={nationality} options={NATIONALITIES} onChange={setNationality} />
              </div>
            </div>
          </section>

          <span className="arf-divider" aria-hidden="true" />

          {/* ---------- job preferences ---------- */}
          <section>
            <h1 className="arf-title">Clarify job preferences to improve matching efficiency</h1>
            <p className="arf-sub">Set clear goals so you won't miss any good opportunities</p>

            <div className="arf-grid-2 arf-row-first">
              <div>
                <Label htmlFor="arf-title" required>Job Title</Label>
                <input id="arf-title" className="jo-input" placeholder="Graphic Designer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="arf-type" required>Desired Job Type</Label>
                <SelectField id="arf-type" value={jobType} placeholder="Select job type" options={JOB_TYPES} onChange={setJobType} />
              </div>
            </div>
            <div className="arf-grid-2 arf-row-tight">
              <div>
                <Label htmlFor="arf-arr" required>Work Arrangement</Label>
                <SelectField id="arf-arr" value={arrangement} options={WORK_ARRANGEMENTS} onChange={setArrangement} />
              </div>
              <div>
                <Label htmlFor="arf-loc" required>Desired Work Location</Label>
                <SelectField id="arf-loc" value={location} placeholder="Select location" options={LOCATIONS} onChange={setLocation} />
              </div>
            </div>

            <div className="arf-salary">
              <Label required>Expected Salary Range</Label>
              <div className="arf-grid-4">
                <div>
                  <span className="arf-sublabel">Currency</span>
                  <SelectField value={currency} options={CURRENCIES} onChange={setCurrency} />
                </div>
                <div>
                  <span className="arf-sublabel">From</span>
                  <input className="jo-input" inputMode="numeric" placeholder="-" aria-label="Salary from" value={salaryFrom} onChange={(e) => setSalaryFrom(digitsOnly(e.target.value))} />
                </div>
                <div>
                  <span className="arf-sublabel">To</span>
                  <input className={`jo-input${salaryInvalid ? ' is-invalid' : ''}`} inputMode="numeric" placeholder="-" aria-label="Salary to" value={salaryTo} onChange={(e) => setSalaryTo(digitsOnly(e.target.value))} />
                </div>
                <div>
                  <span className="arf-sublabel">Type</span>
                  <SelectField value={salaryType} options={SALARY_TYPES} onChange={setSalaryType} />
                </div>
              </div>
              {salaryInvalid && <p className="arf-error">"To" must be equal to or higher than "From".</p>}
            </div>
          </section>
        </div>

        {/* ---------- work experience (first entry required, the other two optional) ---------- */}
        <section className="arf-experience">
          <h1 className="arf-title">Provide work experience to showcase your potential</h1>
          <p className="arf-sub">Set clear goals so you won't miss any good opportunities</p>

          {experiences.map((x, i) => {
            const required = i === 0;
            return (
              <div key={i} className="arf-exp-entry">
                <div>
                  <Label htmlFor={`arf-co-${i}`} required={required}>Most Recent Company</Label>
                  <input id={`arf-co-${i}`} className="jo-input" placeholder="Old Company Sdn Bhd" value={x.company} onChange={(e) => updateExperience(i, { company: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor={`arf-jt-${i}`} required={required}>Most Recent Job Title</Label>
                  <SelectField id={`arf-jt-${i}`} value={x.title} placeholder="Select job title" options={JOB_TITLES} onChange={(v) => updateExperience(i, { title: v })} />
                </div>
                <div className="arf-exp-desc">
                  <Label required={required}>Job Description</Label>
                  <RichTextEditor
                    value={x.description}
                    onChange={(v) => updateExperience(i, { description: v })}
                    placeholder="Write a clear job description with key responsibilities, requirements, and any details."
                    labelledBy={`arf-desc-${i}`}
                  />
                </div>
                <div className="arf-exp-period">
                  <Label required={required}>Working Period</Label>
                  <div className="arf-period">
                    <DateField id={`arf-from-${i}`} value={x.from} max={x.to || todayISO} ariaLabel="Working from" onChange={(v) => updateExperience(i, { from: v })} />
                    <DateField
                      id={`arf-to-${i}`}
                      value={x.to}
                      min={x.from || undefined}
                      max={todayISO}
                      disabled={x.current}
                      disabledText="Present"
                      ariaLabel="Working to"
                      onChange={(v) => updateExperience(i, { to: v })}
                    />
                  </div>
                  <label className="arf-check">
                    <input type="checkbox" checked={x.current} onChange={(e) => updateExperience(i, { current: e.target.checked, to: e.target.checked ? '' : x.to })} />
                    <span className="arf-box" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                    </span>
                    I am currently working here
                  </label>
                </div>
              </div>
            );
          })}
        </section>

        <div className="arf-footer">
          <button type="button" className="arf-back" onClick={() => navigate('/ai-resume-parse/job-categories')}>Back</button>
          <button type="button" className="arf-continue" disabled={!canContinue}>Continue</button>
        </div>
      </div>
    </div>
  );
}
