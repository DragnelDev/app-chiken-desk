import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado } from '../../common/enums';
import { UsuarioEntity } from '../usuarios/entities/usuario.entity';
import { CreateRolDto, UpdateRolDto } from './dto/create-rol.dto';
import { RolEntity } from './entities/rol.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RolEntity) private readonly repo: Repository<RolEntity>,
    @InjectRepository(UsuarioEntity)
    private readonly usuariosRepo: Repository<UsuarioEntity>,
  ) {}

  async create(dto: CreateRolDto): Promise<RolEntity> {
    await this.validarNombreLibre(dto.nombre);
    return this.repo.save(
      this.repo.create({ ...dto, nombre: dto.nombre.trim() }),
    );
  }

  findAll(): Promise<RolEntity[]> {
    return this.repo.find({
      where: { estado: Estado.ACTIVO },
      order: { idRol: 'ASC' },
    });
  }

  async findOne(idRol: number): Promise<RolEntity> {
    const rol = await this.repo.findOne({
      where: { idRol, estado: Estado.ACTIVO },
    });
    if (!rol) throw new NotFoundException(`Rol ${idRol} no encontrado`);
    return rol;
  }

  async update(idRol: number, dto: UpdateRolDto): Promise<RolEntity> {
    const rol = await this.findOne(idRol);
    if (
      dto.nombre &&
      dto.nombre.trim().toLowerCase() !== rol.nombre.toLowerCase()
    ) {
      await this.validarNombreLibre(dto.nombre);
    }
    Object.assign(rol, { ...dto, nombre: dto.nombre?.trim() ?? rol.nombre });
    return this.repo.save(rol);
  }

  async remove(idRol: number): Promise<void> {
    const rol = await this.findOne(idRol);
    const enUso = await this.usuariosRepo.count({
      where: { idRol, estado: Estado.ACTIVO },
    });
    if (enUso > 0) {
      throw new ConflictException(
        `El rol tiene ${enUso} usuario(s) activo(s) asignados`,
      );
    }
    rol.estado = Estado.BORRADO; // borrado lógico
    await this.repo.save(rol);
  }

  private async validarNombreLibre(nombre: string): Promise<void> {
    const existe = await this.repo
      .createQueryBuilder('r')
      .where('LOWER(r.nombre) = LOWER(:nombre)', { nombre: nombre.trim() })
      .andWhere('r.estado = :e', { e: Estado.ACTIVO })
      .getExists();
    if (existe) throw new ConflictException(`Ya existe el rol "${nombre}"`);
  }
}
