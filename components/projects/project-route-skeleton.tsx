import { Skeleton } from "@/components/ui/skeleton";

export function ProjectRouteSkeleton() {
  return (
    <div
      className="min-h-svh bg-background text-foreground"
      role="status"
      aria-busy="true"
      aria-label="Loading project"
    >
      <aside className="fixed inset-y-0 left-0 hidden w-60 bg-sidebar md:block">
        <div className="p-2.5">
          <div className="flex h-12 items-center gap-2.5 rounded-[10px] border border-sidebar-border bg-sidebar px-2.5">
            <Skeleton className="size-7" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-14" />
            </div>
            <Skeleton className="size-3" />
          </div>
        </div>
        <div className="space-y-2 p-2.5 pt-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-sidebar-border p-2.5">
          <Skeleton className="h-10 w-full" />
        </div>
      </aside>
      <div className="md:pl-60">
        <header className="flex h-14 items-center gap-2 bg-card/90 px-3 sm:px-5">
          <Skeleton className="size-9 md:hidden" />
          <Skeleton className="ml-auto h-9 w-16" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
          <Skeleton className="size-9 rounded-full" />
        </header>
        <main className="mx-auto max-w-[1160px] space-y-5 px-5 py-8 sm:px-8 sm:py-11">
          <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
          </div>
          <Skeleton className="h-44 w-full rounded-[10px]" />
          <Skeleton className="h-56 w-full rounded-[10px]" />
        </main>
      </div>
    </div>
  );
}
