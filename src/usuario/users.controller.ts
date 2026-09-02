import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Apenas perfil_id 1 (ADMIN) pode cadastrar novos usuários
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @Post()
  async criar(@Body() createUserDto: CreateUserDto) {
    return this.usersService.criar(createUserDto);
  }

  // Qualquer perfil autenticado pode consultar o seu próprio perfil
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}