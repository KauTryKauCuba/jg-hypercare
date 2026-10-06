import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiResumeCategoriesPage.css';
import logo from '../assets/referral/jobgiga-logo.png';
import robot from '../assets/ai-resume/ai-robot.png';

const CATEGORIES = [
  'Advertising & Media',
  'Agriculture & Environment',
  'Business',
  'Construction & Engineering',
  'Consumer Products',
  'Education',
  'Energy & Utilities',
  'Finance',
  'Healthcare',
  'Hospitality & Tourism',
  'Human Resources',
  'Information Technology',
  'Legal',
  'Manufacturing & Industrial',
  'Miscellaneous',
  'Non-Profit',
  'Real Estate',
  'Security Activities',
  'Service/Retail Housing/Maintenance',
  'Sport & Recreation',
  'Transport & Logistics',
  'Web 3.0',
];

const MAX_CHOICES = 3;

export default function AiResumeCategoriesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (category: string) =>
    setSelected((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : prev.length < MAX_CHOICES
          ? [...prev, category]
          : prev,
    );

  const full = selected.length >= MAX_CHOICES;

  return (
    <div className="arc-page">
      <button type="button" className="arc-logo" onClick={() => navigate('/')}>
        <img src={logo} alt="" />
        JobGiga
      </button>

      <div className="arc-card">
        <div className="arc-scroll">
          <div className="arc-hero">
            <h1 className="arc-hero-title">AI will complete your profile and find matching jobs for you.</h1>
            <p className="arc-hero-sub">Meanwhile, answer a few questions to improve your job matches.</p>
            <img className="arc-robot" src={robot} alt="" />
            <span className="arc-bubble arc-bubble-1">Auto-complete your profile from your resume</span>
            <span className="arc-bubble arc-bubble-2">Save time by finding jobs that fit your skills</span>
            <span className="arc-bubble arc-bubble-3">Instantly match you with relevant job opportunities</span>
          </div>

          <section className="arc-question">
            <h2>Which job categories are you interested in?</h2>
            <p>Choose up to 3. Tap again to remove a category.</p>
            <div className="arc-chips">
              {CATEGORIES.map((category) => {
                const isOn = selected.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    className={`arc-chip${isOn ? ' is-selected' : ''}`}
                    aria-pressed={isOn}
                    disabled={!isOn && full}
                    onClick={() => toggle(category)}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="arc-footer">
          <button type="button" className="arc-next" disabled={selected.length === 0} onClick={() => navigate('/ai-resume-parse/profile')}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
