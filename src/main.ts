import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
  })
  await app.listen(3000)
  console.log('Biblioteca backend corriendo en puerto 3000')
}
bootstrap()