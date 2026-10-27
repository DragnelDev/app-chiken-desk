import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  idRol: number;

  @ApiProperty({ example: 'María' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombres: string;

  @ApiProperty({ example: 'Quispe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellidos: string;

  @ApiProperty({ example: '1234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  ci: string;

  @ApiProperty({ example: 'mquispe' })
  @IsString()
  @Matches(/^[a-zA-Z0-9._-]{3,50}$/, {
    message: 'usuario: 3 a 50 caracteres (letras, números, . _ -)',
  })
  usuario: string;

  // bcrypt solo considera los primeros 72 bytes
  @ApiProperty({ minLength: 6, maxLength: 72 })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password: string;
}

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {}
