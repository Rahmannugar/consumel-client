import type { Project } from "@/lib/projects/projects.types";

export type OnboardingInput = {
  organizationName: string;
  projectName: string;
};

export type OnboardingSetup = {
  organization: {
    id: string;
    name: string;
  };
  project: Project;
};
