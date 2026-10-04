import type { ProjectEnvironment } from "@/lib/projects/projects.types";

export type MeterType = "prepaid" | "postpaid" | "hybrid";

export type Meter = {
  id: string;
  meterKey: string;
  name: string;
  description: string | null;
  type: MeterType;
  createdAt: string;
  updatedAt: string;
};

export type MetersResponse = {
  meters: Meter[];
  nextCursor: string | null;
};

export type CreateMeterInput = {
  meterKey: string;
  name: string;
  description?: string;
  type: MeterType;
};

export type UpdateMeterInput = {
  name: string;
  description?: string;
};

export type MeterContext = {
  projectId: string;
  environment: ProjectEnvironment["name"];
};
