import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common'
import { LibrosService } from './libros.service'

@Controller('libros')
export class LibrosController {
  constructor(private readonly service: LibrosService) {}

  @Get()
  findAll() {
    return this.service.findAll()
  }

  @Get('conteo-por-programa')
  conteoPorPrograma() {
    return this.service.conteoPorPrograma()
  }

  @Get('programas')
  listaProgramas() {
    return this.service.listaProgramas()
  }

  @Get('buscar')
  buscar(@Query('texto') texto?: string, @Query('programa') programa?: string) {
    return this.service.buscar(texto, programa)
  }

  @Get('codigo/:codigo')
  findByCodigo(@Param('codigo') codigo: string) {
    return this.service.findByCodigo(codigo)
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(Number(id), body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id))
  }
}