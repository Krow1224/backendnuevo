import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment } from '../schemas/comments.schema';
import { Product } from '../schemas/Product.schema';
import { User } from '../schemas/Users.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createCommentDto: any): Promise<Comment> {
    // Verificar que el producto existe
    const product = await this.productModel.findById(createCommentDto.product);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verificar que el usuario existe
    const user = await this.userModel.findById(createCommentDto.user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const createdComment = new this.commentModel(createCommentDto);
    return createdComment.save();
  }

  async findByProduct(productId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ product: productId, isActive: true })
      .populate('user', 'nombre correo')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Comment[]> {
    return this.commentModel
      .find({ user: userId, isActive: true })
      .populate('product', 'nombre precio')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateCommentDto: any): Promise<Comment> {
    const updatedComment = await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .populate('user', 'nombre')
      .populate('product', 'nombre')
      .exec();

    if (!updatedComment) {
      throw new NotFoundException('Comment not found');
    }

    return updatedComment;
  }

  async remove(id: string): Promise<Comment> {
    const deletedComment = await this.commentModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!deletedComment) {
      throw new NotFoundException('Comment not found');
    }

    return deletedComment;
  }

  async getProductRating(productId: string): Promise<number> {
    const result = await this.commentModel.aggregate([
      { $match: { product: productId, isActive: true } },
      { $group: { _id: '$product', avgRating: { $avg: '$rating' } } }
    ]);

    return result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
  }
}