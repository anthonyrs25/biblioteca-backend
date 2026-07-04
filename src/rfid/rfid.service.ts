import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class RfidService {
  constructor(private prisma: PrismaService) { }

  async registrarScan(uid: string) {
    return this.prisma.rfidScan.create({
      data: { uid, leido: false },
    })
  }

  async obtenerPendiente() {
    const scan = await this.prisma.rfidScan.findFirst({
      where: { leido: false },
      orderBy: { createdAt: 'asc' },
    })
    if (!scan) return null

    await this.prisma.rfidScan.update({
      where: { id: scan.id },
      data: { leido: true },
    })

    const usuario = await this.prisma.usuario.findUnique({
      where: { rfid: scan.uid },
      include: {
        carreras: {
          include: {
            carrera: {
              include: { ciclos: { include: { materias: true } } },
            },
          },
        },
        prestamos: {
          where: { activo: true },
          include: { libro: true },
        },
      },
    })

    return { uid: scan.uid, usuario }
  }

  // Endpoint real usado por el ESP32: POST /rfid/escanear
  // Busca el usuario por UID; si no existe, queda registrado como pendiente de vincular
  async escanear(uid: string, nombres: string, apellidos: string, rol: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { rfid: uid },
      include: {
        carreras: {
          include: {
            carrera: {
              include: { ciclos: { include: { materias: true } } },
            },
          },
        },
        prestamos: {
          where: { activo: true },
          include: { libro: true },
        },
      },
    })

    if (usuario) {
      // Crear registro pendiente para que el frontend lo detecte via polling
      await this.prisma.rfidScan.create({
        data: { uid, leido: false },
      })
      return { autorizado: true, usuario }
    }

    await this.prisma.rfidScan.create({
      data: { uid, leido: false },
    })

    return {
      autorizado: false,
      mensaje: 'Tarjeta no registrada. Pendiente de vinculación por el bibliotecario.',
      datosLeidos: { nombres, apellidos, rol },
    }
  }

}