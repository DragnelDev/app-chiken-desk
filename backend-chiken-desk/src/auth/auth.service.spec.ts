import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../seguridad/usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { UsuarioEntity } from '../seguridad/usuarios/entities/usuario.entity';
import { RoleEntity } from '../seguridad/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: jest.Mocked<Pick<UsuariosService, 'findByUsuario'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;

  beforeEach(async () => {
    usuariosService = {
      findByUsuario: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns a signed token and user details for valid credentials', async () => {
    const user = Object.assign(new UsuarioEntity(), {
      id: 8,
      usuario: 'caja',
      password_hash: 'hashed-password',
      rolId: 2,
      rol: Object.assign(new RoleEntity(), { nombre: 'Cajero' }),
      empleadoId: 15,
    });
    usuariosService.findByUsuario.mockResolvedValue(user);
    user.password_hash = await bcrypt.hash('secret1', 4);

    await expect(
      service.login({ usuario: 'caja', password: 'secret1' }),
    ).resolves.toEqual({
      token: 'signed-token',
      usuario: {
        id: 8,
        usuario: 'caja',
        rol: 'Cajero',
        empleadoId: 15,
      },
    });
    expect(usuariosService.findByUsuario).toHaveBeenCalledWith('caja');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 8,
      username: 'caja',
      rolId: 2,
    });
  });

  it('rejects credentials that do not match an active user', async () => {
    usuariosService.findByUsuario.mockResolvedValue(null);

    await expect(
      service.login({ usuario: 'unknown', password: 'secret1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('rejects an incorrect password', async () => {
    const user = Object.assign(new UsuarioEntity(), {
      id: 8,
      usuario: 'caja',
      password_hash: await bcrypt.hash('different1', 4),
      rolId: 2,
      rol: Object.assign(new RoleEntity(), { nombre: 'Cajero' }),
      empleadoId: 15,
    });
    usuariosService.findByUsuario.mockResolvedValue(user);

    await expect(
      service.login({ usuario: 'caja', password: 'secret1' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
