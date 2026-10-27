# ChikenDesk · Frontend

Angular 17 (componentes standalone, signals, control flow `@if/@for`) + Tailwind.
Ver el [README general](../README.md).

```bash
npm install
npm start      # http://localhost:4200  (proxy.conf.json: /api y /uploads -> http://localhost:3000)
```

## Rutas

| Ruta                                 | Rol                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `/`                                  | público: landing con el menú real                                         |
| `/login`                             | público                                                                   |
| `/admin/*`                           | ADMIN: resumen, productos, categorías, ventas, cajas, usuarios, auditoría |
| `/pos` · `/pos/caja` · `/pos/ventas` | CAJERO (y ADMIN): vender, mi caja, mis ventas                             |

## Estructura

```
src/app/
├─ core/       config (API_URL), guards, interceptor JWT, servicios (api.services.ts) y utilidades
├─ shared/     modelos TS, modal, ticket imprimible (80 mm), sidebar, historial de ventas
└─ features/   public · auth · admin · pos
```

## Notas

- La sesión se guarda en `localStorage` (`chikendesk-token`) y el guard comprueba que el JWT no haya vencido.
- Subida de imágenes: `FormData` con el campo `file`; no se fija `Content-Type` (el navegador agrega el boundary).
- En producción sirve `/api` y `/uploads` desde el mismo dominio (o ajusta `API_URL` y la URL de las imágenes).
