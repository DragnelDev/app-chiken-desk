import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Estado } from '../../common/enums';
import { RolEntity } from '../roles/entities/rol.entity';
import { CreateUsuarioDto, UpdateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioEntity } from './entities/usuario.entity';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly repo: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly rolesRepo: Repository<RolEntity>,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<UsuarioEntity> {
    await this.validarRol(dto.idRol);
    await this.validarUnicos(dto.usuario, dto.ci);

    const { password, ...datos } = dto;
    const entidad = this.repo.create({
      ...datos,
      usuario: dto.usuario.trim(),
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
    });
    const guardado = await this.repo.save(entidad);
    return this.findOne(guardado.idUsuario); // recarga sin password_hash
  }

  findAll(): Promise<UsuarioEntity[]> {
    return this.repo.find({
      where: { estado: Estado.ACTIVO },
      relations: { rol: true },
      order: { idUsuario: 'ASC' },
    });
  }

  async findOne(idUsuario: number): Promise<UsuarioEntity> {
    const usuario = await this.repo.findOne({
      where: { idUsuario, estado: Estado.ACTIVO },
      relations: { rol: true },
    });
    if (!usuario) throw new NotFoundException(`Usuario ${idUsuario} no encontrado`);
    return usuario;
  }

  /** Para login: incluye password_hash (que está con select:false). */
  findParaLogin(usuario: string): Promise<UsuarioEntity | null> {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .leftJoinAndSelect('u.rol', 'r')
      .where('LOWER(u.usuario) = LOWER(:usuario)', { usuario: usuario.trim() })
      .andWhere('u.estado = :e', { e: Estado.ACTIVO })
      .andWhere('r.estado = :e', { e: Estado.ACTIVO })
      .getOne();
  }

  /** Para JwtStrategy: confirma que el usuario sigue activo y con su rol vigente. */
  findActivoConRol(idUsuario: number): Promise<UsuarioEntity | null> {
    return this.repo.findOne({
      where: { idUsuario, estado: Estado.ACTIVO, rol: { estado: Estado.ACTIVO } },
      relations: { rol: true },
    });
  }

  async update(idUsuario: number, dto: UpdateUsuarioDto): Promise<UsuarioEntity> {
    const usuario = await this.findOne(idUsuario);

    if (dto.idRol !== undefined) await this.validarRol(dto.idRol);
    if (
      (dto.usuario && dto.usuario.toLowerCase() !== usuario.usuario.toLowerCase()) ||
      (dto.ci && dto.ci !== usuario.ci)
    ) {
      await this.validarUnicos(dto.usuario ?? '', dto.ci ?? '', idUsuario);
    }

    const { password, ...datos } = dto;
    Object.assign(usuario, datos);
    if (password) usuario.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    delete (usuario as Partial<UsuarioEntity>).rol; // evita sobrescribir id_rol con la relación vieja

    await this.repo.save(usuario);
    return this.findOne(idUsuario);
  }

  async remove(idUsuario: number, idUsuarioActual: number): Promise<void> {
    if (idUsuario === idUsuarioActual) {
      throw new BadRequestException('No puedes eliminar tu propio usuario');
    }
    const usuario = await this.findOne(idUsuario);
    usuario.estado = Estado.BORRADO; // borrado lógico
    delete (usuario as Partial<UsuarioEntity>).rol;
    await this.repo.save(usuario);
  }

  private async validarRol(idRol: number): Promise<void> {
    const existe = await this.rolesRepo.exists({
      where: { idRol, estado: Estado.ACTIVO },
    });
    if (!existe) throw new BadRequestException(`El rol ${idRol} no existe`);
  }

  private async validarUnicos(usuario: string, ci: string, excluirId?: number) {
    const qb = this.repo
      .createQueryBuilder('u')
      .where('u.estado = :e', { e: Estado.ACTIVO });
    if (excluirId) qb.andWhere('u.idUsuario <> :id', { id: excluirId });
    qb.andWhere('(LOWER(u.usuario) = LOWER(:usuario) OR u.ci = :ci)', {
      usuario: usuario.trim(),
      ci,
    });
    const repetido = await qb.getOne();
    if (repetido) {
      throw new ConflictException(
        repetido.ci === ci && ci ? 'Ya existe un usuario con ese CI' : 'Ya existe ese nombre de usuario',
      );
    }
  }
}
