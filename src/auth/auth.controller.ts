import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'

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
}