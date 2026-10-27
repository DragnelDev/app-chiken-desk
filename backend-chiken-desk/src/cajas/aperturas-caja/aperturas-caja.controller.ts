import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolSistema } from '../../common/enums';
import type { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { AperturasCajaService } from './aperturas-caja.service';
import { AbrirCajaDto, CerrarCajaDto, FiltroCajasDto } from './dto/caja.dto';

@ApiTags('Cajas (turnos)')
@ApiBearerAuth()
@Controller('cajas')
export class AperturasCajaController {
  constructor(private readonly service: AperturasCajaService) {}

  @Post('abrir')
  @ApiOperation({ summary: 'Abrir caja (un solo turno abierto por usuario)' })
  abrir(@Body() dto: AbrirCajaDto, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.abrir(dto, user);
  }

  // Las rutas estáticas van antes que ":id"
  @Get('actual')
  @ApiOperation({
    summary: 'Mi caja abierta con su resumen (null si no tengo)',
  })
  actual(@CurrentUser() user: UsuarioAutenticado) {
    return this.service.actual(user);
  }

  @Roles(RolSistema.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Historial de cajas (solo ADMIN)' })
  findAll(@Query() filtro: FiltroCajasDto) {
    return this.service.findAll(filtro);
  }

  @Get(':id')
  detalle(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.detalle(id, user);
  }

  @Patch(':id/cerrar')
  @ApiOperation({
    summary: 'Cerrar caja: calcula la diferencia contra el efectivo esperado',
  })
  cerrar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CerrarCajaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.cerrar(id, dto, user);
  }
}
