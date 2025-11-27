import { 
    IsString, 
    IsNotEmpty, 
    IsMongoId, 
    IsNumber, 
    Min, 
    Max, 
    MaxLength 
} from 'class-validator';

/**
 * DTO para la creación de un nuevo comentario o reseña de producto.
 */
export class CreateCommentDto {
    // ⭐️ Contenido del comentario (reseña)
    @IsNotEmpty({ message: 'El texto del comentario es obligatorio.' })
    @IsString({ message: 'El texto debe ser una cadena de texto.' })
    @MaxLength(1000, { message: 'El comentario no puede exceder los 1000 caracteres.' })
    text: string;

    // ⭐️ Calificación (Rating)
    @IsNotEmpty({ message: 'La calificación es obligatoria.' })
    @IsNumber({}, { message: 'La calificación debe ser un número.' })
    @Min(1, { message: 'La calificación mínima es 1 estrella.' })
    @Max(5, { message: 'La calificación máxima es 5 estrellas.' })
    rating: number;

    // ⭐️ ID del Producto al que se refiere el comentario
    @IsNotEmpty({ message: 'El ID del producto es obligatorio.' })
    @IsMongoId({ message: 'El ID del producto debe ser un ID de Mongo válido.' })
    productId: string;

    // ⭐️ ID del Usuario que realiza el comentario
    // Nota: En un entorno real, este ID se obtendría del token de autenticación (JWT) y no del cuerpo (Body)
    @IsNotEmpty({ message: 'El ID del usuario es obligatorio.' })
    @IsMongoId({ message: 'El ID del usuario debe ser un ID de Mongo válido.' })
    userId: string;
}