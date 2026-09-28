export type ProjectEnvironment = {
  id: string;
  name: "sandbox" | "live";
  activatedAt: string | null;
};

export type Project = {
  id: string;
  organizationId: string;
  organizationName: string;
  name: string;
  slug: string;
  environments: ProjectEnvironment[];
  createdAt: string;
};

export type ProjectsResponse = {
  projects: Project[];
};

export type CreateProjectInput = {
  name: string;
};

export type ProjectAPIKey = {
  id: string;
  environment: ProjectEnvironment["name"];
  prefix: "cm_test_" | "cm_live_";
  lastFour: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export type ProjectAPIKeyStatus = {
  apiKey: ProjectAPIKey | null;
};

export type CreatedProjectAPIKey = {
  apiKey: ProjectAPIKey;
  secret: string;
};
