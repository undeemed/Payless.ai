"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export default function ExtensionPage() {
  useEffect(() => {
    // Initialize all ads
    try {
      const ads = document.querySelectorAll('.adsbygoogle');
      ads.forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      {/* Compact Header */}
      <header className="p-3 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <div className="font-semibold text-sm">Payless AI</div>
            <div className="text-[10px] text-gray-400">Free AI, powered by ads</div>
          </div>
        </div>
      </header>

      {/* Credit Display */}
      <div className="p-3 flex-shrink-0">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-4 shadow-lg">
          <div className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Your Credits</div>
          <div className="text-3xl font-bold">∞</div>
          <div className="text-xs text-white/70 mt-2 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Ads funding your AI
          </div>
        </div>
      </div>

      {/* Ad Stack - Optimized for vertical sidebar */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {/* Ad Unit 1 - Large Rectangle */}
        <div className="bg-[#252526] rounded-lg p-2 border border-white/5">
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "250px" }}
            data-ad-client="ca-pub-6034027262191917"
            data-ad-slot="auto"
            data-ad-format="rectangle"
            data-full-width-responsive="true"
          />
        </div>

        {/* Ad Unit 2 - Vertical */}
        <div className="bg-[#252526] rounded-lg p-2 border border-white/5">
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "300px" }}
            data-ad-client="ca-pub-6034027262191917"
            data-ad-slot="auto"
            data-ad-format="vertical"
            data-full-width-responsive="true"
          />
        </div>

        {/* Ad Unit 3 - Auto */}
        <div className="bg-[#252526] rounded-lg p-2 border border-white/5">
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "250px" }}
            data-ad-client="ca-pub-6034027262191917"
            data-ad-slot="auto"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {/* Ad Unit 4 - Rectangle */}
        <div className="bg-[#252526] rounded-lg p-2 border border-white/5">
          <ins
            className="adsbygoogle"
            style={{ display: "block", minHeight: "250px" }}
            data-ad-client="ca-pub-6034027262191917"
            data-ad-slot="auto"
            data-ad-format="rectangle"
            data-full-width-responsive="true"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="p-3 border-t border-white/10 flex-shrink-0">
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-2">
            Ads help keep AI free for everyone
          </div>
          <a 
            href="https://payless.chat" 
            target="_blank"
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            payless.chat
          </a>
        </div>
      </footer>
    </div>
  );
}

