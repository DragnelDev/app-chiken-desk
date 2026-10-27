import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Estado } from '../../common/enums';
import { RolEntity } from '../roles/entities/rol.entity';
import { UsuarioEntity } from './entities/usuario.entity';

const USUARIO_INICIAL = 'admin';
const PASSWORD_INICIAL = 'Admin123*';
const CI_INICIAL = '0000000';
const BCRYPT_ROUNDS = 10;

@Injectable()
export class UsuarioInicialService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsuarioInicialService.name);

  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuariosRepo: Repository<UsuarioEntity>,
    @InjectRepository(RolEntity)
    private readonly rolesRepo: Repository<RolEntity>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const usuarioExistente = await this.usuariosRepo
      .createQueryBuilder('usuario')
      .where('LOWER(usuario.usuario) = LOWER(:nombre)', {
        nombre: USUARIO_INICIAL,
      })
      .andWhere('usuario.estado = :estado', { estado: Estado.ACTIVO })
      .getOne();

    if (usuarioExistente) return;

    let rolAdmin = await this.rolesRepo
      .createQueryBuilder('rol')
      .where('LOWER(rol.nombre) = LOWER(:nombre)', { nombre: 'ADMIN' })
      .andWhere('rol.estado = :estado', { estado: Estado.ACTIVO })
      .getOne();

    if (!rolAdmin) {
      rolAdmin = await this.rolesRepo.save(
        this.rolesRepo.create({
          nombre: 'ADMIN',
          descripcion: 'Administrador del sistema',
          usuarioRegistro: 'sistema',
        }),
      );
    }

    await this.usuariosRepo.save(
      this.usuariosRepo.create({
        idRol: rolAdmin.idRol,
        nombres: 'Administrador',
        apellidos: 'Sistema',
        ci: CI_INICIAL,
        usuario: USUARIO_INICIAL,
        passwordHash: await bcrypt.hash(PASSWORD_INICIAL, BCRYPT_ROUNDS),
        estado: Estado.ACTIVO,
        usuarioRegistro: 'sistema',
      }),
    );

    this.logger.warn(
      'Se creó el usuario inicial admin. Cambia la contraseña Admin123* después del primer inicio de sesión.',
    );
  }
}
