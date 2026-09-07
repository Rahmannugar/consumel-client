import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const bricolageGrotesque = localFont({
  src: "./fonts/bricolage-grotesque-variable.ttf",
  variable: "--font-bricolage-grotesque",
  weight: "200 800",
  display: "swap",
});

const onest = localFont({
  src: "./fonts/onest-variable.ttf",
  variable: "--font-onest",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://consumel.com"),
  title: {
    default: "Consumel | Infrastructure for usage-based billing",
    template: "%s · Consumel",
  },
  description:
    "Meter usage, manage customer balances and entitlements, apply pricing rules, and connect usage-based billing to the providers you already use.",
  applicationName: "Consumel",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Consumel",
    title: "Infrastructure for usage-based billing",
    description:
      "Meter usage, manage customer balances and entitlements, apply pricing rules, and connect usage-based billing to the providers you already use.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: "Consumel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Consumel | Infrastructure for usage-based billing",
    description:
      "Meter usage, manage customer balances and entitlements, apply pricing rules, and connect usage-based billing to the providers you already use.",
    images: ["/opengraph-image.png"],
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#087cec",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bricolageGrotesque.variable} ${onest.variable}`}>
      <head>
        <link rel="preconnect" href="https://tally.so" />
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://tally.so" />
        <link rel="dns-prefetch" href="https://app.cal.com" />
        <script async src="https://tally.so/widgets/embed.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
