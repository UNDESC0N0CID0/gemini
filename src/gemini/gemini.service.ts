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
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  startNewConversation(id = uuidv4()): string {
    this.conversations.set(id, {
      id,
      history: [
        {
          role: 'user',
          parts: [{ text: 'Por favor, habla en español, con respuestas cortas y sin emojis o caritas.' }],
        },
      ],
    });
    return id;
  }

  createConversation(id: string) {
    return this.startNewConversation(id);
  }
  getConversation(id: string): Conversation {
    let conversation = this.conversations.get(id);
    if (!conversation) {
      conversation = this.conversations.get(this.createConversation(id));
      this.conversations.set(id, conversation);
    }
    return conversation;
  }

  async chat(message: string, conversationId: string): Promise<string> {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    const generationConfig = {
      temperature: 1.65,
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

    return response;
  }
}
