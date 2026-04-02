export default function VaultsLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-9 w-36 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-5 w-72 bg-white/5 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="h-10 w-36 bg-white/5 rounded-xl animate-pulse" />
      </div>

      <div className="flex gap-4 items-center border-b border-white/5 pb-4">
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 w-14 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="w-16 h-5 bg-white/5 rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
