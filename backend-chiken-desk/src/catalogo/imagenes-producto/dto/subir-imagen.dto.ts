import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class SubirImagenDto {
  @ApiPropertyOptional({
    description: 'Marcar como imagen principal (la primera imagen siempre lo es)',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  esPrincipal?: boolean;
}
