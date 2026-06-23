import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common'
import { DocentesService } from './docentes.service'

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