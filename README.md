# ChikenDesk · POS para pollerías

Sistema de punto de venta para pollerías.

| Capa                   | Tecnología                                    |
| ---------------------- | --------------------------------------------- |
| Backend (`backend/`)   | NestJS 11 · TypeScript · TypeORM · PostgreSQL |
| Frontend (`frontend/`) | Angular 17 (standalone + signals) · Tailwind  |

## Qué incluye

- **Seguridad:** login JWT, roles (`ADMIN`, `CAJERO`), usuarios con contraseña bcrypt. El token se revalida contra la BD en cada petición (un usuario borrado pierde acceso al instante).
- **Catálogo:** categorías, productos (stock, código de barras, cambio de guarnición) e imágenes (subida a disco, principal sincronizada con `productos.imagen_principal_url`).
- **Cajas por turno:** apertura, ingresos/egresos, cierre con diferencia (contado − esperado). Un solo turno abierto por cajero.
- **Ventas:** transacción atómica con bloqueo de stock, precio tomado de la BD, ticket correlativo, anulación que devuelve stock.
- **Pagos QR:** generación del QR, sondeo de estado, expiración, webhook del banco con secreto compartido. El proveedor es intercambiable (`QrProvider`); hoy hay uno simulado para desarrollo.
- **Auditoría automática:** cada INSERT/UPDATE/DELETE (borrado lógico), login y anulación de venta queda en `auditoria_logs`, y `usuario_registro` se completa solo.
- **Frontend:** landing pública con menú real, login, panel ADMIN (resumen, productos, categorías, ventas, cajas, usuarios, auditoría) y POS para cajeros (vender, caja, mis ventas, ticket imprimible).

## Puesta en marcha

### 1. Base de datos

```bash
cd backend
docker compose up -d        # PostgreSQL 16; ejecuta database/01_schema.sql y 02_seed.sql
```

Sin Docker: crea la base `chikendesk` y ejecuta, en orden, `database/01_schema.sql` y `database/02_seed.sql`.

### 2. Backend

```bash
cd backend
cp .env.example .env        # edita JWT_TOKEN y QR_WEBHOOK_SECRET
npm install
npm run start:dev           # http://localhost:3000  ·  Swagger: /apidoc
```

### 3. Frontend

```bash
cd frontend
npm install
npm start                   # http://localhost:4200 (proxy a /api y /uploads)
```

**Usuario inicial:** `admin` / `Admin123*` (cámbiala al primer ingreso). Crea cajeros desde _Usuarios_.

## Flujo de trabajo típico

1. El cajero entra → **Mi caja** → abre caja con el monto inicial.
2. **Vender** → agrega productos (o escanea el código) → elige pedido y pago → cobra.
3. Si el pago es **QR** aparece el código y se consulta el estado cada 3 s hasta `PROCESADO`.
4. Al terminar el turno: **Mi caja → Cerrar caja** e ingresa el efectivo contado.

## Decisiones que conviene conocer

- **El esquema se gestiona con SQL**, no con `synchronize`: usa índices únicos parciales (`WHERE estado = 1`), `CHECK` y la secuencia de tickets, que TypeORM no reproduce.
- **Los servicios usan `save()`** (no `update()`): así el subscriber de auditoría conoce el valor anterior.
- **Pago `MIXTO`:** la tabla `ventas` tiene una sola columna `metodo_pago`, así que no se sabe cuánto fue en efectivo. Se informa aparte y **no** entra al efectivo esperado. Si lo necesitas, agrega una tabla `ventas_pagos` (venta, método, monto).
- **Ventas QR en el cierre:** solo cuentan cuando su pago está `PROCESADO`, y no se puede cerrar caja con QR pendientes.
- **Zona horaria:** los `timestamp` no guardan zona. Node y PostgreSQL deben usar la misma (`TZ=America/La_Paz`).
- **Integración real del QR:** implementa `QrProvider` con la API de tu banco, cámbialo en `PagosQrModule` y adapta `ConfirmarQrWebhookDto` al formato de su webhook.

## Pendiente / siguientes pasos sugeridos

- Límite de intentos en el login (`@nestjs/throttler`).
- Pruebas automatizadas de ventas y cajas (solo hay una de ejemplo).
- Guardar las imágenes en S3/MinIO si despliegas en varios servidores.
