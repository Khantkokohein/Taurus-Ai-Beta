import type { Metadata } from "next";
import { Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";

const myanmarFont = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "700"],
  variable: "--font-myanmar",
});

export const metadata: Metadata = {
  title: "Taurus AI",
  description: "Taurus AI Beta",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="my">
      <body className={myanmarFont.className}>
        {children}
      </body>
    </html>
  );
}