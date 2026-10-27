import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:4200').split(','),
  });

  const swagger = new DocumentBuilder()
    .setTitle('ChikenDesk API')
    .setDescription(
      'API REST del POS para pollerías: ventas, cajas, pagos QR y auditoría',
    )
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  SwaggerModule.setup('apidoc', app, () =>
    SwaggerModule.createDocument(app, swagger),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(
    `ChikenDesk API en ${await app.getUrl()}  ·  Swagger: /apidoc`,
    'Bootstrap',
  );
}
bootstrap();
