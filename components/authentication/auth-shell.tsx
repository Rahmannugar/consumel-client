import type { ReactNode } from "react";
import { Brand } from "@/components/marketing/brand";
import { AuthVisual } from "./auth-visual";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-2">
      <section className="relative hidden min-h-svh overflow-hidden bg-[#ece8e1] lg:flex lg:flex-col">
        <div className="absolute top-10 left-10 z-10 drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] xl:top-12 xl:left-12">
          <Brand inverse />
        </div>
        <div className="flex flex-1">
          <AuthVisual />
        </div>
      </section>
      <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="w-full max-w-[440px]">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
