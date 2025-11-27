import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment, CommentSchema } from '../schemas/comments.schema';
import { Product, ProductSchema } from '../schemas/Product.schema'; 
import { User, UserSchema } from '../schemas/Users.schema'; 
import { ProductsModule } from 'src/Products/Products.module';


const MongooseFeature = MongooseModule.forFeature([ 
  { name: Comment.name, schema: CommentSchema },
  { name: Product.name, schema: ProductSchema }, 
  { name: User.name, schema: UserSchema },
]);

@Module({
  imports: [
    MongooseFeature,
    forwardRef(() => ProductsModule),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService, MongooseFeature]
})
export class CommentsModule {}