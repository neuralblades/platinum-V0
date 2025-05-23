"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chatbot/Chatbot";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata moved to a separate file since we're using 'use client'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en">
      <head>
        {/* Preconnect hints for external resources */}
        <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* DNS prefetch for third-party services */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        {/* Meta tags for better SEO and mobile experience */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#ffffff" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <div className="global-chatbot">
              <Chatbot />
            </div>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
