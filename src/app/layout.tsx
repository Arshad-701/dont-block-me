import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Baloo_2 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-cute",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#bae6fd",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://dontblockme.app"),
  title: "Don't Block Me - Find your Fake Friends | Friendship Dare Quiz 2026",
  description:
    "Create your friendship dare quiz 2026, share with friends and find your fake friends online. The ultimate 'how well do you know me' quiz and fake friend finder. Block your fake friends quiz!",
  keywords: [
    "Friendship dare quiz 2026",
    "How well do you know me quiz",
    "Fake friend finder online",
    "Block your fake friends quiz",
    "friendship quiz",
    "dare quiz",
    "dont block me",
  ],
  authors: [{ name: "Don't Block Me" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Don't Block Me - Find your Fake Friends",
    description:
      "Create your friendship dare quiz, share with friends and find your fake friends! How well do your friends know you?",
    url: "https://dontblockme.app",
    siteName: "Don't Block Me",
    type: "website",
    images: [
      {
        url: "/bears-hero.png",
        width: 1024,
        height: 1024,
        alt: "Don't Block Me - Find your Fake Friends",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Don't Block Me - Find your Fake Friends",
    description:
      "Create your friendship dare quiz, share with friends and find your fake friends!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* AdSterra / Monetag Social Bar */}
        <Script
          data-cfasync="false"
          src="https://bicea.org/14/70cbe69a9660f38c774686f7ced5883b"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
