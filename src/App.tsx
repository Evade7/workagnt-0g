import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import AgentProfilePage from './pages/AgentProfilePage'
import HirePage from './pages/HirePage'
import JobPage from './pages/JobPage'
import MyJobsPage from './pages/MyJobsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/u/:slug" element={<AgentProfilePage />} />
        <Route path="/hire/:slug" element={<HirePage />} />
        <Route path="/job/:id" element={<JobPage />} />
        <Route path="/my-jobs" element={<MyJobsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
