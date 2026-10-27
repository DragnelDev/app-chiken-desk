// Modelos alineados con las entidades del backend (camelCase del API REST).

export type TipoPedido = 'MESA' | 'LLEVAR' | 'DELIVERY';
export type MetodoPago = 'EFECTIVO' | 'QR' | 'TARJETA' | 'MIXTO';
export type EstadoVenta = 'COMPLETADA' | 'ANULADA';
export type EstadoCaja = 'ABIERTA' | 'CERRADA';
export type TipoMovimiento = 'INGRESO' | 'EGRESO';
export type EstadoPagoQr = 'PENDIENTE' | 'PROCESADO' | 'EXPIRADO';

export interface Paginado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ---- Seguridad
export interface Rol {
  idRol: number;
  nombre: string;
  descripcion: string | null;
}

export interface Usuario {
  idUsuario: number;
  idRol: number;
  nombres: string;
  apellidos: string;
  ci: string;
  usuario: string;
  rol?: Rol;
}

export interface UsuarioSesion {
  idUsuario: number;
  usuario: string;
  nombres: string;
  apellidos: string;
  idRol: number;
  rol: string;
}

export interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

// ---- Catálogo
export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
}

export interface Producto {
  idProducto: number;
  idCategoria: number;
  codigoBarra: string | null;
  nombre: string;
  descripcion: string | null;
  precioVenta: number;
  stock: number;
  permiteCambioGuarnicion: boolean;
  imagenPrincipalUrl: string | null;
  categoria?: Categoria;
}

export interface ImagenProducto {
  idImagen: number;
  idProducto: number;
  urlImagen: string;
  esPrincipal: boolean;
}

// ---- Cajas
export interface Apertura {
  idApertura: number;
  idUsuario: number;
  montoInicial: number;
  montoCierre: number | null;
  montoDiferencia: number | null;
  fechaApertura: string;
  fechaCierre: string | null;
  estadoCaja: EstadoCaja;
  usuario?: Usuario;
}

export interface ResumenCaja {
  montoInicial: number;
  ventasEfectivo: number;
  ventasTarjeta: number;
  ventasQr: number;
  ventasMixto: number;
  totalVentas: number;
  cantidadVentas: number;
  ventasAnuladas: number;
  ingresos: number;
  egresos: number;
  efectivoEsperado: number;
  qrPendientes: number;
}

export interface CajaConResumen {
  apertura: Apertura;
  resumen: ResumenCaja;
}

export interface MovimientoCaja {
  idMovimiento: number;
  idApertura: number;
  tipoMovimiento: TipoMovimiento;
  monto: number;
  concepto: string;
  fechaRegistro: string;
  usuarioRegistro: string;
}

// ---- Ventas
export interface PagoQr {
  idPagoQr: number;
  idVenta: number;
  transaccionId: string;
  /** Data URL (solo viene al generar o con /qr). */
  qrImagenBase64?: string;
  monto: number;
  estadoPago: EstadoPagoQr;
  fechaExpiracion: string;
  fechaConfirmacion: string | null;
}

export interface DetalleVenta {
  idDetalle: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  observacion: string | null;
  producto?: Producto;
}

export interface Venta {
  idVenta: number;
  idApertura: number;
  idUsuario: number;
  numeroFacturaTicket: string;
  clienteNombre: string | null;
  clienteNitCi: string | null;
  tipoPedido: TipoPedido;
  montoSubtotal: number;
  montoDescuento: number;
  montoTotal: number;
  metodoPago: MetodoPago;
  estadoVenta: EstadoVenta;
  fechaRegistro: string;
  usuario?: Usuario;
  detalles?: DetalleVenta[];
  pagosQr?: PagoQr[];
}

/** Respuesta de POST /ventas: la venta más el cobro QR (si aplica). */
export interface VentaCreada extends Venta {
  pagoQr: PagoQr | null;
}

export interface NuevaVenta {
  tipoPedido: TipoPedido;
  metodoPago: MetodoPago;
  clienteNombre?: string;
  clienteNitCi?: string;
  montoDescuento?: number;
  detalles: { idProducto: number; cantidad: number; observacion?: string }[];
}

export interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  observacion: string;
}

// ---- Auditoría y dashboard
export interface LogAuditoria {
  idLog: string;
  idUsuario: number | null;
  tablaAfectada: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'ANULACION_VENTA' | 'LOGIN';
  valoresAnteriores: string | null;
  valoresNuevos: string | null;
  ipOrigen: string | null;
  fechaEvento: string;
}

export interface ResumenDashboard {
  ventasHoy: number;
  cantidadVentasHoy: number;
  ticketPromedioHoy: number;
  ventasAyer: number;
  variacionVsAyer: number | null;
  cajasAbiertas: number;
  productosStockBajo: number;
  ventasPorMetodoHoy: { metodoPago: string; total: number; cantidad: number }[];
  topProductos7Dias: { idProducto: number; nombre: string; unidades: number; total: number }[];
}
