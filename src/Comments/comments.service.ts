import { 
    Injectable, 
    NotFoundException, 
    BadRequestException, 
    ConflictException, forwardRef, Inject
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from '../schemas/comments.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Product } from 'src/schemas/Product.schema'; // Asumimos que existe
import { ProductsService } from 'src/Products/Products.service';

@Injectable()
export class CommentsService {
    constructor(
        // Inyectamos el modelo de Comment
        @InjectModel(Comment.name) private commentModel: Model<Comment>,
        // Inyectamos el modelo de Product para actualizar la calificación promedio
        @InjectModel(Product.name) private productModel: Model<Product>,

        @Inject(forwardRef(() => ProductsService))
        private readonly productsService: ProductsService,
    ) {}

    // Función auxiliar para actualizar la calificación promedio de un producto
    private async updateProductRating(productId: string) {
        // 1. Calcular el promedio de calificaciones para el producto
        const result = await this.commentModel.aggregate([
            { $match: { productId: new Types.ObjectId(productId) } },
            { 
                $group: {
                    _id: '$productId',
                    averageRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                } 
            }
        ]).exec();

        // 2. Extraer el promedio y la cuenta
        const ratingData = result[0] || { averageRating: 0, count: 0 };
        const newRating = parseFloat(ratingData.averageRating.toFixed(1)); // Redondeamos a 1 decimal

        // 3. Actualizar el producto
        await this.productModel.findByIdAndUpdate(
            productId,
            { 
                rating: newRating,
                ratingCount: ratingData.count
            }
        ).exec();
    }

    // ⭐️ CREATE: Crea un nuevo comentario y actualiza el rating del producto
    async create(productId: string, 
        content: string, 
        rating: number, 
        userId: string): Promise<Comment> {
            if (!Types.ObjectId.isValid(productId)) {
            throw new NotFoundException(`ID de producto inválido: ${productId}`);
        }
        const product = await this.productModel.findById(productId).exec();
        if (!product) {
            throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
        }

        // 2. Crear y guardar el comentario en la colección 'comments'
        const newComment = new this.commentModel({
            content: content,
            rating: rating,
            // Convertir userId a ObjectId
            user: new Types.ObjectId(userId), 
            productId: new Types.ObjectId(productId), 
        });

        const savedComment = await newComment.save();

        await this.productsService.linkCommentToProduct(
            productId, 
            savedComment._id as Types.ObjectId
        );

        return savedComment;


    

        
    }

    // ⭐️ Búsqueda por Producto: Obtiene todos los comentarios de un producto
    async findByProduct(productId: string): Promise<Comment[]> {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException(`El ID de producto '${productId}' no es válido.`);
        }
        
        return this.commentModel
            .find({ productId: productId })
            // Opcional: Si tienes un modelo de Usuario, puedes hacer populate aquí
            // .populate('userId', 'name email') 
            .sort({ createdAt: -1 }) // Comentarios más recientes primero
            .exec();
    }

    // ⭐️ Búsqueda por Usuario: Obtiene todos los comentarios hechos por un usuario
    async findByUser(userId: string): Promise<Comment[]> {
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestException(`El ID de usuario '${userId}' no es válido.`);
        }
        
        return this.commentModel
            .find({ userId: userId })
            // Opcional: Si quieres mostrar el nombre del producto en la lista de comentarios del usuario
            // .populate('productId', 'name slug') 
            .sort({ createdAt: -1 })
            .exec();
    }

    // ⭐️ UPDATE: Actualiza un comentario existente
    async update(id: string, updateCommentDto: UpdateCommentDto): Promise<Comment> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`El ID de comentario '${id}' no es válido.`);
        }
        
        const updatedComment = await this.commentModel
            .findByIdAndUpdate(id, updateCommentDto, { new: true })
            .exec();

        if (!updatedComment) {
            throw new NotFoundException(`Comentario con ID ${id} no encontrado.`);
        }

        // ⭐️ Actualiza la calificación promedio del producto después de la modificación
        await this.updateProductRating(updatedComment.productId.toString());

        return updatedComment;
    }

    // ⭐️ REMOVE: Elimina un comentario
    async remove(id: string): Promise<Comment> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException(`El ID de comentario '${id}' no es válido.`);
        }

        const deletedComment = await this.commentModel.findByIdAndDelete(id).exec();

        if (!deletedComment) {
            throw new NotFoundException(`Comentario con ID ${id} no encontrado para eliminar.`);
        }

        // ⭐️ Actualiza la calificación promedio del producto después de la eliminación
        await this.updateProductRating(deletedComment.productId.toString());

        return deletedComment;
    }

    // ⭐️ GET PRODUCT RATING: Obtiene la calificación promedio de un producto (redundante si se mantiene en el Product schema, pero útil)
    async getProductRating(productId: string): Promise<{ averageRating: number, count: number }> {
        if (!Types.ObjectId.isValid(productId)) {
            throw new BadRequestException(`El ID de producto '${productId}' no es válido.`);
        }
        
        // Simplemente consulta el producto para obtener la calificación precalculada
        const product = await this.productModel.findById(productId).exec();

        if (!product) {
            throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
        }
        
        return { 
            averageRating: product.rating, 
            count: product.ratingCount 
        };
    }

     async getCommentsByProductId(productId: string): Promise<Comment[]> {
        if (!Types.ObjectId.isValid(productId)) {
            return [];
        }
        return this.commentModel.find({ productId: new Types.ObjectId(productId), isActive: true })
                                .populate('user', 'nombre email')
                                .exec();
    }

}