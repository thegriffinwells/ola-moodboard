import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ola Moodboard",
  description: "Upload clothing photos and create styled grid boards for styling clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
