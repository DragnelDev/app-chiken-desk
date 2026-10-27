import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  usuario: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password_hash: string;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  rolId: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  empleadoId: number;
}

export class UpdateUsuarioDto extends CreateUsuarioDto {}
