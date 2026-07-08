import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class EventosPublicosService {
  constructor(private prisma: PrismaService) {}

  // Registro público (sin login) — llamado desde Landing/Catálogo
  registrar(data: {
    tipo: string // "visita_pagina" | "busqueda" | "clic_libro"
    programa?: string
    texto?: string
    libroId?: number
  }) {
    return this.prisma.eventoPublico.create({ data })
  }

  totalVisitas() {
    return this.prisma.eventoPublico.count({ where: { tipo: 'visita_pagina' } })
  }

  // Libros con más clics desde resultados de búsqueda pública
  async librosMasBuscados() {
    const resultado = await this.prisma.eventoPublico.groupBy({
      by: ['libroId'],
      _count: { _all: true },
      where: { tipo: 'clic_libro', libroId: { not: null } },
      orderBy: { _count: { libroId: 'desc' } },
      take: 20,
    })
    const libros = await this.prisma.libro.findMany({
      where: { id: { in: resultado.map(r => r.libroId as number) } },
    })
    return resultado.map(r => ({
      libro: libros.find(l => l.id === r.libroId) || null,
      clics: r._count._all,
    }))
  }
}