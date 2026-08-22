import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Studio Analytics",
  description: "A polished creator dashboard for content, channel analytics, audience insights, and video performance.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Creator Studio Analytics",
    description: "See your channel grow with clear content and audience insights.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Creator Studio Analytics dashboard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Creator Studio Analytics",
    description: "See your channel grow with clear content and audience insights.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
