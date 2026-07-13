import { Controller, Get, Post, Body, Query } from '@nestjs/common'
import { RfidService } from './rfid.service'

@Controller('rfid')
export class RfidController {
  constructor(private readonly service: RfidService) {}

  // El script Python hace POST aquí (flujo anterior, se mantiene por compatibilidad)
  @Post('scan')
  registrarScan(@Body() body: { uid: string }) {
    return this.service.registrarScan(body.uid)
  }

  // El frontend hace polling aquí
  @Get('pendiente')
  obtenerPendiente() {
    return this.service.obtenerPendiente()
  }

  // Usado por el flujo "vincular llavero nuevo" en Gestión de Docentes.
  // No consume el escaneo — solo mira si hubo uno nuevo desde la hora dada.
  @Get('ultimo-escaneo')
  ultimoEscaneoDesde(@Query('desde') desde: string) {
    return this.service.ultimoEscaneoDesde(new Date(desde))
  }

  // El ESP32 hace POST aquí cada vez que detecta una tarjeta
  @Post('escanear')
  escanear(@Body() body: { uid: string; nombres: string; apellidos: string; rol: string }) {
    return this.service.escanear(body.uid, body.nombres, body.apellidos, body.rol)
  }
}