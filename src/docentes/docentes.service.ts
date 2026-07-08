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
            carrera: true,
            ciclos: { include: { materias: true } },
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
            carrera: true,
            ciclos: { include: { materias: true } },
          },
        },
        prestamos: {
          where: { activo: true },
          include: { libro: true },
        },
      },
    })
  }

  async create(data: {
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
    const usuario = await this.prisma.usuario.create({
      data: {
        rfid: data.rfid,
        nombre: data.nombre,
        iniciales: data.iniciales,
        rol: data.rol || 'usuario',
        tipoPersona: data.tipoPersona || 'DOCENTE',
      },
    })

    if (data.carreras) {
      for (const c of data.carreras) {
        const carrera = await this.prisma.carrera.upsert({
          where: { nombre: c.nombre },
          update: {},
          create: { nombre: c.nombre },
        })

        // Cada docente tiene su propia fila de UsuarioCarrera → sus propios
        // ciclos → sus propias materias. Nunca comparte ciclos con otro
        // docente de la misma carrera, aunque tengan el mismo número de ciclo.
        await this.prisma.usuarioCarrera.create({
          data: {
            usuarioId: usuario.id,
            carreraId: carrera.id,
            ciclos: {
              create: c.ciclos.map(ci => ({
                numero: ci.numero,
                materias: {
                  create: ci.materias.map(m => ({ nombre: m })),
                },
              })),
            },
          },
        })
      }
    }

    return usuario
  }

  update(id: number, data: Partial<{
    rfid: string
    nombre: string
    iniciales: string
    rol: string
  }>) {
    return this.prisma.usuario.update({
      where: { id },
      data,
    })
  }

  async actualizarCiclosYMaterias(
    usuarioId: number,
    ciclos: { numero: number; materias: string[] }[]
  ) {
    const uc = await this.prisma.usuarioCarrera.findFirst({ where: { usuarioId } })
    if (!uc) return { ok: false, mensaje: 'Docente sin carrera asignada' }

    for (const ciclo of ciclos) {
      // Busca el ciclo dentro de ESTE docente-carrera específico, nunca en
      // los de otro docente aunque compartan carrera y número de ciclo
      let cicloDb = await this.prisma.ciclo.findFirst({
        where: { numero: ciclo.numero, usuarioCarreraId: uc.id },
      })

      if (!cicloDb) {
        cicloDb = await this.prisma.ciclo.create({
          data: { numero: ciclo.numero, usuarioCarreraId: uc.id },
        })
      }

      await this.prisma.materia.deleteMany({ where: { cicloId: cicloDb.id } })

      for (const nombre of ciclo.materias) {
        if (nombre.trim()) {
          await this.prisma.materia.create({
            data: { nombre: nombre.trim(), cicloId: cicloDb.id },
          })
        }
      }
    }

    return { ok: true }
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