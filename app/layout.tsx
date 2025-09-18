import React from "react";
import "./globals.css";
import TitleBar from "@/components/ui/titlebar";
import Footer from "@/components/ui/footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Copilot Airways" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/img/logo.svg" />
        <link rel="icon" href="/img/logo.svg" />
        <link rel="manifest" href="/manifest.json" />
        <title>Copilot Airways</title>
      </head>
      <body className="flex flex-col min-h-screen">
        <TitleBar />
        <div className="flex-grow flex justify-center items-center bg-gray-50">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
