import { Controller, Get, Post, Body } from '@nestjs/common'
import { RfidService } from './rfid.service'

@Controller('rfid')
export class RfidController {
  constructor(private readonly service: RfidService) {}

  // El script Python hace POST aquí
  @Post('scan')
  registrarScan(@Body() body: { uid: string }) {
    return this.service.registrarScan(body.uid)
  }

  // El frontend hace polling aquí
  @Get('pendiente')
  obtenerPendiente() {
    return this.service.obtenerPendiente()
  }
}