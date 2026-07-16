import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from './roles.guard'
import { Roles } from './roles.decorator'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  // El frontend llama esto para verificar que el token sigue válido y obtener el rol
  @UseGuards(AuthGuard('jwt'))
  @Post('me')
  me(@Req() req: any) {
    return req.user
  }

  // Solo un admin ya existente puede crear otra cuenta de staff — nadie puede
  // auto-crearse una cuenta con privilegios desde fuera del sistema.
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('crear-cuenta')
  crearCuenta(@Body() body: { nombre: string; email: string; password: string; rol: string }) {
    return this.authService.crearCuentaStaff(body.nombre, body.email, body.password, body.rol)
  }
}