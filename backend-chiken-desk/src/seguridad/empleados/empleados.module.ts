import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadosService } from './empleados.service';
import { EmpleadosController } from './empleados.controller';
import { EmpleadoEntity } from './entities/empleado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmpleadoEntity])],
  controllers: [EmpleadosController],
  providers: [EmpleadosService],
})
export class EmpleadosModule {}
