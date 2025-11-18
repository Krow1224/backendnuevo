import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from '../schemas/comments.schema';
import { Product, ProductSchema } from '../schemas/Product.schema'; 
import { User, UserSchema } from '../schemas/Users.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([ 
      { name: Comment.name, schema: CommentSchema },
      { name: Product.name, schema: ProductSchema }, 
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService]
})
export class CommentsModule {}