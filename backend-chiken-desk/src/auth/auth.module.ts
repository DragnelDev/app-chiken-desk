import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    SeguridadModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_TOKEN || 'tu_clave_secreta_super_segura_aqui',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
