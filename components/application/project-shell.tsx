"use client";

import {
  BellIcon,
  BookOpenTextIcon,
  BuildingsIcon,
  CaretUpDownIcon,
  CheckIcon,
  CubeIcon,
  DotsThreeVerticalIcon,
  GaugeIcon,
  GearIcon,
  HouseIcon,
  KeyIcon,
  PlugsConnectedIcon,
  PlusIcon,
  PulseIcon,
  SidebarSimpleIcon,
  UsersIcon,
  XIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { AccountMenu } from "@/components/application/account-menu";
import { ThemeToggle } from "@/components/application/theme-toggle";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AuthenticatedAccount } from "@/lib/authentication/authentication.types";
import { createProjectSchema } from "@/lib/projects/project.validation";
import { projectCreationErrorMessage } from "@/lib/projects/projects.service";
import type { Project } from "@/lib/projects/projects.types";
import { useCreateProject } from "@/lib/projects/useCreateProject";

type EnvironmentName = "sandbox" | "live";

type ProjectShellProps = {
  account: AuthenticatedAccount;
  project: Project;
  projects: Project[];
  onProjectChange: (projectSlug: string) => void;
  onProjectCreated: (projectSlug: string) => void;
  environment: EnvironmentName;
  onEnvironmentChange: (environment: EnvironmentName) => void;
  activeSection: "overview" | "customers" | "meters" | "events" | "project-settings";
  children: ReactNode;
};

const navigation = [
  { label: "Overview", icon: HouseIcon, segment: "", available: true },
  { label: "Customers", icon: UsersIcon, segment: "customers", available: true },
  { label: "Meters", icon: GaugeIcon, segment: "meters", available: true },
  { label: "Events", icon: PulseIcon, segment: "events", available: true },
  {
    label: "Payment Providers",
    icon: PlugsConnectedIcon,
    segment: "payment-providers",
    available: false,
  },
  {
    label: "Project Settings",
    icon: GearIcon,
    segment: "project-settings",
    available: true,
  },
] as const;

export function ProjectShell({
  account,
  project,
  projects,
  onProjectChange,
  onProjectCreated,
  environment,
  onEnvironmentChange,
  activeSection,
  children,
}: ProjectShellProps) {
  const organizationName = account.organizations[0]?.name ?? project.organizationName;
  const showingSandbox = environment === "sandbox";

  return (
    <TooltipProvider>
      <div
        className={`application-shell min-h-svh bg-background text-foreground ${
          showingSandbox ? "pt-10" : ""
        }`}
      >
        {showingSandbox ? (
          <SandboxBanner onSwitchToLive={() => onEnvironmentChange("live")} />
        ) : null}
        <SidebarProvider
          style={
            {
              "--sidebar-width": "15rem",
              "--sidebar-width-icon": "3.5rem",
              minHeight: showingSandbox ? "calc(100svh - 2.5rem)" : undefined,
            } as CSSProperties
          }
        >
          <ProjectSidebar
            project={project}
            projects={projects}
            organizationName={organizationName}
            environment={environment}
            onProjectChange={onProjectChange}
            onProjectCreated={onProjectCreated}
            onEnvironmentChange={onEnvironmentChange}
            activeSection={activeSection}
          />
          <SidebarInset className="min-w-0 bg-background">
            <ApplicationTopbar account={account} hasSandboxBanner={showingSandbox} />
            <main
              className={
                showingSandbox ? "min-h-[calc(100svh-6rem)]" : "min-h-[calc(100svh-3.5rem)]"
              }
            >
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </TooltipProvider>
  );
}

function SandboxBanner({ onSwitchToLive }: { onSwitchToLive: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex h-10 items-center bg-[#0b2942] px-3 text-white shadow-[0_1px_0_rgb(255_255_255/0.1)] sm:px-5">
      <span className="text-xs font-semibold">Sandbox</span>
      <span className="hidden flex-1 text-center text-xs text-white/75 sm:block">
        Test data only. Nothing here affects Live.
      </span>
      <button
        type="button"
        className="ml-auto h-7 rounded-full bg-primary px-4 text-xs leading-none font-medium text-primary-foreground shadow-[inset_0_0_0_1px_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.16)] transition-[background-color,transform] hover:bg-[#1688f3] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        onClick={onSwitchToLive}
      >
        Switch to Live
      </button>
    </div>
  );
}

function ProjectSidebar({
  project,
  projects,
  organizationName,
  environment,
  onProjectChange,
  onProjectCreated,
  onEnvironmentChange,
  activeSection,
}: {
  project: Project;
  projects: Project[];
  organizationName: string;
  environment: EnvironmentName;
  onProjectChange: (projectSlug: string) => void;
  onProjectCreated: (projectSlug: string) => void;
  onEnvironmentChange: (environment: EnvironmentName) => void;
  activeSection: ProjectShellProps["activeSection"];
}) {
  const { isMobile, setOpenMobile } = useSidebar();

  function closeMobileSidebar() {
    if (isMobile) setOpenMobile(false);
  }

  function closeFromEmptySpace(event: MouseEvent<HTMLDivElement>) {
    if (isMobile && event.target === event.currentTarget) setOpenMobile(false);
  }

  return (
    <Sidebar
      collapsible="icon"
      className={
        environment === "sandbox"
          ? "top-10 h-[calc(100svh-2.5rem)] border-sidebar-border"
          : "border-sidebar-border"
      }
    >
      <SidebarHeader className="relative justify-center p-2">
        <div className="flex min-w-0 items-center gap-2">
          <ProjectMenu
            project={project}
            projects={projects}
            environment={environment}
            onProjectChange={(slug) => {
              onProjectChange(slug);
              closeMobileSidebar();
            }}
            onProjectCreated={(slug) => {
              onProjectCreated(slug);
              closeMobileSidebar();
            }}
            onEnvironmentChange={(nextEnvironment) => {
              onEnvironmentChange(nextEnvironment);
              closeMobileSidebar();
            }}
          />
          <Button
            type="button"
            variant="quiet"
            size="compact"
            className="size-9 shrink-0 border-border bg-card p-0 text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground md:hidden"
            onClick={closeMobileSidebar}
            aria-label="Close navigation"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent onClick={closeFromEmptySpace}>
        <SidebarGroup className="pt-2.5">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const href = item.segment
                  ? `/dashboard/${project.slug}/${item.segment}`
                  : `/dashboard/${project.slug}`;

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild={item.available}
                      isActive={
                        (activeSection === "overview" && item.label === "Overview") ||
                        (activeSection === "customers" && item.label === "Customers") ||
                        (activeSection === "meters" && item.label === "Meters") ||
                        (activeSection === "events" && item.label === "Events") ||
                        (activeSection === "project-settings" &&
                          item.label === "Project Settings")
                      }
                      tooltip={
                        item.available ? item.label : `${item.label} is not available yet`
                      }
                      className="h-9 rounded-md text-[13px] font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground aria-disabled:pointer-events-auto aria-disabled:cursor-default aria-disabled:opacity-100 data-[active=true]:bg-sidebar-selected data-[active=true]:font-semibold data-[active=true]:text-sidebar-selected-foreground"
                      aria-disabled={!item.available}
                    >
                      {item.available ? (
                        <Link href={href} onClick={closeMobileSidebar}>
                          <Icon
                            weight={
                              (activeSection === "overview" && item.label === "Overview") ||
                              (activeSection === "customers" && item.label === "Customers") ||
                              (activeSection === "meters" && item.label === "Meters") ||
                              (activeSection === "events" && item.label === "Events") ||
                              (activeSection === "project-settings" &&
                                item.label === "Project Settings")
                                ? "fill"
                                : "regular"
                            }
                          />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <>
                          <Icon />
                          <span>{item.label}</span>
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2.5">
        <div className="flex h-9 min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar px-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <OrganizationMark />
          <span className="truncate text-[13px] font-medium group-data-[collapsible=icon]:hidden">
            {organizationName}
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function ProjectMenu({
  project,
  projects,
  environment,
  onProjectChange,
  onProjectCreated,
  onEnvironmentChange,
}: {
  project: Project;
  projects: Project[];
  environment: EnvironmentName;
  onProjectChange: (projectSlug: string) => void;
  onProjectCreated: (projectSlug: string) => void;
  onEnvironmentChange: (environment: EnvironmentName) => void;
}) {
  const otherEnvironment = environment === "sandbox" ? "live" : "sandbox";
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <SidebarMenu className="min-w-0 flex-1">
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-10 rounded-lg border border-sidebar-border bg-sidebar px-2 hover:border-sidebar-border hover:bg-sidebar-accent data-open:border-primary/35 data-open:bg-sidebar-accent group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0"
                aria-label={`Open ${project.name} project menu`}
              >
                <ProjectMark />
                <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <span className="block truncate text-[13px] font-semibold">
                    {project.name}
                  </span>
                  <span className="block truncate text-[10px] capitalize text-muted-foreground">
                    {environment}
                  </span>
                </span>
                <CaretUpDownIcon className="ml-auto size-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={8} className="w-64">
              <DropdownMenuLabel>Projects</DropdownMenuLabel>
              {projects.map((candidate) => (
                <DropdownMenuItem
                  key={candidate.id}
                  className="min-h-9 px-2.5"
                  onSelect={() => onProjectChange(candidate.slug)}
                >
                  <CubeIcon className="text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                  {candidate.id === project.id ? <CheckIcon className="text-primary" /> : null}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="min-h-9 px-2.5" onSelect={() => setCreateOpen(true)}>
                <PlusIcon className="text-muted-foreground" />
                <span>Create project</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="min-h-10 px-2.5"
                onSelect={() => onEnvironmentChange(otherEnvironment)}
              >
                <KeyIcon className="text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block">Switch to {otherEnvironment}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {otherEnvironment === "sandbox" ? "Test data" : "Production data"}
                  </span>
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={onProjectCreated}
      />
    </>
  );
}

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (projectSlug: string) => void;
}) {
  const createProject = useCreateProject();
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  function changeOpen(nextOpen: boolean) {
    if (createProject.isPending) return;
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setName("");
      setFieldError(undefined);
      createProject.reset();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (createProject.isPending) return;

    const result = createProjectSchema.safeParse({ name });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? "Enter a valid project name.");
      inputRef.current?.focus();
      return;
    }

    setFieldError(undefined);
    createProject.mutate(result.data, {
      onSuccess: (project) => {
        onOpenChange(false);
        setName("");
        onCreated(project.slug);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <DialogTitle>Create a project</DialogTitle>
        <DialogDescription>
          Use the product or service name your team will recognize. Consumel creates separate
          Sandbox and Live environments automatically.
        </DialogDescription>
        <form className="mt-6 space-y-5" noValidate onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="new-project-name">Project name</Label>
            <Input
              ref={inputRef}
              id="new-project-name"
              maxLength={120}
              autoComplete="off"
              placeholder="Usage Service"
              value={name}
              aria-invalid={Boolean(fieldError)}
              aria-describedby="new-project-name-help"
              disabled={createProject.isPending}
              onChange={(event) => {
                setName(event.target.value);
                setFieldError(undefined);
                createProject.reset();
              }}
            />
            <p
              id="new-project-name-help"
              className={
                fieldError || createProject.isError
                  ? "text-xs font-medium text-destructive"
                  : "text-xs leading-5 text-muted-foreground"
              }
              aria-live="polite"
            >
              {fieldError ??
                (createProject.isError
                  ? projectCreationErrorMessage(createProject.error)
                  : "Project names must be unique in your organization.")}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="quiet"
              size="compact"
              disabled={createProject.isPending}
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="compact" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating…" : "Create project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationTopbar({
  account,
  hasSandboxBanner,
}: {
  account: AuthenticatedAccount;
  hasSandboxBanner: boolean;
}) {
  return (
    <header
      className={`sticky z-20 flex h-14 items-center gap-2 bg-background/90 px-3 backdrop-blur-xl sm:px-5 ${
        hasSandboxBanner ? "top-10" : "top-0"
      }`}
    >
      <SidebarTrigger
        className="h-9 min-h-9 w-auto gap-0 border-transparent bg-transparent px-1 hover:border-transparent hover:bg-transparent md:hidden"
        aria-label="Open navigation"
      >
        <Image src="/assets/logo.png" alt="" width={27} height={27} priority />
        <DotsThreeVerticalIcon className="-ml-0.5 size-4 text-muted-foreground" weight="bold" />
      </SidebarTrigger>
      <SidebarTrigger
        className="hidden size-8 min-h-8 border-transparent bg-transparent p-0 text-muted-foreground hover:border-transparent hover:bg-secondary hover:text-foreground md:-ml-3 md:inline-flex"
        aria-label="Toggle navigation"
      >
        <SidebarSimpleIcon className="size-[17px]" />
      </SidebarTrigger>
      <div className="flex-1" />
      <UnavailableUtility label="Documentation">
        <BookOpenTextIcon className="size-[17px]" />
        <span className="hidden text-xs font-medium sm:inline">Docs</span>
      </UnavailableUtility>
      <UnavailableUtility label="Notifications">
        <BellIcon className="size-[18px]" />
      </UnavailableUtility>
      <ThemeToggle />
      <AccountMenu email={account.user.email} />
    </header>
  );
}

function UnavailableUtility({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            type="button"
            variant="quiet"
            size="compact"
            className="size-9 min-h-9 border-border bg-card px-0 text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground disabled:opacity-100 sm:w-auto sm:px-2.5"
            disabled
            aria-label={`${label} is not available yet`}
          >
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{label} is not available yet</TooltipContent>
    </Tooltip>
  );
}

function OrganizationMark() {
  return (
    <span className="grid size-7 shrink-0 place-items-center text-sidebar-foreground">
      <BuildingsIcon className="size-[18px]" />
    </span>
  );
}

function ProjectMark() {
  return (
    <span className="grid size-7 shrink-0 place-items-center text-sidebar-foreground">
      <CubeIcon className="size-[18px]" weight="regular" />
    </span>
  );
}
