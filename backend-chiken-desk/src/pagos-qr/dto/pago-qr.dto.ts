import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Cuerpo que envía el banco/pasarela al confirmar un pago.
 * Ajusta este DTO al formato real de tu proveedor.
 */
export class ConfirmarQrWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  transaccionId: string;

  @ApiProperty({ example: 77.7 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto: number;

  @ApiPropertyOptional({ description: 'Respuesta completa del proveedor' })
  @IsOptional()
  @IsObject()
  datos?: Record<string, unknown>;
}
