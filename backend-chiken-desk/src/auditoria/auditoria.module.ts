import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaController } from './auditoria.controller';
import { AuditoriaService } from './auditoria.service';
import { AuditSubscriber } from './audit.subscriber';
import { AuditoriaLogEntity } from './entities/auditoria-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaLogEntity])],
  controllers: [AuditoriaController],
  providers: [AuditoriaService, AuditSubscriber],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
