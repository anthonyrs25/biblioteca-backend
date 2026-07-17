import { Module } from '@nestjs/common'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { LibrosModule } from './libros/libros.module'
import { DocentesModule } from './docentes/docentes.module'
import { PrestamosModule } from './prestamos/prestamos.module'
import { RegistrosModule } from './registros/registros.module'
import { RfidModule } from './rfid/rfid.module'
import { AuthModule } from './auth/auth.module'
import { EventosPublicosModule } from './eventos-publicos/eventos-publicos.module'

@Module({
  imports: [
    // Límite general: 100 peticiones por minuto por IP — protege sobre todo
    // los endpoints públicos sin login (eventos-publicos, rfid/escanear)
    // de que alguien los sature a propósito o por error.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    LibrosModule, DocentesModule, PrestamosModule, RegistrosModule, RfidModule, AuthModule, EventosPublicosModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}