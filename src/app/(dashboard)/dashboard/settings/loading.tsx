export default function SettingsLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div>
        <div className="h-9 w-40 bg-white/5 rounded-xl animate-pulse" />
        <div className="h-5 w-72 bg-white/5 rounded-lg animate-pulse mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="md:col-span-2 space-y-6">
          {/* Profile card skeleton */}
          <div className="bg-surface border border-white/5 rounded-3xl p-8 space-y-5">
            <div className="h-7 w-40 bg-white/5 rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div>
                <div className="h-4 w-20 bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
              <div>
                <div className="h-4 w-28 bg-white/5 rounded animate-pulse mb-2" />
                <div className="h-12 w-full bg-white/5 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
          {/* Security card skeleton */}
          <div className="bg-surface border border-white/5 rounded-3xl p-8 space-y-4">
            <div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-10 w-52 bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="h-6 w-28 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-10 w-16 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
            <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
          </div>
          <div className="bg-surface border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" />
            <div className="h-10 w-full bg-white/5 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
