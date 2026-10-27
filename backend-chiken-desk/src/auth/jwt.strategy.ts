import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_TOKEN || 'tu_clave_secreta_super_segura_aqui',
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      rolId: payload.rolId,
    };
  }
}
