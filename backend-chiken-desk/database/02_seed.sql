-- =====================================================================
-- ChikenDesk · Datos iniciales (idempotente: se puede ejecutar varias veces)
-- Usuario inicial:  admin / Admin123*   (CÁMBIALA al primer ingreso)
-- Requiere la extensión pgcrypto para generar el hash bcrypt de la contraseña.
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO roles (nombre, descripcion, usuario_registro)
SELECT v.nombre, v.descripcion, 'sistema'
  FROM (VALUES ('ADMIN',  'Administrador del sistema'),
               ('CAJERO', 'Operador de caja y ventas')) AS v(nombre, descripcion)
 WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE LOWER(r.nombre) = LOWER(v.nombre) AND r.estado = 1);

INSERT INTO usuarios (id_rol, nombres, apellidos, ci, usuario, password_hash, usuario_registro)
SELECT r.id_rol, 'Administrador', 'Sistema', '0000000', 'admin',
       crypt('Admin123*', gen_salt('bf', 10)), 'sistema'
  FROM roles r
 WHERE r.nombre = 'ADMIN' AND r.estado = 1
   AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE LOWER(u.usuario) = 'admin' AND u.estado = 1);

INSERT INTO categorias (nombre, descripcion, usuario_registro)
SELECT v.nombre, v.descripcion, 'sistema'
  FROM (VALUES ('Pollo a la brasa', 'Pollo entero, medio y cuartos'),
               ('Combos',           'Combos familiares y personales'),
               ('Acompañamientos',  'Papas, ensaladas y arroz'),
               ('Bebidas',          'Gaseosas, jugos y agua')) AS v(nombre, descripcion)
 WHERE NOT EXISTS (SELECT 1 FROM categorias c WHERE LOWER(c.nombre) = LOWER(v.nombre) AND c.estado = 1);

INSERT INTO productos (id_categoria, codigo_barra, nombre, descripcion, precio_venta, stock, permite_cambio_guarnicion, usuario_registro)
SELECT c.id_categoria, v.codigo, v.nombre, v.descripcion, v.precio, v.stock, v.cambio, 'sistema'
  FROM (VALUES
        ('Pollo a la brasa', NULL,            '1/4 de pollo',        'Con papas y ensalada',          28.00, 50, TRUE),
        ('Pollo a la brasa', NULL,            '1/2 pollo',           'Con papas y ensalada',          52.00, 40, TRUE),
        ('Pollo a la brasa', NULL,            'Pollo entero',        'Con papas grandes y ensalada', 98.00, 30, TRUE),
        ('Combos',           NULL,            'Combo familiar',      '1 pollo, papas y gaseosa 2 L', 125.00, 20, FALSE),
        ('Acompañamientos',  NULL,            'Porción de papas',    'Papas fritas',                  12.00, 100, FALSE),
        ('Bebidas',          '7770001000012', 'Gaseosa 500 ml',      NULL,                             7.00, 120, FALSE),
        ('Bebidas',          '7770001000029', 'Jugo natural',        'Vaso 400 ml',                   10.00, 60, FALSE)
       ) AS v(categoria, codigo, nombre, descripcion, precio, stock, cambio)
  JOIN categorias c ON c.nombre = v.categoria AND c.estado = 1
 WHERE NOT EXISTS (SELECT 1 FROM productos p WHERE LOWER(p.nombre) = LOWER(v.nombre) AND p.estado = 1);
