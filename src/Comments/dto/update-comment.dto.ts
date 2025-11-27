import { 
    IsString, 
    IsOptional, 
    IsNumber, 
    Min, 
    Max, 
    MaxLength 
} from 'class-validator';

/**
 * DTO para la actualización parcial de un comentario existente.
 * Todos los campos son opcionales.
 */
export class UpdateCommentDto {
    // ⭐️ Contenido del comentario (reseña)
    @IsOptional()
    @IsString({ message: 'El texto debe ser una cadena de texto.' })
    @MaxLength(1000, { message: 'El comentario no puede exceder los 1000 caracteres.' })
    text?: string;

    // ⭐️ Calificación (Rating)
    @IsOptional()
    @IsNumber({}, { message: 'La calificación debe ser un número.' })
    @Min(1, { message: 'La calificación mínima es 1 estrella.' })
    @Max(5, { message: 'La calificación máxima es 5 estrellas.' })
    rating?: number;
}