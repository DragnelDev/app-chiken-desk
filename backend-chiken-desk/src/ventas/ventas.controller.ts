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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { AnularVentaDto, CreateVentaDto, FiltroVentasDto } from './dto/venta.dto';
import { VentasService } from './ventas.service';

@ApiTags('Ventas')
@ApiBearerAuth()
@Controller('ventas')
export class VentasController {
  constructor(private readonly service: VentasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar venta (requiere caja abierta). Si es QR devuelve también el cobro' })
  crear(@Body() dto: CreateVentaDto, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.crear(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar ventas (el cajero ve solo las suyas)' })
  findAll(@Query() filtro: FiltroVentasDto, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.findAll(filtro, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Venta con detalle (para reimprimir el ticket)' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: UsuarioAutenticado) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/anular')
  @ApiOperation({ summary: 'Anular venta: devuelve stock y deja rastro en auditoría' })
  anular(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AnularVentaDto,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.anular(id, dto, user);
  }
}
