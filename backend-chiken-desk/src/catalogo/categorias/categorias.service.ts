import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from '../../common/enums';
import { ProductoEntity } from '../productos/entities/producto.entity';
import {
  CreateCategoriaDto,
  UpdateCategoriaDto,
} from './dto/create-categoria.dto';
import { CategoriaEntity } from './entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(CategoriaEntity)
    private readonly repo: Repository<CategoriaEntity>,
    @InjectRepository(ProductoEntity)
    private readonly productosRepo: Repository<ProductoEntity>,
  ) {}

  async create(dto: CreateCategoriaDto): Promise<CategoriaEntity> {
    await this.validarNombreLibre(dto.nombre);
    return this.repo.save(
      this.repo.create({ ...dto, nombre: dto.nombre.trim() }),
    );
  }

  findAll(): Promise<CategoriaEntity[]> {
    return this.repo.find({
      where: { estado: Estado.ACTIVO },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(idCategoria: number): Promise<CategoriaEntity> {
    const categoria = await this.repo.findOne({
      where: { idCategoria, estado: Estado.ACTIVO },
    });
    if (!categoria)
      throw new NotFoundException(`Categoría ${idCategoria} no encontrada`);
    return categoria;
  }

  async update(
    idCategoria: number,
    dto: UpdateCategoriaDto,
  ): Promise<CategoriaEntity> {
    const categoria = await this.findOne(idCategoria);
    if (
      dto.nombre &&
      dto.nombre.trim().toLowerCase() !== categoria.nombre.toLowerCase()
    ) {
      await this.validarNombreLibre(dto.nombre);
    }
    Object.assign(categoria, {
      ...dto,
      nombre: dto.nombre?.trim() ?? categoria.nombre,
    });
    return this.repo.save(categoria);
  }

  async remove(idCategoria: number): Promise<void> {
    const categoria = await this.findOne(idCategoria);
    const productos = await this.productosRepo.count({
      where: { idCategoria, estado: Estado.ACTIVO },
    });
    if (productos > 0) {
      throw new ConflictException(
        `La categoría tiene ${productos} producto(s) activo(s)`,
      );
    }
    categoria.estado = Estado.BORRADO;
    await this.repo.save(categoria);
  }

  private async validarNombreLibre(nombre: string): Promise<void> {
    const existe = await this.repo
      .createQueryBuilder('c')
      .where('LOWER(c.nombre) = LOWER(:nombre)', { nombre: nombre.trim() })
      .andWhere('c.estado = :e', { e: Estado.ACTIVO })
      .getExists();
    if (existe)
      throw new ConflictException(`Ya existe la categoría "${nombre}"`);
  }
}
