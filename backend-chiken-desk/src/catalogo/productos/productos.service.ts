import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from '../../common/enums';
import { CategoriaEntity } from '../categorias/entities/categoria.entity';
import {
  AjusteStockDto,
  CreateProductoDto,
  UpdateProductoDto,
} from './dto/create-producto.dto';
import { FiltroProductosDto } from './dto/filtro-productos.dto';
import { ProductoEntity } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(ProductoEntity)
    private readonly repo: Repository<ProductoEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriasRepo: Repository<CategoriaEntity>,
  ) {}

  async create(dto: CreateProductoDto): Promise<ProductoEntity> {
    await this.validarCategoria(dto.idCategoria);
    if (dto.codigoBarra) await this.validarCodigoLibre(dto.codigoBarra);
    const producto = await this.repo.save(
      this.repo.create({ stock: 0, ...dto }),
    );
    return this.findOne(producto.idProducto);
  }

  findAll(filtro: FiltroProductosDto = {}): Promise<ProductoEntity[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.categoria', 'c')
      .where('p.estado = :e', { e: Estado.ACTIVO })
      .orderBy('c.nombre', 'ASC')
      .addOrderBy('p.nombre', 'ASC');

    if (filtro.idCategoria)
      qb.andWhere('p.idCategoria = :cat', { cat: filtro.idCategoria });
    if (filtro.q)
      qb.andWhere('p.nombre ILIKE :q', { q: `%${filtro.q.trim()}%` });
    if (filtro.soloDisponibles) qb.andWhere('p.stock > 0');
    return qb.getMany();
  }

  async findOne(idProducto: number): Promise<ProductoEntity> {
    const producto = await this.repo.findOne({
      where: { idProducto, estado: Estado.ACTIVO },
      relations: { categoria: true },
    });
    if (!producto)
      throw new NotFoundException(`Producto ${idProducto} no encontrado`);
    return producto;
  }

  async findByCodigoBarra(codigoBarra: string): Promise<ProductoEntity> {
    const producto = await this.repo.findOne({
      where: { codigoBarra, estado: Estado.ACTIVO },
      relations: { categoria: true },
    });
    if (!producto)
      throw new NotFoundException('No hay un producto con ese código de barra');
    return producto;
  }

  async update(
    idProducto: number,
    dto: UpdateProductoDto,
  ): Promise<ProductoEntity> {
    const producto = await this.findOne(idProducto);
    if (dto.idCategoria !== undefined)
      await this.validarCategoria(dto.idCategoria);
    if (dto.codigoBarra && dto.codigoBarra !== producto.codigoBarra) {
      await this.validarCodigoLibre(dto.codigoBarra);
    }
    Object.assign(producto, dto);
    delete (producto as Partial<ProductoEntity>).categoria; // el FK manda, no la relación cargada
    await this.repo.save(producto);
    return this.findOne(idProducto);
  }

  /** Reposición / merma manual: suma o resta al stock sin permitir negativos. */
  async ajustarStock(
    idProducto: number,
    dto: AjusteStockDto,
  ): Promise<ProductoEntity> {
    if (dto.cantidad === 0)
      throw new BadRequestException('La cantidad no puede ser 0');
    const producto = await this.findOne(idProducto);
    const nuevo = producto.stock + dto.cantidad;
    if (nuevo < 0) {
      throw new BadRequestException(
        `Stock insuficiente (actual: ${producto.stock})`,
      );
    }
    producto.stock = nuevo;
    delete (producto as Partial<ProductoEntity>).categoria;
    await this.repo.save(producto);
    return this.findOne(idProducto);
  }

  async remove(idProducto: number): Promise<void> {
    const producto = await this.findOne(idProducto);
    producto.estado = Estado.BORRADO;
    delete (producto as Partial<ProductoEntity>).categoria;
    await this.repo.save(producto);
  }

  private async validarCategoria(idCategoria: number): Promise<void> {
    const existe = await this.categoriasRepo.exists({
      where: { idCategoria, estado: Estado.ACTIVO },
    });
    if (!existe)
      throw new BadRequestException(`La categoría ${idCategoria} no existe`);
  }

  private async validarCodigoLibre(codigoBarra: string): Promise<void> {
    const existe = await this.repo.exists({
      where: { codigoBarra, estado: Estado.ACTIVO },
    });
    if (existe)
      throw new ConflictException(
        'Ya existe un producto con ese código de barra',
      );
  }
}
