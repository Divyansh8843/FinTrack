import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import LenisProvider from "@/components/LenisProvider";
import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "FinTrack",
  description:
    "Track, analyze, and optimize your college spending with AI-powered insights.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = saved ? saved === 'dark' : prefersDark;
    var root = document.documentElement;
    if (dark) root.classList.add('dark'); else root.classList.remove('dark');
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`,
          }}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#111827" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground font-sans transition-colors duration-300 custom-scrollbar overflow-x-hidden">
        <LenisProvider>
          <ClientLayout>{children}</ClientLayout>
        </LenisProvider>
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(()=>{});
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
