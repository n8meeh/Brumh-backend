import { Controller, Post, Body, Get, Param, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplyReviewDto } from './dto/reply-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  // Crear Review (Cliente)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.userId, createReviewDto);
  }

  @Get()
  findAll(@Query('providerId') providerId?: string) {
    // Convertimos el string a número si viene el parámetro
    const id = providerId ? +providerId : undefined;
    return this.reviewsService.findAll(id);
  }

  // Responder Review (Taller) -> Usamos PATCH porque actualizamos una review existente
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/reply')
  reply(@Request() req, @Param('id') id: string, @Body() replyDto: ReplyReviewDto) {
    return this.reviewsService.reply(+id, req.user.userId, replyDto);
  }

  // Ver Reviews (Público)
  @Get('provider/:id')
  findAllByProvider(@Param('id') id: string) {
    return this.reviewsService.findAllByProvider(+id);
  }
}