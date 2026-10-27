import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AccionAuditoria } from '../common/enums';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { UsuariosService } from '../seguridad/usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  // Hash de relleno: evita que el tiempo de respuesta delate si el usuario existe.
  private readonly hashDummy = bcrypt.hashSync('chikendesk-dummy', 10);

  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly auditoria: AuditoriaService,
  ) {}

  async login(dto: LoginDto, ip?: string) {
    const usuario = await this.usuariosService.findParaLogin(dto.usuario);
    const coincide = await bcrypt.compare(
      dto.password,
      usuario?.passwordHash ?? this.hashDummy,
    );

    if (!usuario || !coincide) {
      await this.auditoria.registrar({
        idUsuario: usuario?.idUsuario ?? null,
        tabla: 'usuarios',
        accion: AccionAuditoria.LOGIN,
        nuevos: { usuario: dto.usuario, resultado: 'FALLIDO' },
        ip,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.auditoria.registrar({
      idUsuario: usuario.idUsuario,
      tabla: 'usuarios',
      accion: AccionAuditoria.LOGIN,
      nuevos: { usuario: usuario.usuario, resultado: 'EXITOSO' },
      ip,
    });

    const payload = {
      sub: usuario.idUsuario,
      usuario: usuario.usuario,
      idRol: usuario.idRol,
      rol: usuario.rol.nombre,
    };

    return {
      token: this.jwtService.sign(payload),
      usuario: {
        idUsuario: usuario.idUsuario,
        usuario: usuario.usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        idRol: usuario.idRol,
        rol: usuario.rol.nombre,
      },
    };
  }
}
