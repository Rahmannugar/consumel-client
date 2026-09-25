import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SignInMethod } from "./authentication.types";

type AuthenticationState = {
  lastSignInMethod: SignInMethod | null;
  rememberSignInMethod: (method: SignInMethod) => void;
};

export const useAuthenticationStore = create<AuthenticationState>()(
  persist(
    (set) => ({
      lastSignInMethod: null,
      rememberSignInMethod: (method) => set({ lastSignInMethod: method }),
    }),
    {
      name: "consumel.authentication",
      partialize: ({ lastSignInMethod }) => ({ lastSignInMethod }),
    },
  ),
);
