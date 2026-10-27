import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolSistema } from '../../common/enums';
import {
  AjusteStockDto,
  CreateProductoDto,
  UpdateProductoDto,
} from './dto/create-producto.dto';
import { FiltroProductosDto } from './dto/filtro-productos.dto';
import { ProductosService } from './productos.service';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly service: ProductosService) {}

  /** Público: menú de la landing y selector del POS. */
  @Public()
  @Get()
  findAll(@Query() filtro: FiltroProductosDto) {
    return this.service.findAll(filtro);
  }

  /** Búsqueda por lector de código de barras (cualquier usuario autenticado). */
  @ApiBearerAuth()
  @Get('codigo/:codigoBarra')
  findByCodigo(@Param('codigoBarra') codigoBarra: string) {
    return this.service.findByCodigoBarra(codigoBarra);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Post()
  create(@Body() dto: CreateProductoDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductoDto,
  ) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Patch(':id/stock')
  ajustarStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AjusteStockDto,
  ) {
    return this.service.ajustarStock(id, dto);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
