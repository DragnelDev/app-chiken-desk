import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  idCategoria: number;

  @ApiPropertyOptional({ example: '7770001000012' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  codigoBarra?: string;

  @ApiProperty({ example: '1/4 Pollo con papas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiProperty({ example: 25.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  precioVenta: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  permiteCambioGuarnicion?: boolean;
}

export class UpdateProductoDto extends PartialType(CreateProductoDto) {}

export class AjusteStockDto {
  @ApiProperty({
    example: 20,
    description:
      'Cantidad a sumar (positiva) o restar (negativa) al stock actual',
  })
  @IsInt()
  cantidad: number;
}
