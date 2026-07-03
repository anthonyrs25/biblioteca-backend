import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DocentesService {
  constructor(private prisma: PrismaService) {}

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

  update(id: number, data: Partial<{ rfid: string; nombre: string; iniciales: string; rol: string }>) {
    return this.prisma.usuario.update({
      where: { id },
      data,
    })
  }

  async remove(id: number) {
    await this.prisma.usuarioCarrera.deleteMany({ where: { usuarioId: id } })
    return this.prisma.usuario.delete({ where: { id } })
  }

  buscarPorUid(uid: string) {
    return this.prisma.usuario.findUnique({
      where: { rfid: uid },
    })
  }
}