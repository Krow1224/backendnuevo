import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductoDocument } from 'src/schemas/Product.schema';
import { Category } from 'src/schemas/category.schema';
import { Model } from 'mongoose';
import { CreateCommentDto } from 'src/Comments/dto/create-comment.dto';
import { Comment, CommentSchema } from 'src/schemas/Product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productmodel: Model<Product>,
    @InjectModel(Category.name) private categorymodel: Model<Category>,
    @InjectModel(Product.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(Comment.name) private readonly comentarioModel: Model<Comment>,
  ) {}

  async obtenertodomong() {
    const data = await this.productmodel.find().populate('category');
    console.log(data);
    return data;
  }

  async linkCommentToProduct(productId: string, commentId: Types.ObjectId): Promise<Product> {
        if (!Types.ObjectId.isValid(productId)) {
            throw new NotFoundException(`ID de producto inválido: ${productId}`);
        }
        
        // Usamos findOneAndUpdate para hacer el push
        const updatedProduct = await this.productoModel.findOneAndUpdate(
            { _id: productId },
            {
                // $push añade el ID del comentario al array
                $push: {
                    reviews: commentId, 
                },
            },
            { new: true } // Devuelve el documento actualizado
        ).exec();

        if (!updatedProduct) {
            throw new NotFoundException(`Producto con ID ${productId} no encontrado.`);
        }

        return updatedProduct;
    }

    async unlinkCommentFromProduct(productId: string, commentId: Types.ObjectId): Promise<void> {
        if (!Types.ObjectId.isValid(productId)) {
            // Podrías lanzar o solo registrar, pero para esta función, solo actualizamos.
            console.error(`Error: Intentando desenlazar de un ID de producto inválido: ${productId}`);
            return; 
        }

        // Usamos updateOne para hacer el pull
        await this.productoModel.updateOne(
            { _id: productId },
            {
                // $pull remueve la referencia del ID del comentario del array 'comentarios'
                $pull: {
                    comentarios: commentId, 
                },
            }
        ).exec();
      }
    

 async agregarComentario(productId: string, comentarioDto: CreateCommentDto): Promise<Product> {
        // 1. Validación básica del ID de Producto
        if (!Types.ObjectId.isValid(productId)) {
            throw new NotFoundException(`ID de producto inválido: ${productId}`);
        }

        // 2. Crear y guardar el nuevo comentario en la colección 'comments'
        // NOTA: Debes mapear los campos del DTO a los campos del Schema (ej: texto -> content)
        const newComment = await this.comentarioModel.create({
            content: comentarioDto.text,
            rating: comentarioDto.rating,
            user: new Types.ObjectId(comentarioDto.userId), // Convertir a ObjectId si el DTO lo pasa como string
            productId: new Types.ObjectId(productId), // Asignar el ID del producto
        });
        
        // 3. Actualizar el producto, añadiendo SOLAMENTE el ID del comentario al array 'comentarios'
        const updatedProduct = await this.productoModel.findOneAndUpdate(
            { _id: productId },
            {
                // Usa el ID del nuevo comentario
                $push: {
                    comentarios: newComment._id, 
                },
            },
            { new: true } // Devuelve el documento después de la actualización
        ).exec();

        if (!updatedProduct) {
            // Si no se encontró el producto, eliminamos el comentario recién creado
            await this.comentarioModel.deleteOne({ _id: newComment._id }); 
            throw new NotFoundException(`Producto con ID ${productId} no encontrado o no se pudo actualizar`);
        }

        return updatedProduct;
    }

  async obtenerundomong(id: string) {
    const dato = await this.productmodel.findById(id).populate('category');
    if (!dato) throw new NotFoundException(`No se encontró producto con ID ${id}`);
    return dato;
  }

  //crear un producto
  async crear(productData: Partial<Product>): Promise<Product> {
    const nuevo = new this.productmodel(productData);
    const savedProduct = await nuevo.save();

    //  ACTUALIZAR CONTADOR DE CATEGORÍA
    if (productData.category) {
      await this.actualizarContadorCategoria(productData.category.toString());
    }

    return savedProduct;
  }

  //actualizar
  async actualizar(id: string, data: Partial<Product>): Promise<Product> {
    const actualizado = await this.productmodel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!actualizado) throw new NotFoundException(`No se pudo actualizar producto con ID ${id}`);

    //  ACTUALIZAR CONTADOR DE CATEGORÍA SI CAMBIA LA CATEGORÍA
    if (data.category) {
      await this.actualizarContadorCategoria(data.category.toString());
    }

    return actualizado;
  }

  // Eliminar producto
  async eliminar(id: string): Promise<Product> {
    const producto = await this.productmodel.findById(id);
    if (!producto) throw new NotFoundException(`No se encontró producto con ID ${id}`);

    const eliminado = await this.productmodel.findByIdAndDelete(id).exec();
    if (!eliminado) throw new NotFoundException(`No se encontró producto con ID ${id}`);

    //  ACTUALIZAR CONTADOR DE CATEGORÍA
    if (producto.category) {
      await this.actualizarContadorCategoria(producto.category.toString());
    }

    return eliminado;
  }

  //  MÉTODO PARA ACTUALIZAR CONTADOR
  private async actualizarContadorCategoria(categoryId: string): Promise<void> {
    const productCount = await this.productmodel.countDocuments({
      category: categoryId
    });
    
    await this.categorymodel.findByIdAndUpdate(
      categoryId,
      { productCount }
    );
  }
}