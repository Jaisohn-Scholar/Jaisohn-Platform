import type { Metadata } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";
import { rootLayoutStyles } from "@/styles";

export const metadata: Metadata = {
  title: "Jaisohn Scholarship Platform",
  description: "Apply for Philip Jaisohn Foundation scholarships and internships",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rootLayoutStyles.html}>
      <body className={rootLayoutStyles.body}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
