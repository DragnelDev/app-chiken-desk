import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { round2 } from '../common/utils/numeric.transformer';

/**
 * Ventas "válidas": completadas, activas y, si son por QR, con pago PROCESADO.
 * Es la misma regla que usa el cierre de caja, así los números cuadran.
 */
const VENTAS_VALIDAS = `
  SELECT v.* FROM ventas v
   WHERE v.estado = 1 AND v.estado_venta = 'COMPLETADA'
     AND (v.metodo_pago <> 'QR' OR EXISTS (
           SELECT 1 FROM pagos_qr p
            WHERE p.id_venta = v.id_venta AND p.estado = 1 AND p.estado_pago = 'PROCESADO'))`;

export interface ResumenDashboard {
  ventasHoy: number;
  cantidadVentasHoy: number;
  ticketPromedioHoy: number;
  ventasAyer: number;
  /** % de variación contra ayer; null si ayer no hubo ventas. */
  variacionVsAyer: number | null;
  cajasAbiertas: number;
  productosStockBajo: number;
  ventasPorMetodoHoy: { metodoPago: string; total: number; cantidad: number }[];
  topProductos7Dias: { idProducto: number; nombre: string; unidades: number; total: number }[];
}

@Injectable()
export class DashboardService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async resumen(umbralStock = 5): Promise<ResumenDashboard> {
    const [hoy] = await this.dataSource.query(
      `SELECT COALESCE(SUM(monto_total),0)::float AS total, COUNT(*)::int AS cantidad
         FROM (${VENTAS_VALIDAS}) x WHERE x.fecha_registro >= CURRENT_DATE`,
    );
    const [ayer] = await this.dataSource.query(
      `SELECT COALESCE(SUM(monto_total),0)::float AS total
         FROM (${VENTAS_VALIDAS}) x
        WHERE x.fecha_registro >= CURRENT_DATE - 1 AND x.fecha_registro < CURRENT_DATE`,
    );
    const [cajas] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cantidad FROM aperturas_caja
        WHERE estado = 1 AND estado_caja = 'ABIERTA'`,
    );
    const [stock] = await this.dataSource.query(
      `SELECT COUNT(*)::int AS cantidad FROM productos WHERE estado = 1 AND stock <= $1`,
      [umbralStock],
    );
    const metodos = await this.dataSource.query(
      `SELECT metodo_pago AS "metodoPago", COALESCE(SUM(monto_total),0)::float AS total, COUNT(*)::int AS cantidad
         FROM (${VENTAS_VALIDAS}) x WHERE x.fecha_registro >= CURRENT_DATE
        GROUP BY metodo_pago ORDER BY total DESC`,
    );
    const top = await this.dataSource.query(
      `SELECT d.id_producto AS "idProducto", p.nombre,
              SUM(d.cantidad)::int AS unidades, COALESCE(SUM(d.subtotal),0)::float AS total
         FROM ventas_detalle d
         JOIN (${VENTAS_VALIDAS}) x ON x.id_venta = d.id_venta
         JOIN productos p ON p.id_producto = d.id_producto
        WHERE d.estado = 1 AND x.fecha_registro >= CURRENT_DATE - 6
        GROUP BY d.id_producto, p.nombre
        ORDER BY unidades DESC LIMIT 5`,
    );

    const variacion = ayer.total > 0 ? round2(((hoy.total - ayer.total) / ayer.total) * 100) : null;

    return {
      ventasHoy: round2(hoy.total),
      cantidadVentasHoy: hoy.cantidad,
      ticketPromedioHoy: hoy.cantidad ? round2(hoy.total / hoy.cantidad) : 0,
      ventasAyer: round2(ayer.total),
      variacionVsAyer: variacion,
      cajasAbiertas: cajas.cantidad,
      productosStockBajo: stock.cantidad,
      ventasPorMetodoHoy: metodos,
      topProductos7Dias: top,
    };
  }
}
