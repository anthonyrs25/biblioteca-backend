import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { DocentesService } from './docentes.service'
import { RolesGuard } from '../auth/roles.guard'
import { Roles } from '../auth/roles.decorator'

@Controller('docentes')
export class DocentesController {
  constructor(private readonly service: DocentesService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get('rfid/:uid')
  findByRfid(@Param('uid') uid: string) {
    return this.service.findByRfid(uid)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Patch(':id/ciclos')
  actualizarCiclos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { carrera: string; ciclos: { numero: number; materias: string[] }[] }
  ) {
    return this.service.actualizarCiclosYMaterias(id, body.carrera, body.ciclos)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Post(':id/carreras')
  agregarCarrera(@Param('id', ParseIntPipe) id: number, @Body() body: { carrera: string }) {
    return this.service.agregarCarrera(id, body.carrera)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Delete(':id/carreras/:carrera')
  quitarCarrera(@Param('id', ParseIntPipe) id: number, @Param('carrera') carrera: string) {
    return this.service.quitarCarrera(id, decodeURIComponent(carrera))
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id)
  }
}