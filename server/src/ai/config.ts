import dotenv from 'dotenv';
dotenv.config();

export interface AiEngineConfig {
  provider: 'self_hosted' | 'ollama' | 'vllm' | 'custom';
  inferenceBaseUrl: string;
  modelId: string;
  embeddingModelId: string;
  maxTokens: number;
  temperature: number;
  timeoutMs: number;
  maxRetries: number;
  environment: string;
}

export const aiConfig: AiEngineConfig = {
  provider: (process.env.AI_MODEL_PROVIDER as any) || 'self_hosted',
  inferenceBaseUrl: (process.env.AI_INFERENCE_BASE_URL || 'http://localhost:11434').replace(/\/+$/, ''),
  modelId: process.env.AI_MODEL_ID || 'qwen2.5:3b',
  embeddingModelId: process.env.AI_EMBEDDING_MODEL_ID || 'nomic-embed-text',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024', 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '25000', 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '2', 10),
  environment: process.env.NODE_ENV || 'development'
};
