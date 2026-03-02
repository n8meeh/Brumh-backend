import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Negotiation } from './entities/negotiation.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { NegotiationsGateway } from './negotiations.gateway';

@Injectable()
export class NegotiationsService {
  constructor(
    @InjectRepository(Negotiation) private negotiationsRepository: Repository<Negotiation>,
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @Inject(forwardRef(() => NegotiationsGateway)) private gateway: NegotiationsGateway,
  ) { }

  /**
   * Verifica si un usuario es participante de la orden (cliente, dueño o staff del negocio)
   */
  private async isOrderParticipant(userId: number, order: Order): Promise<boolean> {
    // Es cliente
    if (order.clientId === userId) return true;
    // Es dueño del negocio
    if (order.provider && order.provider.userId === userId) return true;
    // Es staff del negocio
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (user?.providerId && order.provider && user.providerId === order.provider.id) return true;
    return false;
  }

  // 1. ENVIAR MENSAJE
  async sendMessage(userId: number, dto: CreateMessageDto) {
    const order = await this.ordersRepository.findOne({
      where: { id: dto.orderId },
      relations: ['provider', 'provider.user', 'client']
    });

    if (!order) throw new NotFoundException('Orden no encontrada');

    const canAccess = await this.isOrderParticipant(userId, order);
    if (!canAccess) throw new ForbiddenException('Sin permiso');

    const newMessage = this.negotiationsRepository.create({
      orderId: dto.orderId,
      authorId: userId,
      message: dto.message,
      proposedPrice: dto.proposedPrice || undefined,
      proposedDate: dto.proposedDate ? new Date(dto.proposedDate) : undefined,
      proposedIsHomeService: dto.proposedIsHomeService,
    });

    const saved = await this.negotiationsRepository.save(newMessage);

    // Cargar con autor para emitir objeto completo por WebSocket
    const savedWithAuthor = await this.negotiationsRepository.findOne({
      where: { id: saved.id },
      relations: ['author'],
      select: {
        id: true,
        message: true,
        proposedPrice: true,
        createdAt: true,
        author: { id: true, fullName: true, avatarUrl: true, role: true },
      },
    });

    // Emitir en tiempo real a todos los participantes de la orden
    this.gateway.emitNewMessage(dto.orderId, savedWithAuthor);

    return savedWithAuthor;
  }

  // 2. VER HISTORIAL
  async getChatHistory(userId: number, orderId: number) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['provider', 'provider.user'],
    });
    if (!order) throw new NotFoundException('Orden no encontrada');

    const canAccess = await this.isOrderParticipant(userId, order);
    if (!canAccess) throw new ForbiddenException('Sin permiso');

    // Ahora buscamos los mensajes con el filtro SELECT
    return this.negotiationsRepository.find({
      where: { orderId },
      relations: ['author'],
      select: {
        id: true,
        message: true,
        proposedPrice: true,
        createdAt: true,
        author: {
          id: true,
          fullName: true,
          avatarUrl: true,
          role: true
        }
      },
      order: { createdAt: 'ASC' }
    });
  }

  // 3. ACEPTAR OFERTA
  async acceptOffer(negotiationId: number, userId: number) {
    const negotiation = await this.negotiationsRepository.findOne({ where: { id: negotiationId }, relations: ['order'] });
    if (!negotiation) throw new BadRequestException('Propuesta no encontrada');

    if (negotiation.authorId === userId) {
      throw new BadRequestException('No puedes aceptar tu propia oferta');
    }

    negotiation.order.status = 'accepted';
    negotiation.order.finalPrice = negotiation.proposedPrice;
    
    // Actualizar fecha si fue propuesta en la negociación
    if (negotiation.proposedDate) {
      negotiation.order.scheduledDate = negotiation.proposedDate;
    }
    
    // Actualizar servicio a domicilio si fue propuesto en la negociación
    if (negotiation.proposedIsHomeService !== undefined && negotiation.proposedIsHomeService !== null) {
      negotiation.order.isHomeService = negotiation.proposedIsHomeService;
    }
    
    return await this.ordersRepository.save(negotiation.order);
  }

  // Nota: Borré 'findAllByOrder' porque 'getChatHistory' hace lo mismo y ya lo arreglamos.
  // Si tu controlador usa 'findAllByOrder', cambia el nombre de la función de arriba o cambia el controlador.
}