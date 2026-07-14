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


    const usuario = await this.prisma.usuario.findFirst({
      where: { rfid: scan.uid, activo: true },
      include: {
        carreras: {
          include: {
            carrera: true,
            ciclos: {
              include: {
                materias: true,
              },
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

  // Para "vincular llavero nuevo": no consume el escaneo (no marca leido),
  // solo mira si hubo alguno nuevo desde que se abrió el modal de vinculación.
  // Así no compite con el polling normal de /rfid/pendiente.
  async ultimoEscaneoDesde(desde: Date) {
    return this.prisma.rfidScan.findFirst({
      where: { createdAt: { gte: desde } },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Endpoint real usado por el ESP32: POST /rfid/escanear
  // Busca el usuario por UID; si no existe, queda registrado como pendiente de vincular
  async escanear(uid: string, nombres: string, apellidos: string, rol: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { rfid: uid, activo: true },
      include: {
        carreras: {
          include: {
            carrera: true,
            ciclos: {
              include: {
                materias: true,
              },
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