import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Jaisohn Scholarship Platform",
  description: "Apply for Philip Jaisohn Foundation scholarships and internships",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
