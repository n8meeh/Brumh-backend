import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { User } from '../users/entities/user.entity';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
  ) {}

  /**
   * Crear o obtener un chat entre dos usuarios
   */
  async findOrCreateChat(user1Id: number, user2Id: number): Promise<Chat> {
    if (user1Id === user2Id) {
      throw new BadRequestException('No puedes crear un chat contigo mismo');
    }

    // Ordenar IDs para evitar duplicados (chat entre A-B es igual a B-A)
    const [smallerId, largerId] = user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    // Buscar si ya existe
    let chat = await this.chatRepo.findOne({
      where: [
        { user1Id: smallerId, user2Id: largerId },
        { user1Id: largerId, user2Id: smallerId }
      ],
      relations: ['user1', 'user2']
    });

    // Si no existe, crear nuevo
    if (!chat) {
      // Verificar que ambos usuarios existen
      const user1 = await this.userRepo.findOne({ where: { id: smallerId } });
      const user2 = await this.userRepo.findOne({ where: { id: largerId } });

      if (!user1 || !user2) {
        throw new NotFoundException('Uno o ambos usuarios no existen');
      }

      chat = this.chatRepo.create({
        user1Id: smallerId,
        user2Id: largerId
      });
      chat = await this.chatRepo.save(chat);

      // Cargar relaciones
      const reloadedChat = await this.chatRepo.findOne({
        where: { id: chat.id },
        relations: ['user1', 'user2']
      });
      
      if (!reloadedChat) {
        throw new Error('Error al cargar el chat creado');
      }
      
      return reloadedChat;
    }

    return chat;
  }

  /**
   * Buscar o crear un chat basado en una orden
   * La orden contiene clientId y providerId, lo que permite crear el chat entre ellos
   */
  async findOrCreateByOrder(orderId: number, currentUserId: number): Promise<Chat> {

    // 1. Buscar si ya existe un chat para esta orden
    let chat = await this.chatRepo.findOne({
      where: { orderId },
      relations: ['user1', 'user2', 'order']
    });

    if (chat) {
      
      // Verificar que el usuario actual tiene acceso a este chat
      if (chat.user1Id !== currentUserId && chat.user2Id !== currentUserId) {
        throw new BadRequestException('No tienes acceso a este chat');
      }
      
      return chat;
    }

    // 2. Si no existe, buscar la orden para obtener clientId y providerId
    
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['client', 'provider']
    });

    if (!order) {
      throw new NotFoundException(`Orden ${orderId} no encontrada`);
    }


    // 3. Verificar que el usuario actual es parte de esta orden
    if (order.clientId !== currentUserId && order.providerId !== currentUserId) {
      throw new BadRequestException('No tienes acceso a crear un chat para esta orden');
    }

    // 4. Crear el chat entre cliente y proveedor
    const [smallerId, largerId] = order.clientId < order.providerId 
      ? [order.clientId, order.providerId] 
      : [order.providerId, order.clientId];


    const newChat = this.chatRepo.create({
      user1Id: smallerId,
      user2Id: largerId,
      orderId: orderId,
    });

    chat = await this.chatRepo.save(newChat);

    // Recargar con relaciones
    const reloadedChat = await this.chatRepo.findOne({
      where: { id: chat.id },
      relations: ['user1', 'user2', 'order']
    });

    if (!reloadedChat) {
      throw new Error('Error al cargar el chat creado');
    }

    return reloadedChat;
  }

  /**
   * Obtener todos los chats de un usuario
   */
  async getUserChats(userId: number): Promise<Chat[]> {
    const chats = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.user1', 'user1')
      .leftJoinAndSelect('chat.user2', 'user2')
      .where('chat.user1Id = :userId OR chat.user2Id = :userId', { userId })
      .orderBy('chat.lastMessageAt', 'DESC')
      .getMany();

    return chats;
  }

  /**
   * Obtener mensajes de un chat
   */
  async getChatMessages(chatId: number, userId: number, limit = 50, offset = 0): Promise<Message[]> {
    // Verificar que el usuario pertenece al chat
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('No tienes acceso a este chat');
    }

    const messages = await this.messageRepo.find({
      where: { chatId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset
    });

    return messages.reverse(); // Devolver en orden cronológico
  }

  /**
   * Enviar un mensaje
   */
  async sendMessage(senderId: number, dto: SendMessageDto): Promise<Message> {
    const { chatId, content } = dto;

    // Verificar que el chat existe y el usuario pertenece a él
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    if (chat.user1Id !== senderId && chat.user2Id !== senderId) {
      throw new BadRequestException('No tienes acceso a este chat');
    }

    // Crear mensaje
    const message = this.messageRepo.create({
      chatId,
      senderId,
      content
    });

    const savedMessage = await this.messageRepo.save(message);

    // Actualizar último mensaje del chat
    chat.lastMessage = content.length > 100 ? content.substring(0, 100) + '...' : content;
    chat.lastMessageAt = new Date();

    // Incrementar contador de no leídos del receptor
    if (chat.user1Id === senderId) {
      chat.unreadCountUser2 += 1;
    } else {
      chat.unreadCountUser1 += 1;
    }

    await this.chatRepo.save(chat);

    // Cargar relación sender para devolver completo
    const messageWithSender = await this.messageRepo.findOne({
      where: { id: savedMessage.id },
      relations: ['sender']
    });
    
    if (!messageWithSender) {
      throw new Error('Error al cargar el mensaje guardado');
    }
    
    return messageWithSender;
  }

  /**
   * Marcar mensajes como leídos
   */
  async markAsRead(chatId: number, userId: number): Promise<void> {
    const chat = await this.chatRepo.findOne({ where: { id: chatId } });
    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('No tienes acceso a este chat');
    }

    // Marcar mensajes no leídos como leídos
    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('chatId = :chatId', { chatId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .execute();

    // Resetear contador de no leídos
    if (chat.user1Id === userId) {
      chat.unreadCountUser1 = 0;
    } else {
      chat.unreadCountUser2 = 0;
    }

    await this.chatRepo.save(chat);
  }

  /**
   * Obtener un chat por ID (con verificación de permisos)
   */
  async getChatById(chatId: number, userId: number): Promise<Chat> {
    const chat = await this.chatRepo.findOne({
      where: { id: chatId },
      relations: ['user1', 'user2']
    });

    if (!chat) {
      throw new NotFoundException('Chat no encontrado');
    }

    if (chat.user1Id !== userId && chat.user2Id !== userId) {
      throw new BadRequestException('No tienes acceso a este chat');
    }

    return chat;
  }
}
