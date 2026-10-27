import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AperturasCajaModule } from '../aperturas-caja/aperturas-caja.module';
import { MovimientoCajaEntity } from './entities/movimiento-caja.entity';
import { MovimientosCajaController } from './movimientos-caja.controller';
import { MovimientosCajaService } from './movimientos-caja.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoCajaEntity]),
    AperturasCajaModule,
  ],
  controllers: [MovimientosCajaController],
  providers: [MovimientosCajaService],
})
export class MovimientosCajaModule {}
