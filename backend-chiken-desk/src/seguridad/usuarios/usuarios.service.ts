import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioEntity } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<UsuarioEntity> {
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      password_hash: await bcrypt.hash(createUsuarioDto.password_hash, 10),
    });
    return await this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<UsuarioEntity[]> {
    return await this.usuarioRepository.find({
      where: { activo: true },
      relations: { rol: true, empleado: true },
    });
  }

  async findByUsuario(usuario: string): Promise<UsuarioEntity | null> {
    return this.usuarioRepository.findOne({
      where: { usuario, activo: true },
      relations: { rol: true },
    });
  }

  async findOne(id: number): Promise<UsuarioEntity> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id, activo: true },
      relations: { rol: true, empleado: true },
    });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return usuario;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioEntity> {
    await this.findOne(id);
    const updateData = { ...updateUsuarioDto };
    if (updateData.password_hash !== undefined) {
      updateData.password_hash = await bcrypt.hash(
        updateData.password_hash,
        10,
      );
    }
    await this.usuarioRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOne(id);
    usuario.activo = false;
    await this.usuarioRepository.save(usuario);
  }
}
