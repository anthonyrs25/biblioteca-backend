import { Module } from '@nestjs/common'
import { LibrosModule } from './libros/libros.module'

@Module({
  imports: [LibrosModule],
})
export class AppModule {}