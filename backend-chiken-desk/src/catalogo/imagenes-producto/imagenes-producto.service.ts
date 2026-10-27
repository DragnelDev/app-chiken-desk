import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Estado } from '../../common/enums';
import { ProductoEntity } from '../productos/entities/producto.entity';
import { ImagenProductoEntity } from './entities/imagen-producto.entity';
import {
  borrarArchivoSilencioso,
  tieneFirmaDeImagen,
  URL_BASE_PRODUCTOS,
} from './upload.config';

@Injectable()
export class ImagenesProductoService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Guarda el registro de una imagen ya escrita en disco por Multer.
   * Mantiene sincronizado productos.imagen_principal_url dentro de una transacción.
   */
  async registrarSubida(
    idProducto: number,
    archivo: Express.Multer.File | undefined,
    esPrincipal?: boolean,
  ): Promise<ImagenProductoEntity> {
    if (!archivo)
      throw new BadRequestException('Falta el archivo (campo "file")');

    try {
      if (!tieneFirmaDeImagen(archivo.path)) {
        throw new BadRequestException(
          'El archivo no es una imagen JPG, PNG o WEBP válida',
        );
      }
      const url = `${URL_BASE_PRODUCTOS}/${archivo.filename}`;

      return await this.dataSource.transaction(async (manager) => {
        const producto = await manager.findOne(ProductoEntity, {
          where: { idProducto, estado: Estado.ACTIVO },
        });
        if (!producto)
          throw new NotFoundException(`Producto ${idProducto} no encontrado`);

        const activas = await manager.find(ImagenProductoEntity, {
          where: { idProducto, estado: Estado.ACTIVO },
        });
        const serPrincipal = esPrincipal === true || activas.length === 0;

        if (serPrincipal) {
          for (const previa of activas.filter((i) => i.esPrincipal)) {
            previa.esPrincipal = false;
            await manager.save(previa);
          }
        }

        const imagen = await manager.save(
          manager.create(ImagenProductoEntity, {
            idProducto,
            urlImagen: url,
            esPrincipal: serPrincipal,
          }),
        );

        if (serPrincipal) {
          producto.imagenPrincipalUrl = url;
          await manager.save(producto);
        }
        return imagen;
      });
    } catch (error) {
      borrarArchivoSilencioso(archivo.path); // no dejar archivos huérfanos si algo falla
      throw error;
    }
  }

  listar(idProducto: number): Promise<ImagenProductoEntity[]> {
    return this.dataSource.getRepository(ImagenProductoEntity).find({
      where: { idProducto, estado: Estado.ACTIVO },
      order: { esPrincipal: 'DESC', idImagen: 'ASC' },
    });
  }

  async marcarPrincipal(idImagen: number): Promise<ImagenProductoEntity> {
    return this.dataSource.transaction(async (manager) => {
      const imagen = await this.obtener(manager, idImagen);
      const hermanas = await manager.find(ImagenProductoEntity, {
        where: { idProducto: imagen.idProducto, estado: Estado.ACTIVO },
      });
      for (const otra of hermanas.filter(
        (i) => i.esPrincipal && i.idImagen !== idImagen,
      )) {
        otra.esPrincipal = false;
        await manager.save(otra);
      }
      imagen.esPrincipal = true;
      await manager.save(imagen);
      await this.sincronizarProducto(
        manager,
        imagen.idProducto,
        imagen.urlImagen,
      );
      return imagen;
    });
  }

  async eliminar(idImagen: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const imagen = await this.obtener(manager, idImagen);
      const eraPrincipal = imagen.esPrincipal;

      imagen.estado = Estado.BORRADO; // borrado lógico (el archivo queda en disco)
      imagen.esPrincipal = false;
      await manager.save(imagen);

      if (eraPrincipal) {
        // la más reciente que siga activa pasa a ser la principal
        const siguiente = await manager.findOne(ImagenProductoEntity, {
          where: { idProducto: imagen.idProducto, estado: Estado.ACTIVO },
          order: { idImagen: 'DESC' },
        });
        if (siguiente) {
          siguiente.esPrincipal = true;
          await manager.save(siguiente);
        }
        await this.sincronizarProducto(
          manager,
          imagen.idProducto,
          siguiente?.urlImagen ?? null,
        );
      }
    });
  }

  private async obtener(manager: DataSource['manager'], idImagen: number) {
    const imagen = await manager.findOne(ImagenProductoEntity, {
      where: { idImagen, estado: Estado.ACTIVO },
    });
    if (!imagen)
      throw new NotFoundException(`Imagen ${idImagen} no encontrada`);
    return imagen;
  }

  private async sincronizarProducto(
    manager: DataSource['manager'],
    idProducto: number,
    url: string | null,
  ) {
    const producto = await manager.findOne(ProductoEntity, {
      where: { idProducto },
    });
    if (producto) {
      producto.imagenPrincipalUrl = url;
      await manager.save(producto);
    }
  }
}
