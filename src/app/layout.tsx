// app/layout.tsx
import { ReactNode } from "react";
import "./globals.css";

// This is the TRUE Root Layout - it MUST have <html> and <body>
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // Add <html> and <body> tags HERE
    // You might set a default lang or fetch it differently if needed at this root level
    <html lang="en">
      <head>
        <script
          src="https://checkout.airwallex.com/assets/elements.bundle.min.js"
          async
        ></script>
      </head>
      <body>{children}</body>
    </html>
  );
}