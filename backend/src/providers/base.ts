import type { LLMProvider, LLMResponse } from '../types/index.js';

// Cost per 1K tokens (in credits)
// 1 credit ≈ $0.001 USD of inference cost
export const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  // OpenAI GPT-5 series (2025)
  'gpt-5': { input: 5, output: 20 },
  'gpt-5.1': { input: 6, output: 24 },
  'gpt-5.1-instant': { input: 2, output: 8 },
  'gpt-5.1-thinking': { input: 12, output: 48 },  // Higher cost for reasoning
  'gpt-5.1-codex': { input: 6, output: 24 },
  // OpenAI legacy
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'o3-mini': { input: 1.1, output: 4.4 },

  // Anthropic Claude 4.5 series (2025)
  'claude-opus-4.5': { input: 20, output: 80 },
  'claude-sonnet-4.5': { input: 4, output: 16 },
  'claude-haiku-4.5': { input: 1, output: 4 },
  // Anthropic legacy
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4 },

  // Google Gemini 3 series (2025)
  'gemini-3-pro': { input: 4, output: 16 },
  'gemini-3': { input: 3, output: 12 },
  'gemini-3-thinking': { input: 8, output: 32 },  // Higher cost for reasoning
  // Google Gemini 2.5 series
  'gemini-2.5-pro': { input: 2, output: 8 },
  'gemini-2.5-flash': { input: 0.15, output: 0.6 },
  'gemini-2.5-flash-thinking': { input: 0.5, output: 2 },  // Thinking mode
  // Google legacy
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
};

// Default models per provider (latest flagship models)
export const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-5.1',
  anthropic: 'claude-sonnet-4.5',
  gemini: 'gemini-3',
};

// Available models per provider
export const AVAILABLE_MODELS: Record<string, string[]> = {
  openai: [
    'gpt-5.1',
    'gpt-5.1-thinking',
    'gpt-5.1-instant',
    'gpt-5.1-codex',
    'gpt-5',
    'gpt-4o',
    'gpt-4o-mini',
    'o3-mini',
  ],
  anthropic: [
    'claude-opus-4.5',
    'claude-sonnet-4.5',
    'claude-haiku-4.5',
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
  ],
  gemini: [
    'gemini-3-pro',
    'gemini-3',
    'gemini-3-thinking',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-thinking',
    'gemini-2.0-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ],
};

// Estimate token count from text (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}

// Calculate credit cost based on tokens
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = COST_PER_1K_TOKENS[model];
  if (!costs) {
    // Fallback to moderate pricing for unknown models
    return Math.ceil((inputTokens + outputTokens) / 1000 * 2);
  }

  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;

  return Math.ceil(inputCost + outputCost);
}

// Estimate cost before execution (conservative estimate)
export function estimateCost(
  model: string,
  promptTokens: number,
  maxOutputTokens: number = 1000
): number {
  return calculateCost(model, promptTokens, maxOutputTokens);
}

// Base provider class
export abstract class BaseLLMProvider implements LLMProvider {
  abstract name: string;

  estimateCost(prompt: string, model: string, maxTokens: number = 1000): number {
    const inputTokens = estimateTokens(prompt);
    return estimateCost(model, inputTokens, maxTokens);
  }

  abstract execute(
    prompt: string,
    model: string,
    options?: { maxTokens?: number; systemPrompt?: string }
  ): Promise<LLMResponse>;
}
