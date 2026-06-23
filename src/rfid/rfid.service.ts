import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class RfidService {
  constructor(private prisma: PrismaService) {}

  // El script Python llama esto cada vez que el ESP32 detecta una tarjeta
  async registrarScan(uid: string) {
    return this.prisma.rfidScan.create({
      data: { uid, leido: false },
    })
  }

  // El frontend pregunta esto repetidamente (polling)
  // Si hay un scan pendiente, lo marca como leído y devuelve los datos del docente
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

    const docente = await this.prisma.docente.findUnique({
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

    return { uid: scan.uid, docente }
  }
}