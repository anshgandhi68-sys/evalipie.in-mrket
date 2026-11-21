import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Aiven Services
  aivenPgUrl: process.env.AIVEN_PG_URL || '',
  aivenKafkaBrokers: process.env.AIVEN_KAFKA_BROKERS || '',
  aivenKafkaCert: process.env.AIVEN_KAFKA_CERT || '',
  aivenOpenSearchUrl: process.env.AIVEN_OPENSEARCH_URL || '',
  
  // AI Provider (Gemini / OpenAI)
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Fallback dev mode when external credentials are not set
  isDevFallback: !process.env.AIVEN_PG_URL
};
