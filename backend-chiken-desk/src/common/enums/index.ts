export enum Estado {
  BORRADO = 0,
  ACTIVO = 1,
}

export enum RolSistema {
  ADMIN = 'ADMIN',
  CAJERO = 'CAJERO',
}

export enum TipoPedido {
  MESA = 'MESA',
  LLEVAR = 'LLEVAR',
  DELIVERY = 'DELIVERY',
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  QR = 'QR',
  TARJETA = 'TARJETA',
  MIXTO = 'MIXTO',
}

export enum EstadoVenta {
  COMPLETADA = 'COMPLETADA',
  ANULADA = 'ANULADA',
}

export enum EstadoCaja {
  ABIERTA = 'ABIERTA',
  CERRADA = 'CERRADA',
}

export enum TipoMovimiento {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
}

export enum EstadoPagoQr {
  PENDIENTE = 'PENDIENTE',
  PROCESADO = 'PROCESADO',
  EXPIRADO = 'EXPIRADO',
}

export enum AccionAuditoria {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ANULACION_VENTA = 'ANULACION_VENTA',
  LOGIN = 'LOGIN',
}
