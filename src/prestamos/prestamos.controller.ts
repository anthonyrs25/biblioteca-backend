import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common'
import { PrestamosService } from './prestamos.service'

@Controller('prestamos')
export class PrestamosController {
  constructor(private readonly service: PrestamosService) {}

  @Get('activos')
  findActivos() {
    return this.service.findActivos()
  }

  @Get('docente/:id')
  findByDocente(@Param('id') id: string) {
    return this.service.findByDocente(Number(id))
  }

  @Post()
  crear(@Body() body: { docenteId: number; libroId: number }) {
    return this.service.crear(body.docenteId, body.libroId)
  }

  @Patch('devolver/:id')
  devolver(@Param('id') id: string) {
    return this.service.devolver(Number(id))
  }
}