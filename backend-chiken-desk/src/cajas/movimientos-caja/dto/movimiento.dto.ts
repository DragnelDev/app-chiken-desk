import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoMovimiento } from '../../../common/enums';

export class CreateMovimientoDto {
  @ApiPropertyOptional({ description: 'Por defecto, tu caja abierta' })
  @IsOptional()
  @IsInt()
  idApertura?: number;

  @ApiProperty({ enum: TipoMovimiento })
  @IsEnum(TipoMovimiento)
  tipoMovimiento: TipoMovimiento;

  @ApiProperty({ example: 50 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999)
  monto: number;

  @ApiProperty({ example: 'Compra de gas' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  concepto: string;
}

export class FiltroMovimientosDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  idApertura: number;
}
