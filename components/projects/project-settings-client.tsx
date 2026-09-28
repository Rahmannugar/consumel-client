"use client";

import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  DownloadSimpleIcon,
  KeyIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useProjectWorkspace } from "@/components/projects/project-workspace-client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  activateProjectEnvironment,
  apiKeyErrorMessage,
  createProjectAPIKey,
  replaceProjectAPIKey,
  revokeProjectAPIKey,
} from "@/lib/projects/projects.service";
import type {
  CreatedProjectAPIKey,
  ProjectAPIKey,
  ProjectEnvironment,
} from "@/lib/projects/projects.types";
import { useProjectAPIKey } from "@/lib/projects/useProjectAPIKey";

type ConfirmAction = "replace" | "revoke" | "activate" | null;
type PendingAction = "create" | "replace" | "revoke" | "activate" | null;

export function ProjectSettingsClient() {
  const { project, environment } = useProjectWorkspace();
  return (
    <div className="mx-auto max-w-[1040px] px-5 py-8 sm:px-8 sm:py-11">
      <h1 className="font-[family-name:var(--font-bricolage-grotesque)] text-[28px] font-semibold tracking-[-0.04em]">
        Project settings
      </h1>
      <APIKeySection projectID={project.id} environment={environment} />
    </div>
  );
}

function APIKeySection({
  projectID,
  environment,
}: {
  projectID: string;
  environment: ProjectEnvironment;
}) {
  const queryClient = useQueryClient();
  const keyStatus = useProjectAPIKey(projectID, environment.name);
  const [pending, setPending] = useState<PendingAction>(null);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [revealed, setRevealed] = useState<CreatedProjectAPIKey | null>(null);
  const [saved, setSaved] = useState(false);
  const activeKey = keyStatus.data?.apiKey ?? null;
  const inactive = environment.activatedAt === null;

  async function run(action: Exclude<PendingAction, null>) {
    setPending(action);
    try {
      if (action === "activate") {
        await activateProjectEnvironment(projectID, environment.name);
        await queryClient.invalidateQueries({ queryKey: ["projects"] });
        toast.success("Live is active");
      } else if (action === "revoke") {
        await revokeProjectAPIKey(projectID, environment.name);
        await keyStatus.refetch();
        toast.success(`${environmentLabel(environment.name)} API key revoked`);
      } else {
        const result =
          action === "replace"
            ? await replaceProjectAPIKey(projectID, environment.name)
            : await createProjectAPIKey(projectID, environment.name);
        setSaved(false);
        setRevealed(result);
        await keyStatus.refetch();
      }
      setConfirm(null);
    } catch (error) {
      toast.error(apiKeyErrorMessage(error));
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <h2 className="text-sm font-semibold">API keys</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Authenticate requests to this project.
          </p>
        </div>
        {inactive ? (
          <div className="px-5 py-6 sm:px-6">
            <p className="text-sm font-medium">Live is not active</p>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">
              Activate Live before creating its production API key. Sandbox data stays separate.
            </p>
            <Button
              className="mt-5"
              size="compact"
              onClick={() => setConfirm("activate")}
              disabled={pending !== null}
            >
              Activate Live
            </Button>
          </div>
        ) : keyStatus.isPending ? (
          <APIKeySkeleton />
        ) : keyStatus.isError ? (
          <div className="px-5 py-6 sm:px-6">
            <p className="text-sm font-medium">
              Couldn’t load the {environmentLabel(environment.name)} key
            </p>
            <Button
              className="mt-4"
              variant="secondary"
              size="compact"
              onClick={() => keyStatus.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : activeKey ? (
          <ActiveAPIKey
            apiKey={activeKey}
            pending={pending}
            onReplace={() => setConfirm("replace")}
            onRevoke={() => setConfirm("revoke")}
          />
        ) : (
          <div className="px-5 py-6 sm:px-6">
            <p className="text-sm font-medium">
              No active {environmentLabel(environment.name)} key
            </p>
            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-muted-foreground">
              Create a key for {environmentLabel(environment.name)} API requests. The full key
              is shown once.
            </p>
            <Button
              className="mt-5"
              size="compact"
              onClick={() => run("create")}
              disabled={pending !== null}
            >
              <KeyIcon />
              {pending === "create"
                ? "Creating key…"
                : `Create ${environmentLabel(environment.name)} key`}
            </Button>
          </div>
        )}
      </section>
      <ConfirmationDialog
        action={confirm}
        environment={environment.name}
        pending={pending}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && run(confirm)}
      />
      <SecretRevealDialog
        created={revealed}
        saved={saved}
        onSaved={() => setSaved(true)}
        onClose={() => {
          setRevealed(null);
          setSaved(false);
        }}
      />
    </>
  );
}

function ActiveAPIKey({
  apiKey,
  pending,
  onReplace,
  onRevoke,
}: {
  apiKey: ProjectAPIKey;
  pending: PendingAction;
  onReplace: () => void;
  onRevoke: () => void;
}) {
  return (
    <div className="px-5 py-6 sm:px-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <code className="rounded-md bg-secondary px-2.5 py-1.5 font-mono text-sm">
            {apiKey.prefix}••••{apiKey.lastFour}
          </code>
          <dl className="mt-5 grid gap-x-10 gap-y-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="mt-1 font-medium">{formatDate(apiKey.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Last used</dt>
              <dd className="mt-1 font-medium">
                {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : "Never"}
              </dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="compact"
            onClick={onReplace}
            disabled={pending !== null}
          >
            <ArrowClockwiseIcon />
            Replace
          </Button>
          <Button
            variant="quiet"
            size="compact"
            className="text-destructive hover:text-destructive"
            onClick={onRevoke}
            disabled={pending !== null}
          >
            <TrashIcon />
            Revoke
          </Button>
        </div>
      </div>
    </div>
  );
}

function APIKeySkeleton() {
  return (
    <div className="space-y-5 px-5 py-6 sm:px-6">
      <Skeleton className="h-8 w-56" />
      <div className="flex gap-8">
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
  );
}

function ConfirmationDialog({
  action,
  environment,
  pending,
  onCancel,
  onConfirm,
}: {
  action: ConfirmAction;
  environment: ProjectEnvironment["name"];
  pending: PendingAction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const copy = confirmationCopy(action, environment);
  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogTitle>{copy.title}</DialogTitle>
        <DialogDescription>{copy.description}</DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="quiet" size="compact" onClick={onCancel} disabled={pending !== null}>
            Cancel
          </Button>
          <Button
            size="compact"
            className={action === "revoke" ? "border-destructive bg-destructive" : undefined}
            onClick={onConfirm}
            disabled={pending !== null}
          >
            {pending ? "Working…" : copy.confirm}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SecretRevealDialog({
  created,
  saved,
  onSaved,
  onClose,
}: {
  created: CreatedProjectAPIKey | null;
  saved: boolean;
  onSaved: () => void;
  onClose: () => void;
}) {
  if (!created) return null;
  const envLine = `CONSUMEL_API_KEY=${created.secret}`;
  async function copy(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      onSaved();
      toast.success(message);
    } catch {
      toast.error("Your browser could not copy the key. Download the .env file instead.");
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([`${envLine}\n`], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ".env";
    anchor.click();
    URL.revokeObjectURL(url);
    onSaved();
    toast.success(".env downloaded");
  }
  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogTitle>Save this API key now</DialogTitle>
        <DialogDescription>
          This is the only time Consumel will show the full key. Store it in your application’s
          environment variables, not in browser code or source control.
        </DialogDescription>
        <div className="mt-5 rounded-lg border border-border bg-secondary p-3">
          <code className="block break-all font-mono text-xs leading-5">{created.secret}</code>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <Button
            variant="secondary"
            size="compact"
            onClick={() => copy(created.secret, "API key copied")}
          >
            <CopyIcon />
            Copy key
          </Button>
          <Button
            variant="secondary"
            size="compact"
            onClick={() => copy(envLine, ".env line copied")}
          >
            <CopyIcon />
            Copy .env
          </Button>
          <Button variant="secondary" size="compact" onClick={download}>
            <DownloadSimpleIcon />
            Download .env
          </Button>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {saved ? "Key saved." : "Copy or download the key before continuing."}
          </p>
          <Button size="compact" onClick={onClose} disabled={!saved}>
            {saved ? <CheckIcon /> : null}I’ve saved it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function confirmationCopy(action: ConfirmAction, environment: ProjectEnvironment["name"]) {
  const name = environmentLabel(environment);
  if (action === "replace")
    return {
      title: `Replace the ${name} API key?`,
      description:
        "The current key will stop working immediately. Consumel will show the replacement once.",
      confirm: "Replace key",
    };
  if (action === "revoke")
    return {
      title: `Revoke the ${name} API key?`,
      description:
        "Requests using the current key will stop working. You can create a new key later.",
      confirm: "Revoke key",
    };
  return {
    title: "Activate Live?",
    description:
      "Live is the production environment. Its customers, usage, billing configuration, and API key remain separate from Sandbox.",
    confirm: "Activate Live",
  };
}

function environmentLabel(environment: ProjectEnvironment["name"]) {
  return environment === "sandbox" ? "Sandbox" : "Live";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}
