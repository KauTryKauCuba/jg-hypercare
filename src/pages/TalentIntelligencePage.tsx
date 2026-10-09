import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmployerShell from '../components/EmployerShell';
import { COMPANIES } from '../data/companies';
import './TalentIntelligencePage.css';

type AgeGroup = { range: string; min: number; max: number; total: number };

const AGE_BUCKETS: Omit<AgeGroup, 'total'>[] = [
  { range: '18–24 years', min: 18, max: 24 },
  { range: '25–34 years', min: 25, max: 34 },
  { range: '35–44 years', min: 35, max: 44 },
  { range: '45–54 years', min: 45, max: 54 },
  { range: '55+ years', min: 55, max: Infinity },
];

// Example applicants for previewing the Age panel; ages are worked out from date_of_birth like real data would be.
const BASE_DUMMY_APPLICANTS: { name: string; dob: string | null }[] = [
  { name: 'Aisyah Rahman', dob: '2005-03-14' },
  { name: 'Daniel Lim', dob: '2003-01-22' },
  { name: 'Nurul Huda', dob: '2007-02-09' },
  { name: 'Arjun Nair', dob: '2002-05-30' },
  { name: 'Siti Mariam', dob: '2004-07-18' },
  { name: 'Hafiz Zulkifli', dob: '2000-04-02' },
  { name: 'Mei Ling Tan', dob: '1998-08-25' },
  { name: 'Farah Nadia', dob: '1995-02-11' },
  { name: 'Kumar Selvam', dob: '1993-06-07' },
  { name: 'Amir Khan', dob: '1999-09-19' },
  { name: 'Hannah Alya', dob: '1997-01-03' },
  { name: 'Wei Jie Ong', dob: '1996-03-28' },
  { name: 'Izzah Khayrin', dob: '2001-05-15' },
  { name: 'Rizal Hamdan', dob: '1990-02-20' },
  { name: 'Priya Devi', dob: '1985-07-12' },
  { name: 'Kevin Chong', dob: '1988-04-08' },
  { name: 'Zainab Ismail', dob: '1982-09-01' },
  { name: 'Ahmad Firdaus', dob: '1979-03-17' },
  { name: 'Lim Ah Kow', dob: '1974-06-23' },
  { name: 'Rosnah Abdullah', dob: '1968-01-29' },
];

// 134 more generated applicants: a fixed seed keeps the same names and ages on every load.
const FIRST_NAMES = ['Nur', 'Muhammad', 'Siti', 'Ahmad', 'Wei Ling', 'Jun Hao', 'Kavitha', 'Ravi', 'Aina', 'Hakim', 'Mei Xin', 'Suresh', 'Farah', 'Imran', 'Jia Yi', 'Deepa', 'Adam', 'Alya', 'Kai Wen', 'Thinesh'];
const LAST_NAMES = ['Abdullah', 'Tan', 'Rahman', 'Lee', 'Ismail', 'Wong', 'Krishnan', 'Hassan', 'Ng', 'Yusof', 'Chan', 'Pillai', 'Omar', 'Lim', 'Aziz'];
const EXTRA_DUMMY_AGES: [min: number, max: number, count: number][] = [
  [18, 24, 30],
  [25, 34, 48],
  [35, 44, 26],
  [45, 54, 12],
  [55, 62, 6],
];
const EXTRA_NO_DOB = 12;

const generateDummyApplicants = () => {
  let seed = 20261007;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const thisYear = new Date().getFullYear();
  const people: { name: string; dob: string | null }[] = [];
  for (const [min, max, count] of EXTRA_DUMMY_AGES) {
    for (let i = 0; i < count; i++) {
      const age = min + Math.floor(rand() * (max - min + 1));
      // A birthday in January keeps the age stable for the rest of the year.
      const day = String(1 + Math.floor(rand() * 28)).padStart(2, '0');
      people.push({ name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, dob: `${thisYear - age}-01-${day}` });
    }
  }
  for (let i = 0; i < EXTRA_NO_DOB; i++) people.push({ name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`, dob: null });
  return people;
};

const DUMMY_APPLICANTS = [...BASE_DUMMY_APPLICANTS, ...generateDummyApplicants()];

const ageOf = (dob: string, today = new Date()) => {
  const d = new Date(dob);
  const beforeBirthday = today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate());
  return today.getFullYear() - d.getFullYear() - (beforeBirthday ? 1 : 0);
};

// With an age group picked, every single age in it gets its own point (18, 19, 20 ... 24).
const ageStats = (applicants: { dob: string | null }[], range = 'all') => {
  const allAges = applicants.flatMap((a) => (a.dob ? [ageOf(a.dob)] : []));
  const bucket = AGE_BUCKETS.find((b) => b.range === range);
  const ages = bucket ? allAges.filter((age) => age >= bucket.min && age <= bucket.max) : allAges;
  const buckets = bucket
    ? Array.from({ length: (bucket.max === Infinity ? Math.max(bucket.min + 9, ...ages) : bucket.max) - bucket.min + 1 }, (_, i) => {
        const age = bucket.min + i;
        return { range: `${age} years`, min: age, max: age };
      })
    : AGE_BUCKETS;
  const groups: AgeGroup[] = buckets.map((b) => ({ ...b, total: ages.filter((age) => age >= b.min && age <= b.max).length }));
  const all = groups.reduce((sum, g) => sum + g.total, 0);
  // Shares that always add up to exactly 100 (largest remainder rounding).
  const raw = groups.map((g) => (all === 0 ? 0 : (g.total / all) * 100));
  const pct = raw.map(Math.floor);
  const short = all === 0 ? 0 : 100 - pct.reduce((x, y) => x + y, 0);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((x, y) => y[0] - x[0]);
  for (let k = 0; k < short; k++) pct[order[k][1]]++;
  return {
    groups,
    total: bucket ? ages.length : applicants.length,
    notProvided: applicants.length - allAges.length,
    shareLabel: bucket ? `of jobseekers aged ${bucket.range.replace(' years', '')}` : 'of jobseekers with an age',
    all,
    average: ages.length === 0 ? null : Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length),
    largest: all === 0 ? null : groups.reduce((a, b) => (b.total > a.total ? b : a)).range,
    shareOf: (g: AgeGroup) => pct[groups.indexOf(g)] ?? 0,
  };
};

const CHART_DAYS = 15;
const JOB_TITLES = [
  { name: 'Graphic Designer', color: '#1e293b', weight: 0.2 },
  { name: 'Software Engineer', color: '#a855f7', weight: 0.2 },
  { name: 'Data Analyst', color: '#0b8a92', weight: 0.14 },
  { name: 'Marketing Executive', color: '#3b82f6', weight: 0.13 },
  { name: 'HR Manager', color: '#f97316', weight: 0.12 },
  { name: 'Customer Service', color: '#ec4899', weight: 0.12 },
  { name: 'Accountant', color: '#eab308', weight: 0.09 },
];

// Rounds the y-axis up to a clean number split into 4 steps (e.g. 0, 2, 4, 6, 8).
const axisMax = (values: number[], steps = [1, 2, 5, 10, 20, 50]) => {
  const top = Math.max(0, ...values);
  if (top === 0) return 40;
  const step = steps.find((s) => s * 4 >= top) ?? Math.ceil(top / 4);
  return step * 4;
};

const STATES = [
  { name: 'Selangor', weight: 0.34 },
  { name: 'Kuala Lumpur', weight: 0.22 },
  { name: 'Johor', weight: 0.12 },
  { name: 'Penang', weight: 0.1 },
  { name: 'Perak', weight: 0.06 },
  { name: 'Sabah', weight: 0.05 },
  { name: 'Sarawak', weight: 0.04 },
  { name: 'Melaka', weight: 0.04 },
  { name: 'Kedah', weight: 0.03 },
];
const NO_LOCATION_EVERY = 16;

// Which jobs each age group tends to apply for, so the Age and Job Title Target panels tell the same story.
const JOBS_BY_AGE: { min: number; max: number; weights: Record<string, number> }[] = [
  { min: 18, max: 24, weights: { 'Customer Service': 0.25, 'Graphic Designer': 0.25, 'Marketing Executive': 0.2, 'Data Analyst': 0.15, 'Software Engineer': 0.15 } },
  { min: 25, max: 34, weights: { 'Software Engineer': 0.3, 'Data Analyst': 0.2, 'Graphic Designer': 0.2, 'Marketing Executive': 0.15, Accountant: 0.1, 'HR Manager': 0.05 } },
  { min: 35, max: 44, weights: { 'HR Manager': 0.25, Accountant: 0.25, 'Software Engineer': 0.2, 'Marketing Executive': 0.15, 'Graphic Designer': 0.15 } },
  { min: 45, max: Infinity, weights: { 'HR Manager': 0.4, Accountant: 0.35, 'Customer Service': 0.25 } },
];

// A past or current role. null = the jobseeker left Working Experience empty; 'none' = fresh graduate, no work yet.
type Experience = { title: string; from: number; to: number | null; years: number };
type ExperienceEntry = Experience | 'none' | null;

type DummyRecord = {
  id: number;
  name: string;
  dob: string | null;
  state: string | null;
  jobTitle: string;
  appliedAt: Date;
  experience: ExperienceEntry;
  education: Education | null;
  device: Device;
  industry: string | null;
  salary: Salary | null;
  desiredJob: string | null;
};

// Roles that lead to each job title, junior to senior; the one shown depends on years of experience.
const EXPERIENCE_TITLES: Record<string, [string, string, string]> = {
  'Graphic Designer': ['Junior Graphic Designer', 'Graphic Designer', 'Senior Visual Designer'],
  'Software Engineer': ['Junior Developer', 'Software Engineer', 'Senior Software Engineer'],
  'Data Analyst': ['Data Entry Executive', 'Junior Data Analyst', 'Business Analyst'],
  'Marketing Executive': ['Marketing Assistant', 'Social Media Executive', 'Marketing Manager'],
  'HR Manager': ['HR Assistant', 'HR Executive', 'HR Business Partner'],
  'Customer Service': ['Retail Assistant', 'Call Centre Agent', 'Customer Service Lead'],
  Accountant: ['Accounts Assistant', 'Audit Associate', 'Senior Accountant'],
};
const NO_EXPERIENCE_INFO_EVERY = 22;

// Uses its own seed per applicant, so adding experience never changes their age, state, job or apply date.
// Same options as the jobseeker dashboard's Education Level.
const EDUCATION_LEVELS = ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'] as const;
type EducationLevel = (typeof EDUCATION_LEVELS)[number];
type Education = { level: EducationLevel; field: string; institution: string; from: number; to: number };

// Typical education for each job applied for: the usual level mix and fields of study.
const EDUCATION_BY_JOB: Record<string, { levels: Partial<Record<EducationLevel, number>>; fields: string[] }> = {
  'Graphic Designer': { levels: { Diploma: 0.4, "Bachelor's Degree": 0.5, "Master's Degree": 0.1 }, fields: ['Graphic Design', 'Multimedia', 'Fine Arts'] },
  'Software Engineer': { levels: { Diploma: 0.1, "Bachelor's Degree": 0.7, "Master's Degree": 0.17, PhD: 0.03 }, fields: ['Computer Science', 'Software Engineering', 'Information Technology'] },
  'Data Analyst': { levels: { Diploma: 0.1, "Bachelor's Degree": 0.65, "Master's Degree": 0.22, PhD: 0.03 }, fields: ['Statistics', 'Computer Science', 'Mathematics'] },
  'Marketing Executive': { levels: { Diploma: 0.35, "Bachelor's Degree": 0.55, "Master's Degree": 0.1 }, fields: ['Marketing', 'Business Administration', 'Mass Communication'] },
  'HR Manager': { levels: { Diploma: 0.15, "Bachelor's Degree": 0.55, "Master's Degree": 0.3 }, fields: ['Human Resource Management', 'Psychology', 'Business Administration'] },
  'Customer Service': { levels: { 'High School': 0.35, Other: 0.25, Diploma: 0.3, "Bachelor's Degree": 0.1 }, fields: ['Business Studies', 'Hospitality', 'Communication'] },
  Accountant: { levels: { Diploma: 0.15, "Bachelor's Degree": 0.65, "Master's Degree": 0.2 }, fields: ['Accounting', 'Finance', 'Business Administration'] },
};
const INSTITUTIONS = ['Universiti Malaya', 'UiTM', 'UKM', 'UPM', 'USM', 'UTM', "Taylor's University", 'Sunway University', 'Multimedia University', 'APU'];
const COLLEGES = ['Kolej Komuniti Selangor', 'Politeknik Ungku Omar', 'SEGi College', 'KDU College'];
// Years it takes to finish each level, and the age people usually start it.
// "Other" covers short certificates and similar qualifications.
const STUDY = {
  'High School': [5, 13],
  Other: [1, 17],
  Diploma: [3, 18],
  "Bachelor's Degree": [4, 19],
  "Master's Degree": [2, 24],
  PhD: [4, 27],
} as const;
// Lowest to highest, for stepping down when someone is too young for a level.
const STUDY_ORDER: EducationLevel[] = ['High School', 'Other', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD'];
const NO_EDUCATION_INFO_EVERY = 25;

// Own seed per applicant, so education never changes their age, state, job, apply date or experience.
const dummyEducation = (id: number, age: number | null, jobTitle: string, now: Date): Education | null => {
  if (id % NO_EDUCATION_INFO_EVERY === 11) return null;
  let seed = (id + 7) * 2246822519;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const profile = EDUCATION_BY_JOB[jobTitle] ?? EDUCATION_BY_JOB['Customer Service'];
  const options = Object.entries(profile.levels) as [EducationLevel, number][];
  let r = rand();
  let level = (options.find(([, w]) => (r -= w) < 0) ?? options[0])[0];
  const years = age ?? 30;
  // Too young to have finished it yet: fall back to the highest level they could have.
  while (STUDY[level][1] + STUDY[level][0] > years && level !== 'High School') level = STUDY_ORDER[STUDY_ORDER.indexOf(level) - 1];
  const [duration, startAge] = STUDY[level];
  const birthYear = now.getFullYear() - years;
  const from = birthYear + startAge;
  const field = level === 'High School' ? 'SPM' : profile.fields[Math.floor(rand() * profile.fields.length)];
  const institution =
    level === 'High School' ? 'Secondary school' : level === 'Other' || level === 'Diploma'
      ? [...COLLEGES, ...INSTITUTIONS][Math.floor(rand() * (COLLEGES.length + INSTITUTIONS.length))]
      : INSTITUTIONS[Math.floor(rand() * INSTITUTIONS.length)];
  return { level, field, institution, from, to: from + duration };
};

const dummyExperience = (id: number, age: number | null, jobTitle: string, now: Date): ExperienceEntry => {
  if (id % NO_EXPERIENCE_INFO_EVERY === 7) return null;
  let seed = (id + 1) * 2654435761;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const thisYear = now.getFullYear();
  // Most people start working around 21-22, so experience can't be more than age minus 21.
  const possible = age === null ? 3 + Math.floor(rand() * 10) : Math.max(0, age - 21 - Math.floor(rand() * 2));
  if (possible === 0) return 'none';
  const from = thisYear - possible;
  const current = rand() < 0.7;
  const to = current ? null : Math.max(from + 1, thisYear - Math.floor(rand() * 2));
  const years = (to ?? thisYear) - from;
  const level = years < 3 ? 0 : years < 7 ? 1 : 2;
  return { title: EXPERIENCE_TITLES[jobTitle]?.[level] ?? jobTitle, from, to, years };
};

// Desired industry picked in onboarding, leaning on the job each jobseeker is after.
const INDUSTRY_BY_JOB: Record<string, [string, number][]> = {
  'Graphic Designer': [['Advertising & Media', 0.55], ['Information Technology', 0.2], ['Consumer Products', 0.15], ['Education', 0.1]],
  'Software Engineer': [['Information Technology', 0.65], ['Finance', 0.15], ['Web 3.0', 0.1], ['Healthcare', 0.1]],
  'Data Analyst': [['Information Technology', 0.4], ['Finance', 0.35], ['Healthcare', 0.15], ['Consumer Products', 0.1]],
  'Marketing Executive': [['Advertising & Media', 0.4], ['Consumer Products', 0.35], ['Hospitality & Tourism', 0.15], ['Real Estate', 0.1]],
  'HR Manager': [['Human Resources', 0.6], ['Manufacturing & Industrial', 0.2], ['Finance', 0.1], ['Healthcare', 0.1]],
  'Customer Service': [['Hospitality & Tourism', 0.4], ['Transport & Logistics', 0.3], ['Consumer Products', 0.2], ['Healthcare', 0.1]],
  Accountant: [['Finance', 0.7], ['Manufacturing & Industrial', 0.15], ['Real Estate', 0.15]],
};
const NO_INDUSTRY_INFO_EVERY = 18;

// Own seed per applicant, so the industry never changes any other dummy value.
const dummyIndustry = (id: number, jobTitle: string): string | null => {
  if (id % NO_INDUSTRY_INFO_EVERY === 9) return null;
  let seed = (id + 29) * 2654435769;
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  let r = seed / 4294967296;
  const options = INDUSTRY_BY_JOB[jobTitle] ?? INDUSTRY_BY_JOB['Customer Service'];
  return (options.find(([, w]) => (r -= w) < 0) ?? options[0])[0];
};

// Desired Job Title from Job Preferences: usually the kind of job they apply for, sometimes the next role they're aiming at.
const DESIRED_SWITCH: Record<string, string> = {
  'Graphic Designer': 'Marketing Executive',
  'Software Engineer': 'Data Analyst',
  'Data Analyst': 'Software Engineer',
  'Marketing Executive': 'Graphic Designer',
  'HR Manager': 'Accountant',
  'Customer Service': 'Marketing Executive',
  Accountant: 'Data Analyst',
};
const NO_DESIRED_JOB_EVERY = 19;

// Own seed per jobseeker, so the desired job never changes any other dummy value.
const dummyDesiredJob = (id: number, jobTitle: string): string | null => {
  if (id % NO_DESIRED_JOB_EVERY === 6) return null;
  let seed = (id + 53) * 2246822519;
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296 < 0.8 ? jobTitle : (DESIRED_SWITCH[jobTitle] ?? jobTitle);
};

// Expected salary range as the jobseeker typed it in Job Preferences (currency is always MYR in the dummy data).
type SalaryType = 'Monthly' | 'Daily' | 'Hourly' | 'Yearly';
type Salary = { from: number; to: number; type: SalaryType };
// Multiply a daily, hourly or yearly figure by this to get a monthly one (22 working days, 8 hours a day).
const TO_MONTHLY: Record<SalaryType, number> = { Monthly: 1, Daily: 22, Hourly: 176, Yearly: 1 / 12 };
// Starting monthly expectation for each job and how much it rises per year of experience.
const SALARY_BY_JOB: Record<string, [number, number]> = {
  'Graphic Designer': [2200, 150],
  'Software Engineer': [3500, 300],
  'Data Analyst': [3000, 250],
  'Marketing Executive': [2500, 180],
  'HR Manager': [3000, 250],
  'Customer Service': [1700, 90],
  Accountant: [2800, 230],
};
const NO_SALARY_INFO_EVERY = 20;

// Own seed per applicant, so the salary never changes any other dummy value.
const dummySalary = (id: number, jobTitle: string, experience: ExperienceEntry, age: number | null): Salary | null => {
  if (id % NO_SALARY_INFO_EVERY === 13) return null;
  let seed = (id + 41) * 2246822507;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const years = experience === 'none' ? 0 : experience ? experience.years : Math.max(0, (age ?? 28) - 23);
  const [base, perYear] = SALARY_BY_JOB[jobTitle] ?? SALARY_BY_JOB['Customer Service'];
  const monthlyFrom = (base + perYear * Math.min(years, 20)) * (0.85 + rand() * 0.3);
  const monthlyTo = monthlyFrom * (1.2 + rand() * 0.3);
  const r = rand();
  const type: SalaryType = r < 0.86 ? 'Monthly' : r < 0.93 ? 'Hourly' : r < 0.97 ? 'Daily' : 'Yearly';
  const step = { Monthly: 100, Daily: 10, Hourly: 1, Yearly: 1000 }[type];
  const inType = (monthly: number) => Math.max(step, Math.round(monthly / TO_MONTHLY[type] / step) * step);
  return { from: inType(monthlyFrom), to: inType(monthlyTo), type };
};

// One record per dummy applicant (one application each), shared by every panel so all totals agree:
// their age, home state, the job they applied for and when. A fixed seed keeps it identical on every load.
const buildDummyRecords = (now: Date): DummyRecord[] => {
  let seed = 7102028;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const weighted = (entries: [string, number][]) => {
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = rand() * total;
    return (entries.find(([, w]) => (r -= w) < 0) ?? entries[0])[0];
  };
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutesSoFarToday = Math.max(1, Math.floor((now.getTime() - startOfToday.getTime()) / 60_000));
  return DUMMY_APPLICANTS.map((person, id) => {
    const age = person.dob ? ageOf(person.dob, now) : null;
    const band = age === null ? null : JOBS_BY_AGE.find((b) => age >= b.min && age <= b.max);
    const jobTitle = weighted(band ? Object.entries(band.weights) : JOB_TITLES.map((j) => [j.name, j.weight]));
    const state = weighted(STATES.map((st) => [st.name, st.weight]));
    // Weekdays get roughly twice the applications of weekends; every application falls inside the 15 days shown.
    const daysAgo = Number(
      weighted(
        Array.from({ length: CHART_DAYS }, (_, d): [string, number] => {
          const day = new Date(startOfToday);
          day.setDate(day.getDate() - d);
          return [String(d), day.getDay() === 0 || day.getDay() === 6 ? 0.5 : 1];
        }),
      ),
    );
    const minuteOfDay = daysAgo === 0 ? Math.floor(rand() * minutesSoFarToday) : 8 * 60 + Math.floor(rand() * 15 * 60);
    const experience = dummyExperience(id, age, jobTitle, now);
    const desiredJob = dummyDesiredJob(id, jobTitle);
    const appliedAt = new Date(startOfToday.getTime() - daysAgo * 86_400_000 + minuteOfDay * 60_000);
    return {
      id,
      name: person.name,
      dob: person.dob,
      state: id % NO_LOCATION_EVERY === 5 ? null : state,
      jobTitle,
      appliedAt,
      experience,
      education: dummyEducation(id, age, jobTitle, now),
      device: dummyDevice(id, age),
      // What they want to do next drives the industry and salary they ask for.
      industry: dummyIndustry(id, desiredJob ?? jobTitle),
      salary: dummySalary(id, desiredJob ?? jobTitle, experience, age),
      desiredJob,
    };
  });
};

const EXPERIENCE_BANDS = [
  { label: 'Fresh graduate', min: 0, max: 0 },
  { label: '1–2 yrs', min: 1, max: 2 },
  { label: '3–5 yrs', min: 3, max: 5 },
  { label: '6–10 yrs', min: 6, max: 10 },
  { label: '11–20 yrs', min: 11, max: 20 },
  { label: '20+ yrs', min: 21, max: Infinity },
];

type ExperienceBand = { label: string; count: number; titles: [string, number][]; started: [number, number] | null; current: number };

type EducationBar = { level: EducationLevel; count: number; fields: [string, number][]; graduated: [number, number] | null };

const educationStats = (records: { education: Education | null }[]) => {
  const known = records.flatMap((r) => (r.education ? [r.education] : []));
  const bars: EducationBar[] = EDUCATION_LEVELS.map((level) => {
    const inLevel = known.filter((e) => e.level === level);
    const fields = new Map<string, number>();
    for (const e of inLevel) fields.set(e.field, (fields.get(e.field) ?? 0) + 1);
    const tos = inLevel.map((e) => e.to);
    return {
      level,
      count: inLevel.length,
      fields: [...fields.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3),
      graduated: tos.length === 0 ? null : [Math.min(...tos), Math.max(...tos)],
    };
  });
  const fieldTotals = new Map<string, number>();
  for (const e of known) if (e.level !== 'High School') fieldTotals.set(e.field, (fieldTotals.get(e.field) ?? 0) + 1);
  const top = bars.reduce<EducationBar | null>((best, b) => (best === null || b.count > best.count ? b : best), null);
  const degreeUp = known.filter((e) => e.level === "Bachelor's Degree" || e.level === "Master's Degree" || e.level === 'PhD').length;
  return {
    bars,
    provided: known.length,
    notProvided: records.length - known.length,
    mostCommon: known.length === 0 ? null : top!.level,
    degreeOrHigher: known.length === 0 ? null : Math.round((degreeUp / known.length) * 100),
    topField: [...fieldTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  };
};

// With a band picked, every single year in it gets its own slice (e.g. 3, 4, 5 yrs).
const yearsLabel = (y: number) => `${y} ${y === 1 ? 'yr' : 'yrs'}`;

const experienceYearStats = (
  records: { id: number; name: string; experience: ExperienceEntry }[],
  picked: (typeof EXPERIENCE_BANDS)[number],
) => {
  const inBand = records.flatMap((r) =>
    r.experience && r.experience !== 'none' && r.experience.years >= picked.min && r.experience.years <= picked.max ? [r.experience] : [],
  );
  const known = records.filter((r) => r.experience !== null).length;
  // Open-ended band (20+): only the years someone actually has, so the pie stays readable.
  const years =
    picked.max === Infinity
      ? [...new Set(inBand.map((e) => e.years))].sort((a, b) => a - b)
      : Array.from({ length: picked.max - picked.min + 1 }, (_, i) => picked.min + i);
  const bands: ExperienceBand[] = years.map((y) => {
    const inYear = inBand.filter((e) => e.years === y);
    const titleCounts = new Map<string, number>();
    for (const e of inYear) titleCounts.set(e.title, (titleCounts.get(e.title) ?? 0) + 1);
    const froms = inYear.map((e) => e.from);
    return {
      label: yearsLabel(y),
      count: inYear.length,
      titles: [...titleCounts.entries()].sort((x, z) => z[1] - x[1]).slice(0, 3),
      started: froms.length === 0 ? null : ([Math.min(...froms), Math.max(...froms)] as [number, number]),
      current: inYear.filter((e) => e.to === null).length,
    };
  });
  const top = bands.reduce<ExperienceBand | null>((best, b) => (best === null || b.count > best.count ? b : best), null);
  return {
    bands,
    provided: inBand.length,
    rows: [],
    fresh: 0,
    mostCommon: inBand.length === 0 ? null : top!.label,
    notProvided: records.length - known,
    average: inBand.length === 0 ? null : Math.round((inBand.reduce((sum, e) => sum + e.years, 0) / inBand.length) * 10) / 10,
    most: inBand.length === 0 ? null : Math.max(...inBand.map((e) => e.years)),
  };
};

// Fields of study in the data, for the filter dropdown (only those at the picked level, if any).
const educationFieldOptions = (records: { education: Education | null }[], level: string) =>
  [...new Set(records.flatMap((r) => (r.education && (level === 'all' || r.education.level === level) ? [r.education.field] : [])))].sort((a, b) =>
    a.localeCompare(b),
  );

// One education level split by field of study (tooltip: top institutions), or, with a field
// picked too, split by institution (tooltip: when they finished).
const educationFieldStats = (records: { education: Education | null }[], level: string, field = 'all') => {
  const inLevel = records.flatMap((r) =>
    r.education && r.education.level === level && (field === 'all' || r.education.field === field) ? [r.education] : [],
  );
  const known = records.filter((r) => r.education !== null).length;
  const color = EDUCATION_COLORS[EDUCATION_LEVELS.indexOf(level as EducationLevel)];
  const groupOf = (e: Education) => (field === 'all' ? e.field : e.institution);
  const rows: IndustryRow[] = [...new Set(inLevel.map(groupOf))]
    .map((label) => {
      const inRow = inLevel.filter((e) => groupOf(e) === label);
      const tip = field === 'all' ? topCounts(inRow.map((e) => e.institution)) : topCounts(inRow.map((e) => `Finished ${e.to}`));
      return { label, color, count: inRow.length, tip };
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const institutions = topCounts(inLevel.map((e) => e.institution));
  return {
    rows,
    provided: inLevel.length,
    notProvided: records.length - known,
    topField: rows[0]?.label ?? null,
    share: known === 0 ? null : Math.round((inLevel.length / known) * 100),
    topInstitution: institutions[0]?.[0] ?? null,
  };
};

const experienceStats = (records: { id: number; name: string; experience: ExperienceEntry }[], band = 'all') => {
  const picked = EXPERIENCE_BANDS.find((b) => b.label === band && b.min > 0);
  if (picked) return experienceYearStats(records, picked);
  const withRole = records
    .flatMap((r) => (r.experience && r.experience !== 'none' ? [{ id: r.id, name: r.name, ...r.experience }] : []))
    .sort((a, b) => b.years - a.years || a.name.localeCompare(b.name));
  const fresh = records.filter((r) => r.experience === 'none').length;
  const provided = withRole.length + fresh;
  const totalYears = withRole.reduce((sum, r) => sum + r.years, 0);
  const bands: ExperienceBand[] = EXPERIENCE_BANDS.map((band) => {
    if (band.min === 0) return { label: band.label, count: fresh, titles: [], started: null, current: 0 };
    const inBand = withRole.filter((r) => r.years >= band.min && r.years <= band.max);
    const titleCounts = new Map<string, number>();
    for (const r of inBand) titleCounts.set(r.title, (titleCounts.get(r.title) ?? 0) + 1);
    const froms = inBand.map((r) => r.from);
    return {
      label: band.label,
      count: inBand.length,
      titles: [...titleCounts.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3),
      started: froms.length === 0 ? null : ([Math.min(...froms), Math.max(...froms)] as [number, number]),
      current: inBand.filter((r) => r.to === null).length,
    };
  });
  return {
    bands,
    provided,
    rows: withRole,
    fresh,
    mostCommon: null as string | null,
    notProvided: records.length - provided,
    average: provided === 0 ? null : Math.round((totalYears / provided) * 10) / 10,
    most: withRole[0]?.years ?? null,
  };
};

// Desired job titles plus a grey "not provided" slot, so every split adds up to its total.
const DESIRED_NOT_PROVIDED = 'Desired job not provided';
const DESIRED_SERIES = [...JOB_TITLES, { name: DESIRED_NOT_PROVIDED, color: '#cbd5e1', weight: 0 }];
const desiredOf = (r: { desiredJob: string | null }) => r.desiredJob ?? DESIRED_NOT_PROVIDED;

type LocationRow = { state: string; includes: string[]; counts: number[]; total: number };

const locationStats = (applications: { state: string | null; desiredJob: string | null }[], state = 'all') => {
  const located = applications.filter((a) => a.state !== null && (state === 'all' || a.state === state));
  const rowFor = (state: string, includes: string[]): LocationRow => {
    const inRow = located.filter((a) => includes.includes(a.state!));
    const counts = DESIRED_SERIES.map((p) => inRow.filter((a) => desiredOf(a) === p.name).length);
    return { state, includes, counts, total: inRow.length };
  };
  // Every state on its own row, most jobseekers first.
  const rows = (state === 'all' ? STATES.map((st) => rowFor(st.name, [st.name])) : [rowFor(state, [state])]).sort((a, b) => b.total - a.total);
  const byState = new Map<string, number>();
  for (const a of located) byState.set(a.state!, (byState.get(a.state!) ?? 0) + 1);
  const topState = [...byState.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;
  const notProvided = applications.filter((a) => a.state === null).length;
  return { rows, located: located.length, notProvided, topState, statesCovered: byState.size };
};

const DEVICES = [
  { label: 'Desktop', short: 'D', color: '#6366f1' },
  { label: 'Mobile', short: 'M', color: '#07bcca' },
  { label: 'Tablet', short: 'T', color: '#f59e0b' },
] as const;
type Device = (typeof DEVICES)[number]['label'];

// Younger applicants mostly apply from their phone; older ones more often from a desktop.
const DEVICE_BY_AGE: { max: number; weights: [Device, number][] }[] = [
  { max: 24, weights: [['Mobile', 0.75], ['Desktop', 0.18], ['Tablet', 0.07]] },
  { max: 34, weights: [['Mobile', 0.6], ['Desktop', 0.33], ['Tablet', 0.07]] },
  { max: 44, weights: [['Desktop', 0.52], ['Mobile', 0.4], ['Tablet', 0.08]] },
  { max: Infinity, weights: [['Desktop', 0.6], ['Mobile', 0.28], ['Tablet', 0.12]] },
];

// Own seed per applicant, so devices never change any other dummy value.
const dummyDevice = (id: number, age: number | null): Device => {
  let seed = (id + 13) * 3266489917;
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  let r = seed / 4294967296;
  const band = DEVICE_BY_AGE.find((b) => (age ?? 30) <= b.max)!;
  return (band.weights.find(([, w]) => (r -= w) < 0) ?? band.weights[0])[0];
};

// Percentages that always add up to exactly 100 (largest remainder rounding).
type DeviceAgeColumn = { range: string; total: number; counts: number[] };

const deviceByAge = (records: { dob: string | null; device: Device }[], now: Date): DeviceAgeColumn[] =>
  AGE_BUCKETS.map((b) => {
    const inBucket = records.filter((r) => {
      if (!r.dob) return false;
      const age = ageOf(r.dob, now);
      return age >= b.min && age <= b.max;
    });
    return {
      range: b.range.replace(' years', ''),
      total: inBucket.length,
      counts: DEVICES.map((d) => inBucket.filter((r) => r.device === d.label).length),
    };
  });

const deviceStats = (records: { device: Device }[]) => {
  const counts = DEVICES.map((d) => records.filter((r) => r.device === d.label).length);
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return DEVICES.map((d) => ({ ...d, count: 0, pct: 0 }));
  const raw = counts.map((c) => (c / total) * 100);
  const pct = raw.map(Math.floor);
  const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]);
  const short = 100 - pct.reduce((a, b) => a + b, 0);
  for (let k = 0; k < short; k++) pct[order[k][1]]++;
  return DEVICES.map((d, i) => ({ ...d, count: counts[i], pct: pct[i] }));
};

const INDUSTRY_COLORS = [
  '#07bcca', '#0b8a92', '#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#14b8a6',
  '#f97316', '#84cc16', '#e11d48', '#8b5cf6', '#0ea5e9', '#d946ef', '#22c55e', '#eab308',
  '#64748b', '#fb7185', '#2dd4bf', '#7c3aed', '#facc15', '#94a3b8',
];

// label = industry, or a job title when one industry is picked; tip = top 3 job titles (or states) inside it.
type IndustryRow = { label: string; color: string; count: number; tip: [string, number][] };

const topCounts = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
};

// Every industry on its own row; with one picked, its jobseekers split by job title instead.
const industryStats = (records: { industry: string | null; desiredJob: string | null; state: string | null }[], industry = 'all') => {
  const known = records.filter((r) => r.industry !== null);
  const totals = new Map<string, number>();
  for (const r of known) totals.set(r.industry!, (totals.get(r.industry!) ?? 0) + 1);
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name]) => name);
  const notProvided = records.length - known.length;
  if (industry !== 'all') {
    const inIndustry = known.filter((r) => r.industry === industry);
    const rows: IndustryRow[] = DESIRED_SERIES.map((j) => {
      const inJob = inIndustry.filter((r) => desiredOf(r) === j.name);
      return { label: j.name, color: j.color, count: inJob.length, tip: topCounts(inJob.flatMap((r) => (r.state ? [r.state] : []))) };
    })
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count);
    return {
      rows,
      provided: inIndustry.length,
      notProvided,
      top: rows[0]?.label ?? null,
      topShare: known.length === 0 ? null : Math.round((inIndustry.length / known.length) * 100),
      covered: rows.filter((row) => row.label !== DESIRED_NOT_PROVIDED).length,
    };
  }
  const rows: IndustryRow[] = ranked.map((name, k) => {
    const inRow = known.filter((r) => r.industry === name);
    return { label: name, color: INDUSTRY_COLORS[k % INDUSTRY_COLORS.length], count: inRow.length, tip: topCounts(inRow.flatMap((r) => (r.desiredJob ? [r.desiredJob] : []))) };
  });
  const top = ranked[0] ?? null;
  return {
    rows,
    provided: known.length,
    notProvided,
    top,
    topShare: top === null ? null : Math.round((totals.get(top)! / known.length) * 100),
    covered: totals.size,
  };
};

// Industries that appear in the data, for the filter dropdown.
const industryOptions = (records: { industry: string | null }[]) =>
  [...new Set(records.flatMap((r) => (r.industry ? [r.industry] : [])))].sort((a, b) => a.localeCompare(b));

const SALARY_BANDS = [
  { label: '< RM 2k', min: 0, max: 2000 },
  { label: 'RM 2–3k', min: 2000, max: 3000 },
  { label: 'RM 3–5k', min: 3000, max: 5000 },
  { label: 'RM 5–8k', min: 5000, max: 8000 },
  { label: 'RM 8–12k', min: 8000, max: 12000 },
  { label: 'RM 12k+', min: 12000, max: Infinity },
];
const SALARY_COLORS = ['#07bcca', '#0b8a92', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'];

type SalaryBand = { label: string; min: number; max: number; count: number; pct: number; jobs: [string, number][] };

const rm = (n: number) => `RM ${Math.round(n).toLocaleString('en-MY')}`;

const kLabel = (n: number) => String(Math.round(n / 100) / 10);

// Smaller ranges inside one band: RM 500 steps up to RM 5k, RM 1k steps up to RM 12k, RM 2k steps above.
const salarySteps = (band: (typeof SALARY_BANDS)[number], monthlies: number[]) => {
  const step = band.max <= 5000 ? 500 : band.max <= 12000 ? 1000 : 2000;
  // At least two ranges, so the graph always draws a line.
  const start = band.min > 0 ? band.min : Math.min(band.max - step * 2, Math.floor(Math.min(band.max, ...monthlies) / step) * step);
  const end = band.max !== Infinity ? band.max : Math.max(band.min + step * 2, Math.ceil(Math.max(band.min, ...monthlies) / step) * step);
  return Array.from({ length: Math.round((end - start) / step) }, (_, i) => {
    const min = start + i * step;
    // The first range of the lowest band also takes anyone below it.
    return { label: `RM ${kLabel(min)}–${kLabel(min + step)}k`, min: band.min === 0 && i === 0 ? 0 : min, max: min + step };
  });
};

// With a band picked, it splits into smaller ranges (e.g. RM 3–5k into RM 3–3.5k, 3.5–4k, 4–4.5k, 4.5–5k).
const salaryStats = (records: { salary: Salary | null; desiredJob: string | null }[], band = 'all') => {
  // Each jobseeker counts once, at the middle of their range converted to a monthly amount.
  const all = records.flatMap((r) =>
    r.salary ? [{ desiredJob: r.desiredJob, type: r.salary.type, monthly: ((r.salary.from + r.salary.to) / 2) * TO_MONTHLY[r.salary.type] }] : [],
  );
  const picked = SALARY_BANDS.find((b) => b.label === band);
  const known = picked ? all.filter((k) => k.monthly >= picked.min && k.monthly < picked.max) : all;
  const ranges = picked ? salarySteps(picked, known.map((k) => k.monthly)) : SALARY_BANDS;
  const bands: SalaryBand[] = ranges.map((b) => {
    const inBand = known.filter((k) => k.monthly >= b.min && k.monthly < b.max);
    const jobs = new Map<string, number>();
    for (const k of inBand) if (k.desiredJob) jobs.set(k.desiredJob, (jobs.get(k.desiredJob) ?? 0) + 1);
    return { ...b, count: inBand.length, pct: 0, jobs: [...jobs.entries()].sort((x, y) => y[1] - x[1]).slice(0, 3) };
  });
  // Shares that always add up to exactly 100 (largest remainder rounding).
  if (known.length > 0) {
    const raw = bands.map((b) => (b.count / known.length) * 100);
    raw.forEach((v, i) => (bands[i].pct = Math.floor(v)));
    const short = 100 - bands.reduce((sum, b) => sum + b.pct, 0);
    const order = raw.map((v, i) => [v - Math.floor(v), i] as const).sort((x, y) => y[0] - x[0]);
    for (let k = 0; k < short; k++) bands[order[k][1]].pct++;
  }
  const sorted = known.map((k) => k.monthly).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length === 0 ? null : sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const top = bands.reduce<SalaryBand | null>((best, b) => (best === null || b.count > best.count ? b : best), null);
  return {
    bands,
    provided: known.length,
    notProvided: records.length - all.length,
    median,
    mostCommon: known.length === 0 ? null : top!.label,
    monthlyShare: known.length === 0 ? null : Math.round((known.filter((k) => k.type === 'Monthly').length / known.length) * 100),
  };
};

// Every desired job title on its own bar, optionally for one state only.
// Tooltip: top states, or with a state picked, the industries those jobseekers want.
const desiredJobStats = (records: { desiredJob: string | null; state: string | null; industry: string | null }[], state = 'all') => {
  const inState = state === 'all' ? records : records.filter((r) => r.state === state);
  const known = inState.filter((r) => r.desiredJob !== null);
  const rows: IndustryRow[] = JOB_TITLES.map((j) => {
    const inJob = known.filter((r) => r.desiredJob === j.name);
    const tip = state === 'all' ? inJob.flatMap((r) => (r.state ? [r.state] : [])) : inJob.flatMap((r) => (r.industry ? [r.industry] : []));
    return { label: j.name, color: j.color, count: inJob.length, tip: topCounts(tip) };
  })
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  return {
    rows,
    provided: known.length,
    notProvided: inState.length - known.length,
    top: rows[0]?.label ?? null,
    covered: rows.length,
  };
};

type ParamStatus = 'available' | 'partial' | 'missing';
type Param = { panel: string; label: string; key: string; source: string; status: ParamStatus; note?: string };

// Every value this page needs, where it would come from, and whether JobGiga collects it today.
const PARAMS: Param[] = [
  { panel: 'Age', label: 'Age', key: 'date_of_birth', source: 'Jobseeker profile', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Age', label: 'Jobseekers', key: 'jobseeker_id', source: 'Jobseeker profile', status: 'available' },
  { panel: 'Job Title Target', label: 'Desired job title', key: 'job_title', source: 'Jobseeker dashboard · Job Preferences', status: 'available', note: 'Desired Job Title; collected in onboarding and AI resume' },
  { panel: 'Candidate Apply From', label: 'Desired job title', key: 'job_title', source: 'Jobseeker dashboard · Job Preferences', status: 'available', note: 'Same Desired Job Title as the Jobseeker Job Title card' },
  { panel: 'Candidate Apply From', label: 'Location (where the jobseeker is from)', key: 'location', source: 'Jobseeker dashboard · Basic Info', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Years of Experience', label: 'Experience job title', key: 'recent_job_title', source: 'Jobseeker dashboard · Working Experience', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Years of Experience', label: 'Years of experience', key: 'working_period_from + working_period_to', source: 'Jobseeker dashboard · Working Experience', status: 'available', note: 'Collected in onboarding and AI resume; years are worked out from the working periods (onboarding also asks start_working_since)' },
  { panel: 'Education', label: 'Education level', key: 'education_level', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Education', label: 'Field of study', key: 'field_of_study', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Education', label: 'Institution name', key: 'institution_name', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Education', label: 'Study period', key: 'study_period', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Desired Industry', label: 'Desired industry', key: 'desired_industry', source: 'Jobseeker dashboard · Basic Info', status: 'available', note: 'Collected in onboarding under Job Title; not in AI resume yet (it asks for job categories)' },
  { panel: 'Expected Salary Range', label: 'Currency', key: 'salary_currency', source: 'Jobseeker dashboard · Job Preferences', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Expected Salary Range', label: 'Salary from', key: 'salary_from', source: 'Jobseeker dashboard · Job Preferences', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Expected Salary Range', label: 'Salary to', key: 'salary_to', source: 'Jobseeker dashboard · Job Preferences', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Expected Salary Range', label: 'Salary type', key: 'salary_type', source: 'Jobseeker dashboard · Job Preferences', status: 'available', note: 'Monthly, Daily, Hourly or Yearly; collected in onboarding and AI resume' },
  { panel: 'Desktop vs Mobile Applied', label: 'Device', key: 'device_type', source: 'Not collected', status: 'missing', note: 'Needs to be recorded from the browser when the jobseeker applies' },
];

type FilterOption = { value: string; label: string };

// Card filter dropdown in the referral-code style (not the browser's native select).
const FilterSelect = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [focus, setFocus] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };
  const openMenu = () => {
    setFocus(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      return openMenu();
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocus((f) => Math.min(options.length - 1, f + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocus((f) => Math.max(0, f - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(options[focus].value);
    }
  };

  return (
    <div className={`ti-filter${open ? ' open' : ''}`} ref={ref} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="ti-filter-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span>{current.label}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul className="ti-filter-menu" role="listbox" aria-label={label}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                tabIndex={-1}
                className={`ti-filter-option${o.value === value ? ' selected' : ''}${i === focus ? ' focused' : ''}`}
                onMouseEnter={() => setFocus(i)}
                onClick={() => pick(o.value)}
              >
                <span>{o.label}</span>
                {o.value === value && (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M5 12l5 5 9-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const STATUS_LABEL: Record<ParamStatus, string> = { available: 'Available', partial: 'Partial', missing: 'Missing' };

const ParamTags = ({ panel, show }: { panel: string; show: boolean }) => {
  if (!show) return null;
  const keys = [...new Map(PARAMS.filter((p) => p.panel === panel).map((p) => [p.key, p])).values()];
  return (
    <div className="ti-tags">
      {keys.map((p) => (
        <span key={p.key} className={`ti-tag ${p.status}`} title={p.note ?? p.source}>
          {p.key}
          {p.status !== 'available' && ` · ${STATUS_LABEL[p.status].toLowerCase()}`}
        </span>
      ))}
    </div>
  );
};

const DeviceIcon =({ label }: { label: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {label === 'Desktop' ? (
      <>
        <rect x="2.5" y="3.5" width="19" height="13" rx="2" />
        <path d="M8 21h8M12 16.5V21" />
      </>
    ) : label === 'Mobile' ? (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2" />
        <path d="M11 18h2" />
      </>
    ) : (
      <>
        <rect x="4" y="2.5" width="16" height="19" rx="2" />
        <path d="M11 18h2" />
      </>
    )}
  </svg>
);

// Catmull-Rom spline through the points, written as cubic Bezier segments for a smooth curve.
const smoothPath = (pts: [number, number][]) =>
  pts.reduce((d, [x, y], i) => {
    if (i === 0) return `M ${x} ${y}`;
    const [x0, y0] = pts[i - 2] ?? pts[i - 1];
    const [x1, y1] = pts[i - 1];
    const [x3, y3] = pts[i + 1] ?? [x, y];
    const c1 = [x1 + (x - x0) / 6, y1 + (y - y0) / 6];
    const c2 = [x - (x3 - x1) / 6, y - (y3 - y1) / 6];
    return `${d} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${x} ${y}`;
  }, '');

// One colour per age group, youngest to oldest; the curve blends between them.
const AGE_COLORS = ['#07bcca', '#0b8a92', '#6366f1', '#a855f7', '#ec4899'];

const AgeAreaChart = ({
  groups,
  shareOf,
  shareLabel,
  color,
}: {
  groups: AgeGroup[];
  shareOf: (g: AgeGroup) => number;
  shareLabel: string;
  color?: string;
}) => {
  // One colour per age group, or the picked group's colour for every single age.
  const colorAt = (i: number) => color ?? AGE_COLORS[i];
  const [active, setActive] = useState<number | null>(null);
  const w = 600;
  const h = 300;
  const max = axisMax(groups.map((g) => g.total));
  const ticks = [4, 3, 2, 1, 0].map((i) => (max / 4) * i);
  const slot = w / groups.length;
  const y = (v: number) => h - (v / max) * h;
  const pts = groups.map((g, i): [number, number] => [(i + 0.5) * slot, y(g.total)]);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const empty = groups.every((g) => g.total === 0);
  const peak = empty ? -1 : groups.reduce((best, g, i) => (g.total > groups[best].total ? i : best), 0);
  const rank = (i: number) => groups.filter((g) => g.total > groups[i].total).length + 1;
  const leftOf = (i: number) => `${(pts[i][0] / w) * 100}%`;
  return (
    <div className="ti-chart ti-chart-tall">
      <div className="ti-chart-y">
        {ticks.map((v) => (
          <span key={v} style={{ top: `${(1 - v / max) * 100}%` }}>
            {v}
          </span>
        ))}
      </div>
      <div className="ti-chart-body" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ti-chart-svg">
          <defs>
            <linearGradient id="ti-age-line" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={w} y2={0}>
              {pts.map(([px], i) => (
                <stop key={i} offset={px / w} stopColor={colorAt(i)} />
              ))}
            </linearGradient>
            <linearGradient id="ti-age-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
            <mask id="ti-age-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
              <rect x={0} y={0} width={w} height={h} fill="url(#ti-age-fade)" />
            </mask>
          </defs>
          {ticks.map((v) => (
            <line key={`h${v}`} x1={0} x2={w} y1={y(v)} y2={y(v)} className="ti-grid-line" />
          ))}
          {!empty && (
            <>
              <path d={area} fill="url(#ti-age-line)" mask="url(#ti-age-mask)" />
              <path d={line} fill="none" stroke="url(#ti-age-line)" strokeWidth={3} vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
        {!empty && active !== null && (
          <span
            className="ti-area-guide"
            style={{ left: leftOf(active), top: pts[active][1], height: h - pts[active][1], '--c': colorAt(active) } as CSSProperties}
          />
        )}
        {!empty &&
          groups.map((g, i) => (
            <span
              key={g.range}
              className={`ti-area-dot${i === peak ? ' is-peak' : ''}${i === active ? ' is-active' : ''}`}
              style={{ left: leftOf(i), top: pts[i][1], '--c': colorAt(i) } as CSSProperties}
            >
              {i === peak && active === null && <b className="ti-area-peak">Peak · {g.total}</b>}
            </span>
          ))}
        {!empty && active !== null && (
          <div
            className="ti-area-tip"
            style={{
              left: leftOf(active),
              top: pts[active][1],
              transform: `translate(${active === 0 ? '-12%' : active === groups.length - 1 ? '-88%' : '-50%'}, ${
                pts[active][1] < 140 ? '22px' : 'calc(-100% - 18px)'
              })`,
            }}
            role="status"
          >
            <b>{groups[active].range}</b>
            <span>
              <strong>{groups[active].total.toLocaleString()}</strong> jobseekers
            </span>
            <span>
              {shareOf(groups[active])}% {shareLabel}
            </span>
            <span className="ti-area-tip-rank">
              {active === peak ? 'Largest group' : `#${rank(active)} of ${groups.length} groups`}
            </span>
          </div>
        )}
        {!empty && (
          <div className="ti-area-hits" style={{ height: h }}>
            {groups.map((g, i) => (
              <button
                key={g.range}
                type="button"
                className="ti-area-hit"
                aria-label={`${g.range}: ${g.total} jobseekers, ${shareOf(g)}%`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((a) => (a === i ? null : i))}
              />
            ))}
          </div>
        )}
        {empty && <span className="ti-chart-empty">No age data yet</span>}
        <div className="ti-chart-x ti-age-x" style={{ gridTemplateColumns: `repeat(${groups.length}, 1fr)` }}>
          {groups.map((g, i) => (
            <span
              key={g.range}
              className={i === active ? 'is-active' : ''}
              style={{ '--c': colorAt(i) } as CSSProperties}
              onMouseEnter={() => !empty && setActive(i)}
            >
              <b>{g.range.replace(' years', '')}</b>
              {g.total.toLocaleString()} · {shareOf(g)}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const LocationChart = ({ rows, located }: { rows: LocationRow[]; located: number }) => {
  const [active, setActive] = useState<number | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const max = axisMax(rows.map((r) => r.total));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const empty = located === 0;
  const order = focus === null ? DESIRED_SERIES : [...DESIRED_SERIES.filter((p) => p.name === focus), ...DESIRED_SERIES.filter((p) => p.name !== focus)];
  const dimRow = (i: number) => active !== null && active !== i;
  const share = (n: number) => (located === 0 ? 0 : Math.round((n / located) * 100));
  return (
    <div className="ti-loc" onMouseLeave={() => setActive(null)}>
      {rows.map((row, i) => (
        <div key={row.state} className={`ti-loc-row${dimRow(i) ? ' is-dim' : ''}${active === i ? ' is-active' : ''}`}>
          <span className="ti-loc-label">{row.state}</span>
          <button
            type="button"
            className="ti-loc-track"
            aria-label={`${row.state}: ${row.total} jobseekers`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive((a) => (a === i ? null : i))}
          >
            <span className="ti-loc-stack" style={{ width: `${(row.total / max) * 100}%` }}>
              {order.map((p) => {
                const n = row.counts[DESIRED_SERIES.indexOf(p)];
                return n === 0 ? null : (
                  <i
                    key={p.name}
                    style={{ flexGrow: n, background: p.color, opacity: focus !== null && focus !== p.name ? 0.25 : 1 }}
                  />
                );
              })}
            </span>
          </button>
          <b className="ti-loc-total">{row.total}</b>
          {active === i && !empty && (
            <div className={`ti-area-tip ti-loc-tip${i >= rows.length - 2 ? ' is-above' : ''}`} role="status">
              <b>{row.state}</b>
              <span>
                <strong>{row.total}</strong> jobseekers · {share(row.total)}% of jobseekers with a location
              </span>
              {row.includes.length > 1 && <span className="ti-area-tip-rank">{row.includes.join(', ')}</span>}
              <div className="ti-col-tip-rows">
                {DESIRED_SERIES.map((p, j) => ({ ...p, n: row.counts[j] }))
                  .sort((a, b) => b.n - a.n)
                  .map((p) => (
                    <span key={p.name} className={focus !== null && focus !== p.name ? 'is-dim' : ''}>
                      <i style={{ background: p.color }} />
                      {p.name}
                      <em>{p.n}</em>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="ti-loc-row ti-loc-axis-row">
        <span />
        <div className="ti-loc-axis">
          {ticks.map((v) => (
            <span key={v} style={{ left: `${(v / max) * 100}%` }}>
              {v}
            </span>
          ))}
        </div>
        <span />
      </div>
      {empty ? (
        <span className="ti-loc-empty">No location data yet</span>
      ) : (
        <div className="ti-legend ti-loc-legend">
          {DESIRED_SERIES.map((p, j) => (
            <button
              key={p.name}
              type="button"
              className={`ti-legend-item${focus !== null && focus !== p.name ? ' is-dim' : ''}`}
              onMouseEnter={() => setFocus(p.name)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(p.name)}
              onBlur={() => setFocus(null)}
            >
              <i style={{ background: p.color }} />
              {p.name}
              <em>{rows.reduce((sum, r) => sum + r.counts[j], 0)}</em>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const IndustryChart = ({
  rows,
  provided,
  shareLabel,
  emptyText = 'No industry data yet',
}: {
  rows: IndustryRow[];
  provided: number;
  shareLabel: string;
  emptyText?: string;
}) => {
  const [active, setActive] = useState<number | null>(null);
  const max = axisMax(rows.map((r) => r.count), [1, 2, 4, 5, 8, 10, 15, 20, 25, 50]);
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const share = (n: number) => (provided === 0 ? 0 : Math.round((n / provided) * 100));
  if (provided === 0) return <span className="ti-loc-empty">{emptyText}</span>;
  return (
    <div className="ti-loc ti-ind" onMouseLeave={() => setActive(null)}>
      {rows.map((row, i) => (
        <div key={row.label} className={`ti-loc-row${active !== null && active !== i ? ' is-dim' : ''}${active === i ? ' is-active' : ''}`}>
          <span className="ti-loc-label">{row.label}</span>
          <button
            type="button"
            className="ti-loc-track"
            aria-label={`${row.label}: ${row.count} jobseekers`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive((a) => (a === i ? null : i))}
          >
            <span className="ti-loc-stack" style={{ width: `${(row.count / max) * 100}%` }}>
              <i style={{ flexGrow: 1, background: row.color }} />
            </span>
          </button>
          <b className="ti-loc-total">{row.count}</b>
          {active === i && (
            <div className={`ti-area-tip ti-loc-tip${i >= rows.length - 2 && rows.length > 2 ? ' is-above' : ''}`} role="status">
              <b>{row.label}</b>
              <span>
                <strong>{row.count}</strong> jobseekers · {share(row.count)}% {shareLabel}
              </span>
              <div className="ti-col-tip-rows">
                {row.tip.map(([name, n]) => (
                  <span key={name}>
                    <i style={{ background: row.color }} />
                    {name}
                    <em>{n}</em>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="ti-loc-row ti-loc-axis-row">
        <span />
        <div className="ti-loc-axis">
          {ticks.map((v) => (
            <span key={v} style={{ left: `${(v / max) * 100}%` }}>
              {v}
            </span>
          ))}
        </div>
        <span />
      </div>
    </div>
  );
};

const EXPERIENCE_COLORS = ['#07bcca', '#0b8a92', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'];
// Extra colours for when a band is split into single years (up to ~20 slices).
const YEAR_COLORS = [
  ...EXPERIENCE_COLORS,
  '#3b82f6', '#14b8a6', '#f97316', '#84cc16', '#e11d48', '#8b5cf6', '#0ea5e9', '#d946ef',
  '#22c55e', '#eab308', '#64748b', '#fb7185', '#2dd4bf', '#7c3aed', '#facc15',
];

const ExperienceChart = ({ bands, provided }: { bands: ExperienceBand[]; provided: number }) => {
  const [active, setActive] = useState<number | null>(null);
  const size = 260;
  const r = 120;
  const c = size / 2;
  const many = bands.length > EXPERIENCE_COLORS.length;
  const palette = many ? YEAR_COLORS : EXPERIENCE_COLORS;
  // Legend rows shrink when there are lots of single years, so the list stays beside the pie.
  const rowStep = bands.length > 8 ? 26 : 37;
  // Shares that always add up to exactly 100 (largest remainder rounding).
  const raw = bands.map((b) => (provided === 0 ? 0 : (b.count / provided) * 100));
  const pct = raw.map(Math.floor);
  const short = provided === 0 ? 0 : 100 - pct.reduce((x, y) => x + y, 0);
  const order = raw.map((v, k) => [v - Math.floor(v), k] as const).sort((x, y) => y[0] - x[0]);
  for (let k = 0; k < short; k++) pct[order[k][1]]++;
  const share = (n: number, k: number) => (n === 0 ? 0 : pct[k]);
  if (provided === 0) {
    return (
      <div className="ti-pie">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={c} cy={c} r={r} fill="#e2e8f0" />
        </svg>
        <span className="ti-pie-empty">No experience data yet</span>
      </div>
    );
  }
  // Slices start at 12 o'clock and go clockwise, in band order (fresh graduate first).
  let angle = -Math.PI / 2;
  const slices = bands.map((b, i) => {
    const sweep = (b.count / provided) * Math.PI * 2;
    const start = angle;
    angle += sweep;
    const mid = start + sweep / 2;
    const point = (a: number) => [c + r * Math.cos(a), c + r * Math.sin(a)];
    const [x1, y1] = point(start);
    const [x2, y2] = point(angle);
    const path =
      sweep >= Math.PI * 2 - 1e-6
        ? `M ${c} ${c - r} A ${r} ${r} 0 1 1 ${c - 0.01} ${c - r} Z`
        : `M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z`;
    return { ...b, i, path, mid, color: palette[i % palette.length], sweep };
  });
  const a = active === null ? null : slices[active];
  return (
    <div className="ti-pie" onMouseLeave={() => setActive(null)}>
      <svg width={size} height={size} viewBox={`-10 -10 ${size + 20} ${size + 20}`} className="ti-pie-svg">
        {slices.map((sl) =>
          sl.count === 0 ? null : (
            <path
              key={sl.label}
              d={sl.path}
              fill={sl.color}
              stroke="#ffffff"
              strokeWidth={2}
              className="ti-pie-slice"
              style={{
                transform: active === sl.i ? `translate(${Math.cos(sl.mid) * 8}px, ${Math.sin(sl.mid) * 8}px)` : undefined,
                opacity: active !== null && active !== sl.i ? 0.35 : 1,
              }}
              onMouseEnter={() => setActive(sl.i)}
              onClick={() => setActive((x) => (x === sl.i ? null : sl.i))}
            >
              <title>{`${sl.label}: ${sl.count} (${share(sl.count, sl.i)}%)`}</title>
            </path>
          ),
        )}
      </svg>
      <div className="ti-pie-side">
        <div className={`ti-pie-legend${rowStep < 37 ? ' is-compact' : ''}`}>
          {slices.map((sl) => (
            <button
              key={sl.label}
              type="button"
              className={`ti-pie-row${active !== null && active !== sl.i ? ' is-dim' : ''}${active === sl.i ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(sl.i)}
              onFocus={() => setActive(sl.i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive((x) => (x === sl.i ? null : sl.i))}
            >
              <i style={{ background: sl.color }} />
              <span>{sl.label}</span>
              <b>{sl.count}</b>
              <em>{share(sl.count, sl.i)}%</em>
            </button>
          ))}
        </div>
        {a && (
          <div
            className="ti-area-tip ti-pie-tip"
            style={
              a.i < slices.length / 2
                ? { top: `calc(${(a.i + 1) * rowStep}px + 6px)` }
                : { bottom: `calc(${(slices.length - a.i) * rowStep}px + 6px)` }
            }
            role="status"
          >
            <b>{a.label}</b>
            <span>
              <strong>{a.count}</strong> jobseekers · {share(a.count, a.i)}%
            </span>
            {a.started ? (
              <>
                <span>
                  Started working{' '}
                  {a.started[0] === a.started[1] ? `in ${a.started[0]}` : `between ${a.started[0]}–${a.started[1]}`}
                </span>
                <span>{a.current} still in that role (to Present)</span>
                <div className="ti-col-tip-rows">
                  {a.titles.map(([title, n]) => (
                    <span key={title}>
                      <i style={{ background: a.color }} />
                      {title}
                      <em>{n}</em>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <span className="ti-area-tip-rank">No work experience yet</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EDUCATION_COLORS = ['#07bcca', '#0b8a92', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'];

const EducationChart = ({ bars, provided }: { bars: EducationBar[]; provided: number }) => {
  const [active, setActive] = useState<number | null>(null);
  const w = 600;
  const h = 260;
  const max = axisMax(bars.map((b) => b.count), [1, 2, 4, 5, 8, 10, 15, 20, 25, 50]);
  const ticks = [4, 3, 2, 1, 0].map((i) => (max / 4) * i);
  const slot = w / bars.length;
  const barWidth = slot * 0.5;
  const y = (v: number) => h - (v / max) * h;
  const empty = provided === 0;
  const share = (n: number) => (provided === 0 ? 0 : Math.round((n / provided) * 100));
  const a = active === null ? null : bars[active];
  return (
    <div className="ti-chart ti-chart-edu">
      <div className="ti-chart-y">
        {ticks.map((v) => (
          <span key={v} style={{ top: `${(1 - v / max) * 100}%` }}>
            {v}
          </span>
        ))}
      </div>
      <div className="ti-chart-body" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ti-chart-svg">
          {ticks.map((v) => (
            <line key={`h${v}`} x1={0} x2={w} y1={y(v)} y2={y(v)} className="ti-grid-line" />
          ))}
          {active !== null && <rect x={active * slot} y={0} width={slot} height={h} className="ti-col-band" />}
          {!empty &&
            bars.map((b, i) =>
              b.count === 0 ? null : (
                <rect
                  key={b.level}
                  x={i * slot + (slot - barWidth) / 2}
                  y={y(b.count)}
                  width={barWidth}
                  height={h - y(b.count)}
                  fill={EDUCATION_COLORS[i]}
                  className="ti-col-rect"
                  opacity={active !== null && active !== i ? 0.35 : 1}
                />
              ),
            )}
        </svg>
        {a && !empty && (
          <div
            className="ti-area-tip ti-col-tip"
            style={
              active! < bars.length / 2
                ? { left: `${(((active! + 1) * slot) / w) * 100}%`, top: 0, transform: 'translateX(4px)' }
                : { left: `${((active! * slot) / w) * 100}%`, top: 0, transform: 'translateX(calc(-100% - 4px))' }
            }
            role="status"
          >
            <b>{a.level}</b>
            <span>
              <strong>{a.count}</strong> jobseekers · {share(a.count)}%
            </span>
            {a.graduated && (
              <span>
                Finished {a.graduated[0] === a.graduated[1] ? `in ${a.graduated[0]}` : `between ${a.graduated[0]}–${a.graduated[1]}`}
              </span>
            )}
            {a.fields.length > 0 && (
              <div className="ti-col-tip-rows">
                {a.fields.map(([field, n]) => (
                  <span key={field}>
                    <i style={{ background: EDUCATION_COLORS[active!] }} />
                    {field}
                    <em>{n}</em>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {!empty && (
          <div className="ti-area-hits" style={{ height: h }}>
            {bars.map((b, i) => (
              <button
                key={b.level}
                type="button"
                className="ti-area-hit"
                aria-label={`${b.level}: ${b.count} jobseekers`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((x) => (x === i ? null : i))}
              />
            ))}
          </div>
        )}
        {empty && <span className="ti-chart-empty">No education data yet</span>}
        <div className="ti-chart-x ti-age-x" style={{ gridTemplateColumns: `repeat(${bars.length}, 1fr)` }}>
          {bars.map((b, i) => (
            <span key={b.level} className={i === active ? 'is-active' : ''}>
              <b>{b.level}</b>
              {b.count} · {share(b.count)}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SalaryChart = ({ bands, provided, color }: { bands: SalaryBand[]; provided: number; color?: string }) => {
  // One colour per band, or the picked band's colour for all its smaller ranges.
  const colorAt = (i: number) => color ?? SALARY_COLORS[i];
  const [active, setActive] = useState<number | null>(null);
  const w = 600;
  const h = 260;
  const max = axisMax(bands.map((b) => b.count), [1, 2, 4, 5, 8, 10, 15, 20, 25, 50]);
  const ticks = [4, 3, 2, 1, 0].map((i) => (max / 4) * i);
  const slot = w / bands.length;
  const y = (v: number) => h - (v / max) * h;
  const pts = bands.map((b, i): [number, number] => [(i + 0.5) * slot, y(b.count)]);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  const empty = provided === 0;
  const peak = empty ? -1 : bands.reduce((best, b, i) => (b.count > bands[best].count ? i : best), 0);
  const rank = (i: number) => bands.filter((b) => b.count > bands[i].count).length + 1;
  const leftOf = (i: number) => `${(pts[i][0] / w) * 100}%`;
  const a = active === null ? null : bands[active];
  return (
    <div className="ti-chart ti-chart-edu">
      <div className="ti-chart-y">
        {ticks.map((v) => (
          <span key={v} style={{ top: `${(1 - v / max) * 100}%` }}>
            {v}
          </span>
        ))}
      </div>
      <div className="ti-chart-body" onMouseLeave={() => setActive(null)}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ti-chart-svg">
          <defs>
            <linearGradient id="ti-sal-line" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={w} y2={0}>
              {pts.map(([px], i) => (
                <stop key={i} offset={px / w} stopColor={colorAt(i)} />
              ))}
            </linearGradient>
            <linearGradient id="ti-sal-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
            </linearGradient>
            <mask id="ti-sal-mask" maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
              <rect x={0} y={0} width={w} height={h} fill="url(#ti-sal-fade)" />
            </mask>
          </defs>
          {ticks.map((v) => (
            <line key={`h${v}`} x1={0} x2={w} y1={y(v)} y2={y(v)} className="ti-grid-line" />
          ))}
          {!empty && (
            <>
              <path d={area} fill="url(#ti-sal-line)" mask="url(#ti-sal-mask)" />
              <path d={line} fill="none" stroke="url(#ti-sal-line)" strokeWidth={3} vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
        {!empty && active !== null && (
          <span
            className="ti-area-guide"
            style={{ left: leftOf(active), top: pts[active][1], height: h - pts[active][1], '--c': colorAt(active) } as CSSProperties}
          />
        )}
        {!empty &&
          bands.map((b, i) => (
            <span
              key={b.label}
              className={`ti-area-dot${i === peak ? ' is-peak' : ''}${i === active ? ' is-active' : ''}`}
              style={{ left: leftOf(i), top: pts[i][1], '--c': colorAt(i) } as CSSProperties}
            >
              {i === peak && active === null && <b className="ti-area-peak">Peak · {b.count}</b>}
            </span>
          ))}
        {a && !empty && (
          <div
            className="ti-area-tip"
            style={{
              left: leftOf(active!),
              top: pts[active!][1],
              transform: `translate(${active === 0 ? '-12%' : active === bands.length - 1 ? '-88%' : '-50%'}, ${
                pts[active!][1] < 130 ? '22px' : 'calc(-100% - 18px)'
              })`,
            }}
            role="status"
          >
            <b>{a.max === Infinity ? `${rm(a.min)} and above` : a.min === 0 ? `Below ${rm(a.max)}` : `${rm(a.min)} – ${rm(a.max)}`} a month</b>
            <span>
              <strong>{a.count}</strong> jobseekers · {a.pct}%
            </span>
            <span className="ti-area-tip-rank">{active === peak ? 'Most common range' : `#${rank(active!)} of ${bands.length} ranges`}</span>
            {a.jobs.length > 0 && (
              <div className="ti-col-tip-rows">
                {a.jobs.map(([job, n]) => (
                  <span key={job}>
                    <i style={{ background: colorAt(active!) }} />
                    {job}
                    <em>{n}</em>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {!empty && (
          <div className="ti-area-hits" style={{ height: h }}>
            {bands.map((b, i) => (
              <button
                key={b.label}
                type="button"
                className="ti-area-hit"
                aria-label={`${b.label}: ${b.count} jobseekers, ${b.pct}%`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive((x) => (x === i ? null : i))}
              />
            ))}
          </div>
        )}
        {empty && <span className="ti-chart-empty">No salary data yet</span>}
        <div className="ti-chart-x ti-age-x" style={{ gridTemplateColumns: `repeat(${bands.length}, 1fr)` }}>
          {bands.map((b, i) => (
            <span
              key={b.label}
              className={i === active ? 'is-active' : ''}
              style={{ '--c': colorAt(i) } as CSSProperties}
              onMouseEnter={() => !empty && setActive(i)}
            >
              <b>{b.label}</b>
              {b.count} · {b.pct}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const DeviceAgeChart = ({ columns }: { columns: DeviceAgeColumn[] }) => {
  const [active, setActive] = useState<number | null>(null);
  const w = 600;
  const h = 200;
  const slot = w / columns.length;
  const barWidth = slot * 0.5;
  const ticks = [100, 75, 50, 25, 0];
  const y = (pct: number) => h - (pct / 100) * h;
  const empty = columns.every((c) => c.total === 0);
  const pct = (n: number, total: number) => (total === 0 ? 0 : Math.round((n / total) * 100));
  const a = active === null ? null : columns[active];
  return (
    <>
      <span className="ti-card-title ti-mix-title">Device by age group</span>
      <div className="ti-chart ti-chart-device">
        <div className="ti-chart-y">
          {ticks.map((v) => (
            <span key={v} style={{ top: `${100 - v}%` }}>
              {v}%
            </span>
          ))}
        </div>
        <div className="ti-chart-body" onMouseLeave={() => setActive(null)}>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="ti-chart-svg">
            {ticks.map((v) => (
              <line key={`h${v}`} x1={0} x2={w} y1={y(v)} y2={y(v)} className="ti-grid-line" />
            ))}
            {active !== null && <rect x={active * slot} y={0} width={slot} height={h} className="ti-col-band" />}
            {!empty &&
              columns.map((c, i) => {
                let base = 0;
                return DEVICES.map((d, j) => {
                  const n = c.counts[j];
                  if (n === 0 || c.total === 0) return null;
                  const top = base + (n / c.total) * 100;
                  const rect = (
                    <rect
                      key={`${c.range}-${d.label}`}
                      x={i * slot + (slot - barWidth) / 2}
                      y={y(top)}
                      width={barWidth}
                      height={y(base) - y(top)}
                      fill={d.color}
                      className="ti-col-rect"
                      opacity={active !== null && active !== i ? 0.35 : 1}
                    />
                  );
                  base = top;
                  return rect;
                });
              })}
          </svg>
          {a && !empty && (
            <div
              className="ti-area-tip ti-col-tip"
              style={
                active! < columns.length / 2
                  ? { left: `${(((active! + 1) * slot) / w) * 100}%`, top: 0, transform: 'translateX(4px)' }
                  : { left: `${((active! * slot) / w) * 100}%`, top: 0, transform: 'translateX(calc(-100% - 4px))' }
              }
              role="status"
            >
              <b>{a.range} years</b>
              <span>
                <strong>{a.total}</strong> jobseekers
              </span>
              <div className="ti-col-tip-rows">
                {DEVICES.map((d, j) => (
                  <span key={d.label}>
                    <i style={{ background: d.color }} />
                    {d.label}
                    <em>
                      {a.counts[j]} · {pct(a.counts[j], a.total)}%
                    </em>
                  </span>
                ))}
              </div>
            </div>
          )}
          {!empty && (
            <div className="ti-area-hits" style={{ height: h }}>
              {columns.map((c, i) => (
                <button
                  key={c.range}
                  type="button"
                  className="ti-area-hit"
                  aria-label={`${c.range} years: ${c.counts.map((n, j) => `${n} ${DEVICES[j].label}`).join(', ')}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive((x) => (x === i ? null : i))}
                />
              ))}
            </div>
          )}
          {empty && <span className="ti-chart-empty">No device data yet</span>}
          <div className="ti-chart-x ti-age-x" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
            {columns.map((c, i) => (
              <span key={c.range} className={i === active ? 'is-active' : ''}>
                <b>{c.range}</b>
                {c.total} jobseekers
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="ti-device-legend">
        {DEVICES.map((d) => (
          <span key={d.label}>
            <i style={{ background: d.color }} />
            {d.label}
          </span>
        ))}
      </div>
    </>
  );
};

export default function TalentIntelligencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const companyId = searchParams.get('company') ?? COMPANIES[0].id;
  const changeCompany = (id: string) => setSearchParams({ company: id });
  const company = COMPANIES.find((c) => c.id === companyId) ?? COMPANIES[0];
  const [showTags, setShowTags] = useState(true);
  const [useDummy, setUseDummy] = useState(false);
  const [now] = useState(() => new Date());
  const records = useMemo(() => (useDummy ? buildDummyRecords(now) : []), [useDummy, now]);
  const [ageRange, setAgeRange] = useState('all');
  const age = ageStats(records, ageRange);
  const [jobsState, setJobsState] = useState('all');
  const desired = desiredJobStats(records, jobsState);
  const [locState, setLocState] = useState('all');
  const [locJob, setLocJob] = useState('all');
  const loc = locationStats(locJob === 'all' ? records : records.filter((r) => r.desiredJob === locJob), locState);
  const [expBand, setExpBand] = useState('all');
  const exp = experienceStats(records, expBand);
  const edu = educationStats(records);
  const [eduLevel, setEduLevel] = useState('all');
  const [eduFieldPick, setEduFieldPick] = useState('all');
  const eduFieldOptions = educationFieldOptions(records, eduLevel);
  // A field that doesn't exist at the newly picked level falls back to all fields.
  const eduFieldValue = eduFieldOptions.includes(eduFieldPick) ? eduFieldPick : 'all';
  const eduField = educationFieldStats(records, eduLevel, eduFieldValue);
  const eduByField = eduFieldValue === 'all' ? edu : educationStats(records.filter((r) => r.education?.field === eduFieldValue));
  const [indPick, setIndPick] = useState('all');
  const ind = industryStats(records, indPick);
  const [salBand, setSalBand] = useState('all');
  const sal = salaryStats(records, salBand);
  const devices = deviceStats(records);
  const devicesByAge = deviceByAge(records, now);
  const [reportOpen, setReportOpen] = useState(false);
  const missing = PARAMS.filter((p) => p.status === 'missing').length;

  return (
    <EmployerShell company={company} onCompanyChange={changeCompany} active="Talent">
      <main className="rc-content">
        <h1 className="rc-page-title">Talent</h1>

        <div className="rc-tabs ti-tabs">
          <button className="rc-tab">Search Talent</button>
          <button className="rc-tab active">Talent Intelligence</button>
        </div>

        <div className="ti-grid">
          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Age</h2>
              <FilterSelect
                label="Filter by age group"
                value={ageRange}
                onChange={setAgeRange}
                options={[{ value: 'all', label: 'All ages' }, ...AGE_BUCKETS.map((b) => ({ value: b.range, label: b.range }))]}
              />
            </div>
            <ParamTags panel="Age" show={showTags} />
            <span className="ti-panel-sub">
              Understand the age distribution of your talent pool to identify workforce trends and hiring opportunities.
            </span>
            <AgeAreaChart
              groups={age.groups}
              shareOf={age.shareOf}
              shareLabel={age.shareLabel}
              color={ageRange === 'all' ? undefined : AGE_COLORS[AGE_BUCKETS.findIndex((b) => b.range === ageRange)]}
            />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>Total jobseekers</span>
                <b>{age.total.toLocaleString()}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Average age</span>
                <b>{age.average ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>{ageRange === 'all' ? 'Largest group' : 'Most common age'}</span>
                <b>{age.largest ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Age not provided</span>
                <b>{age.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Location</h2>
              <div className="ti-filters">
                <FilterSelect
                  label="Filter by state"
                  value={locState}
                  onChange={setLocState}
                  options={[{ value: 'all', label: 'All states' }, ...STATES.map((st) => ({ value: st.name, label: st.name }))]}
                />
                <FilterSelect
                  label="Filter by desired job title"
                  value={locJob}
                  onChange={setLocJob}
                  options={[{ value: 'all', label: 'All desired jobs' }, ...JOB_TITLES.map((j) => ({ value: j.name, label: j.name }))]}
                />
              </div>
            </div>
            <ParamTags panel="Candidate Apply From" show={showTags} />
            <span className="ti-panel-sub">Where your jobseekers are from, and the job they want</span>
            <LocationChart rows={loc.rows} located={loc.located} />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>With location</span>
                <b>{loc.located}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Top state</span>
                <b>{loc.topState ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>States covered</span>
                <b>{loc.statesCovered}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Location not provided</span>
                <b>{loc.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Years of Experience</h2>
              <FilterSelect
                label="Filter by years of experience"
                value={expBand}
                onChange={setExpBand}
                options={[{ value: 'all', label: 'All experience' }, ...EXPERIENCE_BANDS.filter((b) => b.min > 0).map((b) => ({ value: b.label, label: b.label }))]}
              />
            </div>
            <ParamTags panel="Years of Experience" show={showTags} />
            <span className="ti-panel-sub">How many years jobseekers have worked; hover a slice for when they started and their past job titles</span>
            <ExperienceChart bands={exp.bands} provided={exp.provided} />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>Average experience</span>
                <b>{exp.average === null ? '-' : `${exp.average} yrs`}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Most experienced</span>
                <b>{exp.most === null ? '-' : `${exp.most} yrs`}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>{expBand === 'all' ? 'Fresh graduates' : 'Most common'}</span>
                <b>{expBand === 'all' ? exp.fresh : (exp.mostCommon ?? '-')}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Not provided</span>
                <b>{exp.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Desired Industry</h2>
              <FilterSelect
                label="Filter by industry"
                value={indPick}
                onChange={setIndPick}
                options={[{ value: 'all', label: 'All industries' }, ...industryOptions(records).map((name) => ({ value: name, label: name }))]}
              />
            </div>
            <ParamTags panel="Desired Industry" show={showTags} />
            <span className="ti-panel-sub">Industries your jobseekers want to work in; hover a bar for the jobs they want</span>
            <IndustryChart
              rows={ind.rows}
              provided={ind.provided}
              shareLabel={indPick === 'all' ? 'of jobseekers with an industry' : `of jobseekers wanting ${indPick}`}
            />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>{indPick === 'all' ? 'Top industry' : 'Top job title'}</span>
                <b>{ind.top ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>{indPick === 'all' ? 'Top industry share' : 'Share of all jobseekers'}</span>
                <b>{ind.topShare === null ? '-' : `${ind.topShare}%`}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>{indPick === 'all' ? 'Industries covered' : 'Job titles'}</span>
                <b>{ind.covered}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Not provided</span>
                <b>{ind.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Expected Salary</h2>
              <FilterSelect
                label="Filter by salary range"
                value={salBand}
                onChange={setSalBand}
                options={[{ value: 'all', label: 'All salaries' }, ...SALARY_BANDS.map((b) => ({ value: b.label, label: b.label }))]}
              />
            </div>
            <ParamTags panel="Expected Salary Range" show={showTags} />
            <span className="ti-panel-sub">Middle of each jobseeker's expected range, as a monthly amount; hover a point for the job titles</span>
            <SalaryChart
              bands={sal.bands}
              provided={sal.provided}
              color={salBand === 'all' ? undefined : SALARY_COLORS[SALARY_BANDS.findIndex((b) => b.label === salBand)]}
            />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>Median expectation</span>
                <b>{sal.median === null ? '-' : rm(Math.round(sal.median / 100) * 100)}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Most common</span>
                <b>{sal.mostCommon ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Asked monthly</span>
                <b>{sal.monthlyShare === null ? '-' : `${sal.monthlyShare}%`}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Not provided</span>
                <b>{sal.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Education Level</h2>
              <div className="ti-filters">
                <FilterSelect
                  label="Filter by education level"
                  value={eduLevel}
                  onChange={setEduLevel}
                  options={[{ value: 'all', label: 'All levels' }, ...EDUCATION_LEVELS.map((level) => ({ value: level, label: level }))]}
                />
                <FilterSelect
                  label="Filter by field of study"
                  value={eduFieldValue}
                  onChange={setEduFieldPick}
                  options={[{ value: 'all', label: 'All fields' }, ...eduFieldOptions.map((field) => ({ value: field, label: field }))]}
                />
              </div>
            </div>
            <ParamTags panel="Education" show={showTags} />
            {eduLevel === 'all' ? (
              <>
                <span className="ti-panel-sub">
                  {eduFieldValue === 'all'
                    ? 'Highest education of your jobseekers; hover a bar for their fields of study'
                    : `Highest education of jobseekers who studied ${eduFieldValue}`}
                </span>
                <EducationChart bars={eduByField.bars} provided={eduByField.provided} />
                <div className="ti-age-stats">
                  <div className="ti-card ti-age-stat">
                    <span>Most common</span>
                    <b>{eduByField.mostCommon ?? '-'}</b>
                  </div>
                  <div className="ti-card ti-age-stat">
                    <span>Degree or higher</span>
                    <b>{eduByField.degreeOrHigher === null ? '-' : `${eduByField.degreeOrHigher}%`}</b>
                  </div>
                  <div className="ti-card ti-age-stat">
                    <span>{eduFieldValue === 'all' ? 'Top field' : 'Share of all jobseekers'}</span>
                    <b>
                      {eduFieldValue === 'all'
                        ? (edu.topField ?? '-')
                        : edu.provided === 0
                          ? '-'
                          : `${Math.round((eduByField.provided / edu.provided) * 100)}%`}
                    </b>
                  </div>
                  <div className="ti-card ti-age-stat">
                    <span>Not provided</span>
                    <b>{edu.notProvided}</b>
                  </div>
                </div>
              </>
            ) : (
              <>
                <span className="ti-panel-sub">
                  {eduFieldValue === 'all'
                    ? `Fields of study of jobseekers whose highest level is ${eduLevel}; hover a bar for their institutions`
                    : `Where jobseekers studied ${eduFieldValue} at ${eduLevel} level; hover a bar for when they finished`}
                </span>
                <IndustryChart
                  rows={eduField.rows}
                  provided={eduField.provided}
                  shareLabel={`of ${eduLevel} holders`}
                  emptyText={`No jobseekers with ${eduLevel} yet`}
                />
                <div className="ti-age-stats">
                  <div className="ti-card ti-age-stat">
                    <span>{eduFieldValue === 'all' ? 'Top field' : 'Top institution'}</span>
                    <b>{eduField.topField ?? '-'}</b>
                  </div>
                  <div className="ti-card ti-age-stat">
                    <span>Share of all jobseekers</span>
                    <b>{eduField.share === null ? '-' : `${eduField.share}%`}</b>
                  </div>
                  <div className="ti-card ti-age-stat">
                    <span>{eduFieldValue === 'all' ? 'Top institution' : 'Institutions'}</span>
                    <b>{eduFieldValue === 'all' ? (eduField.topInstitution ?? '-') : eduField.rows.length}</b>
                  </div>
                  <div className="ti-card ti-age-stat">
                    <span>Not provided</span>
                    <b>{eduField.notProvided}</b>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="ti-panel">
            <div className="ti-panel-head">
              <h2 className="rc-panel-title">Jobseeker Job Title</h2>
              <FilterSelect
                label="Filter by state"
                value={jobsState}
                onChange={setJobsState}
                options={[{ value: 'all', label: 'All states' }, ...STATES.map((st) => ({ value: st.name, label: st.name }))]}
              />
            </div>
            <ParamTags panel="Job Title Target" show={showTags} />
            <span className="ti-panel-sub">
              {jobsState === 'all'
                ? 'The job your jobseekers want, from Desired Job Title; hover a bar for where they are from'
                : `The job jobseekers from ${jobsState} want, from Desired Job Title; hover a bar for the industries they want`}
            </span>
            <IndustryChart
              rows={desired.rows}
              provided={desired.provided}
              shareLabel={jobsState === 'all' ? 'of jobseekers with a desired job' : `of jobseekers from ${jobsState} with a desired job`}
              emptyText="No desired job data yet"
            />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>With a desired job</span>
                <b>{desired.provided}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Most wanted</span>
                <b>{desired.top ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Job titles</span>
                <b>{desired.covered}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Not provided</span>
                <b>{desired.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <h2 className="rc-panel-title">Desktop vs Mobile Applied</h2>
            <ParamTags panel="Desktop vs Mobile Applied" show={showTags} />
            <span className="ti-panel-sub">Monitor and analyze performance to optimize your spend across products</span>
            <div className="ti-devices">
              {devices.map((d) => (
                <div key={d.label} className="ti-card ti-device" style={{ '--c': d.color } as CSSProperties}>
                  <span className="ti-device-label">
                    <DeviceIcon label={d.label} />
                    {d.label}
                  </span>
                  <span className="ti-device-value">{d.pct}%</span>
                  <span className="ti-device-sub">
                    {d.count} {d.count === 1 ? 'jobseeker' : 'jobseekers'}
                  </span>
                </div>
              ))}
            </div>
            <span className="ti-card-title ti-mix-title">Platform Mix</span>
            <div className="ti-mix-bar">
              {devices.map((d) => (
                <span key={d.label} style={{ width: `${d.pct}%`, background: d.color }} />
              ))}
            </div>
            <div className="ti-mix-legend">
              {devices.map((d) => (
                <span key={d.label}>
                  <b style={{ color: d.color }}>{d.short}</b> {d.pct}%
                </span>
              ))}
            </div>
            <DeviceAgeChart columns={devicesByAge} />
          </section>
        </div>
      </main>

      <div className="ti-mapping">
        {reportOpen && (
          <div className="ti-report" role="dialog" aria-label="Talent Intelligence parameters">
            <div className="ti-report-head">
              <span className="ti-report-title">Talent Intelligence parameters</span>
              <button type="button" className="ti-report-close" aria-label="Close" onClick={() => setReportOpen(false)}>
                ×
              </button>
            </div>
            <div className="ti-report-stats">
              {(['available', 'partial', 'missing'] as ParamStatus[]).map((st) => (
                <span key={st} className={`ti-tag ${st}`}>
                  {PARAMS.filter((p) => p.status === st).length} {STATUS_LABEL[st].toLowerCase()}
                </span>
              ))}
            </div>
            <label className="ti-switch">
              <input type="checkbox" checked={showTags} onChange={(e) => setShowTags(e.target.checked)} />
              <span className="ti-switch-track" aria-hidden="true" />
              Show tags on panels
            </label>
            <ul className="ti-param-list">
              {PARAMS.map((p) => (
                <li key={p.panel + p.label}>
                  <div className="ti-param-top">
                    <span>
                      <strong>{p.panel}:</strong> {p.label}
                    </span>
                    <span className={`ti-tag ${p.status}`}>{STATUS_LABEL[p.status]}</span>
                  </div>
                  <div className="ti-param-meta">
                    <code>{p.key}</code> · {p.source}
                    {p.note && <span className="ti-muted"> · {p.note}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" className="ti-mapping-fab" aria-expanded={reportOpen} onClick={() => setReportOpen((o) => !o)}>
          Mapping
          <span>{missing} missing</span>
        </button>
      </div>
      <label className="ti-dummy-fab">
        <input type="checkbox" checked={useDummy} onChange={(e) => setUseDummy(e.target.checked)} />
        <span className="ti-switch-track" aria-hidden="true" />
        Dummy data
        <small>{DUMMY_APPLICANTS.length} jobseekers</small>
      </label>
    </EmployerShell>
  );
}
