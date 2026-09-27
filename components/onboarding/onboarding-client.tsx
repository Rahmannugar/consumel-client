"use client";

import { ArrowRightIcon, SignOutIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ApplicationThemeProvider } from "@/components/application/application-theme";
import { AuthenticatedBoundary } from "@/components/authentication/authenticated-boundary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSignOut } from "@/lib/authentication/useAuthentication";
import { onboardingErrorMessage } from "@/lib/onboarding/onboarding.service";
import { type OnboardingField, onboardingSchema } from "@/lib/onboarding/onboarding.validation";
import { useCreateFirstProject } from "@/lib/onboarding/useOnboarding";

export function OnboardingClient() {
  return (
    <ApplicationThemeProvider>
      <AuthenticatedBoundary loading={<OnboardingSkeleton />}>
        {(account) => <OnboardingForm hasOrganization={account.organizations.length > 0} />}
      </AuthenticatedBoundary>
    </ApplicationThemeProvider>
  );
}

function OnboardingForm({ hasOrganization }: { hasOrganization: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createProject = useCreateFirstProject();
  const signOut = useSignOut();
  const [organizationName, setOrganizationName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [errors, setErrors] = useState<Partial<Record<OnboardingField, string>>>({});
  const organizationRef = useRef<HTMLInputElement>(null);
  const projectRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasOrganization) router.replace("/dashboard");
  }, [hasOrganization, router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createProject.isPending) return;

    const result = onboardingSchema.safeParse({ organizationName, projectName });
    if (!result.success) {
      const nextErrors: Partial<Record<OnboardingField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === "organizationName" || field === "projectName") && !nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      }
      setErrors(nextErrors);
      if (nextErrors.organizationName) organizationRef.current?.focus();
      else if (nextErrors.projectName) projectRef.current?.focus();
      return;
    }

    setErrors({});
    createProject.mutate(result.data, {
      onSuccess: (setup) => {
        router.replace(`/dashboard/${setup.project.slug}`);
      },
      onError: (error) => toast.error(onboardingErrorMessage(error)),
    });
  }

  function endSession() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        router.replace("/sign-in");
      },
      onError: () => toast.error("Consumel could not sign you out. Try again."),
    });
  }

  if (hasOrganization) return <OnboardingSkeleton />;

  return (
    <main className="min-h-svh bg-white text-[#171a1d] dark:bg-[#101214] dark:text-[#f2f3f4]">
      <header className="flex h-14 items-center justify-between border-b border-[#ececef] px-5 sm:px-8 dark:border-[#272b2f]">
        <div className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="" width={30} height={30} priority />
          <span className="font-[family-name:var(--font-bricolage-grotesque)] text-lg font-bold tracking-[-0.035em]">
            Consumel
          </span>
        </div>
        <Button
          type="button"
          variant="quiet"
          size="compact"
          className="dark:text-[#aeb3b8] dark:hover:bg-[#202327] dark:hover:text-white"
          disabled={signOut.isPending || createProject.isPending}
          onClick={endSession}
        >
          <SignOutIcon />
          {signOut.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </header>

      <div className="mx-auto w-[min(600px,calc(100%-40px))] py-14 sm:py-20">
        <section>
          <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-3xl font-semibold tracking-[-0.04em]">
            Create your first project
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#656c73] dark:text-[#a0a5aa]">
            A project is the product or service you will connect to Consumel. We’ll create
            separate Sandbox and Live environments for it.
          </p>

          <div className="mt-8 rounded-xl border border-[#dedfe2] bg-white p-6 sm:p-8 dark:border-[#292d31] dark:bg-[#14171a]">
            <form className="mt-7 space-y-6" noValidate onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="organization-name">Organization name</Label>
                <Input
                  ref={organizationRef}
                  id="organization-name"
                  autoComplete="organization"
                  maxLength={120}
                  value={organizationName}
                  aria-invalid={Boolean(errors.organizationName)}
                  aria-describedby="organization-name-help"
                  className="dark:border-[#35393e] dark:bg-[#101214] dark:text-[#f2f3f4] dark:placeholder:text-[#747b82]"
                  placeholder="Acme, Inc."
                  onChange={(event) => {
                    setOrganizationName(event.target.value);
                    setErrors((current) => ({ ...current, organizationName: undefined }));
                  }}
                />
                <FieldHelp
                  id="organization-name-help"
                  error={errors.organizationName}
                  help="The company or team that owns this project and its Consumel billing."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-name">Project name</Label>
                <Input
                  ref={projectRef}
                  id="project-name"
                  maxLength={120}
                  value={projectName}
                  aria-invalid={Boolean(errors.projectName)}
                  aria-describedby="project-name-help"
                  className="dark:border-[#35393e] dark:bg-[#101214] dark:text-[#f2f3f4] dark:placeholder:text-[#747b82]"
                  placeholder="Acme API"
                  onChange={(event) => {
                    setProjectName(event.target.value);
                    setErrors((current) => ({ ...current, projectName: undefined }));
                  }}
                />
                <FieldHelp
                  id="project-name-help"
                  error={errors.projectName}
                  help="Use the name of the product or service you’re connecting."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createProject.isPending || signOut.isPending}
              >
                {createProject.isPending ? "Creating project…" : "Create project"}
                {!createProject.isPending && <ArrowRightIcon />}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function FieldHelp({ id, error, help }: { id: string; error?: string; help: string }) {
  return (
    <p
      id={id}
      className={
        error
          ? "text-xs font-semibold text-red-600 dark:text-red-400"
          : "text-xs leading-5 text-[#747b82] dark:text-[#92989e]"
      }
      aria-live="polite"
    >
      {error ?? help}
    </p>
  );
}

function OnboardingSkeleton() {
  return (
    <main
      className="min-h-svh bg-white px-5 py-20 dark:bg-[#101214]"
      aria-busy="true"
      aria-label="Loading onboarding"
    >
      <div className="mx-auto max-w-[600px] space-y-5">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-full" />
        <div className="space-y-5 rounded-xl border border-[#dedfe2] bg-white p-8 dark:border-[#292d31] dark:bg-[#14171a]">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </main>
  );
}
