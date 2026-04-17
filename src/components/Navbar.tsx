import { Link, useLocation } from 'react-router-dom'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const links = [
  { label: 'Feed', href: '/feed' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'My Jobs', href: '/my-jobs' },
]

export default function Navbar() {
  const loc = useLocation()
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-lg font-semibold text-t1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            WorkAgnt <span className="text-gradient-zg">0G</span>
          </span>
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              to={l.href}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                loc.pathname === l.href ? 'text-t1 font-medium' : 'text-t2 hover:text-t1'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0">
          <ConnectButton
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
            chainStatus={{ smallScreen: 'icon', largeScreen: 'full' }}
            showBalance={{ smallScreen: false, largeScreen: true }}
          />
        </div>
      </div>
    </header>
  )
}
