import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('appConfig', () => ({
  GeminiApiKey: process.env.GEMINI_API_KEY,
}));
