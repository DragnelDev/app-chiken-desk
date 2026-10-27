import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { CategoriaEntity } from './entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaEntity, ProductoEntity])],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [CategoriasService],
})
export class CategoriasModule {}
