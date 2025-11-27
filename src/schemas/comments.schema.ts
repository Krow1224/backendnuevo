import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './Users.schema';
import { Product } from './Product.schema';

@Schema({ timestamps: true })
export class Comment extends Document {
  @Prop({ type: String, required: true, trim: true, maxlength: 500 })
  content: string;

  @Prop({ type: Number, required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);