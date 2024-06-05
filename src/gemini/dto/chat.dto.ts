import { IsNotEmpty, IsString } from 'class-validator';

export class StartConversationDto {}

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
