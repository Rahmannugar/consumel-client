import { createRail, requireAuth } from "authrail";

export type AuthenticatedRailContext = {
  user: { id: string } | null;
};

export const authenticatedRail = createRail<AuthenticatedRailContext>("authenticated-account", [
  requireAuth("/sign-in"),
]);
