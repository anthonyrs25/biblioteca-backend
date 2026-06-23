import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class LibrosService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los libros, ordenados por título
  findAll() {
    return this.prisma.libro.findMany({
      orderBy: { titulo: 'asc' },
    })
  }

  // Buscar un libro por su código (ej: LIB-001)
  findByCodigo(codigo: string) {
    return this.prisma.libro.findUnique({
      where: { codigo },
    })
  }

  // Crear un libro nuevo
  create(data: {
    codigo: string
    titulo: string
    autor: string
    anio: number
    categoria: string
    totalEjemplares: number
    disponibles: number
    descripcion: string
  }) {
    return this.prisma.libro.create({ data })
  }

  // Actualizar campos de un libro (ej: cambiar disponibles al prestar/devolver)
  update(id: number, data: Partial<{
    titulo: string
    autor: string
    totalEjemplares: number
    disponibles: number
  }>) {
    return this.prisma.libro.update({
      where: { id },
      data,
    })
  }

  // Eliminar un libro
  remove(id: number) {
    return this.prisma.libro.delete({
      where: { id },
    })
  }
}