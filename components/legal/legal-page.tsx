import type { ReactNode } from "react";
import { Brand } from "@/components/marketing/brand";

type LegalPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <div className="shell legal-header__inner">
          <Brand />
          <a href="/">Back to home</a>
        </div>
      </header>
      <main className="shell legal-layout">
        <aside>
          <p className="eyebrow">Legal</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <span>Effective September 6, 2026</span>
        </aside>
        <article className="legal-content">{children}</article>
      </main>
      <footer className="legal-footer">
        <div className="shell">© 2026 Consumel.</div>
      </footer>
    </div>
  );
}
