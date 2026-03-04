import type { Metadata, Viewport } from "next";
import { Noto_Sans_Myanmar } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const myanmarFont = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  weight: ["400", "500", "700"],
  variable: "--font-myanmar",
});

export const metadata: Metadata = {
  title: "Taurus AI",
  description: "Taurus AI Beta",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // @ts-ignore
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="my"
      suppressHydrationWarning
      className={myanmarFont.variable}
    >
      <head>
        {/* Dark Mode Boot Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function () {
  try {
    var t = localStorage.getItem('taurus_theme') || 'light';
    var root = document.documentElement;
    if (t === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  } catch (e) {}
})();
            `,
          }}
        />

        {/* Browser UI color */}
        <meta name="theme-color" content="#f6fbf8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#050505" media="(prefers-color-scheme: dark)" />
      </head>

      <body className={`${myanmarFont.className} antialiased`}>
        {/* Root Background Wrapper */}
        <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[rgba(246,251,248,0.92)] dark:bg-[#050505]">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}