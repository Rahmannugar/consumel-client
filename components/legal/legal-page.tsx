import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import type { ReactNode } from "react";

type LegalPageProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function LegalPage({ title, description, children }: LegalPageProps) {
  return (
    <div className="legal-page">
      <SiteHeader sectionHrefPrefix="/" />
      <main className="page-shell legal-layout">
        <aside className="legal-intro">
          <p className="legal-eyebrow">Legal</p>
          <h1>{title}</h1>
          <p>{description}</p>
          <span className="legal-effective-date">Effective September 7, 2026</span>
        </aside>
        <article className="legal-content">{children}</article>
      </main>
      <SiteFooter sectionHrefPrefix="/" />
    </div>
  );
}
