import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class PrestamosService {
  constructor(private prisma: PrismaService) {}

  findActivos() {
    return this.prisma.prestamo.findMany({
      where: { activo: true },
      include: { usuario: true, libro: true },
    })
  }

  findByDocente(usuarioId: number) {
    return this.prisma.prestamo.findMany({
      where: { usuarioId, activo: true },
      include: { libro: true },
    })
  }

  // Crear un préstamo nuevo. Si es para un invitado, se guardan sus datos puntuales
  // (nombreInvitado, tipoDocumento, numeroDocumento) directamente en el préstamo.
  async crear(
    usuarioId: number,
    libroId: number,
    datosInvitado?: { nombreInvitado?: string; tipoDocumento?: string; numeroDocumento?: string },
  ) {
    const [prestamo] = await this.prisma.$transaction([
      this.prisma.prestamo.create({
        data: {
          usuarioId,
          libroId,
          nombreInvitado: datosInvitado?.nombreInvitado,
          tipoDocumento: datosInvitado?.tipoDocumento,
          numeroDocumento: datosInvitado?.numeroDocumento,
        },
        include: { libro: true },
      }),
      this.prisma.libro.update({
        where: { id: libroId },
        data: { disponibles: { decrement: 1 } },
      }),
      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { prestamosActivos: { increment: 1 } },
      }),
    ])
    return prestamo
  }

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
      this.prisma.usuario.update({
        where: { id: prestamo.usuarioId },
        data: { prestamosActivos: { decrement: 1 } },
      }),
    ])
    return actualizado
  }
}