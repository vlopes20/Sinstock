import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SaldosEstoqueService } from './saldos-estoque.service';

@ApiTags('Saldos de Estoque')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('saldos-estoque')
export class SaldosEstoqueController {
  constructor(private readonly saldosEstoqueService: SaldosEstoqueService) {}

  @Get()
  @ApiOperation({ summary: 'Lista os saldos de estoque com paginação e filtros' })
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('filial_id') filialId?: string,
    @Query('produto_id') produtoId?: string,
  ) {
    return this.saldosEstoqueService.findAll(
      paginationDto,
      filialId ? parseInt(filialId, 10) : undefined,
      produtoId ? parseInt(produtoId, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca o detalhe do saldo de estoque por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.saldosEstoqueService.findOne(id);
  }
}