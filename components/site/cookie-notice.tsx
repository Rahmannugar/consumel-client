"use client";

import Script from "next/script";

type SilktideConsentManagerConfig = {
  autoShow: boolean;
  backdrop: { show: boolean };
  icon: { position: "bottomLeft" | "bottomRight" };
  namespace: string;
  consentTypes: Array<{
    id: string;
    label: string;
    description: string;
    required: boolean;
  }>;
  text: {
    prompt: {
      preferencesButtonAccessibleLabel: string;
    };
    preferences: {
      title: string;
      description: string;
      saveButtonText: string;
      saveButtonAccessibleLabel: string;
      creditLinkText: string;
      creditLinkAccessibleLabel: string;
    };
  };
};

declare global {
  interface Window {
    silktideConsentManager?: {
      init: (config: SilktideConsentManagerConfig) => void;
    };
  }
}

const consentManagerConfig: SilktideConsentManagerConfig = {
  autoShow: false,
  backdrop: {
    show: true,
  },
  icon: {
    position: "bottomRight",
  },
  namespace: "consumel",
  consentTypes: [
    {
      id: "essential",
      label: "Essential",
      description:
        "<p>These cookies and similar technologies are necessary for the website and selected features to work properly. They cannot be switched off.</p>",
      required: true,
    },
  ],
  text: {
    prompt: {
      preferencesButtonAccessibleLabel: "Manage cookie information",
    },
    preferences: {
      title: "Cookies on Consumel",
      description:
        '<p>We use essential cookies and similar technologies to operate this website, remember your preferences, and support features you choose to use. Read our <a href="/privacy-policy">Privacy Policy</a> for more information.</p>',
      saveButtonText: "Close",
      saveButtonAccessibleLabel: "Close cookie information",
      creditLinkText: "Silktide Consent Manager",
      creditLinkAccessibleLabel: "Visit Silktide Consent Manager",
    },
  },
};

function initializeConsentManager() {
  window.silktideConsentManager?.init(consentManagerConfig);
}

export function CookieNotice() {
  return (
    <Script
      id="silktide-consent-manager-script"
      src="https://cdn.jsdelivr.net/gh/silktide/consent-manager@v2.0.1/silktide-consent-manager.js"
      integrity="sha384-5Pt34uiIbCsvfiiZXoLi4HRf/YBXjr9c8e+gYeVo9smUaInNHYVtc8NZ8wUnXJIq"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onReady={initializeConsentManager}
    />
  );
}
