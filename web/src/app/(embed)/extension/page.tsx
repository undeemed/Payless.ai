"use client";

import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface BalanceUpdate {
  type: 'balanceUpdate';
  credits: number;
  creditsPerMinute: number;
  isEarning: boolean;
}

export default function ExtensionPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsPerMinute, setCreditsPerMinute] = useState(10);
  const [isEarning, setIsEarning] = useState(false);
  const [lastEarnTime, setLastEarnTime] = useState<number | null>(null);
  const [isDark, setIsDark] = useState(true);

  // Handle messages from parent (VS Code extension)
  const handleMessage = useCallback((event: MessageEvent) => {
    const data = event.data as BalanceUpdate;
    if (data && data.type === 'balanceUpdate') {
      setCredits(data.credits);
      setCreditsPerMinute(data.creditsPerMinute);
      setIsEarning(data.isEarning);
      if (data.isEarning) {
        setLastEarnTime(Date.now());
      }
    }
  }, []);

  useEffect(() => {
    // Load theme preference
    const saved = localStorage.getItem('payless-theme');
    if (saved) {
      setIsDark(saved === 'dark');
    }

    // Listen for balance updates from parent
    window.addEventListener('message', handleMessage);

    // Request initial balance from parent
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'requestBalance' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

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

  // Auto-fade earning indicator after 5 seconds of no updates
  useEffect(() => {
    if (lastEarnTime) {
      const timeout = setTimeout(() => {
        if (Date.now() - lastEarnTime > 5000) {
          setIsEarning(false);
        }
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [lastEarnTime]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('payless-theme', newTheme ? 'dark' : 'light');
  };

  // Format credits for display
  const formatCredits = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return Math.floor(value).toLocaleString();
  };

  // Theme classes
  const bg = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const text = isDark ? 'text-white' : 'text-black';
  const textMuted = isDark ? 'text-neutral-400' : 'text-neutral-500';
  const border = isDark ? 'border-white/10' : 'border-black/10';
  const cardBg = isDark ? 'bg-[#111]' : 'bg-neutral-50';
  const creditsBg = isDark ? 'bg-white text-black' : 'bg-black text-white';

  return (
    <div className={`min-h-screen ${bg} ${text} flex flex-col font-sans`}>
      {/* Compact Header */}
      <header className={`p-3 border-b ${border} flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg ${isDark ? 'bg-white' : 'bg-black'} ${isDark ? 'text-black' : 'text-white'} flex items-center justify-center font-bold text-sm`}>
              P
            </div>
            <div>
              <div className="font-semibold text-sm">Payless AI</div>
              <div className={`text-[10px] ${textMuted}`}>Free AI, powered by ads</div>
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-lg ${cardBg} ${border} border flex items-center justify-center text-sm hover:opacity-80 transition-opacity`}
            aria-label="Toggle theme"
          >
            {isDark ? '☀' : '☾'}
          </button>
        </div>
      </header>

      {/* Credit Display */}
      <div className="p-3 flex-shrink-0">
        <div className={`${creditsBg} rounded-xl p-4 relative overflow-hidden`}>
          {/* Earning animation background */}
          {isEarning && (
            <div className={`absolute inset-0 ${isDark ? 'bg-black/10' : 'bg-white/10'}`} style={{
              background: `linear-gradient(90deg, transparent, ${isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}, transparent)`,
              animation: 'shimmer 2s infinite',
            }} />
          )}
          
          <div className="relative">
            <div className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-black/60' : 'text-white/60'} mb-1`}>Your Credits</div>
            <div className="text-3xl font-bold tabular-nums">
              {credits === null ? (
                <span className="opacity-50">---</span>
              ) : (
                formatCredits(credits)
              )}
            </div>
            
            {/* Earning indicator */}
            <div className={`text-xs ${isDark ? 'text-black/60' : 'text-white/60'} mt-2 flex items-center gap-1`}>
              {isEarning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>+{creditsPerMinute}/min</span>
                </>
              ) : credits === null ? (
                <>
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-black/30' : 'bg-white/30'}`} />
                  <span>Sign in to earn</span>
                </>
              ) : (
                <>
                  <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-black/30' : 'bg-white/30'}`} />
                  <span>Keep sidebar open to earn</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Earning Rate Info */}
      <div className="px-3 pb-2 flex-shrink-0">
        <div className={`${cardBg} rounded-lg p-3 border ${border}`}>
          <div className="flex items-center justify-between text-xs">
            <span className={textMuted}>Earn rate</span>
            <span className="font-medium">{creditsPerMinute} credits/min</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className={textMuted}>Per hour</span>
            <span className={textMuted}>~{creditsPerMinute * 60} credits</span>
          </div>
        </div>
      </div>

      {/* Ad Stack - Optimized for vertical sidebar */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {/* Ad Unit 1 - Large Rectangle */}
        <div className={`${cardBg} rounded-lg p-2 border ${border}`}>
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
        <div className={`${cardBg} rounded-lg p-2 border ${border}`}>
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
        <div className={`${cardBg} rounded-lg p-2 border ${border}`}>
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
        <div className={`${cardBg} rounded-lg p-2 border ${border}`}>
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
      <footer className={`p-3 border-t ${border} flex-shrink-0`}>
        <div className="text-center">
          <div className={`text-[10px] ${textMuted} mb-2`}>
            Ads help keep AI free for everyone
          </div>
          <a 
            href="https://payless.chat" 
            target="_blank"
            className={`text-xs ${textMuted} hover:${text} transition-colors underline`}
          >
            payless.chat
          </a>
        </div>
      </footer>

      {/* Custom styles for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
