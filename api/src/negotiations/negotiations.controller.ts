import { Controller, Post, Body, Get, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { NegotiationsService } from './negotiations.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateMessageDto } from './dto/create-message.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('negotiations')
export class NegotiationsController {
  constructor(private readonly negotiationsService: NegotiationsService) { }

  // 1. Enviar mensaje
  @Post('message')
  sendMessage(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    return this.negotiationsService.sendMessage(req.user.userId, createMessageDto);
  }

  // 2. Ver historial
  @Get('order/:orderId')
  getChatHistory(@Request() req, @Param('orderId') orderId: string) {
    return this.negotiationsService.getChatHistory(req.user.userId, +orderId);
  }

  // 3. Aceptar oferta
  @Patch(':id/accept')
  acceptOffer(@Request() req, @Param('id') id: string) {
    return this.negotiationsService.acceptOffer(+id, req.user.userId);
  }

  // ❌ ELIMINA LOS MÉTODOS VIEJOS (create, findAllByOrder) QUE DAN ERROR
}