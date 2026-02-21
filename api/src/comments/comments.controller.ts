import { Controller, Post, Body, Get, Param, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SolveCommentDto } from './dto/solve-comment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Request() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(req.user.userId, createCommentDto);
  }
  @Get()
  findAll(@Query('postId') postId: string) {
    return this.commentsService.findAll(+postId);
  }


  @Patch(':id/solve')
  async solve(
    @Param('id') commentId: string,
    @Body() solveDto: SolveCommentDto // ✅ Usamos el DTO para validar el body
  ) {
    return this.commentsService.markAsSolution(solveDto.userId, +commentId);
  }

  @Get('post/:postId')
  findAllByPost(@Param('postId') postId: string) {
    return this.commentsService.findAllByPost(+postId);
  }
}