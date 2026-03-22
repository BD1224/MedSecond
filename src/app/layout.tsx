import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MedSecond - Human Second Opinions",
  description: "Secure human-reviewed medical second opinions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('medsecond-theme-mode');
                  const mode = (saved === 'light' || saved === 'dark') ? saved : 
                    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  
                  document.documentElement.setAttribute('data-theme', mode);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
