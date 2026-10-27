import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Apertura,
  CajaConResumen,
  Categoria,
  ImagenProducto,
  LogAuditoria,
  MovimientoCaja,
  NuevaVenta,
  Paginado,
  PagoQr,
  Producto,
  ResumenDashboard,
  Rol,
  TipoMovimiento,
  Usuario,
  Venta,
  VentaCreada,
} from '../../shared/models';
import { API_URL } from '../config/api';

/** Quita valores vacíos para no enviar `?q=&desde=` al backend. */
function aParams(filtro: Record<string, unknown>): HttpParams {
  let params = new HttpParams();
  for (const [clave, valor] of Object.entries(filtro)) {
    if (valor !== undefined && valor !== null && valor !== '') params = params.set(clave, String(valor));
  }
  return params;
}

// ------------------------------------------------------------------ Catálogo
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  listar() { return this.http.get<Categoria[]>(`${API_URL}/categorias`); }
  crear(dto: Partial<Categoria>) { return this.http.post<Categoria>(`${API_URL}/categorias`, dto); }
  actualizar(id: number, dto: Partial<Categoria>) { return this.http.patch<Categoria>(`${API_URL}/categorias/${id}`, dto); }
  eliminar(id: number) { return this.http.delete<void>(`${API_URL}/categorias/${id}`); }
}

export interface DatosProducto {
  idCategoria: number;
  codigoBarra?: string;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  stock?: number;
  permiteCambioGuarnicion?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);

  listar(filtro: { idCategoria?: number; q?: string; soloDisponibles?: boolean } = {}): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API_URL}/productos`, { params: aParams(filtro) });
  }
  porCodigoBarra(codigo: string) { return this.http.get<Producto>(`${API_URL}/productos/codigo/${encodeURIComponent(codigo)}`); }
  crear(dto: DatosProducto) { return this.http.post<Producto>(`${API_URL}/productos`, dto); }
  actualizar(id: number, dto: Partial<DatosProducto>) { return this.http.patch<Producto>(`${API_URL}/productos/${id}`, dto); }
  ajustarStock(id: number, cantidad: number) { return this.http.patch<Producto>(`${API_URL}/productos/${id}/stock`, { cantidad }); }
  eliminar(id: number) { return this.http.delete<void>(`${API_URL}/productos/${id}`); }

  // Imágenes: multipart/form-data. NO se fija Content-Type: el navegador agrega el boundary.
  listarImagenes(idProducto: number) { return this.http.get<ImagenProducto[]>(`${API_URL}/productos/${idProducto}/imagenes`); }
  subirImagen(idProducto: number, archivo: File, esPrincipal = false) {
    const datos = new FormData();
    datos.append('file', archivo);
    datos.append('esPrincipal', String(esPrincipal));
    return this.http.post<ImagenProducto>(`${API_URL}/productos/${idProducto}/imagenes`, datos);
  }
  marcarImagenPrincipal(idImagen: number) { return this.http.patch<ImagenProducto>(`${API_URL}/imagenes-producto/${idImagen}/principal`, {}); }
  eliminarImagen(idImagen: number) { return this.http.delete<void>(`${API_URL}/imagenes-producto/${idImagen}`); }
}

// ------------------------------------------------------------------ Seguridad
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  listar() { return this.http.get<Usuario[]>(`${API_URL}/usuarios`); }
  crear(dto: Record<string, unknown>) { return this.http.post<Usuario>(`${API_URL}/usuarios`, dto); }
  actualizar(id: number, dto: Record<string, unknown>) { return this.http.patch<Usuario>(`${API_URL}/usuarios/${id}`, dto); }
  eliminar(id: number) { return this.http.delete<void>(`${API_URL}/usuarios/${id}`); }
  roles() { return this.http.get<Rol[]>(`${API_URL}/roles`); }
}

// ------------------------------------------------------------------ Cajas
@Injectable({ providedIn: 'root' })
export class CajaService {
  private readonly http = inject(HttpClient);
  abrir(montoInicial: number) { return this.http.post<Apertura>(`${API_URL}/cajas/abrir`, { montoInicial }); }
  actual() { return this.http.get<CajaConResumen | null>(`${API_URL}/cajas/actual`); }
  detalle(id: number) { return this.http.get<CajaConResumen>(`${API_URL}/cajas/${id}`); }
  cerrar(id: number, montoCierre: number) { return this.http.patch<CajaConResumen>(`${API_URL}/cajas/${id}/cerrar`, { montoCierre }); }
  historial(filtro: { estadoCaja?: string; idUsuario?: number; page?: number; limit?: number } = {}) {
    return this.http.get<Paginado<Apertura>>(`${API_URL}/cajas`, { params: aParams(filtro) });
  }
  movimientos(idApertura: number) { return this.http.get<MovimientoCaja[]>(`${API_URL}/movimientos-caja`, { params: { idApertura } }); }
  registrarMovimiento(dto: { tipoMovimiento: TipoMovimiento; monto: number; concepto: string }) {
    return this.http.post<MovimientoCaja>(`${API_URL}/movimientos-caja`, dto);
  }
  anularMovimiento(id: number) { return this.http.delete<void>(`${API_URL}/movimientos-caja/${id}`); }
}

// ------------------------------------------------------------------ Ventas y QR
@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly http = inject(HttpClient);
  crear(dto: NuevaVenta) { return this.http.post<VentaCreada>(`${API_URL}/ventas`, dto); }
  listar(filtro: Record<string, unknown> = {}) { return this.http.get<Paginado<Venta>>(`${API_URL}/ventas`, { params: aParams(filtro) }); }
  detalle(id: number) { return this.http.get<Venta>(`${API_URL}/ventas/${id}`); }
  anular(id: number, motivo: string) {
    return this.http.patch<Venta & { advertencia: string | null }>(`${API_URL}/ventas/${id}/anular`, { motivo });
  }
}

@Injectable({ providedIn: 'root' })
export class PagoQrService {
  private readonly http = inject(HttpClient);
  generar(idVenta: number) { return this.http.post<PagoQr>(`${API_URL}/pagos-qr/venta/${idVenta}`, {}); }
  estado(idVenta: number) { return this.http.get<PagoQr>(`${API_URL}/pagos-qr/venta/${idVenta}`); }
  confirmarManual(idPagoQr: number) { return this.http.post<PagoQr>(`${API_URL}/pagos-qr/${idPagoQr}/confirmar-manual`, {}); }
}

// ------------------------------------------------------------------ Admin
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  resumen() { return this.http.get<ResumenDashboard>(`${API_URL}/dashboard/resumen`); }
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);
  buscar(filtro: Record<string, unknown>) { return this.http.get<Paginado<LogAuditoria>>(`${API_URL}/auditoria`, { params: aParams(filtro) }); }
}
