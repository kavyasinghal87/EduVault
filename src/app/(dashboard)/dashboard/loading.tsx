export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header skeleton */}
      <div>
        <div className="h-9 w-64 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-5 w-96 bg-white/5 rounded-lg animate-pulse mt-2" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-white/5 rounded-2xl p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="w-16 h-6 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="flex gap-3">
        <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-10 w-36 bg-white/5 rounded-xl animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div>
        <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface border border-white/5 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
                <div className="w-14 h-5 bg-white/5 rounded-full animate-pulse" />
              </div>
              <div className="h-5 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
