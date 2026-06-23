import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class LibrosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.libro.findMany({
      orderBy: { titulo: 'asc' },
    })
  }

  findByCodigo(codigo: string) {
    return this.prisma.libro.findUnique({
      where: { codigo },
    })
  }

  // Crear un libro o revista — acepta todos los metadatos del inventario institucional.
  create(data: {
    codigo: string
    titulo: string
    autor: string
    anio: number
    categoria: string
    totalEjemplares: number
    disponibles: number
    descripcion: string
    tipo?: string
    isbn?: string
    codigoDewey?: string
    codigoCutter?: string
    edicion?: string
    paginas?: number
    editorial?: string
    idioma?: string
    soloEnSala?: boolean
    programa?: string
    palabrasClave?: string
    citaBibliografica?: string
  }) {
    return this.prisma.libro.create({ data })
  }

  update(id: number, data: Partial<{
    titulo: string
    autor: string
    totalEjemplares: number
    disponibles: number
    categoria: string
    isbn: string
    editorial: string
    programa: string
  }>) {
    return this.prisma.libro.update({
      where: { id },
      data,
    })
  }

  remove(id: number) {
    return this.prisma.libro.delete({
      where: { id },
    })
  }

  // Conteo de libros agrupados por programa/carrera (para las tarjetas de la landing)
  async conteoPorPrograma() {
    const resultado = await this.prisma.libro.groupBy({
      by: ['programa'],
      _count: { _all: true },
      where: { programa: { not: null } },
    })
    return resultado.map(r => ({
      programa: r.programa,
      total: r._count._all,
    }))
  }

  // Búsqueda combinada: texto libre (código/título/autor) + filtro opcional de carrera
  buscar(texto?: string, programa?: string) {
    return this.prisma.libro.findMany({
      where: {
        AND: [
          programa ? { programa } : {},
          texto
            ? {
                OR: [
                  { codigo: { contains: texto, mode: 'insensitive' } },
                  { titulo: { contains: texto, mode: 'insensitive' } },
                  { autor: { contains: texto, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      orderBy: { titulo: 'asc' },
      take: 50,
    })
  }

  // Lista de programas/carreras distintos que existen en el catálogo
  async listaProgramas() {
    const resultado = await this.prisma.libro.findMany({
      where: { programa: { not: null } },
      select: { programa: true },
      distinct: ['programa'],
      orderBy: { programa: 'asc' },
    })
    return resultado.map(r => r.programa)
  }
}