"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ApplicationThemeProvider } from "@/components/application/application-theme";
import { AuthenticatedBoundary } from "@/components/authentication/authenticated-boundary";
import { ProjectRouteSkeleton } from "@/components/projects/project-route-skeleton";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/lib/projects/useProjects";

export function ProjectsIndexClient() {
  return (
    <ApplicationThemeProvider>
      <AuthenticatedBoundary loading={<ProjectRouteSkeleton />}>
        {() => <ProjectsRedirect />}
      </AuthenticatedBoundary>
    </ApplicationThemeProvider>
  );
}

function ProjectsRedirect() {
  const router = useRouter();
  const projects = useProjects();

  useEffect(() => {
    if (projects.data?.projects.length === 1) {
      router.replace(`/dashboard/${projects.data.projects[0].slug}`);
    } else if (projects.data && projects.data.projects.length === 0) {
      router.replace("/onboarding");
    }
  }, [projects.data, router]);

  if (projects.isError) {
    return (
      <main className="grid min-h-svh place-items-center bg-[#f7f9fa] px-5 dark:bg-[#0b1117]">
        <div className="text-center">
          <h1 className="text-xl font-bold dark:text-white">Projects could not be loaded</h1>
          <Button className="mt-5" onClick={() => projects.refetch()}>
            Try again
          </Button>
        </div>
      </main>
    );
  }
  if (projects.data && projects.data.projects.length > 1) {
    return (
      <main className="min-h-svh bg-white px-5 py-16 text-[#171a1d] dark:bg-[#101214] dark:text-[#f2f3f4]">
        <section className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold">Choose a project</h1>
          <div className="mt-6 divide-y overflow-hidden rounded-xl border border-[#dfe2e5] dark:divide-[#292d31] dark:border-[#292d31]">
            {projects.data.projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/${project.slug}`}
                className="block px-5 py-4 text-sm font-medium hover:bg-[#f6f7f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087cec] dark:hover:bg-[#181b1f]"
              >
                {project.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    );
  }
  return <ProjectRouteSkeleton />;
}
