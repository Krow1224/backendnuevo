import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

/**
 * DTO para la actualización de una categoría existente.
 * Hereda todas las validaciones de CreateCategoryDto, 
 * pero hace que todos los campos sean opcionales (PartialType).
 */
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}