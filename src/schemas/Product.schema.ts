import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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
        min: 0,
        max: 5
    })
    calificacion: number;

    @Prop({
        required: true,
    })
    comentarios: string;

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
}

export const ProductSchema = SchemaFactory.createForClass(Product);