import { Body, Controller, Get, HttpCode, Ip, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT' })
  login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.authService.login(dto, ip?.replace('::ffff:', ''));
  }

  @ApiBearerAuth()
  @Get('perfil')
  @ApiOperation({ summary: 'Datos del usuario autenticado' })
  perfil(@CurrentUser() usuario: UsuarioAutenticado) {
    return usuario;
  }
}
