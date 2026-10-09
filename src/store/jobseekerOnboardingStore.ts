import { useSyncExternalStore } from 'react';

export type OnboardingState = {
  step: 1 | 2 | 3;
  firstName: string;
  lastName: string;
  dob: string;
  experience: 'Experienced' | 'Fresh Graduate/Student';
  startWorking: string;
  availability: 'Immediate' | 'Within 1 Month' | 'More Than 1 Month';
  eligibility: string | null;
  nationality: string;
  jobTitle: string;
  desiredIndustry: string;
  workArrangement: 'On-Site' | 'Hybrid' | 'Remote';
  location: string;
  jobType: string;
  currency: string;
  salaryFrom: string;
  salaryTo: string;
  salaryType: string;
  company: string;
  recentJobTitle: string;
  workFrom: string;
  workTo: string;
  currentlyWorking: boolean;
  jobDescription: string;
};

const STORAGE_KEY = 'jg-hypercare:jobseeker-onboarding';
const CHANGE_EVENT = 'jg-hypercare:jobseeker-onboarding-change';

export const defaults = (): OnboardingState => ({
  step: 1,
  firstName: '',
  lastName: '',
  dob: '',
  experience: 'Experienced',
  startWorking: '',
  availability: 'Immediate',
  eligibility: null,
  nationality: '',
  jobTitle: '',
  desiredIndustry: '',
  workArrangement: 'On-Site',
  location: '',
  jobType: '',
  currency: 'MYR',
  salaryFrom: '',
  salaryTo: '',
  salaryType: 'Monthly',
  company: '',
  recentJobTitle: '',
  workFrom: '',
  workTo: '',
  currentlyWorking: false,
  jobDescription: '',
});

let cachedRaw: string | null | undefined;
let cachedValue: OnboardingState = defaults();

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function getSnapshot(): OnboardingState {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    let stored: Partial<OnboardingState> = {};
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

function write(next: OnboardingState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return true;
}

export function updateOnboarding(patch: Partial<OnboardingState>): boolean {
  const current = getSnapshot();
  return write({ ...current, ...patch });
}

export function resetOnboarding() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(subscribe, getSnapshot);
}
