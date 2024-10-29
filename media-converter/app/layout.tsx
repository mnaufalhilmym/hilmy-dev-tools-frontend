import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Converter",
  description: "Convert media file locally, without uploading it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
