import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolEntity } from '../roles/entities/rol.entity';
import { UsuarioEntity } from './entities/usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { UsuarioInicialService } from './usuario-inicial.service';

@Module({
  imports: [TypeOrmModule.forFeature([UsuarioEntity, RolEntity])],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuarioInicialService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
