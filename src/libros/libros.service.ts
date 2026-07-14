import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class LibrosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.libro.findMany({
      where: { activo: true },
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

  // Soft-delete: nunca borramos de verdad — solo marcamos inactivo. Reversible.
  remove(id: number) {
    return this.prisma.libro.update({
      where: { id },
      data: { activo: false },
    })
  }

  // Papelera: libros eliminados, solo visible para admin
  findEliminados() {
    return this.prisma.libro.findMany({
      where: { activo: false },
      orderBy: { titulo: 'asc' },
    })
  }

  restaurar(id: number) {
    return this.prisma.libro.update({
      where: { id },
      data: { activo: true },
    })
  }

  // Importación por lote: en vez de N peticiones (una por libro), procesa todo
  // el archivo en una sola operación. Detecta duplicados por código antes de
  // insertar, para no reintentar libros que el bibliotecario ya subió antes.
  async crearLote(libros: {
    codigo: string
    titulo: string
    autor: string
    anio: number
    categoria: string
    totalEjemplares: number
    disponibles: number
    descripcion: string
  }[]) {
    const codigos = libros.map(l => l.codigo)
    const existentes = await this.prisma.libro.findMany({
      where: { codigo: { in: codigos } },
      select: { codigo: true, activo: true },
    })
    const existentesActivos = new Set(existentes.filter(e => e.activo).map(e => e.codigo))
    const existentesInactivos = existentes.filter(e => !e.activo).map(e => e.codigo)

    const nuevos = libros.filter(l => !existentesActivos.has(l.codigo) && !existentesInactivos.includes(l.codigo))

    // Si el código coincide con un libro que estaba en la papelera, lo revive
    // en vez de rechazarlo como duplicado — evita confusión al re-subir el Excel.
    if (existentesInactivos.length > 0) {
      await this.prisma.libro.updateMany({
        where: { codigo: { in: existentesInactivos } },
        data: { activo: true },
      })
    }

    if (nuevos.length > 0) {
      await this.prisma.libro.createMany({ data: nuevos, skipDuplicates: true })
    }

    return {
      total: libros.length,
      creados: nuevos.length,
      reactivados: existentesInactivos.length,
      duplicados: existentesActivos.size,
      codigosDuplicados: [...existentesActivos],
    }
  }

  // Todos los libros en el mismo formato de columnas del Excel institucional,
  // para exportar el catálogo completo desde el sistema
  exportarTodos() {
    return this.prisma.libro.findMany({ where: { activo: true }, orderBy: { codigo: 'asc' } })
  }

  // Conteo de libros agrupados por programa/carrera (para las tarjetas de la landing)
  async conteoPorPrograma() {
    const resultado = await this.prisma.libro.groupBy({
      by: ['programa'],
      _count: { _all: true },
      where: { programa: { not: null }, activo: true },
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
          { activo: true },
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
      where: { programa: { not: null }, activo: true },
      select: { programa: true },
      distinct: ['programa'],
      orderBy: { programa: 'asc' },
    })
    return resultado.map(r => r.programa)
  }
}