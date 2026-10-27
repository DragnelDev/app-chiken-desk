import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AperturasCajaController } from './aperturas-caja.controller';
import { AperturasCajaService } from './aperturas-caja.service';
import { AperturaCajaEntity } from './entities/apertura-caja.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AperturaCajaEntity])],
  controllers: [AperturasCajaController],
  providers: [AperturasCajaService],
  exports: [AperturasCajaService],
})
export class AperturasCajaModule {}
