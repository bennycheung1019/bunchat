// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";

// This is the TRUE Root Layout - it MUST have <html> and <body>
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Add <html> and <body> tags HERE
    // You might set a default lang or fetch it differently if needed at this root level
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}