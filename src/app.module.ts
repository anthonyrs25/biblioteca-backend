import { Module } from '@nestjs/common'
import { LibrosModule } from './libros/libros.module'
import { DocentesModule } from './docentes/docentes.module'
import { PrestamosModule } from './prestamos/prestamos.module'
import { RegistrosModule } from './registros/registros.module'
import { RfidModule } from './rfid/rfid.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [LibrosModule, DocentesModule, PrestamosModule, RegistrosModule, RfidModule, AuthModule],
})
export class AppModule {}