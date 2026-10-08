import { useMemo, useState } from 'react';
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

const ageStats = (applicants: { dob: string | null }[]) => {
  const ages = applicants.flatMap((a) => (a.dob ? [ageOf(a.dob)] : []));
  const groups: AgeGroup[] = AGE_BUCKETS.map((b) => ({ ...b, total: ages.filter((age) => age >= b.min && age <= b.max).length }));
  const all = groups.reduce((sum, g) => sum + g.total, 0);
  return {
    groups,
    all,
    total: applicants.length,
    notProvided: applicants.length - ages.length,
    average: ages.length === 0 ? null : Math.round(ages.reduce((sum, a) => sum + a, 0) / ages.length),
    largest: all === 0 ? null : groups.reduce((a, b) => (b.total > a.total ? b : a)).range,
    shareOf: (g: AgeGroup) => (all === 0 ? 0 : Math.round((g.total / all) * 100)),
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

type Application = { id: number; name: string; jobTitle: string; appliedAt: Date };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};
const longDate = (d: Date) => `${ordinal(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const jobTitleStats = (applications: Application[], now: Date) => {
  const days = Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (CHART_DAYS - 1 - i));
    return d;
  });
  const labels = days.map((d, i) =>
    i === 0 ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}` : String(d.getDate()).padStart(2, '0'),
  );
  const series =
    applications.length === 0
      ? []
      : JOB_TITLES.map((job) => ({
          name: job.name,
          color: job.color,
          values: days.map((d) => applications.filter((a) => a.jobTitle === job.name && dayKey(a.appliedAt) === dayKey(d)).length),
        }));
  const dates = days.map((d) => `${WEEKDAYS[d.getDay()]}, ${longDate(d)}`);
  const totals = days.map((_, i) => series.reduce((sum, sr) => sum + sr.values[i], 0));
  const total = totals.reduce((sum, t) => sum + t, 0);
  const top = series.reduce<(typeof series)[number] | null>(
    (best, sr) => (best === null || sr.values.reduce((a, v) => a + v, 0) > best.values.reduce((a, v) => a + v, 0) ? sr : best),
    null,
  );
  const busiest = total === 0 ? -1 : totals.indexOf(Math.max(...totals));
  const summary = {
    total,
    topTitle: top && total > 0 ? top.name : null,
    busiestDay: busiest < 0 ? null : `${ordinal(days[busiest].getDate())} ${MONTHS[days[busiest].getMonth()]}`,
    dailyAverage: Math.round(total / CHART_DAYS),
  };
  return { labels, dates, series, summary };
};

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
const SHOWN_STATES = ['Selangor', 'Kuala Lumpur', 'Johor', 'Penang'];
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
const EDUCATION_LEVELS = ['SPM', 'Certificate', 'Diploma', 'Degree', "Master's", 'PhD'] as const;
type EducationLevel = (typeof EDUCATION_LEVELS)[number];
type Education = { level: EducationLevel; field: string; institution: string; from: number; to: number };

// Typical education for each job applied for: the usual level mix and fields of study.
const EDUCATION_BY_JOB: Record<string, { levels: Partial<Record<EducationLevel, number>>; fields: string[] }> = {
  'Graphic Designer': { levels: { Diploma: 0.4, Degree: 0.5, "Master's": 0.1 }, fields: ['Graphic Design', 'Multimedia', 'Fine Arts'] },
  'Software Engineer': { levels: { Diploma: 0.1, Degree: 0.7, "Master's": 0.17, PhD: 0.03 }, fields: ['Computer Science', 'Software Engineering', 'Information Technology'] },
  'Data Analyst': { levels: { Diploma: 0.1, Degree: 0.65, "Master's": 0.22, PhD: 0.03 }, fields: ['Statistics', 'Computer Science', 'Mathematics'] },
  'Marketing Executive': { levels: { Diploma: 0.35, Degree: 0.55, "Master's": 0.1 }, fields: ['Marketing', 'Business Administration', 'Mass Communication'] },
  'HR Manager': { levels: { Diploma: 0.15, Degree: 0.55, "Master's": 0.3 }, fields: ['Human Resource Management', 'Psychology', 'Business Administration'] },
  'Customer Service': { levels: { SPM: 0.35, Certificate: 0.25, Diploma: 0.3, Degree: 0.1 }, fields: ['Business Studies', 'Hospitality', 'Communication'] },
  Accountant: { levels: { Diploma: 0.15, Degree: 0.65, "Master's": 0.2 }, fields: ['Accounting', 'Finance', 'Business Administration'] },
};
const INSTITUTIONS = ['Universiti Malaya', 'UiTM', 'UKM', 'UPM', 'USM', 'UTM', "Taylor's University", 'Sunway University', 'Multimedia University', 'APU'];
const COLLEGES = ['Kolej Komuniti Selangor', 'Politeknik Ungku Omar', 'SEGi College', 'KDU College'];
// Years it takes to finish each level, and the age people usually start it.
const STUDY = { SPM: [5, 13], Certificate: [1, 17], Diploma: [3, 18], Degree: [4, 19], "Master's": [2, 24], PhD: [4, 27] } as const;
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
  while (STUDY[level][1] + STUDY[level][0] > years && level !== 'SPM') level = EDUCATION_LEVELS[EDUCATION_LEVELS.indexOf(level) - 1];
  const [duration, startAge] = STUDY[level];
  const birthYear = now.getFullYear() - years;
  const from = birthYear + startAge;
  const field = level === 'SPM' ? 'Sijil Pelajaran Malaysia' : profile.fields[Math.floor(rand() * profile.fields.length)];
  const institution =
    level === 'SPM' ? 'Secondary school' : level === 'Certificate' || level === 'Diploma'
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
    const appliedAt = new Date(startOfToday.getTime() - daysAgo * 86_400_000 + minuteOfDay * 60_000);
    return {
      id,
      name: person.name,
      dob: person.dob,
      state: id % NO_LOCATION_EVERY === 5 ? null : state,
      jobTitle,
      appliedAt,
      experience: dummyExperience(id, age, jobTitle, now),
      education: dummyEducation(id, age, jobTitle, now),
      device: dummyDevice(id, age),
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
  for (const e of known) if (e.level !== 'SPM') fieldTotals.set(e.field, (fieldTotals.get(e.field) ?? 0) + 1);
  const top = bars.reduce<EducationBar | null>((best, b) => (best === null || b.count > best.count ? b : best), null);
  const degreeUp = known.filter((e) => EDUCATION_LEVELS.indexOf(e.level) >= EDUCATION_LEVELS.indexOf('Degree')).length;
  return {
    bars,
    provided: known.length,
    notProvided: records.length - known.length,
    mostCommon: known.length === 0 ? null : top!.level,
    degreeOrHigher: known.length === 0 ? null : Math.round((degreeUp / known.length) * 100),
    topField: [...fieldTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
  };
};

const experienceStats = (records: { id: number; name: string; experience: ExperienceEntry }[]) => {
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
    notProvided: records.length - provided,
    average: provided === 0 ? null : Math.round((totalYears / provided) * 10) / 10,
    most: withRole[0]?.years ?? null,
  };
};

type LocationRow = { state: string; includes: string[]; counts: number[]; total: number };

const locationStats = (applications: { state: string | null; jobTitle: string }[]) => {
  const located = applications.filter((a) => a.state !== null);
  const others = STATES.map((st) => st.name).filter((n) => !SHOWN_STATES.includes(n));
  const rowFor = (state: string, includes: string[]): LocationRow => {
    const inRow = located.filter((a) => includes.includes(a.state!));
    const counts = JOB_TITLES.map((p) => inRow.filter((a) => a.jobTitle === p.name).length);
    return { state, includes, counts, total: inRow.length };
  };
  const rows = [...SHOWN_STATES.map((st) => rowFor(st, [st])), rowFor('Others', others)];
  const byState = new Map<string, number>();
  for (const a of located) byState.set(a.state!, (byState.get(a.state!) ?? 0) + 1);
  const topState = [...byState.entries()].sort((x, y) => y[1] - x[1])[0]?.[0] ?? null;
  return { rows, located: located.length, notProvided: applications.length - located.length, topState, statesCovered: byState.size };
};

const DEVICES = [
  { label: 'Desktop', short: 'D', color: '#0b8a92' },
  { label: 'Mobile', short: 'M', color: '#07bcca' },
  { label: 'Tablet', short: 'T', color: '#a5e9ef' },
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

type ParamStatus = 'available' | 'partial' | 'missing';
type Param = { panel: string; label: string; key: string; source: string; status: ParamStatus; note?: string };

// Every value this page needs, where it would come from, and whether JobGiga collects it today.
const PARAMS: Param[] = [
  { panel: 'Age', label: 'Age', key: 'date_of_birth', source: 'Jobseeker profile', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Age', label: 'Applicants', key: 'application_id', source: 'Application', status: 'available' },
  { panel: 'Job Title Target', label: 'Job title', key: 'job_title', source: 'Job posting', status: 'available', note: 'The job applied for, not the desired job_title on the jobseeker dashboard' },
  { panel: 'Job Title Target', label: 'Applied date', key: 'applied_at', source: 'Application', status: 'available', note: 'Saved when the jobseeker applies; not part of the jobseeker dashboard' },
  { panel: 'Candidate Apply From', label: 'Job title applied for', key: 'job_title', source: 'Job posting', status: 'available', note: 'Same job titles as Job Title Target' },
  { panel: 'Candidate Apply From', label: 'Location (where the jobseeker is from)', key: 'location', source: 'Jobseeker dashboard · Basic Info', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Years of Experience', label: 'Experience job title', key: 'recent_job_title', source: 'Jobseeker dashboard · Working Experience', status: 'available', note: 'Collected in onboarding and AI resume' },
  { panel: 'Years of Experience', label: 'Years of experience', key: 'working_period_from + working_period_to', source: 'Jobseeker dashboard · Working Experience', status: 'available', note: 'Collected in onboarding and AI resume; years are worked out from the working periods (onboarding also asks start_working_since)' },
  { panel: 'Education', label: 'Education level', key: 'education_level', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Education', label: 'Field of study', key: 'field_of_study', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Education', label: 'Institution name', key: 'institution_name', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Education', label: 'Study period', key: 'study_period', source: 'Jobseeker dashboard · Education', status: 'missing', note: 'Not in onboarding and not in AI resume yet' },
  { panel: 'Desktop vs Mobile Applied', label: 'Device', key: 'device_type', source: 'Not collected', status: 'missing', note: 'Needs to be recorded from the browser when the jobseeker applies' },
];

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

const AgeAreaChart = ({ groups, shareOf }: { groups: AgeGroup[]; shareOf: (g: AgeGroup) => number }) => {
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
            <linearGradient id="ti-age-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#07bcca" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#07bcca" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <line key={`h${v}`} x1={0} x2={w} y1={y(v)} y2={y(v)} className="ti-grid-line" />
          ))}
          {!empty && (
            <>
              <path d={area} fill="url(#ti-age-area)" />
              <path d={line} fill="none" stroke="#0b8a92" strokeWidth={3} vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
        {!empty && active !== null && (
          <span className="ti-area-guide" style={{ left: leftOf(active), top: pts[active][1], height: h - pts[active][1] }} />
        )}
        {!empty &&
          groups.map((g, i) => (
            <span
              key={g.range}
              className={`ti-area-dot${i === peak ? ' is-peak' : ''}${i === active ? ' is-active' : ''}`}
              style={{ left: leftOf(i), top: pts[i][1] }}
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
              <strong>{groups[active].total.toLocaleString()}</strong> applicants
            </span>
            <span>{shareOf(groups[active])}% of applicants with an age</span>
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
                aria-label={`${g.range}: ${g.total} applicants, ${shareOf(g)}%`}
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
            <span key={g.range} className={i === active ? 'is-active' : ''} onMouseEnter={() => !empty && setActive(i)}>
              <b>{g.range.replace(' years', '')}</b>
              {g.total.toLocaleString()} · {shareOf(g)}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

type Series = { name: string; color: string; values: number[] };

const StackedColumnChart = ({ labels, dates, series }: { labels: string[]; dates: string[]; series: Series[] }) => {
  const [active, setActive] = useState<number | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const w = 600;
  const h = 275;
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + s.values[i], 0));
  const max = axisMax(totals, [1, 2, 4, 5, 8, 10, 15, 20, 25, 50]);
  const ticks = [4, 3, 2, 1, 0].map((i) => (max / 4) * i);
  const slot = w / labels.length;
  const barWidth = slot * 0.6;
  const y = (v: number) => h - (v / max) * h;
  const empty = series.length === 0;
  const average = totals.reduce((sum, t) => sum + t, 0) / labels.length;
  const busiest = totals.indexOf(Math.max(...totals));
  const dim = (i: number, name: string) => (active !== null && active !== i) || (focus !== null && focus !== name);
  const compare = (i: number) => {
    if (i === busiest) return 'Busiest day';
    const diff = Math.round(totals[i] - average);
    if (diff === 0) return `Same as the ${labels.length}-day average`;
    return `${Math.abs(diff)} ${diff > 0 ? 'above' : 'below'} the ${labels.length}-day average (${Math.round(average)})`;
  };
  const onLeft = (i: number) => i < labels.length / 2;
  // The legend-focused job is drawn first so it sits on the baseline, making its trend easy to compare.
  const stackOrder = focus === null ? series : [...series.filter((s) => s.name === focus), ...series.filter((s) => s.name !== focus)];
  return (
    <>
      <div className="ti-chart ti-chart-job">
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
            {labels.map((_, i) => {
              let base = 0;
              return stackOrder.map((s) => {
                const value = s.values[i];
                if (value === 0) return null;
                const top = base + value;
                const rect = (
                  <rect
                    key={`${s.name}-${i}`}
                    x={i * slot + (slot - barWidth) / 2}
                    y={y(top)}
                    width={barWidth}
                    height={y(base) - y(top)}
                    fill={s.color}
                    className="ti-col-rect"
                    opacity={dim(i, s.name) ? 0.25 : 1}
                  />
                );
                base = top;
                return rect;
              });
            })}
          </svg>
          {!empty && active !== null && (
            <div
              className="ti-area-tip ti-col-tip"
              style={
                onLeft(active)
                  ? { left: `${(((active + 1) * slot) / w) * 100}%`, top: 0, transform: 'translateX(4px)' }
                  : { left: `${((active * slot) / w) * 100}%`, top: 0, transform: 'translateX(calc(-100% - 4px))' }
              }
              role="status"
            >
              <b>{dates[active]}</b>
              <span>
                <strong>{totals[active]}</strong> applications
              </span>
              <div className="ti-col-tip-rows">
                {series.map((s) => (
                  <span key={s.name} className={focus !== null && focus !== s.name ? 'is-dim' : ''}>
                    <i style={{ background: s.color }} />
                    {s.name}
                    <em>{s.values[active]}</em>
                  </span>
                ))}
              </div>
              <span className="ti-area-tip-rank">{compare(active)}</span>
            </div>
          )}
          {!empty && (
            <div className="ti-area-hits" style={{ height: h }}>
              {labels.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  className="ti-area-hit"
                  aria-label={`${dates[i]}: ${totals[i]} applications`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive((a) => (a === i ? null : i))}
                  data-label={label}
                />
              ))}
            </div>
          )}
          {empty && <span className="ti-chart-empty">No job title data yet</span>}
          <div className="ti-chart-x ti-col-x" style={{ gridTemplateColumns: `repeat(${labels.length}, 1fr)` }}>
            {labels.map((d, i) => (
              <span key={i} className={i === active ? 'is-active' : ''}>
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
      {!empty && (
        <div className="ti-legend">
          {series.map((s) => (
            <button
              key={s.name}
              type="button"
              className={`ti-legend-item${focus !== null && focus !== s.name ? ' is-dim' : ''}`}
              onMouseEnter={() => setFocus(s.name)}
              onMouseLeave={() => setFocus(null)}
              onFocus={() => setFocus(s.name)}
              onBlur={() => setFocus(null)}
            >
              <i style={{ background: s.color }} />
              {s.name}
              <em>{s.values.reduce((sum, v) => sum + v, 0)}</em>
            </button>
          ))}
        </div>
      )}
    </>
  );
};

const LocationChart = ({ rows, located }: { rows: LocationRow[]; located: number }) => {
  const [active, setActive] = useState<number | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const max = axisMax(rows.map((r) => r.total));
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const empty = located === 0;
  const order = focus === null ? JOB_TITLES : [...JOB_TITLES.filter((p) => p.name === focus), ...JOB_TITLES.filter((p) => p.name !== focus)];
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
            aria-label={`${row.state}: ${row.total} applicants`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive((a) => (a === i ? null : i))}
          >
            <span className="ti-loc-stack" style={{ width: `${(row.total / max) * 100}%` }}>
              {order.map((p) => {
                const n = row.counts[JOB_TITLES.indexOf(p)];
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
                <strong>{row.total}</strong> applicants · {share(row.total)}% of applicants with a location
              </span>
              {row.includes.length > 1 && <span className="ti-area-tip-rank">{row.includes.join(', ')}</span>}
              <div className="ti-col-tip-rows">
                {JOB_TITLES.map((p, j) => ({ ...p, n: row.counts[j] }))
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
          {JOB_TITLES.map((p, j) => (
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

const EXPERIENCE_COLORS = ['#c4f1f5', '#7dd9e1', '#07bcca', '#0b8a92', '#0b6e74', '#134e4a'];

const ExperienceChart = ({ bands, provided }: { bands: ExperienceBand[]; provided: number }) => {
  const [active, setActive] = useState<number | null>(null);
  const size = 260;
  const r = 120;
  const c = size / 2;
  const share = (n: number) => (provided === 0 ? 0 : Math.round((n / provided) * 100));
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
    return { ...b, i, path, mid, color: EXPERIENCE_COLORS[i], sweep };
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
              <title>{`${sl.label}: ${sl.count} (${share(sl.count)}%)`}</title>
            </path>
          ),
        )}
      </svg>
      <div className="ti-pie-side">
        <div className="ti-pie-legend">
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
              <em>{share(sl.count)}%</em>
            </button>
          ))}
        </div>
        {a && (
          <div
            className="ti-area-tip ti-pie-tip"
            style={
              a.i < slices.length / 2
                ? { top: `calc(${(a.i + 1) * 37}px + 6px)` }
                : { bottom: `calc(${(slices.length - a.i) * 37}px + 6px)` }
            }
            role="status"
          >
            <b>{a.label}</b>
            <span>
              <strong>{a.count}</strong> applicants · {share(a.count)}%
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
  const peak = bars.reduce((best, b, i) => (b.count > bars[best].count ? i : best), 0);
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
                  fill={i === peak ? '#0b8a92' : '#5fd8e1'}
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
              <strong>{a.count}</strong> applicants · {share(a.count)}%
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
                    <i style={{ background: '#5fd8e1' }} />
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
                aria-label={`${b.level}: ${b.count} applicants`}
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
                <strong>{a.total}</strong> applicants
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
                {c.total} applicants
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
  const age = ageStats(records);
  const jobs = jobTitleStats(records, now);
  const loc = locationStats(records);
  const exp = experienceStats(records);
  const edu = educationStats(records);
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
            <h2 className="rc-panel-title">Candidate Apply From</h2>
            <ParamTags panel="Candidate Apply From" show={showTags} />
            <span className="ti-panel-sub">Where your applicants are from, and which job they applied for</span>
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
            <h2 className="rc-panel-title">Job Title Target</h2>
            <ParamTags panel="Job Title Target" show={showTags} />
            <span className="ti-panel-sub">Monitor and analyze performance to optimize your spend across products</span>
            <StackedColumnChart labels={jobs.labels} dates={jobs.dates} series={jobs.series} />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>Total applications</span>
                <b>{jobs.summary.total}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Most applied</span>
                <b>{jobs.summary.topTitle ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Busiest day</span>
                <b>{jobs.summary.busiestDay ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Daily average</span>
                <b>{jobs.summary.dailyAverage}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <h2 className="rc-panel-title">Age</h2>
            <ParamTags panel="Age" show={showTags} />
            <span className="ti-panel-sub">
              Understand the age distribution of your talent pool to identify workforce trends and hiring opportunities.
            </span>
            <AgeAreaChart groups={age.groups} shareOf={age.shareOf} />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>Total applicants</span>
                <b>{age.total.toLocaleString()}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Average age</span>
                <b>{age.average ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Largest group</span>
                <b>{age.largest ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Age not provided</span>
                <b>{age.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <h2 className="rc-panel-title">Desktop vs Mobile Applied</h2>
            <ParamTags panel="Desktop vs Mobile Applied" show={showTags} />
            <span className="ti-panel-sub">Monitor and analyze performance to optimize your spend across products</span>
            <div className="ti-devices">
              {devices.map((d) => (
                <div key={d.label} className="ti-card ti-device">
                  <span className="ti-device-label">
                    <DeviceIcon label={d.label} />
                    {d.label}
                  </span>
                  <span className="ti-device-value">{d.pct}%</span>
                  <span className="ti-device-sub">
                    {d.count} {d.count === 1 ? 'applicant' : 'applicants'}
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
                  <b>{d.short}</b> {d.pct}%
                </span>
              ))}
            </div>
            <DeviceAgeChart columns={devicesByAge} />
          </section>

          <section className="ti-panel">
            <h2 className="rc-panel-title">Years of Experience</h2>
            <ParamTags panel="Years of Experience" show={showTags} />
            <span className="ti-panel-sub">How many years applicants have worked; hover a slice for when they started and their past job titles</span>
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
                <span>Fresh graduates</span>
                <b>{exp.fresh}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Not provided</span>
                <b>{exp.notProvided}</b>
              </div>
            </div>
          </section>

          <section className="ti-panel">
            <h2 className="rc-panel-title">Education Level</h2>
            <ParamTags panel="Education" show={showTags} />
            <span className="ti-panel-sub">Highest education of your applicants; hover a bar for their fields of study</span>
            <EducationChart bars={edu.bars} provided={edu.provided} />
            <div className="ti-age-stats">
              <div className="ti-card ti-age-stat">
                <span>Most common</span>
                <b>{edu.mostCommon ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Degree or higher</span>
                <b>{edu.degreeOrHigher === null ? '-' : `${edu.degreeOrHigher}%`}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Top field</span>
                <b>{edu.topField ?? '-'}</b>
              </div>
              <div className="ti-card ti-age-stat">
                <span>Not provided</span>
                <b>{edu.notProvided}</b>
              </div>
            </div>
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
        <small>{DUMMY_APPLICANTS.length} applicants</small>
      </label>
    </EmployerShell>
  );
}
