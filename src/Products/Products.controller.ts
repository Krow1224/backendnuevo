import {Controller,Get,Post,Delete,Body,Header, Param, Put, UsePipes, ValidationPipe} from '@nestjs/common'
import { ProductsService } from './Products.service';
import type { Response } from 'express';
import { join } from 'path';
import { Product } from 'src/schemas//Product.schema';
import { CreateCommentDto } from 'src/Comments/dto/create-comment.dto';
import { ProductoDocument } from 'src/schemas//Product.schema';


@Controller({})
export class ProductsController  {

    ProductsService:ProductsService;

    constructor(Productsservice:ProductsService){
        this.ProductsService= Productsservice;
    }


    @Get('/products/all')
    async getproductsall(){
      console.log("obteniendo todos los productos")
      const r= await this.ProductsService.obtenertodomong();
      return r;
    }

    @Post(':id/comentarios')
    @UsePipes(new ValidationPipe({ whitelist: true })) // Asegura la validación del DTO
    async addComentario(
        @Param('id') id: string,
        @Body() crearComentarioDto: CreateCommentDto,
    ): Promise<ProductoDocument> {
        return this.ProductsService.agregarComentario(id, crearComentarioDto);
    }

    @Get('/products/id/:id')
    getproductsid(@Param('id') id: string): Promise<Product| null>{

      return this.ProductsService.obtenerundomong(id);
    }

    @Post('/products/add')
    createProduct(@Body() data: Partial<Product>): Promise<Product> {
      return this.ProductsService.crear(data);
    }

    @Put('/products/update/:id')
    updateProduct(@Param('id') id: string, @Body() data: Partial<Product>): Promise<Product>{
      return this.ProductsService.actualizar(id,data)
    }

    @Delete('/products/delete/:id')
    deleteProduct(@Param('id') id: string): Promise<Product> {
    console.log("eliminando")
    return this.ProductsService.eliminar(id);
    }



}

@Controller('/html')
export class HtmlController {
  constructor(private readonly htmlService: ProductsService) {}

  
}