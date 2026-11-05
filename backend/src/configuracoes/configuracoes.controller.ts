import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SinstockSettingsService } from './configuracoes.service';
import {
  CompanySettingsDto,
  PreferencesDto,
  StockSettingsDto,
} from './dto/settings.dto';
type UserRequest = { user: { userId: number } };
@Controller('configuracoes')
@UseGuards(JwtAuthGuard)
export class ConfiguracoesController {
  constructor(private readonly settings: SinstockSettingsService) {}
  @Get('publicas')
  publicSettings() {
    return this.settings.publicSettings();
  }
  @Get('preferencias')
  preferences(@Req() req: UserRequest) {
    return this.settings.preferences(req.user.userId);
  }
  @Patch('preferencias')
  savePreferences(@Req() req: UserRequest, @Body() dto: PreferencesDto) {
    return this.settings.savePreferences(req.user.userId, dto);
  }
  @Patch('empresa')
  @UseGuards(RolesGuard)
  @Roles(1)
  company(@Req() req: UserRequest, @Body() dto: CompanySettingsDto) {
    return this.settings.save('empresa', dto, req.user.userId);
  }
  @Patch('estoque')
  @UseGuards(RolesGuard)
  @Roles(1)
  stock(@Req() req: UserRequest, @Body() dto: StockSettingsDto) {
    return this.settings.save('estoque', dto, req.user.userId);
  }
}
