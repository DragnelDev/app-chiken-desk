import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readSync,
  unlinkSync,
} from 'node:fs';
import { diskStorage } from 'multer';
import { join } from 'node:path';

export const MAX_IMAGEN_BYTES = 2 * 1024 * 1024; // 2 MB

const EXTENSION_POR_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const dirProductos = () =>
  join(process.cwd(), process.env.UPLOADS_DIR ?? 'uploads', 'productos');

/** Carpeta pública (relativa) con la que se arma la URL guardada en BD. */
export const URL_BASE_PRODUCTOS = '/uploads/productos';

export function opcionesSubidaImagen() {
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        const dir = dirProductos();
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      // Nombre generado por el servidor: nunca se usa el nombre que envía el cliente.
      filename: (_req, file, cb) =>
        cb(null, `${randomUUID()}${EXTENSION_POR_MIME[file.mimetype] ?? ''}`),
    }),
    limits: { fileSize: MAX_IMAGEN_BYTES, files: 1 },
    fileFilter: (
      _req: unknown,
      file: Express.Multer.File,
      cb: (error: Error | null, accept: boolean) => void,
    ) => {
      if (EXTENSION_POR_MIME[file.mimetype]) return cb(null, true);
      cb(
        new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'),
        false,
      );
    },
  };
}

/** El mimetype lo declara el cliente: se verifica también la firma real del archivo. */
export function tieneFirmaDeImagen(rutaArchivo: string): boolean {
  const buffer = Buffer.alloc(12);
  const fd = openSync(rutaArchivo, 'r');
  try {
    readSync(fd, buffer, 0, 12, 0);
  } finally {
    closeSync(fd);
  }
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  const png = buffer
    .subarray(0, 8)
    .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp =
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return jpeg || png || webp;
}

export function borrarArchivoSilencioso(rutaArchivo: string): void {
  try {
    unlinkSync(rutaArchivo);
  } catch {
    /* ya no existe: nada que hacer */
  }
}
