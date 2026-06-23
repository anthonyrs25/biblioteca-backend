import { Module } from '@nestjs/common'
import { LibrosModule } from './libros/libros.module'
import { DocentesModule } from './docentes/docentes.module'

@Module({
  imports: [LibrosModule, DocentesModule],
})
export class AppModule {}