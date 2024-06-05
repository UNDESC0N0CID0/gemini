import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

interface Conversation {
  id: string;
  history: any[];
}

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private conversations: Map<string, Conversation> = new Map();

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('appConfig.GeminiApiKey');
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  startNewConversation(): string {
    const id = uuidv4();
    this.conversations.set(id, {
      id,
      history: [
        {
          role: 'user',
          parts: [{ text: 'Por favor, habla en español.' }],
        },
      ],
    });
    return id;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  async chat(message: string, conversationId: string): Promise<string> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    };

    const chatSession = this.model.startChat({
      generationConfig,
      history: conversation.history,
    });

    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    // Actualizar el historial
    // conversation.history.push({ role: 'user', parts: [{ text: message }] });
    // conversation.history.push({ role: 'model', parts: [{ text: response }] });

    return response;
  }
}
