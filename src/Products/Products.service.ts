import { Injectable, NotFoundException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from 'src/schemas/Product.schema';
import { Category } from 'src/schemas/category.schema';
import { Model } from 'mongoose';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productmodel: Model<Product>,
    @InjectModel(Category.name) private categorymodel: Model<Category>,
  ) {}

  async obtenertodomong() {
    const data = await this.productmodel.find().populate('category');
    console.log(data);
    return data;
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