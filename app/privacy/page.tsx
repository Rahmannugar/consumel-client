import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Consumel handles information collected through its website and waitlist.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How Consumel handles information collected through this website and our pre-release program."
    >
      <section>
        <h2>1. Scope and who we are</h2>
        <p>
          Consumel operates this website and determines how personal information described in
          this policy is used. This policy covers consumel.com, the waitlist, meeting
          scheduling, and related pre-release communications. It does not describe data handling
          for a future generally available Consumel product; we will update or supplement this
          policy before that service is offered.
        </p>
        <p>
          You can contact us about privacy at{" "}
          <a href="mailto:hello@consumel.com">hello@consumel.com</a>.
        </p>
      </section>
      <section>
        <h2>2. Information we collect</h2>
        <p>We collect information you choose to provide, including:</p>
        <ul>
          <li>contact details, such as your name and email address;</li>
          <li>company, role, use case, billing model, and provider information you submit;</li>
          <li>meeting details you provide when scheduling a call;</li>
          <li>messages, feedback, and other information you send us.</li>
        </ul>
        <p>
          Services that deliver this website and its embedded forms or scheduling tools may
          automatically receive technical information such as your IP address, device and
          browser details, pages viewed, timestamps, and referring page.
        </p>
      </section>
      <section>
        <h2>3. How and why we use information</h2>
        <p>We use personal information to:</p>
        <ul>
          <li>manage the waitlist and evaluate requests for pre-release access;</li>
          <li>schedule meetings and respond to questions;</li>
          <li>send product and access updates you requested;</li>
          <li>understand product needs and improve the website and Consumel;</li>
          <li>
            maintain security, prevent abuse, enforce our terms, and comply with legal
            obligations.
          </li>
        </ul>
        <p>
          Depending on the context and applicable law, we rely on your consent, steps taken at
          your request, our legitimate interests in operating and improving the Site, and
          compliance with legal obligations. You may withdraw consent at any time, without
          affecting processing that already occurred.
        </p>
      </section>
      <section>
        <h2>4. Service providers and disclosures</h2>
        <p>
          We disclose information only as needed to providers that help us operate the website
          and the flows you choose to use. This currently includes Tally for waitlist forms,
          Cal.com for meeting scheduling, and website hosting and infrastructure providers.
          Their handling of information is also governed by their own policies, including the{" "}
          <a href="https://tally.so/help/terms-and-privacy">Tally privacy notice</a> and{" "}
          <a href="https://cal.com/privacy">Cal.com privacy policy</a>.
        </p>
        <p>
          We may also disclose information when required by law, to protect rights, security,
          and safety, or in connection with a financing, acquisition, reorganization, or sale of
          assets. We do not sell personal information.
        </p>
      </section>
      <section>
        <h2>5. Cookies and similar technologies</h2>
        <p>
          The website and embedded Tally or Cal.com experiences may use cookies or similar
          technologies needed to deliver their features, preserve settings, prevent abuse, and
          understand performance. We do not currently use advertising cookies on the website. If
          we add optional cookies that require consent, we will provide the appropriate controls
          before using them.
        </p>
      </section>
      <section>
        <h2>6. Retention</h2>
        <p>
          We keep personal information only as long as reasonably needed for the purposes
          described here, including operating the waitlist, maintaining records, resolving
          disputes, and meeting legal obligations. Retention periods depend on the type of
          information and why it was collected.
        </p>
      </section>
      <section>
        <h2>7. Your choices and rights</h2>
        <p>
          Depending on where you live, you may have rights to be informed about our processing;
          access, correct, delete, restrict, or receive a copy of your information; object to
          certain processing; withdraw consent; and complain to a data protection authority. You
          can unsubscribe from promotional email at any time.
        </p>
        <p>
          To make a request, email <a href="mailto:hello@consumel.com">hello@consumel.com</a>.
          We may need to verify your identity and may retain information where applicable law
          permits or requires it.
        </p>
      </section>
      <section>
        <h2>8. International processing</h2>
        <p>
          Consumel and its providers may process information in countries other than where you
          live. Where applicable law requires it, we use recognized safeguards for international
          transfers or rely on another lawful transfer mechanism.
        </p>
      </section>
      <section>
        <h2>9. Security</h2>
        <p>
          We use reasonable administrative, technical, and organizational measures designed to
          protect personal information. No internet service or storage system can guarantee
          absolute security.
        </p>
      </section>
      <section>
        <h2>10. Children</h2>
        <p>
          This website is intended for business users and is not directed to anyone under 18. We
          do not knowingly collect personal information from children.
        </p>
      </section>
      <section>
        <h2>11. Changes to this policy</h2>
        <p>
          We may update this policy as our website and product develop. We will post changes
          here with a revised effective date. If a change materially affects how we use
          information already collected, we will provide additional notice when required by law.
        </p>
      </section>
    </LegalPage>
  );
}
