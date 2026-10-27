import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service';
import { UsuarioEntity } from './entities/usuario.entity';

describe('UsuariosService', () => {
  let service: UsuariosService;
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(UsuarioEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('hashes the password before saving a user', async () => {
    const usuario = new UsuarioEntity();
    const createUsuarioDto = {
      usuario: 'caja',
      password_hash: 'secret1',
      rolId: 2,
      empleadoId: 15,
    };
    repository.create.mockReturnValue(usuario);
    repository.save.mockResolvedValue(usuario);

    await expect(service.create(createUsuarioDto)).resolves.toBe(usuario);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ...createUsuarioDto,
        password_hash: expect.any(String),
      }),
    );
    const savedPassword = repository.create.mock.calls[0][0].password_hash;
    await expect(bcrypt.compare('secret1', savedPassword)).resolves.toBe(true);
    expect(repository.save).toHaveBeenCalledWith(usuario);
  });
});
