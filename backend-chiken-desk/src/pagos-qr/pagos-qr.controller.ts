import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolSistema } from '../common/enums';
import type { UsuarioAutenticado } from '../common/interfaces/usuario-autenticado.interface';
import { ConfirmarQrWebhookDto } from './dto/pago-qr.dto';
import { PagosQrService } from './pagos-qr.service';

@ApiTags('Pagos QR')
@Controller('pagos-qr')
export class PagosQrController {
  constructor(private readonly service: PagosQrService) {}

  @ApiBearerAuth()
  @Post('venta/:idVenta')
  @ApiOperation({
    summary: 'Generar (o reutilizar el vigente) el QR de una venta',
  })
  generar(
    @Param('idVenta', ParseIntPipe) idVenta: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.generar(idVenta, user);
  }

  @ApiBearerAuth()
  @Get('venta/:idVenta')
  @ApiOperation({
    summary:
      'Estado del último pago QR (ideal para sondeo; no incluye la imagen)',
  })
  estado(
    @Param('idVenta', ParseIntPipe) idVenta: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.consultar(idVenta, user, false);
  }

  @ApiBearerAuth()
  @Get('venta/:idVenta/qr')
  @ApiOperation({ summary: 'Último pago QR incluyendo la imagen' })
  conImagen(
    @Param('idVenta', ParseIntPipe) idVenta: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.consultar(idVenta, user, true);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Post(':id/confirmar-manual')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Confirmación manual por un supervisor (sandbox / contingencia)',
  })
  confirmarManual(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UsuarioAutenticado,
  ) {
    return this.service.confirmarManual(id, user);
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiHeader({ name: 'x-webhook-secret', required: true })
  @ApiOperation({ summary: 'Webhook del banco/pasarela: confirma un pago QR' })
  async webhook(
    @Body() dto: ConfirmarQrWebhookDto,
    @Headers('x-webhook-secret') secreto?: string,
  ) {
    const pago = await this.service.confirmarWebhook(dto, secreto);
    return { ok: true, estadoPago: pago.estadoPago };
  }
}
