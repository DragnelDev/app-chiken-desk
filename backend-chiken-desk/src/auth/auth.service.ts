import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../seguridad/usuarios/usuarios.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { UsuarioEntity } from '../seguridad/usuarios/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    pass: string,
  ): Promise<Omit<UsuarioEntity, 'password_hash'> | null> {
    const usuario = await this.usuariosService.findByUsuario(username);

    if (usuario && (await bcrypt.compare(pass, usuario.password_hash))) {
      const { password_hash, ...result } = usuario;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usuariosService.findByUsuario(loginDto.usuario);

    if (
      !user ||
      !(await bcrypt.compare(loginDto.password, user.password_hash))
    ) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, username: user.usuario, rolId: user.rolId };

    return {
      token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        usuario: user.usuario,
        rol: user.rol?.nombre,
        empleadoId: user.empleadoId,
      },
    };
  }
}
