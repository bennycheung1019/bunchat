import { ReactNode } from "react";
import "./globals.css";
import AuthProvider from "@/providers/SessionProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
