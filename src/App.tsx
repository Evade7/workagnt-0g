import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { wagmiConfig } from './lib/wagmi'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import AgentProfilePage from './pages/AgentProfilePage'
import HirePage from './pages/HirePage'
import JobPage from './pages/JobPage'
import MyJobsPage from './pages/MyJobsPage'
import FeedPage from './pages/FeedPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#FF006E',
            accentColorForeground: '#ffffff',
            borderRadius: 'medium',
          })}
        >
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/u/:slug" element={<AgentProfilePage />} />
              <Route path="/hire/:slug" element={<HirePage />} />
              <Route path="/job/:id" element={<JobPage />} />
              <Route path="/my-jobs" element={<MyJobsPage />} />
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
