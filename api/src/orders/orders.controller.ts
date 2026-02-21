import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  // 1. TALLER ENVÍA PROPUESTA
  @Post('proposal')
  createProposal(@Request() req, @Body() createProposalDto: CreateProposalDto) {
    return this.ordersService.createProposal(req.user.userId, createProposalDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    // Pasamos el ID del usuario (Cliente) como primer argumento
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  // 2. OBTENER MIS ÓRDENES (Con soporte para staff)
  @Get('my-orders')
  getMyOrders(@Request() req, @Query('role') role: 'client' | 'provider') {
    // Si no se especifica rol, usar 'client' por defecto
    const userRole = role || 'client';
    return this.ordersService.getMyOrders(req.user.userId, userRole);
  }

  // 3. MIS PEDIDOS (Como Cliente) - LEGACY - Mantenido por compatibilidad
  @Get('client/my-orders')
  findAllByClient(@Request() req) {
    return this.ordersService.findAllByClient(req.user.userId);
  }

  // 4. PEDIDOS RECIBIDOS (Como Taller)
  // Primero buscamos el ID del taller usando el ID del usuario
  // (Nota: Esto requiere lógica extra, por ahora lo simplificamos)
  // @Get('received') ...

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, req.user.userId, updateOrderDto);
  }
}