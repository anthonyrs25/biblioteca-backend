import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PrestamosService } from './prestamos.service'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Get('activos')
  findActivos() {
    return this.service.findActivos()
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Get('docente/:id')
  findByDocente(@Param('id') id: string) {
    return this.service.findByDocente(Number(id))
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Post()
  crear(@Body() body: { docenteId: number; libroId: number }) {
    return this.service.crear(body.docenteId, body.libroId)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Patch('devolver/:id')
  devolver(@Param('id') id: string) {
    return this.service.devolver(Number(id))
  }
}