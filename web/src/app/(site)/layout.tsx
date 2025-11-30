import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payless AI - Free AI Coding Assistant for VS Code",
  description: "Get free AI-powered coding assistance in VS Code. Payless AI uses ad revenue to fund your AI credits - no subscription required.",
  keywords: ["VS Code", "AI", "coding assistant", "free", "GPT", "Claude", "Gemini", "developer tools"],
  openGraph: {
    title: "Payless AI - Free AI Coding Assistant",
    description: "Free AI coding assistant for VS Code, powered by ads",
    type: "website",
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="google-adsense-account" content="ca-pub-6034027262191917" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6034027262191917"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
