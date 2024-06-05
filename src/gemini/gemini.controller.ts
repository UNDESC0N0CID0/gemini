import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatMessageDto } from './dto/chat.dto';
import { GeminiService } from './gemini.service';

@Controller('gemini')
@UsePipes(new ValidationPipe())
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('start')
  @HttpCode(HttpStatus.OK)
  startConversation() {
    // @Body() startDto: StartConversationDto
    const conversationId = this.geminiService.startNewConversation();
    return { conversationId };
  }

  @Post('chat/:id')
  @HttpCode(HttpStatus.OK)
  async chat(@Param('id') id: string, @Body() chatDto: ChatMessageDto) {
    try {
      const response = await this.geminiService.chat(chatDto.message, id);
      return { response };
    } catch (error) {
      if (error.message === 'Conversación no encontrada') {
        throw new NotFoundException('La conversación no existe o ha expirado');
      }
      throw error;
    }
  }
}
