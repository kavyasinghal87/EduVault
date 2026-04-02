export default function StudyLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="h-9 w-44 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-5 w-80 bg-white/5 rounded-lg animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface border border-white/5 rounded-2xl p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-white/5 rounded-xl animate-pulse" />
              <div className="w-20 h-5 bg-white/5 rounded-full animate-pulse" />
            </div>
            <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-8 w-full bg-white/5 rounded-lg animate-pulse mt-2" />
            <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
