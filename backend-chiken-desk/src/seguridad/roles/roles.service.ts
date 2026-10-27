import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly rolRepository: Repository<RoleEntity>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const rol = this.rolRepository.create(createRoleDto);
    return await this.rolRepository.save(rol);
  }

  async findAll(): Promise<RoleEntity[]> {
    return await this.rolRepository.find({ where: { activo: true } });
  }

  async findOne(id: number): Promise<RoleEntity> {
    const rol = await this.rolRepository.findOne({
      where: { id, activo: true },
    });
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRoleDto): Promise<RoleEntity> {
    await this.findOne(id); // Valida si existe
    await this.rolRepository.update(id, updateRolDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    rol.activo = false; // Borrado lógico según el requerimiento de auditoría
    await this.rolRepository.save(rol);
  }
}
