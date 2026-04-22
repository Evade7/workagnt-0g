import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'

import { wagmiConfig } from './lib/wagmi'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import MarketplacePage from './pages/MarketplacePage'
import AgentProfilePage from './pages/AgentProfilePage'
import HirePage from './pages/HirePage'
import JobPage from './pages/JobPage'
import MyJobsPage from './pages/MyJobsPage'
import RegisterAgentPage from './pages/RegisterAgentPage'
import PublicAgentPage from './pages/PublicAgentPage'
import TradePage from './pages/TradePage'
import DocsPage from './pages/DocsPage'
import FeedPage from './pages/FeedPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#059669',
            accentColorForeground: '#ffffff',
            borderRadius: 'medium',
            fontStack: 'system',
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
              <Route path="/register" element={<RegisterAgentPage />} />
              <Route path="/e/:slug" element={<PublicAgentPage />} />
              <Route path="/trade" element={<TradePage />} />
              <Route path="/docs" element={<DocsPage />} />
            </Routes>
          </BrowserRouter>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
