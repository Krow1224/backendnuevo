import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Body, 
    Param, 
    UsePipes, 
    ValidationPipe // ⭐️ Importamos ValidationPipe
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto'; // ⭐️ Importamos DTOs
import { UpdateCategoryDto } from './dto/update-category-dto'; // ⭐️ Importamos DTOs

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

    // ⭐️ CREATE: Usamos DTO y ValidationPipe para validar la entrada
  @Post()
    @UsePipes(new ValidationPipe({ whitelist: true })) // Asegura que solo se acepten campos definidos
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

    // ⭐️ UPDATE: Usamos DTO y ValidationPipe
  @Put(':id')
    @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Get(':id/products')
  async getCategoryProducts(@Param('id') id: string) {
    return this.categoriesService.getCategoryProducts(id);
  }

    // ⭐️ ENDPOINT DINÁMICO: ACTUALIZAR MAS VENDIDOS
    @Post('/update/mas-vendidos')
    async triggerMasVendidosUpdate() {
        // Llama al método de servicio que recalcula y actualiza la categoría dinámica
        return this.categoriesService.actualizarCategoriaMasVendidos();
    }

    // ⭐️ ENDPOINT DINÁMICO: ACTUALIZAR PRECIOS BAJOS
    @Post('/update/precios-bajos')
    async triggerPreciosBajosUpdate() {
        // Llama al método de servicio que recalcula y actualiza la categoría dinámica
        return this.categoriesService.actualizarCategoriaPreciosBajos();
    }
}