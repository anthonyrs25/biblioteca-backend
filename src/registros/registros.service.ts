import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class RegistrosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.registro.findMany({
      orderBy: { fecha: 'desc' },
      include: { usuario: true },
    })
  }

  findByMes(anio: number, mes: number) {
    const inicio = new Date(anio, mes - 1, 1)
    const fin = new Date(anio, mes, 1)
    return this.prisma.registro.findMany({
      where: { fecha: { gte: inicio, lt: fin } },
      orderBy: { fecha: 'desc' },
      include: { usuario: true },
    })
  }

  create(data: {
    tipo: string
    usuarioId: number
    actividad?: string
    detalle?: string
    carrera?: string
    ciclo?: number
    materia?: string
    jornada?: string
    libroId?: number
  }) {
    return this.prisma.registro.create({ data })
  }

  async stats(anio: number, mes: number) {
    const registros = await this.findByMes(anio, mes)

    const porCarreraMap: Record<string, number> = {}
    for (const r of registros) {
      if (r.carrera) {
        porCarreraMap[r.carrera] = (porCarreraMap[r.carrera] || 0) + 1
      }
    }
    const porCarrera = Object.entries(porCarreraMap)
      .map(([carrera, visitas]) => ({ carrera, visitas }))
      .sort((a, b) => b.visitas - a.visitas)

    return {
      totalVisitas: registros.length,
      usos: registros.filter(r => r.tipo === 'uso').length,
      prestamos: registros.filter(r => r.tipo === 'prestamo').length,
      devoluciones: registros.filter(r => r.tipo === 'devolucion').length,
      porCarrera,
    }
  }
}