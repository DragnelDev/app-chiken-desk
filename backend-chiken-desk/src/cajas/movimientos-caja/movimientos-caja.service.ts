import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estado, EstadoCaja } from '../../common/enums';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { AperturasCajaService } from '../aperturas-caja/aperturas-caja.service';
import { CreateMovimientoDto } from './dto/movimiento.dto';
import { MovimientoCajaEntity } from './entities/movimiento-caja.entity';

@Injectable()
export class MovimientosCajaService {
  constructor(
    @InjectRepository(MovimientoCajaEntity)
    private readonly repo: Repository<MovimientoCajaEntity>,
    private readonly cajas: AperturasCajaService,
  ) {}

  async crear(dto: CreateMovimientoDto, user: UsuarioAutenticado) {
    const apertura = dto.idApertura
      ? await this.cajas.findOne(dto.idApertura)
      : await this.cajas.exigirCajaAbierta(user.idUsuario);

    this.cajas.verificarAcceso(apertura, user);
    if (apertura.estadoCaja !== EstadoCaja.ABIERTA) {
      throw new ConflictException('No se pueden registrar movimientos en una caja cerrada');
    }

    return this.repo.save(
      this.repo.create({
        idApertura: apertura.idApertura,
        tipoMovimiento: dto.tipoMovimiento,
        monto: dto.monto,
        concepto: dto.concepto.trim(),
      }),
    );
  }

  async listar(idApertura: number, user: UsuarioAutenticado) {
    const apertura = await this.cajas.findOne(idApertura);
    this.cajas.verificarAcceso(apertura, user);
    return this.repo.find({
      where: { idApertura, estado: Estado.ACTIVO },
      order: { idMovimiento: 'DESC' },
    });
  }

  async anular(idMovimiento: number, user: UsuarioAutenticado): Promise<void> {
    const movimiento = await this.repo.findOne({
      where: { idMovimiento, estado: Estado.ACTIVO },
    });
    if (!movimiento) throw new NotFoundException(`Movimiento ${idMovimiento} no encontrado`);

    const apertura = await this.cajas.findOne(movimiento.idApertura);
    this.cajas.verificarAcceso(apertura, user);
    if (apertura.estadoCaja !== EstadoCaja.ABIERTA) {
      throw new ConflictException('La caja ya está cerrada; no se puede anular el movimiento');
    }

    movimiento.estado = Estado.BORRADO; // borrado lógico
    await this.repo.save(movimiento);
  }
}
