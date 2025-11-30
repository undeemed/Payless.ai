"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { api, type AdStatsResponse } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const fetchStats = async () => {
    try {
      const stats = await api.getAdStats();
      setStats(stats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load stats. Make sure backend is running.');
    }
  };

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/");
        return;
      }
      
      setUser(user);
      setLoading(false);
      
      // Fetch real stats from backend
      await fetchStats();
    }

    loadUser();
  }, [router, supabase.auth]);

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.user_metadata?.full_name || user?.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            {error}
            <div className="mt-2 text-xs text-muted-foreground">
              Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-2">Credit Balance</div>
            <div className="text-4xl font-bold">{stats?.current_balance ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-2">
              +{stats?.credits_per_minute ?? 10}/min while watching ads
            </div>
            {stats && (
              <div className="text-xs text-muted-foreground mt-1">
                Updates every 5s
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-2">Credits Earned Today</div>
            <div className="text-4xl font-bold">{stats?.credits_earned_today ?? 0}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {formatTime(stats?.total_seconds_today ?? 0)} of ad viewing
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-sm text-muted-foreground mb-2">All-Time Credits</div>
            <div className="text-4xl font-bold">{Math.floor(stats?.total_credits_earned ?? 0)}</div>
            <div className="text-sm text-muted-foreground mt-2">
              {formatTime(stats?.total_seconds_all_time ?? 0)} total viewing time
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-xl font-bold mb-6">Get Started</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">1. Install the VS Code Extension</h3>
              <p className="text-sm text-muted-foreground">
                The extension displays ads in your sidebar while you code, earning you credits automatically.
              </p>
              <a
                href="vscode:extension/payless-ai.payless-ai"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Install Extension
              </a>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">2. Start Earning Credits</h3>
              <p className="text-sm text-muted-foreground">
                Keep the ad sidebar open while coding. You&apos;ll earn 10 credits per minute - about 600 credits per hour.
              </p>
              <div className="text-sm text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Extension will sync with your account automatically
              </div>
            </div>
          </div>
        </div>

        {/* Usage Info */}
        <div className="mt-8 p-6 bg-secondary/30 rounded-xl">
          <h3 className="font-medium mb-4">Credit Usage</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">GPT-5.1</div>
              <div>~5-20 credits per message</div>
            </div>
            <div>
              <div className="text-muted-foreground">Claude 4.5</div>
              <div>~4-16 credits per message</div>
            </div>
            <div>
              <div className="text-muted-foreground">Gemini 3</div>
              <div>~3-12 credits per message</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
