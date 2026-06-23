import { Module } from '@nestjs/common'
import { LibrosModule } from './libros/libros.module'
import { DocentesModule } from './docentes/docentes.module'
import { PrestamosModule } from './prestamos/prestamos.module'

@Module({
  imports: [LibrosModule, DocentesModule, PrestamosModule],
})
export class AppModule {}