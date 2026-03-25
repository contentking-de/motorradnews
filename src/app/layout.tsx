import type { Metadata } from "next";
import { Barlow_Condensed, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${barlowCondensed.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-serif bg-white text-[#111111]">
        {children}
      </body>
    </html>
  );
}
