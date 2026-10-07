import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BuscaGlobalService } from './busca-global.service';
import { BuscaGlobalDto } from './dto/busca-global.dto';

@ApiTags('Busca Global')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('busca-global')
export class BuscaGlobalController {
  constructor(private readonly buscaGlobalService: BuscaGlobalService) {}

  @Get()
  @ApiOperation({ summary: 'Realiza pesquisa multi-critério centralizada no sistema' })
  buscar(@Query() query: BuscaGlobalDto) {
    return this.buscaGlobalService.buscar(query);
  }
}