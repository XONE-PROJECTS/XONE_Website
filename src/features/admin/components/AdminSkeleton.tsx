const delays = [0, 90, 180, 270, 360, 450, 540, 630];

function SkeletonBar({
  className = "",
  index = 0,
}: {
  className?: string;
  index?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`admin-skeleton rounded-md bg-muted ${className}`}
      style={{ animationDelay: `${delays[index % delays.length]}ms` }}
    />
  );
}

export function AdminSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-describedby="admin-loading-announcement"
      className="mx-auto min-h-[70vh] max-w-7xl px-4 py-8 sm:px-6"
    >
      <span id="admin-loading-announcement" className="sr-only">
        Loading admin content
      </span>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <SkeletonBar className="h-4 w-48" index={0} />
            <SkeletonBar className="h-9 w-64" index={1} />
          </div>
          <SkeletonBar className="h-11 w-24" index={2} />
        </header>
        <div className="grid gap-6 py-6 lg:grid-cols-[180px_1fr]">
          <nav
            aria-hidden="true"
            className="flex gap-2 overflow-hidden lg:flex-col"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonBar
                key={index}
                className="h-11 min-w-24 lg:w-full"
                index={index + 2}
              />
            ))}
          </nav>
          <section aria-hidden="true" className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <SkeletonBar className="h-11 w-28" index={4} />
              <SkeletonBar className="h-11 w-32" index={5} />
              <SkeletonBar className="h-11 w-36" index={6} />
            </div>
            {Array.from({ length: 4 }, (_, index) => (
              <article
                key={index}
                className="space-y-4 rounded-xl border bg-card p-5"
              >
                <div className="flex justify-between">
                  <SkeletonBar className="h-5 w-32" index={index + 1} />
                  <SkeletonBar className="h-4 w-14" index={index + 3} />
                </div>
                <SkeletonBar className="h-11 w-full" index={index + 4} />
                <SkeletonBar className="h-24 w-full" index={index + 5} />
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
