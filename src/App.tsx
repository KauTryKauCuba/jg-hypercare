import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import CustomizePage from './pages/CustomizePage'
import BenefitsPage from './pages/BenefitsPage'
import ResumePage from './pages/ResumePage'
import EmployerTitlePage from './pages/EmployerTitlePage'
import AIReportPage from './pages/AIReportPage'
import ChatgigaPage from './pages/ChatgigaPage'
import JobbonanzaPage from './pages/JobbonanzaPage'
import JobbonanzaJobseekerPage from './pages/JobbonanzaJobseekerPage'
import JobbonanzaMainPage from './pages/JobbonanzaMainPage'
import ReferralCodePage from './pages/ReferralCodePage'
import ReferralEmployerPage from './pages/ReferralEmployerPage'
import ReferralCompaniesPage from './pages/ReferralCompaniesPage'
import ReferralRequestCommissionPage from './pages/ReferralRequestCommissionPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/benefits" element={<BenefitsPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/employer-title" element={<EmployerTitlePage />} />
        <Route path="/ai-report" element={<AIReportPage />} />
        <Route path="/chatgiga" element={<ChatgigaPage />} />
        <Route path="/jobbonanza" element={<JobbonanzaMainPage />} />
        <Route path="/jobbonanza-employer" element={<JobbonanzaPage />} />
        <Route path="/jobbonanza-jobseeker" element={<JobbonanzaJobseekerPage />} />
        <Route path="/referral-code" element={<ReferralCodePage />} />
        <Route path="/referral-code/:companyId" element={<ReferralCompaniesPage />} />
        <Route path="/referral-code-employer" element={<ReferralEmployerPage />} />
        <Route path="/referral-code-employer/request-commission" element={<ReferralRequestCommissionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App




