import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PermissionUser } from '../auth/permission-policy';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import { BuscaGlobalService } from './busca-global.service';
import { BuscaGlobalDto } from './dto/busca-global.dto';

@ApiTags('Busca Global')
@ApiBearerAuth('JWT-auth')
@PermissionResource('busca-global')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('busca-global')
export class BuscaGlobalController {
  constructor(private readonly buscaGlobalService: BuscaGlobalService) {}

  @Get()
  @ApiOperation({
    summary: 'Realiza pesquisa multi-critério centralizada no sistema',
  })
  buscar(@Query() query: BuscaGlobalDto, @CurrentUser() user: PermissionUser) {
    return this.buscaGlobalService.buscar(query, user);
  }
}
