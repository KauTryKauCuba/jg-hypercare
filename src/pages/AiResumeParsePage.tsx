import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AiResumeParsePage.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AiResumeParsePage() {
  const navigate = useNavigate();
  const onClose = () => navigate('/');
  const [fileName, setFileName] = useState('');
  const [email, setEmail] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [touched, setTouched] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const emailValid = EMAIL_PATTERN.test(email.trim());
  const canSubmit = !!fileName && emailValid && accepted;

  return (
    <div className="arp-page">
      <div className="arp-modal">
        <button type="button" className="arp-close" aria-label="Back to home" onClick={onClose}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <h2 id="arp-title" className="arp-title">Your resume is uploaded</h2>
        <p className="arp-subtitle">Create an account to view your job matches!</p>

        <h3 className="arp-label">Your Resume</h3>
        <div className="arp-file">
          <span className={`arp-file-name${fileName ? '' : ' is-empty'}`} title={fileName}>
            {fileName || 'Upload your resume (PDF, DOC, DOCX)'}
          </span>
          {fileName ? (
            <button type="button" className="arp-remove" aria-label="Remove resume" onClick={() => setFileName('')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          ) : (
            <button type="button" className="arp-reupload" onClick={() => fileRef.current?.click()}>Upload</button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setFileName(file.name);
              e.target.value = '';
            }}
          />
        </div>

        <div className={`arp-email${touched && !emailValid ? ' is-invalid' : ''}`}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2.5" y="5" width="19" height="14" rx="2" />
            <path d="M3 6.5l9 7 9-7M3 18l6.5-6M21 18l-6.5-6" />
          </svg>
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(true)}
          />
        </div>
        {touched && !emailValid && <p className="arp-error">Please enter a valid email address.</p>}

        <label className="arp-accept">
          <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span className="arp-box" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span className="arp-accept-text">
            I accept JobGiga's <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a> and the{' '}
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Conditions</a>
          </span>
        </label>

        <div className="arp-actions">
          <button type="button" className="arp-submit" disabled={!canSubmit} onClick={() => navigate('/ai-resume-parse/job-categories')}>View Jobs</button>
        </div>
      </div>
    </div>
  );
}
