import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { EstadoVenta, MetodoPago, TipoPedido } from '../../common/enums';

export class DetalleVentaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  idProducto: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(999)
  cantidad: number;

  @ApiPropertyOptional({ example: 'sin mayonesa, papas extra' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  observacion?: string;
}

export class CreateVentaDto {
  @ApiProperty({ enum: TipoPedido })
  @IsEnum(TipoPedido)
  tipoPedido: TipoPedido;

  @ApiProperty({ enum: MetodoPago })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  clienteNombre?: string;

  @ApiPropertyOptional({ example: '1234567' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  clienteNitCi?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Descuento total en moneda (no %)',
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoDescuento?: number;

  @ApiProperty({ type: [DetalleVentaDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => DetalleVentaDto)
  detalles: DetalleVentaDto[];
}

export class AnularVentaDto {
  @ApiProperty({ example: 'Error de digitación del cajero' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(255)
  motivo: string;
}

export class FiltroVentasDto {
  @ApiPropertyOptional({ example: '2026-10-01' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  hasta?: string;

  @ApiPropertyOptional({ enum: EstadoVenta })
  @IsOptional()
  @IsEnum(EstadoVenta)
  estadoVenta?: EstadoVenta;

  @ApiPropertyOptional({ enum: MetodoPago })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idApertura?: number;

  @ApiPropertyOptional({
    description: 'Solo ADMIN: un CAJERO siempre ve sus propias ventas',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idUsuario?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
