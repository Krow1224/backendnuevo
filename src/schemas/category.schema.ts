import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Product } from './Product.schema'; // ⚠️ Importa el Product Schema


export type CategoriaDocument = Category & Document;

@Schema({ timestamps: true })
export class Category { 
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop()
  image: string;

  @Prop({ default: true })
  isActive: boolean;

  // Contador de productos (para categorías estáticas, como lo tenías)
  @Prop({ default: 0 })
  productCount: number;

  // ⭐️ CAMPO CLAVE: Referencia a la colección de Productos (para categorías dinámicas como 'Más Vendidos')
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  products: Types.ObjectId[]; 
}

export const CategorySchema = SchemaFactory.createForClass(Category);