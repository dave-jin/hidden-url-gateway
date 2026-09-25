import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { OncePerEmailBanner } from "@/components/once-per-email-banner";
import { localeFromAcceptLanguage } from "@/lib/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Grok Bot · Credit Access",
  description:
    "Invitation-only credit desk. The destination URL never leaves the server.",
  robots: { index: false, follow: false },
  icons: { icon: "/events/grok-bot/logo.svg" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerList = await headers();
  const locale = localeFromAcceptLanguage(headerList.get("accept-language"));

  return (
    <html
      lang={locale}
      className={`dark ${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <body className={`${geistSans.className} min-h-full flex flex-col bg-background text-foreground`}>
        <OncePerEmailBanner locale={locale} />
        {children}
      </body>
    </html>
  );
}
