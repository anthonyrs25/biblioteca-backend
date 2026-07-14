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

  // Registrar a alguien por PRIMERA VEZ es tarea del día a día — la necesita
  // el bibliotecario para no depender de un admin cada vez que llega gente nueva.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'bibliotecario')
  @Post()
  create(@Body() body: any) {
    return this.service.create(body)
  }

  // Editar a alguien que YA EXISTE (nombre, RFID, iniciales) es reconfiguración,
  // no operación diaria — solo admin.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.service.update(id, body)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/ciclos')
  actualizarCiclos(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { carrera: string; ciclos: { numero: number; materias: string[]; jornada?: string }[] }
  ) {
    return this.service.actualizarCiclosYMaterias(id, body.carrera, body.ciclos)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post(':id/carreras')
  agregarCarrera(@Param('id', ParseIntPipe) id: number, @Body() body: { carrera: string }) {
    return this.service.agregarCarrera(id, body.carrera)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id/carreras/:carrera')
  quitarCarrera(@Param('id', ParseIntPipe) id: number, @Param('carrera') carrera: string) {
    return this.service.quitarCarrera(id, decodeURIComponent(carrera))
  }

  // Decidir quién tiene qué nivel de poder en el sistema es la acción más
  // sensible de todas — exclusiva de admin, nadie puede auto-ascenderse.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/rol')
  cambiarRol(@Param('id', ParseIntPipe) id: number, @Body() body: { rol: string }) {
    return this.service.cambiarRol(id, body.rol)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('papelera')
  findEliminados() {
    return this.service.findEliminados()
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/restaurar')
  restaurar(@Param('id', ParseIntPipe) id: number) {
    return this.service.restaurar(id)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id)
  }
}