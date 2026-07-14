import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'

@Injectable()
export class DocentesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      where: { activo: true },
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
    return this.prisma.usuario.findFirst({
      where: { rfid, activo: true },
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
    carreraNombre: string,
    ciclos: { numero: number; materias: string[]; jornada?: string }[]
  ) {
    const uc = await this.prisma.usuarioCarrera.findFirst({
      where: { usuarioId, carrera: { nombre: carreraNombre } },
    })
    if (!uc) return { ok: false, mensaje: 'El docente no tiene esa carrera asignada' }

    for (const ciclo of ciclos) {
      // Busca el ciclo dentro de ESTE docente-carrera específico, nunca en
      // los de otro docente aunque compartan carrera y número de ciclo
      let cicloDb = await this.prisma.ciclo.findFirst({
        where: { numero: ciclo.numero, usuarioCarreraId: uc.id },
      })

      if (!cicloDb) {
        cicloDb = await this.prisma.ciclo.create({
          data: { numero: ciclo.numero, usuarioCarreraId: uc.id, jornada: ciclo.jornada },
        })
      } else if (ciclo.jornada) {
        await this.prisma.ciclo.update({ where: { id: cicloDb.id }, data: { jornada: ciclo.jornada } })
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

  // Agrega una carrera adicional a un docente que ya existe (para el caso de
  // docentes que dictan en más de una carrera)
  async agregarCarrera(usuarioId: number, nombreCarrera: string) {
    const carrera = await this.prisma.carrera.upsert({
      where: { nombre: nombreCarrera },
      update: {},
      create: { nombre: nombreCarrera },
    })

    const existente = await this.prisma.usuarioCarrera.findFirst({
      where: { usuarioId, carreraId: carrera.id },
    })
    if (existente) return { ok: false, mensaje: 'El docente ya tiene esa carrera asignada' }

    await this.prisma.usuarioCarrera.create({
      data: { usuarioId, carreraId: carrera.id },
    })
    return { ok: true }
  }

  // Quita una carrera de un docente — elimina en cascada sus ciclos y materias
  async quitarCarrera(usuarioId: number, carreraNombre: string) {
    const uc = await this.prisma.usuarioCarrera.findFirst({
      where: { usuarioId, carrera: { nombre: carreraNombre } },
    })
    if (!uc) return { ok: false, mensaje: 'El docente no tiene esa carrera asignada' }

    await this.prisma.usuarioCarrera.delete({ where: { id: uc.id } })
    return { ok: true }
  }

  // Solo admin puede llamar esto (aplicado en el guard del controller) —
  // nadie puede auto-otorgarse más permisos de los que ya tiene.
  cambiarRol(id: number, rol: string) {
    const rolesValidos = ['usuario', 'bibliotecario', 'admin']
    if (!rolesValidos.includes(rol)) {
      return { ok: false, mensaje: 'Rol inválido' }
    }
    return this.prisma.usuario.update({ where: { id }, data: { rol } })
  }

  // Soft-delete: nunca borramos a una persona de verdad — solo la marcamos
  // inactiva. Sus préstamos/registros históricos quedan intactos, y su
  // llavero RFID deja de funcionar de inmediato (ver findByRfid).
  remove(id: number) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    })
  }

  findEliminados() {
    return this.prisma.usuario.findMany({
      where: { activo: false },
      include: {
        carreras: { include: { carrera: true } },
      },
    })
  }

  restaurar(id: number) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: true },
    })
  }

  buscarPorUid(uid: string) {
    return this.prisma.usuario.findUnique({
      where: { rfid: uid },
    })
  }
}