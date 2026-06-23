import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DocentesService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los docentes con sus carreras, ciclos y materias
  findAll() {
    return this.prisma.docente.findMany({
      include: {
        carreras: {
          include: {
            carrera: {
              include: { ciclos: { include: { materias: true } } },
            },
          },
        },
      },
    })
  }

  // Buscar un docente por el UID de su tarjeta RFID
  // Incluye también sus préstamos activos (para saber si puede devolver algo)
  findByRfid(rfid: string) {
    return this.prisma.docente.findUnique({
      where: { rfid },
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
  }

  // Crear un docente nuevo con sus carreras/ciclos/materias
  // connectOrCreate evita duplicar una carrera si ya existe (ej: "Desarrollo de Software")
  create(data: {
    rfid: string
    nombre: string
    iniciales: string
    carreras: {
      nombre: string
      ciclos: { numero: number; materias: string[] }[]
    }[]
  }) {
    return this.prisma.docente.create({
      data: {
        rfid: data.rfid,
        nombre: data.nombre,
        iniciales: data.iniciales,
        carreras: {
          create: data.carreras.map(c => ({
            carrera: {
              connectOrCreate: {
                where: { nombre: c.nombre },
                create: {
                  nombre: c.nombre,
                  ciclos: {
                    create: c.ciclos.map(ci => ({
                      numero: ci.numero,
                      materias: {
                        create: ci.materias.map(m => ({ nombre: m })),
                      },
                    })),
                  },
                },
              },
            },
          })),
        },
      },
    })
  }

  // Actualizar datos de un docente (ej: cambiar el RFID si se le da un llavero nuevo)
  update(id: number, data: Partial<{ rfid: string; nombre: string; iniciales: string }>) {
    return this.prisma.docente.update({
      where: { id },
      data,
    })
  }

  // Eliminar un docente
  remove(id: number) {
    return this.prisma.docente.delete({
      where: { id },
    })
  }
}