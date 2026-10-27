import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { EstadoCaja } from '../../../common/enums';

export class AbrirCajaDto {
  @ApiProperty({
    example: 200,
    description: 'Efectivo con el que inicia el turno',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  montoInicial: number;
}

export class CerrarCajaDto {
  @ApiProperty({
    example: 1350.5,
    description: 'Efectivo contado físicamente al cerrar',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(9999999999)
  montoCierre: number;
}

export class FiltroCajasDto {
  @ApiPropertyOptional({ enum: EstadoCaja })
  @IsOptional()
  @IsEnum(EstadoCaja)
  estadoCaja?: EstadoCaja;

  @ApiPropertyOptional()
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
