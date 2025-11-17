import { Module } from '@nestjs/common';
import {ProductsModule} from './Products/Products.module'
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './Users/Users.module';
import { CartModule } from './Car/Cart.module';
import { CategoriesModule } from './Categories/categories.module';
//importar la clase products module del archivo products.module.ts, cart.module y users.module

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost/mi_base'), ProductsModule,UsersModule,CartModule,CategoriesModule],
  
  
})
export class AppModule {}
