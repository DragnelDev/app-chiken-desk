import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaEntity } from '../ventas/entities/venta.entity';
import { PagoQrEntity } from './entities/pago-qr.entity';
import { PagosQrController } from './pagos-qr.controller';
import { PagosQrService } from './pagos-qr.service';
import { MockQrProvider } from './providers/mock-qr.provider';
import { QrProvider } from './providers/qr.provider';

@Module({
  imports: [TypeOrmModule.forFeature([PagoQrEntity, VentaEntity])],
  controllers: [PagosQrController],
  providers: [
    PagosQrService,
    // Cambia MockQrProvider por la integración real del banco para producción.
    { provide: QrProvider, useClass: MockQrProvider },
  ],
  exports: [PagosQrService],
})
export class PagosQrModule {}
