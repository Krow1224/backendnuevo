import { 
  Injectable, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // ⭐️ Importamos Types para lógica dinámica
import { Category } from '../schemas/category.schema';
import { Product } from '../schemas/Product.schema';
import { CreateCategoryDto } from "src/Categories/dto/create-category.dto"; // ⭐️ Importamos DTOs
import { UpdateCategoryDto } from 'src/Categories/dto/update-category-dto'; // ⭐️ Importamos DTOs


@Injectable()
export class CategoriesService {
  constructor(
      // ⭐️ Ajuste 1: Usamos Model<Category> y Model<Product>
      @InjectModel(Category.name) private categoryModel: Model<Category>,
      @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  // ⭐️ CREATE: Tipado con CreateCategoryDto
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name
    });
    
    if (existingCategory) {
      throw new ConflictException(`El nombre de categoría '${createCategoryDto.name}' ya existe.`);
    }

    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada.`);
    }
    return category;
  }

  // ⭐️ UPDATE: Tipado con UpdateCategoryDto
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        throw new ConflictException(`El nombre de categoría '${updateCategoryDto.name}' ya existe.`);
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    
    if (!updatedCategory) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada para actualizar.`);
    }
    return updatedCategory;
  }

  async remove(id: string): Promise<Category> {
    const productsCount = await this.productModel.countDocuments({ 
      category: id 
    });
    
    if (productsCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la categoría con ID ${id} porque tiene ${productsCount} productos asociados.`
      );
    }

    const deletedCategory = await this.categoryModel
      .findByIdAndDelete(id)
      .exec();
    
    if (!deletedCategory) {
      throw new NotFoundException('Category not found');
    }
    return deletedCategory;
  }
    
  // ⭐️ GET CATEGORY PRODUCTS: Soporte para ID o Nombre (Dinámicas)
  async getCategoryProducts(id: string): Promise<any> {
    const isObjectId = Types.ObjectId.isValid(id); // Verificamos si es un ObjectId
    
    // Si no es un ObjectId válido, buscamos por nombre (para categorías dinámicas)
    const query = isObjectId ? { _id: id } : { name: id };
    
    const category = await this.categoryModel.findOne(query).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    let products: Product[] = [];
    
    if (category.products && category.products.length > 0) {
        // Lógica para categorías dinámicas (ej: Más Vendidos usa el array 'products')
        products = await this.productModel
            .find({ _id: { $in: category.products } })
            .populate('category')
            .exec();
    } else {
        // Lógica para categorías estáticas (busca productos que referencian a esta categoría)
        products = await this.productModel
            .find({ category: category._id })
            .populate('category')
            .exec();
    }

    return {
      category,
      products,
      count: products.length
    };
  }
    
    // ⭐️ MÉTODO DINÁMICO: ACTUALIZAR MAS VENDIDOS
    async actualizarCategoriaMasVendidos(): Promise<Category> {
        const productosMasVendidos = await this.productModel
            .find()
            .sort({ ventas: -1 }) // Ordena de mayor a menor número de ventas
            .limit(10)
            .select('_id')
            .exec();

        const productosIds = productosMasVendidos.map(p => p._id);

        return this.categoryModel.findOneAndUpdate(
            { name: 'Más Vendidos' },
            { 
                $set: { 
                    products: productosIds,
                    description: 'Los 10 productos más populares de la tienda, actualizados dinámicamente.',
                    productCount: productosIds.length
                } 
            },
            { new: true, upsert: true } // Upsert: crea si no existe
        ).exec();
    }

    // ⭐️ MÉTODO DINÁMICO: ACTUALIZAR PRECIOS BAJOS
    async actualizarCategoriaPreciosBajos(): Promise<Category> {
        const productosBajos = await this.productModel
            .find()
            .sort({ precio: 1 }) // Ordena de menor a mayor precio
            .limit(10)
            .select('_id')
            .exec();

        const productosIds = productosBajos.map(p => p._id);

        return this.categoryModel.findOneAndUpdate(
            { name: 'Precios Más Bajos' },
            { 
                $set: { 
                    products: productosIds,
                    description: 'Una selección de los productos más económicos, actualizados dinámicamente.',
                    productCount: productosIds.length
                } 
            },
            { new: true, upsert: true }
        ).exec();
    }
}