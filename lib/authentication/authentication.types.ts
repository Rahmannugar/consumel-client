export type SignInMethod = "google" | "password";

export type AuthenticatedAccount = {
  session: {
    id: string;
    createdAt: string;
    expiresAt: string;
  };
  user: {
    id: string;
  };
  organizations: Array<{
    id: string;
    name: string;
    owner: boolean;
    roleId: string;
    roleName: string;
    roleSystemKey: string | null;
  }>;
};
