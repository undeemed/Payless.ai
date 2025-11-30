import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payless AI - Extension",
  description: "Payless AI Extension Sidebar",
};

export default function ExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google AdSense Script */}
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6034027262191917"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}

