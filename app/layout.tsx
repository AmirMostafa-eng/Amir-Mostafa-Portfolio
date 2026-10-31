import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { LiquidNav } from "@/components/nav/LiquidNav";
import { site } from "@/data/site";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: { default: `${site.name} | ${site.roles[0]}`, template: `%s | ${site.name}` },
  description: site.tagline,
  icons: {
    icon: "/1793398889.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        <noscript>
          <style>{`.nav-entrance { transform: none !important; } .reveal { opacity: 1 !important; transform: none !important; transition: none !important; } .footer-watermark { opacity: 1 !important; transform: translateX(-50%) !important; } .role-caret { display: none !important; }`}</style>
        </noscript>
        <LiquidNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
