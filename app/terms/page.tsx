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
        <h2>1. Agreement to these terms</h2>
        <p>
          These Terms of Service govern your use of consumel.com, forms available through the
          website, and any private preview or early-access materials Consumel provides. By using
          those services, you agree to these terms. If you use them for an organization, you
          represent that you have authority to accept these terms for it.
        </p>
      </section>
      <section>
        <h2>2. Current availability</h2>
        <p>
          Consumel is currently in development. Information on this website describes our
          intended product direction and may change before general availability. Joining a
          waitlist does not guarantee access, a release date, a particular feature, or
          commercial terms.
        </p>
      </section>
      <section>
        <h2>3. Acceptable use</h2>
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
        <h2>4. Your information and feedback</h2>
        <p>
          You are responsible for information you submit and confirm that you have the right to
          provide it. If you give us product feedback, you allow Consumel to use it without
          payment or restriction, provided we do not identify you publicly without permission.
        </p>
      </section>
      <section>
        <h2>5. Intellectual property</h2>
        <p>
          Consumel and its licensors retain rights in the website, product, branding, software,
          and related materials. These terms give you only the limited right to use the website
          and preview access as permitted here. Open-source components remain governed by their
          own licenses.
        </p>
      </section>
      <section>
        <h2>6. Third-party services</h2>
        <p>
          The website may use or link to third-party services, including Tally for waitlist
          forms. Those services operate under their own terms and policies. Consumel is not
          responsible for third-party services outside our control.
        </p>
      </section>
      <section>
        <h2>7. Disclaimers and liability</h2>
        <p>
          The website and pre-release materials are provided on an “as is” and “as available”
          basis to the extent permitted by law. We do not promise uninterrupted operation or
          that pre-release material is complete or error-free. To the extent permitted by law,
          Consumel will not be liable for indirect, incidental, special, consequential, or
          punitive damages arising from use of the website or pre-release program.
        </p>
      </section>
      <section>
        <h2>8. Changes and termination</h2>
        <p>
          We may update the website, preview program, or these terms. Material changes will be
          posted with a new effective date. We may suspend access when needed to protect the
          service, comply with law, or address a breach of these terms.
        </p>
      </section>
      <section>
        <h2>9. Contact</h2>
        <p>
          Questions about these terms can be sent through the contact channel published on the
          Consumel website.
        </p>
      </section>
    </LegalPage>
  );
}
