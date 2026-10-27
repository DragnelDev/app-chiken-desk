export interface Usuario {
  id: number;
  usuario: string;
  rol: 'Admin' | 'Cajero' | 'Cocinero' | 'Mesero';
  empleadoId: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precioUnitario: number;
  categoria: string;
  imagenUrl: string;
  disponible: boolean;
}

export type EstadoMesa = 'Libre' | 'Ocupada' | 'Reservada';

export interface Mesa {
  id: number;
  numeroMesa: number;
  capacidad: number;
  estado: EstadoMesa;
}

export type EstadoPedido = 'Pendiente' | 'En Cocina' | 'Listo' | 'Servido' | 'Cancelado';
export type TipoPedido = 'Salon' | 'Llevar' | 'Delivery';

export interface DetallePedido {
  productoId: number;
  cantidad: number;
  notasCocina?: string;
  subtotal?: number;
}

export interface Pedido {
  id: number;
  mesaId?: number;
  tipoPedido: TipoPedido;
  estado: EstadoPedido;
  montoTotal: number;
  detalles: DetallePedido[];
}
