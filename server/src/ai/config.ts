import dotenv from 'dotenv';
dotenv.config();

export interface AiEngineConfig {
  gatewayBaseUrl: string;
  modelId: string;
  virtualAccountToken: string;
  timeoutMs: number;
  maxRetries: number;
  isConfigured: boolean;
  environment: string;
}

export const aiConfig: AiEngineConfig = {
  gatewayBaseUrl: (process.env.TFY_GATEWAY_BASE_URL || 'https://gateway.truefoundry.ai').replace(/\/+$/, ''),
  modelId: process.env.TFY_MODEL_ID || '',
  virtualAccountToken: process.env.TFY_VIRTUAL_ACCOUNT_TOKEN || '',
  timeoutMs: parseInt(process.env.TFY_TIMEOUT_MS || '15000', 10),
  maxRetries: parseInt(process.env.TFY_MAX_RETRIES || '2', 10),
  isConfigured: Boolean(process.env.TFY_VIRTUAL_ACCOUNT_TOKEN && process.env.TFY_MODEL_ID),
  environment: process.env.NODE_ENV || 'development'
};
