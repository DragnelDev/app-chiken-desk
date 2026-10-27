import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nombre de usuario del sistema',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  usuario: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
