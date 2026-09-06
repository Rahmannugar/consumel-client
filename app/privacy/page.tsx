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
        <h2>1. Information we collect</h2>
        <p>We may collect the following information when you use this website:</p>
        <ul>
          <li>contact details, such as your email address;</li>
          <li>company, role, use case, billing model, and provider information you submit;</li>
          <li>messages, feedback, and other information you choose to send;</li>
          <li>
            basic technical and usage data, such as device, browser, pages viewed, and referrer.
          </li>
        </ul>
      </section>
      <section>
        <h2>2. How we use information</h2>
        <p>We use information to:</p>
        <ul>
          <li>manage the waitlist and pre-release access;</li>
          <li>understand product needs and improve Consumel;</li>
          <li>communicate product updates and respond to requests;</li>
          <li>protect the website, prevent abuse, and comply with legal obligations.</li>
        </ul>
      </section>
      <section>
        <h2>3. Service providers and disclosures</h2>
        <p>
          We may share information with vendors that help operate the website and waitlist,
          including hosting, form, analytics, and communication providers. Tally may process
          information submitted through an embedded waitlist form. We may also disclose
          information when required by law, to protect rights and safety, or as part of a
          corporate transaction. We do not sell personal information.
        </p>
      </section>
      <section>
        <h2>4. Cookies and analytics</h2>
        <p>
          The website may use necessary storage and privacy-conscious analytics to understand
          aggregate traffic and performance. If we introduce optional cookies that require
          consent, we will provide the appropriate controls before using them.
        </p>
      </section>
      <section>
        <h2>5. Retention</h2>
        <p>
          We keep personal information only as long as reasonably needed for the purposes
          described here, including operating the waitlist, maintaining records, resolving
          disputes, and meeting legal obligations. Retention periods depend on the type of
          information and why it was collected.
        </p>
      </section>
      <section>
        <h2>6. Your choices and rights</h2>
        <p>
          You may ask to access, correct, or delete your information, or unsubscribe from
          product updates. Depending on where you live, you may have additional privacy rights.
          We may need to verify a request before acting on it.
        </p>
      </section>
      <section>
        <h2>7. International processing and security</h2>
        <p>
          Consumel and its vendors may process information in countries other than yours. We use
          reasonable safeguards designed to protect information, but no internet service can
          guarantee absolute security.
        </p>
      </section>
      <section>
        <h2>8. Children</h2>
        <p>
          This website is intended for business users and is not directed to children under 13.
          We do not knowingly collect personal information from children.
        </p>
      </section>
      <section>
        <h2>9. Changes and contact</h2>
        <p>
          We may update this policy as our website and product develop. We will post changes
          here with a revised effective date. Privacy questions and requests can be sent through
          the contact channel published on the Consumel website.
        </p>
      </section>
    </LegalPage>
  );
}
