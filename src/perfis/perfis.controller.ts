import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajuste o caminho do seu guard se necessário
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { PerfisService } from './perfis.service';

@Controller('perfis')
@UseGuards(JwtAuthGuard)
export class PerfisController {
  constructor(private readonly perfisService: PerfisService) {}

  @Post()
  create(@Body() createPerfilDto: CreatePerfilDto) {
    return this.perfisService.create(createPerfilDto);
  }

  @Get()
  findAll() {
    return this.perfisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.perfisService.findOne(id);
  }
}