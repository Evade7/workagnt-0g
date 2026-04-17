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
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain
              return (
                <div className={!mounted ? 'opacity-0 pointer-events-none' : ''}>
                  {!connected ? (
                    <button
                      onClick={openConnectModal}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-opacity"
                      style={{ background: 'linear-gradient(to right, var(--color-pink), var(--color-purple))' }}
                    >
                      Connect Wallet
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-surface border border-line rounded-lg text-xs text-t2 hover:border-line-light transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full bg-green" />
                        {chain?.name?.replace(' Testnet', '') || '0G'}
                      </button>
                      <button
                        onClick={openAccountModal}
                        className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-line rounded-lg hover:border-line-light transition-colors"
                      >
                        {account.displayBalance && !account.displayBalance.includes('NaN') && (
                          <span className="hidden sm:inline text-xs text-t2 font-mono">{account.displayBalance}</span>
                        )}
                        <span className="text-xs font-medium text-t1">{account.displayName}</span>
                      </button>
                    </div>
                  )}
                </div>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </header>
  )
}
