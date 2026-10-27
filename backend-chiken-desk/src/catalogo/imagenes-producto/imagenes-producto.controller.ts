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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolSistema } from '../../common/enums';
import { SubirImagenDto } from './dto/subir-imagen.dto';
import { ImagenesProductoService } from './imagenes-producto.service';
import { opcionesSubidaImagen } from './upload.config';

@ApiTags('Imágenes de producto')
@Controller()
export class ImagenesProductoController {
  constructor(private readonly service: ImagenesProductoService) {}

  @Public()
  @Get('productos/:idProducto/imagenes')
  listar(@Param('idProducto', ParseIntPipe) idProducto: number) {
    return this.service.listar(idProducto);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Post('productos/:idProducto/imagenes')
  @ApiOperation({
    summary: 'Subir imagen (multipart/form-data, campo "file", máx. 2 MB)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
        esPrincipal: { type: 'boolean' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', opcionesSubidaImagen()))
  subir(
    @Param('idProducto', ParseIntPipe) idProducto: number,
    @UploadedFile() archivo: Express.Multer.File,
    @Body() dto: SubirImagenDto,
  ) {
    return this.service.registrarSubida(idProducto, archivo, dto.esPrincipal);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Patch('imagenes-producto/:id/principal')
  marcarPrincipal(@Param('id', ParseIntPipe) id: number) {
    return this.service.marcarPrincipal(id);
  }

  @ApiBearerAuth()
  @Roles(RolSistema.ADMIN)
  @Delete('imagenes-producto/:id')
  @HttpCode(204)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}
