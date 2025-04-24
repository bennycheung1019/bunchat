import "./globals.css";
import AuthProvider from "@/providers/SessionProvider";
import { ReactNode } from "react";

export const metadata = {
  title: "My AI Chatbot",
  description: "Chat with AI using Google login",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
