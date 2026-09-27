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
