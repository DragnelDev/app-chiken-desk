import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolSistema } from '../common/enums';
import { AuditoriaService } from './auditoria.service';
import { FiltroAuditoriaDto } from './dto/filtro-auditoria.dto';

@ApiTags('Auditoría')
@ApiBearerAuth()
@Roles(RolSistema.ADMIN)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly service: AuditoriaService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar la bitácora global (solo ADMIN)' })
  buscar(@Query() filtro: FiltroAuditoriaDto) {
    return this.service.buscar(filtro);
  }
}
