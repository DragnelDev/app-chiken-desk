import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { ImagenProductoEntity } from './entities/imagen-producto.entity';
import { ImagenesProductoController } from './imagenes-producto.controller';
import { ImagenesProductoService } from './imagenes-producto.service';

@Module({
  imports: [TypeOrmModule.forFeature([ImagenProductoEntity, ProductoEntity])],
  controllers: [ImagenesProductoController],
  providers: [ImagenesProductoService],
})
export class ImagenesProductoModule {}
