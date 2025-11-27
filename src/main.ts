import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(
    { origin: ['http://localhost:4000', 'http://localhost:3000'] }
  ); // Configuración de CORS para conectar el back y front, es decir los puertos


  app.useGlobalPipes(
    new ValidationPipe({
      // Opciones comunes
      whitelist: true, // Ignora propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza un error si hay propiedades no permitidas
      transform: true, // Asegura que el DTO se instancie correctamente
    }),
  );

  await app.listen(process.env.PORT ?? 4000);
}

bootstrap();
