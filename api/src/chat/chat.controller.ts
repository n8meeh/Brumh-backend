import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, ParseIntPipe, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Crear o obtener un chat con otro usuario
   * POST /chat/start/:userId
   */
  @Post('start/:userId')
  async startChat(@Request() req, @Param('userId', ParseIntPipe) otherUserId: number) {
    const currentUserId = req.user.userId;
    return this.chatService.findOrCreateChat(currentUserId, otherUserId);
  }

  /**
   * Buscar o crear un chat basado en una orden
   * GET /chat/order/:orderId
   * Retorna el chat vinculado a la orden (lo crea si no existe)
   */
  @Get('order/:orderId')
  async getChatByOrder(@Request() req, @Param('orderId', ParseIntPipe) orderId: number) {
    const currentUserId = req.user.userId;
    return this.chatService.findOrCreateByOrder(orderId, currentUserId);
  }

  /**
   * Obtener todos los chats del usuario actual
   * GET /chat
   */
  @Get()
  async getMyChats(@Request() req) {
    const userId = req.user.userId;
    return this.chatService.getUserChats(userId);
  }

  /**
   * Obtener un chat específico por ID
   * GET /chat/:id
   */
  @Get(':id')
  async getChatById(@Request() req, @Param('id', ParseIntPipe) chatId: number) {
    const userId = req.user.userId;
    return this.chatService.getChatById(chatId, userId);
  }

  /**
   * Obtener mensajes de un chat
   * GET /chat/:id/messages
   */
  @Get(':id/messages')
  async getChatMessages(
    @Request() req,
    @Param('id', ParseIntPipe) chatId: number,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    
    return this.chatService.getChatMessages(chatId, userId, limitNum, offsetNum);
  }

  /**
   * Enviar un mensaje (REST fallback si WebSocket falla)
   * POST /chat/message
   */
  @Post('message')
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    const senderId = req.user.userId;
    return this.chatService.sendMessage(senderId, dto);
  }

  /**
   * Marcar mensajes como leídos
   * PATCH /chat/:id/read
   */
  @Patch(':id/read')
  async markAsRead(@Request() req, @Param('id', ParseIntPipe) chatId: number) {
    const userId = req.user.userId;
    await this.chatService.markAsRead(chatId, userId);
    return { message: 'Mensajes marcados como leídos' };
  }
}
