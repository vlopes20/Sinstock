import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SaldosEstoqueFilterDto } from './dto/saldos-estoque-filter.dto';
import { SaldosEstoqueService } from './saldos-estoque.service';
import { FilialQueryDto } from '../common/dto/filial-query.dto';

@ApiTags('Saldos de Estoque')
@ApiBearerAuth('JWT-auth')
@PermissionResource('saldos-estoque')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('saldos-estoque')
export class SaldosEstoqueController {
  constructor(private readonly saldosEstoqueService: SaldosEstoqueService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista os saldos de estoque com paginação e filtros',
  })
  findAll(@Query() filterDto: SaldosEstoqueFilterDto) {
    const { filial_id, produto_id, ...paginationDto } = filterDto;
    return this.saldosEstoqueService.findAll(
      paginationDto,
      filial_id,
      produto_id,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca o detalhe do saldo de estoque por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saldosEstoqueService.findOne(id);
  }

  @Get('resumo/atual')
  resumo(@Query() dto: FilialQueryDto) {
    return this.saldosEstoqueService.resumo(dto.filial_id);
  }
}
