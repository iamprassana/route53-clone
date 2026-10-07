import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hosted zones | Route 53",
  description: "Manage hosted DNS zones",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
