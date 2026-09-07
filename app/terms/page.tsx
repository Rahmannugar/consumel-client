import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the Consumel website and pre-release program.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The terms for using the Consumel website and joining our pre-release program."
    >
      <section>
        <h2>1. About these terms</h2>
        <p>
          These Terms of Service govern your use of consumel.com, its waitlist and meeting
          scheduling flows, and any private preview or early-access materials Consumel provides
          (together, the “Site Services”). They do not govern a future paid Consumel product,
          which may be subject to a separate agreement.
        </p>
        <p>
          By using the Site Services, you agree to these terms. If you use them for an
          organization, you confirm that you have authority to accept these terms for it. If you
          do not agree, do not use the Site Services.
        </p>
      </section>
      <section>
        <h2>2. Eligibility</h2>
        <p>
          You must be at least 18 years old and legally able to enter into these terms. The Site
          Services are intended for business and professional use.
        </p>
      </section>
      <section>
        <h2>3. Pre-release status</h2>
        <p>
          Consumel is currently in development. Information on this website describes our
          intended product direction and may change before general availability. Joining a
          waitlist does not guarantee access, a release date, a particular feature, or
          commercial terms.
        </p>
      </section>
      <section>
        <h2>4. Acceptable use</h2>
        <p>You may not use the website or preview access to:</p>
        <ul>
          <li>break applicable law or infringe another person’s rights;</li>
          <li>
            introduce malware, interfere with operation, or probe systems without permission;
          </li>
          <li>misrepresent your identity or authority;</li>
          <li>
            copy, resell, or exploit non-public preview materials outside an agreed evaluation.
          </li>
        </ul>
      </section>
      <section>
        <h2>5. Information, communications, and feedback</h2>
        <p>
          You are responsible for information you submit and confirm that you have the right to
          provide it. If you join the waitlist or ask us to contact you, we may use the details
          you provide to respond and send relevant product or access updates. You can opt out of
          promotional email using the unsubscribe method in the message or by contacting us.
        </p>
        <p>
          If you give us product feedback, you allow Consumel to use it without payment or
          restriction, provided we do not identify you publicly without permission.
        </p>
      </section>
      <section>
        <h2>6. Intellectual property</h2>
        <p>
          Consumel and its licensors retain rights in the website, product, branding, software,
          and related materials. These terms give you only the limited right to use the website
          and preview access as permitted here. Open-source components remain governed by their
          own licenses.
        </p>
      </section>
      <section>
        <h2>7. Third-party services</h2>
        <p>
          The website uses or links to third-party services, including Tally for waitlist forms
          and Cal.com for meeting scheduling. Those services operate under their own terms and
          policies. Consumel is not responsible for third-party services outside our control.
        </p>
      </section>
      <section>
        <h2>8. Disclaimers</h2>
        <p>
          The website and pre-release materials are provided on an “as is” and “as available”
          basis to the extent permitted by law. We do not promise uninterrupted operation or
          that pre-release material is complete, accurate, secure, or error-free. Product,
          pricing, and availability information may change. Nothing on the website is legal,
          tax, accounting, or financial advice.
        </p>
      </section>
      <section>
        <h2>9. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Consumel and the people working on its behalf
          will not be liable for indirect, incidental, special, consequential, exemplary, or
          punitive damages, or for lost profits, revenues, data, goodwill, or business
          opportunities, arising from the Site Services. Nothing in these terms excludes
          liability that cannot lawfully be excluded or limited.
        </p>
      </section>
      <section>
        <h2>10. Changes, suspension, and termination</h2>
        <p>
          We may update the website, preview program, or these terms. Material changes will be
          posted with a new effective date. We may suspend access when needed to protect the
          service, comply with law, or address a breach of these terms.
        </p>
      </section>
      <section>
        <h2>11. Applicable law and disputes</h2>
        <p>
          Laws that apply to Consumel and your use of the Site Services govern these terms.
          Nothing in these terms limits mandatory rights you may have under applicable law.
          Before starting formal proceedings, please contact us so we can try to resolve the
          issue.
        </p>
      </section>
      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a href="mailto:hello@consumel.com">hello@consumel.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}
