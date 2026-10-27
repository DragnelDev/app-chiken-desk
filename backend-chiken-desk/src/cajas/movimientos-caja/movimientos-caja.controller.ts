import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsuarioAutenticado } from '../../common/interfaces/usuario-autenticado.interface';
import { CreateMovimientoDto, FiltroMovimientosDto } from './dto/movimiento.dto';
import { MovimientosCajaService } from './movimientos-caja.service';

@ApiTags('Movimientos de caja')
@ApiBearerAuth()
@Controller('movimientos-caja')
export class MovimientosCajaController {
  constructor(private readonly service: MovimientosCajaService) {}

  @Post()
  crear(@Body() dto: CreateMovimientoDto, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.crear(dto, user);
  }

  @Get()
  listar(@Query() filtro: FiltroMovimientosDto, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.listar(filtro.idApertura, user);
  }

  @Delete(':id')
  @HttpCode(204)
  anular(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.anular(id, user);
  }
}
