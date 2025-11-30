export default function HomePage() {
  // Supabase OAuth URL - redirects to /auth/callback which then goes to /dashboard
  const supabaseUrl = "https://bycsqbjaergjhwzbulaa.supabase.co";
  const redirectTo = "https://payless.chat/auth/callback";
  const signUpUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-24 md:py-32 border-b border-border/50">
        <div className="space-y-8 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary">
            Free AI for VS Code.
            <br />
            <span className="text-muted-foreground font-normal">Powered by ads.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Access GPT-5, Claude 4.5, and Gemini 3 directly in your editor. 
            No subscription required. Just keep a small ad sidebar open.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={signUpUrl}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-all text-lg"
            >
              Sign Up Free
            </a>
            <a
              href="vscode:extension/payless-ai.payless-ai"
              className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-all text-lg"
            >
              Install Extension
            </a>
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-24 border-b border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Top-Tier Models</h2>
            <p className="text-muted-foreground">Access the most powerful AI models available today.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="text-xl font-bold mb-2">OpenAI</div>
              <div className="text-4xl font-bold mb-6 text-primary">GPT-5.1</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">✓ Thinking Mode</li>
                <li className="flex items-center gap-2">✓ Instant Responses</li>
                <li className="flex items-center gap-2">✓ Codex Optimized</li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="text-xl font-bold mb-2">Anthropic</div>
              <div className="text-4xl font-bold mb-6 text-primary">Claude 4.5</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">✓ Opus 4.5</li>
                <li className="flex items-center gap-2">✓ Sonnet 4.5</li>
                <li className="flex items-center gap-2">✓ Haiku 4.5</li>
              </ul>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border hover:border-primary/50 transition-colors">
              <div className="text-xl font-bold mb-2">Google</div>
              <div className="text-4xl font-bold mb-6 text-primary">Gemini 3</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">✓ Pro & Flash</li>
                <li className="flex items-center gap-2">✓ Thinking Mode</li>
                <li className="flex items-center gap-2">✓ 1M+ Context</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground">Transparent, fair, and completely free.</p>
            </div>

            <div className="space-y-12">
              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Install the Extension</h3>
                  <p className="text-muted-foreground">Add Payless AI to VS Code. A small sidebar will appear displaying non-intrusive ads.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Earn Credits Automatically</h3>
                  <p className="text-muted-foreground">While the sidebar is visible, you earn 10 credits per minute. That&apos;s about 600 credits per hour of coding.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Code with AI</h3>
                  <p className="text-muted-foreground">Use your credits to chat with GPT-5, Claude 4.5, or Gemini 3. No credit card, no subscription.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
