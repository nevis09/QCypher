'use client'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <p className="text-[15px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
        Dashboard failed to load. Try refreshing.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 rounded-xl text-[15px] font-semibold text-white"
        style={{ background: 'linear-gradient(135deg,#1a3070,#4a9db5)' }}
      >
        Retry
      </button>
      <p className="text-[15px] opacity-50">{error?.message}</p>
    </div>
  )
}
