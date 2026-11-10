import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionResource,
  PermissionsGuard,
} from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChamadosService, SupportUser } from './chamados.service';
import {
  CriarChamadoDto,
  FaqDto,
  FiltroChamadosDto,
  FiltroFaqDto,
  MensagemChamadoDto,
  StatusChamadoDto,
} from './dto/criar-chamado.dto';
type UserRequest = { user: SupportUser };
@Controller('chamados')
@PermissionResource('chamados')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ChamadosController {
  constructor(private readonly service: ChamadosService) {}
  @Post()
  criar(@Body() dto: CriarChamadoDto, @Req() req: UserRequest) {
    return this.service.criar(dto, req.user);
  }
  @Get()
  listar(@Query() dto: FiltroChamadosDto, @Req() req: UserRequest) {
    return this.service.listarTodos(dto, req.user);
  }
  @Get('faq')
  faq(@Query() dto: FiltroFaqDto, @Req() req: UserRequest) {
    return this.service.faq(dto, req.user);
  }
  @Post('faq')
  @UseGuards(RolesGuard)
  @Roles(1)
  createFaq(@Body() dto: FaqDto) {
    return this.service.saveFaq(undefined, dto);
  }
  @Patch('faq/:id')
  @UseGuards(RolesGuard)
  @Roles(1)
  updateFaq(@Param('id', ParseIntPipe) id: number, @Body() dto: FaqDto) {
    return this.service.saveFaq(id, dto);
  }
  @Delete('faq/:id')
  @UseGuards(RolesGuard)
  @Roles(1)
  deleteFaq(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteFaq(id);
  }
  @Get('anexos/:id')
  async attachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: UserRequest,
    @Res() res: Response,
  ) {
    const file = await this.service.attachment(id, req.user);
    res.set({
      'Content-Type': file.mime,
      'Content-Disposition':
        'attachment; filename="anexo"; filename*=UTF-8\'\'' +
        encodeURIComponent(file.nome),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    });
    res.end(Buffer.from(file.conteudo));
  }
  @Get(':id')
  detalhe(@Param('id', ParseIntPipe) id: number, @Req() req: UserRequest) {
    return this.service.buscarPorId(id, req.user);
  }
  @Patch(':id/status')
  status(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusChamadoDto,
    @Req() req: UserRequest,
  ) {
    return this.service.atualizarStatus(id, dto.status, req.user);
  }
  @Post(':id/mensagens')
  mensagem(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MensagemChamadoDto,
    @Req() req: UserRequest,
  ) {
    return this.service.mensagem(id, dto.mensagem, req.user);
  }
  @Post(':id/anexos')
  @UseInterceptors(
    FileInterceptor('arquivo', {
      limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    }),
  )
  upload(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: { originalname: string; buffer: Buffer },
    @Req() req: UserRequest,
  ) {
    return this.service.upload(id, file, req.user);
  }
}
