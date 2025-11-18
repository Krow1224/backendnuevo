import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: any) {
    return this.commentsService.create(createCommentDto);
  }

  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.commentsService.findByProduct(productId);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string) {
    return this.commentsService.findByUser(userId);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCommentDto: any) {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.commentsService.remove(id);
  }

  @Get('product/:productId/rating')
  async getProductRating(@Param('productId') productId: string) {
    return this.commentsService.getProductRating(productId);
  }
}