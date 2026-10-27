import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as QRCode from 'qrcode';
import { CobroQr, QrProvider, SolicitudCobroQr } from './qr.provider';

/** Proveedor local para desarrollo: genera un QR real, pero no hay banco detrás. */
@Injectable()
export class MockQrProvider extends QrProvider {
  async crearCobro({
    monto,
    referencia,
    expiraEn,
  }: SolicitudCobroQr): Promise<CobroQr> {
    const transaccionId = `MOCK-${randomUUID()}`;
    const payload = {
      txn: transaccionId,
      ref: referencia,
      monto,
      expira: expiraEn.toISOString(),
    };
    const qrImagenBase64 = await QRCode.toDataURL(JSON.stringify(payload), {
      margin: 1,
      width: 320,
    });
    return {
      transaccionId,
      qrImagenBase64,
      datos: { proveedor: 'MOCK', payload },
    };
  }
}
