import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../../shared/models';

/**
 * ProductoService — Módulo 2 del API Reference (/productos).
 * Lo usa tanto la landing pública (menú) como el POS (selector de platos).
 */
@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);

  // GET /productos?categoria=... — admite filtro opcional por categoría
  getProductos(categoria?: string): Observable<Producto[]> {
    const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : '';
    return this.http.get<Producto[]>(`/api/v1/productos${query}`);
  }
}
