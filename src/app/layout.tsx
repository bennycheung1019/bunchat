import { ReactNode } from "react";
import "./globals.css";


export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>; // ❌ no <html> or <body> here
}
