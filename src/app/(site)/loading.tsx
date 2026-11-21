/** Instant skeleton shown while a page streams in, so taps feel responsive on slow mobile networks. */
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-7 w-2/3 rounded-lg bg-stone-200" />
      <div className="h-12 rounded-full bg-stone-200" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-2 ring-1 ring-stone-200">
            <div className="aspect-square rounded-xl bg-stone-200" />
            <div className="mt-3 h-3.5 w-4/5 rounded bg-stone-200" />
            <div className="mt-2 h-3.5 w-1/3 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
