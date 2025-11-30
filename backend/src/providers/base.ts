import type { LLMProvider, LLMResponse } from '../types/index.js';

// Cost per 1K tokens (in credits)
// 1 credit ≈ $0.001 USD of inference cost
export const COST_PER_1K_TOKENS: Record<string, { input: number; output: number }> = {
  // OpenAI models (latest 2024-2025)
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'o1': { input: 15, output: 60 },
  'o1-mini': { input: 3, output: 12 },
  'o3-mini': { input: 1.1, output: 4.4 },

  // Anthropic models (latest 2024-2025)
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 0.8, output: 4 },
  'claude-3-opus-20240229': { input: 15, output: 75 },

  // Google models (latest 2024-2025)
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'gemini-2.0-flash-lite': { input: 0.02, output: 0.08 },
  'gemini-1.5-pro': { input: 1.25, output: 5 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
};

// Default models per provider (set to best value/performance ratio)
export const DEFAULT_MODELS: Record<string, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  gemini: 'gemini-2.0-flash',
};

// Available models per provider
export const AVAILABLE_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini', 'o3-mini'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  gemini: ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-pro', 'gemini-1.5-flash'],
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
