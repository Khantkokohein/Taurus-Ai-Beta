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

function ThemeBootScript() {
  // ✅ Prevent white flash + set html.dark BEFORE paint
  // ✅ Also updates iOS/Chrome theme-color so browser UI follows the theme
  const code = `
(function () {
  try {
    var key = 'taurus_theme';
    var saved = localStorage.getItem(key);
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = saved || (prefersDark ? 'dark' : 'light');

    var root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    // Update theme-color dynamically
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'dark' ? '#050505' : '#f6fbf8');
  } catch (e) {}
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="my" suppressHydrationWarning className={myanmarFont.variable}>
      <head>
        {/* ✅ iOS safe-area + web-app behaviors */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />

        {/* ✅ base theme-color (script overrides instantly) */}
        <meta name="theme-color" content="#f6fbf8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#050505" media="(prefers-color-scheme: dark)" />

        <ThemeBootScript />
      </head>

      <body className={`${myanmarFont.className} antialiased`}>
        {/* ✅ FIX: inner pages white issue by giving root background that reacts to dark class */}
        <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[rgba(246,251,248,0.92)] dark:bg-[#050505]">
          {children}
          <Analytics />
        </div>
      </body>
    </html>
  );
}