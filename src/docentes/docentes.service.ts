import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DocentesService {
  constructor(private prisma: PrismaService) {}

  // Obtener todos los usuarios (docentes/estudiantes/invitados) con sus carreras, ciclos y materias
  findAll() {
    return this.prisma.usuario.findMany({
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

  // Buscar un usuario por el UID de su tarjeta RFID
  findByRfid(rfid: string) {
    return this.prisma.usuario.findUnique({
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

  // Crear un usuario nuevo (docente) con sus carreras/ciclos/materias
  create(data: {
    rfid?: string
    nombre: string
    iniciales?: string
    rol?: string
    tipoPersona?: string
    carreras?: {
      nombre: string
      ciclos: { numero: number; materias: string[] }[]
    }[]
  }) {
    return this.prisma.usuario.create({
      data: {
        rfid: data.rfid,
        nombre: data.nombre,
        iniciales: data.iniciales,
        rol: data.rol || 'usuario',
        tipoPersona: data.tipoPersona || 'DOCENTE',
        carreras: data.carreras
          ? {
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
            }
          : undefined,
      },
    })
  }

  // Actualizar datos de un usuario (ej: cambiar el RFID si se le da un llavero nuevo)
  update(id: number, data: Partial<{ rfid: string; nombre: string; iniciales: string; rol: string }>) {
    return this.prisma.usuario.update({
      where: { id },
      data,
    })
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    })
  }

  // Buscar por UID exacto, usado por el endpoint /rfid/escanear del ESP32
  buscarPorUid(uid: string) {
    return this.prisma.usuario.findUnique({
      where: { rfid: uid },
    })
  }
}