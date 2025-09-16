import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrationsregister",
  description: "Wizard för integrationsmetadata"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
