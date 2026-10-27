import { Module } from '@nestjs/common';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { EmpleadosModule } from './empleados/empleados.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RolesModule } from './roles/roles.module';
import { RoleEntity } from './roles/entities/role.entity';
import { EmpleadoEntity } from './empleados/entities/empleado.entity';
import { UsuarioEntity } from './usuarios/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [
    EmpleadosModule,
    UsuariosModule,
    RolesModule,
    TypeOrmModule.forFeature([RoleEntity, EmpleadoEntity, UsuarioEntity]),
  ],
  exports: [UsuariosModule],
})
export class SeguridadModule {}
