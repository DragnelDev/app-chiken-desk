import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosQrModule } from '../pagos-qr/pagos-qr.module';
import { VentaDetalleEntity } from './entities/venta-detalle.entity';
import { VentaEntity } from './entities/venta.entity';
import { VentasController } from './ventas.controller';
import { VentasService } from './ventas.service';

@Module({
  imports: [TypeOrmModule.forFeature([VentaEntity, VentaDetalleEntity]), PagosQrModule],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
