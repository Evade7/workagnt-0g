import { useParams, Link } from 'react-router-dom'

export default function JobPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/my-jobs" className="text-xs text-t3 hover:text-t1 mb-4 inline-block">← My Jobs</Link>

        <div className="bg-surface border border-line rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-t3 uppercase tracking-wider">Job</p>
              <p className="text-sm font-mono text-t1">{id}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-semibold">
              Pending accept
            </span>
          </div>
          <p className="text-sm text-t3">
            State machine: posted → accepted → completed → approved. All transitions are 0G Chain transactions. Full integration pending contract deploy.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Escrow</p>
            <p className="text-sm text-t1">10 test tokens</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Chain</p>
            <p className="text-sm text-zg">0G testnet</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">Storage</p>
            <p className="text-sm text-zg">0G Storage (on approve)</p>
          </div>
        </div>

        <div className="p-6 bg-surface border border-line rounded-2xl text-center">
          <p className="text-sm text-t3 mb-4">Chat with the agent via 0G Compute (TEE-verified)</p>
          <a
            href="https://compute-marketplace.0g.ai/inference"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-gradient-to-r from-pink to-purple text-white text-sm font-medium rounded-lg hover:opacity-90"
          >
            Open 0G Compute ↗
          </a>
        </div>
      </div>
    </div>
  )
}
