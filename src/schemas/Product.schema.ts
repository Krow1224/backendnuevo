import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';



@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true, trim: true })
    usuario: string; // Nombre de usuario o ID

    @Prop({ required: true, min: 1, max: 5 })
    calificacion: number; // Puntuación individual del comentario (1 a 5)

    @Prop({ required: true, trim: true })
    texto: string;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

export type ProductoDocument = Product & Document;

@Schema({
    timestamps: true
})


export class Product extends Document {
    @Prop({
        unique: true,
        required: true,
        trim: true
    })
    nombre: string;

    @Prop({
        required: true,
        unique: false,
        min: 0,
        max: 5
    })
    calificacion: number;

    @Prop({
        required: true,
    })
    comentarios: string;

    @Prop({ type: [CommentSchema], default: [] }) 
    reviews: Comment[];

    @Prop({
        required: true,
        default: 0
    })
    ventas: number;

    @Prop({
        required: true,
        min: 0
    })
    precio: number;

    @Prop({
        required: true,
        min: 0
    })
    stock: number;

    @Prop({ type: Types.ObjectId, ref: 'Category' })
    category: Types.ObjectId;

    @Prop({ default: 0, min: 0, max: 5 })
    rating: number; // El promedio de todas las calificaciones (1-5)

    // ⭐️ CAMPO DE CONTEO DE CALIFICACIONES (Actualizado por CommentsService)
    @Prop({ default: 0, min: 0 })
    ratingCount: number; // La cantidad total de reseñas recibidas
}

export const ProductSchema = SchemaFactory.createForClass(Product);