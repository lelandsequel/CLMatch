import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "C&L Job Match",
  description: "Premium offer farming reports for ambitious operators."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cloud text-ink dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
