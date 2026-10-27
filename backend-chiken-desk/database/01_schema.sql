-- =====================================================================
-- ChikenDesk · Sistema POS para pollerías
-- Esquema PostgreSQL (>= 13)
-- Convención: snake_case, auditoría estándar en tablas de negocio
--   estado           INT  DEFAULT 1   (1 = activo, 0 = borrado lógico)
--   usuario_registro VARCHAR(50) NOT NULL
--   fecha_registro   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. SEGURIDAD Y USUARIOS
-- ---------------------------------------------------------------------
CREATE TABLE roles (
    id_rol           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(50)  NOT NULL,
    descripcion      VARCHAR(255),
    estado           INT          NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)  NOT NULL,
    fecha_registro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Único solo entre registros activos: permite recrear un rol borrado lógicamente
CREATE UNIQUE INDEX uq_roles_nombre ON roles (LOWER(nombre)) WHERE estado = 1;

CREATE TABLE usuarios (
    id_usuario       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_rol           INT          NOT NULL REFERENCES roles (id_rol),
    nombres          VARCHAR(100) NOT NULL,
    apellidos        VARCHAR(100) NOT NULL,
    ci               VARCHAR(20)  NOT NULL,
    usuario          VARCHAR(50)  NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    estado           INT          NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)  NOT NULL,
    fecha_registro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_usuarios_id_rol ON usuarios (id_rol);
CREATE UNIQUE INDEX uq_usuarios_usuario ON usuarios (LOWER(usuario)) WHERE estado = 1;
CREATE UNIQUE INDEX uq_usuarios_ci      ON usuarios (ci)             WHERE estado = 1;

-- ---------------------------------------------------------------------
-- 2. CATÁLOGO, PRODUCTOS E IMÁGENES
-- ---------------------------------------------------------------------
CREATE TABLE categorias (
    id_categoria     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(80)  NOT NULL,
    descripcion      VARCHAR(255),
    estado           INT          NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)  NOT NULL,
    fecha_registro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_categorias_nombre ON categorias (LOWER(nombre)) WHERE estado = 1;

CREATE TABLE productos (
    id_producto               INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_categoria              INT           NOT NULL REFERENCES categorias (id_categoria),
    codigo_barra              VARCHAR(50),
    nombre                    VARCHAR(120)  NOT NULL,
    descripcion               VARCHAR(500),
    precio_venta              NUMERIC(12,2) NOT NULL CHECK (precio_venta >= 0),
    stock                     INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
    permite_cambio_guarnicion BOOLEAN       NOT NULL DEFAULT FALSE,
    imagen_principal_url      VARCHAR(500),   -- ruta/URL de la imagen principal (copia denormalizada)
    estado                    INT           NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro          VARCHAR(50)   NOT NULL,
    fecha_registro            TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_productos_id_categoria ON productos (id_categoria);
CREATE UNIQUE INDEX uq_productos_codigo_barra ON productos (codigo_barra)
    WHERE estado = 1 AND codigo_barra IS NOT NULL;

CREATE TABLE imagenes_producto (
    id_imagen        INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_producto      INT          NOT NULL REFERENCES productos (id_producto),
    url_imagen       VARCHAR(500) NOT NULL,
    es_principal     BOOLEAN      NOT NULL DEFAULT FALSE,
    estado           INT          NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)  NOT NULL,
    fecha_registro   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_imagenes_producto_id_producto ON imagenes_producto (id_producto);
-- A lo sumo una imagen principal activa por producto
CREATE UNIQUE INDEX uq_imagenes_producto_principal ON imagenes_producto (id_producto)
    WHERE es_principal AND estado = 1;

-- ---------------------------------------------------------------------
-- 3. CONTROL DE CAJAS (TURNOS)
-- ---------------------------------------------------------------------
CREATE TABLE aperturas_caja (
    id_apertura      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario       INT           NOT NULL REFERENCES usuarios (id_usuario),
    monto_inicial    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_inicial >= 0),
    monto_cierre     NUMERIC(12,2) CHECK (monto_cierre >= 0),
    monto_diferencia NUMERIC(12,2),                       -- contado - esperado
    fecha_apertura   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre     TIMESTAMP,
    estado_caja      VARCHAR(10)   NOT NULL DEFAULT 'ABIERTA'
                     CHECK (estado_caja IN ('ABIERTA', 'CERRADA')),
    estado           INT           NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)   NOT NULL,
    fecha_registro   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_aperturas_cierre_coherente CHECK (
        (estado_caja = 'ABIERTA' AND fecha_cierre IS NULL)
        OR (estado_caja = 'CERRADA' AND fecha_cierre IS NOT NULL AND monto_cierre IS NOT NULL)
    )
);
CREATE INDEX idx_aperturas_caja_id_usuario ON aperturas_caja (id_usuario);
-- Un cajero no puede tener dos cajas abiertas a la vez
CREATE UNIQUE INDEX uq_aperturas_caja_abierta_por_usuario ON aperturas_caja (id_usuario)
    WHERE estado_caja = 'ABIERTA' AND estado = 1;

CREATE TABLE movimientos_caja (
    id_movimiento    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_apertura      INT           NOT NULL REFERENCES aperturas_caja (id_apertura),
    tipo_movimiento  VARCHAR(10)   NOT NULL CHECK (tipo_movimiento IN ('INGRESO', 'EGRESO')),
    monto            NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    concepto         VARCHAR(255)  NOT NULL,
    estado           INT           NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)   NOT NULL,
    fecha_registro   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_movimientos_caja_id_apertura ON movimientos_caja (id_apertura);

-- ---------------------------------------------------------------------
-- 4. VENTAS Y PAGOS QR
-- ---------------------------------------------------------------------
CREATE TABLE ventas (
    id_venta              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_apertura           INT           NOT NULL REFERENCES aperturas_caja (id_apertura),
    id_usuario            INT           NOT NULL REFERENCES usuarios (id_usuario),
    numero_factura_ticket VARCHAR(30)   NOT NULL,
    cliente_nombre        VARCHAR(150),
    cliente_nit_ci        VARCHAR(20),
    tipo_pedido           VARCHAR(10)   NOT NULL CHECK (tipo_pedido IN ('MESA', 'LLEVAR', 'DELIVERY')),
    monto_subtotal        NUMERIC(12,2) NOT NULL CHECK (monto_subtotal >= 0),
    monto_descuento       NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (monto_descuento >= 0),
    monto_total           NUMERIC(12,2) NOT NULL CHECK (monto_total >= 0),
    metodo_pago           VARCHAR(10)   NOT NULL CHECK (metodo_pago IN ('EFECTIVO', 'QR', 'TARJETA', 'MIXTO')),
    estado_venta          VARCHAR(10)   NOT NULL DEFAULT 'COMPLETADA'
                          CHECK (estado_venta IN ('COMPLETADA', 'ANULADA')),
    estado                INT           NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro      VARCHAR(50)   NOT NULL,
    fecha_registro        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_ventas_total CHECK (monto_total = monto_subtotal - monto_descuento),
    CONSTRAINT ck_ventas_descuento CHECK (monto_descuento <= monto_subtotal)
);
CREATE INDEX idx_ventas_id_apertura ON ventas (id_apertura);
CREATE INDEX idx_ventas_id_usuario  ON ventas (id_usuario);
CREATE INDEX idx_ventas_fecha       ON ventas (fecha_registro);   -- reportes por fecha
CREATE UNIQUE INDEX uq_ventas_numero_ticket ON ventas (numero_factura_ticket);

-- Correlativo de tickets (lo consume VentasService: T-YYYYMMDD-000001)
CREATE SEQUENCE seq_numero_ticket START 1;

CREATE TABLE ventas_detalle (
    id_detalle       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venta         INT           NOT NULL REFERENCES ventas (id_venta),
    id_producto      INT           NOT NULL REFERENCES productos (id_producto),
    cantidad         INT           NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(12,2) NOT NULL CHECK (precio_unitario >= 0),  -- precio congelado al vender
    subtotal         NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    observacion      VARCHAR(255),                                         -- "sin mayonesa", "papas extra"
    estado           INT           NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro VARCHAR(50)   NOT NULL,
    fecha_registro   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_ventas_detalle_subtotal CHECK (subtotal = ROUND(cantidad * precio_unitario, 2))
);
CREATE INDEX idx_ventas_detalle_id_venta    ON ventas_detalle (id_venta);
CREATE INDEX idx_ventas_detalle_id_producto ON ventas_detalle (id_producto);

CREATE TABLE pagos_qr (
    id_pago_qr           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venta             INT           NOT NULL REFERENCES ventas (id_venta),
    transaccion_id       VARCHAR(100)  NOT NULL,
    qr_imagen_base64     TEXT,
    monto                NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    estado_pago          VARCHAR(10)   NOT NULL DEFAULT 'PENDIENTE'
                         CHECK (estado_pago IN ('PENDIENTE', 'PROCESADO', 'EXPIRADO')),
    fecha_expiracion     TIMESTAMP     NOT NULL,
    fecha_confirmacion   TIMESTAMP,
    datos_respuesta_json JSONB,
    estado               INT           NOT NULL DEFAULT 1 CHECK (estado IN (0, 1)),
    usuario_registro     VARCHAR(50)   NOT NULL,
    fecha_registro       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_pagos_qr_id_venta ON pagos_qr (id_venta);
CREATE UNIQUE INDEX uq_pagos_qr_transaccion ON pagos_qr (transaccion_id);
CREATE INDEX idx_pagos_qr_pendientes ON pagos_qr (fecha_expiracion) WHERE estado_pago = 'PENDIENTE';

-- ---------------------------------------------------------------------
-- 5. AUDITORÍA GLOBAL (LOGS)
-- Sin columnas de auditoría estándar: la tabla ES la auditoría (append-only)
-- ---------------------------------------------------------------------
CREATE TABLE auditoria_logs (
    id_log             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario         INT REFERENCES usuarios (id_usuario),   -- NULL: login fallido / acción de sistema
    tabla_afectada     VARCHAR(60) NOT NULL,
    accion             VARCHAR(20) NOT NULL
                       CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE', 'ANULACION_VENTA', 'LOGIN')),
    valores_anteriores TEXT,
    valores_nuevos     TEXT,
    ip_origen          VARCHAR(45),                            -- 45 caracteres cubren IPv6
    fecha_evento       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auditoria_logs_id_usuario ON auditoria_logs (id_usuario);
CREATE INDEX idx_auditoria_logs_tabla_fecha ON auditoria_logs (tabla_afectada, fecha_evento DESC);

COMMIT;

-- ---------------------------------------------------------------------
-- Datos semilla mínimos (opcional)
-- ---------------------------------------------------------------------
-- INSERT INTO roles (nombre, descripcion, usuario_registro) VALUES
--   ('ADMIN',  'Administrador del sistema', 'sistema'),
--   ('CAJERO', 'Operador de caja y ventas', 'sistema');
