import { Controller, Get, Post, Param, Body } from '@nestjs/common'
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
}