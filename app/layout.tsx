import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow Cast",
  description: "Monte Carlo throughput forecast — Flow Cast",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
