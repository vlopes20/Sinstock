import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFilialDto } from './dto/create-filial.dto';
import { FiliaisService } from './filiais.service';

@UseGuards(JwtAuthGuard)
@Controller('filiais')
export class FiliaisController {
  constructor(private readonly filiaisService: FiliaisService) {}

  @Post()
  create(@Body() dto: CreateFilialDto) {
    return this.filiaisService.create(dto);
  }

  @Get()
  findAll() {
    return this.filiaisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filiaisService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateFilialDto>,
  ) {
    return this.filiaisService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filiaisService.remove(id);
  }
}