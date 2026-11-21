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
  source: 'self_hosted' | 'fallback';
}

export interface AiTelemetry {
  provider: string;
  modelId: string;
  inferenceUrl: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  lastLatencyMs: number;
  averageLatencyMs: number;
  lastError: string | null;
  runtimeStatus: 'healthy' | 'offline' | 'degraded';
  availableModels: string[];
}

export class SelfHostedAiClient {
  private telemetry: AiTelemetry = {
    provider: aiConfig.provider,
    modelId: aiConfig.modelId,
    inferenceUrl: aiConfig.inferenceBaseUrl,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    lastLatencyMs: 0,
    averageLatencyMs: 0,
    lastError: null,
    runtimeStatus: 'offline',
    availableModels: []
  };

  private latencies: number[] = [];

  constructor() {
    // Perform initial health check asynchronously
    this.checkHealth().catch(() => {});
  }

  getTelemetry(): AiTelemetry {
    return { ...this.telemetry };
  }

  /**
   * Health check verifying inference runtime connectivity and loaded models.
   */
  async checkHealth(): Promise<{ status: 'healthy' | 'offline'; models: string[] }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Probe Ollama /api/tags
      const res = await fetch(`${aiConfig.inferenceBaseUrl}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = (await res.json()) as any;
        const models = (data.models || []).map((m: any) => m.name || m.model);
        this.telemetry.runtimeStatus = 'healthy';
        this.telemetry.availableModels = models;
        this.telemetry.lastError = null;
        return { status: 'healthy', models };
      }
    } catch (err: any) {
      // Also try OpenAI-compatible /v1/models if Ollama specific path failed
      try {
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 3000);
        const res2 = await fetch(`${aiConfig.inferenceBaseUrl}/v1/models`, {
          signal: controller2.signal
        });
        clearTimeout(timeout2);
        if (res2.ok) {
          const data2 = (await res2.json()) as any;
          const models2 = (data2.data || []).map((m: any) => m.id);
          this.telemetry.runtimeStatus = 'healthy';
          this.telemetry.availableModels = models2;
          this.telemetry.lastError = null;
          return { status: 'healthy', models: models2 };
        }
      } catch {
        // Model server is offline or starting up
      }

      this.telemetry.runtimeStatus = 'offline';
      this.telemetry.lastError = err.message || 'Inference server unreachable';
    }

    return { status: 'offline', models: [] };
  }

  /**
   * Send chat completion request to self-hosted LLM runtime (Ollama / vLLM).
   */
  async chatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();
    this.telemetry.totalRequests++;

    const endpoint = `${aiConfig.inferenceBaseUrl}/api/chat`;
    const payload: Record<string, any> = {
      model: aiConfig.modelId,
      messages,
      stream: false,
      options: {
        temperature: options.temperature ?? aiConfig.temperature,
        num_predict: options.maxTokens ?? aiConfig.maxTokens
      }
    };

    if (options.responseFormatJson) {
      payload.format = 'json';
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
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorText = await res.text().catch(() => '');
          throw new Error(`Inference HTTP ${res.status}: ${errorText || res.statusText}`);
        }

        const data = (await res.json()) as any;
        const latencyMs = Date.now() - startTime;

        const content = data.message?.content || '';
        const promptTokens = data.prompt_eval_count || 0;
        const completionTokens = data.eval_count || 0;

        // Record metrics
        this.telemetry.successfulRequests++;
        this.telemetry.runtimeStatus = 'healthy';
        this.telemetry.lastLatencyMs = latencyMs;
        this.telemetry.totalPromptTokens += promptTokens;
        this.telemetry.totalCompletionTokens += completionTokens;
        this.telemetry.lastError = null;

        this.latencies.push(latencyMs);
        if (this.latencies.length > 50) this.latencies.shift();
        this.telemetry.averageLatencyMs = Math.round(
          this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
        );

        return {
          content,
          latencyMs,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens
          },
          model: data.model || aiConfig.modelId,
          source: 'self_hosted'
        };
      } catch (err: any) {
        lastErr = err;
        this.telemetry.lastError = err.message || 'Request failed';
        if (attempt <= aiConfig.maxRetries) {
          await new Promise(r => setTimeout(r, 600 * attempt));
        }
      }
    }

    this.telemetry.failedRequests++;
    this.telemetry.runtimeStatus = 'degraded';
    console.warn(`[SelfHostedAI] Inference failed after ${attempt} attempts: ${lastErr?.message}`);

    return {
      content: '',
      latencyMs: Date.now() - startTime,
      model: aiConfig.modelId,
      source: 'fallback'
    };
  }
}

export const selfHostedAiClient = new SelfHostedAiClient();
// Backward-compatible alias for existing imports
export const trueFoundryClient = selfHostedAiClient;
