import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } })

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const valida = await bcrypt.compare(password, usuario.password)
    if (!valida) {
      throw new UnauthorizedException('Credenciales inválidas')
    }

    const payload = { sub: usuario.id, rol: usuario.rol, email: usuario.email }

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    }
  }
}