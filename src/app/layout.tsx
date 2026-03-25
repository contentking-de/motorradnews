import type { Metadata } from "next";
import { Barlow_Condensed, Arimo } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const arimo = Arimo({
  variable: "--font-arimo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "motorrad.news – Motorrad-Nachrichten & Tests",
    template: "%s | motorrad.news",
  },
  description:
    "Das Motorrad-Nachrichtenportal: Neuheiten, Tests, Technik, Reisen und Motorsport.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${barlowCondensed.variable} ${arimo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-white text-[#111111]">
        {children}
      </body>
    </html>
  );
}
