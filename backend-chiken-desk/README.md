# ChikenDesk · Backend

API REST en NestJS. Ver el [README general](../README.md) para la puesta en marcha.

## Estructura

```
src/
├─ common/          enums, decoradores (@Public, @Roles, @CurrentUser), guards, filtro de errores SQL,
│                   contexto por solicitud (usuario + IP) y la entidad base de auditoría
├─ auditoria/       entidad auditoria_logs, subscriber automático y consulta (solo ADMIN)
├─ auth/            login JWT y perfil
├─ seguridad/       roles y usuarios
├─ catalogo/        categorías, productos e imágenes (subida con Multer)
├─ cajas/           aperturas de caja (turnos) y movimientos
├─ ventas/          ventas, detalle, anulación
├─ pagos-qr/        cobro QR, webhook del banco y proveedor intercambiable
└─ dashboard/       indicadores del panel
database/           01_schema.sql (esquema) · 02_seed.sql (datos iniciales)
```

## Endpoints principales (prefijo `/api/v1`)

| Método y ruta                                                                   | Acceso                               |
| ------------------------------------------------------------------------------- | ------------------------------------ |
| `POST /auth/login` · `GET /auth/perfil`                                         | público · autenticado                |
| `GET /productos` · `/categorias` · `/productos/:id/imagenes`                    | público (menú de la landing)         |
| `GET /productos/codigo/:codigo`                                                 | autenticado                          |
| `POST/PATCH/DELETE /productos` · `/categorias` · `PATCH /productos/:id/stock`   | ADMIN                                |
| `POST /productos/:id/imagenes` (multipart, campo `file`, máx. 2 MB)             | ADMIN                                |
| `/roles` · `/usuarios` · `/auditoria` · `/dashboard/resumen` · `GET /cajas`     | ADMIN                                |
| `POST /cajas/abrir` · `GET /cajas/actual` · `PATCH /cajas/:id/cerrar`           | autenticado (dueño o ADMIN)          |
| `/movimientos-caja`                                                             | autenticado (dueño o ADMIN)          |
| `POST /ventas` · `GET /ventas` · `GET /ventas/:id` · `PATCH /ventas/:id/anular` | autenticado (cajero: solo las suyas) |
| `POST/GET /pagos-qr/venta/:id` · `POST /pagos-qr/:id/confirmar-manual`          | autenticado · ADMIN                  |
| `POST /pagos-qr/webhook` (header `x-webhook-secret`)                            | público con secreto                  |

Swagger interactivo en `/apidoc`.

## Auditoría automática

`AuditSubscriber` (TypeORM) hace dos cosas sin que el código de negocio lo pida:

1. Completa `usuario_registro` con el usuario del JWT (`sistema` si no hay sesión).
2. Escribe en `auditoria_logs`: `INSERT`, `UPDATE`, `DELETE` (cuando `estado` pasa de 1 a 0). `LOGIN` y `ANULACION_VENTA` se registran explícitamente. `password_hash` y la imagen QR nunca se guardan en el log.

> Solo se dispara con `repository.save()` / `manager.save()`. Evita `repository.update()` en servicios nuevos.
