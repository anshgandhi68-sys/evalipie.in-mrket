import { aiConfig } from './config.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface ChatCompletionResponse {
  content: string;
  latencyMs: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  source: 'truefoundry' | 'fallback';
}

export interface AiTelemetry {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  lastLatencyMs: number;
  averageLatencyMs: number;
  lastError: string | null;
  gatewayStatus: 'configured' | 'unconfigured' | 'degraded';
}

class TrueFoundryClient {
  private telemetry: AiTelemetry = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    lastLatencyMs: 0,
    averageLatencyMs: 0,
    lastError: null,
    gatewayStatus: aiConfig.isConfigured ? 'configured' : 'unconfigured'
  };

  private latencies: number[] = [];

  getTelemetry(): AiTelemetry {
    return { ...this.telemetry };
  }

  // Complete a chat request via TrueFoundry AI Gateway (OpenAI compatible)
  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    this.telemetry.totalRequests++;

    if (!aiConfig.isConfigured) {
      this.telemetry.gatewayStatus = 'unconfigured';
      return {
        content: '',
        latencyMs: 0,
        model: 'unconfigured',
        source: 'fallback'
      };
    }

    const endpoint = `${aiConfig.gatewayBaseUrl}/v1/chat/completions`;
    const payload: Record<string, any> = {
      model: aiConfig.modelId,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.maxTokens ?? 1024
    };

    if (options.responseFormatJson) {
      payload.response_format = { type: 'json_object' };
    }

    let attempt = 0;
    let lastErr: Error | null = null;

    while (attempt <= aiConfig.maxRetries) {
      attempt++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiConfig.virtualAccountToken}`,
            'X-Source': 'evalipie-marketplace-intelligence'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`TrueFoundry Gateway Error (${res.status}): ${errText}`);
        }

        const data: any = await res.json();
        const latencyMs = Date.now() - startTime;

        const content = data.choices?.[0]?.message?.content || '';
        const usage = data.usage
          ? {
              promptTokens: data.usage.prompt_tokens || 0,
              completionTokens: data.usage.completion_tokens || 0,
              totalTokens: data.usage.total_tokens || 0
            }
          : undefined;

        // Record telemetry
        this.recordSuccess(latencyMs, usage);

        return {
          content,
          latencyMs,
          usage,
          model: data.model || aiConfig.modelId,
          source: 'truefoundry'
        };
      } catch (err: any) {
        lastErr = err;
        // Bounded exponential backoff before retry (only if attempts remain)
        if (attempt <= aiConfig.maxRetries) {
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          await new Promise(r => setTimeout(r, backoff));
        }
      }
    }

    // All retries failed
    const latencyMs = Date.now() - startTime;
    this.recordFailure(lastErr?.message || 'Unknown network error', latencyMs);
    throw lastErr || new Error('TrueFoundry request failed');
  }

  private recordSuccess(latencyMs: number, usage?: { promptTokens: number; completionTokens: number }) {
    this.telemetry.successfulRequests++;
    this.telemetry.lastLatencyMs = latencyMs;
    this.telemetry.gatewayStatus = 'configured';
    this.telemetry.lastError = null;

    this.latencies.push(latencyMs);
    if (this.latencies.length > 50) this.latencies.shift();
    this.telemetry.averageLatencyMs = Math.round(
      this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
    );

    if (usage) {
      this.telemetry.totalPromptTokens += usage.promptTokens;
      this.telemetry.totalCompletionTokens += usage.completionTokens;
    }
  }

  private recordFailure(errorMessage: string, latencyMs: number) {
    this.telemetry.failedRequests++;
    this.telemetry.lastLatencyMs = latencyMs;
    this.telemetry.lastError = errorMessage;
    this.telemetry.gatewayStatus = 'degraded';
  }
}

export const trueFoundryClient = new TrueFoundryClient();
