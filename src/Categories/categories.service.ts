import { 
  Injectable, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../schemas/category.schema';
import { Product } from '../schemas/Product.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createCategoryDto: any): Promise<Category> {
    const existingCategory = await this.categoryModel.findOne({
      name: createCategoryDto.name
    });
    
    if (existingCategory) {
      throw new ConflictException('Category name already exists');
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
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: any): Promise<Category> {
    if (updateCategoryDto.name) {
      const existingCategory = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();
    
    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }
    return updatedCategory;
  }

  async remove(id: string): Promise<Category> {
    const productsCount = await this.productModel.countDocuments({ 
      category: id 
    });
    
    if (productsCount > 0) {
      throw new ConflictException(
        'Cannot delete category with associated products'
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

  async getCategoryProducts(id: string): Promise<any> {
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const products = await this.productModel
      .find({ category: id })
      .populate('category')
      .exec();

    return {
      category,
      products,
      count: products.length
    };
  }
}