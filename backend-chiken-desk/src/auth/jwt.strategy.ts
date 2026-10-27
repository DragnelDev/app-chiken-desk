import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { UsuariosService } from '../seguridad/usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_TOKEN'),
    });
  }

  /** Revalida contra la BD: un usuario borrado o con otro rol pierde acceso de inmediato. */
  async validate(payload: { sub: number }): Promise<UsuarioAutenticado> {
    const usuario = await this.usuariosService.findActivoConRol(payload.sub);
    if (!usuario) throw new UnauthorizedException();
    return {
      idUsuario: usuario.idUsuario,
      usuario: usuario.usuario,
      idRol: usuario.idRol,
      rol: usuario.rol.nombre,
    };
  }
}
