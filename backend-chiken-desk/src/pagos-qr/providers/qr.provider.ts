export interface CobroQr {
  transaccionId: string;
  /** Data URL lista para <img src>. */
  qrImagenBase64: string;
  /** Respuesta cruda del proveedor (se guarda en datos_respuesta_json). */
  datos: Record<string, unknown>;
}

export interface SolicitudCobroQr {
  monto: number;
  referencia: string;
  expiraEn: Date;
}

/**
 * Punto de integración con el banco / pasarela QR.
 * Para producción: crea una clase que implemente esto (llamando a la API del banco
 * para generar el QR y devolviendo su id de transacción) y cámbiala en PagosQrModule.
 */
export abstract class QrProvider {
  abstract crearCobro(solicitud: SolicitudCobroQr): Promise<CobroQr>;
}
