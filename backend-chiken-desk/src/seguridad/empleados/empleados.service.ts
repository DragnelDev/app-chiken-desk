import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmpleadoEntity } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(
    @InjectRepository(EmpleadoEntity)
    private readonly empleadoRepository: Repository<EmpleadoEntity>,
  ) {}

  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<EmpleadoEntity> {
    const empleado = this.empleadoRepository.create(createEmpleadoDto);
    return await this.empleadoRepository.save(empleado);
  }

  async findAll(): Promise<EmpleadoEntity[]> {
    return await this.empleadoRepository.find({ where: { activo: true } });
  }

  async findOne(id: number): Promise<EmpleadoEntity> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id, activo: true },
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }
    return empleado;
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<EmpleadoEntity> {
    await this.findOne(id);
    await this.empleadoRepository.update(id, updateEmpleadoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);
    empleado.activo = false;
    await this.empleadoRepository.save(empleado);
  }
}
