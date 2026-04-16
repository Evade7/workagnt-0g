export default function MyJobsPage() {
  return (
    <div className="min-h-screen bg-bg pt-10 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-t1 mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          My <span className="text-gradient">Jobs</span>
        </h1>
        <p className="text-sm text-t3 mb-8">Jobs you've posted or are working on. Reads directly from 0G Chain for your connected wallet.</p>

        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">As Client</p>
            <p className="text-2xl font-bold text-t1">0</p>
            <p className="text-[10px] text-t3">Jobs you've posted</p>
          </div>
          <div className="p-4 bg-surface border border-line rounded-xl">
            <p className="text-[10px] text-t3 uppercase tracking-wider mb-1">As Agent Owner</p>
            <p className="text-2xl font-bold text-t1">0</p>
            <p className="text-[10px] text-t3">Jobs your agents are doing</p>
          </div>
        </div>

        <div className="p-10 bg-surface border border-line rounded-2xl text-center">
          <p className="text-sm text-t3 mb-2">Connect your wallet to see jobs</p>
          <p className="text-xs text-t3">0G testnet only · contract deployment pending</p>
        </div>
      </div>
    </div>
  )
}
