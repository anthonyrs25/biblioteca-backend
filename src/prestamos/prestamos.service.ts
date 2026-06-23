import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrestamosService {
  constructor(private prisma: PrismaService) {}

  // Todos los préstamos que siguen activos (no devueltos)
  findActivos() {
    return this.prisma.prestamo.findMany({
      where: { activo: true },
      include: { docente: true, libro: true },
    })
  }

  // Préstamos activos de un docente específico
  findByDocente(docenteId: number) {
    return this.prisma.prestamo.findMany({
      where: { docenteId, activo: true },
      include: { libro: true },
    })
  }

  // Crear un préstamo nuevo
  // Esto hace 3 cosas a la vez, en una sola transacción:
  // 1. Crea el registro de Prestamo
  // 2. Resta 1 al stock de "disponibles" del libro
  // 3. Suma 1 al contador "prestamosActivos" del docente
  // Si cualquiera de las 3 falla, las otras se revierten automáticamente
  async crear(docenteId: number, libroId: number) {
    const [prestamo] = await this.prisma.$transaction([
      this.prisma.prestamo.create({
        data: { docenteId, libroId },
        include: { libro: true },
      }),
      this.prisma.libro.update({
        where: { id: libroId },
        data: { disponibles: { decrement: 1 } },
      }),
      this.prisma.docente.update({
        where: { id: docenteId },
        data: { prestamosActivos: { increment: 1 } },
      }),
    ])
    return prestamo
  }

  // Registrar la devolución de un préstamo
  // Hace lo inverso: marca el préstamo como inactivo,
  // devuelve 1 al stock del libro, y resta 1 al contador del docente
  async devolver(prestamoId: number) {
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { id: prestamoId },
    })
    if (!prestamo) throw new Error('Préstamo no encontrado')

    const [actualizado] = await this.prisma.$transaction([
      this.prisma.prestamo.update({
        where: { id: prestamoId },
        data: { activo: false, fechaDevolucion: new Date() },
      }),
      this.prisma.libro.update({
        where: { id: prestamo.libroId },
        data: { disponibles: { increment: 1 } },
      }),
      this.prisma.docente.update({
        where: { id: prestamo.docenteId },
        data: { prestamosActivos: { decrement: 1 } },
      }),
    ])
    return actualizado
  }
}