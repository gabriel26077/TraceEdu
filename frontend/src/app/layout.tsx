import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { AuthProvider } from "@/contexts/AuthContext";
import AppContent from "@/components/AppContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TraceEdu | Premium Academic Management",
  description: "Modern Hexagonal Architecture Educational System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <SchoolProvider>
            <AppContent>{children}</AppContent>
          </SchoolProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
