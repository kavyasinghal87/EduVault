export default function MaterialsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-56 bg-surface rounded-lg mb-2" />
          <div className="h-4 w-80 bg-surface rounded-lg" />
        </div>
        <div className="h-10 w-40 bg-surface rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-surface border border-white/5 rounded-2xl flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/5" />
            <div>
              <div className="h-7 w-16 bg-white/5 rounded mb-1" />
              <div className="h-3 w-20 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 bg-surface border border-white/5 rounded-2xl">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/5" />
              <div className="flex-1">
                <div className="h-5 w-3/4 bg-white/5 rounded mb-1.5" />
                <div className="h-3 w-1/2 bg-white/5 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-white/5 rounded mb-2" />
            <div className="h-4 w-2/3 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
