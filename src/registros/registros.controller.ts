import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { RegistrosService } from './registros.service'

@Controller('registros')
export class RegistrosController {
  constructor(private readonly service: RegistrosService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get('mes/:anio/:mes')
  findByMes(@Param('anio') anio: string, @Param('mes') mes: string) {
    return this.service.findByMes(Number(anio), Number(mes))
  }

  @Get('stats/:anio/:mes')
  stats(@Param('anio') anio: string, @Param('mes') mes: string) {
    return this.service.stats(Number(anio), Number(mes))
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body)
  }
}