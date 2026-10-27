import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { AppController } from './app.controller';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { AperturasCajaModule } from './cajas/aperturas-caja/aperturas-caja.module';
import { MovimientosCajaModule } from './cajas/movimientos-caja/movimientos-caja.module';
import { CategoriasModule } from './catalogo/categorias/categorias.module';
import { ImagenesProductoModule } from './catalogo/imagenes-producto/imagenes-producto.module';
import { ProductosModule } from './catalogo/productos/productos.module';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { DashboardModule } from './dashboard/dashboard.module';
import { PagosQrModule } from './pagos-qr/pagos-qr.module';
import { RolesModule } from './seguridad/roles/roles.module';
import { UsuariosModule } from './seguridad/usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get('DB_PORT', 5432)),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true,
        // El esquema se gestiona con database/01_schema.sql (índices parciales, CHECK, secuencia).
        // synchronize queda SIEMPRE en false: TypeORM podría alterar o borrar columnas.
        synchronize: false,
      }),
    }),
    // Sirve las imágenes subidas: /uploads/productos/<archivo>
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
      },
    }),
    AuditoriaModule,
    RolesModule,
    UsuariosModule,
    AuthModule,
    CategoriasModule,
    ProductosModule,
    ImagenesProductoModule,
    AperturasCajaModule,
    MovimientosCajaModule,
    VentasModule,
    PagosQrModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    // Orden importante: primero autentica (JWT), luego autoriza (roles).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
    { provide: APP_FILTER, useClass: TypeOrmExceptionFilter },
  ],
})
export class AppModule {}
